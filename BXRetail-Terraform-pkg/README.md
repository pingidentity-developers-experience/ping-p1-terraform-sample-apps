# BXRetail + Terraform + PingOne Sample App Package

## Source Code Folders
### /bxretail-sample-app/src

| Folder | Contents |
| ------ | -------- |
| /components/controller* | All business logic that takes user or client input as state, props, or params and processes it for the payload needed for Ping integration. |
| /components/integration* | All methods for direct integration with Ping product and services APIs. |
| /components/UI | UI components used in the UI component hierarchy. |
| /content | UI content in JSON object files. Keeps UI content out of the functional code. | 
| /pages | UIs loaded by each URI that import the various UI components. |
| /styles | SCSS files. (CSS with super powers). |
\* Folders you care about.

### /terraform

| File | Contents |
| ---- | -------- |
| .terraform | Terraform [working directory](https://developer.hashicorp.com/terraform/cli/init#working-directory-contents) created by Terraform. Never touch this. It's managed by Terraform. You won't see this until you run `terraform init`. |
| .terraform.lock.hcl | The Terraform [dependency lock file](https://developer.hashicorp.com/terraform/language/files/dependency-lock). Where Terraform manages the versions of the downloaded providers or modules. Never touch this. It's managed by Terraform. If you need to update versions, see the [-upgrade option](https://developer.hashicorp.com/terraform/language/files/dependency-lock#dependency-installation-behavior). You won't see this until you run `terraform init`. |
| applications.tf | HCL that declares all [application](https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/application) related [resources](https://developer.hashicorp.com/terraform/language/resources) we need to create in our environment/infrastructure. |
| branding.tf | HCL that declares all [branding](https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/branding_settings) related [resources](https://developer.hashicorp.com/terraform/language/resources) we need to create in our environment/infrastructure. |
| data.tf | HCL for doing [data](https://developer.hashicorp.com/terraform/language/data-sources) lookups/reads on data in your environment/infrastructure. |
| directory.tf | HCL that declares all directory related [resources](https://developer.hashicorp.com/terraform/language/resources) we need to create in our environment/infrastructure. |
| docker.tf | HCL that declares all [Docker](https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs) image related [resources](https://developer.hashicorp.com/terraform/language/resources). This is only used if you did not choose to deploy to your k8s host. |
| k8s.tf | HCL for creating [kubernetes](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs) services, ingresses, and deployments. |
| main.tf | HCL for necessary [providers](https://developer.hashicorp.com/terraform/language/providers) and [modules](https://developer.hashicorp.com/terraform/language/modules). |
| notifications.tf | HCL that declares all [notification](https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/notification_template_content) related [resources](https://developer.hashicorp.com/terraform/language/resources) we need to create in our environment/infrastructure. 
| outputs.tf | HCL declaring [output values](https://developer.hashicorp.com/terraform/language/values/outputs) that are the result of dynamic data. In this case, the deployed apps URL. |
| policies.tf | HCL that declares all policy related [resources](https://developer.hashicorp.com/terraform/language/resources) we need to create in our environment/infrastructure. 
| resources.tf | HCL that declares all [resource](https://registry.terraform.io/providers/pingidentity/pingone/latest/docs/resources/resource) and scope related [resources](https://developer.hashicorp.com/terraform/language/resources) we need to create in our environment/infrastructure. |
| terraform.tfstate | The [Terraform state](https://developer.hashicorp.com/terraform/language/state) file. This is where Terraform manages the "state" of your infrastructure and compares that against your deployed infrastructure. Never touch this. It's managed by Terraform. |
| terraform.tfvars | [Variable definitions](https://developer.hashicorp.com/terraform/language/values/variables#variable-definitions-tfvars-files), name/value pairs, that should not be part of your project repo. Values and added dynamically to vars.tf during Terraform execution. This file will not exist until you create it, according to the instructions in the project-specific README. |
| vars.tf | HCL that declares [variables](https://developer.hashicorp.com/terraform/language/values/variables) that will be needed in defining your environment/infrastructure. |
| versions.tf | HCL declaring [required providers](https://developer.hashicorp.com/terraform/language/providers/requirements#requiring-providers) & versions to use. |

# Getting Started

Install Terraform on your machine, following the instructions [here](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).

## Configure PingOne for Terraform access

If not done so already, first configure your PingOne organization for Terraform access by following the instructions at the [PingOne Terraform provider Getting Started Guide](https://pingidentity.github.io/terraform-docs/getting-started/pingone/#configure-pingone-for-terraform-access).

## Cloning the Project
### Variables
After cloning the project, in a code editor navigate to `/terraform` and create a file named `terraform.tfvars` with the following:

```hcl
region            = "{{ NorthAmerica | Canada | Asia | Europe }}"
organization_id   = "{{orgId}}"
admin_env_id      = "{{adminEnvId}}"
admin_user_id     = "{{adminUserId}}"
license_id        = "{{licenseId}}"
worker_id         = "{{workerId}}"
worker_secret     = "{{workerSecret}}"
k8s_deploy_name   = "{{k8sDeployName}}"
k8s_deploy_domain = "{{k8sDeployDomain}}"
k8s_namespace     = "{{k8sNamespace}}"
proxy_image_name  = "docker.io/michaelspingidentity/ping-integration-proxy:0.1.0"
app_image_name    = "docker.io/michaelspingidentity/ping-bxretail-terraform-sample:202303-0.19.5-beta"
```


| Variable | Description | 
| -------- | ----------- |
| region | Region for PingOne Environment | 
| organization_id | PingOne Organization Id - Located under Environment -> Properties, see [PingOne Terraform provider Getting Started Guide](https://pingidentity.github.io/terraform-docs/getting-started/pingone/#finding-required-ids) for further instructions. | 
| admin_env_id | PingOne Environment Id for Administrators Environment - Located under Environment -> Properties |
| admin_user_id | User Id for a user in the Administrators Environment - Located under Identities -> Users -> Select user -> Click API tab -> ID |
| license_id | License Id to be used for PingOne Environment - Located under Environment -> Properties, see [PingOne Terraform provider Getting Started Guide](https://pingidentity.github.io/terraform-docs/getting-started/pingone/#finding-required-ids) for further instructions.|
| worker_id | Client Id for Worker App in the Administrators Environment - Located under Connections -> Applications -> Select existing Worker App or create one -> Configuration -> Expand General -> Client ID |
| worker_secret | Client Secret for Worker App in the Administrators Environment - Located under Connections -> Applications -> Select Worker App -> Configuration -> Expand General -> Client Secret |
| k8s_deploy_name | Name used for k8s deployment |
| k8s_deploy_domain | K8s Deploy Domain name |
| k8s_namespace | K8s Namespace to deploy app |

### Deployment

In the command line, navigate to the `/terraform` directory and run:

```zsh
terraform init
terraform plan
```

If the plan fails - check your `terraform.tfvars` values.

If the plan succeeds:

```hcl
terraform apply —auto-approve
````

If this is successful, you will see a new environment added to your PingOne organization under the name `Ping Identity Example`. 
If this is successful, you will see a new environment added to your PingOne organization under the name "Ping Identity Example".

**NOTE:** The k8s deployment creates new ingresses and a subdomain for the app of `k8s_deploy_name.k8s_deploy_domain`. So the app may not be immediately available when terraforming is complete. Go get yourself some coff-ay and try again.

### Optional - Custom Docker Images
Ping Identity Technical Enablement hosts and maintains the sample Docker image. However, it is possible to build and host your own Docker images by following the instructions below.

To start, you will need your own Docker image repository to push to and update your `terraform.tfvars` file accordingly. Depending on your image repository, whether that's local, ECR, GCR, etc, you may need to update the `k8s.tf` file too. 

Note: In this current version, we are not using the fastify proxy server image. So recreating that is unnecessary.

**From the command line**, change directories to the `/bxretail-sample-app` directory.

```zsh
cd <your project path>/BXTerraform/BXTerraform-Sample-Apps/BXRetail-Terraform-pkg/bxretail-sample-app
```

Then run: 
```zsh
build -f Dockerfile.dev -t <host>/<repo_path>/ping-bxretail-terraform-sample:<version_tag> .
```

# Disclaimer
THIS DEMO AND SAMPLE CODE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS DEMO AND SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.