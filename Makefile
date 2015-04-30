ifndef ROOT
	ROOT = ../..
endif

BIN = $(ROOT)/node_modules/.bin

SRC = **.js
TESTS = test

.PHONY: test watch

test:
	$(BIN)/jshint --reporter $(ROOT)/node_modules/jshint-stylish --exclude node_modules .
	$(BIN)/jscs .
	$(BIN)/karma start --single-run

watch:
	$(BIN)/karma start
