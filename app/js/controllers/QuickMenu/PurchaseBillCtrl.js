angular.module('purchaseBill', []).controller('PurchaseBillController', PurchaseBillController);

function PurchaseBillController($rootScope, $scope, apiCall, apiPath, $http, $window, $modal, purchaseType, validationMessage, productArrayFactory, getSetFactory, toaster, apiResponse, $anchorScroll, maxImageSize, $sce, $templateCache, getLatestNumber, productFactory, $filter, $state, fetchArrayService, bankFactory) {
    'use strict';
    
    var vm = this;
    var formdata = new FormData();
    
    $scope.erpPath = $rootScope.erpPath; //Erp Path
    var dateFormats = $rootScope.dateFormats; //Date Format
    
    $scope.purchaseType = purchaseType;
    
    $scope.purchaseBill = [];
    $scope.displayDefaultCompanyName = "";
    $scope.openedItemizeTree = 0;
    vm.AccExpense = [];
    $scope.companyState = '';
    vm.disableCompany = false;
    var Modalopened = false;
    
    vm.AccBillTable = [];
    vm.productHsn = [];
    vm.measurementUnitDrop = [];
    var api_measurementUnit = apiPath.settingMeasurementUnit;
    
    var defStateData = {};
    var AllDefCityData = [];
    var defCityData = {};
    
    $scope.noOfDecimalPoints; // decimalPoints For Price,Tax Etc.....
    
    $scope.productArrayFactory = productArrayFactory;
    
    $scope.changeProductArray = false; // Change When Update in Product Table Array
    $scope.changeProductAdvancePrice = false; // Change Advance Price of Product
    
    $scope.purchaseBill.tax = 0; //Tax
    
    $scope.totalTable_without_expense;
    $scope.totalTable;
    $scope.grandTotalTable;
    $scope.purchaseBill.balanceTable;
    $scope.igstDisable = true;
    $scope.csgstDisable = false;
    $scope.enableDisableLWHArray = [];
    
    vm.dueDate;
    
    /* VALIDATION */
    
    $scope.errorMessage = validationMessage; //Error Messages In Constant
    
    /* VALIDATION END */
    vm.paymentModeDrop = ['cash', 'bank', 'card'];
    
    $scope.purchaseBill.paymentMode = 'cash';
    vm.clientNameDropCr = [];
    
    //Auto Suggest Client Contact Dropdown data
    $scope.clientGetAllFunction = function(id, updateId = null) {
        vm.clientNameDropCr = [];
        var jsuggestPath = apiPath.getLedgerJrnl + id;
        var headerCr = { 'Content-Type': undefined, 'ledgerGroup': [31] };
        
        apiCall.getCallHeader(jsuggestPath, headerCr).then(function(response3) {
            console.log(response3);
            if (angular.isArray(response3)) {
                var tCount = response3.length;
                while (tCount--) {
                    var kCount = response3[tCount].length;
                    while (kCount--) {
                        vm.clientNameDropCr.push(response3[tCount][kCount]);
                        if (updateId != null) {
                            if (parseInt(response3[tCount][kCount].ledgerId) == parseInt(updateId)) {
                                $scope.purchaseBill.ledgerEditableData = response3[tCount][kCount];
                            }
                        }
                    }
                }
            } else {
                toaster.clear();
                if (response3 == apiResponse.notFound || response3 == apiResponse.noContent) {
                    toaster.pop('info', 'Please Add Your Vendor First');
                } else {
                    toaster.pop('info', response3);
                }
            }
        });
    }
    
    function loadBankLedgerOfCompany(companyId, callback, ledgerId = 0) {
        vm.bankLedgerDrop = [];
        var jsuggestPath = apiPath.getLedgerJrnl + companyId;
        var headerCr = { 'Content-Type': undefined, 'ledgerGroup': [9] };
        var ledgerData = {};
        apiCall.getCallHeader(jsuggestPath, headerCr).then(function(response3) {
            var res3cnt = response3.length;
            for (var t = 0; t < res3cnt; t++) {
                var innerCnt = response3[t].length;
                for (var k = 0; k < innerCnt; k++) {
                    if (ledgerId != 0) {
                        if (response3[t][k].ledgerId == ledgerId) {
                            ledgerData = response3[t][k];
                        }
                    }
                    vm.bankLedgerDrop.push(response3[t][k]);
                }
                if (t == (res3cnt - 1)) {
                    if (ledgerId != 0) {
                        callback(ledgerData);
                    } else {
                        callback(vm.bankLedgerDrop);
                    }
                }
            }
        });
    }
    
    var measurementUnitDropData = [];
    
    function loadAdvanceMeasurementUnit(callback) {
        //Set Advance Measurement Unit
        apiCall.getCall(api_measurementUnit).then(function(response) {
            callback(response);
        });
    }
    
    loadAdvanceMeasurementUnit(function(advanceRes) {
        measurementUnitDropData = advanceRes;
    });
    
    $scope.displayProductName = "productName";
    $scope.enableDisableAdvanceMou = false;
    $scope.enableDisableColor = true;
    $scope.enableDisableVariant = true;
    $scope.enableDisableSize = true;
    $scope.enableDisableFrameNo = true;
    $scope.enableItemizedPurchaseSales = false;
    $scope.enableDisableLWHSetting = false;
    $scope.divTag = true;
    $scope.divAdvanceMou = false;
    $scope.enableDisableTaxReadOnly = false;
    $scope.colspanValue = '7';
    $scope.colspanAdvanceValue = '8';
    $scope.colspanExpenseValue = '8';
    $scope.totalTd = '13';
    $scope.ProductColorSizeVarDesign = 'productColorSizeWidth';
    //get setting data
    $scope.getOptionSettingData = function() {
        toaster.clear();
        apiCall.getCall(apiPath.settingOption).then(function(response) {
            var responseLength = response.length;
            // console.log(response);
            for (var arrayData = 0; arrayData < responseLength; arrayData++) {
                if (angular.isObject(response) || angular.isArray(response)) {
                    if (response[arrayData].settingType == "product") {
                        var arrayData1 = response[arrayData];
                        $scope.divAdvanceMou = $scope.enableDisableAdvanceMou = arrayData1.productAdvanceMouStatus == "enable" ? true : false;
                        $scope.enableDisableColor = arrayData1.productColorStatus == "enable" ? true : false;
                        $scope.enableDisableSize = arrayData1.productSizeStatus == "enable" ? true : false;
                        $scope.enableDisableVariant = arrayData1.productVariantStatus == "enable" ? true : false;
                        $scope.enableDisableFrameNo = arrayData1.productFrameNoStatus == "enable" ? true : false;
                        $scope.divTag = $scope.enableDisableColor == false && $scope.enableDisableSize == false ? false : true;
                        if (arrayData1.productMeasurementType == 'Unit Measurement') {
                            $scope.enableDisableLWHSetting = true;
                        }
                        if ($scope.enableDisableColor && $scope.enableDisableSize && $scope.enableDisableVariant) {
                            $scope.ProductColorSizeVarDesign = 'productColorSizeVarDesign';
                        } else if (($scope.enableDisableColor && $scope.enableDisableSize) ||
                        ($scope.enableDisableVariant && $scope.enableDisableColor) ||
                        ($scope.enableDisableVariant && $scope.enableDisableSize)) {
                            $scope.ProductColorSizeVarDesign = 'productColorSizeDesign';
                        }
                        // $scope.colspanValue = $scope.divTag==false ? '5' : '6';
                        // $scope.totalTd = $scope.divTag==false ? '12' : '13';
                        // $scope.colspanAdvanceValue = $scope.divTag==false ? '8' : '9';
                        $scope.colspanExpenseValue = $scope.divTag == false ? '7' : '8';
                        if ($scope.divTag == false && $scope.enableDisableFrameNo == false) {
                            if ($scope.enableDisableAdvanceMou == true) {
                                $scope.colspanAdvanceValue = '7';
                                $scope.colspanValue = '6';
                                $scope.totalTd = '12';
                            } else {
                                $scope.colspanAdvanceValue = '6';
                                $scope.colspanValue = '5';
                                $scope.totalTd = '11';
                                $scope.colspanExpenseValue = '6';
                            }
                        } else if ($scope.divTag == false || $scope.enableDisableFrameNo == false) {
                            $scope.colspanAdvanceValue = '7';
                            $scope.colspanValue = '6';
                            $scope.totalTd = '12';
                            $scope.colspanExpenseValue = '7';
                        } else {
                            $scope.colspanAdvanceValue = '8';
                            $scope.colspanValue = '7';
                            $scope.totalTd = '13';
                            $scope.colspanExpenseValue = '8';
                        }
                    } else if (response[arrayData].settingType == "inventory") {
                        $scope.enableItemizedPurchaseSales = response[arrayData].inventoryItemizeStatus == "enable" ? true : false;
                    } else if (response[arrayData].settingType == "language") {
                        var arrayData1 = response[arrayData];
                        $scope.displayProductName = arrayData1.languageSettingType == "hindi" ? "altProductName" : "productName";
                        if ($scope.displayProductName == "altProductName") {
                            onGoogleInit();
                        }
                    }else if (response[arrayData].settingType=="taxation") 
                    {
                        var arrayData1 = response[arrayData];
                        $scope.enableDisableGST = arrayData1.taxationGstStatus=="enable" ? true : false;
                        // console.log('$scope.enableDisableGST',$scope.enableDisableGST);
                    } else if (response[arrayData].settingType == "advance") {
                        var arrayData1 = response[arrayData];
                        $scope.enableDisableTaxReadOnly = arrayData1.advanceTaxReadOnlyStatus == "enable" ? true : false;
                    }
                }
            }
            $scope.EditAddBill();
        });
    }
    $scope.getOptionSettingData();
    
    //Set Settings Color/Size/Frame in Product Data
    function filterProductData() {
        vm.productNameDrop.map(function(mData) {
            mData['isColor'] = $scope.enableDisableColor;
            mData['isSize'] = $scope.enableDisableSize;
            mData['isVariant'] = $scope.enableDisableVariant;
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
    
    $scope.expenseAmount = [];
    
    $scope.getExpenseValue = function(index) {
        var expenseType = vm.AccExpense[index].expenseType;
        var expenseValue = parseFloat(vm.AccExpense[index].expenseValue);
        vm.AccExpense[index].expenseTax = vm.AccExpense[index].expenseTax != undefined && !isNaN(vm.AccExpense[index].expenseTax) ?
        vm.AccExpense[index].expenseTax : 0;
        var expenseTax = parseFloat(vm.AccExpense[index].expenseTax);
        var totalData = 0;
        var expenseAmt = expenseValue * (1 + (expenseTax / 100));
        vm.AccExpense[index].expenseAmt = $filter('setDecimal')(expenseType == "flat" ?
        parseFloat(expenseAmt) :
        parseFloat(expenseAmt / 100) * parseFloat($scope.totalTable_without_expense), $scope.noOfDecimalPoints);
        
        if (index == 0) {
            totalData = parseFloat($scope.totalTable_without_expense);
        } else {
            totalData = parseFloat($scope.expenseAmount[index - 1]);
        }
        if (vm.AccExpense[index].expenseOperation == "plus") {
            var totalExpense = expenseType == "flat" ? parseFloat(expenseAmt) + parseFloat(totalData) : (((parseFloat(expenseAmt) / 100) * parseFloat($scope.totalTable_without_expense)) + parseFloat(totalData));
        } else {
            var totalExpense = expenseType == "flat" ? parseFloat(totalData) - parseFloat(expenseAmt) : (parseFloat(totalData) - ((parseFloat(expenseAmt) / 100) * parseFloat($scope.totalTable_without_expense)));
            
        }
        $scope.totalTable = $scope.expenseAmount[$scope.expenseAmount.length - 1];
        return totalExpense;
    }
    
    $scope.openExpenseRawData = false;
    //open expense raw
    $scope.openExpenseRaw = function() {
        $scope.openExpenseRawData = true;
        $scope.addExpenseRow(-1);
    }
    //Default Company Function
    $scope.defaultComapny = function() {
        
        vm.loadData = true;
        var response2 = apiCall.getDefaultCompanyFilter(vm.companyDrop);
        
        toaster.clear();
        toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);
        
        $scope.purchaseBill.companyDropDown = response2;
        
        formdata.delete('companyId');
        formdata.set('companyId', response2.companyId);
        
        $scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints); //Set Decimal
        
        var id = response2.companyId;
        $scope.displayDefaultCompanyName = response2.companyName;
        $scope.companyState = response2.state.stateAbb;
        
        $scope.clientGetAllFunction(id);
        
        //Auto Suggest Product Dropdown data
        vm.productNameDrop = [];
        productFactory.getProductByCompany(id).then(function(data) {
            
            vm.productNameDrop = data;
            filterProductData();
            vm.loadData = false;
            toaster.clear();
        });
        
        //Get Bank Ledger of this Company
        loadBankLedgerOfCompany(id, function(responseBank) {
            
        });
        
        $scope.printButtonType = response2.printType == '' ? 'print' : response2.printType;
        
    }
    
    $scope.ReloadAfterSave = function(response2) {
        $scope.purchaseBill.companyDropDown = response2;
        formdata.delete('companyId');
        formdata.set('companyId', response2.companyId);
        $scope.noOfDecimalPoints = parseInt(response2.noOfDecimalPoints);
        var id = response2.companyId;
        $scope.clientGetAllFunction(id);
    }
    
    //get Bank
    vm.bankDrop = [];
    bankFactory.getBank().then(function(response) {
        var count = response.length;
        while (count--) {
            vm.bankDrop.push(response[count].bankName);
        }
    });
    
    /* Table */
    $scope.addRow = function(index) {
        
        var plusOne = index + 1;
        
        var data = {};
        data.productId = '';
        data.productName = '';
        data.color = '';
        data.frameNo = '';
        data.discountType = 'flat';
        data.discount = '';
        data.price = 0;
        data.qty = 1;
        data.amount = '';
        data.size = '';
        data.variant = '';
        //vm.AccBillTable.push(data);
        vm.AccBillTable.splice(plusOne, 0, data);
        
        $scope.changeProductArray = true;
        
        if ($scope.displayProductName == "altProductName") {
            /* To Load Hindi Transliteration by Class */
            setTimeout(function() {
                onLoad();
            }, 500);
        }
    };
    $scope.addExpenseRow = function(index) {
        
        var plusOne = index + 1;
        
        var data = {};
        data.expenseType = 'flat';
        data.expenseOperation = 'plus';
        //vm.AccBillTable.push(data);
        vm.AccExpense.splice(plusOne, 0, data);
        $scope.changeProductArray = true;
    };
    
    
    $scope.removeExpenseRow = function(idx) {
        vm.AccExpense.splice(idx, 1);
        $scope.expenseAmount.splice(idx, 1);
        $scope.changeProductArray = true;
        //vm.productTax.splice(idx, 1);
        
        // vm.productHsn.splice(idx,1);
        
        // $scope.changeProductArray = true;
        
        $scope.advanceValueUpdate();
    };
    
    $scope.myCustomProductFilter = function(item) {
        return item[$scope.displayProductName] != null && item[$scope.displayProductName] != '';
    }
    
    $scope.setProductData = function(item, index) {
        vm.AccBillTable[index].productId = item.productId;
        vm.productHsn[index] = item.hsn;
        
        var grandPrice = 0;
        var tax;
        
        grandPrice = productArrayFactory.calculate(item.purchasePrice, 0, item.wholesaleMargin) + parseFloat(item.wholesaleMarginFlat);
        
        if (item.purchasePrice == 0 || grandPrice == 0) {
            
            grandPrice = productArrayFactory.calculate(item.mrp, 0, item.margin) + parseFloat(item.marginFlat);
        }
        
        //Custom GST
        
        if ($scope.csgstDisable) {
            vm.AccBillTable[index].cgstPercentage = 0;
            vm.AccBillTable[index].sgstPercentage = 0;
            vm.AccBillTable[index].igstPercentage = checkGSTValue(item.igst);
        } else {
            vm.AccBillTable[index].cgstPercentage = checkGSTValue(item.vat);
            vm.AccBillTable[index].sgstPercentage = checkGSTValue(item.additionalTax);
            vm.AccBillTable[index].igstPercentage = 0;
        }
        
        vm.AccBillTable[index].price = grandPrice;
        
        /** Color/Size **/
        vm.AccBillTable[index].color = item.color;
        vm.AccBillTable[index].size = item.size;
        vm.AccBillTable[index].variant = item.variant;
        /** End **/
        
        if ($scope.enableDisableAdvanceMou) {
            vm.measurementUnitDrop[index] = [];
            var unitParams = ['highest', 'higher', 'medium', 'mediumLower', 'lower', 'lowest'];
            for (var i = 0; i < unitParams.length; i++) {
                if (i < unitParams.length - 1) {
                    if (angular.isObject(item[unitParams[i] + 'MeasurementUnit']) && angular.isDefined(item[unitParams[i] + 'MeasurementUnit'].measurementUnitId)) {
                        item[unitParams[i] + 'MeasurementUnit']['measurementUnit'] = unitParams[i];
                        vm.measurementUnitDrop[index].push(item[unitParams[i] + 'MeasurementUnit']);
                    }
                } else {
                    if (angular.isObject(item.measurementUnit) && angular.isDefined(item.measurementUnit.measurementUnitId)) {
                        item.measurementUnit['measurementUnit'] = unitParams[i];
                        vm.measurementUnitDrop[index].push(item.measurementUnit);
                    }
                }
            }
            if (item.primaryMeasureUnit == 'lowest') {
                vm.AccBillTable[index].measurementUnit = item.measurementUnit;
            } else {
                vm.AccBillTable[index].measurementUnit = item[item.primaryMeasureUnit + 'MeasurementUnit'];
            }
            $scope.changeQuantity(index);
        } else if ($scope.enableDisableLWHSetting) {
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
                } else {
                    vm.AccBillTable[index].devideFactor = 1;
                }
                $scope.enableDisableLWHArray[index] = {};
                
                $scope.enableDisableLWHArray[index].lengthStatus = item.measurementUnit.lengthStatus == 'enable' ? true : false;
                $scope.enableDisableLWHArray[index].widthStatus = item.measurementUnit.widthStatus == 'enable' ? true : false;
                $scope.enableDisableLWHArray[index].heightStatus = item.measurementUnit.heightStatus == 'enable' ? true : false;
                if ($scope.enableDisableLWHArray[index].lengthStatus &&
                    $scope.enableDisableLWHArray[index].widthStatus &&
                    $scope.enableDisableLWHArray[index].heightStatus) {
                        $scope.enableDisableLWHArray[index].styleObj = {
                            "width": "33.33%",
                            "padding-left": "6px",
                            "padding-right": "6px",
                            "float": "left"
                        };
                    } else if ($scope.enableDisableLWHArray[index].lengthStatus && $scope.enableDisableLWHArray[index].widthStatus ||
                        $scope.enableDisableLWHArray[index].lengthStatus && $scope.enableDisableLWHArray[index].heightStatus ||
                        $scope.enableDisableLWHArray[index].heightStatus && $scope.enableDisableLWHArray[index].widthStatus) {
                            $scope.enableDisableLWHArray[index].styleObj = {
                                "width": "50%",
                                "padding-left": "6px",
                                "padding-right": "6px",
                                "float": "left"
                            };
                        } else {
                            $scope.enableDisableLWHArray[index].styleObj = { "width": "100%" };
                        }
                    } else {
                        $scope.enableDisableLWHArray[index] = {};
                    }
                    if (item.taxInclusive == "inclusive") {
                        vm.AccBillTable[index].amount = $filter('setDecimal')(item.purchasePrice * vm.AccBillTable[index].qty, $scope.noOfDecimalPoints);
                        $scope.calculateTaxReverseTwo(vm.AccBillTable[index], vm.AccBillTable[index].cgstPercentage, vm.AccBillTable[index].sgstPercentage, vm.AccBillTable[index].igstPercentage, index);
                    } else {
                        $scope.calculateTaxReverse(vm.AccBillTable[index], item.vat, item.additionalTax, item.igst, index);
                    }
                } else {
                    $scope.calculateTaxReverse(vm.AccBillTable[index], vm.AccBillTable[index].cgstPercentage, vm.AccBillTable[index].sgstPercentage, vm.AccBillTable[index].igstPercentage, index);
                }
                
                $scope.changeProductArray = true;
                
                if (!$scope.purchaseBill.EditBillData) {
                    $scope.advanceValueUpdate();
                }
            }
            var expenseGetApiPath = apiPath.settingExpense;
            $scope.expenseData = [];
            
            
            // Get All Expense Call 
            
            
            apiCall.getCall(expenseGetApiPath).then(function(response) {
                $scope.expenseData = response;
            });
            $scope.changeQuantity = function(index) {
                var productId = vm.AccBillTable[index].productId;
                var selectedUnit = vm.AccBillTable[index].measurementUnit;
                var grandPrice;
                productFactory.getSingleProduct(productId).then(function(response) {
                    if ($scope.enableDisableAdvanceMou) {
                        if (selectedUnit.measurementUnit == 'lowest' || selectedUnit.measurementUnit == undefined) {
                            grandPrice = parseFloat(response.purchasePrice);
                        } else {
                            grandPrice = parseFloat(response[selectedUnit.measurementUnit + 'PurchasePrice']);
                        }
                        if (response.taxInclusive == 'inclusive') {
                            vm.AccBillTable[index].price = $filter('setDecimal')(grandPrice, $scope.noOfDecimalPoints);
                            vm.AccBillTable[index].amount = $filter('setDecimal')(grandPrice * vm.AccBillTable[index].qty, $scope.noOfDecimalPoints);
                            $scope.calculateTaxReverseTwo(vm.AccBillTable[index], vm.AccBillTable[index].cgstPercentage, vm.AccBillTable[index].sgstPercentage, vm.AccBillTable[index].igstPercentage, index);
                        } else {
                            vm.AccBillTable[index].price = $filter('setDecimal')(grandPrice, $scope.noOfDecimalPoints);
                            vm.AccBillTable[index].amount = $filter('setDecimal')(grandPrice * vm.AccBillTable[index].qty, $scope.noOfDecimalPoints);
                            $scope.calculateTaxReverse(vm.AccBillTable[index], vm.AccBillTable[index].cgstPercentage, vm.AccBillTable[index].sgstPercentage, vm.AccBillTable[index].igstPercentage, index);
                        }
                    } else if ($scope.enableDisableLWHSetting) {
                        if (response.taxInclusive == 'inclusive') {
                            var calcQty = getCalcQty(vm.AccBillTable[index], $scope.enableDisableLWHArray[index]);
                            var calcTax = parseFloat(vm.AccBillTable[index].cgstPercentage) + parseFloat(vm.AccBillTable[index].sgstPercentage) + parseFloat(vm.AccBillTable[index].igstPercentage);
                            vm.AccBillTable[index].stockFt = calcQty;
                            if (angular.isDefined(vm.AccBillTable[index].price) && !isNaN(vm.AccBillTable[index].price) && vm.AccBillTable[index].price != 0) {
                                vm.AccBillTable[index].amount = $filter('setDecimal')(vm.AccBillTable[index].price * calcQty * (1 + (calcTax)), $scope.noOfDecimalPoints);
                            } else {
                                vm.AccBillTable[index].amount = $filter('setDecimal')(response.purchasePrice * calcQty, $scope.noOfDecimalPoints);
                            }
                            if (vm.AccBillTable[index].amount == 0) {
                                vm.AccBillTable[index].amount = $filter('setDecimal')(response.mrp * calcQty, $scope.noOfDecimalPoints);
                            }
                            $scope.calculateTaxReverseTwo(vm.AccBillTable[index], vm.AccBillTable[index].cgstPercentage, vm.AccBillTable[index].sgstPercentage, vm.AccBillTable[index].igstPercentage, index);
                        } else {
                            $scope.calculateTaxReverse(vm.AccBillTable[index], vm.AccBillTable[index].cgstPercentage, vm.AccBillTable[index].sgstPercentage, vm.AccBillTable[index].igstPercentage, index);
                        }
                    }
                });
            }
            
            function getCalcQty(calcItem, lwhStatus) {
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
                } else {
                    calcLength = parseFloat(calcItem.lengthValue);
                    calcWidth = parseFloat(calcItem.widthValue);
                    calcHeight = parseFloat(calcItem.heightValue);
                }
                return $filter('setDecimal')(parseFloat(calcItem.qty) * calcLength * calcWidth * calcHeight / parseFloat(calcItem.devideFactor), $scope.noOfDecimalPoints);
            }
            //save expense-name in expense-data
            $scope.setExpenseData = function(item, index) {
                vm.AccExpense[index].expenseName = item.expenseName;
                vm.AccExpense[index].expenseId = item.expenseId;
                vm.AccExpense[index].expenseValue = item.expenseValue;
                vm.AccExpense[index].expenseTax = item.expenseTax;
                vm.AccExpense[index].expenseType = item.expenseType;
                vm.AccExpense[index].expenseOperation = 'plus';
                $scope.changeProductArray = true;
            }
            
            $scope.removeRow = function(idx) {
                vm.AccBillTable.splice(idx, 1);
                vm.productHsn.splice(idx, 1);
                
                $scope.changeProductArray = true;
                
                $scope.advanceValueUpdate();
            };
            
            // End Table 
            
            //Return right value
            function checkGSTValue(value) {
                
                if (angular.isUndefined(value) || value == '' || value == null) {
                    return 0;
                } else {
                    return parseFloat(value);
                }
            }
            
            //Total Quantity For Product Table
            $scope.getTotalQuantity = function() {
                var total = 0;
                var count = vm.AccBillTable.length;
                for (var i = 0; i < count; i++) {
                    var product = vm.AccBillTable[i];
                    total += parseInt(product.qty);
                }
                
                return isNaN(total) ? 0 : total;
            }
            
            $scope.zeroSingleGst = function() {
                $scope.purchaseBill.totalCgstPercentage = 0;
                $scope.purchaseBill.totalSgstPercentage = 0;
                $scope.purchaseBill.totalIgstPercentage = 0;
            }
            
            /* Zero GST when Overall is Arive */
            $scope.zeroGstApply = function() {
                var count = vm.AccBillTable.length;
                for (var i = 0; i < count; i++) {
                    vm.AccBillTable[i].cgstPercentage = 0;
                    vm.AccBillTable[i].sgstPercentage = 0;
                    vm.AccBillTable[i].igstPercentage = 0;
                    $scope.calculateTaxReverse(vm.AccBillTable[i], 0, 0, 0, i);
                }
                //console.log($scope.totalTable_without_expense);
            }
            /* End */
            
            
            //Total Tax For Product Table
            $scope.getTotalTax = function() {
                var total = 0;
                var count = vm.AccBillTable.length;
                var getTotalAmount = 0;
                while (count--) {
                    var product = vm.AccBillTable[count];
                    var totaltax = checkGSTValue(product.cgstPercentage) + checkGSTValue(product.sgstPercentage) + checkGSTValue(product.igstPercentage);
                    
                    if (product.discountType == 'flat') {
                        
                        var getAmount = $filter('setDecimal')((product.price * product.qty) - product.discount, $scope.noOfDecimalPoints);
                    } else {
                        var getAmount = $filter('setDecimal')((product.price * product.qty) - ((product.price * product.qty) * product.discount / 100), $scope.noOfDecimalPoints);
                    }
                    getTotalAmount += getAmount;
                    total += productArrayFactory.calculateTax(getAmount, totaltax, 0);
                }
                
                if ($scope.purchaseBill.overallDiscountType == 'flat') {
                    getTotalAmount = $filter('setDecimal')(getTotalAmount - checkGSTValue($scope.purchaseBill.overallDiscount), $scope.noOfDecimalPoints);
                } else {
                    var discount = $filter('setDecimal')(getTotalAmount * checkGSTValue($scope.purchaseBill.overallDiscount) / 100, $scope.noOfDecimalPoints);
                    getTotalAmount = getTotalAmount - discount;
                }
                
                var totalOverallTax = checkGSTValue($scope.purchaseBill.totalCgstPercentage) + checkGSTValue($scope.purchaseBill.totalSgstPercentage) + checkGSTValue($scope.purchaseBill.totalIgstPercentage);
                
                total += $filter('setDecimal')(getTotalAmount * checkGSTValue(totalOverallTax) / 100, $scope.noOfDecimalPoints);
                if ($scope.csgstDisable) {
                    $scope.purchaseBill.totalCgstAmount = 0;
                    $scope.purchaseBill.totalSgstAmount = 0;
                    $scope.purchaseBill.totalIgstAmount = $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount, $scope.purchaseBill.totalIgstPercentage, 0), $scope.noOfDecimalPoints);
                } else {
                    $scope.purchaseBill.totalCgstAmount = $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount, $scope.purchaseBill.totalCgstPercentage, 0), $scope.noOfDecimalPoints);
                    $scope.purchaseBill.totalSgstAmount = $filter('setDecimal')(productArrayFactory.calculateTax(getTotalAmount, $scope.purchaseBill.totalSgstPercentage, 0), $scope.noOfDecimalPoints);
                    $scope.purchaseBill.totalIgstAmount = 0;
                }
                return total;
            }
            
            $scope.getTotal = function() {
                var total = 0;
                var count = vm.AccBillTable.length;
                while (count--) {
                    var product = vm.AccBillTable[count];
                    total += parseFloat(product.amount);
                }
                
                // if(isNaN($scope.purchaseBill.overallDiscount) || $scope.purchaseBill.overallDiscount === '' || $scope.purchaseBill.overallDiscount == 0){
                // 	return total;
                // }	
                
                if ($scope.purchaseBill.overallDiscountType == 'flat') {
                    total = $filter('setDecimal')(total - checkGSTValue($scope.purchaseBill.overallDiscount), $scope.noOfDecimalPoints);
                } else {
                    var discount = $filter('setDecimal')(total * checkGSTValue($scope.purchaseBill.overallDiscount) / 100, $scope.noOfDecimalPoints);
                    total = total - discount;
                }
                if ($scope.csgstDisable) {
                    var getCgst = 0;
                    var getSgst = 0;
                    var getIgst = checkGSTValue($scope.purchaseBill.totalIgstPercentage);
                } else {
                    var getCgst = checkGSTValue($scope.purchaseBill.totalCgstPercentage);
                    var getSgst = checkGSTValue($scope.purchaseBill.totalSgstPercentage);
                    var getIgst = 0;
                }
                var TaxSum = getCgst + getSgst + getIgst;
                
                var gst = $filter('setDecimal')(total * TaxSum / 100, $scope.noOfDecimalPoints);
                total += gst;
                
                if (!isNaN($scope.purchaseBill.extraCharge) && $scope.purchaseBill.extraCharge != '') {
                    total += parseFloat($scope.purchaseBill.extraCharge);
                }
                return total;
            }
            
            /** Tax Calculation **/
            /** For Exclusive Price **/
            
            $scope.calculateTaxReverse = function(item, cgst, sgst, igst, index) {
                
                var getCgst = checkGSTValue(cgst);
                var getSgst = checkGSTValue(sgst);
                var getIgst = checkGSTValue(igst);
                if ($scope.enableDisableLWHSetting) {
                    var calcQty = getCalcQty(item, $scope.enableDisableLWHArray[index]);
                    vm.AccBillTable[index].stockFt = calcQty;
                    vm.AccBillTable[index].totalFt = $filter('setDecimal')(parseFloat(item.qty) * item.lengthValue * item.widthValue * item.heightValue / parseFloat(item.devideFactor), $scope.noOfDecimalPoints);
                } else {
                    var calcQty = item.qty;
                }
                if (item.discountType == 'flat') {
                    var amount = $filter('setDecimal')((item.price * calcQty) - item.discount, $scope.noOfDecimalPoints);
                } else {
                    var amount = $filter('setDecimal')((item.price * calcQty) - ((item.price * calcQty) * item.discount / 100), $scope.noOfDecimalPoints);
                }
                if ($scope.csgstDisable) {
                    item.cgstAmount = 0;
                    item.sgstAmount = 0;
                    item.igstAmount = $filter('setDecimal')(productArrayFactory.calculateTax(amount, getIgst, 0), $scope.noOfDecimalPoints);
                } else {
                    item.cgstAmount = $filter('setDecimal')(productArrayFactory.calculateTax(amount, getCgst, 0), $scope.noOfDecimalPoints);
                    item.sgstAmount = $filter('setDecimal')(productArrayFactory.calculateTax(amount, getSgst, 0), $scope.noOfDecimalPoints);
                    item.igstAmount = 0;
                }
                if($scope.enableDisableGST){
                    item.amount = $filter('setDecimal')(amount + item.cgstAmount + item.sgstAmount + item.igstAmount, $scope.noOfDecimalPoints);
                }
                else{
                    item.amount = $filter('setDecimal')(amount, $scope.noOfDecimalPoints);
                }
                
                if (!$scope.purchaseBill.EditBillData) {
                    $scope.advanceValueUpdate();
                }
            }
            
            /** END **/
            /** Tax Calculation **/
            /** For Inclusive Price **/
            
            $scope.calculateTaxReverseTwo = function(item, cgst, sgst, igst, index) {
                
                var getCgst = checkGSTValue(cgst);
                var getSgst = checkGSTValue(sgst);
                var getIgst = checkGSTValue(igst);
                var TaxSum = getCgst + getSgst + getIgst;
                if ($scope.enableDisableLWHSetting) {
                    var calcQty = getCalcQty(item, $scope.enableDisableLWHArray[index]);
                    vm.AccBillTable[index].totalFt = $filter('setDecimal')(parseFloat(item.qty) * item.lengthValue * item.widthValue * item.heightValue / parseFloat(item.devideFactor), $scope.noOfDecimalPoints);
                    vm.AccBillTable[index].stockFt = calcQty;
                } else {
                    var calcQty = item.qty;
                }
                vm.AccBillTable[index].price = $filter('setDecimal')(((item.amount) / (1 + (TaxSum / 100))) / parseFloat(calcQty), $scope.noOfDecimalPoints);
                if ($scope.csgstDisable) {
                    vm.AccBillTable[index].cgstAmount = 0;
                    vm.AccBillTable[index].sgstAmount = 0;
                    vm.AccBillTable[index].igstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getIgst / 100, $scope.noOfDecimalPoints);
                } else {
                    vm.AccBillTable[index].cgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getCgst / 100, $scope.noOfDecimalPoints);
                    vm.AccBillTable[index].sgstAmount = $filter('setDecimal')(vm.AccBillTable[index].price * getSgst / 100, $scope.noOfDecimalPoints);
                    vm.AccBillTable[index].igstAmount = 0;
                }
                if (!$scope.purchaseBill.EditBillData) {
                    $scope.advanceValueUpdate();
                }
            }
            
            /** END **/
            
            $scope.advanceValueUpdate = function() {
                
                setTimeout(function() { // wait until all resources loaded 
                    var expenseData;
                    if ($scope.openExpenseRawData) {
                        expenseData = $scope.expenseAmount[$scope.expenseAmount.length - 1];
                    } else {
                        expenseData = $scope.totalTable_without_expense;
                    }
                    
                    $scope.purchaseBill.advance = $filter('setDecimal')(expenseData, 2);
                    $scope.$digest();
                }, 1000);
            }
            
            /* Clear Scan Image Result */
            $scope.countScannedDocumet = 0;
            $scope.clearScannedResult = function() {
                
                if ($scope.countScannedDocumet > 0) {
                    
                    var scanCount = $scope.countScannedDocumet;
                    for (var delIndex = 0; delIndex < scanCount; delIndex++) {
                        
                        formdata.delete('scanFile[' + delIndex + ']');
                    }
                    
                    $scope.countScannedDocumet = 0;
                }
                
            }
            
            /** Check Update Or Insert Bill **/
            $scope.EditAddBill = function(copyData = "") {
                $scope.openedItemizeTree = 0;
                //if(Object.keys(getSetFactory.get()).length){
                if (Object.keys(getSetFactory.get()).length) {
                    
                    var formdata = undefined;
                    formdata = new FormData();
                    
                    $scope.purchaseBill.EditBillData = getSetFactory.get();
                    //console.log($scope.purchaseBill.EditBillData);
                    getSetFactory.blank();
                    
                    $scope.clearScannedResult(); // Clear Scanned Document
                    vm.disableCompany = false;
                    $scope.noOfDecimalPoints = parseInt($scope.purchaseBill.EditBillData.company.noOfDecimalPoints); //decimal points
                    
                    //get Company
                    var companyEditData = $scope.purchaseBill.EditBillData.company; // For Sync call 
                    $scope.displayDefaultCompanyName = companyEditData.companyName;
                    
                    vm.companyDrop = [];
                    apiCall.getCall(apiPath.getAllCompany).then(function(response2) {
                        vm.companyDrop = response2;
                        $scope.purchaseBill.companyDropDown = companyEditData; //Company
                        if (copyData != 'copy') {
                            vm.disableCompany = true;
                        }
                    });
                    
                    //Auto Suggest Product Dropdown data
                    vm.productNameDrop = [];
                    productFactory.getProductByCompany($scope.purchaseBill.EditBillData.company.companyId).then(function(data) {
                        vm.productNameDrop = data;
                        filterProductData();
                    });
                    if (vm.clientNameDropCr.length == 0) {
                        $scope.clientGetAllFunction($scope.purchaseBill.EditBillData.company.companyId);
                    }
                    //EntryDate
                    var getResdate = $scope.purchaseBill.EditBillData.entryDate;
                    var filterDate = getResdate.split("-").reverse().join("-");
                    vm.dt1 = new Date(filterDate);
                    
                    //Bill Number
                    $scope.purchaseBill.billNumber = $scope.purchaseBill.EditBillData.billNumber;
                    
                    //Set Vendor
                    $scope.purchaseBill.ledgerName = $scope.purchaseBill.EditBillData.vendor.ledgerName;
                    $scope.purchaseBill.ledgerEditableData = $scope.purchaseBill.EditBillData.vendor;
                    
                    //Payment Mode
                    $scope.purchaseBill.paymentMode = $scope.purchaseBill.EditBillData.paymentMode;
                    if ($scope.purchaseBill.paymentMode == 'bank' || $scope.purchaseBill.paymentMode == 'card') {
                        $scope.purchaseBill.chequeNo = $scope.purchaseBill.EditBillData.checkNumber;
                        $scope.purchaseBill.BankName = $scope.purchaseBill.EditBillData.bankName;
                        if ($scope.purchaseBill.EditBillData.bankLedgerId != 0) {
                            //Get Bank Ledger of this Company
                            loadBankLedgerOfCompany($scope.purchaseBill.EditBillData.company.companyId, function(responseBank) {
                                $scope.purchaseBill.bankLedgerId = responseBank;
                            }, $scope.purchaseBill.EditBillData.bankLedgerId);
                        }
                    }
                    
                    //Document PNG,JPEG etc.
                    angular.element("input[type='file']").val(null);
                    angular.element(".fileAttachLabel").html('');
                    formdata.delete('file[]');
                    if (copyData != 'copy') {
                        if ($scope.purchaseBill.EditBillData.file[0].documentName != '' && $scope.purchaseBill.EditBillData.file[0].documentName != null) {
                            $scope.purchaseBill.documentData = $scope.purchaseBill.EditBillData.file;
                        }
                    }
                    
                    //Remark
                    $scope.purchaseBill.remark = $scope.purchaseBill.EditBillData.remark;
                    var jsonExpense = angular.fromJson($scope.purchaseBill.EditBillData.expense);
                    if (jsonExpense.length > 0) {
                        $scope.openExpenseRawData = true;
                        vm.AccExpense = angular.copy(jsonExpense);
                    } else {
                        $scope.openExpenseRawData = false;
                        vm.AccExpense = [];
                    }
                    
                    if ($scope.enableDisableAdvanceMou) {
                        if (measurementUnitDropData.length == 0) {
                            loadAdvanceMeasurementUnit(function(advanceRes) {
                                measurementUnitDropData = advanceRes;
                            });
                        }
                    }
                    
                    //Product Array
                    var jsonProduct = angular.fromJson($scope.purchaseBill.EditBillData.productArray);
                    vm.AccBillTable = angular.copy(jsonProduct.inventory);
                    
                    var EditProducArray = angular.copy(jsonProduct.inventory);
                    var count = EditProducArray.length;
                    var d = 0; // For Overcome Duplication 
                    for (var w = 0; w < count; w++) {
                        productFactory.getSingleProduct(EditProducArray[w].productId).then(function(resData) {
                            /** Tax **/
                            vm.AccBillTable[d].productName = resData[$scope.displayProductName] ? resData[$scope.displayProductName] : resData.productName;
                            vm.AccBillTable[d].itemizeDetail = [];
                            if (EditProducArray[d].hasOwnProperty('itemizeDetail')) {
                                if (angular.isArray(EditProducArray[d].itemizeDetail)) {
                                    vm.AccBillTable[d].itemizeDetail = EditProducArray[d].itemizeDetail;
                                } else if (EditProducArray[d].itemizeDetail == '') {
                                    vm.AccBillTable[d].itemizeDetail = [];
                                } else if (angular.isString(EditProducArray[d].itemizeDetail)) {
                                    vm.AccBillTable[d].itemizeDetail = angular.fromJson(EditProducArray[d].itemizeDetail);
                                }
                            }
                            
                            vm.productHsn[d] = resData.hsn;
                            
                            if (!EditProducArray[d].hasOwnProperty('cgstPercentage')) {
                                vm.AccBillTable[d].cgstPercentage = parseFloat(resData.vat);
                                vm.AccBillTable[d].sgstPercentage = parseFloat(resData.additionalTax); // Additional Tax
                                $scope.calculateTaxReverse(vm.AccBillTable[d], vm.AccBillTable[d].cgstPercentage, vm.AccBillTable[d].sgstPercentage, 0, d);
                            }
                            vm.AccBillTable[d].amount = EditProducArray[d].amount;
                            
                            if ($scope.enableDisableAdvanceMou) {
                                var tempIndex = d;
                                vm.measurementUnitDrop[tempIndex] = [];
                                var unitParams = ['highest', 'higher', 'medium', 'mediumLower', 'lower', 'lowest'];
                                for (var i = 0; i < unitParams.length; i++) {
                                    if (i < unitParams.length - 1) {
                                        if (angular.isObject(resData[unitParams[i] + 'MeasurementUnit']) && angular.isDefined(resData[unitParams[i] + 'MeasurementUnit'].measurementUnitId)) {
                                            resData[unitParams[i] + 'MeasurementUnit']['measurementUnit'] = unitParams[i];
                                            vm.measurementUnitDrop[tempIndex].push(resData[unitParams[i] + 'MeasurementUnit']);
                                        }
                                    } else {
                                        if (angular.isObject(resData.measurementUnit) && angular.isDefined(resData.measurementUnit.measurementUnitId)) {
                                            resData.measurementUnit['measurementUnit'] = unitParams[i];
                                            vm.measurementUnitDrop[tempIndex].push(resData.measurementUnit);
                                        }
                                    }
                                }
                                measurementUnitDropData = vm.measurementUnitDrop[tempIndex];
                                
                                if (vm.measurementUnitDrop[tempIndex].length == 0) {
                                    loadAdvanceMeasurementUnit(function(advanceRes) {
                                        measurementUnitDropData = advanceRes;
                                        vm.measurementUnitDrop[tempIndex] = advanceRes;
                                        vm.AccBillTable[tempIndex].measurementUnit = fetchArrayService.myIndexOfObject(advanceRes, vm.AccBillTable[tempIndex].measurementUnit, 'measurementUnitId');
                                    });
                                } else {
                                    vm.measurementUnitDrop[tempIndex] = measurementUnitDropData;
                                    vm.AccBillTable[tempIndex].measurementUnit = fetchArrayService.myIndexOfObject(measurementUnitDropData, vm.AccBillTable[tempIndex].measurementUnit, 'measurementUnitId');
                                }
                            } else if ($scope.enableDisableLWHSetting) {
                                if (angular.isObject(resData.measurementUnit) && angular.isDefined(resData.measurementUnit.measurementUnitId)) {
                                    vm.AccBillTable[d].lengthValue = EditProducArray[d].lengthValue;
                                    vm.AccBillTable[d].widthValue = EditProducArray[d].widthValue;
                                    vm.AccBillTable[d].heightValue = EditProducArray[d].heightValue;
                                    vm.AccBillTable[d].devideFactor = EditProducArray[d].devideFactor;
                                    if (angular.isDefined(EditProducArray[d].devideFactor) &&
                                    !isNaN(parseFloat(EditProducArray[d].devideFactor)) &&
                                    parseFloat(EditProducArray[d].devideFactor) > 0) {
                                        vm.AccBillTable[d].devideFactor = parseFloat(EditProducArray[d].devideFactor);
                                    } else if (angular.isDefined(resData.measurementUnit.devideFactor) &&
                                    !isNaN(parseFloat(resData.measurementUnit.devideFactor)) &&
                                    parseFloat(resData.measurementUnit.devideFactor) > 0) {
                                        vm.AccBillTable[d].devideFactor = parseFloat(resData.measurementUnit.devideFactor);
                                    } else {
                                        vm.AccBillTable[d].devideFactor = 1;
                                    }
                                    $scope.enableDisableLWHArray[d] = {};
                                    $scope.enableDisableLWHArray[d].totalFt = $filter('setDecimal')(parseFloat(EditProducArray[d].lengthValue) * parseFloat(EditProducArray[d].widthValue) * parseFloat(EditProducArray[d].heightValue) * parseFloat(EditProducArray[d].qty) / parseFloat(vm.AccBillTable[d].devideFactor), $scope.noOfDecimalPoints);
                                    if (angular.isDefined(vm.AccBillTable[d].stockFt) || vm.AccBillTable[d].stockFt == 'undefined') {
                                        vm.AccBillTable[d].stockFt = getCalcQty(EditProducArray[d], $scope.enableDisableLWHArray[d]);
                                    } else {
                                        vm.AccBillTable[d].stockFt = EditProducArray[d].stockFt;
                                    }
                                    resData.measurementUnit.lengthStatus == 'enable' ?
                                    $scope.enableDisableLWHArray[d].lengthStatus = true : $scope.enableDisableLWHArray[d].lengthStatus = false;
                                    $scope.enableDisableLWHArray[d].widthStatus = resData.measurementUnit.widthStatus == 'enable' ? true : false;
                                    $scope.enableDisableLWHArray[d].heightStatus = resData.measurementUnit.heightStatus == 'enable' ? true : false;
                                    if ($scope.enableDisableLWHArray[d].lengthStatus &&
                                        $scope.enableDisableLWHArray[d].widthStatus &&
                                        $scope.enableDisableLWHArray[d].heightStatus) {
                                            $scope.enableDisableLWHArray[d].styleObj = {
                                                "width": "33.33%",
                                                "padding-left": "6px",
                                                "padding-right": "6px",
                                                "float": "left"
                                            };
                                        } else if ($scope.enableDisableLWHArray[d].lengthStatus && $scope.enableDisableLWHArray[d].widthStatus ||
                                            $scope.enableDisableLWHArray[d].lengthStatus && $scope.enableDisableLWHArray[d].heightStatus ||
                                            $scope.enableDisableLWHArray[d].heightStatus && $scope.enableDisableLWHArray[d].widthStatus) {
                                                $scope.enableDisableLWHArray[d].styleObj = {
                                                    "width": "50%",
                                                    "padding-left": "6px",
                                                    "padding-right": "6px",
                                                    "float": "left"
                                                };
                                            } else {
                                                $scope.enableDisableLWHArray[d].styleObj = { "width": "100%" };
                                            }
                                            
                                        } else {
                                            $scope.enableDisableLWHArray[d] = {};
                                        }
                                    }
                                    
                                    //$scope.calculateTaxReverseTwo(vm.AccBillTable[d],vm.productTax[d].tax,vm.productTax[d].additionalTax,d);
                                    d++;
                                    /** End **/
                                });
                            }
                            
                            vm.dueDate = '';
                            if ('dueDate' in $scope.purchaseBill.EditBillData) {
                                if ($scope.purchaseBill.EditBillData.dueDate != '' && $scope.purchaseBill.EditBillData.dueDate != null) {
                                    var getDuedate = $scope.purchaseBill.EditBillData.dueDate;
                                    var spliteDuedate = getDuedate.split("-").reverse().join("-");
                                    vm.dueDate = new Date(spliteDuedate);
                                }
                            }
                            
                            // Extracharge,Advance
                            $scope.purchaseBill.extraCharge = $filter('setDecimal')($scope.purchaseBill.EditBillData.extraCharge, $scope.noOfDecimalPoints); //ExtraCharge
                            $scope.purchaseBill.advance = $filter('setDecimal')($scope.purchaseBill.EditBillData.advance, $scope.noOfDecimalPoints); //Advance
                            //Total Discount
                            $scope.purchaseBill.overallDiscountType = $scope.purchaseBill.EditBillData.totalDiscounttype;
                            $scope.purchaseBill.overallDiscount = parseFloat($scope.purchaseBill.EditBillData.totalDiscount) > 0 ? $scope.purchaseBill.EditBillData.totalDiscount : 0;
                            
                            //Total Overall Discount
                            $scope.purchaseBill.totalCgstPercentage = $scope.purchaseBill.EditBillData.totalCgstPercentage > 0 ? $scope.purchaseBill.EditBillData.totalCgstPercentage : 0;
                            $scope.purchaseBill.totalSgstPercentage = $scope.purchaseBill.EditBillData.totalSgstPercentage > 0 ? $scope.purchaseBill.EditBillData.totalSgstPercentage : 0;
                            $scope.purchaseBill.totalIgstPercentage = $scope.purchaseBill.EditBillData.totalIgstPercentage > 0 ? $scope.purchaseBill.EditBillData.totalIgstPercentage : 0;
                            
                            toaster.clear();
                            if (copyData == 'copy') {
                                $scope.purchaseBill.EditBillData = undefined;
                                $scope.changeProductArray = true;
                                $scope.changeProductAdvancePrice = true;
                            }
                        } else {
                            vm.disableCompany = false;
                            vm.dueDate = new Date();
                            $scope.dueDateChange();
                            
                            //get Company
                            vm.companyDrop = [];
                            apiCall.getCall(apiPath.getAllCompany).then(function(response2) {
                                vm.companyDrop = response2;
                                $scope.defaultComapny(); // Set Default Company and Other Data
                            });
                            
                            //vm.AccBillTable = [];
                            vm.AccBillTable = [{ "productId": "", "productName": "", "color": "", "frameNo": "", "discountType": "flat", "price": 0, "discount": "", "qty": 1, "amount": "", "size": "", "variant": "" }];
                            vm.AccExpense = [];
                            vm.productHsn = [];
                            $scope.enableDisableLWHArray = [];
                            if ($scope.enableDisableAdvanceMou) {
                                if (measurementUnitDropData.length == 0) {
                                    loadAdvanceMeasurementUnit(function(advanceRes) {
                                        measurementUnitDropData = advanceRes;
                                        vm.measurementUnitDrop[0] = advanceRes;
                                    });
                                } else {
                                    vm.measurementUnitDrop[0] = measurementUnitDropData;
                                }
                            }
                            $scope.purchaseBill.overallDiscountType = 'flat';
                        }
                    }
                    /** End **/
                    
                    
                    
                    //Change in Product Table
                    $scope.changeProductTable = function() {
                        $scope.changeProductArray = true;
                        $scope.changeProductAdvancePrice = true;
                    }
                    
                    //Change in Product Advance
                    $scope.changeProductAdvance = function() {
                        $scope.changeProductAdvancePrice = true;
                    }
                    
                    //Changed date
                    $scope.changeBillDate = function(Fname) {
                        if (formdata.has(Fname)) {
                            formdata.delete(Fname);
                        }
                        var date = new Date(vm.dt1);
                        var fdate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
                        formdata.set(Fname, fdate);
                    }
                    $scope.dueDateChange = function() {
                        var dueDate = new Date(vm.dueDate);
                        var fdueDate = dueDate.getDate() + '-' + (dueDate.getMonth() + 1) + '-' + dueDate.getFullYear();
                        formdata.set('dueDate', fdueDate);
                    }
                    $scope.changeInBill = function(Fname, value) {
                        if (formdata.has(Fname)) {
                            formdata.delete(Fname);
                        }
                        if (value != "" && value != undefined) {
                            formdata.set(Fname, value);
                        }
                    }
                    
                    $scope.setVenderId = function(Fname, value) {
                        if (value.state.stateAbb == $scope.companyState) {
                            $scope.csgstDisable = false;
                            $scope.igstDisable = true;
                        } else {
                            $scope.csgstDisable = true;
                            $scope.igstDisable = false;
                        }
                        $scope.purchaseBill.ledgerEditableData = {};
                        $scope.purchaseBill.ledgerEditableData = value;
                        if (formdata.has(Fname)) {
                            formdata.delete(Fname);
                        }
                        formdata.set(Fname, value.ledgerId);
                    }
                    
                    $scope.changePaymentInBill = function(Fname, value) {
                        if (formdata.has(Fname)) {
                            formdata.delete(Fname);
                        }
                        formdata.delete('bankName');
                        formdata.delete('checkNumber');
                        formdata.delete('bankLedgerId');
                        
                        if (value != 'bank' && value != 'card') {
                            $scope.purchaseBill.BankName = "";
                            $scope.purchaseBill.chequeNo = "";
                            $scope.purchaseBill.bankLedgerId = "";
                        } else {
                            $scope.purchaseBill.BankName ? formdata.set('bankName', $scope.purchaseBill.BankName) : '';
                            $scope.purchaseBill.chequeNo ? formdata.set('checkNumber', $scope.purchaseBill.chequeNo) : '';
                            $scope.purchaseBill.bankLedgerId ? formdata.set('bankLedgerId', $scope.purchaseBill.bankLedgerId.ledgerId) : '';
                        }
                        formdata.set(Fname, value);
                    }
                    
                    /* End */
                    
                    //Change Invoice Number When Company Changed
                    $scope.changeCompany = function(item) {
                        if (angular.isObject(item)) {
                            // if ($scope.formBill.companyDropDown.$touched) {
                            vm.loadData = true;
                            toaster.clear();
                            toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);
                            
                            $scope.noOfDecimalPoints = parseInt(item.noOfDecimalPoints);
                            
                            //Get Vendors
                            $scope.clientGetAllFunction(item.companyId);
                            $scope.displayDefaultCompanyName = item.companyName;
                            $scope.companyState = item.state.stateAbb;
                            //Auto Suggest Product Dropdown data
                            vm.productNameDrop = [];
                            productFactory.getProductByCompany(item.companyId).then(function(data) {
                                vm.productNameDrop = data;
                                filterProductData();
                                vm.loadData = false;
                                toaster.clear();
                            });
                            
                            //Get Bank Ledger of this Company
                            loadBankLedgerOfCompany(item.companyId, function(responseBank) {
                                
                            });
                            
                            vm.AccBillTable = [{ "productId": "", "productName": "", "color": "", "frameNo": "", "discountType": "flat", "price": 0, "discount": "", "qty": 1, "amount": "", "size": "", "variant": "" }];
                            vm.productHsn = [];
                            $scope.enableDisableLWHArray = [];
                            $scope.purchaseBill.advance = 0;
                            
                            $scope.printButtonType = item.printType == '' ? 'print' : item.printType;
                            
                            formdata.delete('companyId');
                            formdata.set('companyId', item.companyId);
                        }
                    }
                    
                    $scope.disableButton = false;
                    
                    $scope.pop = function(generate) {
                        $scope.disableButton = true;
                        
                        if ($scope.purchaseBill.EditBillData) {
                            
                            formdata.delete('companyId');
                            
                            toaster.clear();
                            toaster.pop('wait', 'Please Wait', 'Data Updating....', 600000);
                            
                            var BillPath = apiPath.postPurchaseBill + '/' + $scope.purchaseBill.EditBillData.purchaseId;
                            if ($scope.changeProductArray) {
                                formdata.set('balance', $scope.purchaseBill.balanceTable);
                                formdata.set('grandTotal', $scope.grandTotalTable);
                                $scope.purchaseBill.advance ? formdata.set('advance', $scope.purchaseBill.advance) : formdata.set('advance', 0);
                                
                                formdata.set('total', $scope.totalTable);
                                formdata.set('tax', $scope.purchaseBill.tax);
                                
                                formdata.delete('extraCharge');
                                
                                $scope.purchaseBill.extraCharge ? formdata.set('extraCharge', $scope.purchaseBill.extraCharge) : formdata.set('extraCharge', 0);
                                
                                formdata.delete('totalDiscounttype');
                                formdata.delete('totalDiscount');
                                
                                $scope.purchaseBill.overallDiscountType ? formdata.set('totalDiscounttype', $scope.purchaseBill.overallDiscountType) : formdata.set('totalDiscounttype', 'flat');
                                $scope.purchaseBill.overallDiscount ? formdata.set('totalDiscount', $scope.purchaseBill.overallDiscount) : formdata.set('totalDiscount', 0);
                                
                                formdata.set('totalCgstPercentage', checkGSTValue($scope.purchaseBill.totalCgstPercentage));
                                formdata.set('totalSgstPercentage', checkGSTValue($scope.purchaseBill.totalSgstPercentage));
                                formdata.set('totalIgstPercentage', checkGSTValue($scope.purchaseBill.totalIgstPercentage));
                            }
                        } else {
                            toaster.clear();
                            toaster.pop('wait', 'Please Wait', 'Data Inserting....', 600000);
                            
                            var date = new Date(vm.dt1);
                            var fdate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
                            
                            if (!formdata.has('companyId')) {
                                formdata.set('companyId', $scope.purchaseBill.companyDropDown.companyId);
                            }
                            if (!formdata.has('vendorId')) {
                                formdata.set('vendorId', $scope.purchaseBill.ledgerEditableData.ledgerId);
                            }
                            
                            !formdata.has('billNumber') ? formdata.set('billNumber', $scope.purchaseBill.billNumber) : '';
                            
                            if (!formdata.has('entryDate')) {
                                formdata.set('entryDate', fdate);
                            }
                            
                            formdata.set('transactionDate', fdate);
                            
                            if (!formdata.has('paymentMode')) {
                                formdata.set('paymentMode', $scope.purchaseBill.paymentMode);
                            }
                            
                            formdata.set('grandTotal', $scope.grandTotalTable);
                            // console.log($scope.purchaseBill.advance);
                            if ($scope.purchaseBill.advance) {
                                
                                formdata.set('advance', $scope.purchaseBill.advance);
                            } else {
                                
                                formdata.set('advance', 0);
                            }
                            
                            formdata.set('balance', $scope.purchaseBill.balanceTable);
                            
                            var BillPath = apiPath.postPurchaseBill;
                            
                            
                            formdata.set('total', $scope.totalTable);
                            formdata.set('tax', $scope.purchaseBill.tax);
                            
                            formdata.delete('totalDiscounttype');
                            formdata.delete('totalDiscount');
                            
                            $scope.purchaseBill.overallDiscountType ? formdata.set('totalDiscounttype', $scope.purchaseBill.overallDiscountType) : formdata.set('totalDiscounttype', 'flat');
                            $scope.purchaseBill.overallDiscount ? formdata.set('totalDiscount', $scope.purchaseBill.overallDiscount) : formdata.set('totalDiscount', 0);
                            
                            formdata.set('totalCgstPercentage', checkGSTValue($scope.purchaseBill.totalCgstPercentage));
                            formdata.set('totalSgstPercentage', checkGSTValue($scope.purchaseBill.totalSgstPercentage));
                            formdata.set('totalIgstPercentage', checkGSTValue($scope.purchaseBill.totalIgstPercentage));
                            
                            if ($scope.purchaseBill.extraCharge) {
                                
                                formdata.delete('extraCharge');
                                formdata.set('extraCharge', $scope.purchaseBill.extraCharge);
                            } else {
                                formdata.delete('extraCharge');
                                formdata.set('extraCharge', 0);
                            }
                            
                            formdata.delete('isDisplay');
                            formdata.set('isDisplay', 'yes');
                        }
                        
                        if ($scope.changeProductArray) {
                            
                            var date = new Date();
                            var tdate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
                            if (!formdata.has('transactionDate')) {
                                formdata.set('transactionDate', tdate);
                            }
                            
                            //Inventory
                            var json2 = angular.copy(vm.AccBillTable);
                            for (var i = 0; i < json2.length; i++) {
                                angular.forEach(json2[i], function(value, key) {
                                    var setData = value;
                                    if (key == 'measurementUnit') {
                                        if (angular.isObject(value)) {
                                            setData = value.measurementUnitId;
                                        }
                                    }
                                    if (key == 'itemizeDetail') {
                                        setData = JSON.stringify(value);
                                    }
                                    formdata.set('inventory[' + i + '][' + key + ']', setData);
                                });
                            }
                            if (vm.AccExpense.length > 0) {
                                if (vm.AccExpense[0].expenseValue != 0) {
                                    //copy expense data
                                    var json3 = angular.copy(vm.AccExpense);
                                    
                                    for (var i = 0; i < json3.length; i++) {
                                        
                                        angular.forEach(json3[i], function(value, key) {
                                            
                                            formdata.set('expense[' + i + '][' + key + ']', value);
                                        });
                                    }
                                }
                            }
                        }
                        
                        formdata.delete('transactionType');
                        formdata.set('transactionType', 'purchase_tax');
                        
                        var headerData = { 'Content-Type': undefined };
                        if ($scope.purchaseType == 'purchaseOrder') {
                            headerData.isPurchaseOrder = "ok";
                        }
                        
                        apiCall.postCallHeader(BillPath, headerData, formdata).then(function(data) {
                            
                            toaster.clear();
                            
                            //Delete Inventory Data From Formdata Object
                            var json3 = angular.copy(vm.AccBillTable);
                            for (var i = 0; i < json3.length; i++) {
                                angular.forEach(json3[i], function(value, key) {
                                    formdata.delete('inventory[' + i + '][' + key + ']');
                                });
                            }
                            
                            var json4 = angular.copy(vm.AccExpense);
                            for (var i = 0; i < json4.length; i++) {
                                angular.forEach(json4[i], function(value, key) {
                                    formdata.delete('expense[' + i + '][' + key + ']');
                                });
                            }
                            
                            
                            
                            if (!$scope.purchaseBill.EditBillData) {
                                formdata.delete('entryDate');
                            }
                            formdata.delete('transactionDate');
                            formdata.delete('total');
                            formdata.delete('tax');
                            formdata.delete('grandTotal');
                            formdata.delete('advance');
                            formdata.delete('balance');
                            formdata.delete('labourCharge');
                            formdata.delete('isDisplay');
                            
                            if (data == apiResponse.ok) {
                                
                                if ($scope.purchaseBill.EditBillData) {
                                    toaster.pop('success', 'Title', 'Update Successfully');
                                } else {
                                    toaster.pop('success', 'Title', 'Insert Successfully');
                                }
                                
                                $scope.disableButton = false;
                                angular.element("input[type='file']").val(null);
                                angular.element(".fileAttachLabel").html('');
                                formdata.delete('file[]');
                                formdata.delete('companyId');
                                formdata.delete('billNumber');
                                formdata.delete('paymentMode');
                                formdata.delete('bankName');
                                formdata.delete('checkNumber');
                                formdata.delete('remark');
                                
                                $scope.clearScannedResult();
                                
                                var companyObject = $scope.purchaseBill.companyDropDown;
                                $scope.purchaseBill = [];
                                vm.dt1 = new Date();
                                vm.dueDate = new Date();
                                $scope.dueDateChange();
                                $scope.openExpenseRawData = false;
                                vm.AccBillTable = [{ "productId": "", "productName": "", "color": "", "frameNo": "", "discountType": "flat", "price": 0, "discount": "", "qty": 1, "amount": "", "size": "", "variant": "" }];
                                vm.AccExpense = [];
                                
                                vm.productHsn = [];
                                $scope.enableDisableLWHArray = [];
                                //vm.cityDrop = [];
                                
                                $scope.changeProductArray = false;
                                $scope.changeProductAdvancePrice = false;
                                vm.disableCompany = false;
                                
                                $scope.ReloadAfterSave(companyObject);
                                
                                $scope.purchaseBill.paymentMode = 'cash';
                                
                                $anchorScroll();
                                $("#contactNoSelect").focus();
                            } else {
                                toaster.clear();
                                if (apiResponse.noContent == data) {
                                    
                                    toaster.pop('warning', 'Opps!!', 'Field Not Change');
                                } else if (data.status == 500) {
                                    toaster.pop('warning', 'Something Wrong', data.statusText);
                                } else if (data.status == 0) {
                                    toaster.pop('info', 'Check Your Internet Connection');
                                } else {
                                    toaster.pop('warning', 'Something Wrong', data);
                                }
                                $scope.disableButton = false;
                            }
                        }).catch(function(reason) {
                            if (reason.status === 500) {
                                console.log('Encountered server error');
                            }
                        });
                    }
                    
                    $scope.cancel = function(copyData = "") {
                        
                        if (copyData == 'copy') {
                            var CopyBillData = $scope.purchaseBill.EditBillData;
                        }
                        
                        $scope.purchaseBill = [];
                        $scope.disableButton = false;
                        $scope.openExpenseRawData = false;
                        var formdata = undefined;
                        formdata = new FormData();
                        
                        angular.element("input[type='file']").val(null);
                        angular.element(".fileAttachLabel").html('');
                        formdata.delete('file[]');
                        
                        //Delete Inventory Data From Formdata Object
                        var json3 = angular.copy(vm.AccBillTable);
                        for (var i = 0; i < json3.length; i++) {
                            angular.forEach(json3[i], function(value, key) {
                                formdata.delete('inventory[' + i + '][' + key + ']');
                            });
                        }
                        
                        formdata.delete('entryDate');
                        formdata.delete('billNumber');
                        formdata.delete('transactionDate');
                        formdata.delete('total');
                        formdata.delete('tax');
                        formdata.delete('grandTotal');
                        formdata.delete('advance');
                        formdata.delete('balance');
                        formdata.delete('labourCharge');
                        formdata.delete('isDisplay');
                        formdata.delete('companyId');
                        formdata.delete('paymentMode');
                        formdata.delete('bankName');
                        formdata.delete('checkNumber');
                        formdata.delete('remark');
                        
                        $scope.clearScannedResult();
                        
                        vm.dt1 = new Date();
                        vm.dueDate = new Date();
                        $scope.dueDateChange();
                        vm.AccBillTable = [{ "productId": "", "productName": "", "color": "", "frameNo": "", "discountType": "flat", "price": 0, "discount": "", "qty": 1, "amount": "", "size": "", "variant": "" }];
                        vm.AccExpense = [];
                        vm.productHsn = [];
                        $scope.enableDisableLWHArray = [];
                        $scope.purchaseBill.overallDiscountType = 'flat';
                        $scope.changeProductArray = false;
                        $scope.changeProductAdvancePrice = false;
                        vm.disableCompany = false;
                        
                        if (copyData == 'copy') {
                            getSetFactory.set(CopyBillData);
                            $scope.EditAddBill('copy');
                        } else {
                            $scope.defaultComapny();
                            $scope.purchaseBill.paymentMode = 'cash';
                        }
                        $("#contactNoSelect").focus();
                        $anchorScroll();
                    }
                    
                    $scope.scannedImageSaveToFormData = function(url, callback) {
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
                    
                    //Set Multiple File In Formdata On Change
                    $scope.uploadFile = function(files) {
                        
                        var flag = 0;
                        for (var m = 0; m < files.length; m++) {
                            if (parseInt(files[m].size) > maxImageSize) {
                                flag = 1;
                                toaster.clear();
                                //toaster.pop('alert','Image Size is Too Long','');
                                toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
                                formdata.delete('file[]');
                                angular.element("input[type='file']").val(null);
                                angular.element(".fileAttachLabel").html('');
                                break;
                            }
                        }
                        
                        if (flag == 0) {
                            formdata.delete('file[]');
                            angular.forEach(files, function(value, key) {
                                formdata.set('file[]', value);
                            });
                        }
                    };
                    
                    /** Next Previews **/
                    $scope.goToNextPrevious = function(nextPre) {
                        $scope.openedItemizeTree = 0;
                        toaster.clear();
                        if ($scope.purchaseBill.companyDropDown) {
                            
                            //Code Start
                            toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);
                            var formdata = new FormData();
                            var preHeaderData = { 'Content-Type': undefined, 'companyId': $scope.purchaseBill.companyDropDown.companyId };
                            if ($scope.purchaseType == 'purchaseOrder') {
                                preHeaderData.isPurchaseOrder = "ok";
                            }
                            var Path = apiPath.postPurchaseBill;
                            
                            if (nextPre == "first" || nextPre == "last") {
                                preHeaderData.operation = nextPre;
                            } else {
                                if ($scope.purchaseBill.EditBillData) {
                                    if (nextPre == 'next') {
                                        preHeaderData.nextPurchaseId = $scope.purchaseBill.EditBillData.purchaseId;
                                    } else {
                                        preHeaderData.previousPurchaseId = $scope.purchaseBill.EditBillData.purchaseId;
                                    }
                                } else {
                                    if (nextPre == 'next') {
                                        preHeaderData.nextPurchaseId = 0;
                                    } else {
                                        preHeaderData.previousPurchaseId = 0;
                                    }
                                }
                            }
                            
                            apiCall.getCallHeader(Path, preHeaderData).then(function(response) {
                                if (angular.isArray(response)) {
                                    $scope.purchaseBill = [];
                                    getSetFactory.set(response[0]);
                                    $scope.EditAddBill();
                                    $anchorScroll();
                                } else {
                                    if (apiResponse.noContent == response) {
                                        toaster.clear();
                                        toaster.pop('warning', 'Opps!!', 'Data Not Available');
                                    } else if (response.status == 500) {
                                        toaster.clear();
                                        toaster.pop('warning', 'Something Wrong', response.statusText);
                                    } else {
                                        toaster.clear();
                                        toaster.pop('warning', 'Something Wrong', response);
                                    }
                                }
                            })
                            //End
                        } else {
                            toaster.pop('info', 'please Select Company', '');
                        }
                    }
                    /** End **/
                    
                    /** Delete Bill **/
                    $scope.deleteBill = function(size) {
                        toaster.clear();
                        if (Modalopened) return;
                        
                        var modalInstance = $modal.open({
                            templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
                            controller: deleteDataModalController,
                            size: size
                        });
                        
                        Modalopened = true;
                        
                        modalInstance.result.then(function() {
                            
                            var id = $scope.purchaseBill.EditBillData.purchaseId;
                            
                            /**Delete Code **/
                            var deletePath = apiPath.postPurchaseBill + '/' + id;
                            
                            apiCall.deleteCall(deletePath).then(function(deleteres) {
                                
                                if (apiResponse.ok == deleteres) {
                                    
                                    $scope.cancel();
                                    toaster.pop('success', 'Title', 'Data Successfully Deleted');
                                } else {
                                    toaster.pop('warning', '', deleteres);
                                }
                            });
                            
                            /** End **/
                            Modalopened = false;
                            
                        }, function() {
                            Modalopened = false;
                        });
                    }
                    
                    /** End Delete Bill **/
                    
                    /** Invoice **/
                    $scope.goInvoiceNumber = function() {
                        
                        toaster.clear();
                        if ($scope.purchaseBill.searchInvoiceNumber == '' || angular.isUndefined($scope.purchaseBill.searchInvoiceNumber)) {
                            toaster.pop('error', 'Search Box in Blank');
                            return false;
                        }
                        
                        toaster.pop('wait', 'Please Wait', 'Searching...', 600000);
                        var BillPath = apiPath.PurchaseBillByCompany + $scope.purchaseBill.companyDropDown.companyId;
                        var preHeaderData = { 'Content-Type': undefined, 'billNumber': $scope.purchaseBill.searchInvoiceNumber };
                        if ($scope.purchaseType == 'purchaseOrder') {
                            preHeaderData.isPurchaseOrder = "ok";
                        }
                        
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
                                if (apiResponse.noContent == response || apiResponse.notFound == response) {
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
                    }
                    /** End **/
                    
                    // Datepicker
                    // ----------------------------------- 
                    this.minStart = new Date();
                    
                    this.today = function() {
                        this.dt1 = new Date();
                    };
                    
                    if (!$scope.purchaseBill.EditBillData) {
                        this.today();
                    }
                    
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
                        this.ismeridian = !this.ismeridian;
                    };
                    
                    this.update = function() {
                        var d = new Date();
                        d.setHours(14);
                        d.setMinutes(0);
                        this.mytime = d;
                    };
                    
                    this.changed = function() {
                        console.log('Time changed to: ' + this.mytime);
                    };
                    
                    this.clear = function() {
                        //this.mytime = null;
                    };
                    
                    //default value
                    this.test1 = new Date();
                    
                    /** Product Redirect Edit Start **/
                    $scope.editProductWithRedirect = function(index) {
                        
                        getSetFactory.blank();
                        var id = vm.AccBillTable[index].productId;
                        
                        productFactory.getSingleProduct(id).then(function(response) {
                            getSetFactory.set(response);
                            $scope.openProduct('lg', index);
                        });
                    }
                    /** Product Redirect Edit **/
                    
                    $scope.purchaseBill.ledgerEditableData = {};
                    /** Ledger Redirect Edit Start **/
                    $scope.editLedgerWithRedirect = function() {
                        
                        getSetFactory.blank();
                        if ($scope.getLength($scope.purchaseBill.ledgerEditableData) > 0) {
                            getSetFactory.set($scope.purchaseBill.ledgerEditableData);
                            $scope.openLedger('lg');
                        }
                    }
                    
                    $scope.getLength = function(obj) {
                        return Object.keys(obj).length;
                    }
                    /** Ledger Redirect Edit **/
                    
                    /* Ledger Model Start */
                    $scope.openLedger = function(size, index = 'purchaseBill') {
                        
                        if (Modalopened) return;
                        
                        if ($scope.purchaseBill.companyDropDown) {
                            
                            var modalInstance = $modal.open({
                                templateUrl: 'app/views/PopupModal/Accounting/ledgerModal.html',
                                controller: AccLedgerModalController,
                                size: size,
                                resolve: {
                                    ledgerIndex: function() {
                                        return index;
                                    },
                                    companyId: function() {
                                        return $scope.purchaseBill.companyDropDown;
                                    }
                                }
                            });
                            
                            Modalopened = true;
                            
                            var state = $('#modal-state');
                            modalInstance.result.then(function(data) {
                                //$scope.clientGetAllFunction(data.index.company_id,data.index.ledger_id);
                                if (data.index.hasOwnProperty('getSetLedgerId')) {
                                    var ledId = data.index.getSetLedgerId;
                                    var ledName = data.index.ledgerName;
                                    $scope.purchaseBill.ledgerEditableData = {};
                                } else {
                                    var ledId = data.index.ledger_id;
                                    var ledName = data.index.ledger_name;
                                }
                                $scope.clientGetAllFunction($scope.purchaseBill.companyDropDown.companyId, ledId);
                                formdata.delete('vendorId');
                                formdata.set('vendorId', ledId);
                                $scope.purchaseBill.ledgerName = ledName;
                                
                                Modalopened = false;
                                
                            }, function(data) {
                                
                                Modalopened = false;
                            });
                        } else {
                            
                            alert('Please Select Company');
                        }
                    }
                    /* Ledger Model End */
                    
                    /** Product Model Start **/
                    $scope.openProduct = function(size, index) {
                        
                        if (Modalopened) return;
                        
                        toaster.pop('wait', 'Please Wait', 'popup opening....', 600000);
                        
                        if ($scope.purchaseBill.companyDropDown) {
                            
                            var modalInstance = $modal.open({
                                templateUrl: 'app/views/PopupModal/Accounting/productModal.html',
                                controller: 'AccProductModalController as form',
                                size: size,
                                resolve: {
                                    productIndex: function() {
                                        return index;
                                    },
                                    companyId: function() {
                                        return $scope.purchaseBill.companyDropDown;
                                    }
                                }
                            });
                            
                            Modalopened = true;
                            
                            modalInstance.opened.then(function() {
                                toaster.clear();
                            });
                            
                            modalInstance.result.then(function(data) {
                                
                                toaster.clear();
                                toaster.pop('wait', 'Please Wait', 'Data Loading....', 600000);
                                
                                var companyID = data.companyId;
                                var productIndex = data.index;
                                
                                if (data.hasOwnProperty('productId')) {
                                    var productID = data.productId;
                                    
                                    productFactory.setUpdatedProduct(productID).then(function(response) {
                                        if (angular.isObject(response)) {
                                            productFactory.getProductByCompany(companyID).then(function(responseCompayWise) {
                                                vm.productNameDrop = responseCompayWise;
                                                filterProductData();
                                                vm.AccBillTable[data.index].productName = response.productName;
                                                $scope.setProductData(response, productIndex);
                                                toaster.clear();
                                            });
                                        } else {
                                            toaster.pop('warning', response);
                                        }
                                    });
                                } else {
                                    var productName = data.productName;
                                    var color = data.color == undefined ? 'XX' : data.color;
                                    var size = data.size == undefined ? 'ZZ' : data.size;
                                    var variant = data.variant == undefined ? 'YY' : data.variant;
                                    
                                    productFactory.setNewProduct(companyID, productName, color, size, variant).then(function(response) {
                                        if (angular.isObject(response)) {
                                            productFactory.getProductByCompany(companyID).then(function(responseCompayWise) {
                                                vm.productNameDrop = responseCompayWise;
                                                filterProductData();
                                                vm.AccBillTable[data.index].productName = response.productName;
                                                $scope.setProductData(response, productIndex);
                                                toaster.clear();
                                            });
                                        } else {
                                            toaster.pop('warning', response);
                                        }
                                    });
                                }
                                
                                Modalopened = false;
                                
                            }, function() {
                                Modalopened = false;
                            });
                        } else {
                            alert('Please Select Company');
                        }
                    };
                    /** Product Model End **/
                    /** Barcode Modal Start **/
                    $scope.openBarcodeModal = function(size, index) {
                        if (Modalopened) return;
                        toaster.pop('wait', 'Please Wait', 'popup opening....', 600000);
                        var selectedProduct = vm.AccBillTable[index];
                        var modalInstance = $modal.open({
                            templateUrl: 'app/views/PopupModal/Accounting/barcodeModal.html',
                            controller: 'AccBarcodeModalController as form',
                            size: size,
                            resolve: {
                                productIndex: function() {
                                    return index;
                                },
                                productData: function() {
                                    return selectedProduct;
                                },
                                companyId: function() {
                                    return $scope.purchaseBill.companyDropDown;
                                },
                                transactionType: function() {
                                    return 'purchase';
                                }
                            }
                        });
                        Modalopened = true;
                        
                        modalInstance.opened.then(function() {
                            toaster.clear();
                        });
                        modalInstance.result.then(function(data) {
                            vm.AccBillTable[index].itemizeDetail = data;
                            $scope.changeProductArray = true;
                            Modalopened = false;
                        }, function() {
                            Modalopened = false;
                        });
                    }
                    /**
                    Barcode Modal End
                    **/
                    
                    $scope.openScanPopup = function(imageUrl) {
                        
                        $templateCache.remove('http://' + window.location.host + '/front-end/app/views/QuickMenu/DocumentScan/DWT_Upload_Download_Demo.html');
                        
                        if (Modalopened) return;
                        
                        toaster.pop('wait', 'Please Wait', 'popup opening....', 600000);
                        
                        var modalInstance = $modal.open({
                            templateUrl: 'app/views/QuickMenu/DocumentScan/DWT_Upload_Download_Demo.html?buster=' + Math.random(),
                            controller: documentScanController,
                            size: 'lg',
                            resolve: {
                                imageUrl: function() {
                                    return imageUrl;
                                }
                            }
                            // preserveScope: true
                        });
                        
                        Modalopened = true;
                        
                        modalInstance.opened.then(function() {
                            toaster.clear();
                        });
                        
                        modalInstance.result.then(function(data) {
                            
                            if (data.length > 0) {
                                
                                $scope.countScannedDocumet = data.length;
                                
                                var CountImg = data.length;
                                var srNo = 0;
                                
                                for (var ImgIndex = 0; ImgIndex < CountImg; ImgIndex++) {
                                    
                                    var noIndex = ImgIndex;
                                    var ImgResponse = data[noIndex];
                                    formdata.set("scanFile[" + srNo + "]", ImgResponse);
                                    srNo++;
                                }
                                toaster.pop('success', data.length + ' Document Scanned', '');
                            }
                            Modalopened = false;
                            
                        }, function(data) {
                            if (data == "clear") {
                                $scope.clearScannedResult();
                                toaster.pop('info', 'Documents Clear', '');
                                // DWObject.RemoveAllImages();
                            }
                            Modalopened = false;
                        });
                        
                    }
                    
                    $scope.SetBarcodData = function(Bcode) {
                        var proBarcode = Bcode;
                        
                        var headerSearch = { 'Content-Type': undefined, 'productCode': proBarcode };
                        
                        apiCall.getCallHeader(apiPath.getAllProduct, headerSearch).then(function(response) {
                            
                            var companyId = $scope.purchaseBill.companyDropDown.companyId;
                            
                            /** Inner Loop **/
                            /** Check Product is Already in Array or not **/
                            var checkFlag = 0;
                            var cnt = vm.AccBillTable.length;
                            for (var m = 0; m < cnt; m++) {
                                
                                var arrayData = vm.AccBillTable[m];
                                
                                if (companyId == response.company.companyId) {
                                    
                                    if (arrayData.productId == response.productId) {
                                        toaster.clear();
                                        toaster.pop('info', 'Product Already Selected', '');
                                        
                                        checkFlag = 1;
                                        //console.log(arrayData);
                                        break;
                                    }
                                } else {
                                    
                                    toaster.clear();
                                    toaster.pop('info', 'Product has Diffrent Company', '');
                                    checkFlag = 1;
                                    break;
                                }
                                
                            }
                            /** End Check Product **/
                            if (checkFlag == 0) {
                                
                                var barcodeflag = 0;
                                var checkCnt = vm.AccBillTable.length;
                                for (var cVar = 0; cVar < checkCnt; cVar++) {
                                    
                                    var arrayData = vm.AccBillTable[cVar];
                                    
                                    if (arrayData.productId == "") {
                                        
                                        vm.AccBillTable[cVar].productName = response.productName;
                                        //vm.AccBillTable[data.index].productId = response.productId;
                                        
                                        $scope.setProductData(response, cVar);
                                        toaster.clear();
                                        toaster.pop('success', 'Barcode Scanned', '');
                                        
                                        barcodeflag = 1;
                                        //console.log(arrayData);
                                        break;
                                    }
                                }
                                
                                var nextindex = parseInt(cnt) - 1;
                                if (barcodeflag == 0) {
                                    
                                    $scope.addRow(nextindex);
                                    var fatIndex = nextindex + 1;
                                    vm.AccBillTable[fatIndex].productName = response.productName;
                                    
                                    $scope.setProductData(response, fatIndex);
                                    toaster.clear();
                                    toaster.pop('success', 'Barcode Scanned', '');
                                    
                                    $scope.$digest();
                                }
                            }
                            /** End loop **/
                            
                        });
                        //End Api
                    }
                    
                    $scope.presssuburb = function(event) {
                        if (event.target.value.length == 14) {
                            $scope.SetBarcodData(event.target.value);
                        }
                    }
                    
                    $scope.DWT_AcquireImage = function() {
                        
                        scanner.scan(displayImagesOnPage, {
                            "use_asprise_dialog": false, // Whether to use Asprise Scanning Dialog
                            "show_scanner_ui": false,
                            "output_settings": [{
                                "type": "return-base64",
                                "format": "jpg",
                                "jpeg_quality": "80"
                            }]
                        });
                        
                        // var DWObject = $window.Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
                        
                        // 	 DWObject.RemoveAllImages();
                        //           // var DWObject = Dynamsoft.WebTwainEnv;
                        // //DWObject.IfDisableSourceAfterAcquire = true; 
                        //    var bSelected = DWObject.SelectSource();
                        
                        // 	if(bSelected){
                        // 			DWObject.OpenSource();
                        // 			DWObject.IfShowUI = false;
                        // 			// DWObject.IfFeederEnabled = true;
                        
                        // 			// DWObject.IfAutoFeed = true;
                        
                        // 		 DWObject.XferCount = -1;
                        // 		//DWObject.PageSize = EnumDWT_CapSupportedSizes.TWSS_USLEGAL;
                        // 		// DWObject.Unit = EnumDWT_UnitType.TWUN_INCHES;
                        // 		//DWObject.SetImageLayout(0, 0, 5, 5);
                        // 		 DWObject.AcquireImage(); //using ADF  for scanning
                        
                        // 			DWObject.IfShowFileDialog = false;
                        
                        // 			 if (DWObject.ErrorCode != 0) {  
                        // 				 alert (DWObject.ErrorString);
                        // 			 }
                        
                        // 			DWObject.RegisterEvent("OnPostAllTransfers", function () {
                        // 				var imageUrl = DWObject.GetImageURL(0);
                        // 				if(imageUrl != ''){
                        // 					$scope.openScanPopup(imageUrl);
                        // 				}
                        // 			 });
                        // 	}
                    }
                    
                    /** Processes the scan result */
                    function displayImagesOnPage(successful, mesg, response) {
                        if (!successful) { // On error
                            console.error('Failed: ' + mesg);
                            return;
                        }
                        
                        if (successful && mesg != null && mesg.toLowerCase().indexOf('user cancel') >= 0) { // User cancelled.
                            console.info('User cancelled');
                            return;
                        }
                        
                        var scannedImages = scanner.getScannedImages(response, true, false); // returns an array of ScannedImage
                        for (var i = 0;
                            (scannedImages instanceof Array) && i < scannedImages.length; i++) {
                                var scannedImage = scannedImages[i];
                                processScannedImage(scannedImage);
                            }
                        }
                        
                        /** Images scanned so far. */
                        var imagesScanned = [];
                        
                        /** Processes a ScannedImage */
                        function processScannedImage(scannedImage) {
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
                            for (var n = 0; n < imageContent.length; n++) {
                                view[n] = imageContent.charCodeAt(n);
                            }
                            
                            // convert ArrayBuffer to Blob
                            var blob = new Blob([buffer], { type: type });
                            
                            return blob;
                        }
                        
                        /** History Modal **/
                        
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
                                    }
                                }
                            });
                            
                            Modalopened = true;
                            modalInstance.opened.then(function() {
                                toaster.clear();
                            });
                            modalInstance.result.then(function() {
                                toaster.clear();
                                Modalopened = false;
                                // getSetFactory.set(singleData);
                                $scope.EditAddBill();
                                $anchorScroll();
                            }, function() {
                                toaster.clear();
                                Modalopened = false;
                            });
                        };
                        /** End History Modal **/
                        
                        $scope.openInNextTab = function(url) {
                            $window.open(url, '_blank');
                        }
                        
                        $scope.documentDelete = function(item) {
                            //alert('here');
                            item.ShowConfirm == true ? item.ShowConfirm = false : item.ShowConfirm = true;
                        }
                        
                        $scope.documentDeleteConfirm = function(item, index) {
                            
                            var documentID = item.documentId;
                            
                            if (documentID == '' || documentID == null || documentID == undefined) {
                                toaster.pop('error', 'Document Not Found');
                                return false;
                            }
                            
                            var headerData = { 'Content-Type': undefined, 'type': 'purchase-bill' };
                            
                            apiCall.deleteCallHeader(apiPath.documentDelete + documentID, headerData).then(function(response) {
                                if (response == apiResponse.ok) {
                                    toaster.pop('success', 'Document Successfully Deleted');
                                    $scope.purchaseBill.documentData.splice(index, 1);
                                } else {
                                    toaster.pop('warning', response);
                                }
                            });
                        }
                        
                        $scope.itemizeTreeIcon = function(index) {
                            if (index == $scope.openedItemizeTree) {
                                return 'fa-minus-circle';
                            } else {
                                return 'fa-plus-circle';
                            }
                        }
                        $scope.openedItemizeTreeClass = function(index) {
                            if (index == $scope.openedItemizeTree) {
                                return '';
                            } else {
                                return 'hidden';
                            }
                        }
                        $scope.expandItemizeTree = function(index) {
                            if (index == $scope.openedItemizeTree) {
                                $scope.openedItemizeTree = 0;
                            } else {
                                $scope.openedItemizeTree = index;
                            }
                        }
                        $scope.getCurrentFinancialYear = function() {
                            var fiscalyear = "";
                            var today = new Date();
                            if ((today.getMonth() + 1) <= 3) {
                                fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
                            } else {
                                fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
                            }
                            return fiscalyear
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
                            var classes = document.getElementsByClassName('productNameClass');
                            control.makeTransliteratable(classes);
                        }
                    }
                    PurchaseBillController.$inject = ["$rootScope", "$scope", "apiCall", "apiPath", "$http", "$window", "$modal", "purchaseType", "validationMessage", "productArrayFactory", "getSetFactory", "toaster", "apiResponse", "$anchorScroll", "maxImageSize", "$sce", "$templateCache", "getLatestNumber", "productFactory", "$filter", "$state", "fetchArrayService", "bankFactory"];