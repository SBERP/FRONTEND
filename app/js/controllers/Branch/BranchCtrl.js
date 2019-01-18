
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('BranchController', BranchController);

function BranchController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,$location,$state,apiResponse,toaster,$modal,getSetFactory,fetchArrayService) {
  'use strict';
  var vm = this;
  var data = [];
  var formdata = new FormData();
  var Modalopened = false;
  var defaultCompanyId = $rootScope.$storage.authUser.defaultCompanyId != 0 ? $rootScope.$storage.authUser.defaultCompanyId : $rootScope.$storage.authUser.companyId;

  //Go To AddBranch
  $scope.GoToAddBranch = function(){
	  
	 $rootScope.AddBranchModify = false;
	 $location.path('app/AddBranch');
	// $state.go('app.AddBranch'); 
	
  }
  
  	function filterDataForTable(){
		var count = data.length;
		while(count--) {
		  data[count].cityName = ""; //initialization of new property 
		  data[count].cityName = data[count].city.cityName;  //set the data from nested obj into new property
		  
		  data[count].companyName = ""; //initialization of new property 
		  data[count].companyName = data[count].company.companyName;  //set the data from nested obj into new property
		}
	}

	$scope.showBranches = function()
	{
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
		
		if($scope.stateCheck){
			
			apiCall.getCall(apiPath.getOneBranch+$scope.stateCheck.companyId).then(function(response){
				
				toaster.clear();
				//console.log(response);
				if(angular.isArray(response))
				{
					data = response;
					filterDataForTable();
					vm.tableParams.reload();
					vm.tableParams.page(1);
				}
				else{
					data = [];
					vm.tableParams.reload();
					toaster.pop('info', 'Message', 'Data Not Available');
				}
			});
		}
		else{
			
			
			
			apiCall.getCall(apiPath.getAllBranch).then(function(response){
				
				toaster.clear();
				//console.log(response);
				if(angular.isArray(response))
				{
					data = response;
					filterDataForTable();
					vm.tableParams.reload();
					vm.tableParams.page(1);
				}
				else{
					data = [];
					vm.tableParams.reload();
					toaster.pop('info', 'Message', 'Data Not Available');
				}
			});
		}
	}
	
	//Company
	$scope.init = function (){
		vm.states=[];
		apiCall.getCall(apiPath.getAllCompany).then(function(response2){
			
			toaster.clear();
			vm.states = response2;

			toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
			//Set default Company
			$scope.stateCheck = apiCall.getDefaultCompanyFilter(response2);
			$scope.getBranch($scope.stateCheck.companyId);
		});
	}
	
	$scope.init();
	//End
  
	$scope.getBranch = function(id){
		
		apiCall.getCall(apiPath.getOneBranch+id).then(function(response){
			//console.log(response);
			toaster.clear();
			
			if(angular.isArray(response))
			{
				data = response;
				filterDataForTable();
				$scope.TableData();
			}
			else{
				
				data = [];
				$scope.TableData();
				toaster.pop('info', 'Message', 'Data Not Available');
			}
		});
	}
	
  $scope.TableData = function(){
	
	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  branchName: 'asc'     // initial sorting
		  }
	  }, {
		   // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.companyName) != "undefined" && params.$params.filter.companyName != "") || (typeof(params.$params.filter.branchName) != "undefined" && params.$params.filter.branchName != "")  || (typeof(params.$params.filter.address1) != "undefined" && params.$params.filter.address1 != "") || (typeof(params.$params.filter.address2) != "undefined" && params.$params.filter.address2 != "") || (typeof(params.$params.filter.pincode) != "undefined" && params.$params.filter.pincode != "") || (typeof(params.$params.filter.cityName) != "undefined" && params.$params.filter.cityName != "")))
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

  // FILTERS
  // ----------------------------------- 

  vm.tableParams2 = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      filter: {
          name: '',
          age: ''
          // name: 'M'       // initial filter
      }
  }, {
      total: data.length, // length of data
      getData: function($defer, params) {
          // use build-in angular filter
          var orderedData = params.filter() ?
                 $filter('filter')(data, params.filter()) :
                 data;

          vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(vm.users);
      }
  });

  // SELECT ROWS
  // ----------------------------------- 

  vm.data = data;

  vm.tableParams3 = new ngTableParams({
      page: 1,            // show first page
      count: 10          // count per page
  }, {
      total: data.length, // length of data
      getData: function ($defer, params) {
          // use build-in angular filter
          var filteredData = params.filter() ?
                  $filter('filter')(data, params.filter()) :
                  data;
          var orderedData = params.sorting() ?
                  $filter('orderBy')(filteredData, params.orderBy()) :
                  data;

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
  });

  vm.changeSelection = function(user) {
      // console.info(user);
  };

 
  $scope.isDefault_branch = function(id)
  {
	
	formdata.append('isDefault','ok');
	var editBranch2 = apiPath.getAllBranch+'/'+id;
		
		apiCall.postCall(editBranch2,formdata).then(function(response5){
		
			formdata.delete('isDefault');
			//$location.path('app/Branch');
			//toaster.pop('success', 'Title', 'Message');
		
		});
  }
  
  $scope.editBranch= function(branch_id)
  {
	  
	  //$location.path('app/AddBranch/'+branch_id);
	   getSetFactory.set(branch_id);
	    $rootScope.AddBranchModify = true;
	   $state.go("app.AddBranch");
  }
  
  $scope.deleteBranch = function(size,branch_id)
  {
	
	toaster.clear();
	if (Modalopened) return;
	
	var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
		  controller: deleteDataModalController,
		  size: size
		});

	   Modalopened = true;
	   
		modalInstance.result.then(function () {
		 
		 console.log('ok');
		 toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Branch Deleting....',60000);
		
		// return false;
		 /**Delete Code **/
			var deletePath = apiPath.getAllBranch+'/'+parseInt(branch_id);
	  
			apiCall.deleteCall(deletePath).then(function(deleteres){
				
				//console.log(deleteres);
				toaster.clear();
				if(apiResponse.ok == deleteres){
						
					toaster.pop('success', 'Title', 'Delete Successfully');
					
					$scope.showBranches();
				}
				else{
					
					toaster.pop('warning', 'Opps!!', deleteres);
				}
			 
			});
		 /** End **/
		 Modalopened = false;
		
		}, function () {
		  console.log('Cancel');
			toaster.clear();	
				Modalopened = false;
				
		});
  }
}
BranchController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","$location","$state","apiResponse","toaster","$modal","getSetFactory","fetchArrayService"];