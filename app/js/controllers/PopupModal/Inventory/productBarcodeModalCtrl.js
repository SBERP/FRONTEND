
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/
//$.getScript('app/vendor/ng-table/ng-table.min.js');
//$.getScript('app/vendor/ng-table/ng-table.min.css');


App.controller('productBarcodeModalCtrl',productBarcodeModalCtrl);

function productBarcodeModalCtrl($scope, $modalInstance,$rootScope,$http,apiCall,apiPath,$timeout,getSetFactory,$state,validationMessage,apiResponse,productId,productName,productColor,productSize,$sanitize) {
  'use strict';
  
	 var data = [];
	 var vm = this;
	 
	 $scope.productId = productId;
	 $scope.productName = productName;
	 $scope.productColor = productColor;
	 $scope.productSize = productSize;
	 
	
		var n = 3;

	// var pp = window.getPrintParam();

	// h	ere is the magic
	// pp.NumCopies=eval(n);

	//print();
	
	//$scope.erpPath = $rootScope.erpPath; // Erp Path
	
		$scope.stockModel=[];
 
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
	

	
	$scope.printBarcodeFun = function(){
		
		//alert($scope.productId);
		
		// var printWin = window.open('http://4.bp.blogspot.com/-J9g2UmC8cJk/UCyoyj24VMI/AAAAAAAAEDg/Q3oUk33685w/s1600/Indian+Flag+Wallpapers-03.jpg', '','left=0,top=0,width=700,height=700,status=0');

                // printWin.focus();
                // printWin.print();
		var mywindow = window.open('', 'PRINT', 'height=400,width=600');


        mywindow.document.write('<html><head><title>' + document.title  + '</title>');

        mywindow.document.write('</head><body >');
      mywindow.document.write('<h1>' + document.title  + '</h1>');
      
		  mywindow.document.write("JSCS<embed type='image/svg+xml' src='app/0603201701345291118596.svg' style='padding-left:5px;padding-top:5px'/>");
		  mywindow.document.write("JSCS<br /><embed type='image/svg+xml' src='app/0603201701345291118596.svg' style='padding-left:5px;padding-top:5px'/>");
		  mywindow.document.write("JSCS<br /><embed type='image/svg+xml' src='app/0603201701345291118596.svg' style='padding-left:5px;padding-top:5px'/>");
		  mywindow.document.write("JSCS<br /><embed type='image/svg+xml' src='app/0603201701345291118596.svg' style='padding-left:5px;padding-top:5px'/>");
		  mywindow.document.write("JSCS<br /><embed type='image/svg+xml' src='app/0603201701345291118596.svg' style='padding-left:5px;padding-top:5px'/>");
		  mywindow.document.write("JSCS<br /><embed type='image/svg+xml' src='app/0603201701345291118596.svg' style='padding-left:5px;padding-top:5px'/>");
		  mywindow.document.write("JSCS<br /><embed type='image/svg+xml' src='app/0603201701345291118596.svg' style='padding-left:5px;padding-top:5px'/>");
		 
		
		
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
		
		
        mywindow.focus(); // necessary for IE >= 10*/

		
		// var n = 3;

// var pp = this.getPrintParams();

// here is the magic
// pp.NumCopies=eval(n);

// print(pp);

       // print({ bUI: true, bSilent: true, bShrinkToFit: true, nStart: 2, nEnd: 2, });
       // $.print(mywindow);
        //self.print();
       mywindow.print();
       mywindow.close();

        return true;
	}
}

productBarcodeModalCtrl.$inject = ["$scope", "$modalInstance","$rootScope","$http","apiCall","apiPath","$timeout","getSetFactory","$state","validationMessage","apiResponse","productId","productName","productColor","productSize","$sanitize"];
