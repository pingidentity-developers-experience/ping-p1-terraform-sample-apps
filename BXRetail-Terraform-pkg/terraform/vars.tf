##########################################################################
# vars.tf - Contains declarations of variables and locals.
# {@link https://developer.hashicorp.com/terraform/language/values}
##########################################################################
variable "region" {
  type        = string
  description = "Region your P1 Org is in"
}

variable "region_code" {
  type        = string
  description = "Region code that your P1 Org is in"

  validation {
    condition     = contains(["EU", "NA", "CA", "AP", "AU"], var.region_code)
    error_message = "Allowed values for region_code are \"EU\", \"NA\", \"CA\", \"AP\", \"AU\"."
  }
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
  default     = "Ping Identity BXRetail Example"
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
  description = "Whether you want the sample app deployed to your k8s host or just run locally on your machine at localhost."
  default     = true
}

variable "app_port" {
  type        = number
  description = "The port used by the sample app. Override this in your tfvars file if you have a port conflict."
  default     = 5000
}

locals {
  # The URL of the demo app
  app_url = var.deploy_app_to_k8s ? "https://${kubernetes_ingress_v1.package_ingress[0].spec[0].rule[0].host}" : "https://localhost:${var.app_port}"
}
