



App.controller('CrmJobcardController', CrmJobcardController);

function CrmJobcardController($rootScope,$scope,apiCall,apiPath,$http,$window,$modal,$log,validationMessage,productArrayFactory,getSetFactory,toaster,apiResponse,$anchorScroll,$location,$sce,$templateCache,getLatestNumber,stateCityFactory,productFactory,$filter) {
    'use strict';
    
    var vm = this;
    
    
    $scope.erpPath = $rootScope.erpPath; //Erp Path
    var dateFormats = $rootScope.dateFormats; //Date Format
    
    /** Api path **/
    
    var JobcardGetApiPath = apiPath.getLatestJobcardNumber; // JobcardNumber
    var JobcardPostApiPath = apiPath.PostJobcard; // Jobcard Insertion Path
    
    var invoiceLatestApiPath = apiPath.getLatestInvoice1; // Latest Invoice#
    
    /** End **/
    $scope.quickBill = [];
    
    vm.disableCompany = false;
    var Modalopened = false;
    
    //$scope.saleType = saleType;
    
    vm.AccBillTable = [];
    vm.productTax = [];
    
    $scope.noOfDecimalPoints; // decimalPoints For Price,Tax Etc.....
    
    $scope.productArrayFactory = productArrayFactory;
    
    $scope.changeProductArray = false; // Change When Update in Product Table Array
    $scope.changeProductAdvancePrice = false;  // Change Advance Price of Product
    
    $scope.quickBill.tax = 0; //Tax
    
    $scope.totalTable;
    $scope.grandTotalTable;
    $scope.balanceTable;
    
    //Invoice Number 
    $scope.quickBill.jobcardNumber;
    $scope.quickBill.invoiceEndAt;
    $scope.quickBill.invoiceId;   
    
    /* VALIDATION */
    
    $scope.errorMessage = validationMessage; //Error Messages In Constant
    
    /* VALIDATION END */
    vm.paymentModeDrop =['cash','bank','card'];
    
    vm.serviceTypeDrop =['paid','free'];
    
    $scope.quickBill.paymentMode = 'cash';
    
    $scope.quickBill.serviceType = 'paid';
    
    $scope.getInvoiceAndJobcardNumber = function(id){
        
        var getLatest = JobcardGetApiPath+id+apiPath.getLatestInvoice2;
        
        //Get Jobcard#
        apiCall.getCall(getLatest).then(function(response4){
            
            $scope.quickBill.jobcardNumber = getLatestNumber.getJobcard(response4);
            
        });
        
        var getLatestInvoice = invoiceLatestApiPath+id+apiPath.getLatestInvoice2;
        //Get Invoice#
        apiCall.getCall(getLatestInvoice).then(function(response4){
            
            $scope.quickBill.invoiceNumber = getLatestNumber.getInvoice(response4);
        });
        
        
    }
    
    //Default Company Function
    $scope.defaultComapny = function(){
        
        vm.loadData = true;
        
        //Set default Company
        apiCall.getDefaultCompany().then(function(response2){
            
            $scope.quickBill.companyDropDown = response2;
            
            //console.log('default');
            
            $scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
            
            toaster.clear();
            toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
            
            var id = response2.companyId;
            
            
            
            //Auto Suggest Product Dropdown data
            vm.productNameDrop = [];
            
            //apiCall.getCall(apiPath.getProductByCompany+id+'/branch').then(function(responseDrop){
            productFactory.getProductByCompany(id).then(function(responseDrop){
                
                $scope.getInvoiceAndJobcardNumber(id); // Invoice# and Jobcard#
                //console.log(responseDrop);
                vm.productNameDrop = responseDrop;
                toaster.clear();
                vm.loadData = false;
            });
            
        });
    }
    
    $scope.ReloadAfterSave = function(response2){
        
        $scope.quickBill.companyDropDown = response2;
        
        
        //console.log('default');
        
        $scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
        
        toaster.clear();
        //toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
        
        var id = response2.companyId;
        
        $scope.getInvoiceAndJobcardNumber(id); // Invoice# and Jobcard#
        
    }
    //Auto Suggest Client Contact Dropdown data
    $scope.clientGetAllFunction = function(){
        
        vm.clientSuggest = [];
        
        apiCall.getCall(apiPath.getAllClient).then(function(responseDrop){
            
            vm.clientSuggest = responseDrop;
            
            
        });
        
    }
    
    $scope.clientGetAllFunction();
    
    
    // vm.statesDrop=[];
    // apiCall.getCall(apiPath.getAllState).then(function(response3){
    
    // vm.statesDrop = response3;
    
    // });
    
    
    $scope.getInitStateCity = function(){
        
        vm.statesDrop=[];
        vm.cityDrop = [];
        
        stateCityFactory.getState().then(function(response){
            toaster.clear();
            vm.statesDrop = response;
            $scope.quickBill.stateAbb = stateCityFactory.getDefaultState($rootScope.defaultState);
            
            vm.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
            $scope.quickBill.cityId = stateCityFactory.getDefaultCity($rootScope.defaultCity);
            
        });
    }
    
    //$scope.getInitStateCity();
    
    
    //get Bank
    vm.bankDrop=[];
    apiCall.getCall(apiPath.getAllBank).then(function(response2){
        //console.log(response2);
        for(var p=0;p<response2.length;p++){
            
            vm.bankDrop.push(response2[p].bankName);
        }
        
        
    });
    
    
    /* Table */
    
    $scope.addRow = function(index){
        
        //console.log('Row Added..'+index);
        
        var plusOne = index+1;
        
        var data = {};	
        data.productId = '';
        data.productName ='';
        data.color ='';
        data.frameNo ='';
        data.productInformation ='';
        data.discountType ='flat';
        data.discount ='';
        data.price = 0;
        data.qty =1;
        data.amount = '';
        data.size = '';
        //vm.AccBillTable.push(data);
        vm.AccBillTable.splice(plusOne,0,data);
        
        var varTax = {};
        varTax.tax = 0;
        varTax.additionalTax = 0;
        
        vm.productTax.splice(plusOne, 0, varTax);
        
        $scope.changeProductArray = true;
        
    };
    
    $scope.setProductData = function(item,index)
    {
        
        //console.log(item);
        // console.log(index);
        vm.AccBillTable[index].productId = item.productId;
        
        var grandPrice;
        var tax;
        
        if($scope.saleType == 'WholesaleBill'){
            
            
            grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
            //tax = productArrayFactory.calculateTax(item.purchasePrice,0,item.margin);
            vm.productTax[index].tax = item.vat;
            //vm.productTax[index].margin = item.wholesaleMargin;
        }
        else{
            
            grandPrice = productArrayFactory.calculate(item.purchasePrice,0,item.margin) + parseFloat(item.marginFlat);
            
            //tax = productArrayFactory.calculateTax(item.purchasePrice,item.vat,item.margin);
            
            vm.productTax[index].tax = item.vat;
            //vm.productTax[index].margin = item.margin;
            
            if(item.purchasePrice == 0 || grandPrice == 0){
                
                grandPrice = productArrayFactory.calculate(item.mrp,0,item.margin)  + parseFloat(item.marginFlat);
            }
        }
        
        vm.productTax[index].additionalTax = parseFloat(item.additionalTax); // Additional Tax
        
        vm.AccBillTable[index].price = grandPrice;
        
        /** Color/Size **/
        vm.AccBillTable[index].color = item.color;
        vm.AccBillTable[index].size = item.size;
        /** End **/
        //vm.productTax[index].tax = tax; //Product Tax
        
        //console.log(vm.AccBillTable);
        
        $scope.changeProductArray = true;
    }
    
    $scope.removeRow = function (idx) {
        vm.AccBillTable.splice(idx,1);
        vm.productTax.splice(idx, 1);
        
        $scope.changeProductArray = true;
    };
    
    // End Table 
    
    
    /** Check Update Or Insert Bill **/
    
    $scope.EditAddBill = function(){
        
        //if(Object.keys(getSetFactory.get()).length){
        if(Object.keys(getSetFactory.get()).length > 0){
            
            $scope.quickBill.EditBillData = getSetFactory.get();
            
            console.log($scope.quickBill.EditBillData);
            getSetFactory.blank();
            
            vm.disableCompany = false;
            //get Company
            vm.companyDrop=[];
            apiCall.getCall(apiPath.getAllCompany).then(function(response2){
                //console.log(response2);
                
                vm.companyDrop = response2;
                $scope.quickBill.companyDropDown =  $scope.quickBill.EditBillData.company;		//Company
                
                vm.disableCompany = true;
            });
            
            
            //var demo = angular.fromJson(jsonProduct);
            
            //console.log(jsonProduct.inventory);
            //console.log($scope.quickBill.EditBillData);
            //$scope.quickBill.documentData = $scope.quickBill.EditBillData.file;
            
            
            /** Company Wise Product **/
            
            //Auto Suggest Product Dropdown data
            vm.productNameDrop = [];
            
            //apiCall.getCall(apiPath.getProductByCompany+$scope.quickBill.EditBillData.company.companyId+'/branch').then(function(responseDrop){
            productFactory.getProductByCompany($scope.quickBill.EditBillData.company.companyId).then(function(responseDrop){
                
                vm.productNameDrop = responseDrop;
                
            });
            
            /** End **/
            
            //console.log($scope.quickBill.documentData);
            
            $scope.quickBill.jobcardNumber = $scope.quickBill.EditBillData.jobCardNo;  //Invoice Number
            
            var getLatestInvoice = invoiceLatestApiPath+$scope.quickBill.EditBillData.company.companyId+apiPath.getLatestInvoice2;
            //Get Invoice#
            apiCall.getCall(getLatestInvoice).then(function(response4){
                
                $scope.quickBill.invoiceNumber = getLatestNumber.getInvoice(response4);
            });
            
            
            $scope.noOfDecimalPoints = parseInt($scope.quickBill.EditBillData.company.noOfDecimalPoints);//decimal points
            
            //Set Date
            var getResdate =  $scope.quickBill.EditBillData.entryDate;
            var splitedate = getResdate.split("-").reverse().join("-");
            vm.dt1 = new Date(splitedate);
            
            //Set Delivery Date
            var getResdate2 =  $scope.quickBill.EditBillData.deliveryDate;
            var splitedate2 = getResdate2.split("-").reverse().join("-");
            vm.dt2 = new Date(splitedate2);
            
            $scope.quickBill.BillContact = $scope.quickBill.EditBillData.contactNo;
            
            $scope.quickBill.clientName = $scope.quickBill.EditBillData.clientName;
            $scope.quickBill.emailId = $scope.quickBill.EditBillData.emailId;
            $scope.quickBill.fisrtAddress = $scope.quickBill.EditBillData.address;
            
            $scope.quickBill.advance = $scope.quickBill.EditBillData.advance; //Advance
            
            /** Set State & City **/
            /** Set State & City **/
            //State DropDown Selection
            vm.statesDrop=[];
            vm.cityDrop=[];
            stateCityFactory.getState().then(function(response){
                
                vm.statesDrop = response;
                $scope.quickBill.stateAbb =  $scope.quickBill.EditBillData.state;
                vm.cityDrop = stateCityFactory.getDefaultStateCities($scope.quickBill.EditBillData.state.stateAbb);
                $scope.quickBill.cityId = $scope.quickBill.EditBillData.city;
            });
            
            
            /** End  **/
            
            $scope.quickBill.paymentMode = $scope.quickBill.EditBillData.paymentMode;
            if($scope.quickBill.paymentMode == 'bank'){
                
                $scope.quickBill.chequeNo = $scope.quickBill.EditBillData.checkNumber;
                $scope.quickBill.BankName = $scope.quickBill.EditBillData.bankName;
            }
            
            $scope.quickBill.serviceType = $scope.quickBill.EditBillData.serviceType;
            //console.log('If');
            var jsonProduct = angular.fromJson($scope.quickBill.EditBillData.productArray);
            vm.AccBillTable = jsonProduct;
            
            
            //console.log(vm.AccBillTable);
            var EditProducArray = jsonProduct;
            var count = EditProducArray.length;
            for(var w=0;w<count;w++){
                
                var d = 0;
                var setData = EditProducArray[w];
                
                var taxObject = {};
                taxObject.tax = 0;
                taxObject.additionalTax = 0;
                
                vm.productTax.push(taxObject);
                
                //apiCall.getCall(apiPath.getAllProduct+'/'+setData.productId).then(function(resData){
                productFactory.getSingleProduct(setData.productId).then(function(resData){
                    
                    /** Tax **/
                    //console.log(resData);
                    vm.AccBillTable[d].productName = resData.productName;
                    vm.AccBillTable[d].color = resData.color;
                    vm.AccBillTable[d].size = resData.size;
                    vm.AccBillTable[d].frameNo = '';
                    
                    
                    vm.productTax[d].tax = parseFloat(resData.vat);
                    vm.productTax[d].additionalTax = parseFloat(resData.additionalTax); // Additional Tax
                    
                    $scope.calculateTaxReverse(vm.AccBillTable[d],vm.productTax[d].tax,vm.productTax[d].additionalTax);
                    
                    d++;
                    /** End **/
                    
                });
            }
            
            
            
            //console.log('true');
            toaster.clear();
            //vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","discountType":"flat","price":1000,"discount":"","qty":3,"amount":""}];
            
        }
        else{
            vm.disableCompany = false;
            
            //get Company
            vm.companyDrop=[];
            apiCall.getCall(apiPath.getAllCompany).then(function(response2){
                //console.log(response2);
                vm.companyDrop = response2;
            });
            
            //console.log('Else');
            //vm.AccBillTable = [];
            vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","productInformation":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":""}];
            vm.productTax = [{"tax":0,"additionalTax":0}];
            
            $scope.defaultComapny();
            
            $scope.getInitStateCity();
            
        }
    }	
    /** End **/
    
    $scope.EditAddBill();
    
    
    
    //Change in Product Table
    $scope.changeProductTable = function(){
        
        $scope.changeProductArray = true;
        $scope.changeProductAdvancePrice = true;
        
        
    }
    
    //Change in Product Advance
    $scope.changeProductAdvance = function(){
        
        $scope.changeProductAdvancePrice = true;
        
    }
    
    //Changed date
    $scope.changeBillDate = function(Fname,value){
        
        // if(formdata.has(Fname))
        // {
        // formdata.delete(Fname);
        // }
        // var  date = new Date(value);
        // var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
        //console.log(Fname+'..'+fdate);
        //formdata.append(Fname,fdate);
    }
    
    $scope.changeInBill = function(Fname,value) {
        
        if(Fname == 'contactNo')
        {
            //console.log(Fname+'..'+value);
            
            // formdata.delete('stateAbb');
            // formdata.delete('cityId');
            
            $scope.quickBill.WorkNo = '';
            $scope.quickBill.companyName = ''
            $scope.quickBill.clientName = '';
            $scope.quickBill.emailId = '';
            $scope.quickBill.fisrtAddress = '';
            $scope.quickBill.secondAddress = '';
            //$scope.quickBill.cityId = {};
            //$scope.quickBill.stateAbb = {};
            $scope.clientSaveButton = true;
        }
    }
    
    $scope.changePaymentInBill = function(Fname,value) {
        
        
        if(value != 'bank'){
            
            
            
            $scope.quickBill.BankName = "";
            $scope.quickBill.chequeNo = "";
            
        }
        
        //console.log(Fname+'..'+value);
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
    
    //Total Tax For Product Table
    $scope.getTotalTax = function(){
        
        var total = 0;
        for(var i = 0; i < vm.AccBillTable.length; i++){
            var product = vm.AccBillTable[i];
            var vartax = vm.productTax[i];
            var totaltax = parseFloat(vartax.tax) + parseFloat(vartax.additionalTax);
            if(product.discountType == 'flat') {
                
                var getAmount = $filter('setDecimal')((product.price*product.qty) - product.discount,$scope.noOfDecimalPoints);
                
            }
            else{
                var getAmount  =  $filter('setDecimal')((product.price*product.qty)-((product.price*product.qty)*product.discount/100),$scope.noOfDecimalPoints);
            }
            total += productArrayFactory.calculateTax(getAmount,totaltax,0);
        }
        return total;
    }
    
    $scope.getTotal = function(){
        
        var total = 0;
        for(var i = 0; i < vm.AccBillTable.length; i++){
            var product = vm.AccBillTable[i];
            total += parseFloat(product.amount);
        }
        return total;
        
    }
   // gst setting
    var settingResponse = [];
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
        for(var arrayData=0;arrayData<responseLength;arrayData++)
        {
            if(angular.isObject(response) || angular.isArray(response))
            {
                if (response[arrayData].settingType=="taxation") 
                {
                    var arrayData1 = response[arrayData];
                    $scope.enableDisableGST = arrayData1.taxationGstStatus=="enable" ? true : false;
                    console.log('from response $scope.enableDisableGST',$scope.enableDisableGST);
                }
            }
        }
    }
    /** Tax Calculation **/
    
    $scope.calculateTaxReverse = function(item,cgst,sgst){
        
        var getCgst = cgst;
        var getSgst = sgst;
        
        if(item.discountType == 'flat') {
            //item.amount = ((item.price*item.qty) - item.discount | setDecimal: noOfDecimalPoints);
            
            var amount =  $filter('setDecimal')((item.price*item.qty) - item.discount,$scope.noOfDecimalPoints);
            var cgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getCgst,0),$scope.noOfDecimalPoints);
            
            var sgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getSgst,0),$scope.noOfDecimalPoints);
            console.log('$scope.enableDisableGST',$scope.enableDisableGST);
            if($scope.enableDisableGST){
                
                item.amount = amount+cgstAmount+sgstAmount;
            }
            else {
                item.amount = amount;
                // console.log('flat dis?',item.amount)
            }
            
            
        }
        else{
            //item.amount = ((item.price*item.qty)-((item.price*item.qty)*item.discount/100) | setDecimal: noOfDecimalPoints);
            var amount  =  $filter('setDecimal')((item.price*item.qty)-((item.price*item.qty)*item.discount/100),$scope.noOfDecimalPoints);
            var cgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getCgst,0),$scope.noOfDecimalPoints);
            var sgstAmount =  $filter('setDecimal')(productArrayFactory.calculateTax(amount,getSgst,0),$scope.noOfDecimalPoints);
            
            if($scope.enableDisableGST){
                
                item.amount = amount+cgstAmount+sgstAmount;
            }
            else {
                item.amount = amount;
                // console.log('% dis?',item.amount)
            }
        }
    }
    
    /** END **/
    
    
    /** Tax Calculation **/
    
    $scope.calculateTaxReverseTwo = function(item,cgst,sgst,index){
        
        var getCgst = parseFloat(cgst);
        var getSgst = parseFloat(sgst);
        var TaxSum = getCgst+getSgst;
        
        //console.log(TaxSum);
        // console.log('another loop',item.amount);
        
        vm.AccBillTable[index].price = $filter('setDecimal')(item.amount/ (1+(TaxSum/100)),$scope.noOfDecimalPoints);
        
        var Price = item.amount/ (1+(TaxSum/100));
        
    }
    
    /** END **/
    
    
    
    $scope.ChangeState = function(Fname,state)
    {
        
        //var getonecity = apiPath.getAllCity+state;
        
        //Get City
        //apiCall.getCall(getonecity).then(function(response4){
        vm.cityDrop = stateCityFactory.getDefaultStateCities(state);
        //vm.cityDrop = response4;
        //});
        
    }
    
    /* End */
    
    
    /** Insert Client **/
    
    $scope.insertClientData = function(){
        
        if($scope.quickBill.BillContact == undefined || $scope.quickBill.clientName == undefined || $scope.quickBill.emailId == undefined || $scope.quickBill.fisrtAddress == undefined || $scope.quickBill.BillContact == '' || $scope.quickBill.clientName == ''){
            toaster.clear();
            toaster.pop('warning','Enter Proper Data');
            return false;
        }
        
        var clientFormdata = new FormData();
        
        clientFormdata.append('contactNo',$scope.quickBill.BillContact);
        clientFormdata.append('clientName',$scope.quickBill.clientName);
        clientFormdata.append('emailId',$scope.quickBill.emailId);
        clientFormdata.append('address1',$scope.quickBill.fisrtAddress);
        clientFormdata.append('stateAbb',$scope.quickBill.stateAbb.stateAbb);
        clientFormdata.append('cityId',$scope.quickBill.cityId.cityId);
        
        
        apiCall.postCall(apiPath.getAllClient,clientFormdata).then(function(data){
            console.log(data);
            if(angular.isArray(data)){
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
    
    
    
    //Change Invoice Number When Company Changed
    $scope.changeCompany = function(item)
    {
        vm.loadData = true;
        toaster.clear();
        toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
        
        $scope.noOfDecimalPoints = parseInt(item.noOfDecimalPoints);
        
        $scope.getInvoiceAndJobcardNumber(item.companyId); // Invoice# and Jobcard#
        
        
        //Auto Suggest Product Dropdown data
        vm.productNameDrop = [];
        
        //apiCall.getCall(apiPath.getProductByCompany+item.companyId+'/branch').then(function(responseDrop){
        productFactory.getProductByCompany(item.companyId).then(function(responseDrop){
            
            vm.productNameDrop = responseDrop;
            
            toaster.clear();
            vm.loadData = false;
            
        });
        
        vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","productInformation":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":""}];
        vm.productTax = [{"tax":0,"additionalTax":0}];
        $scope.quickBill.advance = 0;
        
        // if(formdata.has('companyId')){
        
        //formdata.delete('companyId');
        
        //}
        //formdata.append('companyId',item.companyId);
    }
    
    
    $scope.disableButton = false;
    
    //alert($scope.getTotal());
    
    $scope.pop = function(generate)
    {
        var billFormData = new FormData();
        //alert(generate);
        $scope.disableButton = true;
        
        if($scope.quickBill.EditBillData){
            
            toaster.clear();
            toaster.pop('wait', 'Please Wait', 'Jobcard Data Updating....',600000);
            
        }
        else{
            toaster.clear();
            toaster.pop('wait', 'Please Wait', 'Jobcard Data Inserting....',600000);
            
        }
        
        var formdata = new FormData();
        /** Jobcard FormData **/
        var  date = new Date(vm.dt1);
        var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
        
        formdata.append('entryDate',fdate);
        
        //Delivery Date
        var  date2 = new Date(vm.dt2);
        var fdate2  = date2.getDate()+'-'+(date2.getMonth()+1)+'-'+date2.getFullYear();
        
        formdata.append('deliveryDate',fdate2);
        
        formdata.append('jobCardNumber',$scope.quickBill.jobcardNumber);
        
        
        
        
        formdata.append('isDisplay','yes');
        
        /** Another FormData **/
        formdata.append('companyId',$scope.quickBill.companyDropDown.companyId);
        
        
        if($scope.quickBill.BillContact != undefined){
            formdata.append('contactNo',$scope.quickBill.BillContact);
        }
        else{
            formdata.append('contactNo','');
        }
        
        formdata.append('clientName',$scope.quickBill.clientName);
        formdata.append('emailId',$scope.quickBill.emailId);
        formdata.append('address1',$scope.quickBill.fisrtAddress);
        formdata.append('stateAbb',$scope.quickBill.stateAbb.stateAbb);
        formdata.append('cityId',$scope.quickBill.cityId.cityId);
        formdata.append('transactionDate',fdate);
        formdata.append('total',$scope.totalTable);
        formdata.append('tax',$scope.quickBill.tax);
        formdata.append('grandTotal',$scope.grandTotalTable);
        
        formdata.append('balance',$scope.balanceTable);
        if($scope.quickBill.advance){
            
            formdata.append('advance',$scope.quickBill.advance);
            
        }
        else{
            formdata.append('advance',0);
            
        }
        
        if($scope.quickBill.labourCharge){
            
            formdata.append('labourCharge',$scope.quickBill.labourCharge);
            
        }
        else{
            formdata.append('labourCharge',0);
            
        }
        
        formdata.append('paymentMode',$scope.quickBill.paymentMode);
        
        if($scope.quickBill.paymentMode == 'bank'){
            
            formdata.append('bankName',$scope.quickBill.BankName.bankName);
            formdata.append('checkNumber',$scope.quickBill.chequeNo);
        }
        
        formdata.append('serviceType',$scope.quickBill.serviceType);
        /** End **/
        
        /** End **/
        
        
        if(generate == 'generateBill'){
            
            var  date3 = new Date(vm.dt1);
            var fdate3  = date3.getDate()+'-'+(date3.getMonth()+1)+'-'+date3.getFullYear();
            
            billFormData.append('companyId',$scope.quickBill.companyDropDown.companyId);
            billFormData.append('entryDate',fdate3);
            
            
            if($scope.quickBill.advance){
                
                billFormData.append('advance',$scope.quickBill.advance); // Bill
            }
            else{
                
                billFormData.append('advance',0); // Bill
            }
            
            if($scope.quickBill.labourCharge){
                
                billFormData.append('extraCharge',$scope.quickBill.labourCharge); // Bill
            }
            else{
                
                billFormData.append('extraCharge',0); // Bill
            }
            
            /** Bill FormData **/
            
            if($scope.quickBill.BillContact != undefined){
                billFormData.append('contactNo',$scope.quickBill.BillContact);
            }
            else{
                billFormData.append('contactNo','');
            }
            
            billFormData.append('clientName',$scope.quickBill.clientName);
            billFormData.append('emailId',$scope.quickBill.emailId);
            billFormData.append('address1',$scope.quickBill.fisrtAddress);
            billFormData.append('stateAbb',$scope.quickBill.stateAbb.stateAbb);
            billFormData.append('cityId',$scope.quickBill.cityId.cityId);
            billFormData.append('transactionDate',fdate);
            billFormData.append('total',$scope.totalTable);
            billFormData.append('tax',$scope.quickBill.tax);
            billFormData.append('grandTotal',$scope.grandTotalTable);
            
            billFormData.append('balance',$scope.balanceTable);
            billFormData.append('paymentMode',$scope.quickBill.paymentMode);
            
            if($scope.quickBill.paymentMode == 'bank'){
                
                billFormData.append('bankName',$scope.quickBill.BankName.bankName);
                billFormData.append('checkNumber',$scope.quickBill.chequeNo);
            }
            /** End **/
            billFormData.append('invoiceNumber',$scope.quickBill.invoiceNumber);
            billFormData.append('jobCardNumber',$scope.quickBill.jobcardNumber);
        }
        
        
        
        var  date4 = new Date();
        var tdate  = date4.getDate()+'-'+(date4.getMonth()+1)+'-'+date4.getFullYear();
        
        formdata.append('transactionDate',tdate);
        billFormData.append('transactionDate',tdate);
        
        
        
        
        //Product
        var json2 = angular.copy(vm.AccBillTable);
        
        for(var i=0;i<json2.length;i++){
            
            angular.forEach(json2[i], function (value,key) {
                
                if(key != 'color' && key!= 'frameNo' && key!='size'){
                    formdata.append('product['+i+']['+key+']',value);
                }
                if(key != 'productInformation'){
                    billFormData.append('inventory['+i+']['+key+']',value);
                }
            });
            
        }
        
        
        
        
        
        // if($scope.saleType == 'RetailsaleBill'){
        
        // $scope.salesTypeHeader = 'retail_sales';
        
        // }
        // else if($scope.saleType == 'WholesaleBill'){
        
        // $scope.salesTypeHeader = 'whole_sales';
        
        // }
        
        // alert($scope.salesTypeHeader);
        if(generate == 'generateBill'){
            
            var billHeaderData = {'Content-Type': undefined,'salesType':'retail_sales','operation':'preprint'};
            var headerData = {'Content-Type': undefined};
        }
        else{
            
            var headerData = {'Content-Type': undefined};
        }
        
        
        apiCall.postCallHeader(JobcardPostApiPath,headerData,formdata).then(function(data){
            
            
            
            //Delete Inventory Data From Formdata Object
            var json3 = angular.copy(vm.AccBillTable);
            
            for(var i=0;i<json3.length;i++){
                
                angular.forEach(json3[i], function (value,key) {
                    
                    formdata.delete('product['+i+']['+key+']');
                });
                
            }
            
            // formdata.delete('product[1][productName]');
            // formdata.delete('product[1][frameNo]');
            // formdata.delete('product[1][discount]');
            // formdata.delete('product[1][qty]');
            
            
            formdata.delete('entryDate');
            formdata.delete('deliveryDate');
            formdata.delete('jobCardNo');
            formdata.delete('invoiceNumber');
            formdata.delete('transactionDate');
            formdata.delete('total');
            formdata.delete('tax');
            formdata.delete('grandTotal');
            formdata.delete('advance');
            formdata.delete('balance');
            formdata.delete('labourCharge');
            
            //formdata.delete('inventory');
            formdata.delete('isDisplay');
            
            
            if((angular.isObject(data) && data.hasOwnProperty('documentPath'))){
                
                toaster.clear();
                
                if(generate == 'generateBill'){
                    
                    toaster.pop('wait', 'Please Wait', 'Bill Data Inserting....',600000);
                    
                    apiCall.postCallHeader(apiPath.postBill,billHeaderData,billFormData).then(function(response){
                        
                        toaster.clear();
                        
                        if((angular.isObject(response) && response.hasOwnProperty('documentPath'))){
                            
                            var pdfPath = $scope.erpPath+response.documentPath;
                            $scope.directPrintPdf(pdfPath);
                            var billFormData = new FormData();
                        }
                        
                        $scope.disableButton = false;
                        
                        $scope.clearDataAfterResponse();
                        
                    });
                }
                else{
                    
                    toaster.clear();
                    
                    var pdfPath = $scope.erpPath+data.documentPath;
                    $scope.directPrintPdf(pdfPath);
                    
                    $scope.disableButton = false;
                    
                    $scope.clearDataAfterResponse();
                }
                
                
            }
            else{
                toaster.clear();
                
                if(apiResponse.noContent == data){
                    
                    toaster.pop('warning', 'Opps!!', 'Field Not Change');
                }
                else if(data.status == 500){
                    toaster.pop('warning', 'Something Wrong', data.statusText);
                }
                else{
                    toaster.pop('warning', 'Something Wrong', data);
                }
                
                $scope.disableButton = false;
            }
            
            
            
            
        }).catch(function (reason) {
            // err
            if (reason.status === 500) {
                // do something
                
                console.log('Encountered server error');
            }
        });
    }
    
    
    $scope.cancel = function(){
        
        var companyObject = $scope.quickBill.companyDropDown;
        
        $scope.quickBill = [];
        
        $scope.disableButton = false; 
        
        var formdata = new FormData();
        var billFormData = new FormData();
        
        vm.dt1 = new Date();
        vm.dt2 = new Date();
        vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","productInformation":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":""}];
        vm.productTax = [{"tax":0,"additionalTax":0}];
        vm.cityDrop = [];
        
        $scope.changeProductArray = false;
        $scope.changeProductAdvancePrice = false;
        vm.disableCompany = false;
        $scope.quickBill.companyDropDown = companyObject;
        
        $scope.getInvoiceAndJobcardNumber(companyObject.companyId); // Invoice# and Jobcard#
        
        $scope.clientGetAllFunction();
        
        $scope.getInitStateCity();
        
        $scope.quickBill.paymentMode = 'cash';
        $scope.quickBill.serviceType = 'paid';
        
        $("#contactNoSelect").focus();
        
        $anchorScroll();
        
        
    }
    
    $scope.clearDataAfterResponse = function(){
        
        var companyObject = $scope.quickBill.companyDropDown;
        $scope.quickBill = [];
        vm.dt1 = new Date();
        vm.dt2 = new Date();
        vm.AccBillTable = [{"productId":"","productName":"","color":"","frameNo":"","productInformation":"","discountType":"flat","price":0,"discount":"","qty":1,"amount":"","size":""}];
        vm.productTax = [{"tax":0,"additionalTax":0}];
        //vm.cityDrop = [];
        
        $scope.changeProductArray = false;
        $scope.changeProductAdvancePrice = false;
        vm.disableCompany = false; 
        
        // $scope.defaultComapny();
        $scope.ReloadAfterSave(companyObject);
        
        $scope.clientGetAllFunction();
        
        $scope.getInitStateCity(); //get Default State and City
        
        //Get State
        // vm.statesDrop=[];
        // apiCall.getCall(apiPath.getAllState).then(function(response3){
        
        // vm.statesDrop = response3;
        
        // });
        
        $scope.quickBill.paymentMode = 'cash';
        $scope.quickBill.serviceType = 'paid';
        
        $anchorScroll();
        $("#contactNoSelect").focus();
        
        if($scope.quickBill.EditBillData){
            
            toaster.pop('success', 'Title', 'Update Successfully');
        }
        else{
            
            toaster.pop('success', 'Title', 'Insert Successfully');
        }
        
    }
    
    $scope.directPrintPdf = function(pdfUrlPath){
        
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
            printwWindow.print();
        }).error(function(data, status, headers, config) {
            alert('Sorry, something went wrong')
        });
        /** End **/
        
    }
    
    
    
    
    $scope.setClientSuggest = function(Fname,data){
        
        $scope.clientSaveButton = false; //Save Button
        
        //console.log(data);
        $scope.quickBill.cityId = {};
        $scope.quickBill.stateAbb = {};
        
        //$scope.quickBill.WorkNo = data.workNo;
        //$scope.quickBill.companyName = data.companyName;
        $scope.quickBill.clientName = data.clientName;
        $scope.quickBill.emailId = data.emailId;
        
        $scope.quickBill.fisrtAddress = data.address1;
        $scope.quickBill.secondAddress = data.address2;
        
        //State DropDown Selection
        var stateDropPath = apiPath.getAllState+'/'+data.state.stateAbb;
        apiCall.getCall(stateDropPath).then(function(res3){
            
            if(angular.isObject(res3)){
                
                $scope.quickBill.stateAbb = res3;
                
            }
            else{
                toaster.pop('alert', 'Opps!!', 'State Not Selected');
            }
        });
        
        //City DropDown
        var cityAllDropPath = apiPath.getAllCity+data.state.stateAbb;
        apiCall.getCall(cityAllDropPath).then(function(res5){
            vm.cityDrop = res5;
        });
        
        //City DropDown Selection
        var cityDropPath = apiPath.getOneCity+'/'+data.city.cityId;
        apiCall.getCall(cityDropPath).then(function(res4){
            
            if(angular.isObject(res4)){
                
                //console.log('Object');
                $scope.quickBill.cityId = res4;
                
            }
            else{
                
                toaster.pop('alert', 'Opps!!', 'City Not Selected');
            }
            
        });
    }
    
    // Datepicker
    // ----------------------------------- 
    this.minStart = new Date();
    
    this.today = function() {
        this.dt1 = new Date();
        this.dt2 = new Date();
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
    
    this.openDelivery = function($event) {
        
        $event.preventDefault();
        $event.stopPropagation();
        
        this.openDeliveryBox = true;
    };
    
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
        //this.mytime = null;
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
        
        
        /**
        Product Model Start
        **/
        $scope.openProduct = function (size,index) {
            
            
            if (Modalopened) return;
            
            toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
            
            if($scope.quickBill.companyDropDown){
                
                var modalInstance = $modal.open({
                    templateUrl: 'app/views/PopupModal/Accounting/productModal.html',
                    controller: 'AccProductModalController as form',
                    size: size,
                    resolve:{
                        productIndex: function(){
                            return index;
                        },
                        companyId: function(){
                            
                            return $scope.quickBill.companyDropDown;
                        }
                    }
                });
                
                Modalopened = true;
                
                modalInstance.opened.then(function() {
                    toaster.clear();
                });
                
                modalInstance.result.then(function (data) {
                    
                    //console.log(data);
                    var UrlPath = apiPath.getProductByCompany+data.companyId;
                    
                    apiCall.getCall(UrlPath+'/branch').then(function(responseDrop){
                        
                        vm.productNameDrop = responseDrop;
                        
                    });
                    
                    var headerSearch = {'Content-Type': undefined,'productName':data.productName,'color':data.color,'size':data.size};
                    
                    apiCall.getCallHeader(UrlPath,headerSearch).then(function(response){
                        
                        //console.log(response);
                        vm.AccBillTable[data.index].productName = response[0].productName;
                        //vm.AccBillTable[data.index].productId = response.productId;
                        
                        $scope.setProductData(response[0],data.index);
                        
                    });
                    
                    Modalopened = false;
                    
                }, function () {
                    console.log('Cancel');	
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
        
        /** Invoice **/
        $scope.goInvoiceNumber = function(){
            
            var JobcardNumber = $scope.quickBill.searchInvoiceNumber.replace(/\//g, "~");
            console.log(JobcardNumber);
            
            apiCall.getCall(apiPath.PostJobcard+'/'+JobcardNumber).then(function(response){
                
                // console.log('starting');
                console.log(response);
                
                if(angular.isObject(response)){
                    $scope.quickBill = [];
                    getSetFactory.set(response);
                    
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
                
            });
            
        }
        /** End **/
        
        
        $scope.focusbarcode = function(){
            
            //$("canvas").WebCodeCamJQuery(arg).data().plugin_WebCodeCamJQuery.stop();
            //console.log('done');
            // console.log(arg.resultFunction());
        }
        
        $scope.SetBarcodData = function(Bcode){
            
            
            
            //console.log('Code 128');
            
            //var proBarcode = result.code;
            var proBarcode = Bcode;
            
            //Api
            
            var headerSearch = {'Content-Type': undefined,'productCode':proBarcode};
            
            apiCall.getCallHeader(apiPath.getAllProduct,headerSearch).then(function(response){
                
                var companyId = $scope.quickBill.companyDropDown.companyId;
                
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
                if(checkFlag == 0){
                    
                    var barcodeflag = 0;
                    var checkCnt = vm.AccBillTable.length;
                    for(var cVar=0;cVar<checkCnt;cVar++){
                        
                        var arrayData = vm.AccBillTable[cVar];
                        
                        if(arrayData.productId == ""){
                            
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
                        
                        //console.log(response);
                        vm.AccBillTable[fatIndex].productName = response.productName;
                        //vm.AccBillTable[data.index].productId = response.productId;
                        
                        $scope.setProductData(response,fatIndex);
                        //$scope.$apply();
                        toaster.clear();
                        toaster.pop('success', 'Barcode Scanned', '');	
                        
                        $scope.$apply();
                    }
                }
                /** End loop **/
                
            });
            
            //End Api
            
            
            
        }
        
        $scope.presssuburb = function(event){
            
            if(event.target.value.length == 14){
                
                console.log(event.target.value.length);
                $scope.SetBarcodData(event.target.value);
            }
        }
        
    }
    CrmJobcardController.$inject = ["$rootScope","$scope","apiCall","apiPath","$http","$window","$modal", "$log","validationMessage","productArrayFactory","getSetFactory","toaster","apiResponse","$anchorScroll","$location","$sce","$templateCache","getLatestNumber","stateCityFactory","productFactory","$filter"];