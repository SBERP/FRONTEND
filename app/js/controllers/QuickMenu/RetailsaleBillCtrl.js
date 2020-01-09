

// $.getScript('app/views/QuickMenu/DocumentScan/Resources/dynamsoft.webtwain.initiate.js');
// $.getScript('app/views/QuickMenu/DocumentScan/Resources/dynamsoft.webtwain.config.js');
//$.getScript('app/views/QuickMenu/DocumentScan/Scripts/script.js');

var taxInvoice = angular.module('taxInvoice',[]);
taxInvoice.directive('stateList',function(){
    return{
        required:'E',
        scope:{
            dataSet:'=dataSet',
            selectedState:'@',
            changeFunction: '&'
        },
        template:'<select chosen="" data-ng-model="selectedState" data-ng-options="s.stateName for s in dataSet track by s.stateAbb" ng-change="changeFunction" class="form-control input-sm chosen-select" ng-required="true" ></select>'
    }
});

taxInvoice.controller('RetailsaleBillController', RetailsaleBillController);

function RetailsaleBillController($rootScope,$scope,apiCall,apiPath,$http,$window,$modal,validationMessage,saleType,productArrayFactory,getSetFactory,toaster,apiResponse,$anchorScroll,maxImageSize,$sce,$templateCache,getLatestNumber,productFactory,stateCityFactory,$filter,$state,clientFactory,fetchArrayService,bankFactory) {
    'use strict';
    
    var vm = this;
    var formdata = new FormData();
    
    $scope.erpPath = $rootScope.erpPath; //Erp Path
    var dateFormats = $rootScope.dateFormats; //Date Format
    
    var api_quantity_pricing = apiPath.getAllProduct+'/';
    
    $scope.quickBill = [];
    $scope.displayDefaultCompanyName = "";
    
    vm.disableCompany = false;
    var Modalopened = false;
    
    $scope.saleType = saleType;
    
    vm.AccBillTable = [];
    vm.AccExpense = [];
    //vm.productTax = [];
    var defStateData = {};
    var AllDefCityData = [];
    var defCityData = {};
    $scope.openedItemizeTree = 0;
    $scope.noOfDecimalPoints; // decimalPoints For Price,Tax Etc.....
    
    $scope.productArrayFactory = productArrayFactory;
    
    $scope.changeProductArray = false; // Change When Update in Product Table Array
    $scope.changeProductAdvancePrice = false;  // Change Advance Price of Product
    $scope.enableDisableLWHArray = [];
    $scope.quickBill.tax = 0; //Tax
    
    $scope.total_without_expense;
    $scope.total;
    $scope.grandTotalTable;
    $scope.quickBill.balance;
    
    //Invoice Number 
    $scope.quickBill.invoiceNumber;
    $scope.quickBill.invoiceEndAt;
    $scope.quickBill.invoiceId;
    $scope.closingBalance = [];
    /* VALIDATION */
    
    $scope.errorMessage = validationMessage; //Error Messages In Constant
    
    /* VALIDATION END */
    vm.paymentModeDrop =['cash','bank','card','credit','neft','rtgs','imps','nach','ach'];
    
    $scope.quickBill.paymentMode = 'cash';
    vm.serviceDate;
    var arrayData1=[];
    
    //get settings date for set service-date
    apiCall.getCall(apiPath.settingOption).then(function(response2)
    {
        if(angular.isObject(response2) || angular.isArray(response2))
        {
            var responseLength = response2.length;
            for(var arrayData=0;arrayData<responseLength;arrayData++)
            {
                if(response2[arrayData].hasOwnProperty("servicedateNoOfDays"))
                {
                    arrayData1 = response2[arrayData];
                    if(arrayData1.settingType == "servicedate")
                    {
                        setTimeout(function() {
                            $scope.changeBillDate('entryDate');	
                        }, 1000);
                    }
                }
                else
                {
                    vm.serviceDate=vm.dt1.getDate();
                }
            }
        }
    });
    
    
    $scope.displayProductName = "productName";
    $scope.enableDisableAdvanceMou = false;
    $scope.enableDisableColor = false;
    $scope.enableDisableProductName =false;
    $scope.enableDisableSize = false;
    $scope.enableDisableVariant = false;
    $scope.enableDisableFrameNo = false;
    
    $scope.enableDisableAddress = false;
    $scope.enableDisableWorkNo = false;
    $scope.enableDisableState = false;
    $scope.enableDisableCity = false;
    $scope.enableDisableEmailId = false;
    $scope.enableDisableProfession = false;
    $scope.enableDisableLWHSetting = false;
    $scope.productMeasurementType = "normal";
    $scope.enableDisableSalesman = false;
    
    $scope.enableItemizedPurchaseSales = false;
    
    $scope.enableDisableTaxReadOnly = false;
    
    $scope.enableQuotationWorkflow = false;
    
    $scope.divTag = false;
    $scope.divAdvanceMou = false;
    $scope.colspanValue = '5';
    $scope.colspanAdvanceValue = '7';
    $scope.totalTd = '13';
    var settingResponse = [];
    $scope.ProductColorSizeVarDesign = 'productColorSizeWidth';
    //get setting data
    $scope.getOptionSettingData = function(){
        toaster.clear();
        apiCall.getCall(apiPath.settingOption).then(function(response){
            settingResponse = response;
            getSettingData(response);
            $scope.EditAddBill();
        });
    }
    $scope.getOptionSettingData();
    
    function getSettingData(response)
    {
        var responseLength = response.length;
        for(var arrayData=0;arrayData<responseLength;arrayData++)
        {
            if(angular.isObject(response) || angular.isArray(response))
            {
                if(response[arrayData].settingType=="product")
                {
                    var arrayData1 = response[arrayData];
                    $scope.divAdvanceMou = $scope.enableDisableAdvanceMou = arrayData1.productAdvanceMouStatus=="enable" ? true : false;
                    $scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
                    $scope.enableDisableQuantity = arrayData1.productColorStatus=="enable" ? true : false;
                    $scope.enableDisableProductName = arrayData1.productColorStatus=="enable" ? true : false;
                    $scope.enableDisableVariant = arrayData1.productVariantStatus=="enable" ? true : false;
                    $scope.enableDisableFrameNo = arrayData1.productFrameNoStatus=="enable" ? true : false;
                    $scope.divTag =  $scope.enableDisableProductName==false && $scope.enableDisableColor == false && $scope.enableDisableSize == false && $scope.enableDisableVariant == false ? false : true;
                    $scope.productMeasurementType = arrayData1.productMeasurementType;
                    if (arrayData1.productMeasurementType == 'Unit Measurement') {
                        $scope.enableDisableLWHSetting = true;
                    }
                    if ($scope.enableDisableColor && $scope.enableDisableProductName && $scope.enableDisableSize && $scope.enableDisableVariant)
                    {
                        $scope.ProductProductNameColorSizeVarDesign = 'ProductProductNameColorSizeVarDesign';
                    }else if (($scope.enableDisableColor && $scope.enableDisableSize) || 
                    ($scope.enableDisableVariant && $scope.enableDisableColor) ||
                    ($scope.enableDisableVariant && $scope.enableDisableSize)) {
                        $scope.ProductProductNameColorSizeVarDesign = 'productColorSizeDesign';
                    }
                    // $scope.colspanValue = $scope.divTag==false ? '5' : '6';
                    // $scope.totalTd = $scope.divTag==false ? '12' : '13';
                    if($scope.divTag==false && $scope.enableDisableFrameNo==false)
                    {
                        if($scope.enableDisableAdvanceMou == true) {
                            $scope.colspanAdvanceValue = '6';
                            $scope.colspanValue = '5';
                            $scope.totalTd = '12';
                        }
                        else{
                            $scope.colspanAdvanceValue = '5';
                            $scope.colspanValue = '4';
                            $scope.totalTd = '11';
                        }
                        
                    }
                    else if($scope.divTag==false || $scope.enableDisableFrameNo==false)
                    {
                        $scope.colspanAdvanceValue = '5';
                        $scope.colspanValue = '5';
                        $scope.totalTd = '12';
                    }
                    else
                    {
                        $scope.colspanAdvanceValue = '7';
                        $scope.colspanValue = '7';
                        $scope.totalTd = '13';
                    }
                    // $scope.colspanAdvanceValue = $scope.divTag==false ? '6' : '7';
                    // $scope.colspanAdvanceValue = $scope.divTag==false && $scope.enableDisableFrameNo==false ? '5' : '6';
                }
                else if(response[arrayData].settingType=="client")
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableDisableAddress = arrayData1.clientAddressStatus=="enable" ? true : false;
                    $scope.enableDisableWorkNo = arrayData1.clientWorkNoStatus=="enable" ? true : false;
                    $scope.enableDisableState = arrayData1.clientStateStatus=="enable" ? true : false;
                    $scope.enableDisableCity = arrayData1.clientCityStatus=="enable" ? true : false;
                    $scope.enableDisableEmailId = arrayData1.clientEmailIdStatus=="enable" ? true : false;
                    $scope.enableDisableProfession = arrayData1.clientProfessionStatus=="enable" ? true : false;
                    if(arrayData1.clientStateStatus=="disable")
                    {
                        $scope.quickBill.stateAbb = {};
                    }
                    if(arrayData1.clientCityStatus=="disable")
                    {
                        $scope.quickBill.cityId = {};
                    }
                }
                else if(response[arrayData].settingType=="bill")
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableDisableSalesman = arrayData1.billSalesmanStatus=="enable" ? true : false;
                }
                else if(response[arrayData].settingType=="inventory")
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableItemizedPurchaseSales = arrayData1.inventoryItemizeStatus=="enable" ? true : false;
                }
                else if (response[arrayData].settingType=="language") 
                {
                    var arrayData1 = response[arrayData];
                    $scope.displayProductName = arrayData1.languageSettingType=="hindi" ? "altProductName" : "productName";
                    // $scope.enableDisableProductName = arrayData1.languageSettingType=="hindi" ? true : false;
                    if ($scope.displayProductName == "altProductName") {
                        onGoogleInit();
                    }
                }
                else if (response[arrayData].settingType=="taxation") 
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableDisableGST = arrayData1.taxationGstStatus=="enable" ? true : false;
                }
                else if (response[arrayData].settingType=="workflow") 
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableQuotationWorkflow = arrayData1.workflowQuotationStatus=="enable" ? true : false;
                }
                else if (response[arrayData].settingType=="advance") 
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableDisableTaxReadOnly = arrayData1.advanceTaxReadOnlyStatus=="enable" ? true : false;
                }
            }
        }
    }
    
    //Set Settings Color/Size/Frame in Product Data
    function filterProductData () {
        vm.productNameDrop.map(function(mData) {
            mData['isColor'] = $scope.enableDisableColor;
            mData['isProductName'] = $scope.enableDisableProductName
            mData['isSize'] = $scope.enableDisableSize;
            mData['isVariant'] = $scope.enableDisableVariant;
            // if ($scope.displayProductName == "altProductName" && (mData.altProductName == null || mData.altProductName == '')) {
            // 	mData['altProductName'] = mData.productName;
            // }
            // mData['productName'] = mData.productName+" ";
            return mData;
        });
    }
    
    //get Settings Color/Size/Frame in Product Data
    $scope.getfilterProductDataForSuggestion = function() {
        var filteProData = vm.productNameDrop.filter(function(mData) {
            if ($scope.displayProductName == "altProductName" && mData.altProductName != null && mData.altProductName != '') {
                return mData;
            } else if ($scope.displayProductName != "altProductName") {
                return mData;
            }
        });
        return filteProData;
    }
    
    $scope.getInvoiceAndJobcardNumber = function(id)
    {
        
        if($scope.saleType == 'QuotationPrint'){
            
            var getLatestInvoice = apiPath.getLatestQuotation+id+apiPath.getLatestInvoice2;
        }
        else{
            
            var getLatestInvoice = apiPath.getLatestInvoice1+id+apiPath.getLatestInvoice2;
        }
        //Get Invoice#
        apiCall.getCall(getLatestInvoice).then(function(response4){
            
            if($scope.saleType == 'QuotationPrint'){
                
                $scope.quickBill.invoiceNumber = getLatestNumber.getQuotation(response4[0]);
                
            }
            else{
                $scope.quickBill.invoiceNumber = getLatestNumber.getInvoice(response4);
            }
        });
        
        getInitStateCity();
    }
    
    $scope.expenseAmount=[];
    $scope.getExpenseValue = function(index)
    {
        var expenseType = vm.AccExpense[index].expenseType;
        var expenseValue = parseFloat(vm.AccExpense[index].expenseValue);
        vm.AccExpense[index].expenseTax = vm.AccExpense[index].expenseTax != undefined && !isNaN(vm.AccExpense[index].expenseTax) ?
        vm.AccExpense[index].expenseTax : 0;
        var expenseTax = parseFloat(vm.AccExpense[index].expenseTax);
        var expenseAmt = expenseValue * (1+(expenseTax/100));
        vm.AccExpense[index].expenseAmt = $filter('setDecimal')(expenseType=="flat" ? 
        parseFloat(expenseAmt)
        : (parseFloat(expenseAmt/100) * parseFloat($scope.total_without_expense)),$scope.noOfDecimalPoints);
        // var expenseValue = vm.AccExpense[index].expenseOperation;
        var totalData=0;
        
        if(index==0)
        {
            totalData = parseFloat($scope.total_without_expense);
        }
        else
        {
            totalData = parseFloat($scope.expenseAmount[index-1]);
        }
        
        if(vm.AccExpense[index].expenseOperation=="plus")
        {
            var totalExpense = expenseType=="flat" ? 
            parseFloat(expenseAmt)+ parseFloat(totalData) 
            : (((parseFloat(expenseAmt)/100)*parseFloat($scope.total_without_expense)) + parseFloat(totalData));
        }
        else
        {
            var totalExpense = expenseType=="flat" ? 
            parseFloat(totalData) - parseFloat(expenseAmt)  
            : (  parseFloat(totalData) - ((parseFloat(expenseAmt)/100)*parseFloat($scope.total_without_expense)));
        }
        
        $scope.total = $scope.expenseAmount[$scope.expenseAmount.length-1];
        return totalExpense;
        
    }
    
    $scope.openExpenseRawData=false;
    //open expense raw
    $scope.openExpenseRaw = function()
    {
        $scope.openExpenseRawData=true;
        $scope.addExpenseRow(-1);
    }
    
    function loadBranchesOfCompany(companyId,callback)
    {
        /* Branch */
        vm.branchDrop = [];
        var getAllBranch = apiPath.getOneBranch+companyId;
        //Get Branch
        apiCall.getCall(getAllBranch).then(function(response4){
            vm.branchDrop = response4;
            callback(response4);
        });
        /* End */
    }
    
    function loadBankLedgerOfCompany(companyId,callback,ledgerId = 0)
    {
        vm.bankLedgerDrop = [];
        var jsuggestPath = apiPath.getLedgerJrnl+companyId;
        var headerCr = {'Content-Type': undefined,'ledgerGroup':[9]};
        var ledgerData = {};
        apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response3){
            var res3cnt = response3.length;
            for(var t=0;t<res3cnt;t++){
                var innerCnt = response3[t].length;
                for(var k=0;k<innerCnt;k++){
                    if (ledgerId != 0){
                        if (response3[t][k].ledgerId == ledgerId){
                            ledgerData = response3[t][k];
                            // console.log("response3[t][k]...",response3[t][k]);
                        }
                    }
                    vm.bankLedgerDrop.push(response3[t][k]);
                }
                if (t == (res3cnt - 1)){
                    if (ledgerId != 0){
                        callback(ledgerData);
                    } else {
                        callback(vm.bankLedgerDrop);
                    }
                }
            }
        });
    }
    
    $scope.countScannedDocumet = 0;
    $scope.clearScannedResult = function(){
        
        if($scope.countScannedDocumet > 0){
            
            var scanCount = $scope.countScannedDocumet;
            for(var delIndex = 0;delIndex < scanCount;delIndex++){
                
                formdata.delete('scanFile['+delIndex+']');
            }
            
            $scope.countScannedDocumet = 0;
        }
        
    }
    
    //Default Company Function
    $scope.defaultComapny = function(){
        
        toaster.clear();
        toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
        
        vm.loadData = true;
        vm.stateDataLoaded = true;
        
        //Set default Company
        var  response2 = apiCall.getDefaultCompanyFilter(vm.companyDrop);
        var id = response2.companyId;
        $scope.displayDefaultCompanyName = response2.companyName;
        
        /* Branch */
        loadBranchesOfCompany(id,function(branchres){
            if(angular.isArray(branchres)){
                if (branchres.length > 0){
                    $scope.quickBill.branchId = branchres[0];
                    formdata.set('branchId',branchres[0].branchId);
                }
            }
        });
        /* End */
        
        $scope.quickBill.companyId = response2;
        
        formdata.delete('companyId');
        formdata.set('companyId',response2.companyId);
        getUserData(response2.companyId);
        $scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
        
        $scope.getInvoiceAndJobcardNumber(id); // Invoice#
        //Auto Suggest Product Dropdown data
        vm.productNameDrop = [];
        
        productFactory.getProductByCompany(id).then(function(data){
            vm.productNameDrop = data;
            filterProductData();
            vm.loadData = false;
            //insertvalTime();
        });
        
        //Get Bank Ledger of this Company
        loadBankLedgerOfCompany(id,function(responseBank){
            
        });
        
        $scope.printButtonType = response2.printType == '' ? 'print':response2.printType;
    }
    
    function getUserData(companyId)
    {
        var headerDataOnLoad = {'Content-Type': undefined,'companyId':companyId};
        apiCall.getCallHeader(apiPath.getAllStaff,headerDataOnLoad).then(function(response){
            
            toaster.clear();
            if(apiResponse.noContent == response){
                toaster.pop('alert', 'Opps!!', 'No Staff Available');
            }
            else{
                vm.userDrop = response;
                // vm.userDrop.push($rootScope.$storage.authUser);
                $scope.quickBill.userId =  $rootScope.$storage.authUser;
            }
        });
    }
    
    $scope.filterStaff = function(value , index , array ){
        if (value.userType == "salesman" || $rootScope.$storage.authUser.userId == value.userId){
            return true;
        }
        
        
    }
    
    $scope.ReloadAfterSave = function(response2){
        
        $scope.quickBill.companyId = response2;
        
        formdata.delete('companyId');
        
        
        formdata.set('companyId',response2.companyId);
        
        $scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
        
        //toaster.clear();
        //toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
        
        var id = response2.companyId;
        $scope.getInvoiceAndJobcardNumber(id);
        
    }
    //Auto Suggest Client Contact Dropdown data
    $scope.clientGetAllFunction = function(){
        
        vm.clientSuggest = [];
        vm.clientWorkSuggestion = [];
        clientFactory.getClient().then(function(responseDrop){
            vm.clientSuggest = responseDrop;
            var responseLength = responseDrop.length;
            for(var arrayData=0;arrayData<responseLength;arrayData++)
            {
                if(responseDrop[arrayData].contactNo1 !='' && responseDrop[arrayData].contactNo1 !='null' && responseDrop[arrayData].contactNo1 !=null)
                {
                    vm.clientWorkSuggestion.push(responseDrop[arrayData]);	
                }
            }
            
        });
        
        vm.professionDrop = [];
        clientFactory.getProfession().then(function(responseDrop){
            vm.professionDrop = responseDrop;
        });
    }
    
    
    $scope.clientGetAllFunction();
    
    
    // vm.statesDrop=[];
    // apiCall.getCall(apiPath.getAllState).then(function(response3){
    
    // vm.statesDrop = response3;
    
    // });
    
    
    function getInitStateCity(){
        vm.statesDrop=[];
        vm.cityDrop = [];
        
        stateCityFactory.getState().then(function(response){
            toaster.clear();
            vm.stateDataLoaded = false;
            vm.statesDrop = response;
            $scope.quickBill.stateAbb = stateCityFactory.getDefaultState($rootScope.defaultState);
            
            
            vm.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
            $scope.quickBill.cityId = stateCityFactory.getDefaultCity($rootScope.defaultCity);
            if(settingResponse.length!=0)
            {
                getSettingData(settingResponse);
            }
        });
    }
    
    //$scope.getInitStateCity();
    
    //get Bank
    vm.bankDrop=[];
    bankFactory.getBank().then(function(response){
        var count = response.length;
        while(count--){
            vm.bankDrop.push(response[count].bankName);
        }
    });
    
    /* Table */
    
    $scope.addRow = function(index){
        
        var plusOne = index+1;
        
        var data = {};	
        data.productId = '';
        data.productName ='';
        data.color ='';
        data.frameNo ='';
        data.discountType ='flat';
        data.discount ='';
        data.price = 0;
        data.qty =1;
        data.amount = '';
        data.size = '';
        data.variant = '';
        //vm.AccBillTable.push(data);
        vm.AccBillTable.splice(plusOne,0,data);
        
        /*var varTax = {};
        varTax.tax = 0;
        varTax.additionalTax = 0;
        varTax.igst = 0;
        
        vm.productTax.splice(plusOne, 0, varTax); */
        
        $scope.changeProductArray = true;
        
        if ($scope.displayProductName == "altProductName") {
            /* To Load Hindi Transliteration by Class */
            setTimeout(function() {
                onLoad();
            }, 500);
        }
    };
    
    
    $scope.removeRow = function (idx) {
        vm.AccBillTable.splice(idx,1);
        //vm.productTax.splice(idx, 1);
        
        vm.productHsn.splice(idx,1);
        
        $scope.changeProductArray = true;
        
        $scope.advanceValueUpdate();
    };
    
    $scope.addExpenseRow = function(index){
        
        var plusOne = index+1;
        
        var data = {};
        data.expenseType = 'flat';
        data.expenseOperation = 'plus';
        
        //vm.AccBillTable.push(data);
        vm.AccExpense.splice(plusOne,0,data);
        $scope.changeProductArray = true;
    };
    
    
    $scope.removeExpenseRow = function (idx) {
        vm.AccExpense.splice(idx,1);
        $scope.expenseAmount.splice(idx,1);
        $scope.changeProductArray = true;
        
        //vm.productTax.splice(idx, 1);
        
        // vm.productHsn.splice(idx,1);
        
        // $scope.changeProductArray = true;
        
        $scope.advanceValueUpdate();
    };
    var expenseGetApiPath = apiPath.settingExpense;
    $scope.expenseData=[];
    // Get All Expense Call 
    apiCall.getCall(expenseGetApiPath).then(function(response){
        $scope.expenseData = response;
    });
    
    //save expense-name in expense-data
    $scope.setExpenseData = function(item,index)
    {
        vm.AccExpense[index].expenseName = item.expenseName;
        vm.AccExpense[index].expenseId = item.expenseId;
        vm.AccExpense[index].expenseValue = item.expenseValue;
        vm.AccExpense[index].expenseTax = item.expenseTax;
        vm.AccExpense[index].expenseType = item.expenseType;
        vm.AccExpense[index].expenseOperation = 'plus';
        $scope.changeProductArray = true;
    }
    
    function loadMeasurementUnits(unitId,callback)
    {
        var measurementGetApiPath = apiPath.settingMeasurementUnit;
        apiCall.getCall(measurementGetApiPath).then( function(response) {
            callback(response);
        });
    }
    
    $scope.myCustomProductFilter = function(item) 
    {
        return item[$scope.displayProductName] != null && item[$scope.displayProductName] != '';
    }
    
    vm.productHsn = [];
    vm.productDesc = [];
    vm.measurementUnitDrop = [];
    $scope.igstDisable = true;
    $scope.csgstDisable = true;
    $scope.setProductData = function(item,index)
    {
        $scope.disableButton = false;
        if(item.notForSale=="true")
        {
            $scope.disableButton = true;
            // $scope.formBill['productName['+index+']'].$invalid = true;
            toaster.pop('warning','Can\'t sale '+item.productName+' product');
            return false;
        }
        
        vm.AccBillTable[index].productId = item.productId;
        // setTimeout(function() {
        // 	if ($scope.displayProductName == "altProductName" && item.altProductName != null && item.altProductName != '') {
        // 		vm.AccBillTable[index].productName = item.altProductName;
        // 	} else {
        // 		vm.AccBillTable[index].productName = angular.copy(item.productName);
        // 	}
        // },2000);
        
        
        if ($scope.enableItemizedPurchaseSales) {
            vm.AccBillTable[index].itemizeDetail = [];
        }
        vm.AccBillTable[index].productId = item.productId;
        vm.AccBillTable[index].cessFlat = item.cessFlat;
        vm.AccBillTable[index].cessPercentage = item.cessPercentage;
        vm.productHsn[index] = item.hsn;
        vm.productDesc[index] = item.productDescription;
        if ($scope.enableDisableAdvanceMou) 
        {
            vm.measurementUnitDrop[index] = [];
            var unitParams = ['highest','higher','medium','mediumLower','lower','lowest'];
            for (var i = 0; i < unitParams.length; i++) {
                if (i < unitParams.length - 1) {
                    if (angular.isObject(item[unitParams[i]+'MeasurementUnit']) && angular.isDefined(item[unitParams[i]+'MeasurementUnit'].measurementUnitId)) {
                        item[unitParams[i]+'MeasurementUnit']['measurementUnit'] = unitParams[i];
                        vm.measurementUnitDrop[index].push(item[unitParams[i]+'MeasurementUnit']);
                    }
                }else{
                    if (angular.isObject(item.measurementUnit) && angular.isDefined(item.measurementUnit.measurementUnitId)) {
                        item.measurementUnit['measurementUnit'] = unitParams[i];
                        vm.measurementUnitDrop[index].push(item.measurementUnit);
                    }
                }
            }
        }else if ($scope.enableDisableLWHSetting) {
            if (angular.isObject(item.measurementUnit) && angular.isDefined(item.measurementUnit.measurementUnitId)) {
                vm.AccBillTable[index].lengthValue = 1;
                vm.AccBillTable[index].widthValue = 1;
                vm.AccBillTable[index].heightValue = 1;
                vm.AccBillTable[index].measurementUnit = item.measurementUnit;
                vm.AccBillTable[index].moduloFactor = parseInt(item.measurementUnit.moduloFactor);
                if (angular.isDefined(item.measurementUnit.devideFactor) && 
                !isNaN(parseFloat(item.measurementUnit.devideFactor)) && 
                parseFloat(item.measurementUnit.devideFactor) > 0) {
                    vm.AccBillTable[index].devideFactor = parseFloat(item.measurementUnit.devideFactor);
                }else{
                    vm.AccBillTable[index].devideFactor = 1;
                }
                $scope.enableDisableLWHArray[index] = {};
                
                $scope.enableDisableLWHArray[index].lengthStatus = item.measurementUnit.lengthStatus == 'enable' ? true :false;
                $scope.enableDisableLWHArray[index].widthStatus = item.measurementUnit.widthStatus == 'enable' ? true : false;
                $scope.enableDisableLWHArray[index].heightStatus = item.measurementUnit.heightStatus == 'enable' ? true : false;
                if ($scope.enableDisableLWHArray[index].lengthStatus &&
                    $scope.enableDisableLWHArray[index].widthStatus &&
                    $scope.enableDisableLWHArray[index].heightStatus)
                    {
                        $scope.enableDisableLWHArray[index].styleObj = {
                            "width" : "33.33%",
                            "padding-left": "6px",
                            "padding-right": "6px",
                            "float":"left"
                        };
                    }else if ($scope.enableDisableLWHArray[index].lengthStatus && $scope.enableDisableLWHArray[index].widthStatus ||
                        $scope.enableDisableLWHArray[index].lengthStatus && $scope.enableDisableLWHArray[index].heightStatus ||
                        $scope.enableDisableLWHArray[index].heightStatus && $scope.enableDisableLWHArray[index].widthStatus) 
                        {
                            $scope.enableDisableLWHArray[index].styleObj = {
                                "width" : "50%",
                                "padding-left": "6px",
                                "padding-right": "6px",
                                "float":"left"
                            };
                        }else{
                            $scope.enableDisableLWHArray[index].styleObj = {"width" : "100%"};
                        }
                        
                    }else{
                        $scope.enableDisableLWHArray[index] = {};
                    }
                }else{
                    vm.AccBillTable[index].measurementUnit = item.measurementUnit;
                }
                
                var grandPrice;
                var tempCgst = checkGSTValue(item.vat);
                var tempSgst = checkGSTValue(item.additionalTax);
                var tempIgst = checkGSTValue(item.igst);
                
                grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
                
                var timeOut = 1;
                if ($scope.enableDisableAdvanceMou)
                {
                    timeOut = 0;
                    vm.AccBillTable[index].measurementUnit = undefined;
                    $scope.getAdvanceMouCalculationPrice(item,index, function (responsePrice) {
                        grandPrice = responsePrice;
                        timeOut = 1;
                    });
                }
                
                var timeTrigger = setInterval(function () { // wait until all resources loaded 
                    if (timeOut) {
                        if(grandPrice == 0){
                            grandPrice = productArrayFactory.calculate(item.mrp,0,item.wholesaleMargin)  + parseFloat(item.wholesaleMarginFlat);
                        }
                        
                        if($scope.quickBill.companyId.state.stateAbb==$scope.quickBill.stateAbb.stateAbb)
                        {
                            vm.AccBillTable[index].cgstPercentage = tempCgst;
                            vm.AccBillTable[index].sgstPercentage = tempSgst;
                            vm.AccBillTable[index].igstPercentage = 0;
                            $scope.igstDisable = true;
                            $scope.csgstDisable = false;
                        }
                        else
                        {
                            $scope.igstDisable = false;
                            $scope.csgstDisable = true;
                            vm.AccBillTable[index].cgstPercentage = 0;
                            vm.AccBillTable[index].sgstPercentage = 0;
                            vm.AccBillTable[index].igstPercentage = tempIgst;	
                        }
                        
                        vm.AccBillTable[index].price = grandPrice;
                        
                        /** Color/Size **/
                        vm.AccBillTable[index].color = item.color;
                        vm.AccBillTable[index].size = item.size;
                        vm.AccBillTable[index].variant = item.variant != undefined ? item.variant : '';
                        if (item.hasOwnProperty('realQtyData') && angular.isDefined(item.realQtyData)) {
                            vm.AccBillTable[index].realQtyData = item.realQtyData;
                        }else{
                            vm.AccBillTable[index].realQtyData = item.qty;
                        }
                        
                        /** End **/
                        //vm.productTax[index].tax = tax; //Product Tax
                        
                        if (item.taxInclusive == "inclusive")
                        {
                            vm.AccBillTable[index].amount = $filter('setDecimal')(grandPrice * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
                            $scope.calculateTaxReverseTwo(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                        }
                        else{
                            $scope.calculateTaxReverse(vm.AccBillTable[index],tempCgst,tempSgst,tempIgst,index);
                        }
                        
                        $scope.changeProductArray = true;
                        
                        if(!$scope.quickBill.EditBillData){
                            $scope.advanceValueUpdate();
                        }
                        clearInterval(timeTrigger);
                    }
                },20);
                // $scope.advanceValueUpdate();
            }
            
            function loadQuantityPricing (productId,callback)
            {
                //Set Advance Measurement Unit
                apiCall.getCall(api_quantity_pricing+productId+'/quantity-pricing').then( function (response) {
                    callback(response);
                });
            }
            
            $scope.getAdvanceMouCalculationPrice = function(item,index,callback)
            {
                var grandPrice = 0;
                // IF Adavande MOU
                if ($scope.enableDisableAdvanceMou) 
                {
                    var defaultMeasure = undefined;
                    var selectedMeasure = {};
                    
                    if(angular.isObject(vm.AccBillTable[index].measurementUnit))
                    {
                        vm.AccBillTable[index].measurementUnit.measurementUnit = vm.measurementUnitDrop[index].find(
                            function(ele){
                                return ele.measurementUnitId == vm.AccBillTable[index].measurementUnit.measurementUnitId;
                            }).measurementUnit;
                            
                            selectedMeasure = vm.AccBillTable[index].measurementUnit;
                            if(item.primaryMeasureUnit != 'lowest' && item.primaryMeasureUnit != undefined) {
                                defaultMeasure = item[item.primaryMeasureUnit+'MeasurementUnit'];
                            }else{
                                defaultMeasure = item.measurementUnit;
                            }
                        }
                        else
                        {
                            if(item.primaryMeasureUnit != 'lowest' && item.primaryMeasureUnit != undefined) {
                                vm.AccBillTable[index].measurementUnit = item[item.primaryMeasureUnit+'MeasurementUnit'];
                                defaultMeasure = item[item.primaryMeasureUnit+'MeasurementUnit'];
                                selectedMeasure = item[item.primaryMeasureUnit+'MeasurementUnit'];
                                // console.log('748....',selectedMeasure);
                                grandPrice = productArrayFactory.calculate(item[item.primaryMeasureUnit+'PurchasePrice'],0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
                            }else{
                                vm.AccBillTable[index].measurementUnit = item.measurementUnit;
                                defaultMeasure = item.measurementUnit;
                                selectedMeasure = item.measurementUnit;
                                grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
                            }
                        }
                        
                        if(item.measurementUnit == null){
                            vm.AccBillTable[index].measurementUnit = undefined;
                        }
                        
                        var check_default_and_selected_flag = 0;
                        
                        if (angular.isObject(defaultMeasure) && angular.isObject(selectedMeasure)) { 
                            
                            if (Object.keys(defaultMeasure).length && Object.keys(selectedMeasure).length) {
                                
                                if (selectedMeasure.measurementUnitId == defaultMeasure.measurementUnitId) {
                                    
                                    check_default_and_selected_flag = 1;
                                }else{
                                    check_default_and_selected_flag = 0;
                                }
                            }
                        }
                        
                        var primaryMeasure = item.primaryMeasureUnit;
                        if(!check_default_and_selected_flag)
                        {
                            if (angular.isObject(selectedMeasure))
                            {
                                if (Object.keys(selectedMeasure).length) 
                                {
                                    primaryMeasure = selectedMeasure.measurementUnit;
                                }
                            }
                        }
                        if(primaryMeasure != 'lowest' && primaryMeasure != undefined) {
                            vm.AccBillTable[index].measurementUnit = item[primaryMeasure+'MeasurementUnit'];
                            grandPrice = productArrayFactory.calculate(item[primaryMeasure+'PurchasePrice'],0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
                        }else{
                            vm.AccBillTable[index].measurementUnit = item.measurementUnit;
                            grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
                        }
                        
                        if (check_default_and_selected_flag) {
                            loadQuantityPricing(item.productId,function (response)
                            {
                                vm.AccBillTable[index].realQtyData = parseFloat(item[selectedMeasure.measurementUnit+'MouConv']) * parseInt(vm.AccBillTable[index].qty);
                                if(angular.isArray(response))
                                {
                                    var flagPricing = 0;
                                    var salesPrice = 0;
                                    if(response.length > 0)
                                    {
                                        var qtyIndex = 0;
                                        var qtyCount = response.length;
                                        while(qtyIndex < qtyCount)
                                        {
                                            var singlePricing = response[qtyIndex];
                                            var userQty = parseInt(vm.AccBillTable[index].qty);
                                            if(userQty >= parseInt(singlePricing.fromQty) && userQty <= parseInt(singlePricing.toQty))
                                            {
                                                flagPricing = 1;
                                                salesPrice = singlePricing.salesPrice;
                                                break;
                                            }
                                            qtyIndex++;
                                        }
                                    }
                                    
                                    if (flagPricing) {
                                        grandPrice = productArrayFactory.calculate(salesPrice,0,0);
                                    }
                                }
                                callback(grandPrice);
                            });
                        }
                        else{
                            loadQuantityPricing(item.productId,function (response)
                            {
                                var inpQty = parseInt(vm.AccBillTable[index].qty);
                                var userQtyConverted = 1;
                                userQtyConverted = parseFloat(item[selectedMeasure.measurementUnit+'MouConv']);
                                vm.AccBillTable[index].realQtyData = userQtyConverted * inpQty;
                                if(angular.isArray(response))
                                {
                                    var flagPricing = 0;
                                    var salesPrice = 0;
                                    if(response.length > 0)
                                    {
                                        var qtyIndex = 0;
                                        var qtyCount = response.length;
                                        while(qtyIndex < qtyCount)
                                        {
                                            var singlePricing = response[qtyIndex];
                                            var userQty = inpQty * userQtyConverted;
                                            if(userQty >= parseInt(singlePricing.fromQty) && userQty <= parseInt(singlePricing.toQty))
                                            {
                                                flagPricing = 1;
                                                salesPrice = singlePricing.salesPrice * userQtyConverted;
                                                break;
                                            }
                                            if (qtyIndex == qtyCount - 1) {
                                                if(userQty >= parseInt(singlePricing.toQty))
                                                {
                                                    flagPricing = 1;
                                                    salesPrice = singlePricing.salesPrice * userQtyConverted;
                                                    break;
                                                }
                                            }
                                            qtyIndex++;
                                        }
                                    }
                                    
                                    if (flagPricing) {
                                        grandPrice = productArrayFactory.calculate(salesPrice,0,0);
                                    }
                                }
                                callback(grandPrice);
                            });
                        }
                    } // IF Adavande MOU
                    else {
                        callback(grandPrice);
                    }
                }
                
                $scope.changeQuantity = function(index)
                {
                    var productId = vm.AccBillTable[index].productId;
                    productFactory.getSingleProduct(productId).then(function(response)
                    {
                        if ($scope.enableDisableAdvanceMou)
                        {
                            if (response.taxInclusive == 'inclusive')
                            {
                                $scope.getAdvanceMouCalculationPrice(response,index, function (responsePrice) {
                                    var calPrice = responsePrice;
                                    vm.AccBillTable[index].amount = $filter('setDecimal')(calPrice * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
                                    if(vm.AccBillTable[index].amount == 0) {
                                        vm.AccBillTable[index].amount = $filter('setDecimal')(response.mrp * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
                                    }
                                    $scope.calculateTaxReverseTwo(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                                });
                            }
                            else{
                                $scope.getAdvanceMouCalculationPrice(response,index, function (responsePrice) {
                                    vm.AccBillTable[index].price = responsePrice;
                                    $scope.calculateTaxReverse(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                                });
                            }
                        }
                        else if ($scope.enableDisableLWHSetting) {
                            if (response.taxInclusive == 'inclusive')
                            {
                                var calcQty = getCalcQty(vm.AccBillTable[index],$scope.enableDisableLWHArray[index]);
                                var calcTax = parseFloat(vm.AccBillTable[index].cgstPercentage) + parseFloat(vm.AccBillTable[index].sgstPercentage) + parseFloat(vm.AccBillTable[index].igstPercentage);
                                vm.AccBillTable[index].stockFt = calcQty;
                                if (angular.isDefined(vm.AccBillTable[index].price) && !isNaN(vm.AccBillTable[index].price) && vm.AccBillTable[index].price != 0) {
                                    vm.AccBillTable[index].amount = $filter('setDecimal')(vm.AccBillTable[index].price*calcQty*(1+(calcTax)),$scope.noOfDecimalPoints);
                                }else{
                                    vm.AccBillTable[index].amount = $filter('setDecimal')(response.purchasePrice * calcQty ,$scope.noOfDecimalPoints);
                                }
                                if(vm.AccBillTable[index].amount == 0) {
                                    vm.AccBillTable[index].amount = $filter('setDecimal')(response.mrp * calcQty,$scope.noOfDecimalPoints);
                                }
                                $scope.calculateTaxReverseTwo(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                            }else{
                                $scope.calculateTaxReverse(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                            }
                        }
                        else
                        {
                            if (response.taxInclusive == 'inclusive')
                            {
                                vm.AccBillTable[index].amount = $filter('setDecimal')(response.purchasePrice * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
                                if(vm.AccBillTable[index].amount == 0){
                                    vm.AccBillTable[index].amount = $filter('setDecimal')(response.mrp * vm.AccBillTable[index].qty,$scope.noOfDecimalPoints);
                                }
                                $scope.calculateTaxReverseTwo(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                            }else{
                                $scope.calculateTaxReverse(vm.AccBillTable[index],vm.AccBillTable[index].cgstPercentage,vm.AccBillTable[index].sgstPercentage,vm.AccBillTable[index].igstPercentage,index);
                            }
                        }
                    });
                }
                // End Table 
                function getCalcQty(calcItem,lwhStatus){
                    var calcLength = 1;
                    var calcWidth = 1;
                    var calcHeight = 1;
                    var tempLength;
                    var tempWidth;
                    var tempHeight;
                    if (angular.isNumber(calcItem.moduloFactor) && calcItem.moduloFactor > 1) {
                        var moduloFactor = parseInt(calcItem.moduloFactor);
                        if (lwhStatus.lengthStatus) {
                            tempLength = parseFloat(calcItem.lengthValue) / moduloFactor;
                            calcLength = Math.ceil(tempLength) * moduloFactor;
                        }
                        if (lwhStatus.widthStatus) {
                            tempWidth = parseFloat(calcItem.widthValue) / moduloFactor;
                            calcWidth = Math.ceil(tempWidth) * moduloFactor;
                        }
                        if (lwhStatus.heightStatus) {
                            tempHeight = parseFloat(calcItem.heightValue) / moduloFactor;
                            calcHeight = Math.ceil(tempHeight) * moduloFactor;
                        }
                    }else{
                        calcLength = parseFloat(calcItem.lengthValue);
                        calcWidth = parseFloat(calcItem.widthValue);
                        calcHeight = parseFloat(calcItem.heightValue);
                    }
                    return $filter('setDecimal')(parseFloat(calcItem.qty)*calcLength*calcWidth*calcHeight/parseFloat(calcItem.devideFactor),$scope.noOfDecimalPoints);
                }
                function checkGSTValue(value) {
                    if(angular.isUndefined(value) || value == '' || isNaN(value)){
                        return 0;
                    }
                    else{
                        return parseFloat(value);
                    }
                }
                
                //Total Quantity For Product Table
                $scope.getTotalQuantity = function()
                {
                    var total = 0;
                    var count = vm.AccBillTable.length;
                    for(var i = 0; i < count; i++)
                    {
                        var product = vm.AccBillTable[i];
                        total += parseInt(product.qty);
                    }
                    
                    return isNaN(total) ? 0 : total;
                }
                
                $scope.zeroSingleGst = function()
                {
                    $scope.quickBill.totalCgstPercentage = 0;
                    $scope.quickBill.totalSgstPercentage = 0;
                    $scope.quickBill.totalIgstPercentage = 0;
                }
                
                /* Zero GST when Overall is Arive */
                $scope.zeroGstApply = function()
                {
                    var count = vm.AccBillTable.length;
                    for(var i = 0; i < count; i++)
                    {
                        vm.AccBillTable[i].cgstPercentage = 0;
                        vm.AccBillTable[i].sgstPercentage = 0;
                        vm.AccBillTable[i].igstPercentage = 0;
                        $scope.calculateTaxReverse(vm.AccBillTable[i],0,0,0,i);
                    }
                }
                /* End */
                
                //Total Tax For Product Table
                $scope.getTotalTax = function()
                {
                    var total = 0;
                    var count = vm.AccBillTable.length;
                    var getTotalAmount = 0;
                    var totalCessAmount = 0;
                    var gst = {
                        sgst:0,
                        cgst:0,
                        igst:0,
                        cess:0
                    };
                    
                    for(var i = 0; i < count; i++)
                    {
                        var product = vm.AccBillTable[i];
                        // var vartax = vm.productTax[i];
                        gst.cgst += parseFloat(product.cgstAmount);
                        gst.sgst += parseFloat(product.sgstAmount);
                        gst.igst += parseFloat(product.igstAmount);
                        gst.cess += parseFloat(product.cessAmount);
                    }
                    
                    total = $filter('setDecimal')(gst.cgst+gst.sgst+gst.igst+gst.cess,$scope.noOfDecimalPoints);
                    
                    return total;
                }
                
                $scope.getTotal = function()
                {
                    var total = 0;
                    var count = vm.AccBillTable.length;
                    while(count--){
                        var product = vm.AccBillTable[count];
                        total += parseFloat(product.amount);
                    }
                    
                    if($scope.quickBill.totalDiscounttype == 'flat') {
                        total =  $filter('setDecimal')(total - checkGSTValue($scope.quickBill.totalDiscount),$scope.noOfDecimalPoints);
                    }
                    else{
                        var discount = $filter('setDecimal')(total*checkGSTValue($scope.quickBill.totalDiscount)/100,$scope.noOfDecimalPoints);
                        total =  total-discount;
                    }
                    
                    var getCgst = checkGSTValue($scope.quickBill.totalCgstPercentage);
                    var getSgst = checkGSTValue($scope.quickBill.totalSgstPercentage);
                    var getIgst = checkGSTValue($scope.quickBill.totalIgstPercentage);
                    var TaxSum = getCgst+getSgst+getIgst;
                    
                    var gst = $filter('setDecimal')(total*TaxSum/100,$scope.noOfDecimalPoints);
                    total += gst;
                    
                    if(!isNaN($scope.quickBill.extraCharge) && $scope.quickBill.extraCharge != ''){
                        total+=parseFloat($scope.quickBill.extraCharge);
                    }
                    
                    return total;
                    
                }
                
                /** Tax Calculation **/
                
                $scope.calculateTaxReverse = function(item,cgst,sgst,igst,index)
                {
                    
                    var getCgst = checkGSTValue(cgst);
                    var getSgst = checkGSTValue(sgst);
                    var getIgst = checkGSTValue(igst);
                    var amount = 0;
                    var getCess = checkGSTValue(item.cessPercentage);
                    var getFlatCess = 0;
                    if ($scope.enableDisableLWHSetting) {
                        
                        var calcQty = getCalcQty(item,$scope.enableDisableLWHArray[index]);
                        vm.AccBillTable[index].stockFt = calcQty;
                        vm.AccBillTable[index].totalFt = $filter('setDecimal')(parseFloat(item.qty)*item.lengthValue*item.widthValue*item.heightValue/parseFloat(item.devideFactor),$scope.noOfDecimalPoints);
                    }else{
                        var calcQty = item.qty;
                    }
                    if (item.hasOwnProperty('realQtyData') && angular.isDefined(item.realQtyData) && item.realQtyData != 'undefined') {
                        getFlatCess = parseFloat(parseFloat(item.realQtyData) * parseFloat(item.cessFlat));
                    }else{
                        getFlatCess = parseFloat(calcQty) * parseFloat(item.cessFlat);
                    }
                    if(item.discountType == 'flat') {
                        
                        amount =  $filter('setDecimal')((item.price*calcQty) - item.discount,$scope.noOfDecimalPoints);
                    }
                    else{
                        //item.amount = ((item.price*calcQty)-((item.price*calcQty)*item.discount/100) | setDecimal: noOfDecimalPoints);
                        amount  =  $filter('setDecimal')((item.price*calcQty)-((item.price*calcQty)*item.discount/100),$scope.noOfDecimalPoints);
                    }
                    item.cessAmount = $filter('setDecimal')((amount*getCess/100)+getFlatCess,$scope.noOfDecimalPoints);
                    if($scope.quickBill.companyId.state.stateAbb==$scope.quickBill.stateAbb.stateAbb)
                    {
                        item.cgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getCgst,0),$scope.noOfDecimalPoints);
                        item.sgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getSgst,0),$scope.noOfDecimalPoints);
                        item.igstAmount =  0;
                    }
                    else{
                        item.cgstAmount =  0;
                        item.sgstAmount =  0;
                        item.igstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getIgst,0),$scope.noOfDecimalPoints);
                    }
                    
                    // console.log('GST?',$scope.enableDisableGST);
                    if($scope.enableDisableGST){
                        item.amount = $filter('setDecimal')(amount+item.cgstAmount+item.sgstAmount+item.igstAmount+item.cessAmount,$scope.noOfDecimalPoints);
                    }
                    else{
                        item.amount = $filter('setDecimal')(amount,$scope.noOfDecimalPoints);
                    }
                    
                    if(!$scope.quickBill.EditBillData){
                        $scope.advanceValueUpdate();
                    }
                }
                
                /** END **/
                
                
                /** Tax Calculation **/
                
                $scope.calculateTaxReverseTwo = function(item,cgst,sgst,igst,index)
                {
                    var getCgst = checkGSTValue(cgst);
                    var getSgst = checkGSTValue(sgst);
                    var getIgst = checkGSTValue(igst);
                    var getCess = checkGSTValue(item.cessPercentage);
                    var getFlatCess = 0;
                    if ($scope.enableDisableLWHSetting) {
                        var calcQty = getCalcQty(item,$scope.enableDisableLWHArray[index]);
                        vm.AccBillTable[index].totalFt = $filter('setDecimal')(parseFloat(item.qty)*item.lengthValue*item.widthValue*item.heightValue/parseFloat(item.devideFactor),$scope.noOfDecimalPoints);
                        vm.AccBillTable[index].stockFt = calcQty;
                    }else{
                        var calcQty = item.qty;
                    }
                    if (item.hasOwnProperty('realQtyData') && angular.isDefined(item.realQtyData) && angular.isNumber(item.realQtyData)) {
                        getFlatCess = parseFloat(item.realQtyData * item.cessFlat);
                    }else{
                        getFlatCess = calcQty * item.cessFlat;
                    }
                    var TaxSum = getCgst+getSgst+getIgst+getCess;
                    vm.AccBillTable[index].price = $filter('setDecimal')(((item.amount-getFlatCess)/ (1+(TaxSum/100))) / parseFloat(calcQty),$scope.noOfDecimalPoints);
                    vm.AccBillTable[index].cgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getCgst/100,$scope.noOfDecimalPoints);
                    vm.AccBillTable[index].sgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getSgst/100,$scope.noOfDecimalPoints);
                    vm.AccBillTable[index].igstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getIgst/100,$scope.noOfDecimalPoints);
                    vm.AccBillTable[index].cessAmount = $filter('setDecimal')((vm.AccBillTable[index].price * getCess/100)+getFlatCess,$scope.noOfDecimalPoints);
                    
                    if(!$scope.quickBill.EditBillData){
                        $scope.advanceValueUpdate();
                    }
                }
                
                /** END **/
                
                
                $scope.advanceValueUpdate = function(){
                    
                    setTimeout(function () { // wait until all resources loaded 
                        var expenseData;
                        if($scope.openExpenseRawData)
                        {
                            expenseData = $scope.expenseAmount[$scope.expenseAmount.length-1];
                        }
                        else
                        {
                            expenseData = $scope.total_without_expense;
                        }
                        $scope.quickBill.advance = $filter('setDecimal')(expenseData,2);
                        $scope.$digest();
                    }, 1000);
                }
                
                /** Check Update Or Insert Bill **/
                
                $scope.EditAddBill = function(copyData = "",draft = null){
                    $scope.openedItemizeTree = 0;
                    //if(Object.keys(getSetFactory.get()).length){
                    if(Object.keys(getSetFactory.get()).length){
                        formdata = undefined;
                        formdata = new FormData();
                        $scope.quickBill.EditBillData = getSetFactory.get();
                        getSetFactory.blank();
                        
                        draft == 'draft' ? formdata.set('isDraft',$scope.quickBill.EditBillData.saleId) : '';
                        draft == 'SalesOrder' ? formdata.set('isSalesOrderUpdate','ok') : '';
                        
                        var jsonProduct = angular.fromJson($scope.quickBill.EditBillData.productArray);
                        var jsonExpense = angular.fromJson($scope.quickBill.EditBillData.expense);
                        
                        $scope.igstDisable = false;
                        $scope.csgstDisable = false;
                        
                        vm.disableCompany = false;
                        var setCompanyData = $scope.quickBill.EditBillData.company;
                        var editBillAllData = $scope.quickBill.EditBillData;
                        
                        loadBranchesOfCompany(setCompanyData.companyId,function(branchres) {
                            $scope.quickBill.branchId = editBillAllData.branch;
                        }); //get All Branches of Company
                        
                        $scope.displayDefaultCompanyName = setCompanyData.companyName;
                        
                        var setDecimalPoint = parseInt($scope.quickBill.EditBillData.company.noOfDecimalPoints);
                        //get Company
                        vm.companyDrop=[];
                        apiCall.getCall(apiPath.getAllCompany).then(function(response2){
                            vm.companyDrop = response2;
                            $scope.quickBill.companyId =  setCompanyData;		//Company
                            if(copyData != 'copy'){
                                vm.disableCompany = true;
                            }
                        });
                        
                        var clientDataIndex;
                        clientFactory.getSingleClient($scope.quickBill.EditBillData.client.clientId).then(function(docData){
                            clientDataIndex = docData;
                        });
                        $scope.quickBill.EditBillData.lastPdf = {};
                        if($scope.quickBill.EditBillData.hasOwnProperty('file'))
                        {
                            if($scope.quickBill.EditBillData.file[0].documentId != '' && $scope.quickBill.EditBillData.file[0].documentId != 0){
                                var printType = setCompanyData.printType=="preprint" ? "preprint-bill" : "bill";
                                var articleWithMaxNumber = $scope.quickBill.EditBillData.file.filter(function(options){
                                    // return options.documentFormat == "pdf" && options.documentType == printType;
                                    return options.documentFormat == "pdf";
                                }).reduce(function(max, x) {
                                    return x.documentId > max.documentId ? x : max;
                                });
                                $scope.quickBill.EditBillData.lastPdf = articleWithMaxNumber || {};
                            }
                        }
                        
                        if($scope.saleType == 'RetailsaleBill' || $scope.saleType == 'WholesaleBill' || $scope.saleType == 'SalesOrder'){
                            
                            //Set PO Number
                            if($scope.quickBill.EditBillData.hasOwnProperty('poNumber')){
                                $scope.quickBill.poNumber = $scope.quickBill.EditBillData.poNumber=="" || $scope.quickBill.EditBillData.poNumber==null || $scope.quickBill.EditBillData.poNumber==undefined ? "" : $scope.quickBill.EditBillData.poNumber;
                            }
                            
                            if($scope.quickBill.EditBillData.hasOwnProperty('user')){
                                if($scope.quickBill.EditBillData.user!="" && $scope.quickBill.EditBillData.user!=null && $scope.quickBill.EditBillData.user!='NULL')
                                {
                                    // return false;
                                    $scope.quickBill.userId = $scope.quickBill.EditBillData.user.userId=="" || $scope.quickBill.EditBillData.user.userId==null || $scope.quickBill.EditBillData.user.userId==undefined ? "" : $scope.quickBill.EditBillData.user;
                                }
                            }
                            
                            setTimeout(function(){
                                var clientUpdateData = clientDataIndex;
                                angular.element("input[type='file']").val(null);
                                angular.element(".fileAttachLabel").html('');
                                //$scope.quickBill.documentData = $scope.quickBill.EditBillData.file;
                                if(!angular.isUndefined(clientUpdateData)){
                                    if(clientUpdateData.hasOwnProperty('file')){
                                        if(clientUpdateData.file[0].clientId != '' && clientUpdateData.clientId != null){
                                            $scope.quickBill.documentData = angular.copy(clientUpdateData.file);
                                        }
                                    }
                                    $scope.closingBalance = $filter('filter')(clientUpdateData.closingBalance,{companyId: $scope.quickBill.companyId.companyId});
                                }
                                
                            }, 1000);
                            
                            $scope.quickBill.paymentMode = $scope.quickBill.EditBillData.paymentMode;
                            if($scope.quickBill.paymentMode == 'bank' || $scope.quickBill.paymentMode=='neft' || $scope.quickBill.paymentMode=='rtgs' || $scope.quickBill.paymentMode=='imps' || $scope.quickBill.paymentMode=='nach' || $scope.quickBill.paymentMode=='ach' || $scope.quickBill.paymentMode=='card'){
                                
                                $scope.quickBill.checkNumber = $scope.quickBill.EditBillData.checkNumber;
                                $scope.quickBill.bankName = $scope.quickBill.EditBillData.bankName;
                                if ($scope.quickBill.EditBillData.bankLedgerId != 0) {
                                    //Get Bank Ledger of this Company
                                    loadBankLedgerOfCompany(setCompanyData.companyId,function(responseBank){
                                        $scope.quickBill.bankLedgerId = responseBank;
                                    },$scope.quickBill.EditBillData.bankLedgerId);
                                }
                            }
                            
                            if(copyData == 'copy'){
                                
                                var getLatestInvoice = apiPath.getLatestInvoice1+$scope.quickBill.EditBillData.company.companyId+apiPath.getLatestInvoice2;
                                //Get Invoice#
                                apiCall.getCall(getLatestInvoice).then(function(response4){
                                    
                                    $scope.quickBill.invoiceNumber = getLatestNumber.getInvoice(response4);
                                });
                            }
                            else{
                                
                                $scope.quickBill.invoiceNumber = $scope.quickBill.EditBillData.invoiceNumber;  //Invoice Number
                                
                            }
                            
                            $scope.quickBill.extraCharge = $filter('setDecimal')($scope.quickBill.EditBillData.extraCharge,setDecimalPoint); //Advance
                            $scope.quickBill.advance = $filter('setDecimal')($scope.quickBill.EditBillData.advance,setDecimalPoint); //Advance
                            var getServicedate =  $scope.quickBill.EditBillData.serviceDate;
                            var spliteServicedate = getServicedate.split("-").reverse().join("-");
                            // setTimeout(function() {
                            vm.serviceDate = new Date(spliteServicedate);
                        }
                        else if($scope.saleType == 'QuotationPrint'){
                            
                            if(copyData == 'copy'){
                                
                                var getLatestInvoice = apiPath.getLatestQuotation+$scope.quickBill.EditBillData.company.companyId+apiPath.getLatestInvoice2;
                                //Get Quotation#
                                apiCall.getCall(getLatestInvoice).then(function(response4){
                                    
                                    $scope.quickBill.invoiceNumber = getLatestNumber.getQuotation(response4[0]);
                                    
                                });
                                
                            }
                            else{
                                $scope.quickBill.invoiceNumber = $scope.quickBill.EditBillData.quotationNumber;  //Quotation Number
                            }
                        }
                        
                        /** Company Wise Product **/
                        
                        //Auto Suggest Product Dropdown data
                        vm.productNameDrop = [];
                        productFactory.getProductByCompany($scope.quickBill.EditBillData.company.companyId).then(function(data){
                            vm.productNameDrop = data;
                            filterProductData();
                        });
                        
                        /** End **/
                        
                        $scope.noOfDecimalPoints = parseInt($scope.quickBill.EditBillData.company.noOfDecimalPoints);//decimal points
                        
                        //Set Date
                        var getResdate =  $scope.quickBill.EditBillData.entryDate;
                        var splitedate = getResdate.split("-").reverse().join("-");
                        vm.dt1 = new Date(splitedate);
                        
                        
                        // }, 5000);
                        
                        clientFactory.getSingleClient($scope.quickBill.EditBillData.client.clientId).then(function(clientSingleResponse){
                            vm.clientEditData = clientSingleResponse;
                        });
                        $scope.quickBill.clientId = $scope.quickBill.EditBillData.client.clientId;
                        $scope.quickBill.contactNo = $scope.quickBill.EditBillData.client.contactNo;
                        $scope.quickBill.contactNo1 = $scope.quickBill.EditBillData.client.contactNo1;
                        $scope.quickBill.clientName = $scope.quickBill.EditBillData.client.clientName;
                        $scope.quickBill.emailId = $scope.quickBill.EditBillData.client.emailId;
                        $scope.quickBill.gst = $scope.quickBill.EditBillData.client.gst;
                        $scope.quickBill.address1 = $scope.quickBill.EditBillData.client.address1;
                        
                        if($scope.quickBill.EditBillData.client.hasOwnProperty('professionId')  && $scope.quickBill.EditBillData.client.professionId != '' && $scope.quickBill.EditBillData.client.professionId != null && parseInt($scope.quickBill.EditBillData.client.professionId) != 0){
                            
                            clientFactory.getSingleProfession($scope.quickBill.EditBillData.client.professionId).then(function(response){
                                $scope.quickBill.professionId = response;
                            });
                        }
                        $scope.clearScannedResult(); // Clear Scanned Document
                        
                        
                        /** Set State & City **/
                        var editStateAbb = $scope.quickBill.EditBillData.client.stateAbb;
                        var editCityId = $scope.quickBill.EditBillData.client.cityId;
                        
                        //State DropDown Selection
                        vm.statesDrop=[];
                        vm.cityDrop=[];
                        stateCityFactory.getState().then(function(response){
                            
                            vm.statesDrop = response;	
                            $scope.quickBill.stateAbb =  stateCityFactory.getDefaultState(editStateAbb);
                            vm.cityDrop = stateCityFactory.getDefaultStateCities(editStateAbb);
                            $scope.quickBill.cityId = stateCityFactory.getDefaultCity(editCityId);
                        });
                        
                        
                        /** End  **/
                        
                        $scope.quickBill.remark = $scope.quickBill.EditBillData.remark;
                        $scope.quickBill.totalDiscounttype = $scope.quickBill.EditBillData.totalDiscounttype;
                        $scope.quickBill.totalDiscount = parseFloat($scope.quickBill.EditBillData.totalDiscount) > 0 ? $scope.quickBill.EditBillData.totalDiscount : 0;
                        
                        $scope.quickBill.totalCgstPercentage = $scope.quickBill.EditBillData.totalCgstPercentage > 0 ? $scope.quickBill.EditBillData.totalCgstPercentage : 0;
                        $scope.quickBill.totalSgstPercentage = $scope.quickBill.EditBillData.totalSgstPercentage > 0 ? $scope.quickBill.EditBillData.totalSgstPercentage : 0;
                        $scope.quickBill.totalIgstPercentage = $scope.quickBill.EditBillData.totalIgstPercentage > 0 ? $scope.quickBill.EditBillData.totalIgstPercentage : 0;
                        
                        $scope.expenseAmount=[];
                        if('expense' in $scope.quickBill.EditBillData)
                        {
                            if(Array.isArray(jsonExpense))
                            {
                                if(jsonExpense.length>0)
                                {
                                    $scope.openExpenseRawData=true;
                                    vm.AccExpense = angular.copy(jsonExpense);
                                }
                            }		
                        }
                        else
                        {
                            $scope.openExpenseRawData=false;
                            vm.AccExpense = [];
                        }
                        vm.AccBillTable = angular.copy(jsonProduct.inventory);
                        
                        
                        //inventory
                        var EditProducArray = angular.copy(jsonProduct.inventory);
                        var count = EditProducArray.length;
                        
                        var d = 0;
                        (function productFixInner(wx){
                            var setData = EditProducArray[wx];
                            productFactory.getSingleProduct(setData.productId).then(function(resData){
                                /** Tax **/
                                vm.AccBillTable[d].productName = resData[$scope.displayProductName] ? resData[$scope.displayProductName] : resData.productName;
                                if (angular.isArray(setData.itemizeDetail)) {
                                    vm.AccBillTable[d].itemizeDetail = setData.itemizeDetail;
                                }else if(setData.itemizeDetail == ''){
                                    vm.AccBillTable[d].itemizeDetail = [];
                                }else if (angular.isString(setData.itemizeDetail)) {
                                    vm.AccBillTable[d].itemizeDetail = angular.fromJson(setData.itemizeDetail);
                                }
                                vm.productHsn[d] = resData.hsn;
                                if (!EditProducArray[d].hasOwnProperty('cgstPercentage')) {
                                    vm.AccBillTable[d].cgstPercentage = parseFloat(resData.vat);
                                    vm.AccBillTable[d].sgstPercentage = parseFloat(resData.additionalTax); // Additional Tax
                                    $scope.calculateTaxReverse(vm.AccBillTable[d],parseFloat(resData.vat),parseFloat(resData.additionalTax),0,d);
                                }
                                else{
                                    vm.AccBillTable[d].cgstPercentage = checkGSTValue(EditProducArray[d].cgstPercentage);
                                    vm.AccBillTable[d].sgstPercentage = checkGSTValue(EditProducArray[d].sgstPercentage);
                                    vm.AccBillTable[d].igstPercentage = checkGSTValue(EditProducArray[d].igstPercentage);
                                }
                                vm.AccBillTable[d].amount = EditProducArray[d].amount; // For Amount (Reverse Calculation) not be Incorrect
                                
                                if($scope.enableDisableAdvanceMou)
                                {
                                    vm.measurementUnitDrop[d] = [];
                                    // vm.AccBillTable[d].measurementUnit = {};
                                    var unitParams = ['highest','higher','medium','mediumLower','lower','lowest'];
                                    for (var i = 0; i < unitParams.length; i++) {
                                        if (i < unitParams.length - 1) {
                                            if (angular.isObject(resData[unitParams[i]+'MeasurementUnit']) && angular.isDefined(resData[unitParams[i]+'MeasurementUnit'].measurementUnitId)) {
                                                vm.measurementUnitDrop[d].push(resData[unitParams[i]+'MeasurementUnit']);
                                            }
                                        }else{
                                            if (angular.isObject(resData.measurementUnit) && angular.isDefined(resData.measurementUnit.measurementUnitId)) {
                                                vm.measurementUnitDrop[d].push(resData.measurementUnit);
                                            }
                                        }
                                    }
                                    if (vm.AccBillTable[d].measurementUnit) {
                                        var billObject = vm.AccBillTable[d];
                                        
                                        if (billObject.measurementUnit) {
                                            var unitParams = ['highest','higher','medium','mediumLower','lower','lowest'];
                                            for (var i = 0; i < unitParams.length; i++) {
                                                if (i < unitParams.length - 1) {
                                                    if (angular.isObject(resData.measurementUnit) && billObject.measurementUnit == resData.measurementUnit.measurementUnitId) {
                                                        billObject.measurementUnit = resData.measurementUnit;
                                                        break;
                                                    }
                                                }else{
                                                    if (angular.isObject(resData[unitParams[i]+'MeasurementUnit']) && billObject[unitParams[i]+'MeasurementUnit'] == resData[unitParams[i]+'MeasurementUnit'].measurementUnitId) {
                                                        billObject.measurementUnit = resData[unitParams[i]+'MeasurementUnit'];
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else if ($scope.enableDisableLWHSetting) {
                                    if (angular.isObject(resData.measurementUnit) && angular.isDefined(resData.measurementUnit.measurementUnitId)) {
                                        vm.AccBillTable[d].lengthValue = setData.lengthValue;
                                        vm.AccBillTable[d].widthValue = setData.widthValue;
                                        vm.AccBillTable[d].heightValue = setData.heightValue;
                                        vm.AccBillTable[d].devideFactor = setData.devideFactor;
                                        if (angular.isDefined(setData.devideFactor) && 
                                        !isNaN(parseFloat(setData.devideFactor)) && 
                                        parseFloat(setData.devideFactor) > 0) {
                                            vm.AccBillTable[d].devideFactor = parseFloat(setData.devideFactor);
                                        }else if (angular.isDefined(resData.measurementUnit.devideFactor) && 
                                        !isNaN(parseFloat(resData.measurementUnit.devideFactor)) && 
                                        parseFloat(resData.measurementUnit.devideFactor) > 0) {
                                            vm.AccBillTable[d].devideFactor = parseFloat(resData.measurementUnit.devideFactor);
                                        }else{
                                            vm.AccBillTable[d].devideFactor = 1;
                                        }
                                        $scope.enableDisableLWHArray[d] = {};
                                        $scope.enableDisableLWHArray[d].totalFt = $filter('setDecimal')(parseFloat(setData.lengthValue)*parseFloat(setData.widthValue)*parseFloat(setData.heightValue)*parseFloat(setData.qty)/parseFloat(vm.AccBillTable[d].devideFactor),$scope.noOfDecimalPoints);
                                        if (angular.isDefined(vm.AccBillTable[d].stockFt) || vm.AccBillTable[d].stockFt == 'undefined') {
                                            vm.AccBillTable[d].stockFt = getCalcQty(setData,$scope.enableDisableLWHArray[d]);
                                        }else{
                                            vm.AccBillTable[d].stockFt = setData.stockFt;
                                        }
                                        resData.measurementUnit.lengthStatus == 'enable' ? 
                                        $scope.enableDisableLWHArray[d].lengthStatus = true : $scope.enableDisableLWHArray[d].lengthStatus = false;
                                        $scope.enableDisableLWHArray[d].widthStatus = resData.measurementUnit.widthStatus == 'enable' ? true : false;
                                        $scope.enableDisableLWHArray[d].heightStatus = resData.measurementUnit.heightStatus == 'enable' ? true : false;
                                        if ($scope.enableDisableLWHArray[d].lengthStatus &&
                                            $scope.enableDisableLWHArray[d].widthStatus &&
                                            $scope.enableDisableLWHArray[d].heightStatus) 
                                            {
                                                $scope.enableDisableLWHArray[d].styleObj = {
                                                    "width" : "33.33%",
                                                    "padding-left": "6px",
                                                    "padding-right": "6px",
                                                    "float":"left"
                                                };
                                            }else if ($scope.enableDisableLWHArray[d].lengthStatus && $scope.enableDisableLWHArray[d].widthStatus ||
                                                $scope.enableDisableLWHArray[d].lengthStatus && $scope.enableDisableLWHArray[d].heightStatus ||
                                                $scope.enableDisableLWHArray[d].heightStatus && $scope.enableDisableLWHArray[d].widthStatus) 
                                                {
                                                    $scope.enableDisableLWHArray[d].styleObj = {
                                                        "width" : "50%",
                                                        "padding-left": "6px",
                                                        "padding-right": "6px",
                                                        "float":"left"
                                                    };
                                                }else{
                                                    $scope.enableDisableLWHArray[d].styleObj = {"width" : "100%"};
                                                }
                                                
                                            }else{
                                                $scope.enableDisableLWHArray[d] = {};
                                            }
                                        }else{
                                            vm.AccBillTable[d].measurementUnit = resData.measurementUnit;
                                        }
                                        d++;
                                        if (d < count) 
                                        {
                                            productFixInner(d);
                                        }
                                        /** End **/
                                    });
                                })(d);
                                
                                toaster.clear();
                                if(copyData == 'copy'){
                                    
                                    $scope.quickBill.EditBillData = undefined;
                                    $scope.changeProductArray = true;
                                    $scope.changeProductAdvancePrice = true;
                                }
                                
                                //vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":1000,"discount":"","qty":3,"amount":""}];
                                
                            }
                            else{
                                vm.disableCompany = false;
                                
                                //get Company
                                vm.companyDrop=[];
                                apiCall.getCall(apiPath.getAllCompany).then(function(response2){
                                    
                                    toaster.clear();
                                    toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
                                    vm.companyDrop = response2;
                                    
                                    $scope.defaultComapny();
                                });
                                
                                vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
                                vm.AccExpense = [];
                                // vm.AccExpense = [{"expenseName":"hii"}];
                                //vm.productTax = [{"tax":0,"additionalTax":0}];
                                vm.productHsn = [];
                                
                                $scope.quickBill.totalDiscounttype = 'flat';
                            }
                        }	
                        /** End **/
                        
                        
                        
                        
                        //Change in Product Table
                        $scope.changeProductTable = function(){
                            $scope.changeProductArray = true;
                            $scope.changeProductAdvancePrice = true;
                            // $scope.quickBill.advance = $filter('setDecimal')(($scope.total) + ($scope.quickBill.extraCharge ? $scope.quickBill.extraCharge*1 : 0),$scope.noOfDecimalPoints);
                        }
                        
                        //Change in Product Advance
                        $scope.changeProductAdvance = function(){
                            
                            $scope.changeProductAdvancePrice = true;
                            
                        }
                        
                        //Changed date
                        $scope.changeBillDate = function(Fname){
                            
                            if(formdata.has(Fname))
                            {
                                formdata.delete(Fname);
                            }
                            var  date = new Date(vm.dt1);
                            var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
                            
                            var new_date = moment(fdate, "DD-MM-YYYY").add('days', arrayData1.servicedateNoOfDays);
                            var day = new_date.format('DD');
                            var month = new_date.format('MM');
                            var year = new_date.format('YYYY');
                            vm.serviceDate = new Date(year,month-1,day);
                            
                            var  serviceDate = new Date(vm.serviceDate);
                            var fServicedate  = serviceDate.getDate()+'-'+(serviceDate.getMonth()+1)+'-'+serviceDate.getFullYear();
                            
                            formdata.set(Fname,fdate);
                            formdata.set('serviceDate',fServicedate);
                        }
                        $scope.serviceDateChange = function(){
                            var  serviceDate = new Date(vm.serviceDate);
                            var fServicedate  = serviceDate.getDate()+'-'+(serviceDate.getMonth()+1)+'-'+serviceDate.getFullYear();
                            formdata.set('serviceDate',fServicedate);	
                        }
                        $scope.changeInClientData = false;
                        
                        $scope.changeInBill = function(Fname,value) {
                            
                            if(formdata.has(Fname))
                            {
                                formdata.delete(Fname);
                            }
                            if(value != "" && value != undefined){
                                if(Fname=="userId")
                                {
                                    formdata.set(Fname,value.userId);
                                }
                                else
                                {
                                    formdata.set(Fname,value);
                                }
                                
                            }
                            
                            if(Fname == 'contactNo')
                            {
                                
                                formdata.delete('workNo');
                                formdata.delete('contactNo1');
                                formdata.delete('companyName');
                                formdata.delete('clientName');
                                formdata.delete('gst');
                                formdata.delete('emailId');
                                formdata.delete('address1');
                                formdata.delete('address2');
                                formdata.delete('professionId');
                                formdata.delete('stateAbb');
                                formdata.delete('cityId');
                                
                                $scope.quickBill.WorkNo = '';
                                $scope.quickBill.contactNo1 = '';
                                $scope.quickBill.companyName = ''
                                $scope.quickBill.clientId = null;
                                $scope.quickBill.clientName = '';
                                $scope.quickBill.gst = '';
                                $scope.quickBill.emailId = '';
                                $scope.quickBill.address1 = '';
                                $scope.quickBill.secondAddress = '';
                                $scope.quickBill.professionId = {};
                                $scope.quickBill.documentData = '';
                                vm.clientEditData = {};
                                formdata.set('stateAbb',$scope.quickBill.stateAbb.stateAbb);
                                formdata.set('cityId',$scope.quickBill.cityId.cityId);
                                
                                $scope.clientSaveButton = true;
                            }
                            
                            if($scope.quickBill.EditBillData){
                                if(Fname == 'clientName' || Fname == 'address1' || Fname == 'stateAbb' || Fname == 'cityId' || Fname == 'emailId' || Fname == 'professionId' || Fname == 'contactNo1' || Fname == 'gst'){
                                    $scope.changeInClientData = true;
                                }
                            }
                        }
                        
                        /** Insert Client **/
                        
                        $scope.insertClientData = function(){
                            
                            if($scope.quickBill.contactNo == undefined || $scope.quickBill.contactNo1 == undefined || $scope.quickBill.clientName == undefined || $scope.quickBill.emailId == undefined || $scope.quickBill.address1 == undefined || $scope.quickBill.contactNo == '' || $scope.quickBill.clientName == '' || $scope.quickBill.gst == undefined){
                                toaster.clear();
                                toaster.pop('warning','Enter Proper Data');
                                return false;
                            }
                            
                            var clientFormdata = new FormData();
                            
                            clientFormdata.set('contactNo',$scope.quickBill.contactNo);
                            clientFormdata.set('contactNo1',$scope.quickBill.contactNo1);
                            clientFormdata.set('clientName',$scope.quickBill.clientName);
                            clientFormdata.set('emailId',$scope.quickBill.emailId);
                            clientFormdata.set('gst',$scope.quickBill.gst);
                            clientFormdata.set('address1',$scope.quickBill.address1);
                            clientFormdata.set('stateAbb',$scope.quickBill.stateAbb.stateAbb);
                            clientFormdata.set('cityId',$scope.quickBill.cityId.cityId);
                            
                            if($scope.quickBill.professionId.professionId){
                                clientFormdata.set('professionId',$scope.quickBill.professionId.professionId);
                            }
                            
                            
                            clientFactory.insertAndSetNewClient(clientFormdata).then(function(data){
                                if(angular.isObject(data)){
                                    $scope.setClientSuggest('contactNo',data);
                                    toaster.pop('success','Client Saved');
                                }
                                else{
                                    if(data == apiResponse.contentNotProper){
                                        toaster.pop('info','Client Already Saved');
                                    }
                                    else{
                                        toaster.pop('warning',data);
                                    }
                                }
                            });
                        }
                        
                        /** End **/
                        
                        $scope.changePaymentInBill = function(Fname,value) {
                            
                            if(formdata.has(Fname))
                            {
                                formdata.delete(Fname);
                            }
                            
                            formdata.delete('bankName');
                            formdata.delete('checkNumber');
                            formdata.delete('bankLedgerId');
                            
                            if(value == 'cash' || value == 'credit') {
                                $scope.quickBill.bankName = "";
                                $scope.quickBill.checkNumber = "";
                                $scope.quickBill.bankLedgerId = "";
                                if (value == 'credit') {
                                    $scope.quickBill.advance = 0;
                                }
                            } else {
                                $scope.quickBill.bankName ? formdata.set('bankName',$scope.quickBill.bankName) : '';
                                $scope.quickBill.chequeNo ? formdata.set('checkNumber',$scope.quickBill.chequeNo) : '';
                                $scope.quickBill.bankLedgerId ? formdata.set('bankLedgerId',$scope.quickBill.bankLedgerId.ledgerId) : '';
                            }
                            formdata.set(Fname,value);
                            
                        }
                        
                        //Total Tax For Product Table
                        // $scope.getTotalAmount = function(){
                        
                        // var total = 0;
                        // for(var i = 0; i < vm.AccBillTable.length; i++){
                        // var product = vm.AccBillTable[i];
                        // var varMargin= vm.productTax[i];
                        // var finalAmount = product.price * product.qty;
                        // console.log(finalAmount);
                        // total += productArrayFactory.calculate(finalAmount,0,varMargin.margin);
                        // }
                        // return total;
                        // }
                        
                        
                        
                        
                        
                        $scope.ChangeState = function(Fname,state)
                        {
                            vm.cityDrop = stateCityFactory.getDefaultStateCities(state);
                            
                            if(formdata.has(Fname))
                            {
                                formdata.delete(Fname);
                            }
                            var dataLength = vm.AccBillTable.length;
                            for(var index=0;index<dataLength;index++)
                            {
                                var indexProduct = index;
                                //single product get data from factory
                                // getSetFactory.blank();
                                var  id = vm.AccBillTable[indexProduct].productId;
                                
                                productFactory.getSingleProduct(id).then(function(response){
                                    if(response!=undefined)
                                    {
                                        if($scope.quickBill.companyId.state.stateAbb==state)
                                        {
                                            /* per product GST */
                                            var tempCgst = checkGSTValue(response.vat);
                                            var tempSgst = checkGSTValue(response.additionalTax);
                                            vm.AccBillTable[indexProduct].cgstPercentage = tempCgst;
                                            vm.AccBillTable[indexProduct].sgstPercentage = tempSgst;
                                            vm.AccBillTable[indexProduct].igstPercentage = 0;
                                            $scope.igstDisable=true;
                                            $scope.csgstDisable=false;
                                            /* per product GST */
                                            
                                            /* Overall GST */
                                            $scope.totalCSgstDisable = false;
                                            $scope.totalIgstDisable = true;
                                            $scope.quickBill.totalCgstPercentage = 0;
                                            $scope.quickBill.totalSgstPercentage = 0;
                                            $scope.quickBill.totalIgstPercentage = 0;
                                            /* End */
                                        }
                                        else
                                        {
                                            /* per product GST */
                                            var tempIgst = checkGSTValue(response.igst);
                                            vm.AccBillTable[indexProduct].cgstPercentage = 0;
                                            vm.AccBillTable[indexProduct].sgstPercentage = 0;
                                            vm.AccBillTable[indexProduct].igstPercentage = tempIgst;
                                            $scope.csgstDisable = true;
                                            $scope.igstDisable = false;
                                            /* per product GST */
                                            
                                            /* Overall GST */
                                            $scope.totalCSgstDisable = true;
                                            $scope.totalIgstDisable = false;
                                            /* End */
                                        }		
                                    }
                                });	
                            }
                            
                            formdata.set(Fname,state);
                            
                        }
                        
                        /* End */
                        
                        
                        
                        //Change Invoice Number When Company Changed
                        $scope.changeCompany = function(item)
                        {
                            // if ($scope.formBill.companyDropDown.$touched) {
                            
                            if(angular.isObject(item)){
                                
                                vm.loadData = true;
                                toaster.clear();
                                toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
                                
                                loadBranchesOfCompany(item.companyId,function(branchres){
                                    formdata.delete('branchId');
                                    if(angular.isArray(branchres)){
                                        if (branchres.length > 0){
                                            $scope.quickBill.branchId = branchres[0];
                                            formdata.set('branchId',branchres[0].branchId);
                                        }
                                    }
                                }); //Get Branches of Selected Company
                                $scope.noOfDecimalPoints = parseInt(item.noOfDecimalPoints);
                                $scope.displayDefaultCompanyName = item.companyName;
                                //Auto Suggest Product Dropdown data
                                vm.productNameDrop = [];
                                
                                //apiCall.getCall(apiPath.getProductByCompany+item.companyId+'/branch').then(function(responseDrop){
                                
                                //vm.productNameDrop = responseDrop;
                                //vm.productNameDrop = productFactory.getProductByCompany(item.companyId);
                                
                                productFactory.getProductByCompany(item.companyId).then(function(data){
                                    // console.log('1815....',data);
                                    vm.productNameDrop = data;
                                    filterProductData();
                                    $scope.getInvoiceAndJobcardNumber(item.companyId); // Invoice#
                                    
                                    vm.loadData = false;
                                });
                                
                                //Get Bank Ledger of this Company
                                loadBankLedgerOfCompany(item.companyId,function(responseBank){
                                    
                                });
                                
                                //});
                                
                                vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
                                //vm.productTax = [{"tax":0,"additionalTax":0}];
                                vm.productHsn = [];
                                $scope.quickBill.advance = 0;
                                
                                $scope.printButtonType = item.printType == '' ? 'print':item.printType;
                                
                                // if(formdata.has('companyId')){
                                formdata.delete('companyId');
                                //}
                                formdata.set('companyId',item.companyId);
                                // }
                                // else{
                                // console.log('ELLSSEEE');
                                // }
                            }
                        }
                        
                        function insertvalTime(){
                            setInterval(function(){
                                if($scope.quickBill.companyId)
                                {
                                    var id = $scope.quickBill.companyId.companyId;
                                    productFactory.getProductByCompany(id).then(function(data){
                                        if(angular.isArray(data)){
                                            // console.log('1855....',data);
                                            vm.productNameDrop = data;
                                            filterProductData();
                                        }
                                    });
                                    $scope.getInvoiceAndJobcardNumber(id); // Invoice#
                                }
                                
                            },5000);
                        }
                        
                        $scope.disableButton = false;
                        
                        //alert($scope.getTotal());
                        
                        $scope.pop = function(generate)
                        {
                            // $scope.disableButton = true;
                            if ($scope.enableQuotationWorkflow && ($scope.saleType == 'QuotationPrint')) {
                                if (Modalopened) return;
                                toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                                
                                var modalInstance = $modal.open({
                                    templateUrl: 'app/views/PopupModal/Accounting/QuotationFlow.html',
                                    controller: 'QuotationFlowController as form',
                                    size: 'md',
                                    backdrop  : 'static',
                                    keyboard  : false,
                                    resolve:{
                                        companyId: function(){
                                            return $scope.quickBill.companyId.companyId;
                                        },
                                        transactionType: function(){
                                            return $scope.saleType;
                                        }
                                    }
                                });
                                
                                Modalopened = true;
                                modalInstance.opened.then(function() {
                                    toaster.clear();
                                });
                                modalInstance.result.then(function (returnModalData) {
                                    Modalopened = false;
                                    if(angular.isObject(returnModalData)){
                                        formdata.set('workflowStatus',returnModalData.statusId.statusId);
                                        formdata.set('assignedTo',returnModalData.userId.userId);
                                        formdata.set('assignedBy',$rootScope.$storage.authUser.userId);
                                        $scope.popFurther(generate);
                                    }
                                    
                                }, function (returnModalData2) {
                                    Modalopened = false;
                                    formdata.set('workflowStatus',returnModalData2.statusId);
                                    formdata.set('assignedTo',$rootScope.$storage.authUser.userId);
                                    formdata.set('assignedBy',$rootScope.$storage.authUser.userId);
                                    $scope.popFurther(generate);
                                });
                            }else{
                                $scope.popFurther(generate);
                            }
                        }
                        $scope.popFurther = function(generate) {
                            if($scope.quickBill.EditBillData){
                                
                                formdata.delete('companyId');
                                
                                toaster.clear();
                                toaster.pop('wait', 'Please Wait', 'Data Updating....',600000);
                                if($scope.saleType == 'QuotationPrint'){
                                    var BillPath = apiPath.postQuotationBill+'/'+$scope.quickBill.EditBillData.quotationBillId;
                                }
                                else{
                                    var rootUrl =  apiPath.postBill;
                                    var BillPath = rootUrl+'/'+$scope.quickBill.EditBillData.saleId;
                                    if($scope.changeProductArray){
                                        
                                        formdata.set('balance',$scope.quickBill.balance);
                                        formdata.set('grandTotal',$scope.grandTotalTable);
                                        $scope.quickBill.advance ? formdata.set('advance',$scope.quickBill.advance):formdata.set('advance',0);
                                    }
                                }
                                
                                if($scope.changeProductArray){
                                    
                                    formdata.set('total',$scope.total);
                                    // if($scope.enableDisableGST){
                                    //     formdata.set('tax',$scope.quickBill.tax);
                                    // }
                                    
                                    formdata.delete('extraCharge');
                                    
                                    $scope.quickBill.extraCharge ? formdata.set('extraCharge',$scope.quickBill.extraCharge) : formdata.set('extraCharge',0);
                                    
                                    formdata.delete('totalDiscounttype');
                                    formdata.delete('totalDiscount');
                                    
                                    $scope.quickBill.totalDiscounttype ? formdata.set('totalDiscounttype',$scope.quickBill.totalDiscounttype):formdata.set('totalDiscounttype','flat');
                                    $scope.quickBill.totalDiscount ? formdata.set('totalDiscount',$scope.quickBill.totalDiscount):formdata.set('totalDiscount',0);
                                    
                                    formdata.set('totalCgstPercentage',checkGSTValue($scope.quickBill.totalCgstPercentage));
                                    formdata.set('totalSgstPercentage',checkGSTValue($scope.quickBill.totalSgstPercentage));
                                    formdata.set('totalIgstPercentage',checkGSTValue($scope.quickBill.totalIgstPercentage));
                                    
                                }
                                
                                if($scope.changeInClientData === true){
                                    formdata.set('contactNo',$scope.quickBill.contactNo);
                                    formdata.set('contactNo1',$scope.quickBill.contactNo1);
                                    formdata.set('clientName',$scope.quickBill.clientName);
                                    formdata.set('address1',$scope.quickBill.address1);
                                    formdata.set('stateAbb',$scope.quickBill.stateAbb.stateAbb);
                                    formdata.set('cityId',$scope.quickBill.cityId.cityId);
                                    formdata.set('emailId',$scope.quickBill.emailId);
                                    formdata.set('gst',$scope.quickBill.gst);
                                    if($scope.quickBill.professionId){
                                        formdata.set('professionId',$scope.quickBill.professionId.professionId);
                                    }
                                }
                                
                                if($scope.saleType == 'QuotationPrint')
                                {
                                    formdata.delete('serviceDate');
                                }
                                //Po Number
                                //$scope.quickBill.poNumber != '' || $scope.quickBill.poNumber != undefined ? formdata.set('poNumber',$scope.quickBill.poNumber) : '';
                            }
                            else{
                                toaster.clear();
                                toaster.pop('wait', 'Please Wait', 'Data Inserting....',600000);
                                
                                var  date = new Date(vm.dt1);
                                var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
                                
                                var  serviceDate = new Date(vm.serviceDate);
                                var fServiceDate  = serviceDate.getDate()+'-'+(serviceDate.getMonth()+1)+'-'+serviceDate.getFullYear();
                                
                                if(!formdata.has('companyId')){
                                    
                                    formdata.set('companyId',$scope.quickBill.companyId.companyId);
                                }
                                
                                if(!formdata.has('entryDate')){
                                    
                                    formdata.set('entryDate',fdate);
                                }
                                
                                
                                formdata.set('transactionDate',fdate);
                                
                                /** Client Data **/
                                
                                if(!formdata.has('contactNo')){
                                    if($scope.quickBill.contactNo == undefined){
                                        formdata.set('contactNo','');
                                    }
                                    else{
                                        formdata.delete('contactNo');
                                        formdata.set('contactNo',$scope.quickBill.contactNo);
                                    }
                                }
                                
                                
                                formdata.delete('clientName');
                                formdata.delete('emailId');
                                formdata.delete('address1');
                                formdata.delete('contactNo1');
                                formdata.delete('gst');
                                
                                
                                formdata.set('clientName',$scope.quickBill.clientName);
                                
                                if($scope.quickBill.contactNo1){
                                    
                                    formdata.set('contactNo1',$scope.quickBill.contactNo1);
                                }
                                if($scope.quickBill.emailId){
                                    
                                    formdata.set('emailId',$scope.quickBill.emailId);
                                }
                                if($scope.quickBill.gst){
                                    
                                    formdata.set('gst',$scope.quickBill.gst);
                                }
                                
                                if($scope.quickBill.address1){
                                    
                                    formdata.set('address1',$scope.quickBill.address1);
                                }
                                
                                
                                if(!formdata.has('stateAbb'))
                                {
                                    formdata.set('stateAbb',$scope.quickBill.stateAbb.stateAbb);
                                }
                                
                                if(!formdata.has('cityId'))
                                {
                                    formdata.set('cityId',$scope.quickBill.cityId.cityId);
                                }
                                
                                /** End **/
                                
                                if($scope.saleType == 'QuotationPrint'){
                                    
                                    formdata.delete('serviceDate');
                                    
                                    formdata.set('quotationNumber',$scope.quickBill.invoiceNumber);
                                    
                                    var BillPath = apiPath.postQuotationBill;
                                    
                                }
                                else
                                {
                                    if(!formdata.has('serviceDate'))
                                    {
                                        formdata.set('serviceDate',fServiceDate);
                                    }
                                    
                                    formdata.set('invoiceNumber',$scope.quickBill.invoiceNumber);
                                    
                                    if(!formdata.has('paymentMode')){
                                        
                                        formdata.set('paymentMode',$scope.quickBill.paymentMode);
                                    }
                                    
                                    formdata.set('grandTotal',$scope.grandTotalTable);
                                    if($scope.quickBill.advance)
                                    {
                                        formdata.set('advance',$scope.quickBill.advance);
                                    }
                                    else{
                                        formdata.set('advance',0);
                                    }
                                    
                                    formdata.set('balance',$scope.quickBill.balance);
                                    
                                    var BillPath = apiPath.postBill;
                                }
                                
                                formdata.set('total',$scope.total);
                                formdata.set('tax',$scope.quickBill.tax);
                                
                                formdata.delete('totalDiscounttype');
                                formdata.delete('totalDiscount');
                                
                                $scope.quickBill.totalDiscounttype ? formdata.set('totalDiscounttype',$scope.quickBill.totalDiscounttype):formdata.set('totalDiscounttype','flat');
                                $scope.quickBill.totalDiscount ? formdata.set('totalDiscount',$scope.quickBill.totalDiscount):formdata.set('totalDiscount',0);
                                
                                formdata.set('totalCgstPercentage',checkGSTValue($scope.quickBill.totalCgstPercentage));
                                formdata.set('totalSgstPercentage',checkGSTValue($scope.quickBill.totalSgstPercentage));
                                formdata.set('totalIgstPercentage',checkGSTValue($scope.quickBill.totalIgstPercentage));
                                
                                if($scope.quickBill.extraCharge){
                                    
                                    formdata.delete('extraCharge');
                                    formdata.set('extraCharge',$scope.quickBill.extraCharge);
                                }
                                else{
                                    formdata.delete('extraCharge');
                                    formdata.set('extraCharge',0);
                                }
                                
                                formdata.set('isDisplay','yes');
                            }
                            
                            if($scope.changeProductArray){
                                
                                var  date = new Date();
                                var tdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
                                
                                if(!formdata.has('transactionDate')){
                                    
                                    formdata.set('transactionDate',tdate);	
                                }
                                
                                
                                //Inventory
                                var json2 = angular.copy(vm.AccBillTable);
                                
                                for(var i=0;i<json2.length;i++){
                                    
                                    angular.forEach(json2[i], function (value,key) {
                                        var setData = value;
                                        if(key == 'measurementUnit'){
                                            if(angular.isObject(value)){
                                                setData = value.measurementUnitId;
                                            }
                                        }
                                        if (key == 'itemizeDetail') {
                                            setData = JSON.stringify(value);
                                        }
                                        formdata.set('inventory['+i+']['+key+']',setData);
                                    });
                                }
                                if(vm.AccExpense.length>0)
                                {
                                    if(vm.AccExpense[0].expenseValue!=0)
                                    {
                                        var json3 = angular.copy(vm.AccExpense);
                                        
                                        for(var i=0;i<json3.length;i++){
                                            
                                            angular.forEach(json3[i], function (value,key) {
                                                
                                                formdata.set('expense['+i+']['+key+']',value);
                                            });
                                            
                                        }
                                    }
                                }
                            }
                            
                            var headerData = {'Content-Type': undefined};
                            
                            if($scope.saleType == 'WholesaleBill' || $scope.saleType == 'SalesOrder'){
                                if(generate == 'preprint'){
                                    headerData.operation = 'preprint';
                                }else if(generate == 'generate'){
                                    headerData.operation = 'generate';
                                }
                                if($scope.saleType == 'SalesOrder')
                                {
                                    if($scope.quickBill.EditBillData)
                                    {
                                        headerData.isSalesOrderUpdate = 'ok';
                                        formdata.delete('isSalesOrderUpdate');
                                    }
                                    else{
                                        headerData.isSalesOrder = 'ok';
                                    }
                                    //headerData.isSalesOrderUpdate = 'ok';
                                }
                                // else if($scope.saleType == 'WholesaleBill' && formdata.has('isSalesOrderUpdate')){
                                // 	headerData.isSalesOrderUpdate = 'ok';
                                // 	formdata.delete('isSalesOrderUpdate');
                                // }
                                else if ($scope.saleType == 'WholesaleBill') {
                                    headerData.salesType = 'whole_sales';
                                    if (formdata.has('isSalesOrderUpdate')) {
                                        headerData.isSalesOrderUpdate = 'ok';
                                        formdata.delete('isSalesOrderUpdate');
                                        formdata.set('isSalesorder','not');
                                    }
                                }
                            }
                            apiCall.postCallHeader(BillPath,headerData,formdata).then(function(data) {
                                toaster.clear();
                                // Delete formdata  keys
                                // for (var key of formdata.keys()) {
                                // formdata.delete(key); 
                                // }
                                //Delete Inventory Data From Formdata Object
                                var json3 = angular.copy(vm.AccBillTable);
                                for (var i=0;i<json3.length;i++) {
                                    angular.forEach(json3[i], function (value,key) {
                                        formdata.delete('inventory['+i+']['+key+']');
                                    });
                                }
                                
                                var json4 = angular.copy(vm.AccExpense);
                                
                                for (var i=0;i<json4.length;i++) {
                                    angular.forEach(json4[i], function (value,key) {
                                        formdata.delete('expense['+i+']['+key+']');
                                    });
                                }
                                
                                
                                if (!$scope.quickBill.EditBillData) {
                                    formdata.delete('entryDate');
                                    formdata.delete('serviceDate');
                                }
                                
                                formdata.delete('invoiceNumber');
                                formdata.delete('quotationNumber');
                                formdata.delete('transactionDate');
                                formdata.delete('total');
                                formdata.delete('tax');
                                formdata.delete('grandTotal');
                                formdata.delete('advance');
                                formdata.delete('balance');
                                formdata.delete('labourCharge');
                                
                                //formdata.delete('inventory');
                                formdata.delete('isDisplay');
                                
                                
                                if(angular.isObject(data) && data.hasOwnProperty('documentPath')) {
                                    
                                    if($scope.quickBill.EditBillData){
                                        
                                        toaster.pop('success', 'Title', 'Update Successfully');
                                    }
                                    else{
                                        
                                        toaster.pop('success', 'Title', 'Insert Successfully');
                                    }
                                    
                                    $scope.disableButton = false;
                                    
                                    // apiCall.postCall(apiPath.getAllInvoice+'/'+$scope.quickBill.invoiceId,formdataNew).then(function(response3){
                                    
                                    // formdataNew.delete('endAt');
                                    
                                    // });
                                    angular.element("input[type='file']").val(null);
                                    angular.element(".fileAttachLabel").html('');
                                    formdata.delete('file[]');
                                    
                                    formdata.delete('companyId');
                                    formdata.delete('contactNo');
                                    formdata.delete('contactNo1');
                                    formdata.delete('workNo');
                                    formdata.delete('companyName');
                                    formdata.delete('clientName');
                                    formdata.delete('gst');
                                    
                                    formdata.delete('emailId');
                                    formdata.delete('address1');
                                    formdata.delete('address2');
                                    formdata.delete('stateAbb');
                                    formdata.delete('cityId');
                                    formdata.delete('paymentMode');
                                    formdata.delete('bankName');
                                    formdata.delete('checkNumber');
                                    formdata.delete('remark');
                                    
                                    $scope.clearScannedResult();
                                    if(generate == 'generate'){
                                        var pdfPath = $scope.erpPath+data.documentPath;
                                        $scope.directPrintPdf(pdfPath);
                                    }
                                    else if(generate == 'preprint'){
                                        var pdfPath = $scope.erpPath+data.preprintDocumentPath;
                                        $scope.directPrintPdf(pdfPath);
                                    }
                                    else{
                                        //console.log('Not');
                                    }
                                    
                                    var companyObject = $scope.quickBill.companyId;
                                    
                                    /** Client Upadte **/
                                    var contactNo = $scope.quickBill.contactNo;
                                    var pushIt;
                                    
                                    clientFactory.getClient().then(function(response){
                                        var indexClient = fetchArrayService.myIndexOf(response,contactNo,'contactNo');
                                        
                                        indexClient !== -1 ? pushIt = false : pushIt = true;
                                        
                                        clientFactory.getSetNewClientByContact(contactNo,pushIt).then(function(response){
                                            $scope.clientGetAllFunction();
                                        });
                                    });		
                                    
                                    /** Client Upadte **/
                                    
                                    $scope.quickBill = [];
                                    vm.dt1 = new Date();
                                    $scope.changeBillDate('entryDate');
                                    vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
                                    $scope.openExpenseRawData=false;
                                    vm.AccExpense = [];
                                    vm.productHsn = [];
                                    
                                    $scope.enableDisableLWHArray = [];
                                    
                                    $scope.changeProductArray = false;
                                    $scope.changeProductAdvancePrice = false;
                                    vm.disableCompany = false; 
                                    $scope.changeInClientData = false; //Client Data Give All in Update
                                    // $scope.defaultComapny();
                                    $scope.ReloadAfterSave(companyObject);
                                    
                                    //$scope.getInitStateCity(); //get Default State and City
                                    
                                    //$scope.stateAndCityDefault(defStateData,defCityData); 
                                    
                                    $scope.quickBill.paymentMode = 'cash';
                                    $scope.quickBill.totalDiscounttype = 'flat';
                                    
                                    $anchorScroll();
                                    $("#contactNoSelect").focus();
                                    
                                }
                                else{
                                    toaster.clear();
                                    if(apiResponse.noContent == data)
                                    {
                                        if(angular.equals($scope.quickBill.EditBillData.lastPdf,{}) || generate == 'not')
                                        {
                                            toaster.pop('info', 'Please Change Your Data');
                                        }
                                        else
                                        {
                                            var pdfPath = $scope.erpPath+$scope.quickBill.EditBillData.lastPdf.documentUrl+$scope.quickBill.EditBillData.lastPdf.documentName;
                                            $scope.directPrintPdf(pdfPath);
                                        }
                                    }
                                    else if(data.status == 500){
                                        toaster.pop('warning', 'Something Wrong', data.statusText);
                                    }
                                    else if(data.status == 0){
                                        toaster.pop('info', 'Check Your Internet Connection');
                                    }
                                    else{
                                        toaster.pop('warning', 'Something Wrong', data);
                                    }
                                    
                                    $scope.disableButton = false;
                                }
                            }).catch(function (reason) {
                                if (reason.status === 500) {
                                    console.log('Encountered server error');
                                }
                            });
                        }
                        
                        $scope.cancel = function(copyData = ""){
                            
                            var CopyBillData = $scope.quickBill.EditBillData;
                            
                            $scope.quickBill = [];
                            $scope.enableDisableLWHArray = [];
                            
                            $scope.disableButton = false; 
                            $scope.changeInClientData = false; //Client Data Give All in Update
                            $scope.openExpenseRawData=false;
                            angular.element("input[type='file']").val(null);
                            angular.element(".fileAttachLabel").html('');
                            formdata = undefined;
                            formdata = new FormData();
                            formdata.delete('isDraft');
                            
                            $scope.clearScannedResult();
                            
                            vm.dt1 = new Date();
                            $scope.changeBillDate('entryDate');
                            vm.AccExpense=[];
                            vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":"","variant":""}];
                            
                            //vm.productTax = [{"tax":0,"additionalTax":0}];
                            vm.productHsn = [];
                            
                            $scope.quickBill.totalDiscounttype = 'flat';
                            
                            vm.cityDrop = [];
                            
                            $scope.changeProductArray = false;
                            $scope.changeProductAdvancePrice = false;
                            vm.disableCompany = false;
                            
                            $scope.clientGetAllFunction();
                            
                            if(copyData == 'copy'){
                                getSetFactory.set(CopyBillData);
                                $scope.EditAddBill('copy');
                            }
                            else{
                                vm.AccExpense = [];
                                $scope.defaultComapny();
                                $scope.quickBill.paymentMode = 'cash';
                            }
                            
                            $("#contactNoSelect").focus();
                            
                            $anchorScroll();
                        }
                        
                        $scope.directPrintPdf = function(pdfUrlPath)
                        {
                            /** Print **/
                            $http({
                                url : pdfUrlPath,
                                method : 'GET',
                                headers : {
                                    'Content-type' : 'application/pdf'
                                },
                                responseType : 'arraybuffer'
                            }).success(function(data, status, headers, config) {
                                var pdfFile = new Blob([ data ], {
                                    type : 'application/pdf'
                                });
                                var pdfUrl = URL.createObjectURL(pdfFile);
                                $scope.content = $sce.trustAsResourceUrl(pdfUrl);
                                
                                // var el = document.getElementById("report");
                                // el.focus();
                                // el.print();
                                var printwWindow = $window.open(pdfUrl);
                                // printwWindow.focus();
                                printwWindow.print();
                            }).error(function(data, status, headers, config) {
                                alert('Sorry, something went wrong')
                            });
                            /** End **/
                        }
                        
                        
                        $scope.scannedImageSaveToFormData = function(url,callback){
                            
                            var xhr = new XMLHttpRequest();
                            xhr.onload = function() {
                                var reader = new FileReader();
                                reader.onloadend = function() {
                                    callback(reader.result);
                                }
                                reader.readAsDataURL(xhr.response);
                            };
                            xhr.open('GET', url);
                            xhr.responseType = 'blob';
                            xhr.send();
                            
                            
                        }
                        
                        vm.clientEditData = {};
                        
                        $scope.setClientSuggest = function(Fname,data){
                            $scope.clientSaveButton = false; //Save Button
                            vm.clientEditData = data;
                            // $scope.quickBill.cityId = {};
                            // $scope.quickBill.stateAbb = {};
                            
                            //$scope.quickBill.WorkNo = data.workNo;
                            //$scope.quickBill.companyName = data.companyName;
                            $scope.quickBill.clientId = data.clientId;
                            $scope.quickBill.clientName = data.clientName;
                            $scope.quickBill.contactNo = data.contactNo;
                            $scope.quickBill.gst = data.gst;
                            $scope.closingBalance = $filter('filter')(data.closingBalance,{companyId: $scope.quickBill.companyId.companyId});
                            $scope.quickBill.contactNo1 = data.contactNo1;
                            $scope.quickBill.emailId = data.emailId;
                            
                            $scope.quickBill.address1 = data.address1;
                            //$scope.quickBill.secondAddress = data.address2;
                            
                            $scope.quickBill.stateAbb = data.state;		
                            formdata.delete('stateAbb');
                            formdata.set('stateAbb',$scope.quickBill.stateAbb.stateAbb);
                            
                            vm.cityDrop = stateCityFactory.getDefaultStateCities(data.state.stateAbb);
                            $scope.quickBill.cityId = data.city;
                            formdata.delete('cityId');
                            formdata.set('cityId',$scope.quickBill.cityId.cityId);
                            
                            
                            //Profession
                            formdata.delete('professionId');
                            if(data.profession.professionId != '' || data.profession.professionId != 0){
                                
                                $scope.quickBill.professionId = data.profession;
                                formdata.set('professionId',$scope.quickBill.professionId.professionId);
                                
                            }
                            
                            //Set Document Data
                            if(data.hasOwnProperty('document')){
                                if(data.document.length > 0){
                                    if(data.document[0].clientId != '' && data.document[0].clientId != null){
                                        $scope.quickBill.documentData = data.document;
                                    }
                                }
                            }
                            else if(data.hasOwnProperty('file')){
                                if(data.file.length > 0){
                                    if(data.file[0].clientId != '' && data.file[0].clientId != null){
                                        $scope.quickBill.documentData = data.file;
                                    }
                                }
                            }
                            
                            
                            /** Set Data In Form **/
                            if(formdata.has(Fname)){
                                
                                formdata.delete(Fname);
                            }
                            formdata.set(Fname,$scope.quickBill.contactNo);
                            
                            //formdata.delete('workNo');
                            //formdata.delete('companyName');
                            formdata.delete('clientName');
                            formdata.delete('invoiceNumber');
                            formdata.delete('emailId');
                            formdata.delete('address1');
                            formdata.delete('contactNo1');
                            formdata.delete('gst');
                            //formdata.delete('address2');
                            
                            formdata.set('clientName',$scope.quickBill.clientName);
                            
                            if($scope.quickBill.emailId){
                                
                                formdata.set('emailId',$scope.quickBill.emailId);
                            }
                            if($scope.quickBill.gst){
                                
                                formdata.set('gst',$scope.quickBill.gst);
                            }
                            
                            if($scope.quickBill.contactNo1){
                                
                                formdata.set('contactNo1',$scope.quickBill.contactNo1);
                            }
                            if($scope.quickBill.address1){
                                
                                formdata.set('address1',$scope.quickBill.address1);
                            }
                            /** End **/
                        }
                        
                        /** Client Update Modal **/
                        $scope.editClientData = function(size){
                            
                            toaster.clear();
                            
                            if(angular.equals(vm.clientEditData,{})){
                                toaster.pop('info','Please Select Client');
                                return;
                            }
                            
                            if (Modalopened) return;
                            
                            toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                            
                            var modalInstance = $modal.open({
                                templateUrl: 'app/views/PopupModal/CRM/clientForm.html',
                                controller: 'clientFormModalController as form',
                                resolve:{
                                    clientEditData: function(){
                                        return vm.clientEditData;
                                    }
                                }
                            });
                            
                            Modalopened = true;
                            
                            modalInstance.opened.then(function() {
                                toaster.clear();
                            });
                            
                            modalInstance.result.then(function (returnModalData) {
                                Modalopened = false;
                                if(angular.isObject(returnModalData)){
                                    $scope.setClientSuggest('contactNo',returnModalData);
                                    toaster.pop('success','Updated Successfully');
                                    clientFactory.getClient().then(function(response){ 
                                        vm.clientSuggest = response;
                                    });
                                }
                                
                            }, function () {
                                Modalopened = false;
                            });
                        }
                        /** End **/
                        
                        //Set Multiple File In Formdata On Change
                        $scope.uploadFile = function(files) {
                            
                            toaster.clear();
                            var flag = 0;
                            
                            for(var m=0;m<files.length;m++){
                                
                                if(parseInt(files[m].size) > maxImageSize){
                                    
                                    flag = 1;
                                    formdata.delete('file[]');
                                    angular.element("input[type='file']").val(null);
                                    angular.element(".fileAttachLabel").html('');
                                    break;
                                }
                                
                            }
                            
                            if(flag == 0){
                                
                                formdata.delete('file[]');
                                
                                angular.forEach(files, function (value,key) {
                                    formdata.append('file[]',value);
                                });
                            }
                            else{
                                toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
                            }
                        };
                        
                        /** Next Previews **/
                        $scope.goToNextPrevious = function(nextPre){
                            formdata= undefined;
                            $scope.openedItemizeTree = 0;
                            toaster.clear();
                            if($scope.quickBill.companyId){
                                
                                //Code Start
                                toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
                                
                                formdata = new FormData();
                                
                                var preHeaderData = {'Content-Type': undefined,'companyId':$scope.quickBill.companyId.companyId};
                                
                                if($scope.saleType == 'SalesOrder' || $scope.saleType == 'WholesaleBill'){
                                    if($scope.saleType == 'SalesOrder'){
                                        preHeaderData.isSalesOrder = 'ok';
                                    }
                                    preHeaderData.salesType ='whole_sales';
                                    
                                    var Path = apiPath.postBill;
                                }
                                else if($scope.saleType == 'QuotationPrint'){
                                    var Path = apiPath.postQuotationBill;
                                }
                                
                                if(nextPre == "first" || nextPre == "last"){
                                    preHeaderData.operation = nextPre;
                                }
                                else{
                                    
                                    if($scope.quickBill.EditBillData){
                                        
                                        if(nextPre == 'next'){
                                            
                                            if($scope.saleType == 'WholesaleBill' || $scope.saleType == 'SalesOrder'){
                                                
                                                preHeaderData.nextSaleId = $scope.quickBill.EditBillData.saleId;
                                                
                                            }
                                            else if($scope.saleType == 'QuotationPrint'){
                                                
                                                preHeaderData.nextQuotationId = $scope.quickBill.EditBillData.quotationBillId;
                                                
                                            }
                                            
                                        }
                                        else{
                                            
                                            if($scope.saleType == 'WholesaleBill' || $scope.saleType == 'SalesOrder'){
                                                
                                                preHeaderData.previousSaleId = $scope.quickBill.EditBillData.saleId;
                                                
                                            }
                                            else if($scope.saleType == 'QuotationPrint'){
                                                
                                                preHeaderData.previousQuotationId = $scope.quickBill.EditBillData.quotationBillId;
                                                
                                            }
                                        }
                                        
                                    }
                                    else{
                                        
                                        if(nextPre == 'next'){
                                            
                                            if($scope.saleType == 'WholesaleBill' || $scope.saleType == 'SalesOrder'){
                                                
                                                preHeaderData.nextSaleId = 0;
                                                
                                            }
                                            else if($scope.saleType == 'QuotationPrint'){
                                                
                                                preHeaderData.nextQuotationId = 0;
                                            }
                                            
                                        }
                                        else{
                                            
                                            if($scope.saleType == 'WholesaleBill' || $scope.saleType == 'SalesOrder'){
                                                
                                                preHeaderData.previousSaleId = 0;
                                                
                                            }
                                            else if($scope.saleType == 'QuotationPrint'){
                                                
                                                preHeaderData.previousQuotationId = 0;
                                            }
                                        }
                                    }
                                }
                                //var preHeaderData = {'Content-Type': undefined,'sale_id':sale_id,'salesType':$scope.saleType};
                                
                                apiCall.getCallHeader(Path,preHeaderData).then(function(response){
                                    
                                    if(angular.isArray(response)){
                                        $scope.quickBill = [];
                                        getSetFactory.set(response[0]);
                                        
                                        $scope.EditAddBill();
                                        
                                        $anchorScroll();
                                        
                                    }
                                    else{
                                        
                                        if(apiResponse.noContent == response){
                                            toaster.clear();
                                            toaster.pop('warning', 'Opps!!', 'Data Not Available');
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
                                    //$scope.quickBill.companyId = response[0].company;
                                })
                                
                                //End
                            }
                            else{
                                
                                toaster.pop('info', 'please Select Company');
                            }
                        }
                        
                        /** End **/
                        
                        /** Delete Bill **/
                        
                        $scope.deleteBill = function(size)
                        {
                            //alert(id);
                            toaster.clear();
                            if (Modalopened) return;
                            
                            var modalInstance = $modal.open({
                                templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
                                controller: deleteDataModalController,
                                size: size
                            });
                            
                            Modalopened = true;
                            
                            modalInstance.result.then(function () {
                                
                                var id = $scope.quickBill.EditBillData.saleId;
                                
                                /**Delete Code **/
                                var rootUrl = $scope.saleType == 'WholesaleBill' ? apiPath.postBill : apiPath.postQuotationBill;
                                var deletePath = rootUrl+'/'+id;
                                
                                apiCall.deleteCall(deletePath).then(function(deleteres){
                                    
                                    if(apiResponse.ok == deleteres){
                                        
                                        $scope.cancel();
                                        
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
                        
                        /** End Delete Bill **/
                        
                        /** Preview Bill **/
                        
                        $scope.previewBill = function(size) {
                            toaster.clear();
                            
                            if (Modalopened)
                            {
                                console.log('opened');
                                return;
                            }
                            
                            toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                            
                            if($scope.quickBill.companyId) {
                                
                                var modalInstance = $modal.open({
                                    templateUrl: 'app/views/PopupModal/QuickMenu/PreviewBillModal.html',
                                    controller: previewBillModalController,
                                    size: size,
                                    resolve:{
                                        entryDate: function(){
                                            
                                            return vm.dt1;
                                        },
                                        billData: function(){
                                            
                                            return $scope.quickBill;
                                        },
                                        lwhSettings: function(){
                                            
                                            return $scope.enableDisableLWHArray;
                                        },
                                        inventoryData: function(){
                                            
                                            return vm.AccBillTable;
                                        },
                                        total: function(){
                                            
                                            return $scope.total;
                                        },
                                        grandTotal: function(){
                                            
                                            return $scope.grandTotalTable;
                                        },
                                        saleType: function(){
                                            
                                            return $scope.saleType;
                                        },
                                        buttonValidation: function(){
                                            
                                            return $scope.formBill.$invalid;
                                        },
                                        productHsn: function(){
                                            
                                            return vm.productHsn;
                                        },
                                        settingData: function() {
                                            return {
                                                color: $scope.enableDisableColor,
                                                size: $scope.enableDisableSize,
                                                frame: $scope.enableDisableFrameNo,
                                                variant: $scope.enableDisableVariant,
                                                productMeasurementType: $scope.productMeasurementType
                                            };
                                        },
                                        insertOrUpdate: function(){
                                            
                                            if($scope.quickBill.EditBillData){
                                                
                                                return 'update';
                                            }
                                            else{
                                                
                                                return 'insert';
                                            }
                                        }
                                    }
                                });
                                
                                Modalopened = true;
                                
                                modalInstance.opened.then(function() {
                                    toaster.clear();
                                });
                                
                                modalInstance.result.then(function (data) {
                                    
                                    // $scope.pop(data);
                                    Modalopened = false;
                                    
                                }, function () {
                                    Modalopened = false;
                                });
                            }
                            else{
                                toaster.pop('info', 'please Select Company', '');
                            }
                        }
                        
                        /** End **/
                        
                        /** Invoice **/
                        $scope.goInvoiceNumber = function() {
                            
                            toaster.clear();
                            if($scope.quickBill.searchInvoiceNumber == '' || angular.isUndefined($scope.quickBill.searchInvoiceNumber)){
                                toaster.pop('error', 'Search Box in Blank');
                                return false;
                            }
                            toaster.pop('wait', 'Please Wait', 'Searching...',600000);
                            
                            if($scope.saleType == 'SalesOrder' || $scope.saleType == 'WholesaleBill'){
                                
                                var BillPath = apiPath.getBill+$scope.quickBill.companyId.companyId;
                                var preHeaderData = {'Content-Type': undefined,'invoiceNumber':$scope.quickBill.searchInvoiceNumber};
                                if($scope.saleType == 'SalesOrder') {
                                    preHeaderData.isSalesOrder = 'ok';
                                }
                                preHeaderData.salesType = 'whole_sales';
                            }
                            else if($scope.saleType == 'QuotationPrint'){
                                
                                var BillPath = apiPath.postQuotationBill;
                                var preHeaderData = {'Content-Type': undefined,'quotationNumber':$scope.quickBill.searchInvoiceNumber};
                                //preHeaderData.salesType = 'QuotationPrint';
                            }
                            
                            apiCall.getCallHeader(BillPath,preHeaderData).then(function(response){
                                
                                toaster.clear();
                                if(angular.isArray(response)){
                                    
                                    if(response.length > 1){
                                        $scope.openBillHistoryModal('lg',response);
                                    }
                                    else{
                                        
                                        $scope.quickBill = [];
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
                        /** End **/
                        
                        
                        // Datepicker
                        // ----------------------------------- 
                        this.minStart = new Date();
                        
                        this.today = function() {
                            this.dt1 = new Date();
                        };
                        
                        if(!$scope.quickBill.EditBillData){
                            
                            this.today();
                        }
                        
                        this.clear = function () {
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
                            // console.log('Time changed to: ' + this.mytime);
                        };
                        
                        this.clear = function() {
                            //this.mytime = null;
                        };
                        
                        // Input mask
                        // ----------------------------------- 
                        
                        this.testoption = {
                            "mask": "99-9999999",
                            "oncomplete": function () {
                                // console.log();
                                // console.log(arguments,"oncomplete!this log form controler");
                            },
                            "onKeyValidation": function () {
                                // console.log("onKeyValidation event happend! this log form controler");
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
                            
                            /**
                            Product Redirect Edit Start
                            **/
                            $scope.editProductWithRedirect = function(index){
                                
                                getSetFactory.blank();
                                var  id = vm.AccBillTable[index].productId;
                                
                                productFactory.getSingleProduct(id).then(function(response){
                                    getSetFactory.set(response);
                                    $scope.openProduct('lg',index);
                                });
                            }
                            /**
                            Product Redirect Edit
                            **/
                            /**
                            Product Model Start
                            **/
                            $scope.openProduct = function (size,index,length = '') {
                                if (length != '') {
                                    var itemArray = vm.AccBillTable;
                                    index = itemArray.length;
                                    for (var i = 0; i < itemArray.length; i++) {
                                        if (itemArray[i].productName == '' 
                                        || itemArray[i].productName == null 
                                        || itemArray[i].productName == 'undefined') 
                                        {
                                            index = i;
                                            break;
                                        }
                                    }
                                }
                                if (Modalopened) return;
                                
                                toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                                
                                if($scope.quickBill.companyId){
                                    var modalInstance = $modal.open({
                                        templateUrl: 'app/views/PopupModal/Accounting/productModal.html',
                                        controller: 'AccProductModalController as form',
                                        size: size,
                                        resolve:{
                                            productIndex: function(){
                                                return index;
                                            },
                                            companyId: function(){
                                                
                                                return $scope.quickBill.companyId;
                                            }
                                        }
                                    });
                                    
                                    Modalopened = true;
                                    
                                    modalInstance.opened.then(function() {
                                        toaster.clear();
                                    });
                                    
                                    modalInstance.result.then(function (data) {
                                        
                                        toaster.clear();
                                        toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
                                        
                                        var companyID = data.companyId;
                                        var productIndex = data.index;
                                        
                                        if(data.hasOwnProperty('productId')){
                                            var productID = data.productId;
                                            
                                            productFactory.setUpdatedProduct(productID).then(function(response){
                                                if(angular.isObject(response)){
                                                    productFactory.getProductByCompany(companyID).then(function(responseCompayWise){
                                                        // console.log('3183....',responseCompayWise);
                                                        vm.productNameDrop = responseCompayWise;
                                                        filterProductData();
                                                        vm.AccBillTable[data.index].productName = response.productName;
                                                        $scope.setProductData(response,productIndex);
                                                        toaster.clear();
                                                    });
                                                }
                                                else{
                                                    toaster.pop('warning', response);
                                                }
                                            });
                                        }
                                        else{
                                            var productName = data.productName;
                                            var color = data.color;
                                            var size = data.size;
                                            var variant = data.variant != undefined ? data.variant : 'YY';
                                            
                                            productFactory.setNewProduct(companyID,productName,color,size,variant).then(function(response){
                                                if(angular.isObject(response))
                                                {
                                                    productFactory.getProductByCompany(companyID).then(function(responseCompayWise){
                                                        // console.log('3204....',responseCompayWise);
                                                        vm.productNameDrop = responseCompayWise;
                                                        filterProductData();
                                                        vm.AccBillTable[data.index].productName = response.productName;
                                                        $scope.setProductData(response,productIndex);
                                                        toaster.clear();
                                                    });
                                                }
                                                else{
                                                    toaster.pop('warning', response);
                                                }
                                            });
                                        }
                                        Modalopened = false;
                                        
                                    }, function () {
                                        Modalopened = false;
                                    });
                                }
                                else{
                                    alert('Please Select Company');
                                }
                            };
                            /**
                            Product Model End
                            **/
                            /** Barcode Modal Start **/
                            $scope.openBarcodeModal = function(size,index){
                                if (Modalopened) return;
                                toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                                var selectedProduct = vm.AccBillTable[index];
                                var modalInstance = $modal.open({
                                    templateUrl: 'app/views/PopupModal/Accounting/barcodeModal.html',
                                    controller: 'AccBarcodeModalController as form',
                                    size: size,
                                    resolve:{
                                        productIndex: function(){
                                            return index;
                                        },
                                        productData: function(){
                                            return selectedProduct;
                                        },
                                        companyId: function(){
                                            return $scope.quickBill.companyId;
                                        },
                                        transactionType: function(){
                                            return 'sales';
                                        }
                                    }
                                });
                                Modalopened = true;
                                
                                modalInstance.opened.then(function() {
                                    toaster.clear();
                                });
                                modalInstance.result.then(function (data) {
                                    vm.AccBillTable[index].itemizeDetail = data;
                                    $scope.changeProductArray = true;
                                    Modalopened = false;
                                },function(){
                                    Modalopened = false;
                                });
                            }
                            /**
                            Barcode Modal End
                            **/
                            /**
                            Client Model Start
                            **/
                            $scope.openClient = function (size,index) {
                                
                                if (Modalopened) return;
                                
                                toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                                
                                if($scope.quickBill.companyId){
                                    
                                    var modalInstance = $modal.open({
                                        templateUrl: 'app/views/PopupModal/Client/clientModal.html',
                                        controller: 'ClientModalController as form',
                                        size: size,
                                        resolve:{
                                            productIndex: function(){
                                                return index;
                                            }
                                        }
                                    });
                                    
                                    Modalopened = true;
                                    
                                    modalInstance.opened.then(function() {
                                        toaster.clear();
                                    });
                                    
                                    modalInstance.result.then(function (data) {
                                        
                                        Modalopened = false;
                                        
                                    }, function () {
                                        Modalopened = false;
                                    });
                                }
                                else{
                                    alert('Please Select Company');
                                }
                            };
                            /**
                            Product Model End
                            **/
                            
                            /**
                            Product Model Start
                            **/
                            $scope.openProductList = function (size,index = '') {
                                if (Modalopened) return;
                                
                                toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                                
                                if($scope.quickBill.companyId){
                                    
                                    var modalInstance = $modal.open({
                                        templateUrl: 'app/views/PopupModal/QuickMenu/productListModal.html',
                                        controller: 'AccProductListModalController as table',
                                        size: size,
                                        resolve:{
                                            companyId: function(){
                                                
                                                return $scope.quickBill.companyId;
                                            }
                                        }
                                    });
                                    
                                    Modalopened = true;
                                    
                                    modalInstance.opened.then(function() {
                                        toaster.clear();
                                    });
                                    
                                    modalInstance.result.then(function (data) {
                                        
                                        toaster.clear();
                                        // toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
                                        
                                        var dataLength = data.length;
                                        var productLength = vm.AccBillTable.length;
                                        
                                        if(dataLength!=0)
                                        {
                                            var arrayLength = productLength-1;
                                            for(var arrayData=0;arrayData<dataLength;arrayData++)
                                            {
                                                if(arrayData!=0)
                                                {
                                                    $scope.addRow(arrayLength);
                                                }
                                                if(vm.AccBillTable[arrayLength].productId!="" && vm.AccBillTable[arrayLength].productId!=null && vm.AccBillTable[arrayLength].productId!=0)
                                                {
                                                    //append blank array
                                                    $scope.addRow(arrayLength+1);
                                                    vm.AccBillTable[arrayLength+1].productName =  data[arrayData].productName;
                                                    $scope.setProductData(data[arrayData],arrayLength+1);
                                                }
                                                else
                                                {
                                                    vm.AccBillTable[arrayLength].productName =  data[arrayData].productName;
                                                    $scope.setProductData(data[arrayData],arrayLength);
                                                }
                                                arrayLength++;
                                            }
                                        }
                                        Modalopened = false;
                                        
                                    }, function () {	
                                        Modalopened = false;
                                    });
                                }
                                else{
                                    alert('Please Select Company');
                                }
                            };
                            /**
                            Product Model End
                            **/	
                            $scope.openScanPopup = function(imageUrl)
                            {	
                                $templateCache.remove('http://'+window.location.host+'/front-end/app/views/QuickMenu/DocumentScan/DWT_Upload_Download_Demo.html');
                                //$(".modal-body").html("");
                                
                                //console.log('http://'+window.location.host+'/front-end/app/views/QuickMenu/DocumentScan/DWT_Upload_Download_Demo.html');
                                
                                if (Modalopened) return;
                                
                                toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
                                
                                var modalInstance = $modal.open({
                                    templateUrl: 'app/views/QuickMenu/DocumentScan/DWT_Upload_Download_Demo.html?buster='+Math.random(),
                                    controller: documentScanController,
                                    size: 'flg',
                                    resolve:{
                                        imageUrl: function(){
                                            return imageUrl;
                                        }
                                    }
                                    // preserveScope: true
                                });
                                
                                Modalopened = true;
                                
                                modalInstance.opened.then(function() {
                                    toaster.clear();
                                });
                                
                                modalInstance.result.then(function (data) {
                                    
                                    if(data.length > 0){
                                        
                                        $scope.countScannedDocumet = data.length;
                                        
                                        var CountImg = data.length;
                                        var srNo = 0;
                                        
                                        for(var ImgIndex = 0;ImgIndex < CountImg;ImgIndex++){
                                            
                                            var noIndex = ImgIndex;
                                            
                                            // var convertToFile = $scope.scannedImageSaveToFormData;
                                            // $scope.scannedImageSaveToFormData(data[ImgIndex]);
                                            // convertToFile(data[noIndex], function(base64Img) {
                                            // console.log(base64Img);
                                            
                                            var ImgResponse = data[noIndex];
                                            
                                            formdata.set("scanFile["+srNo+"]",ImgResponse);
                                            srNo++;
                                            
                                            // });
                                            
                                        }
                                        toaster.pop('success',data.length+' Document Scanned','');
                                    }
                                    
                                    Modalopened = false;
                                    
                                }, function (data) {
                                    if(data == "clear"){
                                        $scope.clearScannedResult();
                                        toaster.pop('info','Documents Clear','');
                                        // DWObject.RemoveAllImages();
                                    }
                                    
                                    Modalopened = false; 
                                    // $scope.imageTwainImg = data;
                                    // console.log(length);	
                                });
                                
                            }		
                            
                            $scope.focusbarcode = function()
                            {
                                //$("canvas").WebCodeCamJQuery(arg).data().plugin_WebCodeCamJQuery.stop();
                                //console.log('done');
                                // console.log(arg.resultFunction());
                            }
                            
                            $scope.SetBarcodData = function(Bcode)
                            {			
                                //console.log('Code 128');
                                //var proBarcode = result.code;
                                var proBarcode = Bcode;
                                
                                //Api
                                var headerSearch = {'Content-Type': undefined,'productCode':proBarcode};
                                
                                apiCall.getCallHeader(apiPath.getAllProduct,headerSearch).then(function(response) {
                                    
                                    var companyId = $scope.quickBill.companyId.companyId;
                                    
                                    /** Inner Loop **/
                                    /** Check Product is Already in Array or not **/
                                    var checkFlag = 0;
                                    var cnt = vm.AccBillTable.length;
                                    for(var m=0;m<cnt;m++){
                                        
                                        var arrayData = vm.AccBillTable[m];
                                        
                                        if(companyId == response.company.companyId){
                                            
                                            if(arrayData.productId == response.productId){
                                                toaster.clear();
                                                toaster.pop('info', 'Product Already Selected', '');
                                                
                                                checkFlag = 1;
                                                //console.log(arrayData);
                                                break;
                                            }
                                        }
                                        else{
                                            
                                            toaster.clear();
                                            toaster.pop('info', 'Product has Diffrent Company', '');
                                            checkFlag = 1;
                                            break;
                                        }
                                        
                                    }
                                    /** End Check Product **/
                                    if(checkFlag == 0) {
                                        
                                        var barcodeflag = 0;
                                        var checkCnt = vm.AccBillTable.length;
                                        for(var cVar=0;cVar<checkCnt;cVar++){
                                            
                                            var arrayData = vm.AccBillTable[cVar];
                                            
                                            if(arrayData.productId == "") {
                                                
                                                vm.AccBillTable[cVar].productName = response.productName;
                                                //vm.AccBillTable[data.index].productId = response.productId;
                                                
                                                $scope.setProductData(response,cVar);
                                                toaster.clear();
                                                toaster.pop('success', 'Barcode Scanned', '');
                                                
                                                barcodeflag = 1;
                                                //console.log(arrayData);
                                                break;
                                            }
                                        }
                                        
                                        var nextindex = parseInt(cnt)-1;
                                        if(barcodeflag == 0){
                                            
                                            $scope.addRow(nextindex);
                                            
                                            var fatIndex = nextindex+1;
                                            
                                            vm.AccBillTable[fatIndex].productName = response.productName;
                                            //vm.AccBillTable[data.index].productId = response.productId;
                                            
                                            $scope.setProductData(response,fatIndex);
                                            //$scope.$digest();
                                            toaster.clear();
                                            toaster.pop('success', 'Barcode Scanned', '');	
                                            $scope.$digest();
                                        }
                                    }
                                    /** End loop **/
                                });
                                //End Api
                            }
                            
                            $scope.presssuburb = function(event){
                                
                                if(event.target.value.length == 14){
                                    
                                    //console.log(event.target.value.length);
                                    $scope.SetBarcodData(event.target.value);
                                }
                            }
                            
                            $('#myTwain').hide();
                            var DWObject;
                            // Dynamsoft.WebTwainEnv.Load();
                            
                            $scope.DWT_AcquireImage= function()
                            {
                                // $.getScript('//asprise.azureedge.net/scannerjs/scanner.js');
                                
                                scanner.scan(displayImagesOnPage,
                                    {
                                        "use_asprise_dialog": false, // Whether to use Asprise Scanning Dialog
                                        "show_scanner_ui": false,
                                        "output_settings": [
                                            {
                                                "type": "return-base64",
                                                "format": "jpg",
                                                "jpeg_quality": "70"
                                            }
                                        ]
                                    }
                                    );
                                }
                                
                                
                                /** Processes the scan result */
                                function displayImagesOnPage(successful, mesg, response) {
                                    if(!successful) { // On error
                                        console.error('Failed: ' + mesg);
                                        return;
                                    }
                                    
                                    if(successful && mesg != null && mesg.toLowerCase().indexOf('user cancel') >= 0) { // User cancelled.
                                        console.info('User cancelled');
                                        return;
                                    }
                                    
                                    var scannedImages = scanner.getScannedImages(response, true, false); // returns an array of ScannedImage
                                    for(var i = 0; (scannedImages instanceof Array) && i < scannedImages.length; i++) {
                                        var scannedImage = scannedImages[i];
                                        processScannedImage(scannedImage);
                                    }
                                }
                                
                                /** Images scanned so far. */
                                var imagesScanned = [];
                                
                                /** Processes a ScannedImage */
                                function processScannedImage(scannedImage) 
                                {
                                    // $scope.countScannedDocumet = 1;
                                    // formdata.set("scanFile[0]",scannedImage.src);
                                    var blob = base64ImageToBlob(scannedImage.src);
                                    $scope.openScanPopup(blob);
                                }
                                
                                function base64ImageToBlob(str) {
                                    // extract content type and base64 payload from original string
                                    var pos = str.indexOf(';base64,');
                                    var type = str.substring(5, pos);
                                    var b64 = str.substr(pos + 8);
                                    
                                    // decode base64
                                    var imageContent = atob(b64);
                                    
                                    // create an ArrayBuffer and a view (as unsigned 8-bit)
                                    var buffer = new ArrayBuffer(imageContent.length);
                                    var view = new Uint8Array(buffer);
                                    
                                    // fill the view, using the decoded base64
                                    for(var n = 0; n < imageContent.length; n++) {
                                        view[n] = imageContent.charCodeAt(n);
                                    }
                                    
                                    // convert ArrayBuffer to Blob
                                    var blob = new Blob([buffer], { type: type });
                                    
                                    return blob;
                                }
                                
                                /**
                                History Modal 
                                **/
                                
                                $scope.openBillHistoryModal = function (size,responseData,draftOrSalesOrder) {
                                    
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
                                                return draftOrSalesOrder;
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
                                        if (draftOrSalesOrder == 'SalesOrder'){
                                            $scope.EditAddBill('','SalesOrder');
                                        } else if (draftOrSalesOrder == 'draft') {
                                            $scope.EditAddBill('copy','draft');
                                        } else {
                                            $scope.EditAddBill();
                                        }
                                        //draftOrSalesOrder == undefined || draftOrSalesOrder == 'SalesOrder' ? $scope.EditAddBill('','SalesOrder') : $scope.EditAddBill('copy','draft');
                                        $anchorScroll();
                                    }, function () {
                                        toaster.clear();
                                        Modalopened = false;
                                    });
                                };
                                
                                /**
                                End History Modal 
                                **/
                                
                                /** Docuemnt Delete **/
                                $scope.openInNextTab = function(url){
                                    $window.open(url,'_blank');
                                }
                                
                                $scope.documentDelete = function(item){
                                    item.ShowConfirm == true ? item.ShowConfirm = false : item.ShowConfirm = true;
                                }
                                
                                $scope.documentDeleteConfirm = function(item,index){
                                    
                                    var documentID = item.documentId;
                                    
                                    if(documentID == '' || documentID == null || documentID == undefined)
                                    {
                                        toaster.pop('error','Document Not Found');
                                        return false;
                                    }
                                    
                                    var headerData = {'Content-Type': undefined,'type':'sale-bill'};
                                    
                                    apiCall.deleteCallHeader(apiPath.documentDelete+documentID,headerData).then(function(response){
                                        if(response == apiResponse.ok){
                                            toaster.pop('success','Document Successfully Deleted');
                                            $scope.quickBill.documentData.splice(index,1);
                                            if(!angular.equals(vm.clientEditData,{}))
                                            {
                                                if(vm.clientEditData.contactNo){
                                                    clientFactory.getSetNewClientByContact(vm.clientEditData.contactNo,false).then(function(response){
                                                        vm.clientEditData = response[0];
                                                    });
                                                }
                                            }
                                        }
                                        else{
                                            toaster.pop('warning',response);
                                        }
                                    });
                                }
                                /** End **/
                                
                                /** Resend Email **/
                                vm.resendEmail = function(){
                                    
                                    if($scope.quickBill.EditBillData)
                                    {
                                        var emailFormData = new FormData();
                                        emailFormData.set('companyId',$scope.quickBill.EditBillData.company.companyId);
                                        // apiCall.postCall(apiPath.getAllClient+'/'+$scope.quickBill.EditBillData.client.clientId).then(function(reponsoe){
                                        if($scope.saleType == 'QuotationPrint')
                                        {
                                            var quotationId = $scope.quickBill.EditBillData.quotationBillId;
                                            var headerData = {'Content-Type': undefined,'quotationBillId':quotationId};
                                        }
                                        else
                                        {
                                            var salesId = $scope.quickBill.EditBillData.saleId;
                                            var headerData = {'Content-Type': undefined,'saleId':salesId};
                                        }
                                        
                                        apiCall.postCallHeader(apiPath.sendEmail,headerData,emailFormData).then(function(response){
                                            if(response == apiResponse.ok){
                                                toaster.pop('success','Email Send Successfully');
                                                emailFormData.delete('companyId');
                                            }
                                            else{
                                                toaster.pop('warning',response);
                                            }
                                        });
                                        // });
                                    }	
                                }
                                /** End **/
                                
                                function convertDate(cDate){
                                    var  date = new Date(cDate);
                                    var convertedDate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
                                    return convertedDate;
                                }
                                $scope.itemizeTreeIcon = function(index){
                                    if (index == $scope.openedItemizeTree) {
                                        return 'fa-minus-circle';
                                    }else{
                                        return 'fa-plus-circle';
                                    }
                                }
                                $scope.openedItemizeTreeClass = function(index){
                                    if (index == $scope.openedItemizeTree) {
                                        return '';
                                    }else{
                                        return 'hidden';
                                    }
                                }
                                $scope.expandItemizeTree = function(index){
                                    if (index == $scope.openedItemizeTree) {
                                        $scope.openedItemizeTree = 0;
                                    }else{
                                        $scope.openedItemizeTree = index;
                                    }
                                }
                                /** Get Set Draft **/
                                vm.setInDraft = function()
                                {
                                    
                                    if($scope.quickBill.clientId == null){
                                        toaster.pop('info','Please Select Client');
                                        return false;
                                    }
                                    
                                    if(vm.AccBillTable.length == 1 && vm.AccBillTable[0].productId==''){
                                        toaster.pop('info','Enter at least 1 Product');
                                        return false;
                                    }
                                    
                                    //Intialize Formdata
                                    var draftForm = undefined;
                                    draftForm = new FormData();
                                    
                                    if(vm.dt1 != undefined){
                                        draftForm.set('entryDate',convertDate(vm.dt1));
                                    }
                                    if(vm.serviceDate != undefined){
                                        draftForm.set('serviceDate',convertDate(vm.serviceDate));
                                    }
                                    
                                    //Set data to FormData object
                                    var  getFormData = $scope.quickBill;
                                    for (var key in getFormData){
                                        var singleData = getFormData[key];
                                        if(angular.isObject(singleData)){
                                            if(singleData.hasOwnProperty(key)){
                                                draftForm.set(key,singleData[key]);
                                            }
                                        }
                                        else if(angular.isString(singleData) && singleData!=''){
                                            draftForm.set(key,singleData);
                                        }
                                        else if(angular.isNumber(singleData)){
                                            draftForm.set(key,singleData);
                                        }
                                    }
                                    
                                    //Inventory
                                    var productJson = angular.copy(vm.AccBillTable);
                                    
                                    for(var jsonIndex=0;jsonIndex<productJson.length;jsonIndex++){
                                        var breakForeach = true;
                                        angular.forEach(productJson[jsonIndex], function (value,key) {
                                            if(breakForeach){
                                                if(key == 'productId' && value=='') {
                                                    breakForeach = false;
                                                }
                                                if(breakForeach)
                                                {
                                                    if(value == undefined){
                                                        value = 0;
                                                    }
                                                    if(key == 'measurementUnit'){
                                                        if(angular.isObject(value)){
                                                            value = value.measurementUnitId;
                                                        }
                                                    }
                                                    draftForm.set('inventory['+jsonIndex+']['+key+']',value);
                                                }
                                            }
                                        });
                                    }
                                    
                                    //Expense
                                    var expenseJson = angular.copy(vm.AccExpense);
                                    
                                    for(var jsonIndex=0;jsonIndex<expenseJson.length;jsonIndex++){
                                        var breakForeach = true;
                                        
                                        angular.forEach(expenseJson[jsonIndex], function (value,key) {
                                            if(breakForeach){
                                                if(key == 'expenseId' && value==''){
                                                    breakForeach = false;
                                                }
                                                if(breakForeach){
                                                    if(value == undefined){
                                                        value = 0;
                                                    }
                                                    draftForm.set('expense['+jsonIndex+']['+key+']',value);
                                                }
                                            }
                                        });
                                    }
                                    var headerDraftData = {};
                                    if(formdata.has('isDraft')){
                                        console.log("innn",formdata.get('isDraft'));
                                        headerDraftData.saleId = formdata.get('isDraft');
                                        formdata.delete('isDraft');
                                    }
                                    draftForm.delete('totalCgstAmount');
                                    draftForm.delete('totalSgstAmount');
                                    draftForm.delete('totalIgstAmount');
                                    apiCall.postCallHeader(apiPath.getSetDraft,headerDraftData,draftForm).then(function(response){
                                        if(apiResponse.ok == response){
                                            toaster.pop('success','Save in Draft Successfully');
                                            $scope.cancel();
                                        }
                                        else{
                                            toaster.pop('warning',response);
                                        }
                                    });
                                    
                                }
                                
                                vm.getFromDraft = function(){
                                    apiCall.getCall(apiPath.getSetDraft+'/'+$scope.quickBill.companyId.companyId).then(function(response){
                                        if(angular.isArray(response)){
                                            $scope.openBillHistoryModal('lg',response,'draft');
                                        }
                                        else{
                                            if(apiResponse.noContent == response){
                                                toaster.pop('info','No Data in Draft');
                                            }
                                            else{
                                                toaster.pop('warning','No Response From Server');
                                            }
                                        }
                                    });
                                }
                                /** End **/
                                
                                /** Sales Order **/
                                vm.getFromSalesOrder = function(){
                                    var header = {};
                                    header.companyId = $scope.quickBill.companyId.companyId;
                                    header.isSalesOrder = 'ok';
                                    apiCall.getCallHeader(apiPath.postBill,header).then(function(response){
                                        if(angular.isArray(response)){
                                            $scope.openBillHistoryModal('lg',response,'SalesOrder');
                                        }
                                        else{
                                            if(apiResponse.noContent == response){
                                                toaster.pop('info','No Data in Draft');
                                            }
                                            else{
                                                toaster.pop('warning','No Response From Server');
                                            }
                                        }
                                    });
                                }
                                /** END **/
                                $scope.goBack = function()
                                {
                                    $window.history.back();
                                }
                                
                                $scope.getCurrentFinancialYear = function() 
                                {
                                    var fiscalyear = "";
                                    var today = new Date();
                                    if ((today.getMonth() + 1) <= 3) {
                                        fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
                                    } else {
                                        fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
                                    }
                                    return fiscalyear
                                }
                                
                                $scope.thermalPrint = function()
                                {
                                    var thermalTemplate = [];
                                    var id = $scope.quickBill.companyId.companyId;
                                    apiCall.getCall(apiPath.getAllTemplate+'/company/'+id).then(function(responseTemp){
                                        
                                        thermalTemplate = responseTemp.filter(function(er){
                                            if (er.templateType == "thermal_invoice") {
                                                return er;
                                            }
                                        });
                                        if (thermalTemplate.length <= 0) {
                                            toaster.pop('warning','Thermal Template is not Available.');
                                            return false;
                                        }
                                        var billArrayTag = {};
                                        var itemTable = '';
                                        angular.forEach($scope.form.AccBillTable, function(value,key){
                                            itemTable += value.productName+`</td>
                                            <td style="font-size: 1.1em;line-height: 1.2em;">`+value.qty+`</td>
                                            <td style="font-size: 1.1em;line-height: 1.2em;">`+value.price+`</td>
                                            <td style="font-size: 1.1em;line-height: 1.2em;text-align: center;">`+value.amount+`</td>
                                            `;
                                            if (key < $scope.form.AccBillTable.length - 1) {
                                                itemTable += `</tr><tr style="border-bottom: 1px solid #000;"><td style="font-size: 1.1em;line-height: 1.2em;">`;
                                            }
                                        });
                                        
                                        billArrayTag.CMPLOGO = $scope.quickBill.companyId.companyLogo;
                                        billArrayTag.Company = $scope.quickBill.companyId.companyName;
                                        billArrayTag.CompanyWebsite = $scope.quickBill.companyId.websiteName == undefined || $scope.quickBill.companyId.websiteName == '' ? '' : $scope.quickBill.companyId.websiteName;
                                        billArrayTag.CompanyContact = $scope.quickBill.companyId.customerCare == undefined || $scope.quickBill.companyId.customerCare == '' ? '' : $scope.quickBill.companyId.customerCare;
                                        billArrayTag.CompanyEmail = $scope.quickBill.companyId.emailId == 'undefined' || $scope.quickBill.companyId.emailId == '' ? '' : $scope.quickBill.companyId.emailId;
                                        billArrayTag.CompanyAdd = $scope.quickBill.companyId.address1 == 'undefined' ? '' : $scope.quickBill.companyId.address1 +' '+ ($scope.quickBill.companyId.address2 == 'undefined' ? '' : ', '+$scope.quickBill.companyId.address2);
                                        billArrayTag.CreditCashMemo = "CASH";
                                        
                                        billArrayTag.BILLLABEL = 'Tax Invoice';
                                        
                                        billArrayTag.ClientName = $scope.quickBill.clientName;
                                        billArrayTag.INVID = $scope.quickBill.invoiceNumber;
                                        billArrayTag.ChallanNo = " ";
                                        billArrayTag.ChallanDate = " ";
                                        billArrayTag.CLIENTADD = $scope.quickBill.address1 == '' || $scope.quickBill.address1 == undefined ? '' : $scope.quickBill.address1;
                                        billArrayTag.OrderDate =$filter('date')($scope.form.dt1, 'dd-MM-yyyy');
                                        
                                        billArrayTag.Mobile = $scope.quickBill.contactNo;
                                        
                                        billArrayTag.ExtraCharge = $filter('number')($scope.quickBill.extraCharge,$scope.noOfDecimalPoints);
                                        billArrayTag.Total = $filter('number')($scope.total_without_expense,$scope.noOfDecimalPoints);
                                        billArrayTag.TotalRoundableAmount = $filter('number')($scope.total_without_expense,$scope.noOfDecimalPoints);
                                        
                                        billArrayTag.RoundTotal = $filter('number')(Math.round($scope.total_without_expense),$scope.noOfDecimalPoints);
                                        billArrayTag.RoundFigure =  $filter('number')(Math.round($scope.total_without_expense) - $scope.total_without_expense,$scope.noOfDecimalPoints);
                                        
                                        billArrayTag.TotalTax = $scope.quickBill.tax;
                                        
                                        billArrayTag.serviceDate = $scope.quickBill.hasOwnProperty('serviceDate') ? $scope.quickBill.serviceDate : '';
                                        billArrayTag.TotalDiscount = $scope.quickBill.totalDiscount != undefined ? $filter('number')($scope.quickBill.totalDiscount,$scope.noOfDecimalPoints) : 0;
                                        var TotalOverallGSTAmount = $scope.quickBill.totalCgstAmount + $scope.quickBill.totalSgstAmount + $scope.quickBill.totalIgstAmount;
                                        billArrayTag.TotalOverallGSTAmount = $filter('number')(TotalOverallGSTAmount,$scope.noOfDecimalPoints);
                                        billArrayTag.TotalQty = $scope.getTotalQuantity();
                                        billArrayTag.REMAINAMT = $scope.quickBill.balance;
                                        billArrayTag.REMARK = angular.isUndefined($scope.quickBill.remark) ? '': $scope.quickBill.remark;
                                        billArrayTag.Description = itemTable;
                                        billArrayTag.TotalTaxableAmt = $filter('number')($scope.quickBill.tax,$scope.noOfDecimalPoints);
                                        billArrayTag.TotalCgst = $scope.quickBill.totalCgst;
                                        billArrayTag.TotalCgstAmt = $filter('number')($scope.quickBill.totalCgstAmount,$scope.noOfDecimalPoints);
                                        billArrayTag.TotalSgst = $scope.quickBill.totalSgst;
                                        billArrayTag.TotalSgstAmt = $filter('number')($scope.quickBill.totalSgstAmount,$scope.noOfDecimalPoints);
                                        billArrayTag.TotalIgst = $scope.quickBill.totalIgst;
                                        billArrayTag.TotalIgstAmt = $filter('number')($scope.quickBill.totalIgstAmount,$scope.noOfDecimalPoints);
                                        billArrayTag.ExpireDate = $scope.quickBill.Lastdate;
                                        billArrayTag.CompanySGST = $scope.quickBill.companyId.sgst;
                                        billArrayTag.CompanyCGST = $scope.quickBill.companyId.cgst;
                                        billArrayTag.CLIENTTINNO = $scope.quickBill.gst ? $scope.quickBill.gst : '-';
                                        billArrayTag.PONO = $scope.quickBill.poNumber == '' || $scope.quickBill.poNumber == undefined ? '': $scope.quickBill.poNumber;
                                        var tempData = thermalTemplate[0].templateBody;
                                        var mywindow = window.open('', 'PRINT');
                                        var is_chrome = Boolean(mywindow.chrome);
                                        angular.forEach(billArrayTag,function(value,key){
                                            tempData = tempData.replace("["+key+"]",value,"g");
                                        });
                                        mywindow.document.write('<html><head><title>' + document.title  + '</title>');
                                        mywindow.document.write("</head><body>");
                                        mywindow.document.write(tempData);
                                        mywindow.document.write('</body></html>');
                                        if (is_chrome) {
                                            setTimeout(function () { // wait until all resources loaded 
                                                mywindow.focus(); // necessary for IE >= 10
                                                mywindow.print();  // change window to mywindow
                                                mywindow.close();// change window to mywindow
                                            }, 2000);
                                        }
                                        else {
                                            mywindow.document.close(); // necessary for IE >= 10
                                            mywindow.focus(); // necessary for IE >= 10
                                            mywindow.print();
                                            mywindow.close();
                                        }
                                        return true;
                                    });
                                }
                                
                                function onGoogleInit() {
                                    // Load the Google Transliteration API
                                    google.load("elements", "1", {
                                        packages: "transliteration",
                                        callback: onLoad 
                                        // "nocss" : true
                                    });
                                }
                                
                                
                                function onLoad() {
                                    var options = {
                                        sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
                                        destinationLanguage: google.elements.transliteration.LanguageCode.HINDI,
                                        // shortcutKey: 'ctrl+m',
                                        transliterationEnabled: true
                                    };
                                    // Create an instance on TransliterationControl with the required options.
                                    var control = new google.elements.transliteration.TransliterationControl(options);
                                    // Enable transliteration in the textfields with the given ids.
                                    // var ids = ["productNameId"];
                                    var classes = document.getElementsByClassName('productNameClass');
                                    control.makeTransliteratable(classes);
                                    
                                    // Show the transliteration control which can be used to toggle between English and Hindi and also choose other destination language.
                                    // control.showControl('translControl');
                                }
                                
                                // setTimeout(function() {
                                // 	google.setOnLoadCallback(onLoad);
                                // 	onLoad();
                                // }, 5000);
                            }
                            RetailsaleBillController.$inject = ["$rootScope","$scope","apiCall","apiPath","$http","$window","$modal","validationMessage","saleType","productArrayFactory","getSetFactory","toaster","apiResponse","$anchorScroll","maxImageSize","$sce","$templateCache","getLatestNumber","productFactory","stateCityFactory","$filter","$state","clientFactory","fetchArrayService","bankFactory"];