ifndef ROOT
	ROOT = ../..
endif

BIN = $(ROOT)/node_modules/.bin

.PHONY: lint test watch

test: lint
	cd ../.. && make test-edge

lint:
	$(BIN)/standard5

watch:
	$(BIN)/karma start
