App.controller('BuildListController', BuildListController);
function BuildListController($rootScope, $scope, $state, $filter, apiCall, apiPath, apiResponse, toaster, getSetFactory, ReportGroupFactory, ngTableParams, $modal) {
	var vm = this;
	var reports = [];
	var Modalopened = false;
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
			page: 1,
			count: 10,
			sorting: {
				reportName: 'asc'
			}
		}, {
			total: reports.length,
			getData: function($defer, params) {
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
	$scope.editReport = function(report) {
		getSetFactory.set(report);
		$state.go('app.ReportBuilder');
	}
	$scope.deleteReport = function(report) {
		toaster.clear();
		if (Modalopened) return;

		var modalInstance = $modal.open({
			templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
			controller: deleteDataModalController,
			size: 'sm'
		});
		Modalopened = true;
		modalInstance.result.then(function () {
			apiCall.deleteCall(apiPath.reportBuilder+'/'+report.reportId).then(function(deleteres){
					if(apiResponse.ok == deleteres){
						$scope.loadReports();
						toaster.pop('success', 'Title', 'Data Successfully Deleted');
					}
					else{
						toaster.pop('warning', '', deleteres);
					}
				});
			/** End **/
			Modalopened = false;
		}, function () {
			Modalopened = false;
		});
	}
	$scope.generateReport = function(report) {
		getSetFactory.set(report);
      	$state.go("app.generateReport");
	}
	
}
BuildListController.$inject = ["$rootScope", "$scope", "$state", "$filter", "apiCall", "apiPath", "apiResponse", "toaster", "getSetFactory", "ReportGroupFactory", "ngTableParams", "$modal"];