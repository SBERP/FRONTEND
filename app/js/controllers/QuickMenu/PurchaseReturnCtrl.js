App.controller('PurchaseReturnController', PurchaseReturnController);

function PurchaseReturnController($rootScope, $scope, apiCall, apiPath, apiResponse, $modal, productArrayFactory, productFactory, getSetFactory, toaster, $anchorScroll, stateCityFactory, $filter, $state, bankFactory) {
	'use strict';
	var vm = this;
	var formdata = new FormData();
    var dateFormats = $rootScope.dateFormats; //Date Format
    vm.disableCompany = false;
    var Modalopened = false;
    $scope.purchaseBill = [];
    vm.AccExpense = [];
    vm.AccBillTable = [];
    vm.productHsn = [];
    vm.measurementUnitDrop = [];

    $scope.noOfDecimalPoints;
    $scope.purchaseBill.tax = 0; //Tax

    $scope.totalTable_without_expense;
    $scope.totalTable;
    $scope.grandTotalTable;
    $scope.purchaseBill.balanceTable;
    $scope.igstDisable = true;
    $scope.csgstDisable = false;

    $scope.getCurrentFinancialYear = function() {
    	var fiscalyear = '';
    	var today = new Date();
    	if (today.getMonth() + 1 <= 3) {
    		fiscalyear = today.getFullYear() - 1 + '-' + today.getFullYear();
    	} else {
    		fiscalyear = today.getFullYear() + '-' + (today.getFullYear() + 1);
    	}
    	return fiscalyear;
    };

    vm.bankDrop = [];
    bankFactory.getBank().then(function(response) {
    	var count = response.length;
    	while (count--) {
    		vm.bankDrop.push(response[count].bankName);
    	}
    });

    $scope.defaultCompany = function() {
    	toaster.clear();
    	toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);

    	vm.loadData = true;

        //Set default Company
        var response2 = apiCall.getDefaultCompanyFilter(vm.companyDrop);
        var id = response2.companyId;
        $scope.displayDefaultCompanyName = response2.companyName;
        $scope.purchaseBill.companyDropDown = response2;

        /* Branch */
        loadBranchesOfCompany(id, function(branchres) {
        	toaster.clear();
        	if (angular.isArray(branchres)) {
        		if (branchres.length > 0) {
        			$scope.purchaseBill.branchId = branchres[0];
        			formdata.set('branchId', branchres[0].branchId);
        		}
        	}
        });
        /* End */

        $scope.purchaseBill.companyId = response2;

        formdata.delete('companyId');
        formdata.set('companyId', response2.companyId);
        $scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
        // Invoice#
        //Auto Suggest Product Dropdown data
        vm.productNameDrop = [];
        //Get Bank Ledger of this Company
    };

    function loadBranchesOfCompany(companyId, callback) {
    	/* Branch */
    	vm.branchDrop = [];
    	var getAllBranch = apiPath.getOneBranch + companyId;
        //Get Branch
        apiCall.getCall(getAllBranch).then(function(response4) {
        	vm.branchDrop = response4;
        	callback(response4);
        });
        /* End */
    }

    apiCall.getCall(apiPath.getAllCompany).then(function(response2) {
    	toaster.clear();
    	toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);
    	vm.companyDrop = response2;
    	$scope.defaultCompany();
    });

    $scope.changeCompany = function(item) {
    	if (angular.isObject(item)) {
    		vm.loadData = true;
    		toaster.clear();
    		toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);

    		loadBranchesOfCompany(item.companyId, function(branchres) {
    			formdata.delete('branchId');
    			if (angular.isArray(branchres)) {
    				if (branchres.length > 0) {
    					$scope.purchaseBill.branchId = branchres[0];
    					formdata.set('branchId', branchres[0].branchId);
    				}
    			}
    		});
    		$scope.noOfDecimalPoints = parseInt(item.noOfDecimalPoints);
    		$scope.displayDefaultCompanyName = item.companyName;
    		vm.productNameDrop = [];
    		vm.AccBillTable = [{
    			productId: '',
    			productName: '',
    			color: '',
    			frameNo: '',
    			discountType: 'flat',
    			price: 0,
    			discount: '',
    			qty: 1,
    			amount: '',
    			size: '',
    			variant: '',
    		}, ];
    		vm.productHsn = [];
    		if ($scope.enableDisableAdvanceMou) {
    			vm.measurementUnitDrop = [];
    		}
    		$scope.purchaseBill.advance = 0;
    		formdata.delete('companyId');
    		formdata.set('companyId', item.companyId);
    	}
    };

    $scope.goInvoiceNumber = function() {
    	toaster.clear();
    	if (
    		$scope.purchaseBill.searchInvoiceNumber == '' ||
    		angular.isUndefined($scope.purchaseBill.searchInvoiceNumber)
    		) {
    		toaster.pop('error', 'Search Box in Blank');
    	return false;
    }
    toaster.pop('wait', 'Please Wait', 'Searching...', 600000);

    var BillPath =
    apiPath.PurchaseBillByCompany +
    $scope.purchaseBill.companyDropDown.companyId;
    var preHeaderData = {
    	'Content-Type': undefined,
    	billNumber: $scope.purchaseBill.searchInvoiceNumber,
    };
    apiCall.getCallHeader(BillPath, preHeaderData).then(function(response) {
    	toaster.clear();
    	if (angular.isArray(response)) {
    		if (response.length > 1) {
    			$scope.openBillHistoryModal('lg', response);
    		} else {
    			$scope.purchaseBill = [];
    			getSetFactory.set(response[0]);
    			$scope.EditAddBill();
    			$anchorScroll();
    		}
    	} else {
    		if (
    			apiResponse.noContent == response ||
    			apiResponse.notFound == response
    			) {
    			toaster.clear();
    		toaster.pop('info', 'Opps!!', 'Data Not Available');
    	} else if (response.status == 500) {
    		toaster.clear();
    		toaster.pop('warning', 'Something Wrong', response.statusText);
    	} else {
    		toaster.clear();
    		toaster.pop('warning', 'Something Wrong', response);
    	}
    }
});
};

