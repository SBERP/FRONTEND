
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/
//$.getScript('app/vendor/ng-table/ng-table.min.js');
//$.getScript('app/vendor/ng-table/ng-table.min.css');


App.controller('deleteDataModalController',deleteDataModalController);

function deleteDataModalController($scope, $modalInstance,$rootScope,$http,apiCall,apiPath,$timeout) {
  'use strict';
  
	 var data = [];
	 var vm = this;
	
	
	
	
		$scope.stockModel=[];
 
	if($rootScope.ArraystockModel)
	{
		$scope.stockModel.state=$rootScope.ArraystockModel.state;
		$scope.stockModel.state2=$rootScope.ArraystockModel.state2;
		$scope.stockModel.state3=$rootScope.ArraystockModel.state3;
	}
  // $scope.stockModel.state;

    $scope.ok = function () {
      $modalInstance.close('ok');
    };
	
	$scope.closeButton = function () {

		$modalInstance.dismiss();
    };
	
    $scope.cancel = function () {
	
		if($scope.stockModel)
		 {
			$rootScope.ArraystockModel=[];
			$rootScope.ArraystockModel.state=$scope.stockModel.state;
			$rootScope.ArraystockModel.state2=$scope.stockModel.state2;
			$rootScope.ArraystockModel.state3=$scope.stockModel.state3;
		 }
		$modalInstance.dismiss();
    };
	
	
	
}

deleteDataModalController.$inject = ["$scope", "$modalInstance","$rootScope","$http","apiCall","apiPath","$timeout"];
