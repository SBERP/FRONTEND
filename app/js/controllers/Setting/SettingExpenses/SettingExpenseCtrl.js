/**=========================================================
 * Module: SettingExpenseController.js
 * Controller for input components
 =========================================================*/

App.controller('SettingExpenseController', SettingExpenseController);

function SettingExpenseController($rootScope,$scope,$filter,ngTableParams,apiCall,apiPath,toaster,apiResponse,validationMessage) 
{
	var vm = this;
	$scope.addUpdateLabel="Save";
	$scope.expenseData = [];
	var data = [];
	$scope.expenseForm = [];
	function filterDataForTable(){
		var count = data.length;
		while(count--) {
		  data[count].companyName = ""; //initialization of new property 
		  console.log("data",data);
		  data[count].companyName = data[count].company.companyName;  //set the data from nested obj into new property
		}
	}
	$scope.TableData = function(){
	  	$scope.tableParams = new ngTableParams({
			page: 1,            // show first page
			count: 10,          // count per page
			sorting: 
			{
				companyName: 'asc'     // initial sorting
			}
		}, 
		{
			// counts: [],
			total: $scope.expenseData.length, // length of $scope.expenseData
			getData: function($defer, params) 
			{
				if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.companyName) != "undefined" && params.$params.filter.companyName != "")  || (typeof(params.$params.filter.expenseName) != "undefined" && params.$params.filter.expenseName != "") || (typeof(params.$params.filter.expenseType) != "undefined" && params.$params.filter.expenseType != "") || (typeof(params.$params.filter.expenseValue) != "undefined" && params.$params.filter.expenseValue != "")))
				{
					var orderedData = params.filter() ?
					$filter('filter')($scope.expenseData, params.filter()) : $scope.expenseData;
					vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
					params.total(orderedData.length); // set total for recalc pagination
					$defer.resolve(vm.users);
				}
				else
				{
					params.total($scope.expenseData.length);
				}
				 
				if(!$.isEmptyObject(params.$params.sorting))
				{
					var orderedData = params.sorting() ? $filter('orderBy')($scope.expenseData, params.orderBy()) : $scope.expenseData;
					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
				$scope.totalData = $scope.expenseData.length;
				$scope.pageNumber = params.page();
		        $scope.itemsPerPage = params.count();
		        $scope.totalPages = Math.ceil($scope.totalData/params.count());
					
			}
		});
	}
	function defaultCompany(){

		vm.expenseCompanyDrop= [];
		// Get All Invoice Call 
		apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
			// console.log("company...",responseCompanyDrop);
			vm.expenseCompanyDrop = responseCompanyDrop;
			$scope.expenseForm.companyDrop = apiCall.getDefaultCompanyFilter(responseCompanyDrop);
		});
	}
	defaultCompany();
	
	var expenseGetApiPath = apiPath.settingExpense;
	// Get All Expense Call 
	apiCall.getCall(expenseGetApiPath).then(function(response){
		$scope.expenseData = response;
		filterDataForTable();
		 $scope.TableData();
	});

	$scope.expenseForm.expenseType = 'flat';
	$scope.expenseForm.expenseGroupType = 'indirect';
	$scope.expenseForm.expenseValue = '0';
	
	//Insert Expense
	$scope.insertExpenseData = function(expenseForm)
	{
		var formdata = new FormData();
		//console.log(jobcardForm);
		formdata.append('companyId',expenseForm.companyDrop.companyId);
		if($scope.expenseForm.expenseValue){
			if($scope.expenseForm.expenseType)
			{
				formdata.append('expenseValue',expenseForm.expenseValue);
				formdata.append('expenseType',expenseForm.expenseType);
			}
			else
			{
				formdata.append('expenseValue',0);
				formdata.append('expenseType','flat');
			}
		}
		else
		{
			formdata.append('expenseValue',0);
			formdata.append('expenseType','flat');
		}
		formdata.append('expenseName',expenseForm.expenseName);
		formdata.append('expenseGroupType',expenseForm.expenseGroupType);

		var newExpenseGetApiPath = expenseGetApiPath;
		if($scope.addUpdateLabel=="Update")
		{
			newExpenseGetApiPath = expenseGetApiPath+"/"+$scope.expenseForm.expenseId;
		}
		apiCall.postCall(newExpenseGetApiPath,formdata).then(function(response5)
		{
			//console.log(response5);
			//$location.path('app/Invoice');
			if(apiResponse.ok == response5)
			{
				toaster.pop('success', 'Title', 'Successfull');
				if($scope.addUpdateLabel=="Update")
				{
					$scope.addUpdateLabel="Save";
				}
				apiCall.getCall(expenseGetApiPath).then(function(response){
					// console.log(response);
					$scope.expenseData = response;
					filterDataForTable();
					$scope.tableParams.reload();
					$scope.tableParams.page(1);
				});
				$scope.expenseForm.companyDrop.companyId='';
				$scope.expenseForm.expenseName = '';
				$scope.expenseForm.expenseType = 'flat';
				$scope.expenseForm.expenseGroupType = 'indirect';
				$scope.expenseForm.expenseValue = '0';
				defaultCompany();
			}
			else
			{
				toaster.pop('warning', 'Opps!!', response5);
			}
			// toaster.pop('success', 'Title', 'Message');
			formdata.delete('companyId');
			formdata.delete('expenseType');
			formdata.delete('expenseGroupType');
			formdata.delete('expenseName');
			formdata.delete('expenseValue');
		});
	}
	$scope.cancel = function(){
		$scope.expenseForm.companyDrop.companyId='';
		$scope.expenseForm.expenseName = '';
		$scope.expenseForm.expenseValue = '';
		$scope.expenseForm.expenseType = 'flat';
		$scope.expenseForm.expenseGroupType = 'indirect';
		defaultCompany();
		formdata.delete('companyId');
		formdata.delete('expenseValue');
		formdata.delete('expenseType');
		formdata.delete('expenseGroupType');
		formdata.delete('expenseName');
	}
	$scope.editExpense= function(id)
	{
		var editPath = expenseGetApiPath+"/"+id;
		apiCall.getCall(editPath).then(function(response)
		{	
			if(angular.isObject(response))
			{
				if(Object.keys(response).length!=0)
				{
					$scope.addUpdateLabel = "Update";
					$scope.expenseForm.companyDrop=response.company;
					$scope.expenseForm.expenseName = response.expenseName;
					$scope.expenseForm.expenseValue = response.expenseValue;
					$scope.expenseForm.expenseType = response.expenseType;
					$scope.expenseForm.expenseGroupType = response.expenseGroupType;
					$scope.expenseForm.expenseId = response.expenseId;
				}
			}
			
		});
	}

	//remove expense data
	$scope.deleteExpense= function(id)
	{
		var editPath = expenseGetApiPath+"/"+id;
		apiCall.deleteCall(editPath).then(function(deleteres)
		{	
			if(apiResponse.ok == deleteres)
			{
				toaster.pop('success', 'Title', 'Delete Successfully');
				apiCall.getCall(expenseGetApiPath).then(function(response)
				{
					// console.log("get expense",response);
					$scope.expenseData = response;
					filterDataForTable();
					$scope.tableParams.reload();
					$scope.tableParams.page(1);
				});
			}
			else
			{
				toaster.pop('warning', 'Opps!!', deleteres);
			}
		});
	}
}


SettingExpenseController.$inject = ["$rootScope","$scope","$filter","ngTableParams","apiCall","apiPath","toaster","apiResponse","validationMessage"];