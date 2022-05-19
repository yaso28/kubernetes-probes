<!-- omit in toc -->
# Podのイベントログを取得

「[kubernetes-event-exporter](https://github.com/opsgenie/kubernetes-event-exporter)」をKubernetesにデプロイして、`app-target`のPodのイベントログを取得します。

メニュー

- [ツールをデプロイ](#ツールをデプロイ)
- [イベントログ取得](#イベントログ取得)
  - [例](#例)
- [イベントログのクリア](#イベントログのクリア)
- [「kubernetes-event-exporter」を使う理由](#kubernetes-event-exporterを使う理由)
- [課題](#課題)
  - [出力項目が多すぎる](#出力項目が多すぎる)
  - [イベントログ以外も出力されてしまう](#イベントログ以外も出力されてしまう)

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

試しに`app-target`のPod1つをlivenessProbeエラー状態にしてみます。

> 例：`app-target-6664868868-b84vm`をエラー状態にする場合

```bash
kubectl set env -n probes deployment/app-config LIVE_EXCLUDE=app-target-6664868868-b84vm
```

しばらく待ったのち、イベントログをファイル出力します。

```bash
kubectl logs -n monitoring deployment/event-exporter > events.log
```

出力したファイルの各行がイベントのJsonデータになっています。

|Jsonキー|データの内容|
|---|---|
|`reason`|イベント名|
|`message`|イベント詳細|
|`lastTimestamp`|イベント発生時刻|
|`involvedObject.name`|イベントが発生したPod名|

> 出力結果の例

```json:events.log
I0519 19:35:06.330217       1 request.go:665] Waited for 1.067330933s due to client-side throttling, not priority and fairness, request: GET:https://10.96.0.1:443/apis/events.k8s.io/v1?timeout=32s
I0519 19:35:16.530351       1 request.go:665] Waited for 1.19709066s due to client-side throttling, not priority and fairness, request: GET:https://10.96.0.1:443/apis/events.k8s.io/v1beta1?timeout=32s
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"910964","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:35:11Z","count":1,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"910979","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:35:21Z","count":2,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"910994","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:35:31Z","count":3,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098acddcb674f","namespace":"probes","uid":"9003f705-4086-449a-9617-fed9c2ffeb2d","resourceVersion":"910995","creationTimestamp":"2022-05-19T19:35:31Z"},"reason":"Killing","message":"Container app-target failed liveness probe, will be restarted","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:31Z","lastTimestamp":"2022-05-19T19:35:31Z","count":1,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c359530c1","namespace":"probes","uid":"0bb9eb8e-5d44-461e-9fe2-454395cec5ca","resourceVersion":"911043","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Pulled","message":"Container image \"kubernetes-probes-app-target\" already present on machine","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:36:01Z","count":2,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c3856e9f6","namespace":"probes","uid":"10d43c5d-33c5-45d8-abb6-96dc077f782a","resourceVersion":"911044","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Created","message":"Created container app-target","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:36:01Z","count":2,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c413ad2b6","namespace":"probes","uid":"c0b66e12-0458-4ab4-9e45-b55677a6e4b7","resourceVersion":"911045","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Started","message":"Started container app-target","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:36:01Z","count":2,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911084","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:36:21Z","count":4,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911099","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:36:31Z","count":5,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911114","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:36:41Z","count":6,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098acddcb674f","namespace":"probes","uid":"9003f705-4086-449a-9617-fed9c2ffeb2d","resourceVersion":"911115","creationTimestamp":"2022-05-19T19:35:31Z"},"reason":"Killing","message":"Container app-target failed liveness probe, will be restarted","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:31Z","lastTimestamp":"2022-05-19T19:36:41Z","count":2,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c359530c1","namespace":"probes","uid":"0bb9eb8e-5d44-461e-9fe2-454395cec5ca","resourceVersion":"911157","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Pulled","message":"Container image \"kubernetes-probes-app-target\" already present on machine","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:37:11Z","count":3,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c3856e9f6","namespace":"probes","uid":"10d43c5d-33c5-45d8-abb6-96dc077f782a","resourceVersion":"911158","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Created","message":"Created container app-target","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:37:11Z","count":3,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c413ad2b6","namespace":"probes","uid":"c0b66e12-0458-4ab4-9e45-b55677a6e4b7","resourceVersion":"911159","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Started","message":"Started container app-target","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:37:11Z","count":3,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911199","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:37:31Z","count":7,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911213","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:37:41Z","count":8,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911228","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:37:51Z","count":9,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098acddcb674f","namespace":"probes","uid":"9003f705-4086-449a-9617-fed9c2ffeb2d","resourceVersion":"911229","creationTimestamp":"2022-05-19T19:35:31Z"},"reason":"Killing","message":"Container app-target failed liveness probe, will be restarted","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:31Z","lastTimestamp":"2022-05-19T19:37:51Z","count":3,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c359530c1","namespace":"probes","uid":"0bb9eb8e-5d44-461e-9fe2-454395cec5ca","resourceVersion":"911273","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Pulled","message":"Container image \"kubernetes-probes-app-target\" already present on machine","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:38:21Z","count":4,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c3856e9f6","namespace":"probes","uid":"10d43c5d-33c5-45d8-abb6-96dc077f782a","resourceVersion":"911274","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Created","message":"Created container app-target","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:38:21Z","count":4,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f0968c413ad2b6","namespace":"probes","uid":"c0b66e12-0458-4ab4-9e45-b55677a6e4b7","resourceVersion":"911275","creationTimestamp":"2022-05-19T18:56:32Z"},"reason":"Started","message":"Started container app-target","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T18:56:32Z","lastTimestamp":"2022-05-19T19:38:21Z","count":4,"type":"Normal","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911312","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:38:41Z","count":10,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
{"metadata":{"name":"app-target-6664868868-b84vm.16f098a83780846f","namespace":"probes","uid":"fae45848-90fc-4606-a1d5-dddd6c36dc0f","resourceVersion":"911326","creationTimestamp":"2022-05-19T19:35:11Z"},"reason":"Unhealthy","message":"Liveness probe failed: HTTP probe failed with statuscode: 500","source":{"component":"kubelet","host":"docker-desktop"},"firstTimestamp":"2022-05-19T19:35:11Z","lastTimestamp":"2022-05-19T19:38:51Z","count":11,"type":"Warning","eventTime":null,"reportingComponent":"","reportingInstance":"","involvedObject":{"kind":"Pod","namespace":"probes","name":"app-target-6664868868-b84vm","uid":"b13de30b-257d-4d59-a58e-62fbb692dcb5","apiVersion":"v1","resourceVersion":"907650","fieldPath":"spec.containers{app-target}","labels":{"app":"app-target","pod-template-hash":"6664868868"}}}
```

## イベントログのクリア

過去のイベントログをクリアするには、ログ取得用Podを再起動します。

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

この方法を使うに当たり、下記の課題が残っています。

### 出力項目が多すぎる

不要な項目が多すぎて、イベントログの確認が煩雑になっています。

出力項目を絞る設定変更について調査中です。

### イベントログ以外も出力されてしまう

- イベントログをログ取得用Podの標準出力に出力する
- ログ取得用Podの標準出力をファイル出力する

という仕組み上、イベントログ以外の標準出力もファイルに含まれてしまいます。

イベントログの出力先を変更すればこの問題は解決しますが、その方法について深追いする予定は今のところありません。（「[kubernetes-event-exporter](https://github.com/opsgenie/kubernetes-event-exporter)」のページにいくつか方法が載っています。）
