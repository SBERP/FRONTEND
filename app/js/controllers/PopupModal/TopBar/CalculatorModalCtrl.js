
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/
//$.getScript('app/vendor/ng-table/ng-table.min.js');
//$.getScript('app/views/QuickMenu/DocumentScan/Resources/dynamsoft.webtwain.initiate.js');
//$.getScript('app/views/QuickMenu/DocumentScan/Resources/dynamsoft.webtwain.config.js');


App.controller('calculatorController',calculatorController);

function calculatorController($scope, $modalInstance,$rootScope,$http,apiCall,apiPath,$timeout,$state,$templateCache,$window) {
  'use strict';
	
	// $scope.firstScript = "app/views/QuickMenu/DocumentScan/Resources/dynamsoft.webtwain.config.js?r="+Math.random();
	// $scope.randomNumber = Math.random();
	
	 var data = [];
	 var vm = this;
	
	  $scope.ok = function (msg) {
      $modalInstance.close(msg);
    };

	
	$scope.doneButton = function () {
		
		var ImageArray = [];
		
	
		$modalInstance.close(ImageArray);
		
    };
	
	$scope.closeButton = function () {
		
	
		$modalInstance.close('data');
		
		
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
	
	
	$scope.$on('$viewContentLoaded', function(){
		
	});
	

}

calculatorController.$inject = ["$scope", "$modalInstance","$rootScope","$http","apiCall","apiPath","$timeout","$state","$templateCache","$window"];
