
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/

App.controller('historyPurchaseModaleCtrl',historyPurchaseModaleCtrl);

function historyPurchaseModaleCtrl($scope, $modalInstance,$rootScope, $filter, ngTableParams,$http,apiCall,apiPath,flotOptions, colors,$timeout,getSetFactory,$state,companyId,toaster) {
  'use strict';
  
	 var data = [];
	  $scope.CompanyID = companyId;
	  
	   $scope.displayCompany = $scope.CompanyID.companyName;
	  
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
	
	/**
		Page Code
	**/
	
		// An array of boolean to tell the directive which series we want to show
		// $scope.areaSeries = [true, true];
		// $scope.chartAreaFlotChart  = flotOptions['area'];
		// $scope.chartPieFlotChart  = flotOptions['pie'];
		$scope.init = function(){
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
			 var getJrnlPath = apiPath.getLedgerJrnl+$scope.CompanyID.companyId;
	  
	  //console.log(getJrnlPath);
		var headerData = {'Content-Type': undefined,'type':'purchase'};
	   
			
		apiCall.getCallHeader(getJrnlPath,headerData).then(function(response){
			// console.log(response);
			// data = response;
			
			// for (var i = 0; i < data.length; i++) {
			  // data[i].cityName = ""; //initialization of new property 
			  // data[i].cityName = data[i].city.cityName;  //set the data from nested obj into new property
			// }
			
			$scope.contents = response;
			
			$scope.contents.sort(function(a, b){
				var entDate = a.entryDate.split("-").reverse().join("-");
				var toDate = b.entryDate.split("-").reverse().join("-");
				var dateA=new Date(entDate), dateB=new Date(toDate);
				return dateB-dateA; 
			});
					
			data = $scope.contents;
			
			
			 $scope.TableData();
				toaster.clear();
		});
			
		}
		
	$scope.init();
	
  $scope.TableData = function(){
	

	  $scope.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  date: 'desc'     // initial sorting
		  }
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			  
			   var orderedData;

			if(params.sorting().date === 'asc'){

			  data.sort(function (a, b) {
				  
			 var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						
				return dateA - dateB; //sort by date descending
			  });
			  orderedData = data;

			} else if(params.sorting().date === 'desc') {

			  data.sort(function (a, b) {
				  
				 var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
				return dateB - dateA; //sort by date descending
			  });
			  orderedData = data;

			} else if(!params.sorting().date){

			  if (params.filter().term) {
				orderedData = params.filter() ? $filter('filter')(data, params.filter().term) : data;
			  } else {
				orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
			  }
			  
			}

			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			
			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });
	  
  }
	/**
		End
	**/
}

historyPurchaseModaleCtrl.$inject = ["$scope", "$modalInstance","$rootScope", "$filter", "ngTableParams","$http","apiCall","apiPath","flotOptions","colors","$timeout","getSetFactory","$state","companyId","toaster"];
