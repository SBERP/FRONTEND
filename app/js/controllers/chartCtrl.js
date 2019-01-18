
/**=========================================================
 * Module: ChartsController.js
 * Initializes the flot chart plugin and attaches the 
 * plugin to elements according to its type
 =========================================================*/

App.controller('ChartsController', ['$scope', '$http', '$timeout', 'flotOptions', 'colors', function($scope, $http, $timeout, flotOptions, colors) {
  'use strict';

  // An array of boolean to tell the directive which series we want to show
  $scope.areaSeries = [true, true, true];
  $scope.chartAreaFlotChart       = flotOptions['area'];
  // The array should contain the same number of element as series
  $scope.areaSplineSeries = [true, true];
  $scope.chartSplineFlotChart     = flotOptions['spline'];
  // Create more array to target the sate of different series (lines, point, splines, etc)
  $scope.lineSeriesPoints = [true, true, true];
  $scope.lineSeriesLines  = [true, true, true];
  $scope.chartLineFlotChart       = angular.extend({}, flotOptions['line'], { yaxis: { max: 60 }});

  // Set directly our global configuration
  $scope.chartBarFlotChart        = flotOptions['bar'];
  $scope.chartBarStackedFlotChart = flotOptions['bar-stacked'];
  $scope.chartPieFlotChart        = flotOptions['pie'];
  $scope.chartDonutFlotChart      = flotOptions['donut'];

  $scope.$on('plotReady', function(e, plot){
    // You can do here:
    //  plot                           Flot chart object
    //  plot.getData()                 REturns the dataset processed by the plugin
    //  plot.getPlaceholder()          The inner div where the chart is placed
    //  plot.getPlaceholder().parent() The <flot> element
  
  });

  // KNOB Charts
  // ----------------------------------- 

  $scope.knobLoaderData1 = 100;
  $scope.knobLoaderOptions1 = {
      width: '100%', // responsive
      displayInput: true,
      fgColor: colors.byName('primary')
    };

  $scope.knobLoaderData2 = 50;
  $scope.knobLoaderOptions2 = {
      width: '80%', // responsive
      displayInput: true,
      fgColor: colors.byName('success'),
      readOnly : true,
      lineCap : 'round'
    };

  $scope.knobLoaderData3 = 37;
  $scope.knobLoaderOptions3 = {
      width: '50%', // responsive
      displayInput: true,
      fgColor: colors.byName('purple'),
      displayPrevious : true,
      thickness : 0.1
    };

  $scope.knobLoaderData4 = 60;
  $scope.knobLoaderOptions4 = {
      width: '20%', // responsive
      displayInput: true,
      fgColor: colors.byName('danger'),
      bgColor: colors.byName('warning')
    };


  // Setup realtime update
  // ----------------------------------- 

  $scope.realTimeChartOpts = angular.extend({}, flotOptions['default'], {
    series: {
      lines: { show: true, fill: true, fillColor:  { colors: ["#00b4ff", "#1d93d9"] } },
      shadowSize: 0 // Drawing is faster without shadows
    },
    yaxis: {
      min: 0,
      max: 130
    },
    xaxis: {
      show: false
    },
    colors: ["#1d93d9"]
  });

  $scope.realTimeChartUpdateInterval = 30;

  var data = [],
      totalPoints = 300;
    
  update();

  function getRandomData() {
    if (data.length > 0)
      data = data.slice(1);
    // Do a random walk
    while (data.length < totalPoints) {
      var prev = data.length > 0 ? data[data.length - 1] : 50,
        y = prev + Math.random() * 10 - 5;
      if (y < 0) {
        y = 0;
      } else if (y > 100) {
        y = 100;
      }
      data.push(y);
    }
    // Zip the generated y values with the x values
    var res = [];
    for (var i = 0; i < data.length; ++i) {
      res.push([i, data[i]]);
    }
    return [res];
  }
  function update() {
    $scope.realTimeChartData = getRandomData();
    $timeout(update, $scope.realTimeChartUpdateInterval);
  }


}]);