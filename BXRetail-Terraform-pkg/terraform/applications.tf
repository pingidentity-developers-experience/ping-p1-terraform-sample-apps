##########################################################################
# applications.tf - Declarations for PingOne application related resources.
# {@link https://developer.hashicorp.com/terraform/language/resources}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources}
##########################################################################

##############################################
# PingOne Connections (applications)
##############################################

# PingOne Connection (application)
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_add_app_worker}
resource "pingone_application" "bxretail_sample_app" {
  environment_id = module.environment.environment_id
  enabled        = true
  name           = "BXRetail Sample App"
  description    = "A custom sample retail app to demonstrate PingOne integtation."
  login_page_url = local.app_url

  oidc_options {
    type                        = "SINGLE_PAGE_APP"
    grant_types                 = ["AUTHORIZATION_CODE", "IMPLICIT"]
    response_types              = ["CODE", "TOKEN", "ID_TOKEN"]
    pkce_enforcement            = "S256_REQUIRED"
    token_endpoint_authn_method = "NONE"
    redirect_uris               = ["${local.app_url}"]
    home_page_url               = local.app_url
    post_logout_redirect_uris   = ["${local.app_url}"]
  }
}

##############################################
# PingOne Application Resource Grants
##############################################

# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application_resource_grant}
resource "pingone_application_resource_grant" "pingone_scopes" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id
  resource_id    = data.pingone_resource.pingone_apis.id
  scopes = [
    data.pingone_resource_scope.p1api_validatePassword.id,
    data.pingone_resource_scope.p1api_read_sessions.id,
    data.pingone_resource_scope.p1api_update_user.id,
    data.pingone_resource_scope.p1api_create_device.id,
    data.pingone_resource_scope.p1api_read_consents.id,
    data.pingone_resource_scope.p1api_update_mfa.id,
    data.pingone_resource_scope.p1api_read_user.id,
    data.pingone_resource_scope.p1api_reset_password.id
  ]
}

resource "pingone_application_resource_grant" "bxretail_openid" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  resource_id = data.pingone_resource.openid.id

  scopes = [
    data.pingone_resource_scope.openid_profile.id,
    data.pingone_resource_scope.openid_address.id,
    data.pingone_resource_scope.openid_phone.id,
    data.pingone_resource_scope.openid_email.id
  ]
}

##############################################
# PingOne Application OIDC Scopes
##############################################

resource "pingone_resource_scope_openid" "profile_scope" {
  environment_id = module.environment.environment_id

  name = "profile"
}
resource "pingone_resource_scope_openid" "address_scope" {
  environment_id = module.environment.environment_id

  name = "address"
}
resource "pingone_resource_scope_openid" "phone_scope" {
  environment_id = module.environment.environment_id

  name = "phone"
}
resource "pingone_resource_scope_openid" "email_scope" {
  environment_id = module.environment.environment_id

  name = "email"
}