module "environment" {
  source  = "terraform-pingidentity-modules/environment/pingone"
  version = "0.0.12"

  target_environment_name = var.env_name

  admin_user_assign_environment_admin_role = false
  admin_user_assign_identity_admin_role = true
  admin_user_id_list = [
    var.admin_user_id
  ]
  create_authorize = true
  create_davinci = true
  create_risk = true
  license_name = var.license_name
  organization_id = var.organization_id
}


##############################################
# Additional HCL 
##############################################
provider "pingone" {
  client_id                    = var.worker_id
  client_secret                = var.worker_secret
  environment_id               = var.admin_env_id
  region                       = var.region
  force_delete_production_type = false
}

resource "pingone_population" "app" {
  environment_id = module.environment.environment_id

  name        = "Application Users"
  description = "Population containing App Users"
}

# PingOne Sign-On Policy
resource "pingone_sign_on_policy" "app_logon" {
  environment_id = module.environment.environment_id

  name        = "App_Logon"
  description = "Simple Login with Registration"
}

resource "pingone_sign_on_policy_action" "app_logon_first" {
  environment_id    = module.environment.environment_id
  sign_on_policy_id = pingone_sign_on_policy.app_logon.id

  registration_local_population_id = pingone_population.app.id

  priority = 1

  conditions {
    last_sign_on_older_than_seconds = 3600 // 1 Hour
  }

  login {
    recovery_enabled = true
  }
}

resource "pingone_application" "bxr_logon" {
  environment_id = module.environment.environment_id
  enabled        = true
  name           = "BXR - Logon"

  oidc_options {
    type                        = "NATIVE_APP"
    grant_types                 = ["AUTHORIZATION_CODE", "IMPLICIT"]
    response_types              = ["CODE", "TOKEN", "ID_TOKEN"]
    token_endpoint_authn_method = "NONE"
    redirect_uris = [ "${local.app_url}/" ]
  }
}

data "pingone_resource" "openid" {
  environment_id = module.environment.environment_id

  name = "openid"
}

data "pingone_resource" "pingone" {
  environment_id = module.environment.environment_id

  name = "PingOne API"
}

data "pingone_resource_scope" "openid_email" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "email"
}

data "pingone_resource_scope" "openid_profile" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "profile"
}

data "pingone_resource_scope" "pingone_read_user" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone.id

  name = "p1:read:user"
}

data "pingone_resource_scope" "pingone_update_user" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone.id

  name = "p1:update:user"
}

data "pingone_resource_scope" "pingone_read_sessions" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone.id

  name = "p1:read:sessions"
}

resource "pingone_application_resource_grant" "bxr_login_openid" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxr_logon.id

  resource_id = data.pingone_resource.openid.id

  scopes = [
    data.pingone_resource_scope.openid_email.id,
    data.pingone_resource_scope.openid_profile.id
  ]
}

resource "pingone_application_resource_grant" "bxr_login_pingone" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxr_logon.id

  resource_id = data.pingone_resource.pingone.id

  scopes = [
    data.pingone_resource_scope.pingone_read_user.id,
    data.pingone_resource_scope.pingone_update_user.id,
    data.pingone_resource_scope.pingone_read_sessions.id
  ]
}

resource "pingone_application_sign_on_policy_assignment" "app_logon" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxr_logon.id

  sign_on_policy_id = pingone_sign_on_policy.app_logon.id

  priority = 1
}