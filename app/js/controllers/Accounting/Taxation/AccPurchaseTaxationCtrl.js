
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('AccPurchaseTaxationController', AccPurchaseTaxationController);

function AccPurchaseTaxationController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,apiResponse,toaster,getSetFactory,$window) {
  'use strict';
  var vm = this;
	//$scope.brandradio="";
	var erpPath = $rootScope.erpPath;
	
  var data = [];
	var flag = 0;
	
	$scope.showProduct = function(){
		
			flag = 1;
			$scope.getProduct($scope.stateCheck.companyId);
	}
	
	$scope.init = function (){
			
		vm.states=[];
		apiCall.getCall(apiPath.getAllCompany).then(function(response2){
			
			vm.states = response2;
			
			//Set default Company
			apiCall.getDefaultCompany().then(function(response){
				
				$scope.stateCheck = response;
				
				$scope.getProduct(response.companyId);
				
			});
		 
		});
		 
	}
	$scope.init();
	
	$scope.getProduct = function(id){
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
		apiCall.getCall(apiPath.getPurchaseTax+id).then(function(response){
			
			toaster.clear();
			console.log(response);
			if(apiResponse.noContent == response){
					
				data = [];
				toaster.pop('alert', 'Opps!!', 'No Data Available');
				
			}
			else{
				//console.log('else');
				data = response;
				
				
				
			}
			
			if(flag == 0){
					
				//console.log('zero');
				$scope.TableData();
			}
			else{
				//console.log('one');
				 vm.tableParams.reload();
				 vm.tableParams.page(1);
			}
			
			 
		});
	}
	
	$scope.TableData = function(){
		 
	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  billNumber: 'asc'     // initial sorting
		  }
	  }, {
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			  // if()
			  // {
				  // alert('yes');
			  // }
			  // else{
				  // alert('no');
			  // }
			  // use build-in angular filter
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.billNumber) != "undefined" && params.$params.filter.billNumber != "")  || (typeof(params.$params.filter.transactionType) != "undefined" && params.$params.filter.transactionType != "") || (typeof(params.$params.filter.clientName) != "undefined" && params.$params.filter.clientName != "") || (typeof(params.$params.filter.tax) != "undefined" && params.$params.filter.tax != "") || (typeof(params.$params.filter.total) != "undefined" && params.$params.filter.total != "") || (typeof(params.$params.filter.grandTotal) != "undefined" && params.$params.filter.grandTotal != "")))
			  {
					 var orderedData = params.filter() ?
					 $filter('filter')(data, params.filter()) :
					 data;

					  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

					  params.total(orderedData.length); // set total for recalc pagination
					  $defer.resolve(vm.users);
			  

			  }
			else
			{
				   params.total(data.length);
				  
			}
			 
			 if(!$.isEmptyObject(params.$params.sorting))
			  {
				
				 //alert('ggg');
				  var orderedData = params.sorting() ?
						  $filter('orderBy')(data, params.orderBy()) :
						  data;
		  
				  $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			  }
			
			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });
	}


  
  
  /*** Pdf ***/
	
		$scope.generatePdf = function(operation){
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', operation.toUpperCase()+' Loading...');
			var getData = {"Content-Type": undefined};
			getData.operation = operation;
			
			apiCall.getCallHeader(apiPath.getPurchaseTax+$scope.stateCheck.companyId,getData).then(function(responseDrop){
			
				//console.log(responseDrop);
				toaster.clear();
				
				if(angular.isObject(responseDrop)  && responseDrop.hasOwnProperty('documentPath')){
				
					var pdfPath = erpPath+responseDrop.documentPath;
					if(operation == 'pdf'){
						$window.open(pdfPath, '_blank');
					}
					else{
						$window.open(pdfPath,"_self");
					}
					
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

}
AccPurchaseTaxationController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","apiResponse","toaster","getSetFactory","$window"];