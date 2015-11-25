all: help

VERSION = 0.1
IMAGE   = ww-test-node
REPO    = docker.salsitasoft.com/


COMPONENTS =		\
	client		\
	css		\
	img		\
	server.js	\
	node_modules	\
	views


.PHONY: help
help:
	@printf "%s\n%s\n" "create a nodejs docker image of WhatWine-Test app" \
		"Usage: make [bundle] [docker-node]"


.PHONY: docker-node
docker-node: bundle
	rm -rf tmp-build
	mkdir tmp-build
	tar cz -C dist -f tmp-build/components.tgz $(COMPONENTS)
	cp docker/* tmp-build/
	docker build --no-cache --rm -t $(IMAGE) tmp-build
	docker tag -f $(IMAGE) $(REPO)$(IMAGE):$(VERSION)
	docker tag -f $(IMAGE) $(REPO)$(IMAGE):latest
	rm -rf tmp-build


.PHONY: bundle
bundle:
	rm -rf dist
	npm run lint
	npm run build_frontend
	npm run build_backend
