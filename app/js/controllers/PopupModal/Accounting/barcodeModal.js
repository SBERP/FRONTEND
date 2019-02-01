/** Modal to add IMEI/ Serial on bill **/
App.controller('AccBarcodeModalController', AccBarcodeModalController);

function AccBarcodeModalController($scope,toaster,$modalInstance,$rootScope,apiCall,apiPath,productIndex,productData,companyId,validationMessage,apiResponse){
    'use strict';
    console.log(productData);
    $scope.ProductImeiArray = [];
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
AccBarcodeModalController.$inject = ["$scope","toaster","$modalInstance","$rootScope","apiCall","apiPath","productIndex","productData","companyId","validationMessage","apiResponse"];