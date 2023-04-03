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
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_t_editsamlattributemapping
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
# PingOne Resources & Scopes
##############################################

# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources
resource "pingone_resource" "bxretail_resource" {
  environment_id = module.environment.environment_id

  name        = "BXretail"
  description = "BXRetail sample app resource."

  audience                      = "bxretail"
  access_token_validity_seconds = 3600
}

# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource_scope
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_t_addresource
resource "pingone_resource_scope" "my_resource_scope" {
  environment_id = module.environment.environment_id
  resource_id    = pingone_resource.bxretail_resource.id

  name = "bxretail"
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
    otp_lifetime_timeunit = "MINUTES"
  }

  voice {
    enabled = false
  }

  email {
    enabled               = true
    otp_lifetime_duration = 30
    otp_lifetime_timeunit = "MINUTES"
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
# @see https://docs.pingidentity.com/r/en-us/pingone/pingonemfa_associating_sign_on_policy_with_web_app?section=rxy1666194779493
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

##############################################
# PingOne Branding
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/branding_settings
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_c_edit_environment_branding
##############################################

resource "pingone_branding_settings" "branding" {
  environment_id = module.environment.environment_id

  company_name = "BXRetail Sample Company"

  logo_image {
    id   = pingone_image.bxretail_logo_white.id
    href = pingone_image.bxretail_logo_white.uploaded_image[0].href
  }
}

resource "pingone_branding_theme" "bxretail_theme" {
  environment_id = module.environment.environment_id

  name     = "BXRetail (not used)"
  template = "mural"

  body_text_color    = "#000000"
  button_color       = "#007BFF"
  button_text_color  = "#FFFFFF"
  card_color         = "#FFFFFF"
  heading_text_color = "#000000"
  link_text_color    = "#FFC107"

  background_image {
    id   = pingone_image.bxretail_background.id
    href = pingone_image.bxretail_background.uploaded_image[0].href
  }

  logo {
    id   = pingone_image.bxretail_logo.id
    href = pingone_image.bxretail_logo.uploaded_image[0].href
  }
}

# Pulling in BXRetail images.
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/image
resource "pingone_image" "bxretail_logo" {
  environment_id = module.environment.environment_id

  image_file_base64 = filebase64("${path.module}/bxretail_logo.png")
}
resource "pingone_image" "bxretail_logo_white" {
  environment_id = module.environment.environment_id

  image_file_base64 = filebase64("${path.module}/bxretail_logo_white.png")
}

resource "pingone_image" "bxretail_background" {
  environment_id = module.environment.environment_id

  image_file_base64 = filebase64("${path.module}/home-hero-office-bg.png")
}

##############################################
# PingOne Notification Templates
# @see https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/notification_template_content
# @see https://docs.pingidentity.com/r/en-us/pingone/p1_c_notifications
##############################################

# Device pairing templates.
resource "pingone_notification_template_content" "pair_sms_device" {
  environment_id = module.environment.environment_id
  template_name  = "device_pairing"
  locale         = "en"

  sms {
    content = "To finish pairing your device, enter this code: $${otp}."
    sender  = "BXRetail"
  }
}
resource "pingone_notification_template_content" "pair_email_device" {
  environment_id = module.environment.environment_id
  template_name  = "device_pairing"
  locale         = "en"

  email {
    body    = "Device enrollment code: $${otp}."
    subject = "BXRetail: Finish pairing your device"

    from {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}
# Password recovery tempalate
resource "pingone_notification_template_content" "recover_password_email" {
  environment_id = module.environment.environment_id
  template_name  = "recovery_code_template"
  locale         = "en"

  email {
    body    = "Please use this code to reset your password. Your reset code is: $${code.value}."
    subject = "BXRetail: Password Reset"

    from {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}

# Strong authentication templates
resource "pingone_notification_template_content" "sms_authn" {
  environment_id = module.environment.environment_id
  template_name  = "strong_authentication"
  locale         = "en"

  sms {
    content = "Your BXRetail passcode is $${otp}."
    sender  = "BXRetail"
  }
}

resource "pingone_notification_template_content" "email_authn" {
  environment_id = module.environment.environment_id
  template_name  = "strong_authentication"
  locale         = "en"

  email {
    body    = "We received a request for a one-time passcode. If youd like to signin, you can use the following one-time passcode at bxretail.org. Your passscode: $${otp}."
    subject = "BXRetail: New Transaction Request"

    from {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}
# Transaction templates
resource "pingone_notification_template_content" "sms_transaction" {
  environment_id = module.environment.environment_id
  template_name  = "transaction"
  locale         = "en"

  sms {
    content = "Please approve this BXRetail transaction with passcode $${otp}."
    sender  = "BXRetail"
  }
}

resource "pingone_notification_template_content" "email_transaction" {
  environment_id = module.environment.environment_id
  template_name  = "transaction"
  locale         = "en"

  email {
    body    = "Please approve this BXRetail transaction with passcode $${otp}."
    subject = "BXFinance Transaction Request"

    from {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}

# Verification template
resource "pingone_notification_template_content" "email_verification" {
  environment_id = module.environment.environment_id
  template_name  = "verification_code_template"
  locale         = "en"

  email {
    body    = "Please use this code to verify your registration: Account verification code: $${code.value}."
    subject = "BXRetail: Verification Code"

    from {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}