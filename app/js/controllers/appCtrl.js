// Application Controller
// ----------------------------------- 

App.controller('AppController',
  ['$rootScope', '$scope', '$state', '$window', '$localStorage', '$timeout', 'toggleStateService', 'colors', 'browser', 'cfpLoadingBar', '$http', 'flotOptions', 'support',
  function($rootScope, $scope, $state, $window, $localStorage, $timeout, toggle, colors, browser, cfpLoadingBar, $http, flotOptions, support) {
    "use strict";

    if(support.touch)
      $('html').addClass('touch');

    // Loading bar transition
    // ----------------------------------- 
    
    var latency;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if($('.app-container > section').length) // check if bar container exists
          latency = $timeout(function() {
            cfpLoadingBar.start();
          }, 0); // sets a latency Threshold
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        event.targetScope.$watch("$viewContentLoaded", function () {
          $timeout.cancel(latency);
          cfpLoadingBar.complete();
        });
    });

    // State Events Hooks
    // ----------------------------------- 

    // Hook not found
    $rootScope.$on('$stateNotFound',
      function(event, unfoundState, fromState, fromParams) {
          console.log(unfoundState.to); // "lazy.state"
          console.log(unfoundState.toParams); // {a:1, b:2}
          console.log(unfoundState.options); // {inherit:false} + default options
      });

    // Hook success
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
        // display new view from top
        $window.scrollTo(0, 0);
      });

    // Create your own per page title here
    $rootScope.pageTitle = function() {
      return $rootScope.app.name + ' - ' + $rootScope.app.description;
    };

    // Restore layout settings
    // ----------------------------------- 

    if( angular.isDefined($localStorage.settings) )
      $rootScope.app = $localStorage.settings;
    else
      $localStorage.settings = $rootScope.app;

    $rootScope.$watch("app.layout", function () {
      $localStorage.settings = $rootScope.app;
    }, true);

    
    // Allows to use branding color with interpolation
    // {{ colorByName('primary') }}
    $scope.colorByName = colors.byName;

    // Restore application classes state
    toggle.restoreState( $(document.body) );

    $rootScope.cancel = function($event) {
      $event.stopPropagation();
    };


}]);