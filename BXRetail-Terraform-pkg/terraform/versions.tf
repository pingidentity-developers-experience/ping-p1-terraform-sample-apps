terraform {
  required_providers {
    pingone = {
      source = "pingidentity/pingone"
      # version = "~> 0.4"
    }
    # davinci = {
    #   # version = "0.0.2"
    #   source  = "samir-gandhi/davinci"
    # }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}