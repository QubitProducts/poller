ifndef ROOT
	ROOT = ../..
endif

BIN = $(ROOT)/node_modules/.bin

SRC = **.js
TESTS = test

.PHONY: test watch

test:
	$(BIN)/standard
	$(BIN)/karma start --single-run

watch:
	$(BIN)/karma start
