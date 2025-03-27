DC := docker compose
D := docker

VAULT_TOKEN_EXCHANGE_FILES := ./.secrets/backend_vault_token

.DEFAULT_GOAL := dev

-include .env
include config.env
.EXPORT_ALL_VARIABLES:

.PHONY: check-env
check-env:
	@test -e .env || {        \
		printf '\033[33m%s \033[42;30m%s\033[m\033[33m\n%s\n%s\n%s\n%s\n%s\033[m'          \
			"Warning: .env doesn't exist, trying to run" "cp .env.example .env"            \
			"Warning: Since the file didn't exist, no environment variables from"          \
			"Warning: that file will be included/exposed inside this Makefile."            \
			"Warning: It is STRONGLY recommended you abort this step, manually"            \
			"Warning: copy the file, adjust its contents, and then run make again."        \
			"Warning: Press ENTER to continue (run the cp command) or CTRL-C to abort..."; \
		read c;               \
		cp .env.example .env; \
	}

define dev-env
	[ -n "$(DEV_HTTP_PORT)" ]  &&  \
	[ -n "$(DEV_HTTPS_PORT)" ] &&  \
	[ -n "$(DEV_DOMAINS)" ]    &&  \
	HTTP_PORT="$(DEV_HTTP_PORT)"   \
	HTTPS_PORT="$(DEV_HTTPS_PORT)" \
	DOMAINS="$(DEV_DOMAINS)"       \
	NODE_ENV="development"         \
	WATCH="1"                      \
	CADDY_EXTRA_GLOBAL_DIRECTIVES="$$(printf %b "$(DEV_CADDY_EXTRA_GLOBAL_DIRECTIVES)")" \
	CADDY_EXTRA_SITE_DIRECTIVES="$$(printf %b "$(DEV_CADDY_EXTRA_SITE_DIRECTIVES)")"     \
	$(DC) $(1)
endef

define prod-env
	[ -n "$(PROD_HTTP_PORT)" ]  &&  \
	[ -n "$(PROD_HTTPS_PORT)" ] &&  \
	[ -n "$(PROD_DOMAINS)" ]    &&  \
	HTTP_PORT="$(PROD_HTTP_PORT)"   \
	HTTPS_PORT="$(PROD_HTTPS_PORT)" \
	DOMAINS="$(PROD_DOMAINS)"       \
	NODE_ENV="production"           \
	WATCH="0"                       \
	CADDY_EXTRA_GLOBAL_DIRECTIVES="$$(printf %b "$(PROD_CADDY_EXTRA_GLOBAL_DIRECTIVES)")" \
	CADDY_EXTRA_SITE_DIRECTIVES="$$(printf %b "$(PROD_CADDY_EXTRA_SITE_DIRECTIVES)")"     \
	$(DC) $(1)
endef

define wait-progress
	printf '\033[33m%s\033[m\n' \
		"INFO: Starting to watch for filesystem changes in $(1) second(s)"
	sleep 1
endef

.PHONY: ensure-secret-files
ensure-secret-files:
	@mkdir -p ./.secrets/
	@$(RM) -r $(VAULT_TOKEN_EXCHANGE_FILES)
	@touch $(VAULT_TOKEN_EXCHANGE_FILES)

# This target is needed for legacy docker compose versions where there's no `--watch' flag for `docker compose up'.
# Use the `dev' target instead.
.PHONY: dev-old-compose
dev-old-compose: check-env clean-app-volumes ensure-secret-files
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
dev: check-env clean-app-volumes ensure-secret-files
	@$(call dev-env,up --remove-orphans --build --watch $(ARGS))

.PHONY: prod
prod: check-env clean-app-volumes ensure-secret-files
	@$(call prod-env,up --remove-orphans --build --detach)

.PHONY: down
down:
	$(DC) down

.PHONY: clean-app-volumes
clean-app-volumes: down
	$(D) volume rm --force ft-transcendence_frontend

.PHONY: clean
clean:
	$(MAKE) clean-app-volumes
	$(D) system prune --force

.PHONY: cleandb
cleandb: clean
	$(D) volume rm --force ft-transcendence_drizzle

.PHONY: cleanvault
cleanvault: clean
	$(D) volume rm --force ft-transcendence_vault

.PHONY: fclean
fclean: clean cleandb cleanvault
	$(RM) -r ./backend/node_modules/ backend/dist/ backend/.tap/
	$(RM) -r ./frontend/node_modules/ frontend/dist/
	$(RM) -r $(VAULT_TOKEN_EXCHANGE_FILES)

.PHONY: deepclean
deepclean: fclean
	@printf '\033[33mWarning: %b\033[m'                                         \
		"You're about the delete ALL:\n"                                        \
		" - containers (running or not)\n"                                      \
		" - docker images (dangling and unused)\n"                              \
		" - volumes (named or unnamed)\n"                                       \
		" - networks\n"                                                         \
		" - build caches\n"                                                     \
		"This is VERY, VERY LIKELY not needed. Images, containers, networks\n"  \
		"volumes, and build caches NOT related to this project WILL BE LOST.\n" \
		"Please make sure you fully understand what you're about to do\n"       \
		"and consider 'make clean' instead.\n"                                  \
		"Press ENTER to continue anyway..." && read c
	$(MAKE) clean
	$(D) ps --quiet --all | xargs -r $(D) rm -f # non-graceful shutdown because wdgaf
	$(D) system prune --all --volumes --force        # dangerous

.PHONY: re
re: clean
	$(MAKE)

.PHONY: install
install:
	npm --prefix=frontend install
	npm --prefix=backend install
	
.PHONY: test
test: install
	npm --prefix=backend test
