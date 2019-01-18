
/**=========================================================
 * Module: AccLedgerModalController.js
 * Controller for input components
 =========================================================*/

App.controller('AccBalanceSheetModalController', AccBalanceSheetModalController);

function AccBalanceSheetModalController($scope, $modalInstance,$rootScope,ledgerGroupData,ledgerGroupType,getSetFactory,$state,noOfDecimalPoints,totalDebitorCreditor) {
  'use strict';
  
	var formdata = new FormData();
	
	
	$scope.ledgerGroupData = ledgerGroupData;
	$scope.ledgerGroupType = ledgerGroupType;
	$scope.noOfDecimalPoints = noOfDecimalPoints;
	$scope.totalDebitorCreditor = totalDebitorCreditor;
	
	$scope.goToLedgerTransaction = function(ledgerId){
		
		$modalInstance.close();
		
		//alert(ledgerId);
		
		getSetFactory.set(ledgerId);
		
		$state.go("app.AccDataLedger");
		
	  
	}
	
    $scope.cancel = function () {
	
	//$modalInstance.close(filterArray);
	
		if($scope.stockModel)
		 {
			$rootScope.ArraystockModel=[];
			$rootScope.ArraystockModel.state=$scope.stockModel.state;
			$rootScope.ArraystockModel.state2=$scope.stockModel.state2;
			$rootScope.ArraystockModel.state3=$scope.stockModel.state3;
		 }
		$modalInstance.dismiss('qwerty');
    };
	
  
}
AccBalanceSheetModalController.$inject = ["$scope", "$modalInstance","$rootScope","ledgerGroupData","ledgerGroupType","getSetFactory","$state","noOfDecimalPoints","totalDebitorCreditor"];