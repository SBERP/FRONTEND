App.controller('DashboardController', ['$rootScope','$scope', '$filter','colors', 'flotOptions','apiPath','apiCall','apiResponse','apiDateFormate','fetchArrayService','clientFactory','$modal','toaster','ngTableParams', function($rootScope,$scope,$filter, colors, flotOptions,apiPath,apiCall,apiResponse,apiDateFormate,fetchArrayService,clientFactory,$modal,toaster,ngTableParams) {
  'use strict';
  // KNOB Charts
  // ----------------------------------- 
  var vm = this;
  var data=[];
  $scope.knobLoaderData1 = 75;
  $scope.knobLoaderOptions1 = {
      width: '80%', // responsive
      displayInput: true,
      inputColor : colors.byName('gray-dark'),
      fgColor: colors.byName('info'),
      bgColor: colors.byName('inverse'),
      readOnly : true,
      lineCap : 'round',
      thickness : 0.1
    };

  $scope.knobLoaderData2 = 50;
  $scope.knobLoaderOptions2 = {
      width: '80%', // responsive
      displayInput: true,
      fgColor: colors.byName('inverse'),
      readOnly : true,
      lineCap : 'round',
      thickness : 0.1
    };
    
    // $scope.remainingPayment=[];
  // $scope.remainingPayment = $rootScope.remainingPaymentData; 

  // Dashboard charts
  // ----------------------------------- 

  // Spline chart
  $scope.splineChartOpts = angular.extend({}, flotOptions['spline'], { yaxis: {max: 115} });
  $scope.areaSplineSeries = [true, true];
  // Line chart
  $scope.chartOpts = angular.extend({}, flotOptions['default'], {
    points: {
      show: true,
      radius: 1
    },
    series: {
      lines: {
        show: true,
        fill: 1,
        fillColor: { colors: [ { opacity: 0.4 }, { opacity: 0.4 } ] }
      }
    },
    yaxis: {max: 50}
  });
  $scope.lineChartSeries = [false, true, true];


  // Sparkline
  // ----------------------------------- 
  
  $scope.sparkValues = [2,3,4,6,6,5,6,7,8,9,10];
  $scope.sparkOptions = {
    barColor:      colors.byName('gray'),
    height:        50,
    barWidth:      10,
    barSpacing:    4,
    chartRangeMin: 0
  };

  function dayCheck(date) {
  var thisYear = moment().year();
  var mom = moment(date).year(thisYear);
  return mom.calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    sameElse: 'DD/MM/YYYY'
  });
}

  //$scope.todayDate = moment(new Date).format('DD MMM');
  /** Client BirthDate Code **/

    var headerSearch = {};
    headerSearch.operation = 'birthDate';
    apiCall.getCallHeader(apiPath.getAllClient,headerSearch).then(function(response){
          if(angular.isArray(response)){
            $scope.filtredClientBirthData = response;
          }
    });

     var headerSearchAnniv = {};
    headerSearchAnniv.operation = 'anniversaryDate';
    apiCall.getCallHeader(apiPath.getAllClient,headerSearchAnniv).then(function(response){
          if(angular.isArray(response)){
            $scope.filtredClientAnnivData = response;
          }
    });
  /** End **/

  /** Email/SMS Popup **/
    var Modalopened = false;
    
    $scope.emailSmsPopup = function(size,tab,dateType,clientData = 'all')
    {
      toaster.clear();
      console.log("Cient data",clientData);
      if(clientData != 'all')
      {
        var clientModalData = [];
        clientModalData.push(clientData);
      }
      else
      {
        if(dateType == 'birthDate')
        {
          if(!angular.isArray($scope.filtredClientBirthData)){
            toaster.pop('info','No one Client has Birthday');
            return;
         }
        }
        else{
          if(!angular.isArray($scope.filtredClientAnnivData)){
            toaster.pop('info','No one Client has Anniversary');
             return;
         }
        }
      }
      
      if (Modalopened) return;
      
       toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
    
      var modalInstance = $modal.open({
        templateUrl: 'app/views/PopupModal/CRM/emailSms.html',
        controller: emailSmsModalController,
        resolve:{
          clientArrayData: function()
          {
            if(clientData == 'all')
            {
              if(dateType == 'birthDate'){
               return $scope.filtredClientBirthData;
              }
              else{
                 return $scope.filtredClientAnnivData;
              }
            }
            else{
              return clientModalData;
            }
           
          },
          emailSMS: function(){
            return tab;
          }
        }
      });

      Modalopened = true;
       
      modalInstance.opened.then(function() {
        toaster.clear();
      });
    
        modalInstance.result.then(function (data) {
          Modalopened = false;
          if(data == 'emailSuccess'){
            toaster.pop('success','Email Successfully Send');
          }
          else if(data == 'smsSuccess'){
            setTimeout(function() {
              toaster.pop('success','SMS Successfully Send');
            }, 1000);
            
          }
        }, function () {
          console.log('Cancel');
          Modalopened = false;
        });
      
      
    }
    
  /** End **/

    function filterDataForTable(){
        var count = data.length;
        while(count--) {
            // console.log("dataaaa = ",data);
            data[count].companyName = ""; //initialization of new property 
            data[count].companyName = data[count].company.companyName;  //set the data from nested obj into new property
        }
    }

    if($scope.$storage.authUser)
    {
      apiCall.getCall(apiPath.settingOption+'/payment').then(function(response){
          data=response;
          console.log("app",data);
          filterDataForTable();
          $scope.TableData();
      });
    }

    $scope.TableData = function()
    {
        
        $scope.tableParams = new ngTableParams({
          page: 1,            // show first page
          count: 10,          // count per page
          sorting: {
            ledgerName: 'asc'     // initial sorting
          }
        }, {
           //counts: [],
          total: data.length, // length of data
          getData: function($defer, params) {
            
            var filteredData = params.filter() ?
                  $filter('filter')(data, params.filter()) :
                  data;
          var orderedData = params.sorting() ?
                  $filter('orderBy')(filteredData, params.orderBy()) :
                  data;

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          $scope.totalData = data.length;
          $scope.pageNumber = params.page();
                $scope.itemsPerPage = params.count();
                $scope.totalPages = Math.ceil($scope.totalData/params.count());
          }
        });
    }

    /** Outstanding Email/SMS Popup **/
    var Modalopened = false;
    
    $scope.outstandingEmailSmsPopup = function(size,tab,contactNo)
    {
      toaster.clear();
      // console.log("Cient data",clientData);
      if(contactNo == "")
      {
        toaster.pop('info','No contact# available for this client');
        return;
      }

      var clientModalData = [];

        clientFactory.getSetNewClientByContact(contactNo,false).then(function(response){

            if(angular.isArray(response))
            {
                clientModalData.push(response[0]);

                if (Modalopened) return;
          
               toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
            
              var modalInstance = $modal.open({
                templateUrl: 'app/views/PopupModal/CRM/emailSms.html',
                controller: emailSmsModalController,
                resolve:{
                  clientArrayData: function()
                  {
                    return clientModalData;
                  },
                  emailSMS: function(){
                    return tab;
                  }
                }
              });

              Modalopened = true;
               
              modalInstance.opened.then(function() {
                toaster.clear();
              });
            
                modalInstance.result.then(function (data) {
                    Modalopened = false;
                    if(data == 'emailSuccess'){
                        toaster.pop('success','Email Successfully Send');
                    }
                    else if(data == 'smsSuccess'){
                        setTimeout(function() {
                          toaster.pop('success','SMS Successfully Send');
                        }, 1000);
                    
                    }
                }, function () {
                    console.log('Cancel');
                    Modalopened = false;
                });

            }
            else{

            }
        });

    }
    
  /** Outstanding End **/

}]);