
App.controller('historySalesBillModaleCtrl',historySalesBillModaleCtrl);

function historySalesBillModaleCtrl($scope, $modalInstance,$rootScope, $filter, ngTableParams,$http,$sce,$window,apiCall,apiPath,flotOptions, colors,$timeout,$state,responseData,toaster,getSetFactory,draftOrSalesOrder,apiResponse) {
  'use strict';
  	
  	$scope.filteredItems;
	 var data = [];
	 
	 $scope.erpPath = $rootScope.erpPath; //Erp Path

	$scope.responseData = responseData;
	$scope.noOfDecimalPoints = parseInt($scope.responseData[0].company.noOfDecimalPoints);
	$scope.dateFormats = $rootScope.dateFormats;
	$scope.draftOrSalesOrder = draftOrSalesOrder;
	
		$scope.stockModel=[];
 
  // $scope.stockModel.state;

    $scope.ok = function () {
      $modalInstance.close('closed');
    };
	
	$scope.closeButton = function () {

		$modalInstance.dismiss();
    };
	
    $scope.cancel = function () {
	
		$modalInstance.dismiss();
    };
	
	/**
		Page Code
	**/
		data = $scope.responseData;
		toaster.clear();

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

		  	params.multiCheckFlag = false;
			if($scope.draftOrSalesOrder===undefined)
			{
				params.multiCheckFlag = true;
			}

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
			
			$scope.filteredItems = orderedData;	
			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });
	  
 
	//Date Convert
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		return entDate; 
	}
	// Addition With parse
	$scope.parseFloatAddition = function(total,tax){
		
		return $filter('setDecimal')(parseFloat(total),$scope.noOfDecimalPoints);
	}
	
	$scope.editDataViewSales = function(singleData){
		getSetFactory.blank();
		getSetFactory.set(singleData);
		$modalInstance.close();
	}

	/**
		End
	**/
	$scope.selectedBoxArray = [];
	$scope.clientFlag=0;
	// $scope.parentCheckBox = false;

	$scope.changeBox = function(box,pData){
		
		//console.log(box+'...'+pData);
		if(box == true){
			$scope.selectedBoxArray.push(pData);
		}
		else{
			var index = $scope.selectedBoxArray.indexOf(pData);
			$scope.selectedBoxArray.splice(index,1);
		}
	}

	$scope.changeAllBox = function(box){
		// console.log("innn change all box");
		if(box == false){
			// console.log("iff");
			$scope.clientFlag=0;
			$scope.selectedBoxArray = [];
			var cnt  = data.length;
			for(var k=0;k<cnt;k++){
				data[k].selected = false;
			}
		}
		else{
			// console.log("else");
			$scope.clientFlag=1;
			$scope.selectedBoxArray = [];
			$scope.selectedBoxArray = $scope.filteredItems;
			// console.log("consoldeeeeadsada  ",$scope.selectedBoxArray);
			if(Array.isArray($scope.selectedBoxArray))
			{
				var cnt  = $scope.selectedBoxArray.length;
				for(var k=0;k<cnt;k++){
					$scope.selectedBoxArray[k].selected = true;
				}
			}
			
		}
	}

	$scope.multiPdfPrint = function()
	{
		var selectedArray = $scope.selectedBoxArray;
		var uniqueArray = selectedArray.map(function(obj) { return obj['saleId']; });
		var saleIds = uniqueArray.join(',');
		var headerData = {contentType: undefined,'saleId' : saleIds};
		apiCall.getCallHeader(apiPath.multipleBillPrint,headerData).then(function(responsePath){
			if (angular.isObject(responsePath)) {
				if(responsePath.hasOwnProperty('documentPath')) {
					var pdfPath = $scope.erpPath+responsePath.documentPath;
					$scope.directPrintPdf(pdfPath);
				}
			}
		});
	}

	$scope.directPrintPdf = function(pdfUrlPath)
	{
		/** Print **/
		 $http({
			url : pdfUrlPath,
			method : 'GET',
			headers : {
				'Content-type' : 'application/pdf'
			},
			responseType : 'arraybuffer'
		}).success(function(data, status, headers, config) {
			var pdfFile = new Blob([ data ], {
				type : 'application/pdf'
			});
			var pdfUrl = URL.createObjectURL(pdfFile);
			$scope.content = $sce.trustAsResourceUrl(pdfUrl);
			
			var printwWindow = $window.open(pdfUrl);
			printwWindow.print();
		}).error(function(data, status, headers, config) {
			alert('Sorry, something went wrong')
		});
		/** End **/
	}

	/** Set No of Product **/
	$scope.setLength = function(userProductArray){
		var jsonProductArray = angular.fromJson(userProductArray);
		return jsonProductArray.inventory.length;
	}
	/** End **/

	$scope.deleteDraft = function(uData){
		console.log("uData...",uData);

		apiCall.deleteCall(apiPath.getSetDraft+'/'+uData.saleId).then(function(resonse){
			if(resonse == apiResponse.ok){
				data.splice(uData,1);
				$scope.tableParams.reload();
			}
		});
	}
}

historySalesBillModaleCtrl.$inject = ["$scope", "$modalInstance","$rootScope", "$filter", "ngTableParams","$http","$sce","$window","apiCall","apiPath","flotOptions","colors","$timeout","$state","responseData","toaster","getSetFactory","draftOrSalesOrder","apiResponse"];
