##########################################################################
# branding.tf - Declarations for PingOne branding related resources.
# {@link https://developer.hashicorp.com/terraform/language/resources}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources}
##########################################################################

##############################################
# PingOne Branding
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/branding_settings}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_edit_environment_branding}
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

  name     = "BXRetail"
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

resource "pingone_branding_theme_default" "bxretail_theme" {
  environment_id = module.environment.environment_id

  branding_theme_id = pingone_branding_theme.bxretail_theme.id
}

# Pulling in BXRetail images.
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/image}
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