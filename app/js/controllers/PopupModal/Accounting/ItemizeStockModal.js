/** Modal to add IMEI/ Serial on bill **/
App.controller('AccItemizeStockModalController', AccItemizeStockModalController);

function AccItemizeStockModalController($scope,toaster,$modalInstance,$filter,ngTableParams,$rootScope,apiCall,apiPath,productId,validationMessage,apiResponse){
    'use strict';
    var vm = this;
    var data = [];
    var orderedData = [];
    vm.users = [];
    apiCall.getCall(apiPath.getItemizeStockSummary+productId).then(function(response){
        data = response;
        $scope.TableData();
    });
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
              orderedData = params.filter() ?
                     $filter('filter')(data, params.filter()) :
                     data;
              vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
            
              params.total(orderedData.length);
              $defer.resolve(vm.users);
          }
      });
    }
    $scope.totalQty = function(){
        var total = 0;
        var count = data.length;
        for(var i = 0; i < count; i++)
        {
            total += parseFloat(data[i].stock);
        }
        return isNaN(total) ? 0 : total;
    }
    $scope.visibleQty = function(){
        var total = 0;
        var count = vm.users.length;
        for(var i = 0; i < count; i++)
        {
            total += parseFloat(vm.users[i].stock);
        }
        return isNaN(total) ? 0 : total;
    }
    $scope.filteredQty = function(){
        var total = 0;
        var count = orderedData.length;
        for(var i = 0; i < count; i++)
        {
            total += parseFloat(orderedData[i].stock);
        }
        return isNaN(total) ? 0 : total;
    }
    $scope.parsedStock = function(qty){
        return parseInt(qty);
    }
    $scope.ok = function () {
        $modalInstance.close('close');
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('close');
    };
}
AccItemizeStockModalController.$inject = ["$scope","toaster","$modalInstance","$filter","ngTableParams","$rootScope","apiCall","apiPath","productId","validationMessage","apiResponse"];