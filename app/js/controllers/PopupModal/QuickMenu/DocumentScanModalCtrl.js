
App.controller('documentScanController',documentScanController);

function documentScanController($scope, $modalInstance,$rootScope,$http,apiCall,apiPath,$timeout,$state,$templateCache,$window,imageUrl) {
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
		
		ImageArray[0] = $scope.myCroppedImage;
		
		// if(DWObject.HowManyImagesInBuffer > 0){
		
			// for(var setIndex = 0;setIndex < DWObject.HowManyImagesInBuffer;setIndex++){
				
				// ImageArray[setIndex] = DWObject.GetImageURL(setIndex, 500, 500);
			// }
			
			$modalInstance.close(ImageArray);
			
		// }
		// else{
			
			// $modalInstance.dismiss(ImageArray);
		// }
		
		
		//DWObject.GetImageURL(0, 500, 500);
		//DWObject.HowManyImagesInBuffer
    };
	
	
	
	$scope.closeButton = function () {
		
		// var ImageArray = [];
		// ImageArray[0] = $scope.myImage;
		// $modalInstance.close(ImageArray);
		
		$modalInstance.dismiss('clear');
			
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
	
	
	/** Twain Code **/
//	$scope.myImage='https://raw.githubusercontent.com/CrackerakiUA/ui-cropper/master/screenshots/live.jpg';
	 $scope.myImage = imageUrl;
    $scope.myCroppedImage='';

   
    	console.log(imageUrl);

	/** End  **/
}

documentScanController.$inject = ["$scope", "$modalInstance","$rootScope","$http","apiCall","apiPath","$timeout","$state","$templateCache","$window","imageUrl"];
