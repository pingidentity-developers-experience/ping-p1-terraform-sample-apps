##########################################################################
# resource.tf - Declarations for PingOne resources.
# @see https://developer.hashicorp.com/terraform/language/resources
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources
##########################################################################

##############################################
# PingOne Populations
##############################################

# PingOne Population
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/population
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_c_populations
resource "pingone_population" "bxr_pop" {
  environment_id = module.environment.environment_id

  name        = "BXRetail Sample Customers"
  description = "Population containing BXRetail shoppers. This includes both shoppers with accounts and full profiles, and guest shoppers shipping info."
}

##############################################
# PingOne Attribute Schema
##############################################

# PingOne Schema Custom JSON Attribute
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource_attribute
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_t_adduserattributes
resource "pingone_schema_attribute" "consent_json_attribute" {
  environment_id = module.environment.environment_id
  #resource_id    = pingone_population.bxr_pop.id
  schema_id = data.pingone_schema.bxr_schema.id

  name         = "consent"
  display_name = "Consent"
  description  = "Stores the BXRetail customer's consent to share delivery contact info."

  type        = "JSON"
  unique      = false
  multivalued = true
}

##############################################
# PingOne Directory Attributes
##############################################

# PingOne attribute mappings
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application_attribute_mapping
resource "pingone_application_attribute_mapping" "email" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  name  = "email"
  value = "$${user.email}"
}
resource "pingone_application_attribute_mapping" "fullName" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  name  = "fullName"
  value = "$${user.name.formatted}"
}
resource "pingone_application_attribute_mapping" "mobileNumber" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  name  = "mobile"
  value = "$${user.mobilePhone}"
}
resource "pingone_application_attribute_mapping" "postcode" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  name  = "postcode"
  value = "$${user.address.postalCode}"
}
resource "pingone_application_attribute_mapping" "streetAddress" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  name  = "street"
  value = "$${user.address.streetAddress}"
}

##############################################
# PingOne Connections (applications)
##############################################

# PingOne Connection (application)
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_add_app_worker
resource "pingone_application" "bxretail_sample_app" {
  environment_id = module.environment.environment_id
  enabled        = true
  name           = "BXRetail Sample App"
  description    = "A custom sample retail app to demonstrate PingOne integtation."

  oidc_options {
    type                        = "SINGLE_PAGE_APP"
    grant_types                 = ["AUTHORIZATION_CODE", "IMPLICIT"]
    response_types              = ["CODE", "TOKEN", "ID_TOKEN"]
    pkce_enforcement            = "S256_REQUIRED"
    token_endpoint_authn_method = "NONE"
    redirect_uris               = ["${local.app_url}/"]
  }
}

##############################################
# PingOne Policies
##############################################

# PingOne Sign-On Policy
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/sign_on_policy
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_add_an_auth_policy
resource "pingone_sign_on_policy" "default_authN_policy" {
  environment_id = module.environment.environment_id

  name        = "BXRetail_Sample_Policy"
  description = "Simple Login with optional, opt-in MFA. Includes options for account registration and account recovery."
}

# MFA Policy
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/mfa_policy
# @see https://docs.pingidentity.com/r/en-us/pingone/pingone_c_mfa_policies
resource "pingone_mfa_policy" "bxr_mfa_policy" {
  environment_id = module.environment.environment_id
  name           = "BXRetail Sample MFA Policy"

  mobile {
    enabled = true
  }

  totp {
    enabled = false
  }

  security_key {
    enabled = false
  }

  platform {
    enabled = false
  }

  sms {
    enabled               = false
    otp_lifetime_duration = 30
    otp_lifetime_timeunit    = "MINUTES"
  }

  voice {
    enabled = false
  }

  email {
    enabled = true
    otp_lifetime_duration = 30
    otp_lifetime_timeunit    = "MINUTES"
  }
}

# PingOne sign-on Policy Action
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/sign_on_policy_action
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_add_login_auth_step
resource "pingone_sign_on_policy_action" "default_authN_policy_firstFactor" {
  environment_id    = module.environment.environment_id
  sign_on_policy_id = pingone_sign_on_policy.default_authN_policy.id

  registration_local_population_id = pingone_population.bxr_pop.id

  priority = 1

  conditions {
    last_sign_on_older_than_seconds = 28800
  }

  login {
    recovery_enabled = true
  }
}

resource "pingone_sign_on_policy_action" "default_authN_policy_secondFactor" {
  environment_id    = module.environment.environment_id
  sign_on_policy_id = pingone_sign_on_policy.default_authN_policy.id

  priority = 2

  conditions {
    user_attribute_equals {
      attribute_reference = "$${user.mfaEnabled}"
      value_boolean       = true
    }
  }

  mfa {
    device_sign_on_policy_id = pingone_mfa_policy.bxr_mfa_policy.id
    no_device_mode           = "BYPASS"
  }
}

# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application_sign_on_policy_assignment
resource "pingone_application_sign_on_policy_assignment" "default_authN_policy" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  sign_on_policy_id = pingone_sign_on_policy.default_authN_policy.id

  priority = 1
}

##############################################
# PingOne Application Resource Grants
##############################################

# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application_resource_grant
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