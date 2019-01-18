
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/
//$.getScript('app/vendor/ng-table/ng-table.min.js');
//$.getScript('app/vendor/ng-table/ng-table.min.css');


App.controller('imageGalleryModalCtrl',imageGalleryModalCtrl);

function imageGalleryModalCtrl($rootScope,$scope, $modalInstance,$http,apiCall,apiPath,$timeout,getSetFactory,$state,billData,formatType,validationMessage,apiResponse,transType) {
  'use strict';
  
	 var data = [];
	 var vm = this;
	 $scope.billData = billData;
	 $scope.formatType = formatType;
	 $scope.transType = transType;
	 
	  var dateFormats = $rootScope.dateFormats; //Date Format
	  
	$scope.erpPath = $rootScope.erpPath; // Erp Path
	
		$scope.stockModel=[];
 
	if($rootScope.ArraystockModel)
	{
		$scope.stockModel.state=$rootScope.ArraystockModel.state;
		$scope.stockModel.state2=$rootScope.ArraystockModel.state2;
		$scope.stockModel.state3=$rootScope.ArraystockModel.state3;
	}
  // $scope.stockModel.state;

    $scope.ok = function () {
      $modalInstance.close('closed');
    };
	
	$scope.closeButton = function () {

		$modalInstance.dismiss();
    };
	
    $scope.cancel = function () {
	
		if($scope.stockModel)
		 {
			$rootScope.ArraystockModel=[];
			$rootScope.ArraystockModel.state=$scope.stockModel.state;
			$rootScope.ArraystockModel.state2=$scope.stockModel.state2;
			$rootScope.ArraystockModel.state3=$scope.stockModel.state3;
		 }
		$modalInstance.dismiss();
    };
	
	/**
		Page Code
	**/
	if($scope.formatType == "image"){
		$scope.heading = "Image Gallery";
	}
	else if($scope.formatType == "pdf"){
		
		$scope.heading = "Pdf List";
	}
	else if($scope.formatType == "payment"){
		
		$scope.heading = "Payment";
	}
	
	$scope.changeAmountLimit = function(){
		
		if($scope.paymentForm.paymentTrn == 'refund'){
			
			if($scope.paymentForm.amount >= $scope.billData.advance)
			{
				$scope.paymentForm.amount = $scope.billData.advance;
			}
			
			$scope.LimitAmount = parseFloat($scope.billData.advance);
			
		}
		else{
			
			if($scope.paymentForm.amount >= $scope.billData.balance)
			{
				$scope.paymentForm.amount = $scope.billData.balance;
			}
			
			$scope.LimitAmount = parseFloat($scope.billData.balance);
			
		}
	}
	
	/**
		End
	**/
	
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

	/** payment Code **/
	
	if($scope.formatType == "payment"){
		
		//get Bank
		vm.bankDrop=[];
		apiCall.getCall(apiPath.getAllBank).then(function(response2){
				//console.log(response2);
				vm.bankDrop = response2;
		});
	
		loadBankLedgerOfCompany($scope.billData.company.companyId,function(responseLedger){

		},0);

			// Datepicker
		  // ----------------------------------- 
			this.minStart = new Date();
			this.maxStart = new Date();
		  this.today = function() {
			this.dt1 = new Date();
		  };
		  this.today();

		  this.clear = function () {
			this.dt1 = null;
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

		  this.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		  };

		  this.initDate = new Date('2016-15-20');
		  // this.formats = ['dd-MMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		  this.format = dateFormats;
		  
		  //DatePicker End
		  
		  /* VALIDATION */
	
			$scope.errorMessage = validationMessage; //Error Messages In Constant
			
			/* VALIDATION END */
		   $scope.paymentForm = [];
		   
		  $scope.paymentModeDrop = ['cash','bank','card'];
		  if($scope.transType == 'payment'){
			  
			 $scope.paymentTrasDrop = ['payment'];
			 
			 $scope.paymentForm.paymentTrn = 'payment';
			 
			 $scope.LimitAmount = parseFloat($scope.billData.balance);
		  }
		  else if($scope.transType == 'refund'){
			  
			$scope.paymentTrasDrop = ['refund'];
			  
			$scope.paymentForm.paymentTrn = 'refund';
			   
			$scope.LimitAmount = parseFloat($scope.billData.advance);
		  }
		  else if($scope.transType == 'both'){
			
			$scope.paymentTrasDrop = ['payment','refund'];
  
			$scope.paymentForm.paymentTrn = 'payment';
			
			$scope.LimitAmount = parseFloat($scope.billData.balance);
			
		  }
		 
			
		 
		  
			$scope.insertPayment = function(){
				  
				 // console.log($scope.paymentForm);
				 
				  
				var payFormData = new FormData();
				  
				var  date = new Date(vm.dt1);
				// var fdate  = date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();
				var fdate  = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();
				
				payFormData.append('entryDate',fdate);
				payFormData.append('amount',$scope.paymentForm.amount);
				payFormData.append('paymentMode',$scope.paymentForm.paymentMode);
				
				
				if($scope.paymentForm.paymentMode == 'bank' || $scope.paymentForm.paymentMode == 'card'){
					
					payFormData.append('bankName',$scope.paymentForm.BankName.bankName);
					payFormData.append('checkNumber',$scope.paymentForm.chequeNo);
					payFormData.append('bankLedgerId',$scope.paymentForm.bankLedgerId.ledgerId);
				}
				
				payFormData.append('paymentTransaction',$scope.paymentForm.paymentTrn);
				  
				
				
				apiCall.postCall(apiPath.billPaymentRefund+$scope.billData.saleId+'/payment',payFormData).then(function(response){
					
					//console.log(response);
					if(angular.isObject(response) && response.hasOwnProperty('documentPath')){
						
						$modalInstance.close($scope.paymentForm.paymentTrn);
						
					}
					else{
						
						alert(response);
					}
					
				});
				 
				  
			}
		  
		  $scope.cancel = function(){
			  
			$scope.paymentForm = [];
			  
			 vm.dt1 = new Date();
			 
			 $scope.paymentForm.paymentTrn = 'payment';
		  }
	}
	/** End **/

}

imageGalleryModalCtrl.$inject = ["$rootScope","$scope", "$modalInstance","$http","apiCall","apiPath","$timeout","getSetFactory","$state","billData","formatType","validationMessage","apiResponse","transType"];
