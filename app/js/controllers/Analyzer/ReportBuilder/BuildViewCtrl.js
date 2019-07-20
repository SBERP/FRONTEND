App.controller('BuildViewController', BuildViewController);
App.directive('myEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if (event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.myEnter);
				});

				event.preventDefault();
			}
		});
	};
});
App.directive('ngRightClick', function($parse) {
	return function(scope, element, attrs) {
		var fn = $parse(attrs.ngRightClick);
		element.bind('contextmenu', function(event) {
			scope.$apply(function() {
				event.preventDefault();
				fn(scope, { $event: event });
			});
		});
	};
});
function BuildViewController($rootScope, $scope, $filter, apiCall, apiPath, apiResponse, toaster, getSetFactory, ReportGroupFactory) {
	var vm = this;
	$scope.dateFormat = 'DD-MM-YYYY';
	$scope.headers = {
		reportType: 'details'
	};
	$scope.reportGroups = [];
	var reloadingDt = true;
	var preview_ajax = false;
	$scope.filters = {
		conditions: [],
		editIndex: undefined
	};
	$scope.dataTypeInput = 0;
	vm.previewInputIndex = -1;
	vm.previewContextIndex = -1;
	$scope.treeOptions = {
		nodeChildren: "children",
		dirSelectable: true
	}
	$scope.fields = [];
	$scope.filterDrop = [];
	var filterTypes = {
		'varchar' : [
		"EQUALS TO",
		"STARTS WITH",
		"ENDS WITH",
		"CONTAINS",
		"NOT CONTAINT"
		],
		'decimal' : [
		"EQUALS TO",
		"NOT EQUALS TO",
		"GREATER THAN",
		"LESS THAN",
		"LESS OR EQUALS TO",
		"GREATER OR EQUALS TO"
		],
		'date' : [
		"DATE EQUALS",
		"MONTH EQUALS",
		"YEAR EQUALS",
		"BEFORE",
		"AFTER"
		],
		'int' : [
		"EQUALS TO",
		"NOT EQUALS TO",
		"GREATER THAN",
		"LESS THAN",
		"LESS OR EQUALS TO",
		"GREATER OR EQUALS TO"
		],
		'enum' : [
		"EQUALS TO",
		"NOT EQUALS TO"
		]
	};
	$scope.filterTypes = [];
	this.positionDrop = ["Left", "Center", "Right"];
	this.reportTypeDrop = ["Summary", "Details"];
	$scope.enumValues = [];
	// $scope.selectedFilterType = 'enum';

	$scope.preview = {
		groupBy: {},
		orderBy: {},
		columns: [],
		data: []
	};

	toaster.pop('waiting', 'Please Wait..');
	ReportGroupFactory.getReportGroups().then(resp => {
		toaster.clear();
		if (angular.isArray(resp)) {
			$scope.reportGroups = resp;
		} else {
			toaster.pop('warning', resp);
		}
	});

	$scope.loadFields = function(reportGroup) {
		toaster.pop('waiting', 'Please Wait..');
		ReportGroupFactory.getGroupTable(reportGroup.rbGroupId).then(resp => {
			toaster.clear();
			if (angular.isArray(resp)) {
				$scope.fields = resp;
				let dropLength = resp.length;
				$scope.filterDrop = [];
				(function appendTableInList(iterate){
					let dropdown = resp[iterate].children.map(res => {
						// push children with table name in one whole array
						res.table = resp[iterate].label;
						return res;
					});
					$scope.filterDrop.push(...dropdown);
					iterate++;
					if (iterate < dropLength) {
						appendTableInList(iterate);
					}
				})(0);
			} else {
				toaster.pop('warning', resp);
			}
		});
	}
	
	$scope.selectFilterValue = function(field) {
		$scope.enumValues = [];
		
		$scope.filters.filterValue = undefined;
		$scope.filters.conditionType = undefined;
		if (filterTypes.hasOwnProperty(field.type.trim())) {
			$scope.filterTypes = filterTypes[field.type.trim()];
			if (field.type.trim() == 'varchar')
				$scope.dataTypeInput = 0;
			if (field.type.trim() == 'decimal')
				$scope.dataTypeInput = 1;
			if (field.type.trim() == 'int')
				$scope.dataTypeInput = 1;
			if (field.type.trim() == 'date')
				$scope.dataTypeInput = 2;
		} else if (field.type.indexOf('enum') > -1) {
			let enums = field.type.split(':');
			if (enums.length > 1) {
				let opts = enums[1].split('/');
				$scope.filterTypes = filterTypes.enum;
				$scope.enumValues = opts;
				$scope.dataTypeInput = 3;
			}
		} else {
			$scope.filterTypes = filterTypes.enum;
		}
	}

	$scope.reloadDt = function() {
		
		if (!reloadingDt) {
			return false;
		}
		reloadingDt = false;
		var fields = angular.copy($scope.fields);
		$scope.fields = [];
		setTimeout(function() {
			reloadingDt = true;
			$scope.fields = fields;

			if(preview_ajax) {
				return false;
			}

			toaster.clear();
			toaster.pop('waiting', 'Please Wait..');

			let form = new FormData();
			if (!$scope.preview.columns.length) {
				toaster.clear();
				return false;
			}
			preview_ajax = true;
			form.set('columns', JSON.stringify($scope.preview.columns));
			form.set('groupBy', JSON.stringify($scope.preview.groupBy));
			form.set('orderBy', JSON.stringify($scope.preview.orderBy));
			form.set('filters', JSON.stringify($scope.filters.conditions));
			let header = {
				reportGroup : $scope.headers.reportGroup,
				reportType : $scope.headers.reportType
			};
			form.set('headers', JSON.stringify(header));

			apiCall.postCall(apiPath.reportBuilderPreview, form).then(function(response) {
				preview_ajax = false;
				if(angular.isArray(response)){
					toaster.clear();
					$scope.preview.data = response;
				} else {
					toaster.clear();
					if (apiResponse.notFound) {
						$scope.preview.data = [];
					}
					toaster.pop('warning', response);
				}
			});
		}, 500);
	}
	$scope.saveReport = function() {
		if (!$scope.preview.columns.length) {
			toaster.clear();
			toaster.warning('warning', 'No Columns selected!');
			return false;
		}
		preview_ajax = true;
		let form = new FormData();
		let columns = $scope.preview.columns.map((res, ind) => {
			let obj = {};
			obj.label = res.label;
			obj.id = res.id;
			obj.position = ind;
			return obj;
		});
		let headers = {
			position: $scope.headers.position.toLowerCase(),
			reportGroupId: $scope.headers.reportGroup.rbGroupId,
			reportName: $scope.headers.reportName,
			reportTitle: $scope.headers.reportTitle,
			reportType: $scope.headers.reportType
		};
		let filters = $scope.filters.conditions.map((res, ind) => {
			let obj = {};
			obj.conditionType = res.conditionType;
			obj.field_id = res.field.id;
			obj.filterValue = res.filterValue;
			return obj;
		});
		form.set('columns', JSON.stringify(columns));
		form.set('headers', JSON.stringify(headers));
		form.set('groupBy', JSON.stringify($scope.preview.groupBy));
		form.set('orderBy', JSON.stringify($scope.preview.orderBy));
		form.set('filters', JSON.stringify(filters));
		

		apiCall.postCall(apiPath.reportBuilder, form).then(function(response) {
			preview_ajax = false;
			if (apiResponse.ok == response) {
				toaster.clear();
				toaster.pop('success', 'Report Template Successfully!');
				$scope.preview = {
					groupBy: {},
					orderBy: {},
					columns: [],
					data: []
				};
				$scope.filterTypes = [];
				$scope.enumValues = [];
				$scope.fields = [];
				$scope.filters = {
					conditions: [],
					editIndex: undefined
				};
				$scope.headers = {
					reportType: 'details'
				};
				$scope.filterDrop = [];

			}else {
				toaster.pop('warning', response);
			}
		});
	}
	// Insert / Update Filter
	$scope.addFilter = function() {
		var currentKey = $scope.filters.conditions.length;
		if ($scope.filters.editIndex != undefined) {
			currentKey = $scope.filters.editIndex;
		}
		$scope.filters.conditions[currentKey] = {
			field: $scope.filters.field,
			conditionType: $scope.filters.conditionType,
			filterValue: $scope.filters.filterValue
		};
		$scope.filters.field = undefined;
		$scope.filters.conditionType = undefined;
		$scope.filters.filterValue = undefined;
		$scope.filters.editIndex = undefined;
	}

	$scope.deleteFilter = function(filterKey) {
		$scope.filters.conditions.splice(filterKey, 1);
	}

	$scope.editFilter = function(item, index) {
		$scope.filters.field = item.field;
		$scope.filters.conditionType = item.conditionType;
		$scope.filters.filterValue = item.filterValue;
		$scope.filters.editIndex = index;
	}
	$scope.removePreviewColumn = function(index) {
		$scope.preview.columns.splice(index, 1);
		this.previewInputIndex = -1;
		this.previewContextIndex = -1;
	}

	// Date Picker

	  // Disable weekend selection
	$scope.disabled = function(date, mode) {
	  	return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};
	$scope.pickDate = function($event) {
	  	$event.preventDefault();
	  	$event.stopPropagation();

	  	$scope.opened = true;
	};

	$scope.dateOptions = {
	  	formatYear: 'yy',
	  	startingDay: 1
	};

	$scope.initDate = new Date();
}
BuildViewController.$inject = ["$rootScope", "$scope", "$filter", "apiCall", "apiPath", "apiResponse", "toaster", "getSetFactory", "ReportGroupFactory"];