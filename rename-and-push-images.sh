#!/bin/bash

set -e -o pipefail
cd `dirname $0`

# 引数チェック

if [ $# -ne 2 ]; then
  echo "引数を2つ指定してください。（リポジトリ名、タグ名）" 1>&2
  exit 1
fi

# Dockerイメージをリネーム

docker image tag kubernetes-probes-app-config $1/kubernetes-probes-app-config:$2
echo "renamed kubernetes-probes-app-config to $1/kubernetes-probes-app-config:$2"

docker image tag kubernetes-probes-app-target $1/kubernetes-probes-app-target:$2
echo "renamed kubernetes-probes-app-target to $1/kubernetes-probes-app-target:$2"

# Kustomizeのremote-imagesにリネーム後のDockerイメージを反映
cd kustomize/components/remote-image
cp kustomization.yaml.org kustomization.yaml
kustomize edit set image kubernetes-probes-app-config=$1/kubernetes-probes-app-config:$2
kustomize edit set image kubernetes-probes-app-target=$1/kubernetes-probes-app-target:$2
echo "updated kustomize/components/remote-image/kustomization.yaml"

# リネームしたDockerイメージをリポジトリにpush

docker image push $1/kubernetes-probes-app-config:$2
echo "pushed $1/kubernetes-probes-app-config:$2"

docker image push $1/kubernetes-probes-app-target:$2
echo "pushed $1/kubernetes-probes-app-target:$2"
