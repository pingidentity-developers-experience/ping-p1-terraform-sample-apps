##########################################################################
# vars.tf - (optional) Contains outputs from the resources created in main.tf
# @see 
##########################################################################
output "login_url" {
  value = local.app_url
}
