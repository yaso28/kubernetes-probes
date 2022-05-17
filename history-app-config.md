<!-- omit in toc -->
# app-config 開発履歴

※上の方が新しい履歴です。

- [added exclude-all option](#added-exclude-all-option)
- [dockerized](#dockerized)
- [implemented probe config api](#implemented-probe-config-api)
- [enabled env file management](#enabled-env-file-management)
- [added error handlers](#added-error-handlers)
- [arranged project](#arranged-project)
- [created project](#created-project)

## added exclude-all option

- edited routes/probe.js

## dockerized

- touch Dockerfile
- touch .dockerignore
- touch docker-build.sh
- chmod +x docker-build.sh

## implemented probe config api

- touch routes/probe.js
- edited app.js

## enabled env file management

- npm install dotenv
- touch .env
- cp .env .env.example
- edited bin/www

## added error handlers

- mkdir middlewares
- touch middlewares/error-handler-404.js
- touch middlewares/error-handler-500.js
- edited app.js

## arranged project

- rm -r public
- rm routes/*
- edited app.js

## created project

- npx express-generator --no-view --git app-config
- cd app-config
- npm install
