/** Modal to add IMEI/ Serial on bill **/
App.controller('AccBarcodeModalController', AccBarcodeModalController);

function AccBarcodeModalController($scope,toaster,$modalInstance,$rootScope,$filter,apiCall,apiPath,productIndex,productData,companyId,transactionType,validationMessage,apiResponse){
    'use strict';
    $scope.ProductImeiArray = [];
    $scope.typeAheadData = [];
    var data = [];
    apiCall.getCall(apiPath.getItemizeStockSummary+productData.productId).then(function(response){
        data = response;
        $scope.getProductData();
    });


    // Filter IMEI numbers stockwise
    $scope.getProductData = function(){
        if (transactionType == 'sales') {
            $scope.typeAheadData = $filter('filter')(data, function(item){
                return parseFloat(item.stock) > 0;
            });
        }
        else if (transactionType == 'purchase') {
            $scope.typeAheadData = $filter('filter')(data, function(item){
                return parseFloat(item.stock) < 0;
            });
        }
    }
    $scope.itemizeTreeIcon = function(){
        if (1 == $scope.openedItemizeTree) {
            return 'fa-minus-circle';
        }else{
            return 'fa-plus-circle';
        }
    }
    $scope.openedItemizeTreeClass = function(){
        if (1 == $scope.openedItemizeTree) {
            return '';
        }else{
            return 'hidden';
        }
    }
    $scope.expandItemizeTree = function(){
        if (1 == $scope.openedItemizeTree) {
            $scope.openedItemizeTree = 0;
        }else{
            $scope.openedItemizeTree = 1;
        }
    }
    $scope.setProductData = function(item,index){
        $scope.ProductImeiArray[index].barcode_no = item.barcodeNo;
    }
    $scope.addRow = function(){
        var newInputLine = {
            "imei_no" : '',
            "barcode_no" : '',
            "qty": '1'
        };
        var plusOne = $scope.ProductImeiArray.length;
        $scope.ProductImeiArray.splice(plusOne,0,newInputLine);
    }
    $scope.deleteRow = function(index){
        $scope.ProductImeiArray.splice(index,1);
    }
    if (angular.isDefined(productData.itemizeDetail) && angular.isArray(productData.itemizeDetail)) {
        $scope.ProductImeiArray = angular.copy(productData.itemizeDetail);
    }
    if ($scope.ProductImeiArray.length == 0) {
        $scope.addRow();
    }
    $scope.totalQty = function(){
        var total = 0;
        var count = $scope.ProductImeiArray.length;
        for(var i = 0; i < count; i++)
        {
            total += parseInt($scope.ProductImeiArray[i].qty);
        }
        return isNaN(total) ? 0 : total;
    }

    $scope.ok = function () {
        $modalInstance.close($scope.ProductImeiArray);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('close');
    };
}
AccBarcodeModalController.$inject = ["$scope","toaster","$modalInstance","$rootScope","$filter","apiCall","apiPath","productIndex","productData","companyId","transactionType","validationMessage","apiResponse"];