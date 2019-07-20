App.controller('BuildListController', BuildListController);
function BuildListController($rootScope, $scope, $state, $filter, apiCall, apiPath, apiResponse, toaster, getSetFactory, ReportGroupFactory, ngTableParams) {
	var vm = this;
	var reports = [];
	$scope.loadReports = function() {
		toaster.clear();
		toaster.pop('waiting','Please wait....');
		apiCall.getCall(apiPath.reportBuilder).then((res) => {
			if (angular.isArray(res)) {
				reports = res;
				loadngTable();
			} else {
				toaster.clear();
				toaster.pop('warning', res);
			}
		});
	}
	$scope.loadReports();
	function loadngTable() {
		vm.tableParams = new ngTableParams({
			page: 1,            // show first page
			count: 10,          // count per page
			sorting: {
				reportName: 'asc'     // initial sorting
			}
		}, {
			// counts: [],
			total: reports.length, // length of saleData
			getData: function($defer, params) {
				/** ngTable **/
				params.total(reports.length);
				var orderedData2 = [];
				orderedData2 = params.sorting() ? $filter('orderBy')(reports, params.orderBy()) : reports;
				orderedData2 = params.filter() ? $filter('filter')(orderedData2, params.filter()) : orderedData2;
				vm.tableParams.total(orderedData2.length);
				$defer.resolve(orderedData2.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				$scope.totalData = reports.length;
				$scope.pageNumber = params.page();
	          	$scope.itemsPerPage = params.count();
	          	$scope.totalPages = Math.ceil($scope.totalData/params.count());
			}
		});
	}

	$scope.generateReport = function(report) {
		getSetFactory.set(report);
      	$state.go("app.generateReport");
	}
	
}
BuildListController.$inject = ["$rootScope", "$scope", "$state", "$filter", "apiCall", "apiPath", "apiResponse", "toaster", "getSetFactory", "ReportGroupFactory", "ngTableParams"];