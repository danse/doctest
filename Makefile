.PHONY: compile clean release setup test

PORT := 3000
coffee = node_modules/.bin/coffee

compile:
	@$(coffee) --compile --output lib src

clean:
	@rm -rf node_modules
	@git checkout -- lib

release:
ifndef VERSION
	$(error VERSION is undefined)
endif
	@sed -i '' 's!\("version": "\)[0-9.]*\("\)!\1$(VERSION)\2!' package.json
	@sed -i '' "s!\(.version = '\)[0-9.]*\('\)!\1$(VERSION)\2!" src/doctest.coffee
	@make
	@git add package.json src/doctest.coffee lib/doctest.js
	@git commit --message $(VERSION)
	@echo 'remember to run `npm publish`'

setup:
	@npm install

test:
	@$(coffee) test/cli
	@sleep 0.1 && test/open http://localhost:$(PORT) &
	@$(coffee) test/server
