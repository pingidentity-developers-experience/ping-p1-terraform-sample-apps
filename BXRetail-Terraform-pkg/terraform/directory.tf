##########################################################################
# directory.tf - Declarations for PingOne directory related resources.
# {@link https://developer.hashicorp.com/terraform/language/resources}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_resources}
##########################################################################

##############################################
# PingOne Populations
##############################################

# PingOne Population
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/population}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_c_populations}
resource "pingone_population" "bxr_pop" {
  environment_id = module.environment.environment_id

  name        = "BXRetail Sample Customers"
  description = "Population containing BXRetail shoppers. This includes both shoppers with accounts and full profiles, and guest shoppers shipping info."
}

##############################################
# PingOne Attribute Schema
##############################################

# PingOne Schema Custom JSON Attribute
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource_attribute}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_t_adduserattributes}
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
# {@link https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application_attribute_mapping}
# {@link https://docs.pingidentity.com/r/en-us/pingone/p1_t_editsamlattributemapping}
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