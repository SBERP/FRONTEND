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
    $scope.headers = {};
    $scope.reportGroups = [];
    var reloadingDt = true;
    $scope.filters = {
        conditions: [],
        editIndex: undefined
    };
    vm.previewInputIndex = -1;
    vm.previewContextIndex = -1;
    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true
    }
    $scope.preview = {
        groupBy: {},
        orderBy: {},
        columns: [],
        data: [
            { 'invoice_no': 'Tg-123', 'total': 904.68 },
            { 'invoice_no': 'Tg-124', 'total': 43.12 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
            { 'invoice_no': 'Tg-125', 'total': 126.75 },
        ]
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


    $scope.fields = [{
        "label": "Sales Bill",
        "id": "sale_bill",
        "children": [{
                "label": "Sales",
                "id": "bill",
                "children": [
                    { "label": "Invoice", "id": "invoice_no" },
                    { "label": "Total", "id": "total" }
                ]
            },
            { "label": "Total", "id": "total" },
        ]
    }];
    $scope.reloadDt = function() {
        if (reloadingDt) {
            reloadingDt = false;
            var fields = angular.copy($scope.fields);
            $scope.fields = [];
            setTimeout(function() {
                reloadingDt = true;
                $scope.fields = fields;
            }, 100);
        }
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
        table.previewInputIndex = -1;
        table.previewContextIndex = -1;
    }
    $scope.showSelected = function(argument) {
        console.log(argument)
    }
}
BuildViewController.$inject = ["$rootScope", "$scope", "$filter", "apiCall", "apiPath", "apiResponse", "toaster", "getSetFactory", "ReportGroupFactory"];