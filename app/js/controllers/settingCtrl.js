
/**=========================================================
 * Module: SettingsController.js
 * Handles app setting
 =========================================================*/

App.controller('SettingsController', ["$scope", "$rootScope", "$localStorage", "language", function($scope, $rootScope, $localStorage, language) {
  'use strict';
  $scope.app = $rootScope.app;

  $scope.themes = [
    {sidebar: 'bg-inverse', brand: 'bg-info', topbar:  'bg-white'},
    {sidebar: 'bg-inverse', brand: 'bg-inverse', topbar:  'bg-white'},
    {sidebar: 'bg-inverse', brand: 'bg-purple', topbar:  'bg-white'},
    {sidebar: 'bg-inverse', brand: 'bg-success', topbar:  'bg-white'},
    {sidebar: 'bg-white br', brand: 'bg-inverse', topbar:  'bg-inverse'},
    {sidebar: 'bg-inverse', brand: 'bg-info', topbar:  'bg-info'},
    {sidebar: 'bg-white br', brand: 'bg-purple', topbar:  'bg-purple'},
    {sidebar: 'bg-white br', brand: 'bg-primary', topbar:  'bg-primary'}
  ];

  $scope.setTheme = function($idx) {
    $scope.app.theme = $scope.themes[$idx];
  };

  // Init internationalization service
  $scope.language = language.init();
  $scope.language.set = angular.bind(language,language.set);

  
}]);