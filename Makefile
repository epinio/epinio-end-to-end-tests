build-image: ## Build the e2e_image with latest tests version
	docker build -t e2e_image .

e2e-tests: ## Build e2e_image and fire all the tests
	make build-image fire-tests

fire-tests: ## Fire all Cypress tests
	docker run -e RANCHER_USER=${RANCHER_USER}      \
		-e RANCHER_PASSWORD=${RANCHER_PASSWORD} \
		-e RANCHER_URL=${RANCHER_URL}           \
		-e CLUSTER_NAME=${CLUSTER_NAME}         \
		-e SYSTEM_DOMAIN=${SYSTEM_DOMAIN}       \
		--rm e2e_image cypress.json

help: ## Show this Makefile's help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
