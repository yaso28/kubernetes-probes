<!-- omit in toc -->
# ServiceのEndpointをウォッチ

ServiceのEndpointを監視して、増減のログをリアルタイムで取得します。

メニュー

- [結論](#結論)
- [コマンドを作った経緯](#コマンドを作った経緯)

## 結論

下記コマンドを実行すると、Endpointが増減した時刻および増減後のIPアドレス群をリアルタイムで取得できます。

```bash
kubectl get endpoints -n probes --field-selector metadata.name=app-target -o custom-columns="UPDATED:metadata.annotations['endpoints\.kubernetes\.io/last-change-trigger-time'],ENDPOINTS_IP:subsets[*].addresses[*].ip" -w
```

> 出力結果の例

```
UPDATED   ENDPOINTS_IP
<none>    10.1.0.173,10.1.0.174,10.1.0.175
2022-05-19T19:36:02Z   10.1.0.173,10.1.0.174
2022-05-19T19:36:11Z   10.1.0.173,10.1.0.174,10.1.0.175
2022-05-19T19:37:12Z   10.1.0.173,10.1.0.174
2022-05-19T19:37:21Z   10.1.0.173,10.1.0.174,10.1.0.175
2022-05-19T19:38:22Z   10.1.0.173,10.1.0.174
2022-05-19T19:38:32Z   10.1.0.173,10.1.0.174,10.1.0.175
```

取得後は、`Ctrl + C`で停止します。

## コマンドを作った経緯

EndPointは下記コマンドで取得できます。

```bash
kubectl get endpoints -n probes
```

> 出力結果の例

```bash
NAME         ENDPOINTS                                         AGE
app-config   10.1.0.178:3000                                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
```

`-w`オプションを使うと、変化をリアルタイムで取得できます。

```bash
kubectl get endpoints -n probes -w
```

> 出力結果の例

```bash
NAME         ENDPOINTS                                         AGE
app-config   10.1.0.178:3000                                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
```

`--field-selector metadata.name=app-target`オプションを使って、出力結果を`app-target` のみに絞り込みます。

```bash
kubectl get endpoints -n probes --field-selector metadata.name=app-target -w
```

> 出力結果の例

```bash
NAME         ENDPOINTS                                         AGE
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000                   2d11h
app-target   10.1.0.173:3000,10.1.0.174:3000,10.1.0.175:3000   2d11h
```

このままではEndpointが増減した時刻を取得できません。

そこで`-o json`オプションを使って全てのフィールドを出力し、増減した時刻を示すフィールドがあるか探してみます。

```bash
kubectl get endpoints -n probes --field-selector metadata.name=app-target -o json
```

> 出力結果の例

```json
{
    "apiVersion": "v1",
    "items": [
        {
            "apiVersion": "v1",
            "kind": "Endpoints",
            "metadata": {
                "annotations": {
                    "endpoints.kubernetes.io/last-change-trigger-time": "2022-05-19T20:55:15Z"
                },
                "creationTimestamp": "2022-05-17T09:14:41Z",
                "name": "app-target",
                "namespace": "probes",
                "resourceVersion": "918234",
                "uid": "be9b711e-91d1-4007-8300-ee9e98d609e6"
            },
            "subsets": [
                {
                    "addresses": [
                        {
                            "ip": "10.1.0.173",
                            "nodeName": "docker-desktop",
                            "targetRef": {
                                "kind": "Pod",
                                "name": "app-target-6664868868-ss8ph",
                                "namespace": "probes",
                                "resourceVersion": "917356",
                                "uid": "d5995685-276f-48e6-a8b5-8f5447aa3eee"
                            }
                        },
                        {
                            "ip": "10.1.0.174",
                            "nodeName": "docker-desktop",
                            "targetRef": {
                                "kind": "Pod",
                                "name": "app-target-6664868868-m9f8m",
                                "namespace": "probes",
                                "resourceVersion": "917414",
                                "uid": "c2cf39e2-f39c-4f27-8df5-996edef1a485"
                            }
                        }
                    ],
                    "notReadyAddresses": [
                        {
                            "ip": "10.1.0.175",
                            "nodeName": "docker-desktop",
                            "targetRef": {
                                "kind": "Pod",
                                "name": "app-target-6664868868-b84vm",
                                "namespace": "probes",
                                "resourceVersion": "918233",
                                "uid": "f1452d1d-9619-40b0-b193-8f05af887d25"
                            }
                        }
                    ],
                    "ports": [
                        {
                            "port": 3000,
                            "protocol": "TCP"
                        }
                    ]
                }
            ]
        }
    ],
    "kind": "List",
    "metadata": {
        "resourceVersion": "",
        "selfLink": ""
    }
}
```

すると`items[*].metadata.annotations."endpoints.kubernetes.io/last-change-trigger-time"`という項目が見つかります。

`-o custom-columns=...`オプションを使って、この項目を出力するようにコマンドを改変します。

> IPアドレス群のカラムも併せて出力します。

```bash
kubectl get endpoints -n probes --field-selector metadata.name=app-target -o custom-columns="UPDATED:metadata.annotations['endpoints\.kubernetes\.io/last-change-trigger-time'],ENDPOINTS_IP:subsets[*].addresses[*].ip"
```

> 出力結果の例

```
UPDATED                ENDPOINTS_IP
2022-05-19T21:01:45Z   10.1.0.173,10.1.0.174
```

あとは再び`-w`オプションを追加すれば、時刻も含めた形式でリアルタイムで増減を取得できるコマンドになります。

```bash
kubectl get endpoints -n probes --field-selector metadata.name=app-target -o custom-columns="UPDATED:metadata.annotations['endpoints\.kubernetes\.io/last-change-trigger-time'],ENDPOINTS_IP:subsets[*].addresses[*].ip" -w
```
