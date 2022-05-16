<!-- omit in toc -->
# Kubernetes Probes Sample

- livenessProbe
- readinessProbe
- startupProbe

上記の動作検証を行うサンプルプログラムです。

## アプリケーション

- [app-target](app-target/)
  - 検証対象のアプリケーション
  - [開発履歴](history-app-target.md)
- [app-config](app-config/)
  - 検証対象アプリケーションの設定を行うバックエンドアプリケーション
  - [開発履歴](history-app-config.md)

## ローカル開発環境構築手順

app-config

- `cd app-config`
- `npm ci`
- `cp .env.example .env`
- `.env`ファイルを編集（環境変数設定）
- `npm start`

app-target

- `cd app-target`
- `npm ci`
- `cp .env.example .env`
- `.env`ファイルを編集（環境変数設定）
- `npm start`

## Dockerイメージ作成手順

app-config

- `chmod +x app-config/docker-build.sh`
- `./app-config/docker-build.sh`

app-target

- `chmod +x app-target/docker-build.sh`
- `./app-target/docker-build.sh`
