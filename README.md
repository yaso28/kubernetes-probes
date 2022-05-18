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
- [動作検証手順](#動作検証手順)

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

> 例：`local-nodeport-replicas`をデプロイする場合

```bash
kubectl apply -k kustomize/overlays/local-nodeport-replicas
```

各overlaysの内容は下記の通りです。

|ディレクトリ|Dockerイメージ|アクセス|スケール|備考|
|---|---|---|---|---|
|local-nodeport-replicas|local|service NodePort|replicas||
|local-ingress-replicas|local|ingress|replicas|*1|
|remote-ingress-replicas|remote|ingress|replicas|*1|

> *1: デプロイ前に下記の作業が必要です。

- `ingress-org.yaml`を`ingress.yaml`にコピー
- `ingress.yaml`を編集して`host`を書き換える

## 動作検証手順

このアプリケーションは、`app-target`のProbe（診断）を`app-config`の環境変数で制御する仕組みになっています。

`app-config`で使用する環境変数は下記の通りです。

|環境変数名|設定内容|デフォルト|備考|
|---|---|---|---|
|START_EXCLUDE|startupProbeを失敗させる`app-target`のPod名のリスト（カンマ区切り）|値なし（全てのPodでstartupProbeが成功する）|値を`ALL`にした場合は、全てのPodでstartupProbeが失敗する|
|LIVE_EXCLUDE|livenessProbeを失敗させる`app-target`のPod名のリスト（カンマ区切り）|値なし（全てのPodでlivenessProbeが成功する）|値を`ALL`にした場合は、全てのPodでlivenessProbeが失敗する|
|READ_EXCLUDE|readinessProbeを失敗させる`app-target`のPod名のリスト（カンマ区切り）|値なし（全てのPodでreadinessProbeが成功する）|値を`ALL`にした場合は、全てのPodでreadinessProbeが失敗する|

これらの環境変数を書き換えることで、`app-target`の各Podに対してProbe（診断）の成功／失敗を制御できます。

> 例：Pod `app-target-5cc45585cf-q2fjf` でlivenessProbeを失敗させる場合

```bash
kubectl set env -n probes deployment/app-config LIVE_EXCLUDE=app-target-5cc45585cf-q2fjf
```

> 例：Pod `app-target-5cc45585cf-tbrtg`, `app-target-5cc45585cf-wprt5` でreadinessProbeを失敗させる場合

```bash
kubectl set env -n probes deployment/app-config READ_EXCLUDE=app-target-5cc45585cf-tbrtg,app-target-5cc45585cf-wprt5
```

> 例：全てのPodでstartupProbeを失敗させる場合

```bash
kubectl set env -n probes deployment/app-config START_EXCLUDE=ALL
```
