#!/bin/bash

dash=$1
dest="${dash//src/dist}"
dest="${dest//jsonnet/json}"
jsonnet -J src/panels/app/dashboards/lib/grafonnet-lib/2018-06-06  -J src/panels/app/dashboards/lib/freshtracks-lib "${dash}" > "${dest}"
echo "${dest}"
