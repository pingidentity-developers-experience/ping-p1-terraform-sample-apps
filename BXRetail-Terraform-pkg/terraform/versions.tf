terraform {
  required_version = ">= 1.1.0"

  required_providers {
    pingone = {
      source  = "pingidentity/pingone"
      version = ">= 0.11.1, < 1.0.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.19.0, < 3.0.0"
    }
    # davinci = {
    #   source = "pingidentity/davinci"
    #   version = ">= 0.1.5, < 1.0.0"
    # }
    docker = {
      source  = "kreuzwerker/docker"
      version = "3.0.2"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}