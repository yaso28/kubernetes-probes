<!-- omit in toc -->
# app-config 開発履歴

メニュー

- [added error handlers](#added-error-handlers)
- [arranged project](#arranged-project)
- [created project](#created-project)

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
