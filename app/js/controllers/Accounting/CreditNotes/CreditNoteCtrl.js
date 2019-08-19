App.controller('CreditNoteController', CreditNoteController);
function CreditNoteController($rootScope, $scope, $state, $filter, apiCall, apiPath, apiResponse, toaster, getSetFactory, $anchorScroll, stateCityFactory, clientFactory, $modal) {
	'use strict';
	var vm = this;
	var formdata = new FormData();
	var dateFormats = $rootScope.dateFormats; //Date Format
	vm.disableCompany = false;
	var Modalopened = false;
	vm.loadData = false;
	$scope.disableButton = false;
	$scope.creditNote = {};
	vm.companyDrop = [];
	vm.totalCredit = 0;
	$scope.displayDefaultCompanyName = '';
	const defaultTableItem = {
		clientId: 0,
		clientName: '',
		ledgerId: 0,
		amount: 0
	};
	apiCall.getCall(apiPath.getAllCompany).then(function(response2) {
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);
		vm.companyDrop = response2;
		$scope.defaultCompany();
	});

	$scope.defaultCompany = function() {
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);
		vm.loadData = true;
		var response2 = apiCall.getDefaultCompanyFilter(vm.companyDrop);
		$scope.displayDefaultCompanyName = response2.companyName;
		$scope.creditNote.companyDropDown = response2;
		$scope.creditNote.companyId = response2;
		toaster.clear();
	}

	$scope.getCurrentFinancialYear = function() {
		var fiscalyear = '';
		var today = new Date();
		if (today.getMonth() + 1 <= 3) {
			fiscalyear = today.getFullYear() - 1 + '-' + today.getFullYear();
		} else {
			fiscalyear = today.getFullYear() + '-' + (today.getFullYear() + 1);
		}
		return fiscalyear;
	}

	$scope.enableDisableAddress = false;
	$scope.enableDisableWorkNo = false;
	$scope.enableDisableState = false;
	$scope.enableDisableCity = false;
	$scope.enableDisableEmailId = false;
	$scope.enableDisableProfession = false;

	$scope.getOptionSettingData = function(){
		toaster.clear();
		apiCall.getCall(apiPath.settingOption).then(function(response){
			getSettingData(response);
			$scope.EditAddBill();
		});
	}
	$scope.getOptionSettingData();

	function getSettingData(response)
	{
		const clientSetting = response.find(re => {
			return re.settingType == 'client';
		});
		$scope.enableDisableAddress = clientSetting.clientAddressStatus=="enable" ? true : false;
		$scope.enableDisableWorkNo = clientSetting.clientWorkNoStatus=="enable" ? true : false;
		$scope.enableDisableState = clientSetting.clientStateStatus=="enable" ? true : false;
		$scope.enableDisableCity = clientSetting.clientCityStatus=="enable" ? true : false;
		$scope.enableDisableEmailId = clientSetting.clientEmailIdStatus=="enable" ? true : false;
		$scope.enableDisableProfession = clientSetting.clientProfessionStatus=="enable" ? true : false;
		if(clientSetting.clientStateStatus=="disable")
		{
			$scope.creditNote.stateAbb = {};
		}
		if(clientSetting.clientCityStatus=="disable")
		{
			$scope.creditNote.cityId = {};
		}
	}

	$scope.changeCompany = function(item)
	{		
		if(angular.isObject(item)){
			vm.loadData = true;
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);

			$scope.noOfDecimalPoints = parseInt(item.noOfDecimalPoints);
			$scope.displayDefaultCompanyName = item.companyName;
			$scope.creditNote.companyId = item;
			
			$scope.printButtonType = item.printType == '' ? 'print':item.printType;
			
			formdata.delete('companyId');
			formdata.set('companyId',item.companyId);
		}
	}

	$scope.goInvoiceNumber = function()
	{
		toaster.clear();
		if($scope.creditNote.searchInvoiceNumber == '' || angular.isUndefined($scope.creditNote.searchInvoiceNumber)){
			toaster.pop('error', 'Search Box in Blank');
			return false;
		}
		toaster.pop('wait', 'Please Wait', 'Searching...',600000);
		
		var BillPath = apiPath.getBill+$scope.creditNote.companyId.companyId;
		var preHeaderData = {'Content-Type': undefined,'invoiceNumber':$scope.creditNote.searchInvoiceNumber};
		preHeaderData.salesType = 'whole_sales';

		apiCall.getCallHeader(BillPath,preHeaderData).then(function(response){
			
			toaster.clear();
			if(angular.isArray(response)){
				
				if(response.length > 1){
					$scope.openBillHistoryModal('lg',response);
				}
				else{
					
					$scope.creditNote = [];
					getSetFactory.set(response[0]);
					$scope.EditAddBill();
					$anchorScroll();
				}
			}
			else{
				
				if(apiResponse.noContent == response || apiResponse.notFound == response){
					toaster.clear();
					toaster.pop('info', 'Opps!!', 'Data Not Available');
				}
				else if(response.status == 500){
					toaster.clear();
					toaster.pop('warning', 'Something Wrong', response.statusText);
				}
				else{
					toaster.clear();
					toaster.pop('warning', 'Something Wrong', response);
				}
				
			}
			
		});
	}

	$scope.openBillHistoryModal = function (size,responseData) {

		toaster.clear();
		if (Modalopened) return;

		toaster.pop('wait', 'Please Wait', 'Modal Data Loading....',60000);

		var modalInstance = $modal.open({
			templateUrl: 'app/views/PopupModal/QuickMenu/myHistorySalesBillModalContent.html',
			controller: historySalesBillModaleCtrl,
			size: size,
			resolve:{
				responseData: function(){
					return responseData;
				},
				draftOrSalesOrder: function(){
					return undefined;
				}
			}
		});

		Modalopened = true;

		modalInstance.opened.then(function() {
			toaster.clear();
		});

		modalInstance.result.then(function () {
			toaster.clear();
			Modalopened = false;
			$scope.EditAddBill();
			$anchorScroll();
		}, function () {
			toaster.clear();
			Modalopened = false;
		});
	}
	$scope.EditAddBill = function() {
		vm.AccBillTable = [];
		vm.AccBillTable[0] = Object.assign({}, defaultTableItem);
		vm.clientNameDrop = [];
		if(Object.keys(getSetFactory.get()).length) {
			vm.loadData = true;
			$scope.creditNote.editData = getSetFactory.get();
			getSetFactory.blank();
			if(parseFloat($scope.creditNote.editData.balance) <= 0) {
				toaster.clear();
				toaster.pop('warning', 'Paid Bills can\'t be included in credit notes.');
				setTimeout(() => {
					$scope.EditAddBill();
				}, 1000);
				return;
			}
			$scope.creditNote.companyDropDown = Object.assign({}, $scope.creditNote.editData.company);
			$scope.creditNote.companyId = Object.assign({}, $scope.creditNote.editData.company);
			stateCityFactory.getState().then(function(response3){
				toaster.clear();
				$scope.creditNote.editData.client.stateName = stateCityFactory.getDefaultState($scope.creditNote.editData.client.stateAbb).stateName;
				$scope.creditNote.editData.client.cityName = stateCityFactory.getDefaultCity($scope.creditNote.editData.client.cityId).cityName;
			});
			clientFactory.getSingleClient($scope.creditNote.editData.client.clientId).then(res => {
				vm.clientNameDrop.push(res);
				vm.loadData = false;
			});
			toaster.clear();
		} else {
			vm.disableCompany = false;
			//get Company
			vm.companyDrop=[];
			apiCall.getCall(apiPath.getAllCompany).then(function(response2) {
				toaster.clear();
				toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
				vm.companyDrop = response2;
				$scope.defaultCompany();
			});
			$scope.creditNote = [];
		}
	}

	$scope.setClientData = function(clientObj, index) {
		vm.AccBillTable[index].clientId = 0;
		vm.AccBillTable[index].clientName = '';
		vm.AccBillTable[index].ledgerId = 0;
		let status = clientObj.closingBalance.length;
		while(status) {
			status--;
			if(clientObj.closingBalance[status].companyId == $scope.creditNote.companyId.companyId) {
				vm.AccBillTable[index].clientId = clientObj.clientId;
				vm.AccBillTable[index].clientName = clientObj.clientName;
				vm.AccBillTable[index].ledgerId = clientObj.closingBalance[status].ledgerId;
				status = 0;
			}
			if(status == 0) {
				if(vm.AccBillTable[index].ledgerId == 0) {
					toaster.pop('warning', 'Invalid Client data!');
				}
			}
		}
	}

	$scope.changeAmount = function() {
		let tempArray = Object.assign([], vm.AccBillTable);
		if(tempArray.length == 1) {
			vm.totalCredit = +tempArray[0].amount;
		} else {
			vm.totalCredit = tempArray.reduce((a,b) => {
				return parseFloat(a.amount) + parseFloat(b.amount);
			});
		}
	}

	$scope.addRow = function(index){
		
		var plusOne = index+1;
		let removeDups = Object.assign({}, defaultTableItem);
		vm.AccBillTable.splice(plusOne,0,removeDups);
	};

	$scope.removeRow = function (idx) {
		vm.AccBillTable.splice(idx,1);
		$scope.changeAmount();
	};

	$scope.cancel = function() {
		$scope.EditAddBill();
	}

	$scope.pop = function() {
		$scope.disableButton = true;
		if(!angular.isDefined($scope.creditNote.editData.saleId) || $scope.creditNote.editData.saleId == 'undefined') {
			toaster.pop('info', 'No Sales Bill Selected to generate Credit Note.');
			$scope.disableButton = false;
			return false;
		}
		toaster.pop('wait', 'Please Wait', 'Data Inserting....',600000);
		var  date = new Date(vm.dt1);
		var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
		if (!formdata.has('entryDate')) {
			formdata.set('entryDate',fdate);
		}
		console.log(vm.AccBillTable);
		formdata.set('transactionDate',fdate);
		var productJson = angular.copy(vm.AccBillTable);
		for (var i = 0; i < productJson.length; i++) {
			angular.forEach(productJson[i], function (value,key) {

				formdata.set('inventory['+i+']['+key+']',value);
			});
		}
		formdata.set('saleId',$scope.creditNote.editData.saleId);
		formdata.set('invoiceNumber',$scope.creditNote.editData.invoiceNumber);
		formdata.set('total',vm.totalCredit);
		formdata.set('remark', $scope.creditNote.remark);
		formdata.set('companyId', $scope.creditNote.companyId.companyId);
		apiCall.postCall(apiPath.creditNote+'/'+$scope.creditNote.editData.saleId,formdata).then(function(response){
			toaster.clear();
			if(apiResponse.ok == response) {
				$state.go($state.current, {}, {reload: true});
				toaster.pop('success', 'Data Inserted!!');
			}
			else{
				toaster.pop('warning', 'Opps!!', response);
			}
		});
	}

	this.minStart = new Date();

	this.today = function() {
		this.dt1 = new Date();
	};
	this.today();

	this.clear = function() {
		//this.dt1 = null;
	};

	// Disable weekend selection
	this.disabled = function(date, mode) {
		return false; //( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	this.toggleMin = function() {
		this.minDate = this.minDate ? null : new Date();
	};
	this.toggleMin();

	this.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		this.opened = true;
	};

	this.openStart = function($event) {

		$event.preventDefault();
		$event.stopPropagation();

		this.openedStart = true;
	};

	this.openStartServiceDate = function($event) {

		$event.preventDefault();
		$event.stopPropagation();

		this.openedStartServiceDate = true;
	};

	this.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	this.dateOptions2 = {
		formatYear: 'yy',
		startingDay: 1
	};

	this.initDate = new Date('2016-15-20');
	this.format = dateFormats;

	// Timepicker
	// ----------------------------------- 
	this.mytime = new Date();

	this.hstep = 1;
	this.mstep = 15;

	this.options = {
		hstep: [1, 2, 3],
		mstep: [1, 5, 10, 15, 25, 30]
	};

	this.ismeridian = true;
	this.toggleMode = function() {
		this.ismeridian = !this.ismeridian;
	}

	this.update = function() {
		var d = new Date();
		d.setHours(14);
		d.setMinutes(0);
		this.mytime = d;
	}

	this.changed = function() {};

	this.clear = function() {
		//this.mytime = null;
	}

	// Input mask
	// ----------------------------------- 

	this.testoption = {
		"mask": "99-9999999",
		"oncomplete": function() {},
		"onKeyValidation": function() {}
	};

	//default value
	this.test1 = new Date();

	this.dateFormatOption = {
		parser: function(viewValue) {
			return viewValue ? new Date(viewValue) : undefined;
		},
		formatter: function(modelValue) {
			if (!modelValue) {
				return "";
			}
			var date = new Date(modelValue);
			return (date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()).replace(/\b(\d)\b/g, "0$1");
		},
		isEmpty: function(modelValue) {
			return !modelValue;
		}
	};

	this.mask = { regex: ["999.999", "aa-aa-aa"] };

	this.regexOption = {
		regex: "[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+\\.[a-zA-Z]{2,4}"
	};

	this.functionOption = {
		mask: function() {
			return ["[1-]AAA-999", "[1-]999-AAA"];
		}
	};
}
CreditNoteController.$inject = ["$rootScope", "$scope", "$state", "$filter", "apiCall", "apiPath", "apiResponse", "toaster", "getSetFactory", "$anchorScroll", "stateCityFactory", "clientFactory", "$modal"];