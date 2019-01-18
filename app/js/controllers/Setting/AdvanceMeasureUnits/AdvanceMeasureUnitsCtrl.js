/**=========================================================
 * Module: SettingAdvanceMeasurementController.js
 * Controller for input components
 =========================================================*/

App.controller('SettingAdvanceMeasurementController', SettingAdvanceMeasurementController);

function SettingAdvanceMeasurementController($rootScope,$scope,$filter,$modal,ngTableParams,apiCall,apiPath,toaster,apiResponse,validationMessage,fetchArrayService) 
{
	var vm = this;
	$scope.addUpdateLabel="Save";
	// data = [];
	var data = [];
	$scope.measurementForm = [];
	var Modalopened = false;
	
	function filterDataForTable () 
	{
		var count = data.length;
		while(count--) {
		  data[count].companyName = ""; //initialization of new property 
		  console.log("data",data);
		  data[count].companyName = data[count].company.companyName;  //set the data from nested obj into new property
		}
	}

	$scope.TableData = function()
	{
	  	$scope.tableParams = new ngTableParams({
			page: 1,            // show first page
			count: 10,          // count per page
			sorting: 
			{
				unitName: 'asc'     // initial sorting
			}
		}, 
		{
			// counts: [],
			total: data.length, // length of data
			getData: function($defer, params) 
			{
				if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.unitName) != "undefined" && params.$params.filter.unitName != "")))
				{
					var orderedData = params.filter() ?
					$filter('filter')(angular.copy(data), params.filter()) : angular.copy(data);
					var users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
					params.total(orderedData.length); // set total for recalc pagination
					$defer.resolve(users);
				}
				else
				{
					params.total(data.length);
				}
				 
				if(!$.isEmptyObject(params.$params.sorting))
				{
					var orderedData = params.sorting() ? $filter('orderBy')(angular.copy(data), params.orderBy()) : angular.copy(data);
					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
				$scope.totalData = data.length;
				$scope.pageNumber = params.page();
		        $scope.itemsPerPage = params.count();
		        $scope.totalPages = Math.ceil($scope.totalData/params.count());
					
			}
		});
	}

	// function defaultCompany()
	// {
	// 	vm.expenseCompanyDrop= [];
	// 	// Get All Invoice Call 
	// 	apiCall.getCall(apiPath.getAllCompany).then( function (responseCompanyDrop) {
	// 		console.log("company...",responseCompanyDrop);
	// 		vm.expenseCompanyDrop = responseCompanyDrop;
	// 		$scope.measurementForm.companyDrop = fetchArrayService.getfilteredSingleObject(responseCompanyDrop,'ok','isDefault');
	// 	});
	// }
	// defaultCompany();
	
	var measurementGetApiPath = apiPath.settingMeasurementUnit;
	// Get All Expense Call 
	apiCall.getCall(measurementGetApiPath).then( function(response) {
		// console.log(response);
		data = response;
		// filterDataForTable();
		 $scope.TableData();
	});

	//Insert Measurement
	$scope.insertMeasurementData = function (measurementForm)
	{
		var formdata = new FormData();
		
		formdata.append('unitName',measurementForm.unitName);
		var newMeasurementGetApiPath = measurementGetApiPath;
		if($scope.addUpdateLabel=="Update")
		{
			newMeasurementGetApiPath = measurementGetApiPath+"/"+$scope.measurementForm.measurementUnitId;
		}
		apiCall.postCall(newMeasurementGetApiPath,formdata).then(function(response5)
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
				apiCall.getCall(measurementGetApiPath).then(function(response){
					// console.log(response);
					data= [];
					data = angular.copy(response);
					// filterDataForTable();
					// $scope.tableParams = {reload:function(){},settings:function(){return {}}};
					// setTimeout(function() {
					// 	$scope.TableData();
					// }, 100);
					// $scope.TableData();
					// $scope.tableParams.total(data.length);
					$scope.tableParams.data = angular.copy(data);
					$scope.tableParams.reload();	
					$scope.tableParams.page(1);
					// $scope.tableParams.sorting({});
				});
				$scope.measurementForm.unitName = '';
			}
			else
			{
				toaster.pop('warning', 'Opps!!', response5);
			}
			// toaster.pop('success', 'Title', 'Message');
			formdata.delete('unitName');
		});
	}
	$scope.cancel = function(){
		$scope.measurementForm.unitName = '';
		// defaultCompany();
		formdata.delete('unitName');
	}

	//Edit Measurement
	$scope.editMeasurement= function(id)
	{
		var editPath = measurementGetApiPath+"/"+id;
		apiCall.getCall(editPath).then(function(response)
		{	
			if(angular.isObject(response))
			{
				if(Object.keys(response).length!=0)
				{
					$scope.addUpdateLabel = "Update";
					$scope.measurementForm.unitName = response.unitName;
					$scope.measurementForm.measurementUnitId = response.measurementUnitId;
				}
			}
			
		});
	}

	//remove Measurement data
	$scope.deleteMeasurement= function(size,id)
	{
		var editPath = measurementGetApiPath+"/"+id;
		toaster.clear();
		if (Modalopened) return;
		
		var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
			  controller: deleteDataModalController,
			  size: size
			});

		    Modalopened = true;
			
			modalInstance.result.then(function () {
			
			 /**Delete Code **/
				apiCall.deleteCall(editPath).then(function(deleteres)
				{	
					if(apiResponse.ok == deleteres)
					{
						toaster.pop('success', 'Title', 'Delete Successfully');
						apiCall.getCall(measurementGetApiPath).then(function(response)
						{
							// console.log("get expense",response);
							data = response;
							// filterDataForTable();
							$scope.tableParams.reload();
							$scope.tableParams.page(1);
						});
					}
					else
					{
						toaster.pop('warning', 'Opps!!', deleteres);
					}
				});
		 	/** End **/
			Modalopened = false;
			 
		}, function () {
		  // console.log('Cancel');	
			 Modalopened = false;
		});
		
	}
}


SettingAdvanceMeasurementController.$inject = ["$rootScope","$scope","$filter","$modal","ngTableParams","apiCall","apiPath","toaster","apiResponse","validationMessage","fetchArrayService"];