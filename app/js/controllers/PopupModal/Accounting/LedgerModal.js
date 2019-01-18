
/**=========================================================
 * Module: AccLedgerModalController.js
 * Controller for input components
 =========================================================*/

App.controller('AccLedgerModalController', AccLedgerModalController);

function AccLedgerModalController($rootScope,$scope, $modalInstance,apiCall,apiPath,ledgerIndex,companyId,validationMessage,stateCityFactory,getSetFactory,apiResponse) {
  'use strict';
  
	$scope.ledgerIndex = ledgerIndex;
	
	$scope.stockModel=[];
	var formdata = new FormData();
	$scope.ledgerForm = [];	
	  
	 $scope.disableLedgerGroup = false;
	
	 $scope.defaultCompany = companyId;
	 
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	 
	//Get Company
	$scope.companyDrop=[];
	apiCall.getCall(apiPath.getAllCompany).then(function(response3){
		
		$scope.companyDrop = response3;
		$scope.disableCompany = true;
	
	});
	
	 $scope.underWhat=[];
	apiCall.getCall(apiPath.getAllLedgerGroup).then(function(response3){
		
		$scope.underWhat = response3;
	
	});

	//Get Banks
	$scope.bankDrop=[];
	$scope.bankBranchDrop=[];
	apiCall.getCall(apiPath.getAllBank).then(function(response){
		$scope.bankDrop = response;
	});
	
	$scope.changeBank = function(key,value){
		formdata.set(key,value);
		apiCall.getCall(apiPath.getBankBranch+value).then(function(response){
			$scope.bankBranchDrop=response;
		})
	}

	$scope.changeBankBranch = function(key,value){
		formdata.set(key,value.bankBranchId);
		$scope.ledgerForm.bankIfsc = value.ifsc;
	}

	
	$scope.getInitStateCity = function(){
		
		stateCityFactory.getState().then(function(response){
			$scope.statesDrop = response;
			$scope.ledgerForm.stateDropDown = stateCityFactory.getDefaultState($rootScope.defaultState);
			formdata.delete('stateAbb');
			formdata.append('stateAbb',$rootScope.defaultState);
			$scope.cityDrop = stateCityFactory.getDefaultStateCities($rootScope.defaultState);
			$scope.ledgerForm.cityDrop = stateCityFactory.getDefaultCity($rootScope.defaultCity);
			formdata.delete('cityId');
			formdata.append('cityId',$rootScope.defaultCity);
		});
	}
	
	
	//Edit Ledger
	if(Object.keys(getSetFactory.get()).length){
		
		var editLedgerData = getSetFactory.get();
		console.log(editLedgerData);
		getSetFactory.blank();
		
		$scope.ledgerForm.getSetLedgerId = editLedgerData.ledgerId;
		$scope.ledgerForm.ledgerName = editLedgerData.ledgerName;
		$scope.ledgerForm.emailId = editLedgerData.emailId;
		$scope.ledgerForm.alias = editLedgerData.alias;
		$scope.ledgerForm.invAffect = editLedgerData.inventoryAffected;
		$scope.ledgerForm.contact = editLedgerData.contactNo == null || editLedgerData.contactNo == '' || editLedgerData.contactNo == 'NULL' ? '': editLedgerData.contactNo;
		$scope.ledgerForm.address1 = editLedgerData.address1;
		$scope.ledgerForm.address2 = editLedgerData.address2;
		$scope.ledgerForm.tin = editLedgerData.tin;
		$scope.ledgerForm.pan = editLedgerData.pan;
		//$scope.ledgerForm.sgst = editLedgerData.sgst;
		$scope.ledgerForm.cgst = editLedgerData.cgst;
		
		$scope.ledgerForm.isDealer = editLedgerData.isDealer;
		
		$scope.ledgerForm.amountType = editLedgerData.openingBalanceType;
		$scope.ledgerForm.openingBal = editLedgerData.openingBalance;
		
		$scope.ledgerForm.under = editLedgerData.ledgerGroup.ledgerGroupName;
		
		$scope.ledgerForm.companyDropDown = editLedgerData.company;
		//get bank-data
		apiCall.getCall(apiPath.getAllBank+'/'+editLedgerData.bankId).then(function(response){
			$scope.ledgerForm.bankName = response;
		});
		$scope.ledgerForm.bankMicr = editLedgerData.micrCode;

		/** State/City **/
		stateCityFactory.getState().then(function(response){
			$scope.statesDrop = response;
			$scope.ledgerForm.stateDropDown = editLedgerData.state;
			
			$scope.cityDrop = stateCityFactory.getDefaultStateCities(editLedgerData.state.stateAbb);
			$scope.ledgerForm.cityDrop = editLedgerData.city;
		});
			$scope.disableCompanyValue = true;
		/** End **/
	}
	else{
		$scope.ledgerForm.companyDropDown = $scope.defaultCompany;
		$scope.getInitStateCity();
		
		if($scope.ledgerIndex == 'purchaseBill'){
			formdata.delete('ledgerGroupId');
			formdata.append('ledgerGroupId',31);
			$scope.ledgerForm.under = "Sundry Creditors";
			//$scope.disableLedgerGroup = true;
		}
		
		 $scope.ledgerForm.amountType = 'debit';
		$scope.ledgerForm.openingBal = 0;
	  
		formdata.append('amountType',$scope.ledgerForm.amountType);
		formdata.append('amount',$scope.ledgerForm.openingBal);
	}
	
	$scope.ChangeState = function(Fname,state)
	 {
		//Get City
		$scope.cityDrop = stateCityFactory.getDefaultStateCities(state);
		
		//console.log(Fname+'...'+state);
			if(formdata.has(Fname))
			{
				formdata.delete(Fname);
			}
			
			formdata.append(Fname,state);
	}
	
	$scope.setPcode = function(Fname,value) {
  		//console.log(value.ledgerGroupId);
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value.ledgerGroupId);
  	}
  
	  $scope.invAffectDrop = [
		'yes',
		'no'
	  ]
	  
	  $scope.amountTypeDrop = [
		'debit',
		'credit'
	  ];
	  
	//Changed Data When Update
	$scope.changeLedgerData = function(Fname,value){
		//console.log(Fname+'..'+value);
		if(formdata.has(Fname))
		{
			formdata.delete(Fname);
		}
		formdata.append(Fname,value);
	}
	
	if($rootScope.ArraystockModel)
	{
		$scope.stockModel.state=$rootScope.ArraystockModel.state;
		$scope.stockModel.state2=$rootScope.ArraystockModel.state2;
		$scope.stockModel.state3=$rootScope.ArraystockModel.state3;
	}
  // $scope.stockModel.state;

    $scope.clickSave = function () {
		
		if($scope.ledgerForm.getSetLedgerId){
			
			var ledgerPath = apiPath.getAllLedger+'/'+$scope.ledgerForm.getSetLedgerId;
		}
		else{
			var ledgerPath = apiPath.getAllLedger;
			if(!formdata.has('isDealer')){
				formdata.append('isDealer','n');
			}
			formdata.append('balanceFlag','opening');
			formdata.append('companyId',$scope.ledgerForm.companyDropDown.companyId);
		}
		
		var filterArray = {};
		
		apiCall.postCall(ledgerPath,formdata).then(function(response5){
		
			//console.log(response5);
			if($scope.ledgerForm.getSetLedgerId){
				if(response5 == apiResponse.ok){
					
					if($scope.ledgerIndex == 'purchaseBill'){
						filterArray.index = $scope.ledgerForm;
					}
					else{
						filterArray.index = $scope.ledgerIndex;
					}
					
					filterArray.companyId = $scope.ledgerForm.companyDropDown.companyId;
					filterArray.ledgerName = $scope.ledgerForm.ledgerName;
					
					$modalInstance.close(filterArray);
					
					$scope.ledgerForm = [];
				}
				else{
					alert(response5);
				}
			}
			else{
				if(angular.isArray(response5)){
				
					//Delete formdata  keys
					for (var key of formdata.keys()) {
					   formdata.delete(key); 
					}
					if($scope.ledgerIndex == 'purchaseBill'){
						filterArray.index = response5[0];
					}
					else{
						filterArray.index = $scope.ledgerIndex;
					}
					
					filterArray.companyId = $scope.ledgerForm.companyDropDown.companyId;
					filterArray.ledgerName = $scope.ledgerForm.ledgerName;
					
					$modalInstance.close(filterArray);
					
					$scope.ledgerForm = [];
				}
				else{
					
					formdata.delete('balanceFlag');
					formdata.delete('companyId');
			
					alert(response5);
				}
			}
		});
		
    };

    $scope.cancel = function () {
	
		if($scope.stockModel)
		 {
			$rootScope.ArraystockModel=[];
			$rootScope.ArraystockModel.state=$scope.stockModel.state;
			$rootScope.ArraystockModel.state2=$scope.stockModel.state2;
			$rootScope.ArraystockModel.state3=$scope.stockModel.state3;
		 }
		$modalInstance.dismiss('qwerty');
    };
	
  
}
AccLedgerModalController.$inject = ["$rootScope","$scope", "$modalInstance","apiCall","apiPath","ledgerIndex","companyId","validationMessage","stateCityFactory","getSetFactory","apiResponse"];