$scope.openBillHistoryModal = function(size, responseData) {
	toaster.clear();
	if (Modalopened) return;

	toaster.pop('wait', 'Please Wait', 'Modal Data Loading....', 60000);
	var modalInstance = $modal.open({
		templateUrl: 'app/views/PopupModal/QuickMenu/myHistoryPurchaseBillModalContent.html',
		controller: historySalesBillModaleCtrl,
		size: size,
		resolve: {
			responseData: function() {
				return responseData;
			},
			draftOrSalesOrder: function() {
				return 'draft';
			},
		},
	});

	Modalopened = true;

	modalInstance.opened.then(function() {
		toaster.clear();
	});

	modalInstance.result.then(
		function() {
			toaster.clear();
			Modalopened = false;
			$scope.EditAddBill();
			$anchorScroll();
		},
		function() {
			toaster.clear();
			Modalopened = false;
		}
		);
};

$scope.EditAddBill = function() {
	$scope.openedItemizeTree = 0;
	vm.productNameDrop = [];
	vm.AccBillTable = [{
		productId: '',
		productName: '',
		color: '',
		frameNo: '',
		discountType: 'flat',
		price: 0,
		discount: '',
		qty: 1,
		amount: '',
		size: '',
		variant: '',
	}, ];
	vm.productHsn = [];
	if ($scope.enableDisableAdvanceMou) {
		vm.measurementUnitDrop = [];
	}
	if (Object.keys(getSetFactory.get()).length) {
		
		vm.loadData = true;
		formdata = undefined;
		formdata = new FormData();
		$scope.purchaseBill.EditBillData = getSetFactory.get();
		getSetFactory.blank();
		var companyEditData = $scope.purchaseBill.EditBillData.company; // For Sync call 
		$scope.displayDefaultCompanyName = companyEditData.companyName;
		apiCall.getCall(apiPath.getAllCompany).then(function(response2) {
			vm.companyDrop = response2;
			$scope.purchaseBill.companyDropDown = companyEditData; //Company
			vm.disableCompany = true;
        });

		$scope.noOfDecimalPoints = parseInt(companyEditData.noOfDecimalPoints);
		vm.productNameDrop = [];
		var jsonProduct = angular.fromJson(
			$scope.purchaseBill.EditBillData.productArray
			);
		vm.productNameDrop = jsonProduct.inventory;
		vm.loadData = false;
		var jsonExpense = angular.fromJson(
			$scope.purchaseBill.EditBillData.expense
			);
		$scope.purchaseBill.paymentMode = 'cash';
	}
};
}
PurchaseReturnController.$inject = ['$rootScope', '$scope', 'apiCall', 'apiPath', 'apiResponse', '$modal', 'productArrayFactory', 'productFactory', 'getSetFactory', 'toaster', '$anchorScroll', 'stateCityFactory', '$filter', '$state', 'bankFactory'];