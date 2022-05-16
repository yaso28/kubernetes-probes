<!-- omit in toc -->
# app-target 開発履歴

メニュー

- [enabled env file management](#enabled-env-file-management)
- [added error handlers](#added-error-handlers)
- [arranged project](#arranged-project)
- [created project](#created-project)

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

- npx express-generator --no-view --git app-target
- cd app-target
- npm install
