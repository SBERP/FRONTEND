
/**=========================================================
 * Module: AddStaffController.js
 * Controller for input components
 =========================================================*/

App.controller('InvoiceController', InvoiceController);

function InvoiceController($rootScope,$scope,$filter,ngTableParams,apiCall,apiPath,toaster,apiResponse,validationMessage) {
  'use strict';
 var vm = this;
 var data = [];
 var defaultCompanyId = $rootScope.$storage.authUser.defaultCompanyId != 0 ? $rootScope.$storage.authUser.defaultCompanyId : $rootScope.$storage.authUser.companyId;

 $scope.addInvoice = [];
 //Table
 $scope.addInvoice.invoiceType = "prefix";
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	//$scope.validationPattern = validationPattern; //pattern
	
	/* VALIDATION END */
	
	function filterDataForTable(){
		var count = data.length;
		while(count--) {
		  data[count].companyName = ""; //initialization of new property 
		  data[count].companyName = data[count].company.companyName;  //set the data from nested obj into new property
		}
	}

	// Get All Invoice Call 
	apiCall.getCall(apiPath.getAllInvoice).then(function(response){
		//console.log(response);
		data = response;
		filterDataForTable();
		 $scope.TableData();
	});
	
	$scope.TableData = function(){
  
 	 vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  companyName: 'asc'     // initial sorting
		  }
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			  //console.log(params.$params);
			  // if()
			  // {
				  // alert('yes');
			  // }
			  // else{
				  // alert('no');
			  // }
			  // use build-in angular filter
			 // console.log("Length: .."+params.$params.filter.city);
			  
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.companyName) != "undefined" && params.$params.filter.companyName != "")  || (typeof(params.$params.filter.invoiceLabel) != "undefined" && params.$params.filter.invoiceLabel != "") || (typeof(params.$params.filter.invoiceType) != "undefined" && params.$params.filter.invoiceType != "") || (typeof(params.$params.filter.startAt) != "undefined" && params.$params.filter.startAt != "")))
			  {
					 var orderedData = params.filter() ?
					 $filter('filter')(data, params.filter()) :
					 data;

					  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

					  params.total(orderedData.length); // set total for recalc pagination
					  $defer.resolve(vm.users);
			  

			  }
			  else{
				  
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
	  
	
	function defaultCompany(){
		
		vm.invoiceCompanyDrop= [];
		// Get All Invoice Call 
		apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
			vm.invoiceCompanyDrop = responseCompanyDrop;
			$scope.addInvoice.companyDrop = apiCall.getDefaultCompanyFilter(responseCompanyDrop);
		});
	}

	defaultCompany();

  //Insert Invoice
  $scope.insertInvoiceData = function(addInvoice)
  {
	  var formdata = new FormData();
	 //console.log(addInvoice);
	 
	 formdata.append('companyId',addInvoice.companyDrop.companyId);
	 if($scope.addInvoice.invoiceLabel){
		 
		 formdata.append('invoiceLabel',addInvoice.invoiceLabel);
	 }
	else{
		 formdata.append('invoiceLabel','');
	}
	 formdata.append('startAt',addInvoice.startAt);
	  formdata.append('endAt',addInvoice.startAt);
	 formdata.append('invoiceType',addInvoice.invoiceType);
	 
	 apiCall.postCall(apiPath.getAllInvoice,formdata).then(function(response5){
		
			//console.log(response5);
			//$location.path('app/Invoice');
			if(apiResponse.ok == response5){
				
				toaster.pop('success', 'Title', 'Successfull');
					
				apiCall.getCall(apiPath.getAllInvoice).then(function(response){
					data = response;
					filterDataForTable();
					vm.tableParams.reload();
					  vm.tableParams.page(1);
				});
				
				$scope.addInvoice.companyDrop.companyId='';
				$scope.addInvoice.invoiceLabel = '';
				$scope.addInvoice.startAt = '';
				$scope.addInvoice.invoiceType = 'prefix';
				
				defaultCompany();
			}
			else{
			
				toaster.pop('warning', 'Opps!!', response5);
			}
			//toaster.pop('success', 'Title', 'Message');
			
			formdata.delete('companyId');
			formdata.delete('invoiceLabel');
			formdata.delete('startAt');
			formdata.delete('endAt');
			formdata.delete('invoiceType');
		
	});
  }
  
	$scope.cancel = function(){
		
		$scope.addInvoice.companyDrop.companyId='';
		$scope.addInvoice.invoiceLabel = '';
		$scope.addInvoice.startAt = '';
		$scope.addInvoice.invoiceType = 'prefix';
		
		defaultCompany();
		
		formdata.delete('companyId');
		formdata.delete('invoiceLabel');
		formdata.delete('startAt');
		formdata.delete('endAt');
		formdata.delete('invoiceType');
	}
}
InvoiceController.$inject = ["$rootScope","$scope","$filter","ngTableParams","apiCall","apiPath","toaster","apiResponse","validationMessage"];