/** Modal to add IMEI/ Serial on bill **/
App.controller('AccItemizeStockModalController', AccItemizeStockModalController);

function AccItemizeStockModalController($scope,toaster,$modalInstance,stockType,$filter,ngTableParams,$rootScope,apiCall,apiPath,productId,validationMessage,apiResponse){
    'use strict';
    var vm = this;
    var data = [];
    var orderedData = [];
    vm.users = [];
    if (stockType == 'stockSummary') {
      apiCall.getCall(apiPath.getItemizeStockSummary+productId).then(function(response){
          data = $filter('filter')(response,function(item){
                return parseFloat(item.stock) != 0;
            });
          $scope.TableData();
      });
    }else if (stockType == 'stockBalance') {
        var jsuggestPath = apiPath.getItemizeStockSummary+productId.productId;
        var headerCr = {'Content-Type': undefined,'toDate':productId.toDate,'fromDate':productId.fromDate};
        apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response){
           data = $filter('filter')(response,function(item){
                  return parseFloat(item.stock) != 0 && item.jfId == productId.jfId;
              });
            $scope.TableData();
        });
    }else if (stockType == 'stockRegister') {
      var jsuggestPath = apiPath.getItemizeStockRegister+productId.productId;
      var headerCr = {'Content-Type': undefined,'jfId':productId.jfId};
      apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response){
         data = $filter('filter')(response,function(item){
                return parseFloat(item.stock) != 0;
            });
          $scope.TableData();
      });
    }
    $scope.TableData = function(){
        
      vm.tableParams = new ngTableParams({
          page: 1,
          count: 10,
          sorting: {
              imeiNo: 'asc'
          },
          filter: {
              imeiNo: '',
              barcodeNo: '',
              qty: ''
            }
        }, {
          total: data.length,
          getData: function($defer, params) {
              orderedData = data;
              orderedData = params.filter() ?
                     $filter('filter')(data, params.filter()) :
                     data;
              vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
              params.total(orderedData.length);
              $defer.resolve(vm.users);
          }
      });
    }
    $scope.ok = function () {
        $modalInstance.close('close');
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('close');
    };
}
AccItemizeStockModalController.$inject = ["$scope","toaster","$modalInstance","stockType","$filter","ngTableParams","$rootScope","apiCall","apiPath","productId","validationMessage","apiResponse"];