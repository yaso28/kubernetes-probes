<!-- omit in toc -->
# Liveness Probeの動作検証結果

- [手順](#手順)
  - [初期化](#初期化)
  - [検証開始](#検証開始)
  - [検証終了](#検証終了)
- [結果および考察](#結果および考察)
  - [Podイベントログ](#podイベントログ)
  - [Service Endpoints](#service-endpoints)

## 手順　

### 初期化

`app-target`のPodをrolloutします。

```bash
kubectl rollout restart -n probes deployment/app-target
```

rolloutの完了を確認するため、下記コマンドを繰り返し実行します。

```bash
kubectl get pods -n probes -l app=app-target
```

> 結果が下記のようになったらrollout完了です。

```
NAME                          READY   STATUS    RESTARTS   AGE
app-target-68b8b88575-86gg8   1/1     Running   0          69s
app-target-68b8b88575-psd9m   1/1     Running   0          74s
app-target-68b8b88575-qkdrh   1/1     Running   0          80s
```

rolloutが完了したら、この時点でのイベントログを出力しておきます。

```bash
kubectl logs -n monitoring deployment/event-exporter > events-before.log
```

### 検証開始

別のウォッチ用ターミナルを別途2つ準備します。

`app-target` のPodのIPアドレスを取得します。

```bash
kubectl get pods -n probes -l app=app-target -o wide
```

```
NAME                          READY   STATUS    RESTARTS   AGE     IP           NODE             NOMINATED NODE   READINESS GATES
app-target-68b8b88575-86gg8   1/1     Running   0          8m53s   10.1.1.224   docker-desktop   <none>           <none>
app-target-68b8b88575-psd9m   1/1     Running   0          8m58s   10.1.1.223   docker-desktop   <none>           <none>
app-target-68b8b88575-qkdrh   1/1     Running   0          9m4s    10.1.1.222   docker-desktop   <none>           <none>
```

別のターミナルで、`app-target` Service Endpointのウォッチを開始します。

```bash
kubectl get endpoints -n probes --field-selector metadata.name=app-target -o custom-columns="UPDATED:metadata.annotations['endpoints\.kubernetes\.io/last-change-trigger-time'],ENDPOINTS_IP:subsets[*].addresses[*].ip" -w
```

`app-target` Podの1つをLivenessProbeエラー状態にします。

> 例：`app-target-68b8b88575-86gg8`をエラー状態にする場合

```bash
kubectl set env -n probes deployment/app-config LIVE_EXCLUDE=app-target-68b8b88575-86gg8
```

ウォッチ処理中のターミナルで変化を確認し、何回か再起動するまでしばらく待ちます。

### 検証終了

何回か再起動したのち、Podのイベントログをファイル出力します。

```bash
kubectl logs -n monitoring deployment/event-exporter > events.log
```

ウォッチ処理中の2つのターミナルで`Ctrl + C`を押下して、処理を終了します。

## 結果および考察

### Podイベントログ

イベントログ取得結果（`events.log`と`events-before.log`の差分）は下記の通りです。

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

この結果から、LivenessProbeの失敗からPod再起動までの間に、下記のイベントが発生していることがわかります。

|イベント名|備考|
|---|---|
|Unhealthy|LivenessProbe失敗1回目|
|Unhealthy|LivenessProbe失敗2回目（5秒後）|
|Unhealthy|LivenessProbe失敗3回目（5秒後）|
|Killing|Pod再起動（開始）|
|Pulled|Dockerイメージ取得|
|Created|Pod作成|
|Started|Pod開始|

> 最初の方で「Unhealthyの1回目が出力されていない」といった現象が発生していますが、原因は不明です。

### Service Endpoints

改めて`app-target` のPodの情報を取得します。

```bash
kubectl get pods -n probes -l app=app-target -o wide
```

```
NAME                          READY   STATUS    RESTARTS      AGE   IP           NODE             NOMINATED NODE   READINESS GATES
app-target-68b8b88575-86gg8   1/1     Running   2 (27s ago)   12m   10.1.1.224   docker-desktop   <none>           <none>
app-target-68b8b88575-psd9m   1/1     Running   0             12m   10.1.1.223   docker-desktop   <none>           <none>
app-target-68b8b88575-qkdrh   1/1     Running   0             12m   10.1.1.222   docker-desktop   <none>           <none>
```

`app-target-68b8b88575-86gg8` (10.1.1.224)が再起動を繰り返していることがわかります。

Service Endpointsのウォッチ結果は下記の通りです。

```
UPDATED   ENDPOINTS_IP
<none>    10.1.1.222,10.1.1.223,10.1.1.224
2022-06-11T01:52:27Z   10.1.1.222,10.1.1.223
2022-06-11T01:52:32Z   10.1.1.222,10.1.1.223,10.1.1.224
2022-06-11T01:53:17Z   10.1.1.222,10.1.1.223
2022-06-11T01:53:21Z   10.1.1.222,10.1.1.223,10.1.1.224
```

`app-target-68b8b88575-86gg8` (10.1.1.224)のEndpointが削除・追加を繰り返しています。

Podのイベントログと合わせて時系列をまとめルト下表の通りになります。

|時刻|イベント種別|イベント内容|Endpoints|
|---|---|---|---|
|01:51:51|Pod|Unhealthy - LivenessProbe失敗2回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:51:56|Pod|Unhealthy - LivenessProbe失敗3回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:51:56|Pod|Killing - Pod再起動（開始）|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:26|Pod|Pulled - Dockerイメージ取得|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:26|Pod|Created - Pod作成|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:26|Pod|Started - Pod開始|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:27|Endpoint|REMOVED|10.1.1.222,10.1.1.223|
|01:52:32|Endpoint|ADDED|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:36|Pod|Unhealthy - LivenessProbe失敗1回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:41|Pod|Unhealthy - LivenessProbe失敗2回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:46|Pod|Unhealthy - LivenessProbe失敗3回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:46|Pod|Killing - Pod再起動（開始）|10.1.1.222,10.1.1.223,10.1.1.224|
|01:53:16|Pod|Pulled - Dockerイメージ取得|10.1.1.222,10.1.1.223,10.1.1.224|
|01:53:16|Pod|Created - Pod作成|10.1.1.222,10.1.1.223,10.1.1.224|
|01:53:16|Pod|Started - Pod開始|10.1.1.222,10.1.1.223,10.1.1.224|
|01:52:17|Endpoint|REMOVED|10.1.1.222,10.1.1.223|
|01:52:21|Endpoint|ADDED|10.1.1.222,10.1.1.223,10.1.1.224|
|01:53:26|Pod|Unhealthy - LivenessProbe失敗1回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:53:31|Pod|Unhealthy - LivenessProbe失敗2回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:53:36|Pod|Unhealthy - LivenessProbe失敗3回目|10.1.1.222,10.1.1.223,10.1.1.224|
|01:53:36|Pod|Killing - Pod再起動（開始）|10.1.1.222,10.1.1.223,10.1.1.224|

このことからLiveness Probeエラーの場合は

- Podが再起動を完了してStartedになった後にEndpointが削除される
- その後、おそらくStartedになったPodのStartup Probeが成功したのちにEndpointが追加される

という動作になっていると考えられます。

> PodがKillingしてからEndpointが減るまでの間は、再起動中のPodにリクエストが割り振られてしまうのかもしれません。
