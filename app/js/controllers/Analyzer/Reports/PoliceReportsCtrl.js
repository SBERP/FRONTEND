
/**=========================================================
 * Module: AccTaxationController.js
 * Controller for ngTables
 =========================================================*/

App.controller('PoliceReportController', PoliceReportController);

function PoliceReportController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,apiResponse,toaster,getSetFactory,$window,headerType,$modal) {
  'use strict';
  var vm = this;
	//$scope.brandradio="";
	
	var erpPath = $rootScope.erpPath;
	$scope.dateFormat =  $rootScope.dateFormats; //Date Format
	console.log('Police');
  var data = [];
	var flag = 0;
	
	$scope.headerType = headerType;
	
	$scope.filterCompanyId = $rootScope.accView.companyId;
	$scope.displayfromDate = $rootScope.accView.fromDate;
	$scope.displaytoDate = $rootScope.accView.toDate;
	
	
	
	/** Display Company and date **/
		apiCall.getCall(apiPath.getAllCompany+'/'+$scope.filterCompanyId).then(function(res){
			
			$scope.displayCompany = res.companyName;
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
			
		});
		
	/** End **/
	
	
	// console.log($scope.filterCompanyId);
	// console.log($scope.displayfromDate);
	// console.log($scope.displaytoDate);
	
	//return false;
	
	/** Api Call And NgTable **/
	
		$scope.getProduct = function(path,headerData){
		
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
				
			apiCall.getCallHeader(path,headerData).then(function(response){
				
				toaster.clear();
				console.log(response);
				if(apiResponse.noContent == response || apiResponse.notFound == response){
						
					data = [];
					toaster.pop('alert', 'Opps!!', 'No Data Available');
					$scope.exportPdfHidden = false;
					
				}
				else{
					//console.log('else');
					data = response;
					
					var cnt = data.length;
					
					for(var p=0;p<cnt;p++){
						
						data[p].imageIcon = false;
						
						var fileCnt = data[p].file.length;
						
						var imageFlag = 0;
						
						for(var k=0;k<fileCnt;k++){
							
							if(data[p].file[k].documentFormat == 'jpg' || data[p].file[k].documentFormat == 'jpeg' || data[p].file[k].documentFormat == 'png' || data[p].file[k].documentFormat == 'bmp' || data[p].file[k].documentFormat == 'JPG' || data[p].file[k].documentFormat == 'JPEG' || data[p].file[k].documentFormat == 'PNG' || data[p].file[k].documentFormat == 'BMP'){
								
								imageFlag = 1;
							}
						}
						
						if(imageFlag == 1){
							
							data[p].imageIcon = true;
							
						}

					}
					
					$scope.billData = data;
					$scope.contents = data;
					
					
					$scope.contents.sort(function(a, b){
						var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						return dateB-dateA; 
					});
					
					data= $scope.contents;
					
					
						$scope.exportPdfHidden = true;
					
				}
				
				$scope.TableData();
				
				 
			});
		}
		
		$scope.TableData = function()
		{
			 
		  vm.tableParams = new ngTableParams({
			  page: 1,            // show first page
			  count: 10,          // count per page
			  sorting: {
				  date: 'desc'     // initial sorting
			  }
		  }, {
			  //counts: [],
			  total: data.length, // length of data
			  getData: function($defer, params) {
				  
				   var orderedData;

			if(params.sorting().date === 'asc'){

			  data.sort(function (a, b) {
				  
				  var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						
				//var dateA = new Date(a.date), dateB = new Date(b.date);
				return dateA - dateB; //sort by date descending
			  });
			  orderedData = data;

			} else if(params.sorting().date === 'desc') {

			  data.sort(function (a, b) {
				  var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						
				//var dateA = new Date(a.date), dateB = new Date(b.date);
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
			
				$scope.totalData = data.length;
				$scope.pageNumber = params.page();
				$scope.itemsPerPage = params.count();
				$scope.totalPages = Math.ceil($scope.totalData/params.count());
				
				  }
		  });
		}
		
	/** End **/
	var headerData = {'Content-Type': undefined,'fromDate':$scope.displayfromDate,'toDate':$scope.displaytoDate};
	var getJrnlPath;
	if($scope.headerType == 'PoliceReport'){
		
		getJrnlPath = apiPath.policeReport+$scope.filterCompanyId;
		//console.log(getJrnlPath);
		
		
		$scope.getProduct(getJrnlPath,headerData);
	}
	
  
  
	//Date Convert
	
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		
		return entDate; 
	}
	
	$scope.returnSingleData = function(saleId){
		
		var tempObject = {};
		
		for(var i=0;i<$scope.billData.length;i++){
			
			var billdata = $scope.billData[i];
			if(billdata.saleId == saleId){
				
				tempObject = billdata;
			}
			
		}
		
		return tempObject;
	}
	
	
  /*** Pdf ***/
	
		$scope.generatePdf = function(operation){
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', operation.toUpperCase()+' Loading...');
			var getData = {"Content-Type": undefined,'fromDate':$scope.displayfromDate,'toDate':$scope.displaytoDate};
			getData.operation = operation;
			
			apiCall.getCallHeader(getJrnlPath,getData).then(function(responseDrop){
			
				//console.log(responseDrop);
				toaster.clear();
				
				if(angular.isObject(responseDrop)  && responseDrop.hasOwnProperty('documentPath')){
				
					var pdfPath = erpPath+responseDrop.documentPath;
					
					$window.open(pdfPath,"_blank");
					
				}
				else{
					
					if(responseDrop.status == 500){
						
						toaster.pop('warning', 'Opps!', responseDrop.statusText);
					}
					else{
						
						toaster.pop('warning', 'Opps!', responseDrop);
					}
					
					//alert('Something Wrong');
				}
			
			});
		}
	
	/*** End Pdf ***/

	/**
		Image Gallery  Modal 
	**/
	
	$scope.openImageGallery = function (size,saleId) {

		
		$scope.singleBillData = $scope.returnSingleData(saleId);
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/imageGalleryModal/imageGalleryModalContent.html',
		  controller: imageGalleryModalCtrl,
		  size: size,
		  resolve:{
			  billData: function(){
				 
				return $scope.singleBillData;
			  },
			  formatType: function(){
				  
				 return 'image';
			  },
			  transType: function(){
				  
				  return 'none';
			  }
		  }
		});

	   
		modalInstance.result.then(function () {
		 
		
		}, function () {
		  console.log('Cancel');	
		});
		
	
	};
	
	/**
	End Image Gallery  Modal 
	**/
	
}
PoliceReportController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","apiResponse","toaster","getSetFactory","$window","headerType","$modal"];