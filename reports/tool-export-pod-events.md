<!-- omit in toc -->
# Podのイベントログを取得

「[kubernetes-event-exporter](https://github.com/opsgenie/kubernetes-event-exporter)」をKubernetesにデプロイして、`app-target`のPodのイベントログを取得します。

メニュー

- [ツールをデプロイ](#ツールをデプロイ)
- [イベントログ取得](#イベントログ取得)
  - [例](#例)
- [「kubernetes-event-exporter」の設定内容](#kubernetes-event-exporterの設定内容)
- [イベントログのクリア](#イベントログのクリア)
- [「kubernetes-event-exporter」を使う理由](#kubernetes-event-exporterを使う理由)
- [課題](#課題)
  - [イベントログ出力結果の不具合](#イベントログ出力結果の不具合)
  - [無関係な標準出力が混在](#無関係な標準出力が混在)

## ツールをデプロイ

下記コマンドを実行します。

```bash
cd event-exporter

kubectl apply -f 00-roles.yaml
kubectl apply -f 01-config.yaml
kubectl apply -f 02-deployment.yaml
```

イベントログ取得用Podが作成されていることを確認します。

```bash
kubectl get pods -n monitoring
```

> 結果

```
NAME                             READY   STATUS    RESTARTS   AGE
event-exporter-d88d4f8f4-rl4d5   1/1     Running   0          33s
```

## イベントログ取得

ツールをデプロイした時点で、イベントログの取得処理は開始しています。

イベントログをファイル出力するには、下記コマンドを実行します。

```bash
kubectl logs -n monitoring deployment/event-exporter > events.log
```

### 例

試しに`app-target`のPod1つをLivenessProbeエラー状態にしてイベントログを取得します。

まずは検証前時点のイベントログを出力しておきます。

```bash
kubectl logs -n monitoring deployment/event-exporter > events-before.log
```

次にapp-target`のPod1つをLivenessProbeエラー状態にします。

> 例：`app-target-68b8b88575-86gg8`をエラー状態にする場合

```bash
kubectl set env -n probes deployment/app-config LIVE_EXCLUDE=app-target-68b8b88575-86gg8
```

しばらく待ったのち、イベントログをファイル出力します。

```bash
kubectl logs -n monitoring deployment/event-exporter > events.log
```

`events.log`と`events-before.log`の差分は、下記のようになります。

> 出力結果の例

```json
I0611 01:51:43.669409       1 request.go:665] Waited for 1.060802249s due to client-side throttling, not priority and fairness, request: GET:https://10.96.0.1:443/apis/discovery.k8s.io/v1?timeout=32s
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:51:51 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"2","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:51:56 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"3","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:51:56 +0000 UTC","3_EVENT":"Killing","4_CNT":"1","5_MSG":"Container app-target failed liveness probe, will be restarted"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:52:26 +0000 UTC","3_EVENT":"Pulled","4_CNT":"2","5_MSG":"Container image \"kubernetes-probes-app-target\" already present on machine"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:52:26 +0000 UTC","3_EVENT":"Created","4_CNT":"2","5_MSG":"Created container app-target"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:52:26 +0000 UTC","3_EVENT":"Started","4_CNT":"2","5_MSG":"Started container app-target"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:52:36 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"4","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:52:41 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"5","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:52:46 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"6","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:52:46 +0000 UTC","3_EVENT":"Killing","4_CNT":"2","5_MSG":"Container app-target failed liveness probe, will be restarted"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:53:16 +0000 UTC","3_EVENT":"Pulled","4_CNT":"3","5_MSG":"Container image \"kubernetes-probes-app-target\" already present on machine"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:53:16 +0000 UTC","3_EVENT":"Created","4_CNT":"3","5_MSG":"Created container app-target"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:53:16 +0000 UTC","3_EVENT":"Started","4_CNT":"3","5_MSG":"Started container app-target"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:53:26 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"7","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:53:31 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"8","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:53:36 +0000 UTC","3_EVENT":"Unhealthy","4_CNT":"9","5_MSG":"Liveness probe failed: HTTP probe failed with statuscode: 500"}
{"1_POD":"app-target-68b8b88575-86gg8","2_AT":"2022-06-11 01:53:36 +0000 UTC","3_EVENT":"Killing","4_CNT":"3","5_MSG":"Container app-target failed liveness probe, will be restarted"}
```

原則としてJson形式のイベントデータが1行ずつ出力されます。（イベントログとは無関係な標準出力の行も混在しています。）

## 「kubernetes-event-exporter」の設定内容

設定は[event-exporter/01-config.yaml](../event-exporter/01-config.yaml)で行っています。

`route.routes[0].match`の箇所で、出力対象を`app-target`のPodのみに絞り込んでいます。

`receivers[*].stdout.layout`の箇所で、出力結果をフォーマットしています。

フォーマットの設定が無い場合、各行のJsonイベントデータは下記のような形式になります。

```json
{
    "metadata": {
        "name": "app-target-6664868868-b84vm.16f098a83780846f",
        "namespace": "probes",
        "uid": "fae45848-90fc-4606-a1d5-dddd6c36dc0f",
        "resourceVersion": "910964",
        "creationTimestamp": "2022-05-19T19:35:11Z"
    },
    "reason": "Unhealthy",
    "message": "Liveness probe failed: HTTP probe failed with statuscode: 500",
    "source": {
        "component": "kubelet",
        "host": "docker-desktop"
    },
    "firstTimestamp": "2022-05-19T19:35:11Z",
    "lastTimestamp": "2022-05-19T19:35:11Z",
    "count": 1,
    "type": "Warning",
    "eventTime": null,
    "reportingComponent": "",
    "reportingInstance": "",
    "involvedObject": {
        "kind": "Pod",
        "namespace": "probes",
        "name": "app-target-6664868868-b84vm",
        "uid": "b13de30b-257d-4d59-a58e-62fbb692dcb5",
        "apiVersion": "v1",
        "resourceVersion": "907650",
        "fieldPath": "spec.containers{app-target}",
        "labels": {
            "app": "app-target",
            "pod-template-hash": "6664868868"
        }
    }
}
```

この中で下記の項目のみを出力するように、`receivers[*].stdout.layout`で設定しています。

|カラム名|Jsonキー|データの内容|
|---|---|---|
|1_POD|`involvedObject.name`|イベントが発生したPod名|
|2_AT|`lastTimestamp`|イベント発生時刻|
|3_EVENT|`reason`|イベント名|
|4_CNT|`count`|同名イベントの発生回数|
|5_MSG|`message`|イベントメッセージ|

## イベントログのクリア

ログ取得用Podを再起動すると、過去のイベントログをクリアできます。

```bash
kubectl rollout restart -n monitoring deployment/event-exporter
```

再起動後、イベントログがクリアされていることを確認します。

```bash
kubectl logs -n monitoring deployment/event-exporter
```

> 出力結果の例（再起動前のログが全て消えています。）

```
I0519 20:39:33.222735       1 request.go:665] Waited for 1.071317025s due to client-side throttling, not priority and fairness, request: GET:https://10.96.0.1:443/apis/certificates.k8s.io/v1?timeout=32s
```

## 「kubernetes-event-exporter」を使う理由

Podのイベントは下記コマンドで取得できます。

```bash
kubectl describe pod -n probes app-target-6664868868-b84vm
```

> 出力結果の例

```
...
Events:
  Type     Reason     Age                   From               Message
  ----     ------     ----                  ----               -------
  Normal   Scheduled  42m                   default-scheduler  Successfully assigned probes/app-target-6664868868-b84vm to docker-desktop
  Normal   Killing    70s (x3 over 3m30s)   kubelet            Container app-target failed liveness probe, will be restarted
  Normal   Pulled     40s (x4 over 42m)     kubelet            Container image "kubernetes-probes-app-target" already present on machine
  Normal   Created    40s (x4 over 42m)     kubelet            Created container app-target
  Normal   Started    40s (x4 over 42m)     kubelet            Started container app-target
  Warning  Unhealthy  10s (x11 over 3m50s)  kubelet            Liveness probe failed: HTTP probe failed with statuscode: 500
```

ただしこの方法では、同名のイベントが複数回発生した場合それらを1行にまとめた形式で出力されてしまい、各イベントの発生時刻を取得できません。

> `kubectl get events`も同様に、同名のイベントは1行にまとめられてしまいます。

またPodが再起動した回数は下記コマンドで取得できますが、再起動した時刻は取得できません。

```bash
kubectl get pods -n probes
```

```
NAME                          READY   STATUS    RESTARTS      AGE
app-config-8587f488db-5wmj9   1/1     Running   0             3m34s
app-target-6664868868-b84vm   1/1     Running   3 (16s ago)   42m
app-target-6664868868-m9f8m   1/1     Running   0             42m
app-target-6664868868-ss8ph   1/1     Running   0             42m
```

各イベントを1行ずつ、発生時刻を含めて取得する手段として、「kubernetes-event-exporter」を使っています。

## 課題

### イベントログ出力結果の不具合

特にイベントログ取得を開始した直後に、ログの取得漏れや出力順序の逆転といった不具合が発生するケースがあります。原因は不明です。

### 無関係な標準出力が混在

- イベントログをログ取得用Podの標準出力に出力する
- ログ取得用Podの標準出力をファイル出力する

という仕組み上、イベントログ以外の標準出力もファイルに含まれてしまいます。

イベントログの出力先を変更すればこの問題は解決しますが、その方法について深追いする予定は今のところありません。（「[kubernetes-event-exporter](https://github.com/opsgenie/kubernetes-event-exporter)」のページにいくつか方法が載っています。）

