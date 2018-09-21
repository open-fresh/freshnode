import { loadPluginCss } from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/freshtracks-app/css/theme.css',
  light: 'plugins/freshtracks-app/css/theme.css'
});

export default class InstallCtrl {
  static templateUrl = 'partials/install.html'; // eslint-disable-line no-undef

  /** @ngInject */
  constructor($scope, $injector, backendSrv, contextSrv) {
    this.isOrgEditor = contextSrv.hasRole('Editor') || contextSrv.hasRole('Admin');
    this.navModel = false;
    document.title = 'Grafana FreshTracks App';

    $scope.showAdvancedSettings = false;
    $scope.toggleAdvancedSettings = function () {
      $scope.showAdvancedSettings = !$scope.showAdvancedSettings;
    };

    $scope.k8sOptions = [
      { key: 'kubernetes', value: 'Vanilla Kubernetes' },
      { key: 'openshift', value: 'OpenShift' },
    ];

    $scope.clusterDefaults = {
      requests: {
        cpu: 0.5,
        memory: 1
      },
      limits: {
        cpu: 1,
        memory: 2
      },
    };

    $scope.cluster = JSON.parse(JSON.stringify($scope.clusterDefaults));

    $scope.tabs = { Helm: true, Curl: false };
    $scope.selectTab = function (selectedTab) {
      Object.keys($scope.tabs).forEach((tab) => {
        if (tab === selectedTab) {
          $scope.tabs[tab] = true;
        } else {
          $scope.tabs[tab] = false;
        }
      });
    };

    $scope.installInstructions = {
      Helm: [],
      Curl: []
    };
    $scope.generateInstallInstructions = function () {
      return $scope.getApiToken().then((token) => {
        const showFlavorOption = ($scope.cluster.flavor !== 'kubernetes');
        const curlFlavor = (showFlavorOption? `&k8s-flavor=${$scope.cluster.flavor}` :'');
        const helmFlavor = (showFlavorOption? ` --set K8sFlavor=${$scope.cluster.flavor}` :'');

        let curlReqLim = '';
        let helmReqLim = '';
        Object.keys($scope.clusterDefaults).forEach((prop) => {
          Object.keys($scope.clusterDefaults[prop]).forEach((resource) => {
            const defaultValue = $scope.clusterDefaults[prop][resource];
            const units = (resource === 'memory')? 'Gi' : '';
            if ($scope.cluster[prop][resource] !== defaultValue) {
              curlReqLim += `&resources.${prop}.${resource}=${$scope.cluster[prop][resource]}${units}`;
              helmReqLim += ` --set Resources.${prop[0].toUpperCase()+prop.slice(1)}.${resource[0].toUpperCase()+resource.slice(1)}=${$scope.cluster[prop][resource]}${units}`;
            }
          });
        });

        return {
          Helm: [
            "helm repo add freshtracks 'https://raw.githubusercontent.com/Fresh-Tracks/chart-repo/master/stable'",
            'helm repo update',
            `helm install freshtracks/freshtracks-agent --name freshtracks --namespace freshtracks --set ClusterName=${$scope.cluster.name} --set APIToken=${token}${helmReqLim}${helmFlavor}`
          ],
          Curl: [
            `curl 'https://api.freshtracks.io/install/v1/yaml?clusterName=${$scope.cluster.name}${curlFlavor}${curlReqLim}' -H 'Authorization: Bearer ${token}' | kubectl apply -f -`
          ]
        };
      });
    };

    $scope.getApiToken = function () {
      let apiToken = '<API TOKEN>';
      return backendSrv.get('api/datasources/')
        .then((sources) => {
          const ftDs = sources.filter(ds => ds.name === 'Freshtracks');
          if (ftDs.length === 1) {
            let jsonData = ftDs[0].jsonData;
            if (typeof jsonData === 'string' || jsonData instanceof String) {
              jsonData = JSON.parse(jsonData);
            }
            apiToken = jsonData.apiToken;
          }
          return apiToken;
        }).catch(() => {
          return apiToken;
        });
    };

    $scope.showCommands = false;
    $scope.generateCommands = function (formData) {
      if (formData.$valid) {
        $scope.generateInstallInstructions().then((newInstructions) => {
          Object.keys($scope.installInstructions).forEach((method) => {
            $scope.installInstructions[method] = newInstructions[method];
          });
          $scope.showCommands = true;
        });
      }
    };
  }
}
