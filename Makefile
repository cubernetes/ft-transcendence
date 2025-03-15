DC := docker compose
D := docker

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

.PHONY: dev
dev: check-env
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
	$(DC) up --build --detach

# Not sure how to deduplicate this...
.PHONY: watch
watch: check-env
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
	$(DC) up --build --watch

.PHONY: prod
prod: check-env
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
	$(DC) up --build --detach

.PHONY: down
down:
	$(DC) down

.PHONY: clean
clean: down
	$(D) system prune --force
	$(D) volume rm --force ft-transcendence_app

.PHONY: deepclean
deepclean:
	$(RM) -r backend/node_modules/ backend/dist/ backend/.tap/
	$(RM) -r web/node_modules/ web/dist/
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
	$(D) ps --quiet --all | xargs -r $(D) rm --force # non-graceful shutdown because wdgaf
	$(D) system prune --all --volumes --force        # dangerous

.PHONY: re
re: clean
	$(MAKE)

.PHONY: npm-install
npm-install:
	npm --prefix=web install
	npm --prefix=backend install

.PHONY: test
test: npm-install
	npm --prefix=backend test
