ifndef ROOT
	ROOT = ../..
endif

BIN = $(ROOT)/node_modules/.bin

SRC = **.js
TESTS = test

.PHONY: lint test watch

test: lint
	$(BIN)/karma start --single-run

lint:
	$(BIN)/standard

watch:
	$(BIN)/karma start
