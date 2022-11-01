##################
### USED BY CI ###
##################

install-rancher: ## Install Rancher via Helm
	@./scripts/install_rancher.sh

install-helm: ## Install Helm
	curl --silent --location https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz | tar xz -C .
	sudo mv linux-amd64/helm /usr/local/bin
	sudo chown root:root /usr/local/bin/helm
	sudo rm -rf linux-amd64/ helm-*.tar.gz

install-k3s: ## Install K3s with default options
	curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=${K3S_VERSION} sh -s - --write-kubeconfig-mode 644
	## Wait for K3s to start (could be improved?)
	timeout 2m bash -c "until ! kubectl get pod -A 2>/dev/null | grep -Eq 'ContainerCreating|CrashLoopBackOff'; do sleep 1; done"

install-cert-manager: ## Install dependencies needed by Epinio
	@./scripts/install_cert-manager.sh

install-epinio: ## Install Epinio with Helm
	@./scripts/install_epinio.sh

uninstall-epinio: ## Uninstall Epinio with Helm
	/usr/local/bin/helm uninstall epinio -n epinio

get-ca: ## Configure Cypress to use the epinio-ca
	@./scripts/get_ca.sh

create-docker-secret: ## Create docker pull secret to avoid the docker hub rate limit
	@./scripts/create_docker_secret.sh

prepare-e2e-ci-rancher: install-k3s install-helm install-rancher create-docker-secret get-ca upload-kubeconfig ## Tests

prepare-e2e-ci-standalone: install-k3s install-helm install-cert-manager create-docker-secret install-epinio get-ca upload-kubeconfig ## Tests

patch-epinio-ui:
	@./scripts/patch_epinio-ui.sh

start-cypress-tests:
	@./scripts/start_cypress_tests.sh

clean-k3s:
	/usr/local/bin/k3s-uninstall.sh

clean-all: clean-k3s
	/usr/local/bin/helm repo remove rancher-latest jetstack

########################
### LOCAL DEPLOYMENT ###
########################

export CLUSTER_NAME ?= epinio
export TMP_DIR ?= /tmp
export DOMAIN ?= $(IP_ADDR).nip.io

build-image: ## Build the e2e_image with latest tests version
	docker build -t e2e_image .

cypress-gui: ## Start Cypress in GUI mode, need graphical environment
	npm install
	./node_modules/cypress/bin/cypress  open -C cypress.config.ts

check-dependencies:
	command -v docker && echo "docker - ok"
	command -v k3d && echo "k3d - ok"
	command -v kubectl && echo "kubectl - ok"
	command -v helm && echo "helm - ok"
	command -v epinio && echo "epinio - ok"
	command -v jq && echo "jq - ok"
	command -v npm && echo "npm - ok"

get-ingress-ip:
	@echo "\nExport IP_ADDR with this IP before deploying Epinio"
	kubectl get svc -n kube-system traefik -o jsonpath="{.status.loadBalancer.ingress[0]}" | jq -r ".ip"

create-cluster:
	k3d cluster create $(CLUSTER_NAME) -p '80:80@loadbalancer' -p '443:443@loadbalancer'
	kubectl rollout status deployment metrics-server -n kube-system --timeout=480s

delete-cluster:
	k3d cluster delete $(CLUSTER_NAME)

install-cert-manager:
	kubectl create namespace cert-manager
	helm repo add jetstack https://charts.jetstack.io
	helm repo update
	helm install cert-manager --namespace cert-manager jetstack/cert-manager \
		--set installCRDs=true \
		--set extraArgs[0]=--enable-certificate-owner-ref=true

deploy-epinio:
	helm repo add epinio https://epinio.github.io/helm-charts
	kubectl rollout status deployment traefik -n kube-system --timeout=480s
	helm install epinio -n epinio --create-namespace epinio/epinio --set global.domain=${DOMAIN}
	kubectl rollout status deployment epinio-server -n epinio --timeout=480s

undeploy-epinio: undeploy-epinio
	helm uninstall -n epinio epinio

prepare-cluster:
	@echo "\n\n****** STEP (0): Checking dependencies..."
	$(MAKE) check-dependencies
	@echo "\n\n****** STEP (1): Create k3d cluster..."
	$(MAKE) create-cluster
	@echo "\n\n****** STEP (2): Deploy cert-manager into cluster..."
	$(MAKE) install-cert-manager
	$(MAKE) get-ingress-ip

upload-kubeconfig:
	cp ${KUBECONFIG} /tmp/config.yaml
	kubectl --kubeconfig=/tmp/config.yaml config set-cluster default --server=https://${MY_IP}:6443
	kubectl create secret generic ci-kubeconfig --from-file=/tmp/config.yaml
	kubectl apply -f ./scripts/ci-kubeconfig-nginx.yaml
	kubectl rollout status deployment ci-nginx --timeout=480s
	kubectl create ingress ci-nginx --rule="ci.${MY_IP}.nip.io/*=ci-nginx:80,tls"

help: ## Show this Makefile's help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
