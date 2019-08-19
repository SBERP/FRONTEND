
/**=========================================================
 * Module: AddInvStockCtrl.js
 * Controller for input components
 =========================================================*/

App.controller('AccViewController', AccViewController);

function AccViewController($rootScope,$scope,apiCall,apiPath,$state,viewDataType,apiResponse,validationMessage,toaster,clientFactory,stateCityFactory,fetchArrayService,productFactory) {
  'use strict';
  
  var vm = this; 
  $scope.accViewSales = [];
  $scope.crmButtonHide = false;

  $scope.viewDataTypePath = viewDataType;
  var dateFormats = $rootScope.dateFormats; //Date Format

$scope.enableDisableAddress = false;
$scope.enableDisableEmailId = false;
  var settingResponse = [];
  	productFactory.getProduct();
  	
  	if ($scope.viewDataTypePath == 'CrmClientFilterView'){

  		//get setting data
		$scope.getOptionSettingData = function(){
			toaster.clear();
			apiCall.getCall(apiPath.settingOption).then(function(response){
				settingResponse = response;
				getSettingData(response);
			});
		}
		$scope.getOptionSettingData();

		function getSettingData(response)
		{
			var responseLength = response.length;
			// console.log("setting response",response);
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(angular.isObject(response) || angular.isArray(response))
				{
					if(response[arrayData].settingType=="client")
					{
						var arrayData1 = response[arrayData];
						$scope.enableDisableAddress = arrayData1.clientAddressStatus=="enable" ? true : false;
						$scope.enableDisableEmailId = arrayData1.clientEmailIdStatus=="enable" ? true : false;
						
					}
				}
			}
		}

  	}
  	vm.salesmanDrop = [];
  	if ($scope.viewDataTypePath == 'Commission Report') {
  		// var headerDataOnLoad = {'Content-Type': undefined,'companyId':companyId};
		apiCall.getCall(apiPath.getAllStaff).then(function(response2){
			toaster.clear();
			if(apiResponse.noContent == response2){
				toaster.pop('alert', 'Opps!!', 'No Staff Available');
			}
			else{
				vm.salesmanDrop = response2;
			}
		});
  		$scope.filterStaff = function(value , index , array ){
			if ((value.userType == "salesman" || $rootScope.$storage.authUser.userId == value.userId) && 
				value.company.companyId == $scope.accViewSales.companyDropDown.companyId)
			{
				return true;
			}
	    }
  	}
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	this.salesTypeDrop = [
	'All',
	'Retailsales',
	'Wholesales'
  ];
  //'Retailsales',
	// 'Wholesales'
	$scope.accViewSales.salesType = 'All';
	
	$scope.companyApiLoad = function(){
		loadingStart();
		//Company Dropdown data
		vm.companyDrop = [];
		apiCall.getCall(apiPath.getAllCompany).then(function(responseCompanyDrop){
			vm.companyDrop = responseCompanyDrop;
			var  defaultCompanyData = apiCall.getDefaultCompanyFilter(responseCompanyDrop);
		
			toaster.clear();
			$scope.accViewSales.companyDropDown = defaultCompanyData;
			
			if ($scope.viewDataTypePath == 'Wholesales') {

				if (angular.isObject(defaultCompanyData)) {

					vm.branchDrop = [];
					var getAllBranch = apiPath.getOneBranch+defaultCompanyData.companyId;
					// Get Branch
					apiCall.getCall(getAllBranch).then(function(response4){
						
						vm.branchDrop = response4;
						if(angular.isArray(response4)){
							if (response4.length > 0){
								$scope.accViewSales.branchDropDown = response4[0];
							}
						}
					});
				}
			}
		});
	}

	if($scope.viewDataTypePath != 'CrmClientFilterView'){
		$scope.companyApiLoad();
	}
	
	$scope.clientGetAllFunction = function(){
		$scope.crmButtonHide = true;
		loadingStart();

		vm.clientSuggest = [];
		clientFactory.getClient().then(function(responseDrop){
			
			$scope.crmButtonHide = false;
			setTimeout(function() {
				toaster.clear();
			}, 1000);

			vm.clientSuggest = responseDrop;
		});
		
		vm.professionDrop = [];
		clientFactory.getProfession().then(function(responseDrop){
			vm.professionDrop = responseDrop;
		});
	
	}
	
	if($scope.viewDataTypePath == 'CrmClientFilterView'){
		//$scope.crmButtonHide = true;
		stateCityFactory.getState();
		//stateCityFactory.getState().then(function(){
			//$scope.crmButtonHide = false;
			//setTimeout(function() {
			//	toaster.clear();
			//}, 1000);
		//});

		$scope.clientGetAllFunction();
	}
	
	function loadingStart(){
		setTimeout(function() {
			toaster.pop('wait', 'Please Wait', 'Data Loading....',10000);
		}, 500);
		
	}
	
  	//Get All Branch on Company Change
  	$scope.changeCompany = function(id)
  	{
		if ($scope.viewDataTypePath == 'Wholesales') {

			vm.branchDrop = [];
			var getAllBranch = apiPath.getOneBranch+id;
			// Get Branch
			apiCall.getCall(getAllBranch).then(function(response4){
				toaster.clear();
				vm.branchDrop = response4;
				if(angular.isArray(response4)){
					if (response4.length > 0){
						$scope.accViewSales.branchDropDown = response4[0];
					}
				}
			});
		}
  	}
  
	$scope.dateFilter = function(pDate){
		
		var  fromdate = new Date(pDate);
		var modifyFromDate  = fromdate.getDate()+'-'+(fromdate.getMonth()+1)+'-'+fromdate.getFullYear();
		
		return modifyFromDate;
		
	}
	
	$scope.redirectToData = function(){
		
		//var viewDataTypePath = viewDataType;
		// var  fromdate = new Date(vm.dt1);
		// var modifyFromDate  = fromdate.getDate()+'-'+(fromdate.getMonth()+1)+'-'+fromdate.getFullYear();
		
		// var  todate = new Date(vm.dt2);
		// var modifyToDate  = todate.getDate()+'-'+(todate.getMonth()+1)+'-'+todate.getFullYear();
		var modifyFromDate = $scope.dateFilter(vm.dt1);
		var modifyToDate = $scope.dateFilter(vm.dt2);
		
		if($scope.accViewSales.companyDropDown){
			$rootScope.accView.companyId = $scope.accViewSales.companyDropDown.companyId;
		}
		if ($scope.accViewSales.branchDropDown) {
			$rootScope.accView.branchId = $scope.accViewSales.branchDropDown.branchId;
		} else {
			if ($rootScope.accView.branchId) {
				delete $rootScope.accView.branchId;
			}
		}
		
		if($scope.viewDataTypePath == 'CrmClientFilterView'){
		//	console.log($scope.accViewSales.professionDropDown);
			$rootScope.accView.clientContact = $scope.accViewSales.clientContact;
			$rootScope.accView.clientName = $scope.accViewSales.clientName;
			$rootScope.accView.professionId = $scope.accViewSales.professionDropDown != undefined ? $scope.accViewSales.professionDropDown.professionId:'';
			$rootScope.accView.emailId = $scope.accViewSales.emailId;
			$rootScope.accView.address = $scope.accViewSales.address;
			$rootScope.accView.invoiceNumber = $scope.accViewSales.invoiceNumber;
			$rootScope.accView.jobCardNumber = $scope.accViewSales.jobCardNumber;
			
			var jobcardModifyFromDate = $scope.dateFilter(vm.jobcardDate1);
			var jobcardModifyToDate = $scope.dateFilter(vm.jobcardDate2);
		
			$rootScope.accView.jobCardFromDate = jobcardModifyFromDate; // Jobcard FromDate
			$rootScope.accView.jobCardToDate = jobcardModifyToDate; // Jobcard TODate
			
		}
		if ($scope.viewDataTypePath == 'Commission Report') {
			$rootScope.accView.userData = $scope.accViewSales.salesmanDropdown;
		}
		$rootScope.accView.fromDate = modifyFromDate; // FromDate
		$rootScope.accView.toDate = modifyToDate; // TODate
		
		if($scope.viewDataTypePath == 'sales'){
			
			if($scope.accViewSales.salesType == 'Retailsales'){
				
				$rootScope.accView.salesType = 'retail_sales';
			}
			else if($scope.accViewSales.salesType == 'Wholesales'){
				
				$rootScope.accView.salesType = 'whole_sales';
			}
			else{
				
				$rootScope.accView.salesType = 'all';
			}
			
		}
		
		if($scope.viewDataTypePath == 'sales'){
			
			$state.go("app.AccDataSales");
			
		}
		else if($scope.viewDataTypePath == 'Retailsales'){
			
			$state.go("app.AccDataRetailSales");
		}
		else if($scope.viewDataTypePath == 'Wholesales'){
			
			$state.go("app.AccDataWholeSales");
		}
		else if($scope.viewDataTypePath == 'Sales Orders'){
			
			$state.go("app.AccDataSalesOrders");
		}
		else if($scope.viewDataTypePath == 'Quotations'){
			$state.go("app.AccDataQuotations");
		}
		else if($scope.viewDataTypePath == 'Quotations Process'){
			$state.go("app.AccDataQuotationsFlow");
		}
		else if($scope.viewDataTypePath == 'purchase'){
			
			$state.go("app.AccDataPurchase");
		}
		else if($scope.viewDataTypePath == 'Tax-Purchase'){
			
			$state.go("app.AccDataTaxPurchase");
		}
		else if($scope.viewDataTypePath == 'payment'){
			
			$state.go("app.AccDataPayment");
		}
		else if($scope.viewDataTypePath == 'receipt'){
			
			$state.go("app.AccDataReceipt");
		}
		else if($scope.viewDataTypePath == 'specialJournal'){
			
			$state.go("app.AccDataSpecialJrnl");
		}
		else if($scope.viewDataTypePath == 'salesTaxation'){
			
			$state.go("app.AccSalesTaxation");
		}
		else if($scope.viewDataTypePath == 'purchaseTaxation'){
			
			$state.go("app.AccPurchaseTaxation");
		}
		else if($scope.viewDataTypePath == 'purchaseDetailTaxation'){
			
			$state.go("app.AccPurchaseDetailTaxation");
		}
		else if($scope.viewDataTypePath == 'GST Return'){
			
			$state.go("app.AccDataGstReturn");
		}
		else if($scope.viewDataTypePath == 'GST Return2'){
			
			$state.go("app.AccDataGstReturn2");
		}
		else if($scope.viewDataTypePath == 'GST Return3'){
			
			$state.go("app.AccDataGstReturn3");
		}
		else if($scope.viewDataTypePath == 'GST Return3b'){
			
			$state.go("app.AccDataGstReturn3b");
		}
		else if($scope.viewDataTypePath == 'PoliceReport'){
			
			$state.go("app.ReportPoliceData");
		}
		else if($scope.viewDataTypePath == 'Commission Report'){
			
			$state.go("app.ReportCommissionData");
		}
		else if($scope.viewDataTypePath == 'CrmClientFilterView'){
			
			$state.go("app.CrmClientFilterData");
		}
		else if($scope.viewDataTypePath == 'creditNote'){
			
			$state.go("app.AccDataCreditNotes");
		}
		 //$state.go("app.AccDataSales");
		
	}
	
	
	//Date Change Event
	this.changeInvoiceDate = function(){
		vm.dt1 == null ? vm.dt1 = new Date() : '';
		vm.dt2 == null ? vm.dt2 = new Date() : '';
	}

	this.changeJobcardDate = function(){
		vm.jobcardDate1 == null ? vm.jobcardDate1 = new Date() : '';
		vm.jobcardDate2 == null ? vm.jobcardDate2 = new Date() : '';
	}
	
	
  // Datepicker
  // ----------------------------------- 
	this.minStart = new Date(0,0,1);
	this.maxStart = new Date();
	
  this.today = function() {
	 
    this.dt1 = new Date();
	if($scope.viewDataTypePath == 'CrmClientFilterView'){
		this.dt1 = null;
	}
  };
   
  
  this.today();
  
  this.today2 = function() {
	if($scope.viewDataTypePath == 'GST Return'){
		this.dt2 = new Date();
		 this.dt1.setMonth( this.dt1.getMonth() - 1);
	}
	else{
		 this.dt2 = this.dt1;
	}
	if($scope.viewDataTypePath == 'CrmClientFilterView'){
		this.dt2 = null;
	}
  };
  this.today2();
	
	/** JObcard **/
	
		this.todayJobcard = function() {
			this.jobcardDate1 = new Date();
			if($scope.viewDataTypePath == 'CrmClientFilterView'){
				this.jobcardDate1 = null;
			}
		};
	   
	  
		this.todayJobcard();
	  
		this.todayJobcard2 = function() {
			this.jobcardDate2 = this.jobcardDate1;
			if($scope.viewDataTypePath == 'CrmClientFilterView'){
				this.jobcardDate2 = null;
			}
		};
		this.todayJobcard2();
  
	/** End **/
	
	this.check = function()
  {
	  
	 this.dt2 = this.dt1;
  };
  
  this.clear = function () {
    this.dt1 = null;
  };

  // Disable weekend selection
  this.disabled = function(date, mode) {
	
    return false; //( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  // this.toggleMin = function() {
    // this.minDate = this.minDate ? null : new Date();
  // };
  // this.toggleMin();

  this.openStart = function($event) {
	  
    $event.preventDefault();
    $event.stopPropagation();

    this.openedStart = true;
  };
  
  this.openEnd = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.openedEnd = true;
  };
  
  /** JObcard **/
   this.openStartJobcard = function($event) {
	  
    $event.preventDefault();
    $event.stopPropagation();

    this.openedStartJobcard = true;
  };
  
  this.openEndJobcard = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.openedEndJobcard = true;
  };
