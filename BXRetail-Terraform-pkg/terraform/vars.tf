##########################################################################
# vars.tf - Contains declarations of variables and locals.
# {@link https://developer.hashicorp.com/terraform/language/values}
##########################################################################
variable "region" {
  type        = string
  description = "Region your P1 Org is in"
}

variable "organization_id" {
  type        = string
  description = "Your P1 Organization ID"
}

variable "license_id" {
  type        = string
  description = "Name of the P1 license you want to assign to the Environment"
}

variable "admin_env_id" {
  type        = string
  description = "P1 Environment containing the Worker App"
}

variable "admin_user_id" {
  type        = string
  description = "P1 Administrator to assign Roles to"
}

variable "worker_id" {
  type        = string
  description = "Worker App ID App - App must have sufficient Roles"
  sensitive   = true
}

variable "worker_secret" {
  type        = string
  description = "Worker App Secret - App must have sufficient Roles"
  sensitive   = true
}

variable "env_name" {
  type        = string
  description = "Name used for the PingOne Environment"
  default     = "PingIdentity Example"
}

variable "env_type" {
  type        = string
  description = "Deployment Type (Dev | QA | Prod)"
}

variable "k8s_namespace" {
  type        = string
  description = "K8s namespace for container deployment"
}

variable "k8s_deploy_name" {
  type        = string
  description = "Name used in the K8s deployment of the App. Used in Deployment \\ Service \\ Ingress delivery"
}

variable "k8s_deploy_domain" {
  type        = string
  description = "DNS Domain used when creating the Ingresses"
}

variable "proxy_image_name" {
  type        = string
  description = "Repo/Image:tag used for Proxy container"
}

variable "app_image_name" {
  type        = string
  description = "Repo/Image:tag used for App container"
}

variable "deploy_app_to_k8s" {
  type        = bool
  description = "Whether you want the sample app deployed to your k8s host or just run locally on your machine at localhost:5000."
  default     = true
}

locals {
  # The URL of the demo app
  app_url             = var.deploy_app_to_k8s ? "https://${kubernetes_ingress_v1.package_ingress[0].spec[0].rule[0].host}/app/" : "https://localhost:5000"
  deploy_app_to_local = var.deploy_app_to_k8s ? 0 : 1
  # Translate the Region to a Domain suffix
  north_america  = var.region == "NorthAmerica" ? "com" : ""
  europe         = var.region == "Europe" ? "eu" : ""
  canada         = var.region == "Canada" ? "ca" : ""
  asia_pacific   = var.region == "AsiaPacific" ? "asia" : ""
  pingone_domain = coalesce(local.north_america, local.europe, local.canada, local.asia_pacific)
}
