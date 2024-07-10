##########################################################################
# main.tf - Declarations for modules and providers to 
# create infrastructure.
# {@link https://developer.hashicorp.com/terraform/language/modules}
# {@link https://developer.hashicorp.com/terraform/language/providers}
##########################################################################

# PingOne Environment
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/environment}
resource "pingone_environment" "my_environment" {
  name        = var.env_name
  description = "BXRetail Sample App integration environment provisioned with Terraform. By Ping Identity, Technical Enablement."
  type        = "SANDBOX"
  license_id  = var.license_id

  services = [
    {
      type = "SSO"
    },
    {
      type = "MFA"
    }
  ]
}

# PingOne Environment (Data Source)
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/data-sources/environment}
data "pingone_environment" "administrators" {
  name = "Administrators"
}

# PingOne User Role Assignment
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/role_assignment_user}
resource "pingone_user_role_assignment" "admin_user_identity_data_admin_role" {
  environment_id       = data.pingone_environment.administrators.id
  user_id              = var.admin_user_id
  role_id              = module.pingone_utils.pingone_role_id_identity_data_admin
  scope_environment_id = pingone_environment.my_environment.id
}

# PingOne Utilities Module
# {@link https://registry.terraform.io/modules/pingidentity/utils/pingone/latest}
module "pingone_utils" {
  source  = "pingidentity/utils/pingone"
  version = "0.0.8"

  environment_id = pingone_environment.my_environment.id
  region         = var.region
  # custom_domain  = "auth.bxretail.org"
}

##############################################
# PingOne Provider
##############################################

# PingOne Provider
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs}
provider "pingone" {
  client_id                    = var.worker_id
  client_secret                = var.worker_secret
  environment_id               = var.admin_env_id
  region_code                  = var.region_code
}