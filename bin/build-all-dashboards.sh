#!/bin/bash

rm -rf dist/panels/app/dashboards
mkdir -p dist/panels/app/dashboards;

for dash in src/panels/app/dashboards/*.jsonnet; do
  ./bin/build-dashboard.sh "$dash"
  if [ $? -ne 0 ]; then
    exit 1
  fi
done
