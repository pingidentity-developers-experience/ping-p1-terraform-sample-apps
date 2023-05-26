####################################################################################################
# Optional Docker Image Resources.
# These are only used if you did not choose to deploy to your k8s host, assuming you have one.
# This is controlled by the deploy_app_to_k8s var set in your tfvars file. It's defaulted to true. 
# {@link https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs}
# {@link https://hub.docker.com/repository/docker/michaelspingidentity/ping-bxretail-terraform-sample/general}
####################################################################################################

# Pulls the example app image
resource "docker_image" "ping_bxr_sample_app" {
  count = local.deploy_app_to_local
  name  = var.app_image_name
}

# Create and run the container
resource "docker_container" "local_bxr_app" {
  count = local.deploy_app_to_local
  image = docker_image.ping_bxr_sample_app[count.index].image_id
  name  = "Ping_BXRetail_Sample"
  ports {
    internal = var.app_port
    external = var.app_port
  }
  # TODO If needed, Add another set of resources to run the fastify proxy server. Not a use case currently, but will be used in future use cases.

  # Environment variables that are injected into either the k8s deployment for the Docker container,
  # or into the local Docker container delpoyment. These override the variables in .env.development.
  env = ["REACT_APP_HOST=${local.app_url}",
    "REACT_APP_PROXYAPIPATH=https://${var.k8s_deploy_name}-proxy.${var.k8s_deploy_domain}",
    "REACT_APP_ENVID=${module.environment.environment_id}",
    "REACT_APP_CLIENT=${pingone_application.bxretail_sample_app.oidc_options[0].client_id}",
    "REACT_APP_RECSET=${pingone_application.bxretail_sample_app.oidc_options[0].client_secret}",
    "REACT_APP_AUTHPATH=https://auth.pingone.${local.pingone_domain}",
    "REACT_APP_APIPATH=https://api.pingone.${local.pingone_domain}/v1",
    "REACT_APP_IMAGE_NAME=${var.app_image_name}",
    "PORT=${var.app_port}"
  ]
}