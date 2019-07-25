App.controller('BuiltViewController', BuiltViewController);

function BuiltViewController($rootScope, $scope, $state, $filter, apiCall, apiPath, apiResponse, toaster, getSetFactory, ReportGroupFactory, ngTableParams) {
	var vm = this;
	var data = [];
	$scope.reportData = {};
	$scope.fields = [];
	$scope.loadReports = function() {
		toaster.clear();
		toaster.pop('waiting','Please wait....');
		if (!Object.keys(getSetFactory.get()).length) {
			getSetFactory.blank();
			$state.go('app.ReportsList');
			return;
		}
		$scope.reportData = getSetFactory.get();
		getSetFactory.blank();

		apiCall.getCall(apiPath.generateBuiltReport+$scope.reportData.reportId).then((res) => {
			if (angular.isObject(res)) {
				$scope.fields = res.fields;
				data = res.data;
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
			count: 10
		}, {
			// counts: [],
			total: data.length, // length of saleData
			getData: function($defer, params) {
				/** ngTable **/
				params.total(data.length);
				var orderedData2 = [];
				orderedData2 = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
				orderedData2 = params.filter() ? $filter('filter')(orderedData2, params.filter()) : orderedData2;
				vm.tableParams.total(orderedData2.length);
				$defer.resolve(orderedData2.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				$scope.totalData = data.length;
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
BuiltViewController.$inject = ["$rootScope", "$scope", "$state", "$filter", "apiCall", "apiPath", "apiResponse", "toaster", "getSetFactory", "ReportGroupFactory", "ngTableParams"];