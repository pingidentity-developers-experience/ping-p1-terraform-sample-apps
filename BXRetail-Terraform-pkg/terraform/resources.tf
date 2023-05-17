##########################################################################
# resources.tf - Declarations for PingOne resource and scope related resources.
# {@link https://developer.hashicorp.com/terraform/language/resources}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources}
##########################################################################

##############################################
# PingOne Resources & Scopes
##############################################

# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources}
resource "pingone_resource" "bxretail_resource" {
  environment_id = module.environment.environment_id

  name        = "BXretail"
  description = "BXRetail sample app resource."

  audience                      = "bxretail"
  access_token_validity_seconds = 3600
}

# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource_scope}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_t_addresource}
resource "pingone_resource_scope" "my_resource_scope" {
  environment_id = module.environment.environment_id
  resource_id    = pingone_resource.bxretail_resource.id

  name = "bxretail"
}