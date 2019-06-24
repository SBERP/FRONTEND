App.controller('BuildViewController', BuildViewController);


function BuildViewController($rootScope, $scope, $filter, apiCall, apiPath, apiResponse, toaster, getSetFactory) {
	var vm = this;
	$scope.headers = {};
	$scope.filters = {
		conditions : [],
		editIndex: undefined
	};
	$scope.treeOptions = {
	    nodeChildren: "children",
	    dirSelectable: true
	}
	$scope.preview = {
		groupBy: {},
		orderBy: {},
		columns: [],
		data: [
			{'invoice_no' : 'Tg-123', 'total' : 904.68},
			{'invoice_no' : 'Tg-124', 'total' : 43.12},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
			{'invoice_no' : 'Tg-125', 'total' : 126.75},
		]
	};
	$scope.fields = [
		{ "label" : "Sales Bill", "id" : "sale_bill", "children": [
			{ "label" : "Sales", "id" : "bill", "children": [
				{ "label" : "Invoice", "id" : "invoice_no"},
				{ "label" : "Total", "id" : "total"}
			] },
			{ "label" : "Total", "id" : "total"},
		] }
	];
	$scope.reloadDt = function()
	{
		var fields = angular.copy($scope.fields);
		$scope.fields = [];
		setTimeout(function(){
			$scope.fields = fields;
		},100);
	}
	$scope.saveReport = function() {
		console.log({
			previewTable: $scope.preview,
			fields: $scope.fields,
			headers: $scope.headers,
			filters: $scope.filters
		});
	}
	// Insert / Update Filter
	$scope.addFilter = function()
	{
		var currentKey = $scope.filters.conditions.length;
		if ($scope.filters.editIndex != undefined) {
			currentKey = $scope.filters.editIndex;
		}
		$scope.filters.conditions[currentKey] = {
			field : $scope.filters.field,
			conditionType : $scope.filters.conditionType,
			filterValue : $scope.filters.filterValue
		};
		$scope.filters.field = undefined;
		$scope.filters.conditionType = undefined;
		$scope.filters.filterValue = undefined;
		$scope.filters.editIndex = undefined;
	}

	$scope.deleteFilter = function(filterKey) {
		$scope.filters.conditions.splice(filterKey,1);
	}

	$scope.editFilter = function(item, index){
		$scope.filters.field = item.field;
		$scope.filters.conditionType = item.conditionType;
		$scope.filters.filterValue = item.filterValue;
		$scope.filters.editIndex = index;
	}

	$scope.showSelected = function(argument) {
		console.log(argument)
	}
	$scope.sortableOptions = {
	    update: function(e, ui) {
	        console.log(e);
	    },
	    axis: 'x'
	  };
}
BuildViewController.$inject = ["$rootScope","$scope", "$filter", "apiCall", "apiPath", "apiResponse", "toaster", "getSetFactory"];