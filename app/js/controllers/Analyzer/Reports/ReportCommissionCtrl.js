App.controller('ReportCommissionController', ReportCommissionController);

function ReportCommissionController($rootScope,$scope, $state, $filter, ngTableParams,apiCall,apiPath,apiResponse,toaster,getSetFactory,$window,headerType,$modal) {
  'use strict';
  var vm = this;
  $scope.headerType = headerType;
 	$scope.filterCompanyId = $rootScope.accView.companyId;
	$scope.filterSaleman = $rootScope.accView.userData;
	$scope.dateFormat =  $rootScope.dateFormats;
	var data = [];
	$scope.singleData = {};
	toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
	apiCall.getCall(apiPath.getAllCompany+'/'+$scope.filterCompanyId).then(function(res){
		toaster.clear();
		$scope.displayCompany = res.companyName;
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
		if ($scope.filterSaleman == undefined) 
		{
			toaster.clear();
			toaster.pop('info', 'No Data Found!');
		}else if (angular.isDefined($scope.filterSaleman.userId)) 
		{
			loadUserTranscations($scope.filterSaleman.userId);
		}
	});

	function loadUserTranscations(userId)
	{
		var headerCr = {'Content-Type': undefined,'companyId':$scope.filterCompanyId};
		apiCall.getCallHeader(apiPath.getStaffCommission+'report/'+userId,headerCr).then(function(response){
			if(angular.isArray(response)){
				data = response;
				loadTableData();
			}
			else{
				toaster.clear();
				toaster.pop('alert', 'Opps!!', response);
			}
		});
	}

	function loadTableData()
	{
		vm.tableParams = new ngTableParams(
		{
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  date: 'desc'     // initial sorting
			}
		}, 
		{
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
		  		orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
		  	}
		  	orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
		  	getTotalAmounts(orderedData);
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
		toaster.clear();
	}
	$scope.dateConvert = function(entryDate){
		var entDate = entryDate.split("-").reverse().join("-");
		return entDate; 
	}

	$scope.goToBillPage = function(jfId)
	{
		var headerCr = {'Content-Type': undefined,'companyId':$scope.filterCompanyId};
		var path;
		var gotoUrl;
		path = apiPath.postBill+'/'+jfId;
		gotoUrl = 'app.WholesaleBill';
		apiCall.getCallHeader(path,headerCr).then(function(response){
          	getSetFactory.set(response[0]);
          	$state.go(gotoUrl);
        });
	}


	function getTotalAmounts(allBillData) {
		$scope.totalBillAmount = 0;
	  	$scope.totalCommissionAmount = 0;
	  	for (var i = 0; i < allBillData.length; i++) {
	  		$scope.totalBillAmount += parseFloat(allBillData[i].total);
	  		$scope.totalCommissionAmount += parseFloat(allBillData[i].commissionAmount);
	  	}
	}
}
ReportCommissionController.$inject = ["$rootScope","$scope","$state", "$filter", "ngTableParams","apiCall","apiPath","apiResponse","toaster","getSetFactory","$window","headerType","$modal"];