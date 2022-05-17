#!/bin/bash
cd `dirname $0`
docker image build -t kubernetes-probes-app-config .
