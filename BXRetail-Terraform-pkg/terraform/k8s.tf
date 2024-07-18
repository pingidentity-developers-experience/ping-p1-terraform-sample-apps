###################################################################################################
# k8s.tf - Contains Kubernetes deployment declarations.
# {@link https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs}
# 
# The "count" declaration is whether you want the sample delpoyed to your k8s
# host environment, or if you want it run locally on your machine at localhost.
# There is a variable in terraform.tfvars to control this. The default is set
# in vars.tf.
###################################################################################################

resource "kubernetes_ingress_v1" "package_ingress" {
  count = var.deploy_app_to_k8s ? 1 : 0
  metadata {
    namespace = var.k8s_namespace
    name      = "${var.k8s_deploy_name}-app"
    annotations = {
      "kubernetes.io/ingress.class"                    = "nginx-public"
      "nginx.ingress.kubernetes.io/backend-protocol"   = "HTTPS"
      "nginx.ingress.kubernetes.io/cors-allow-headers" = "X-Forwarded-For"
      "nginx.ingress.kubernetes.io/force-ssl-redirect" = true
      "nginx.ingress.kubernetes.io/service-upstream"   = true
    }
  }

  spec {
    rule {
      host = "${var.k8s_deploy_name}.${var.k8s_deploy_domain}"
      http {
        path {
          path = "/"
          backend {
            service {
              name = "${var.k8s_deploy_name}-app"
              port {
                number = var.app_port
              }
            }
          }
        }
      }
    }

    tls {
      hosts = ["${var.k8s_deploy_name}.${var.k8s_deploy_domain}"]
    }
  }
}

resource "kubernetes_ingress_v1" "package_proxy_ingress" {
  count = var.deploy_app_to_k8s ? 1 : 0
  metadata {
    namespace = var.k8s_namespace
    name      = "${var.k8s_deploy_name}-proxy"
    annotations = {
      "kubernetes.io/ingress.class"                    = "nginx-public"
      "nginx.ingress.kubernetes.io/backend-protocol"   = "HTTP"
      "nginx.ingress.kubernetes.io/cors-allow-headers" = "X-Forwarded-For"
      "nginx.ingress.kubernetes.io/force-ssl-redirect" = true
      "nginx.ingress.kubernetes.io/service-upstream"   = true
    }
  }

  spec {
    default_backend {
      service {
        name = "${var.k8s_deploy_name}-proxy"
        port {
          number = 4000
        }
      }
    }
    rule {
      host = "${var.k8s_deploy_name}-proxy.${var.k8s_deploy_domain}"
    }

    tls {
      hosts = ["${var.k8s_deploy_name}-proxy.${var.k8s_deploy_domain}"]
    }
  }
}

resource "kubernetes_deployment" "app_proxy" {
  count = var.deploy_app_to_k8s ? 1 : 0
  metadata {
    namespace = var.k8s_namespace
    name      = "${var.k8s_deploy_name}-proxy"
    labels = {
      "app.kubernetes.io/name"       = "${var.k8s_deploy_name}-proxy",
      "app.kubernetes.io/instance"   = "${var.k8s_deploy_name}-proxy",
      "app.kubernetes.io/managed-by" = "${var.k8s_deploy_name}-proxy"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "${var.k8s_deploy_name}-proxy"
      }
    }
    template {
      metadata {
        labels = {
          app = "${var.k8s_deploy_name}-proxy"
        }
      }
      spec {
        container {
          image             = var.proxy_image_name
          name              = "${var.k8s_deploy_name}-proxy"
          image_pull_policy = "Always"
          port {
            container_port = 4000
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "app_proxy" {
  count = var.deploy_app_to_k8s ? 1 : 0
  metadata {
    namespace = var.k8s_namespace
    name      = "${var.k8s_deploy_name}-proxy"
  }
  spec {
    selector = {
      app = "${var.k8s_deploy_name}-proxy"
    }
    session_affinity = "ClientIP"
    port {
      port        = 4000
      target_port = 4000
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment" "bxr_app" {
  count = var.deploy_app_to_k8s ? 1 : 0
  metadata {
    namespace = var.k8s_namespace
    name      = "${var.k8s_deploy_name}-app"
    labels = {
      "app.kubernetes.io/name"       = "${var.k8s_deploy_name}-app",
      "app.kubernetes.io/instance"   = "${var.k8s_deploy_name}-app",
      "app.kubernetes.io/managed-by" = "${var.k8s_deploy_name}-app"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "${var.k8s_deploy_name}-app"
      }
    }
    template {
      metadata {
        labels = {
          app = "${var.k8s_deploy_name}-app"
        }
      }
      spec {
        image_pull_secrets {
          name = "gcr-pull-secret"
        }
        container {
          image             = var.app_image_name
          name              = "${var.k8s_deploy_name}-app"
          image_pull_policy = "Always"

          env {
            # OAuth client redirect URI & App launch URL
            name  = "REACT_APP_HOST"
            value = "https://${var.k8s_deploy_name}.${var.k8s_deploy_domain}"
          }
          env {
            # The Fastify proxy host for proxy-ing sensitive mgmt API calls.
            # Note: This proxy is not currently in use, but will be used in future use cases.
            name  = "REACT_APP_PROXYAPIPATH"
            value = "https://${var.k8s_deploy_name}-proxy.${var.k8s_deploy_domain}"
          }
          env {
            # P1 Environment ID
            name  = "REACT_APP_ENVID"
            value = pingone_environment.my_environment.id
          }
          env {
            # Client ID
            name  = "REACT_APP_CLIENT"
            value = pingone_application.bxretail_sample_app.oidc_options.client_id
          }
          env {
            # P1 Auth URL (accounts for Region) - https://auth.pingone.{region}
            name  = "REACT_APP_AUTHPATH"
            value = module.pingone_utils.pingone_url_auth_path
          }
          env {
            # P1 API URL (accounts for Region) - https://api.pingone.{region}/v1
            name  = "REACT_APP_APIPATH"
            value = module.pingone_utils.pingone_url_api_path_v1
          }
          env {
            # The Docker image name just for validation/troubleshooting.
            name  = "REACT_APP_IMAGE_NAME"
            value = var.app_image_name

          }
        }

      }
    }
  }
}

resource "kubernetes_service" "bxr_app" {
  count = var.deploy_app_to_k8s ? 1 : 0
  metadata {
    namespace = var.k8s_namespace
    name      = "${var.k8s_deploy_name}-app"
  }
  spec {
    selector = {
      app = "${var.k8s_deploy_name}-app"
    }
    session_affinity = "ClientIP"
    port {
      port        = var.app_port
      target_port = var.app_port
    }

    type = "ClusterIP"
  }
}