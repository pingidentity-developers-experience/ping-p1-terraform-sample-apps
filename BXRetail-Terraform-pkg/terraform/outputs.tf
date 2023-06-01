##########################################################################
# vars.tf - (optional) Contains outputs from the resources created.
# {@link https://developer.hashicorp.com/terraform/language/values/outputs}
##########################################################################
output "login_url" {
  value       = "${local.app_url}/app/"
  description = "The sample app URL generated during terraforming. it points to either the host ingress in your k8s environment, or localhost."
}

output "app_deploymnent_location" {
  value = var.deploy_app_to_k8s ? "Kubernetes Service" : "Localhost"

}
