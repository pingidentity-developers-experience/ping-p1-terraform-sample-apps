##########################################################################
# data.tf - Declarations for PingOne data.
# @see https://developer.hashicorp.com/terraform/language/data-sources
##########################################################################

##############################################
# PingOne Directory Schema
##############################################

# PingOne Schema
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/data-sources/schema
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_t_viewuserattributeschema
data "pingone_schema" "bxr_schema" {
  environment_id = module.environment.environment_id

  name = "User"
}

##############################################
# PingOne Scopes
##############################################

data "pingone_resource" "openid" {
  environment_id = module.environment.environment_id
  name           = "openid"
}

# OIDC Scopes
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource_scope
# @see https://docs.pingidentity.com/r/en-us/pingone/pingone_viewing_oidc_attributes_for_an_application
# OAuth Scopes
data "pingone_resource_scope" "openid_profile" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "profile"
}
data "pingone_resource_scope" "openid_address" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "address"
}
data "pingone_resource_scope" "openid_phone" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "phone"
}
data "pingone_resource_scope" "openid_email" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.openid.id

  name = "email"
}

# PingOne API Resource Scopes
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource_scope
data "pingone_resource" "pingone_apis" {
  environment_id = module.environment.environment_id
  name           = "PingOne API"
}

data "pingone_resource_scope" "p1api_validatePassword" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:validate:userPassword"
}
data "pingone_resource_scope" "p1api_read_sessions" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:read:sessions"
}
data "pingone_resource_scope" "p1api_update_user" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:update:user"
}
data "pingone_resource_scope" "p1api_create_device" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:create:device"
}
data "pingone_resource_scope" "p1api_read_consents" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:read:userConsent"
}
data "pingone_resource_scope" "p1api_update_mfa" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:update:userMfaEnabled"
}
data "pingone_resource_scope" "p1api_read_user" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:read:user"
}
data "pingone_resource_scope" "p1api_reset_password" {
  environment_id = module.environment.environment_id
  resource_id    = data.pingone_resource.pingone_apis.id
  name           = "p1:reset:userPassword"
}