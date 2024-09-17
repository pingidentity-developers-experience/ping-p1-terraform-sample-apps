##########################################################################
# notifications.tf - Declarations for PingOne notification related resources.
# {@link https://developer.hashicorp.com/terraform/language/resources}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources}
##########################################################################

##############################################
# PingOne Notification Templates
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/notification_template_content}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_notifications}
##############################################

# Device pairing templates.
resource "pingone_notification_template_content" "pair_sms_device" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "device_pairing"
  locale         = "en"

  sms = {
    content = "To finish pairing your device, enter this code: $${otp}."
    sender  = "BXRetail"
  }
}
resource "pingone_notification_template_content" "pair_email_device" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "device_pairing"
  locale         = "en"

  email = {
    body    = "Device enrollment code: $${otp}."
    subject = "BXRetail: Finish pairing your device"

    from = {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}
# Password recovery tempalate
resource "pingone_notification_template_content" "recover_password_email" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "recovery_code_template"
  locale         = "en"

  email = {
    body    = "Please use this code to reset your password. Your reset code is: $${code.value}."
    subject = "BXRetail: Password Reset"

    from = {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}

# Strong authentication templates
resource "pingone_notification_template_content" "sms_authn" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "strong_authentication"
  locale         = "en"

  sms = {
    content = "Your BXRetail passcode is $${otp}."
    sender  = "BXRetail"
  }
}

resource "pingone_notification_template_content" "email_authn" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "strong_authentication"
  locale         = "en"

  email = {
    body    = "We received a request for a one-time passcode. If youd like to signin, you can use the following one-time passcode at bxretail.org. Your passscode: $${otp}."
    subject = "BXRetail: New Transaction Request"

    from = {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}
# Transaction templates
resource "pingone_notification_template_content" "sms_transaction" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "transaction"
  locale         = "en"

  sms = {
    content = "Please approve this BXRetail transaction with passcode $${otp}."
    sender  = "BXRetail"
  }
}

resource "pingone_notification_template_content" "email_transaction" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "transaction"
  locale         = "en"

  email = {
    body    = "Please approve this BXRetail transaction with passcode $${otp}."
    subject = "BXFinance Transaction Request"

    from = {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}

# Verification template
resource "pingone_notification_template_content" "email_verification" {
  environment_id = pingone_environment.my_environment.id
  template_name  = "verification_code_template"
  locale         = "en"

  email = {
    body    = "Please use this code to verify your registration: Account verification code: $${code.value}."
    subject = "BXRetail: Verification Code"

    from = {
      name    = "BXRetail"
      address = "noreply@pingidentity.com"
    }
  }
}