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
	./.secrets/backend_vault_token \
	./.secrets/elasticsearch_vault_token \
	./.secrets/logstash_vault_token \
	./.secrets/kibana_vault_token

# Must be in standard dotenv format
-include .env
include config.env

# Helper Makefile
include Makefile.clean
include Makefile.aux

# This target is needed for legacy docker compose versions where there is no `--watch` flag for `docker compose up`.
# The "dev" target is preferred.
.PHONY: dev-old-compose
dev-old-compose: check-env
	$(MAKE) ensure-secret-files
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
dev: check-env ensure-secret-files
	@unset -v LOGSTASH_HOST && $(call dev-env, \
		up                                     \
		--remove-orphans                       \
		--build                                \
		--watch                                \
		$(ARGS))

.PHONY: dev-elk
dev-elk: check-env ensure-secret-files
	@$(call dev-env,     \
		--profile elk    \
		up               \
		--remove-orphans \
		--build          \
		--watch          \
		$(ARGS))

# Don't depend on check-env (endless waiting), rather fail
.PHONY: actual-prod
actual-prod: ensure-secret-files
	@$(call prod-env,    \
		--profile elk	 \
		up               \
		--remove-orphans \
		--build          \
		--detach         \
		$(ARGS))

# Temporary fix, so it deploys. No ELK, etc.
.PHONY: prod
prod: check-env ensure-secret-files
	@unset -v LOGSTASH_HOST && $(call dev-env, \
		up                                     \
		--remove-orphans                       \
		--build                                \
		--detach                               \
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
