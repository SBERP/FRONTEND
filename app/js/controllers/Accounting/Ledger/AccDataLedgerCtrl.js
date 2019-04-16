
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('AccDataLedgerController', AccDataLedgerController);

function AccDataLedgerController($rootScope,$scope, $filter, ngTableParams,$http,$modal,$state,apiCall,apiPath,$location,getSetFactory,flotOptions, colors,$timeout,toaster,clientFactory,productFactory,stateCityFactory) {
  'use strict';
  var vm = this;
  var data = [];
  
  $scope.myArrayData = [];
  
  var formdata = new FormData();
  
   var ledgerId = getSetFactory.get();
   
   getSetFactory.blank(); // Empty It
   
  //vm.pieChartData = [];
  vm.headingName;
  
	
	
  apiCall.getCall(apiPath.getAllLedger+'/'+ledgerId).then(function(responseDrop){
	  
		toaster.pop('wait', 'Please Wait', 'Data Loading....',60000);
		
		vm.headingName = responseDrop.ledgerName;
	
	});
  
  //Chart Config
	// An array of boolean to tell the directive which series we want to show
	 $scope.areaSeries = [true, true];
	vm.chartAreaFlotChart = flotOptions['area'];
  
   vm.chartPieFlotChart = flotOptions['pie'];
	//vm.chartSplineFlotChart = flotOptions['spline'];
   

  var GetTransationPath = apiPath.getAllLedger+'/'+ledgerId+'/transactions';
  
	apiCall.getCall(GetTransationPath).then(function(response){
		var secondLayoutArrayData = [];
		var totaldebit = 0;
		var totalcredit = 0;
			
		toaster.clear();
		data = response;
		//$scope.myArrayData = response;
		
		
		vm.pieChartData = [{ "color" : "#6cc539",
							"data" : "0",
							"label" : "Debit"
						  },
						  { "color" : "#00b4ff",
							"data" : "0",
							"label" : "Credit"
						  }];
  
		vm.pieFlotCharts = [{
						  "label": "Debit",
						  "color": "#6cc539",
						  "data": [
							["Jan", "0"],
							["Feb", "0"],
							["Mar", "0"],
							["Apr", "0"],
							["May", "0"],
							["Jun", "0"],
							["Jul", "0"],
							["Aug", "0"],
							["Sep", "0"],
							["Oct", "0"],
							["Nov", "0"],
							["Dec", "0"]
						  ]
						},{
						  "label": "Credit",
						  "color": "#00b4ff",
						  "data": [
							["Jan", "0"],
							["Feb", "0"],
							["Mar", "0"],
							["Apr", "0"],
							["May", "0"],
							["Jun", "0"],
							["Jul", "0"],
							["Aug", "0"],
							["Sep", "0"],
							["Oct", "0"],
							["Nov", "0"],
							["Dec", "0"]
						  ]
						}];
		var dataLength = response.length-1;
		
		for (var i = 0; i < data.length; i++) {
			
			 var dataOfTrial = response[i];
			 
			 var innerArray = [];
			  var trailObject = {};
			  trailObject.ledgerId = dataOfTrial.ledger.ledgerId;
			  trailObject.ledgerName = dataOfTrial.ledger.ledgerName;
			  trailObject.entryDate = dataOfTrial.entryDate;
			  
			if(data[i].amountType=='debit'){
			  
			  
				vm.pieChartData[0]["data"] = parseInt(vm.pieChartData[0]["data"]) + parseInt(data[i].amount);
				var date = data[i].entryDate;
				var splitedate = date.split("-").reverse().join("-");
				var getdate = new Date(splitedate);
				var month = getdate.getMonth();
				
					//console.log(vm.pieFlotCharts[0]["data"][month]);
					vm.pieFlotCharts[0]["data"][month][1] = parseInt(vm.pieFlotCharts[0]["data"][month][1]) + parseInt(data[i].amount);
					
				//console.log(vm.pieFlotCharts);
					
					/**second layout **/
					
					trailObject.debitAmount = dataOfTrial.amount;
					 trailObject.creditAmount = "-";
					totaldebit += parseFloat(dataOfTrial.amount);
				
				
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
				
				//console.log(data);
				vm.pieChartData[1]["data"] = parseInt(vm.pieChartData[1]["data"]) + parseInt(data[i].amount);
				
				var date = data[i].entryDate;
				var splitedate = date.split("-").reverse().join("-");
				var getdate = new Date(splitedate);
				var month = getdate.getMonth();
				
				// console.log(month);
				// console.log(vm.pieFlotCharts[1]["data"][month]);
					vm.pieFlotCharts[1]["data"][month][1] = parseInt(vm.pieFlotCharts[1]["data"][month][1]) + parseInt(data[i].amount);
				   
				//vm.pieFlotCharts[1]["data"] = parseInt(vm.pieFlotCharts[1]["data"]) + parseInt(data[i].amount);
				
				/**second layout **/
				
				  trailObject.debitAmount = "-";
				  trailObject.creditAmount = dataOfTrial.amount;
				 totalcredit += parseFloat(dataOfTrial.amount);
				 
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
		//console.log(vm.pieFlotCharts);
		
		$scope.contents = data;
					
					
		$scope.contents.sort(function(a, b){
			var entDate = a.entryDate.split("-").reverse().join("-");
			var toDate = b.entryDate.split("-").reverse().join("-");
			var dateA=new Date(entDate), dateB=new Date(toDate);
			return dateB-dateA; 
		});
		
		data = $scope.contents;
		
		$scope.mySecondArrayData = secondLayoutArrayData;
		
		$scope.TableData();
	});
	
  $scope.TableData = function(){
	

	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  date: 'desc'     // initial sorting
		  }
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			 
			  /** Table **/
			  // if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.date) != "undefined" && params.$params.filter.date != "")  || (typeof(params.$params.filter.amountType) != "undefined" && params.$params.filter.amountType != "") || (typeof(params.$params.filter.amount) != "undefined" && params.$params.filter.amount != "")))
			  // {
					 // var orderedData = params.filter() ?
					 // $filter('filter')($scope.myArrayData, params.filter()) :
					 // $scope.myArrayData;

					  // vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

					  // params.total(orderedData.length); // set total for recalc pagination
					  // $defer.resolve(vm.users);
			  

			  // }
			  // else{
				  
				   // params.total($scope.myArrayData.length);
				  
			  // }
			 
			 // if(!$.isEmptyObject(params.$params.sorting))
			  // {
				
				//	 alert('ggg');
				  // var orderedData = params.sorting() ?
						  // $filter('orderBy')($scope.myArrayData, params.orderBy()) :
						  // $scope.myArrayData;
		  
				  // $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			  // }
			  /** End Table **/
			   var orderedData;

			if(params.sorting().date === 'asc'){

			  data.sort(function (a, b) {
				  
				  var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						
				//var dateA = new Date(a.date), dateB = new Date(b.date);
				return dateA - dateB; //sort by date descending
			  });
			  orderedData = data;

			} else if(params.sorting().date === 'desc') {

			  data.sort(function (a, b) {
				  var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						
				//var dateA = new Date(a.date), dateB = new Date(b.date);
				return dateB - dateA; //sort by date descending
			  });
			  orderedData = data;

			} else if(!params.sorting().date){

			  if (params.filter().term) {
				orderedData = params.filter() ? $filter('filter')(data, params.filter().term) : data;
			  } else {
				orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
			  }
			  
			}

			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			
			  $scope.totalData = data.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });
	  
  }

  
   $scope.firstLayout = true;
	$scope.secondLayout = false;
  
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
	
	
  
  
  $scope.isDefault_branch = function(id)
  {
	
	formdata.append('isDefault','ok');
	var editBranch2 = apiPath.getAllBranch+'/'+id;
		
		apiCall.postCall(editBranch2,formdata).then(function(response5){
		
			formdata.delete('isDefault');
		
			//$location.path('app/Branch');
			//toaster.pop('success', 'Title', 'Message');
		
		});
  }
  
  $scope.edit_comp = function(branch_id)
  {
	  
	  $location.path('app/AddBranch/'+branch_id);
  }
  
  $scope.delete_comp = function(branch_id)
  {
	
	var deletePath = apiPath.getAllBranch+'/'+parseInt(branch_id);
	  
	apiCall.deleteCall(deletePath).then(function(deleteres){
		
		//console.log(deleteres);
	 
	});
  }

  $scope.open_bill_ledger =function(user){
  	if(user.ledger.contactNo!=null && user.ledger.contactNo!=undefined && user.ledger.contactNo!='undefined')
  	{	
  		var BillPath = apiPath.getBill+user.ledger.companyId;
		var preHeaderData = {'Content-Type': undefined,'invoiceNumber':user.ledger.contactNo};
		preHeaderData.salesType = 'whole_sales';
		
		apiCall.getCallHeader(BillPath,preHeaderData).then(function(response){
		// console.log('starting');
		// console.log(response);
		toaster.clear();
		if(angular.isArray(response)){
			
			if(response.length > 1){
				
				//console.log('Multiple');
				$scope.openBillHistoryModal('lg',response);

			}
			else{
				var index="";
		  		//set ledger object in factory
		  		getSetFactory.blank();
		  		var ledgerId = user.ledger.ledgerId;
		  		apiCall.getCall(apiPath.getAllLedger+"/"+ledgerId).then(function(response2){

		  			getSetFactory.set(response2);
		  			$scope.openLedger('lg',index = 'purchaseBill',user.ledger.companyId);
		  		});
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
  	else
  	{
  		var index="";
  		//set ledger object in factory
  		getSetFactory.blank();
  		var ledgerId = user.ledger.ledgerId;
  		apiCall.getCall(apiPath.getAllLedger+"/"+ledgerId).then(function(response2){

  			getSetFactory.set(response2);
  			$scope.openLedger('lg',index = 'purchaseBill',user.ledger.companyId);
  		});
  	}
  }

  	var Modalopened = false;
	/** Ledger Redirect Edit **/

	/* Ledger Model Start */
	$scope.openLedger = function (size,index = 'purchaseBill',companyId) {

	if (Modalopened) return;
	//get Company
	$scope.companyDrop=[];
	apiCall.getCall(apiPath.getAllCompany+"/"+companyId).then(function(response2){
			//console.log(response2);
			$scope.companyDrop = response2;
			if($scope.companyDrop)
			{

				  var modalInstance = $modal.open({
				  templateUrl: 'app/views/PopupModal/Accounting/ledgerModal.html',
				  controller: AccLedgerModalController,
				  size: size,
				  resolve:{
					  ledgerIndex: function(){
						  return index;
					  },
					  companyId: function(){
						return $scope.companyDrop;
					  }
				  }
				});
				
				Modalopened = true;
				
				var state = $('#modal-state');
				modalInstance.result.then(function (data) {
					Modalopened = false;
				
				}, function (data) {
					Modalopened = false;
				});
			}
			else{
				
				alert('Please Select Company');
			}
	});
	
	}
  	/* Ledger Model End */

  	/**
		History Modal 
	**/
		
	$scope.openBillHistoryModal = function (size,responseData,draftOrSalesOrder) {

		toaster.clear();
       // console.log(responseData);
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

			 // console.log('OK',data);
				toaster.clear();
				Modalopened = false;
				$state.go("app.WholesaleBill");
				// draftOrSalesOrder == undefined || draftOrSalesOrder == 'SalesOrder' ? $scope.EditAddBill('','SalesOrder') : $scope.EditAddBill('copy','draft');
				// $anchorScroll();
			}, function () {
				console.log('Cancel');
				toaster.clear();
				Modalopened = false;
			});
	};
}
AccDataLedgerController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","$http","$modal","$state","apiCall","apiPath","$location","getSetFactory","flotOptions","colors","$timeout","toaster","clientFactory","productFactory","stateCityFactory"];