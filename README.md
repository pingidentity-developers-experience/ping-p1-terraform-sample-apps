# BXTerraform Sample App Packages

## Terraforming Ping Products with a Custom App

As the start of a new initiative called "developer experience", we are creating "BXTerraform" sample app packages. "BX" being our "be extraordinary" mantra used in all our demo brands. Starting with BXRetail, our BXRetail, BXHealth, and BXFinance live intgegration demo apps have been modified to be used as sample Ping integration apps, concentrating on integration and best practices, and are deployed and integrated using Terraform from Hashicorp.

We chose React as our development library for many reaons, but that should not be any concern. The primary concern in these samples apps is what's in the /integration folder, for integration with Ping products, and the /terraform folder for example HCL on how to provision a PingOne environment in your organization, AKA tenant.

We are not a custom app vendor for your line of business. That is your expertise. So the UI frameoworks and our demo use cases are 2nd class citizens to the purpose of this project. 

The sample application source code has been structured following a typical [MVC model](https://developer.mozilla.org/en-US/docs/Glossary/MVC) so as to keep the code responsible for showing integration with Ping products and services isolated from other code making it tedious for you, the developer, to weed out and interpret the code you need from the code that makes up a sample app. And MVC, we think, tends to be the simplest model to grasp the basics of  a "separation of concerns" (SoC).

The Terraform source code, [HCL](https://developer.hashicorp.com/terraform/language/syntax/configuration), has been organized by the same SoC design principle. This is not required as Terraform is graph-based and will build its own dependency graph based on your HCL. Hence Terraform being declaritive, and not procedural. But for organizational and ease of use, and getting familiar with Terraform, we felt this file structure was a better "getting started" experience.

## Source Code Folders
### /bxretail-sample-app/src

| Folder | Contents |
| ------ | -------- |
| /components | UI components used in the UI component hierarchy. Controller and integration subfolders. |
| /components/controller* | All business logic that takes user or client input as state, props, or params and processes it for the payload needed for Ping integration. |
| /components/integration* | All methods for direct integration with Ping product and services APIs. |
| /data | UI content in JSON object files. Keeps UI content out of the functional code. | 
| /pages | UIs loaded by each URI that import the various UI components. |
| /styles | [SCSS](https://sass-lang.com/) files. (CSS with super powers). |
\* Folders you care about.

### /terraform

| File | Contents |
| ---- | -------- |
| .terraform | Terraform project folder created by Terraform. Never touch this. It's managed by Terraform. You won't see this until you run `terraform init`. |
| .terraform.lock.hcl | The Terraform lock file. Where Terraform manages the versions of the downloaded providers or modules. Never touch this. It's managed by Terraform. If you need to update versions, see [-upgrade option](https://developer.hashicorp.com/terraform/language/files/dependency-lock#dependency-installation-behavior). You won't see this until you run `terraform init`. |
| data.tf | HCL for doing [data](https://developer.hashicorp.com/terraform/language/data-sources) lookups/reads on data in your environment/infrastructure. |
| k8s.tf | HCL for creating [kubernetes](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs) services, ingresses, and delpoyments. |
| main.tf | HCL for necessary [providers](https://developer.hashicorp.com/terraform/language/providers) and [modules](https://developer.hashicorp.com/terraform/language/modules). |
| outputs.tf | HCL to output the result of dynamic data. In this case, the deployed apps URL. |
| resources.tf | HCL that declares all the [resources](https://developer.hashicorp.com/terraform/language/resources) we need to create in our environment/infrastructure. The things you normally create by clicking around the Pingone admin console manually. |
| terraform.tfstate | The [Terraform state](https://developer.hashicorp.com/terraform/language/state) file. This is where Terraform manages the "state" of your infrastructure and compares that against your deployed infrastructure. Never touch this. It's managed by Terraform. |
| terraform.tfvars | [Variable definitions](https://developer.hashicorp.com/terraform/language/values/variables#variable-definitions-tfvars-files), name/value pairs, that should not be part of your projecct repo and added dynamically during Terraform execution. This will not exist until you create it according to the instructions in the project-specific README. |
| vars.tf | HCL that declares [variables](https://developer.hashicorp.com/terraform/language/values/variables) that will be needed in defining your environment/infrastructure. |
| versions.tf | HCL declaring provider versions to use. |


# Disclaimer
THIS DEMO AND SAMPLE CODE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS DEMO AND SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.