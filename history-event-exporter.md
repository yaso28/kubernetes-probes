<!-- omit in toc -->
# event-exporter 開発履歴

※上の方が新しい履歴です。

- [customized config](#customized-config)
- [downloaded yaml files](#downloaded-yaml-files)

## customized config

- edited 01-config.yaml

## downloaded yaml files

- mkdir event-exporter
- cd event-exporter
- `curl -OL https://raw.githubusercontent.com/opsgenie/kubernetes-event-exporter/master/deploy/00-roles.yaml`
- `curl -OL https://raw.githubusercontent.com/opsgenie/kubernetes-event-exporter/master/deploy/01-config.yaml`
- `curl -OL https://raw.githubusercontent.com/opsgenie/kubernetes-event-exporter/master/deploy/02-deployment.yaml`
