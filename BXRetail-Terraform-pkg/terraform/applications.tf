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
  login_page_url = "${local.app_url}/app/"

  oidc_options {
    type                        = "SINGLE_PAGE_APP"
    grant_types                 = ["AUTHORIZATION_CODE", "IMPLICIT"]
    response_types              = ["CODE", "TOKEN", "ID_TOKEN"]
    pkce_enforcement            = "S256_REQUIRED"
    token_endpoint_authn_method = "NONE"
    redirect_uris               = ["${local.app_url}/app/"]
    home_page_url               = "${local.app_url}/app/"
    post_logout_redirect_uris   = ["${local.app_url}/app/"]
  }
}

##############################################
# PingOne Application Resource Grants
##############################################

# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application_resource_grant}
resource "pingone_application_resource_grant" "pingone_scopes" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  resource_name = module.pingone_utils.pingone_resource_name_pingone_api

  scope_names = [
    module.pingone_utils.pingone_resource_scope_name_pingone_api_validate_userpassword,
    module.pingone_utils.pingone_resource_scope_name_pingone_api_read_sessions,
    module.pingone_utils.pingone_resource_scope_name_pingone_api_update_user,
    module.pingone_utils.pingone_resource_scope_name_pingone_api_create_device,
    module.pingone_utils.pingone_resource_scope_name_pingone_api_read_userconsent,
    module.pingone_utils.pingone_resource_scope_name_pingone_api_update_usermfaenabled,
    module.pingone_utils.pingone_resource_scope_name_pingone_api_read_user,
    module.pingone_utils.pingone_resource_scope_name_pingone_api_reset_userpassword
  ]
}

resource "pingone_application_resource_grant" "bxretail_openid" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  resource_name = "openid"

  scope_names = [
    "profile",
    "address",
    "phone",
    "email"
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