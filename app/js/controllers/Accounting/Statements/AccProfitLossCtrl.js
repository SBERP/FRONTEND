
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('AccProfitLossController', AccProfitLossController);

function AccProfitLossController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,$state,apiResponse,toaster,$window,getSetFactory) {
  'use strict';
  var vm = this;
	var data = [];
	$scope.myArrayData = [];
  var formdata = new FormData();
  var flag = 0;
  $scope.noOfDecimalPoints;
  $scope.displayCompany;
  
  $scope.dateFormat =  $rootScope.dateFormats; //Date Format
  
  $scope.firstLayout = true;
  $scope.secondLayout = false;
  
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
		
	toaster.pop('wait', 'Please Wait', 'Data Loading....');
	
		apiCall.getCall(apiPath.getProfitLoss+id).then(function(response){
			
			//console.log(response);
			//data = response;
			toaster.clear();
			
			var trialBalanceArray = [];
			
			var secondLayoutArrayData = [];
	
			
			var totaldebit = 0;
			var totalcredit = 0;
			var dataLength = response.length-1;
			
			for (var i = 0; i < response.length; i++) {
			  
			  var dataOfTrial = response[i];
			  
			    var innerArray = [];
				
			  var trailObject = {};
			  trailObject.ledgerId = dataOfTrial.ledger.ledgerId;
			  trailObject.ledgerName = dataOfTrial.ledger.ledgerName;
				//  trailObject.amountType = data[i].amountType;
			  
			  if(dataOfTrial.amountType == 'debit'){
				 
				 
				 trailObject.debitAmount = dataOfTrial.amount;
				  trailObject.creditAmount = "-";
				totaldebit += parseFloat(dataOfTrial.amount);
				
				/**second layout **/
					var cntLen = secondLayoutArrayData.length;
					if(cntLen > 0){
						var inFlag = 0;
						for(var p=0;p<cntLen;p++){
						
							var trailArrayData = secondLayoutArrayData[p];
							
							//console.log(trailArrayData[0]);
							if(trailArrayData[1] == undefined){
								inFlag = 1;
								trailArrayData[1] = trailObject;
								break;
							}
						
						}
						if(inFlag == 0){
							innerArray[1] = trailObject;
							secondLayoutArrayData.push(innerArray);
						}
					}
					else{
						
						innerArray[1] = trailObject;
						secondLayoutArrayData.push(innerArray);
					}
					/** End **/
					
				  }
				  else{
					   trailObject.debitAmount = "-";
					  trailObject.creditAmount = dataOfTrial.amount;
					   
					   
					 totalcredit += parseFloat(dataOfTrial.amount);
					 
				 /**second layout **/
					 var cntLen = secondLayoutArrayData.length;
					if(cntLen > 0){
						var inFlag = 0;
						for(var p=0;p<cntLen;p++){
						
							var trailArrayData = secondLayoutArrayData[p];
							
							if(trailArrayData[0] == undefined){
								inFlag = 1;
								trailArrayData[0] = trailObject;
								break;
							}
						
						}
						
						if(inFlag == 0){
							innerArray[0] = trailObject;
							secondLayoutArrayData.push(innerArray);
						}
					}
					else{
						
						innerArray[0] = trailObject;
						secondLayoutArrayData.push(innerArray);
					}
				/** End **/
				
			  }
			  
			  trialBalanceArray.push(trailObject);
			  
				if(i==dataLength)
				{
					// var totalObject = {};
					// totalObject.ledgerName = "Total";
					// totalObject.debitAmount = totaldebit;
					// totalObject.creditAmount = totalcredit;
					
					// trialBalanceArray.push(totalObject);
					$scope.TotalofDebit = totaldebit;
					$scope.TotalofCredit = totalcredit;
				}
			}
			
			$scope.myArrayData = trialBalanceArray;
			
			$scope.mySecondArrayData = secondLayoutArrayData;
			
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
		  count: 100000,          // count per page
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
		
		 $scope.firstLayout = true;
	$scope.secondLayout = false;
	}
	
	$scope.twoSide = function(){
		
		  $scope.firstLayout = false;
	$scope.secondLayout = true;
		
	}

 
  
	/*** Pdf ***/
	
		$scope.generatePdf = function(operation){
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', operation.toUpperCase()+' Loading...');
			var getData = {"Content-Type": undefined};
			getData.operation = operation;
			
			apiCall.getCallHeader(apiPath.getProfitLoss+$scope.stateCheck.companyId+'/export',getData).then(function(responseDrop){
			
				//console.log(responseDrop);
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
AccProfitLossController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","$state","apiResponse","toaster","$window","getSetFactory"];