/** End **/
  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  this.initDate = new Date('2016-15-20');
  // this.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
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
    this.ismeridian = ! this.ismeridian;
  };

  this.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    this.mytime = d;
  };

  this.changed = function () {
    console.log('Time changed to: ' + this.mytime);
  };

  this.clear = function() {
    this.mytime = null;
  };

  // Input mask
  // ----------------------------------- 

  this.testoption = {
        "mask": "99-9999999",
        "oncomplete": function () {
            console.log();
            console.log(arguments,"oncomplete!this log form controler");
        },
        "onKeyValidation": function () {
            console.log("onKeyValidation event happend! this log form controler");
        }
    };

  //default value
  this.test1 = new Date();

  this.dateFormatOption = {
      parser: function (viewValue) {
          return viewValue ? new Date(viewValue) : undefined;
      },
      formatter: function (modelValue) {
          if (!modelValue) {
              return "";
          }
          var date = new Date(modelValue);
          return (date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()).replace(/\b(\d)\b/g, "0$1");
      },
      isEmpty: function (modelValue) {
          return !modelValue;
      }
  };

  this.mask = { regex: ["999.999", "aa-aa-aa"]};

  this.regexOption = {
      regex: "[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+\\.[a-zA-Z]{2,4}"
  };

  this.functionOption = {
   mask: function () {
      return ["[1-]AAA-999", "[1-]999-AAA"];
  }};

  // Bootstrap Wysiwyg
  // ----------------------------------- 
 
  this.editorFontFamilyList = [
    'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier',
    'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact',
    'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
    'Times New Roman', 'Verdana'
  ];
  
  this.editorFontSizeList = [
    {value: 1, name: 'Small'},
    {value: 3, name: 'Normal'},
    {value: 5, name: 'Huge'}
  ];
  
  
  
}
AccViewController.$inject = ["$rootScope","$scope","apiCall","apiPath","$state","viewDataType","apiResponse","validationMessage","toaster","clientFactory","stateCityFactory","fetchArrayService","productFactory"];