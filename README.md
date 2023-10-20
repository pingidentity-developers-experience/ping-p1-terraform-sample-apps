# BXTerraform Sample App Packages

## Terraforming Ping Products with a Custom App

As the start of a new initiative called "The Developers' Experience", we are creating "BXTerraform" sample app packages. "BX" being our "be extraordinary" mantra used in all our demo brands. Starting with BXRetail, our BXRetail, BXHealth, and BXFinance live integration demo apps have been modified to be used as sample Ping integration apps, concentrating on integration and best practices, and are deployed and integrated using Terraform from Hashicorp.

We chose React as our development library for many reasons, but that should not be any concern. The primary concern in these samples apps is what's in the /integration folder, for integration with Ping products, and the /terraform folder for example HCL on how to provision a PingOne environment in your organization, AKA tenant.

We are not a custom app vendor for your line of business. That is your expertise. So the UI frameworks and our demo use cases are 2nd class citizens to the purpose of this project. They are merely a conduit to the goal; Ping integration and IaC (infrastructure as code) examples.

The sample application source code has been structured following a typical [MVC model](https://developer.mozilla.org/en-US/docs/Glossary/MVC) so as to keep the code responsible for showing integration with Ping products and services isolated from other UI code which would make it tedious for you, the developer, to weed out and interpret the code you need from the code that makes up a sample app. And MVC, we think, tends to be the simplest model to grasp the basics of a "separation of concerns" (SoC).

The Terraform source code, [HCL](https://developer.hashicorp.com/terraform/language/syntax/configuration), has been organized by the same SoC design principle. This is not required as Terraform is graph-based and will build its own dependency graph based on your HCL. Hence Terraform being declarative, and not procedural. But for organizational and ease of use, and getting familiar with Terraform, we felt this file structure was a better "getting started" experience.


# Disclaimer
THIS DEMO AND SAMPLE CODE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS DEMO AND SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.