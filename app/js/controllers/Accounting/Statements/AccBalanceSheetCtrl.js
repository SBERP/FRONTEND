
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('AccBalanceSheetController', AccBalanceSheetController);

function AccBalanceSheetController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,$state,apiResponse,toaster,$window,getSetFactory,$modal) {
  'use strict';
  var vm = this;
  
  var data = [];
  $scope.myArrayData = [];
  
  var formdata = new FormData();
  var flag = 0;
  $scope.noOfDecimalPoints;
  $scope.displayCompany;
  
   $scope.firstLayout = true;
  $scope.secondLayout = false;
  
  var Modalopened = false;
  
  $scope.dateFormat =  $rootScope.dateFormats; //Date Format
  
  /** Sundry debitor and creditor **/
  
		$scope.totalSundaryDebitor = 0;
		$scope.totalSundryCreditor = 0;
			
		var sundryDebitorArray = [];
		var sundryCreditorArray = [];
		
	/** End **/
			
  var erpPath = $rootScope.erpPath;
   $scope.displayDate = new Date();
  
	$scope.showBranches = function(){
		
		$scope.TotalofDebit = 0;
		$scope.TotalofCredit = 0;
		
		$scope.noOfDecimalPoints = parseInt($scope.stateCheck.noOfDecimalPoints);
	
		$scope.getBranch($scope.stateCheck.companyId);
		
		$scope.displayCompany = $scope.stateCheck.companyName;
	}
	
	//Company
	$scope.init = function (){
			
		vm.states=[];
		apiCall.getCall(apiPath.getAllCompany).then(function(response2){
			
			vm.states = response2;
			
			//Set default Company
			apiCall.getDefaultCompany().then(function(response){
				
				$scope.stateCheck = response;
				
				$scope.displayCompany = response.companyName;
				
				$scope.noOfDecimalPoints = parseInt(response.noOfDecimalPoints);
				
				$scope.getBranch(response.companyId);
				
			});
		 
		});
		 
	}
	$scope.init();
	
	//End
	
	$scope.TotalofDebit = 0;
	$scope.TotalofCredit = 0;
  
	$scope.getBranch = function(id){
		
	toaster.pop('wait', 'Please Wait', 'Data Loading....',10000);
	
		apiCall.getCall(apiPath.getBalanceSheet+id).then(function(response){
			
			// console.log(response);
			//data = response;
			toaster.clear();
			
			var trialBalanceArray = [];
			
			/** Sundry debitor and creditor **/
			
				$scope.totalSundaryDebitor = 0;
				$scope.totalSundryCreditor = 0;
		
				sundryDebitorArray = [];
				sundryCreditorArray = [];
				
			/** End **/
			
			var totaldebit = 0;
			var totalcredit = 0;
			
		
			
			var dataLength = response.length-1;
			var debitorFlag = 0;
			var creditorFlag = 0;
			
			for (var i = 0; i < response.length; i++) {
			  
			  var dataOfTrial = response[i];
			  
			  var innerArray = [];
			  
			  var trailObject = {};
			  trailObject.ledgerId = dataOfTrial.ledger.ledgerId;
			  trailObject.ledgerName = dataOfTrial.ledger.ledgerName;
			 trailObject.amountType = dataOfTrial.amountType;
			  
			  if(dataOfTrial.amountType == 'debit'){
				  
				 trailObject.debitAmount = dataOfTrial.amount;
				  trailObject.creditAmount = "-";
				totaldebit += parseFloat(dataOfTrial.amount);
				
				if(dataOfTrial.ledger.ledgerGroupId == 31){
					// console.log('in');
					
					$scope.totalSundaryDebitor += parseFloat(dataOfTrial.amount);
					
					sundryDebitorArray.push(dataOfTrial);
					
					if(debitorFlag == 0){
						// console.log('Flag IF');
						debitorFlag = 1;
						
						 var trailObjectDebtors = {};
						 trailObjectDebtors.ledgerId = "0.9999";
						 trailObjectDebtors.ledgerName = "Sundry Creditors";
						 trailObjectDebtors.amountType = "debit";
						 trailObjectDebtors.debitAmount = "-";
						trailObjectDebtors.creditAmount = "-";
						
						var cntLendebtors = trialBalanceArray.length;
						var inFlagDebtor = 0;
						
						for(var varDebtors=0;varDebtors<cntLendebtors;varDebtors++){
					
							var trailArrayData = trialBalanceArray[varDebtors];
								// console.log('Push');
							//console.log(trailArrayData[0]);
							if(trailArrayData[1] == undefined){
								inFlagDebtor = 1;
								trailArrayData[1] = trailObjectDebtors;
								break;
							}
					
						}
						
						if(inFlagDebtor == 0){
							var innerArrayDebtors = [];
							innerArrayDebtors[1] = trailObjectDebtors;
							trialBalanceArray.push(innerArrayDebtors);
						}
					}
				}
				else{
					// console.log('Else Debit');
					var cntLen = trialBalanceArray.length;
					if(cntLen > 0){
						var inFlag = 0;
						for(var p=0;p<cntLen;p++){
						
							var trailArrayData = trialBalanceArray[p];
							
							//console.log(trailArrayData[0]);
							if(trailArrayData[1] == undefined){
								inFlag = 1;
								trailArrayData[1] = trailObject;
								break;
							}
						
						}
						if(inFlag == 0){
							innerArray[1] = trailObject;
							trialBalanceArray.push(innerArray);
						}
					}
					else{
						
						innerArray[1] = trailObject;
						trialBalanceArray.push(innerArray);
					}
				}
			  }
			  else{
				   trailObject.debitAmount = "-";
				  trailObject.creditAmount = dataOfTrial.amount;
				 totalcredit += parseFloat(dataOfTrial.amount);
				 
				 if(dataOfTrial.ledger.ledgerGroupId == 32){
				
					$scope.totalSundryCreditor += parseFloat(dataOfTrial.amount);
					
					sundryCreditorArray.push(dataOfTrial);
					
					if(creditorFlag == 0){
						
						creditorFlag = 1;
						
						 var trailObjectCreditor = {};
						 trailObjectCreditor.ledgerId = "0.9999";
						 trailObjectCreditor.ledgerName = "Sundry Debitor";
						 trailObjectCreditor.amountType = "Credit";
						 trailObjectCreditor.debitAmount = "-";
						trailObjectCreditor.creditAmount = "-";
						
						var cntLenCreditor = trialBalanceArray.length;
						var inFlagCreditor = 0;
						
						for(var varCreditor=0;varCreditor<cntLenCreditor;varCreditor++){
					
							var trailArrayData = trialBalanceArray[varCreditor];
							//console.log(trailArrayData[0]);
							if(trailArrayData[0] == undefined){
								inFlagCreditor = 1;
								trailArrayData[0] = trailObjectCreditor;
								break;
							}
					
						}
						
						if(inFlagCreditor == 0){
							var innerArrayCreditor = [];
							innerArrayCreditor[0] = trailObjectCreditor;
							trialBalanceArray.push(innerArrayCreditor);
						}
					}
				}
				else{
					 
					 var cntLen = trialBalanceArray.length;
					if(cntLen > 0){
						var inFlag = 0;
						for(var p=0;p<cntLen;p++){
						
							var trailArrayData = trialBalanceArray[p];
							
							if(trailArrayData[0] == undefined){
								inFlag = 1;
								trailArrayData[0] = trailObject;
								break;
							}
						
						}
						
						if(inFlag == 0){
							innerArray[0] = trailObject;
							trialBalanceArray.push(innerArray);
						}
					}
					else{
						
						innerArray[0] = trailObject;
						trialBalanceArray.push(innerArray);
					}
				 }
			  }
			  //console.log(innerArray);
			 
			  //innerArray = [];
				if(i==dataLength)
				{
					
				
					// trialBalanceArray.push(totalObject);
					$scope.TotalofDebit = totaldebit;
					$scope.TotalofCredit = totalcredit;
				}
				
				//console.log(trialBalanceArray);
			}
			
			//console.log(trialBalanceArray);
			//return false;
			$scope.myArrayData = trialBalanceArray;
			//console.log(data);
			if(flag == 0){
				$scope.TableData();
				flag =1;
			}
			else{
				
				vm.tableParams.reload();
			}
			
			

		});
		
		// vm.tableParams.reload();
		
	}
	
  $scope.TableData = function(){
	

	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10000,          // count per page
		  // noPager: true // hides pager
		  sorting: {
			   ledgerfName: 'asc'     // initial sorting
		  }
	  }, {
		  // counts: [],
		  total: $scope.myArrayData.length, // length of data
		  getData: function($defer, params) {
			  //console.log(params.$params);
			  // if()
			  // {
				  // alert('yes');
			  // }
			  // else{
				  // alert('no');
			  // }
			  // use build-in angular filter
			 // console.log("Length: .."+params.$params.filter.city);
			  
			  if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.ledgerName) != "undefined" && params.$params.filter.ledgerName != "")  || (typeof(params.$params.filter.debitAmount) != "undefined" && params.$params.filter.debitAmount != "") || (typeof(params.$params.filter.creditAmount) != "undefined" && params.$params.filter.creditAmount != "")))
			  {
					 var orderedData = params.filter() ?
					 $filter('filter')($scope.myArrayData, params.filter()) :
					 $scope.myArrayData;

					  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

					  params.total(orderedData.length); // set total for recalc pagination
					  $defer.resolve(vm.users);
			  

			  }
			  else{
				  
				   params.total($scope.myArrayData.length);
				  
			  }
			 
			 if(!$.isEmptyObject(params.$params.sorting))
			  {
				
				 //alert('ggg');
				  var orderedData = params.sorting() ?
						  $filter('orderBy')($scope.myArrayData, params.orderBy()) :
						  $scope.myArrayData;
		  
				  $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			  }
			
		  }
	  });
	  
	 
	  
  }
  
  
	$scope.goToLedgerTransaction = function(ledgerId){
		
		//alert(ledgerId);
		
		getSetFactory.set(ledgerId);
		
		$state.go("app.AccDataLedger");
		
	  
	}

	$scope.oneSide = function(){
		
		 // if($scope.firstLayout)
		 // {
			 // $scope.secondLayout = true;
			 // $scope.firstLayout = false;
		 // }
		 // else{
			 // $scope.secondLayout = false;
			 // $scope.firstLayout = true;
		 // }
		
		 $scope.firstLayout = false;
	$scope.secondLayout = true;
	}
	
	$scope.twoSide = function(){
		
		  $scope.firstLayout = true;
	$scope.secondLayout = false;
		
	}
	
  
	/** Creditor Debitor Modal**/
	
	$scope.openCreditorDebitorModal = function(personType){
		
		toaster.clear();
		if (Modalopened) return;
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/Statements/balanceSheetModal.html',
		  controller: AccBalanceSheetModalController,
		  size: 'lg',
		  resolve:{
			  ledgerGroupData: function(){
				  
					if(personType == 'creditor'){
			
						return sundryCreditorArray;
					}
					else{
						return sundryDebitorArray;
					}
			  },
			  ledgerGroupType: function(){
				  
					if(personType == 'creditor'){
			
						return 'Creditors';
					}
					else{
						return 'Debtors';
					}
			  },
			  totalDebitorCreditor: function(){
				  
				  if(personType == 'creditor'){
			
						return $scope.totalSundryCreditor;
					}
					else{
						 return $scope.totalSundaryDebitor;
					}
					
				 
			  },
			  noOfDecimalPoints: function(){
				  
				  return $scope.noOfDecimalPoints;
			  }
		  }
		});
	
	   Modalopened = true;
	   
		modalInstance.result.then(function () {
		 
			
			Modalopened = false;
			
		}, function () {
			
			console.log('Cancel');
			Modalopened = false;
		  
		});
			
	}
	
	/** End **/
	
	/*** Pdf ***/
	
		$scope.generatePdf = function(operation){
		 
			toaster.clear();
			toaster.pop('wait', 'Please Wait', operation.toUpperCase()+' Loading...');
			var getData = {"Content-Type": undefined};
			getData.operation = operation;
			
			apiCall.getCallHeader(apiPath.getBalanceSheet+$scope.stateCheck.companyId+'/export',getData).then(function(responseDrop){
			
				console.log(responseDrop);
				toaster.clear();
				
				if(angular.isObject(responseDrop)  && responseDrop.hasOwnProperty('documentPath')){
				
					var pdfPath = erpPath+responseDrop.documentPath;
					if(operation == 'pdf' || operation == 'twoSidePdf'){
						$window.open(pdfPath, '_blank');
					}
					else{
						$window.open(pdfPath,"_self");
					}
					
				}
				else{
					
					if(responseDrop.status == 500){
						
						toaster.pop('warning', 'Opps!', responseDrop.statusText);
					}
					else{
						
						toaster.pop('warning', 'Opps!', responseDrop);
					}
					
					//alert('Something Wrong');
				}
			
			});
		}
	
	/*** End Pdf ***/
	
	

}
AccBalanceSheetController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","$state","apiResponse","toaster","$window","getSetFactory","$modal"];