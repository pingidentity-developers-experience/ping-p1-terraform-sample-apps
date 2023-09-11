default: devcheck

fmt:
	@echo "==> Formatting Terraform code with terraform fmt..."
	@terraform fmt -recursive ./BX*-Terraform-pkg/terraform

fmt-check:
	@echo "==> Checking Terraform code with terraform fmt..."
	@terraform fmt -recursive -check ./BX*-Terraform-pkg/terraform

validate:
	@echo "==> Checking Terraform code with terraform validate..."
	@for dir in $$(find ./BX*-Terraform-pkg -maxdepth 0); do \
		echo $${dir} ; \
		[ -d "$${dir}/terraform" ] && terraform -chdir=$${dir}/terraform validate . ; \
    done

tflint:
	@echo "==> Checking Terraform code with tflint..."
	@for dir in $$(find ./BX*-Terraform-pkg -maxdepth 0); do \
		echo $${dir} ; \
		[ -d "$${dir}/terraform" ] && tflint --chdir=$${dir}/terraform; \
	done

tfsec:
	@echo "==> Checking Terraform code with tfsec..."
	@tfsec ./BX*-Terraform-pkg/terraform

devcheck: fmt fmt-check validate tflint tfsec

.PHONY: devcheck fmt fmt-check validate tflint tfsec