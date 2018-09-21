#!/bin/bash

fswatch -r ./src/panels/app/dashboards | xargs -I {} ./bin/build-dashboard.sh {} | xargs -I {} ./bin/post-dashboard.sh {}
