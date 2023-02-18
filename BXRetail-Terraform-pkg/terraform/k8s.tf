resource "kubernetes_ingress_v1" "package_ingress" {
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
                number = 5000
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
          image = "${var.proxy_image_name}"
          name  = "${var.k8s_deploy_name}-proxy"
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
          image = "${var.app_image_name}"
          name  = "${var.k8s_deploy_name}-app"
          image_pull_policy = "Always"

          env {
            # OAuth client redirect URI & App launch URL
            name  = "REACT_APP_HOST"
            value = "https://${var.k8s_deploy_name}.${var.k8s_deploy_domain}"
          }
          env {
            # The PingOne host for authN API calls
            # Note: For this demo, we're proxying the calls to avoid CORS
            # Typically you'd resolve this with a P1 Custom Domain
            name  = "REACT_APP_AUTHPATH"
            value = "https://${var.k8s_deploy_name}-proxy.${var.k8s_deploy_domain}"
          }
          env {
            # P1 Environment ID
            name  = "REACT_APP_ENVID"
            value = module.environment.environment_id
          }
          env {
            # Client ID
            name  = "REACT_APP_CLIENT"
            value = pingone_application.bxr_logon.oidc_options[0].client_id
          }
          env {
            # Client secret
            name  = "REACT_APP_RECSET"
            value = pingone_application.bxr_logon.oidc_options[0].client_secret
          }
          env {
            # P1 Auth URL (accounts for Region)
            name = "REACT_APP_P1HOST"
            value = "https://auth.pingone.${local.pingone_domain}"
          }
          env {
            # The Docker image name just for validation/troubleshooting.
            name = "REACT_APP_IMAGE_NAME"
            value = "${var.app_image_name}"
              
            }
        }

      }
    }
  }
}

resource "kubernetes_service" "bxr_app" {
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
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}