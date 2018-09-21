#!/bin/bash

jq '{overwrite: true, dashboard: .} | del(.dashboard["id"])' $1 | \
curl -s -XPOST -H "Content-type: application/json" "http://admin:secret@localhost:3000/api/dashboards/db" -d @-
