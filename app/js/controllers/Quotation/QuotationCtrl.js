
/**=========================================================
 * Module: AddStaffController.js
 * Controller for input components
 =========================================================*/

App.controller('QuotationController', QuotationController);

function QuotationController($scope,$filter, ngTableParams,apiCall,apiPath,toaster,apiResponse,validationMessage,fetchArrayService) {
  'use strict';
 	var vm = this;
	var data =[];

	$scope.addquotation =[];
	
	$scope.addquotation.quotationType = "prefix";
	
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
	apiCall.getCall(apiPath.getAllQuotation).then(function(response){
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
			  
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.companyName) != "undefined" && params.$params.filter.companyName != "")  || (typeof(params.$params.filter.quotationLabel) != "undefined" && params.$params.filter.quotationLabel != "") || (typeof(params.$params.filter.quotationType) != "undefined" && params.$params.filter.quotationType != "") || (typeof(params.$params.filter.startAt) != "undefined" && params.$params.filter.startAt != "")))
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
		 
		 vm.quotationCompanyDrop= [];
		// Get All Invoice Call 
		apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
			
			vm.quotationCompanyDrop = responseCompanyDrop;
			
			$scope.addquotation.companyDrop = apiCall.getDefaultCompanyFilter(responseCompanyDrop);
		});
		
	}
 	defaultCompany();

  $scope.insertQuotationData = function(addquotation)
  {
	  var formdata = new FormData();
	 //console.log(addInvoice);
	 
	 formdata.append('companyId',addquotation.companyDrop.companyId);
	 
		if($scope.addquotation.quotationLabel){
		 
		  formdata.append('quotationLabel',addquotation.quotationLabel);
		 }
		else{
			 formdata.append('quotationLabel','');
		}
	
	
	 formdata.append('startAt',addquotation.startAt);
	  formdata.append('endAt',addquotation.startAt);
	 formdata.append('quotationType',addquotation.quotationType);
	 
	 apiCall.postCall(apiPath.getAllQuotation,formdata).then(function(response5){
		
			//console.log(response5);
			//$location.path('app/Invoice');
			if(apiResponse.ok == response5){
				
				toaster.pop('success', 'Title', 'Successfull');
				
				apiCall.getCall(apiPath.getAllQuotation).then(function(response){
					data = response;
					filterDataForTable();
					vm.tableParams.reload();
					  vm.tableParams.page(1);
				});
				
				$scope.addquotation.companyDrop.companyId='';
				$scope.addquotation.quotationLabel = '';
				$scope.addquotation.startAt = '';
				$scope.addquotation.quotationType = 'prefix';
				
				defaultCompany();
			}
			else{
			
				toaster.pop('warning', 'Opps!!', response5);
			}
			//toaster.pop('success', 'Title', 'Message');
		
			formdata.delete('companyId');
			formdata.delete('quotationLabel');
			formdata.delete('startAt');
			formdata.delete('endAt');
			formdata.delete('quotationType');
	});
	
	
	
  }
  
	$scope.cancel = function(){
		
		$scope.addquotation.companyDrop.companyId='';
		$scope.addquotation.quotationLabel = '';
		$scope.addquotation.startAt = '';
		$scope.addquotation.quotationType = 'prefix';
		
		defaultCompany();
		
		formdata.delete('companyId');
		formdata.delete('quotationLabel');
		formdata.delete('startAt');
		formdata.delete('endAt');
		formdata.delete('quotationType');
		
	}
}
QuotationController.$inject = ["$scope","$filter", "ngTableParams","apiCall","apiPath","toaster","apiResponse","validationMessage","fetchArrayService"];