
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/

App.controller('InvStockModalController', ["$scope", "$modal", "$log","$rootScope", function ($scope, $modal, $log,$rootScope) {
  'use strict';
  
  $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: '/myModalContent.html',
      controller: ModalInstanceCtrl,
      size: size
    });

    var state = $('#modal-state');
    modalInstance.result.then(function () {
      state.text('Modal dismissed with OK status');
    }, function () {
      state.text('Modal dismissed with Cancel status');
    });
  };

  // Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $modal service used above.

  var ModalInstanceCtrl = function ($scope, $modalInstance,$rootScope) {
	  
		$scope.stockModel=[];
			
	  $scope.states = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ];
 
  if($rootScope.ArraystockModel)
		{
			$scope.stockModel.state=$rootScope.ArraystockModel.state;
			$scope.stockModel.state2=$rootScope.ArraystockModel.state2;
			$scope.stockModel.state3=$rootScope.ArraystockModel.state3;
		}
  // $scope.stockModel.state;

    $scope.ok = function () {
      $modalInstance.close('closed');
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
	
	
  };
  ModalInstanceCtrl.$inject = ["$scope", "$modalInstance","$rootScope"];

}]);
