# Change to docker-compose if you need
DC := COMPOSE_BAKE=true docker compose
# Change to podman if you need
D := docker
# Enables you do run `make` alone
.DEFAULT_GOAL := dev

# When registering a new service that needs vault, a file needs
# to be added here for the exchange of the vault token. The
# naming scheme is strict, it must be
# ./.secrets/${service}_vault_token
# where ${service} is the same as the JSON root subkeys in ./env.json
VAULT_TOKEN_EXCHANGE_FILES := \
	./.secrets/elasticsearch_vault_token \
	./.secrets/logstash_vault_token \
	./.secrets/kibana_vault_token \
	./.secrets/caddy_vault_token \
	./.secrets/frontend_vault_token \
	./.secrets/backend_vault_token

# Helper Makefile
include Makefile.clean
include Makefile.aux

# This target is needed for legacy docker compose versions where there is no `--watch` flag for `docker compose up`.
# The "dev" target is preferred.
.PHONY: dev-old-compose
dev-old-compose: clean-frontend-volume ensure-secret-files
	@[ -n "$(ARGS)" ] && { printf '\033[31m%s\033[m\n' "ARGS argument not supported for dev-old-compose target (because of --detach option)"; exit 1; }
	@$(call dev-env,build)
	@$(call dev-env,up --remove-orphans --detach)
	@$(call dev-env,logs --follow &)
	@$(call wait-progress,5)
	@$(call wait-progress,4)
	@$(call wait-progress,3)
	@$(call wait-progress,2)
	@$(call wait-progress,1)
	@$(call dev-env,watch --no-up)

.PHONY: dev
dev: clean-frontend-volume ensure-secret-files build-util-image
	@$(call dev-env,     \
		up               \
		--remove-orphans \
		--build          \
		--watch          \
		$(ARGS))

.PHONY: dev-elk
dev-elk: clean-frontend-volume ensure-secret-files build-util-image
	@$(call dev-env,     \
		--profile elk    \
		up               \
		--remove-orphans \
		--build          \
		--watch          \
		$(ARGS))

.PHONY: prod
prod: clean-frontend-volume ensure-secret-files build-util-image
	@$(call prod-env,    \
		--profile elk	 \
		up               \
		--remove-orphans \
		--build          \
		--detach         \
		$(ARGS))

.PHONY: down
down:
	$(DC) --profile elk down --remove-orphans

# "vclean" will remove all volumes, for more info, see Makefile.clean
.PHONY: re
re: vclean clean-secrets-folder
	$(MAKE)

.PHONY: install
install:
	npm --prefix=frontend install
	npm --prefix=backend install
	npm --prefix=cli install
	
.PHONY: test
test: install
	npm --prefix=backend test

# Usage: `make get-env SERVICE=elasticsearch`
.PHONY: get-env
get-env:
	$(D) exec vault sh -c 'SERVICE=$(SERVICE); wget --header="X-Vault-Token: $$(cat /vault/secret/root_token)" --quiet --output-document=- "$$(cat /tmp/vault_addr)"/v1/secret/data/$$SERVICE | jq --raw-output --color-output .data.data'

.PHONY: wait
wait:
	./script/wait_for_services
