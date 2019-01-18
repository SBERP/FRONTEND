
/**=========================================================
 * Module: StaffCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('StaffController', StaffController);

function StaffController($scope,$rootScope, $filter, ngTableParams,apiCall,apiPath,$state,apiResponse,toaster,getSetFactory,$modal,fetchArrayService) {
  'use strict';
  var vm = this;
	var data = [];
	$scope.showStaff = [];
	//vm.tableParams;
	$scope.allowedAdd = $rootScope.$storage.authUser.userType;
	$scope.allowedId = $rootScope.$storage.authUser.userId;
	
	var flag = 0;
	
	vm.companyDrop=[];
	apiCall.getCall(apiPath.getAllCompany).then(function(response2){
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
			
		vm.companyDrop = response2;
		
		//Set default Company
		var defaultCompanyData = apiCall.getDefaultCompanyFilter(response2);
			
			$scope.showStaff.companyDropDown = defaultCompanyData;
			
			var headerDataOnLoad = {'Content-Type': undefined,'companyId':defaultCompanyData.companyId};
			
			apiCall.getCallHeader(apiPath.getAllStaff,headerDataOnLoad).then(function(response){
			
				toaster.clear();
				if(apiResponse.noContent == response){
					
					data = [];
					toaster.pop('alert', 'Opps!!', 'No Staff Available');
					// vm.tableParams.reload();
					  // vm.tableParams.page(1);
					
				}
				else{
					data = response;
					filterDataForTable();
				}
				flag = 1;
				$scope.TableData();
				
			});
	
	
			vm.branchDrop = [];
			var getAllBranch = apiPath.getOneBranch+defaultCompanyData.companyId;
			//Get Branch
			apiCall.getCall(getAllBranch).then(function(response4){
				
				vm.branchDrop = response4;
					
			});
	});
	
	function filterDataForTable(){
		var count = data.length;
		while(count--) {
		  data[count].cityName = ""; //initialization of new property 
		  data[count].cityName = data[count].city.cityName;  //set the data from nested obj into new property
		}
	}
	//Change Branch On Select Company
	$scope.changeCompany = function(state)
	{
		 vm.branchDrop = [];
		var getAllBranch = apiPath.getOneBranch+state;
		//Get Branch
		apiCall.getCall(getAllBranch).then(function(response4){
			vm.branchDrop = response4;
				
		});
	}
	
	$scope.showFilterStaff = function(){
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
		
		var headerData = {'Content-Type': undefined};
		
		if($scope.showStaff.companyDropDown){
			
			headerData.companyId = $scope.showStaff.companyDropDown.companyId;
			
		}
		
		
		if($scope.showStaff.branchDropDown){
			
			headerData.branchId = $scope.showStaff.branchDropDown.branchId;
		}
	
		
			
			apiCall.getCallHeader(apiPath.getAllStaff,headerData).then(function(response){
				
					toaster.clear();
				if(apiResponse.noContent == response){
					
					data = [];
					
					toaster.pop('alert', 'Opps!!', 'No Staff Available');
				}
				else{
					data = response;
					filterDataForTable();
				}
				
				if(flag == 0){
					
					$scope.TableData();
					flag = 1;
				}
				else{
					
					vm.tableParams.reload();
					  vm.tableParams.page(1);
				}
				
				
			});
	
		
	}
  
  // SORTING
  // ----------------------------------- 
	$scope.branchF = [
	  {pop: "Branch1" },
	  {pop: "Branch2" }
	];
  
  //alert(branchF);
	$scope.TableData = function(){
		
	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  userName: 'asc'     // initial sorting
		  }
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			  
			  // use build-in angular filter
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.userType) != "undefined" && params.$params.filter.userType != "") || (typeof(params.$params.filter.userName) != "undefined" && params.$params.filter.userName != "") || (typeof(params.$params.filter.emailId) != "undefined" && params.$params.filter.emailId != "") || (typeof(params.$params.filter.address) != "undefined" && params.$params.filter.address != "") || (typeof(params.$params.filter.contactNo) != "undefined" && params.$params.filter.contactNo != "") || (typeof(params.$params.filter.cityName) != "undefined" && params.$params.filter.cityName != "")))
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

  
  
	$scope.editStaff= function(id)
	{
		getSetFactory.set(id);
		$state.go("app.AddStaff");
	}
	  
	 $scope.deleteStaff = function(size,id)
	 {
		
		toaster.clear();
	
	var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
		  controller: deleteDataModalController,
		  size: size
		});

	   
		modalInstance.result.then(function () {
		 

		 toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Staff Deleting....',60000);
			
		// return false;
		 /**Delete Code **/
			var deletePath = apiPath.getAllStaff+'/'+parseInt(id);
		  
		apiCall.deleteCall(deletePath).then(function(deleteres){
			
			
			 toaster.clear();
			 
			if(apiResponse.ok == deleteres){
					
				toaster.pop('success', 'Title', 'Delete Successfully');
				
				$scope.showFilterStaff();
			}
			else{
				
				toaster.pop('warning', 'Opps!!', deleteres);
			}
		 
		});
		 /** End **/
		
		}, function () {
		  console.log('Cancel');
			 toaster.clear();
		});
	}

	/** Permission Modal **/
		$scope.openPermission = function(size,userData){
			toaster.clear();
			console.log(userData);
			var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/Staff/permissionModal.html',
			  controller: permissionModalController,
			  size: size,
			  resolve: {
			  	userData: function(){
			  		return userData;
			 		}
			 	}
			});

			modalInstance.result.then(function () {
			 	console.log('ok');
			 	// toaster.clear();
				setTimeout(function() {
					// toaster.pop('success', 'Updated Successfully');	
				}, 2000);
			
			}, function () {
			  console.log('Cancel');
				 toaster.clear();
			});
		}
	/** End **/

}
StaffController.$inject = ["$scope","$rootScope","$filter", "ngTableParams","apiCall","apiPath","$state","apiResponse","toaster","getSetFactory","$modal","fetchArrayService"];