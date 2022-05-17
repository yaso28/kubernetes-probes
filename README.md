<!-- omit in toc -->
# Kubernetes Probes Sample

- livenessProbe
- readinessProbe
- startupProbe

上記の動作検証を行うサンプルプログラムです。

メニュー

- [アプリケーション](#アプリケーション)
- [フレームワーク・ミドルウェア](#フレームワークミドルウェア)
- [ローカル環境構築・実行手順](#ローカル環境構築実行手順)
- [Dockerイメージ作成手順](#dockerイメージ作成手順)
- [Dockerイメージpush手順](#dockerイメージpush手順)
- [Kubernetesデプロイ手順](#kubernetesデプロイ手順)

## アプリケーション

- [app-target](app-target/)
  - 検証対象のアプリケーション
  - [開発履歴](history-app-target.md)
- [app-config](app-config/)
  - 検証対象アプリケーションの設定を行うバックエンドアプリケーション
  - [開発履歴](history-app-config.md)

## フレームワーク・ミドルウェア

- Node.js
  - v16.14.2
- docker
- kubernetes
- kustomize

## ローカル環境構築・実行手順

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

## Dockerイメージpush手順

`rename-and-push-images.sh`を実行可能にします。

```bash
chmod +x rename-and-push-images.sh
```

引数を指定して実行します。

```bash
./rename-and-push-images.sh [リポジトリ名] [タグ名]
```

これにより下記の処理を実行します。

- Dockerイメージのリネーム
- `kustomize/components/remote-image/kustomization.yaml`の書き換え
- リネームしたDockerイメージをリポジトリにpush

## Kubernetesデプロイ手順

overlaysの中から1つ選択してデプロイします。

> 例：`local-replicas`をデプロイする場合

```bash
kubectl apply -k kustomize/overlays/local-replicas
```

各overlaysの内容は下記の通りです。

|ディレクトリ|Dockerイメージ|アクセス|スケール|
|---|---|---|---|
|local-replicas|local|service NodePort|replicas|
