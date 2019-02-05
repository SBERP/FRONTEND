/** Modal to add IMEI/ Serial on bill **/
App.controller('AccItemizeStockModalController', AccItemizeStockModalController);

function AccItemizeStockModalController($scope,toaster,$modalInstance,ngTableParams,$rootScope,apiCall,apiPath,productId,validationMessage,apiResponse){
    'use strict';
    var vm = this;
    $scope.ProductImeiArray = [];

    apiCall.getCall(apiPath.getItemizeStockSummary+productId).then(function(response){
        $scope.ProductImeiArray = response;
    });
    // vm.tableParams = new ngTableParams({
    //       page: 1,            // show first page
    //       count: 10,          // count per page
    //       sorting: {
    //           name: 'asc'     // initial sorting
    //       }
    //     }, {
    //         total: data.length, // length of data
    //         getData: function($defer, params) {
    //             // use build-in angular filter
    //             var orderedData = params.sorting() ?
    //                   $filter('orderBy')(data, params.orderBy()) :
    //                       data;
          
    //               $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
    //           }
    //   });
    $scope.totalQty = function(){
        var total = 0;
        var count = $scope.ProductImeiArray.length;
        for(var i = 0; i < count; i++)
        {
            total += parseFloat($scope.ProductImeiArray[i].stock);
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
AccItemizeStockModalController.$inject = ["$scope","toaster","$modalInstance","ngTableParams","$rootScope","apiCall","apiPath","productId","validationMessage","apiResponse"];