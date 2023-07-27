##########################################################################
# policies.tf - Declarations for PingOne policiy related resources.
# {@link https://developer.hashicorp.com/terraform/language/resources}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources}
##########################################################################

##############################################
# PingOne Policies
##############################################

# PingOne Sign-On Policy
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/sign_on_policy}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_add_an_auth_policy}
resource "pingone_sign_on_policy" "default_authN_policy" {
  environment_id = module.environment.environment_id

  name        = "BXRetail_Sample_Policy"
  description = "Simple Login with optional, opt-in MFA. Includes options for account registration and account recovery."
}

# MFA Policy
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/mfa_policy}
# {@link https://docs.pingidentity.com/r/en-us/pingone/pingone_c_mfa_policies}
resource "pingone_mfa_policy" "bxr_mfa_policy" {
  environment_id = module.environment.environment_id
  name           = "BXRetail Sample MFA Policy"

  mobile {
    enabled = true
  }

  totp {
    enabled = false
  }

  fido2 {
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
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/sign_on_policy_action}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_add_login_auth_step}
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

# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application_sign_on_policy_assignment}
# {@link https://docs.pingidentity.com/r/en-us/pingone/pingonemfa_associating_sign_on_policy_with_web_app?section=rxy1666194779493}
resource "pingone_application_sign_on_policy_assignment" "default_authN_policy" {
  environment_id = module.environment.environment_id
  application_id = pingone_application.bxretail_sample_app.id

  sign_on_policy_id = pingone_sign_on_policy.default_authN_policy.id

  priority = 1
}