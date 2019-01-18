
/**=========================================================
 * Module: SettingJobcardNumberController.js
 * Controller for input components
 =========================================================*/

App.controller('SettingJobcardNumberController', SettingJobcardNumberController);

function SettingJobcardNumberController($rootScope,$scope,$filter,ngTableParams,apiCall,apiPath,toaster,apiResponse,validationMessage) {
  'use strict';
 var vm = this;
 var data = [];
 $scope.jobcardForm = [];
 
 var JobcardGetApiPath = apiPath.getJobcardNumber;
 
 //Table
 $scope.jobcardForm.jobCardNumberType = "prefix";
	
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
	apiCall.getCall(JobcardGetApiPath).then(function(response){
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
			  
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.companyName) != "undefined" && params.$params.filter.companyName != "")  || (typeof(params.$params.filter.jobCardNumberLabel) != "undefined" && params.$params.filter.jobCardNumberLabel != "") || (typeof(params.$params.filter.jobCardNumberType) != "undefined" && params.$params.filter.jobCardNumberType != "") || (typeof(params.$params.filter.startAt) != "undefined" && params.$params.filter.startAt != "")))
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
			$scope.jobcardForm.companyDrop = apiCall.getDefaultCompanyFilter(responseCompanyDrop);
		});
	}
	defaultCompany();
	  
  //Insert Invoice
  $scope.insertInvoiceData = function(jobcardForm)
  {
	  var formdata = new FormData();
	 //console.log(jobcardForm);
	 
	 formdata.append('companyId',jobcardForm.companyDrop.companyId);
	 if($scope.jobcardForm.jobCardNumberLabel){
		 
		 formdata.append('jobCardNumberLabel',jobcardForm.jobCardNumberLabel);
	 }
	else{
		 formdata.append('jobCardNumberLabel','');
	}
	 formdata.append('startAt',jobcardForm.startAt);
	  formdata.append('endAt',jobcardForm.startAt);
	 formdata.append('jobCardNumberType',jobcardForm.jobCardNumberType);
	 
	 apiCall.postCall(JobcardGetApiPath,formdata).then(function(response5){
		
			//console.log(response5);
			//$location.path('app/Invoice');
			if(apiResponse.ok == response5){
				
				toaster.pop('success', 'Title', 'Successfull');
					
				apiCall.getCall(JobcardGetApiPath).then(function(response){
					data = response;
					filterDataForTable();
					vm.tableParams.reload();
					  vm.tableParams.page(1);
				});
				
				$scope.jobcardForm.companyDrop.companyId='';
				$scope.jobcardForm.jobCardNumberLabel = '';
				$scope.jobcardForm.startAt = '';
				$scope.jobcardForm.jobCardNumberType = 'prefix';
				
				defaultCompany();
			}
			else{
			
				toaster.pop('warning', 'Opps!!', response5);
			}
			//toaster.pop('success', 'Title', 'Message');
			
			formdata.delete('companyId');
			formdata.delete('jobCardNumberLabel');
			formdata.delete('startAt');
			formdata.delete('endAt');
			formdata.delete('jobCardNumberType');
		
	});
  }
  
	$scope.cancel = function(){
		
		$scope.jobcardForm.companyDrop.companyId='';
		$scope.jobcardForm.jobCardNumberLabel = '';
		$scope.jobcardForm.startAt = '';
		$scope.jobcardForm.jobCardNumberType = 'prefix';
		
		defaultCompany();
		
		formdata.delete('companyId');
		formdata.delete('jobCardNumberLabel');
		formdata.delete('startAt');
		formdata.delete('endAt');
		formdata.delete('jobCardNumberType');
	}
}
SettingJobcardNumberController.$inject = ["$rootScope","$scope","$filter","ngTableParams","apiCall","apiPath","toaster","apiResponse","validationMessage"];