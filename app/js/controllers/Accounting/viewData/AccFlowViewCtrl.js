App.controller('AccFlowViewController', AccFlowViewController);

function AccFlowViewController($rootScope,$scope, $filter, $http, ngTableParams,apiCall,apiPath,flotOptions,fetchArrayService, colors,$timeout,getSetFactory,$state,headerType,$modal,$window,toaster,apiResponse,apiDateFormate) {
  	'use strict';
  	var vm = this;
  	var data = [];
  	var saleData = [];
   	$scope.filteredItems;
  	var Modalopened = false;
  	var finalStatus = {};
	$scope.erpPath = $rootScope.erpPath; //Erp Path
	$scope.headerType = headerType;
	$scope.dateFormat =  $rootScope.dateFormats; //Date Format
   	$scope.statusCounts = [];
   	$scope.activeStatus = {statusId : 1};
   	if ($rootScope.accView.companyId == undefined) {
   		$rootScope.accView.companyId = $rootScope.$storage.authUser.defaultCompanyId;
   	}
	/** Display Company and date **/
	apiCall.getCall(apiPath.getAllCompany+'/'+$rootScope.accView.companyId).then(function(res)
	{
		$scope.displayCompany = res.companyName;
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
	});
	if ($rootScope.accView.branchId) 
	{
		apiCall.getCall(apiPath.getAllBranch+'/'+$rootScope.accView.branchId).then(function(res)
		{
			$scope.displayBranch = res.branchName;
		});
	}
	$scope.displayfromDate = $rootScope.accView.fromDate;
	$scope.displaytoDate = $rootScope.accView.toDate;

	$scope.loadInit = function(onDateChange = null) 
  	{
  		if (onDateChange != null)
  		{
  			$rootScope.accView.fromDate = moment(vm.dt1).format(apiDateFormate);
  			$rootScope.accView.toDate = moment(vm.dt2).format(apiDateFormate);
  		}
		var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'companyId':$rootScope.accView.companyId,'toDate':$rootScope.accView.toDate,'isQuotationProcess':'yes'};
		var getJrnlPath = apiPath.postQuotationBill;
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
		$scope.loadCounts();
  		
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
  		apiCall.getCallHeader(getJrnlPath,headerData).then(function(response){
			$scope.reLoadPdfData(response);
			toaster.clear();
		}).catch(function (reason) {
			 if (reason.status === 500) {
				alert('Encountered server error');
			 }
		});
  		toaster.clear();
  		var getSalesPath = apiPath.getBill+$rootScope.accView.companyId;
  		var salesHeader = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'salestype':'whole_sales'};
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
  		apiCall.getCallHeader(getSalesPath,salesHeader).then(function(response){
			$scope.reLoadPdfData2(response);
			toaster.clear();
		}).catch(function (reason) {
			 if (reason.status === 500) {
				alert('Encountered server error');
			 }
		});
  	}
  	$scope.goToBillPage = function(trnType,bill)
	{
		var gotoUrl;
		if (trnType == 'quotation') {
			gotoUrl = 'app.QuotationPrint';
		}else if (trnType == 'sales') {
			gotoUrl = 'app.WholesaleBill';
		}
		getSetFactory.set(bill);
      	$state.go(gotoUrl);
	}
  	$scope.loadCounts = function() {
  		if($scope.headerType == 'Quotations Process'){
			var getStatusPath = apiPath.postQuotationBill+'/status/'+$rootScope.accView.companyId;
			var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'isQuotationProcess':'yes'};
			var getJrnlPath = apiPath.postQuotationBill;
		}
		apiCall.getCallHeader(getStatusPath,headerData).then(function(response){
			$scope.statusCounts = response;
			finalStatus = fetchArrayService.getfilteredSingleObject(response,'finalized','statusPosition');
			toaster.clear();
		});
  	}
  	$scope.loadInit();
  	$scope.deleteBill = function(size,id,isPurchaseBill = 'no')
	{
		toaster.clear();
		if (Modalopened) return;
		
		var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
			  controller: deleteDataModalController,
			  size: size
			});

		Modalopened = true;
		modalInstance.result.then(function () {
		// return false;
		 /**Delete Code **/
		 	if (isPurchaseBill == 'yes'){
		 		var deletePath = apiPath.postPurchaseBill+'/'+id;
		 	}else if (isPurchaseBill == 'quote') {
		 		var deletePath = apiPath.postQuotationBill+'/'+id+'/quote';
		 	}
		 	else{
		 		var deletePath = apiPath.postBill+'/'+id;
		 	}
			apiCall.deleteCall(deletePath).then(function(deleteres){
				
				//console.log(deleteres);
				if(apiResponse.ok == deleteres){
					
					$scope.loadInit();
				
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
	$scope.finishEditing = function(billObj) {
		
		toaster.clear();
		if (Modalopened) return;
		getSetFactory.set({msg: 'Do you want to set Bill as Edited?'});
		var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
			  controller: deleteDataModalController,
			  size: 'sm'
			});
		Modalopened = true;
		modalInstance.result.then(function () {
		// return false;
		 /**Delete Code **/
		 	var jrnPath = apiPath.postBill+'/'+billObj.saleId+'/status';
		 	var formd = new FormData();
		 	formd.set('statusType','finalized');
		 	formd.set('statusId',finalStatus.statusId);
		 	formd.set('status',finalStatus.status);
		 	formd.set('companyId',$rootScope.accView.companyId);
			apiCall.postCall(jrnPath,formd).then(function(statusres){
				//console.log(deleteres);
				if(apiResponse.ok == statusres){
					$scope.loadCounts();
					billObj.dispatchStatus = finalStatus.statusId;
					fetchArrayService.setUpdatedObject(saleData,billObj,billObj.saleId,'saleId');
					vm.tableParams2.reload();
					vm.tableParams2.page(1);
				}
				else{
					toaster.pop('warning', '', statusres);
				}
			});
		 /** End **/
		 
		 Modalopened = false;
		
		}, function () {	
		  Modalopened = false;
		  
		});
	}
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		
		return entDate; 
	}
	/** Reload Load Data **/
	$scope.reLoadPdfData = function(response)
	{
		toaster.clear();
		if (apiResponse.notFound == response) 
		{
			toaster.pop('alert', 'Opps!!', 'No Data Found');
			data = [];
		}
		else if (apiResponse.noContent == response) 
		{
			toaster.pop('alert', 'Opps!!', 'No Data Found');
			data = [];
		}
		else
		{
			data = response;
			// $scope.totalAmountDisplay = 0;
			var cnt = data.length;
			for(var p=0;p<cnt;p++)
			{
				// $scope.totalAmountDisplay = $filter('setDecimal')( parseFloat($scope.totalAmountDisplay) + parseFloat(data[p].total),2);
				data[p].repeatIcon = false;
				data[p].imageIcon = false;
				data[p].pdfIcon = false;
				data[p].singlePdfIcon = false;
				var productArrays = JSON.parse(data[p].productArray);
				data[p].displayProduct = productArrays.inventory;

				var fileCnt = 0;
				if (data[p].file != null) {
					fileCnt = data[p].file.length;
				}
				var flag = 0;
				
				for(var k=0;k<fileCnt;k++){
				
					if(data[p].file[k].documentFormat == 'pdf' && data[p].file[k].documentType == 'quotation')
					{
						flag++;
					}
				}
				
				if(flag == 0){
					data[p].repeatIcon = true;
				}
				else if(flag == 1){
					data[p].singlePdfIcon = true;
				}
				else{
					data[p].pdfIcon = true;
				}
				if ($scope.headerType == 'Quotations Process'){
					data[p].invoiceNumber = data[p].invoiceNumber;
					data[p].clientName = data[p].client.clientName;
				}
			}
		}
		
		if (vm.tableParams != undefined) {
			vm.tableParams.reload();
			vm.tableParams.page(1);
		}else{
			$scope.TableData();
		}
	}
	$scope.openPdf = function (size,singleBillData) {

		if (Modalopened) return;
		
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/imageGalleryModal/imageGalleryModalContent.html',
		  controller: imageGalleryModalCtrl,
		  size: size,
		  resolve:{
			  billData: function(){
				 
				return singleBillData;
			  },
			  formatType: function(){
				  
				 return 'pdf';
			  },
			  transType: function(){
				  
				  return 'none';
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
		
	
	};
	/** Reload Load Data **/
	$scope.reLoadPdfData2 = function(response)
	{
		toaster.clear();
		if (apiResponse.notFound == response) 
		{
			toaster.pop('alert', 'Opps!!', 'No Data Found');
			// $scope.totalAmountDisplay = 0;
			saleData = [];
		}
		else if (apiResponse.noContent == response) 
		{
			toaster.pop('alert', 'Opps!!', apiResponse.noContent);
			// $scope.totalAmountDisplay = 0;
			saleData = [];
		}
		else
		{
			saleData = response;
			// $scope.totalAmountDisplay = 0;

			var cnt = saleData.length;
			for(var p=0;p<cnt;p++)
			{
				// $scope.totalAmountDisplay = $filter('setDecimal')( parseFloat($scope.totalAmountDisplay) + parseFloat(saleData[p].total),2);

				if ($scope.headerType == 'Quotations Process') {
					if (!$rootScope.accView.branchId)  {
						if (angular.isObject(saleData[p].branch)) {
							saleData[p].branchName = saleData[p].branch.branchName;
						}
						else{
							saleData[p].branchName = '-';
						}
					}
				}
				saleData[p].repeatIcon = false;
				saleData[p].imageIcon = false;
				saleData[p].pdfIcon = false;
				saleData[p].singlePdfIcon = false;
				var productArrays = JSON.parse(saleData[p].productArray);
				saleData[p].displayProduct = productArrays.inventory;

				var fileCnt = 0;
				if (saleData[p].file != null) {
					fileCnt = saleData[p].file.length;
				}
				var flag = 0;
				
				for(var k=0;k<fileCnt;k++){
				
					if(saleData[p].file[k].documentFormat == 'pdf' && saleData[p].file[k].documentType == 'bill')
					{
						flag++;
					}
				}
				
				if(flag == 0){
					saleData[p].repeatIcon = true;
				}
				else if(flag == 1){
					saleData[p].singlePdfIcon = true;
				}
				else{
					saleData[p].pdfIcon = true;
				}
				if ($scope.headerType == 'Quotations Process'){
					saleData[p].invoiceNumber = saleData[p].invoiceNumber;
					saleData[p].clientName = saleData[p].client.clientName;
				}
			}
		}
		if (vm.tableParams2 != undefined) {
			vm.tableParams2.reload();
			vm.tableParams2.page(1);
		}else{
			$scope.TableData2();
		}
	}
	$scope.loadStatusData = function(obj)
	{
		if (obj.statusPosition=='quotation') {
			$scope.activeStatus = {statusId : obj.statusId};
			
			
		}else if (obj.statusPosition=='delivery' || obj.statusPosition=='finalized') {
			$scope.activeStatus = {dispatchStatus : obj.statusId};
			
		}else if (obj.statusPosition=='sales') {
			$scope.activeStatus = {dispatchStatus : 0};
		}

		if (vm.tableParams != undefined) {
			vm.tableParams.reload();
			vm.tableParams.page(1);
		}else{
			$scope.TableData();
		}
		if (vm.tableParams2 != undefined) {
			vm.tableParams2.reload();
			vm.tableParams2.page(1);
		}else{
			$scope.TableData2();
		}
		
		
	}
	$scope.TableData = function(){
		vm.tableParams = undefined;
		vm.tableParams = new ngTableParams({
			page: 1,            // show first page
			count: 10,          // count per page
			sorting: {
				invoiceNumber: 'asc'     // initial sorting
			}
		}, {
			// counts: [],
			total: data.length, // length of data
			getData: function($defer, params) {
				/** ngTable **/
				params.total(data.length);
				var orderedData = [];
				if(params.sorting().date === 'asc'){
					data.sort(function (a, b) {
						
						var entDate = a.entryDate.split("-").reverse().join("-");
								var toDate = b.entryDate.split("-").reverse().join("-");
								var dateA=new Date(entDate), dateB=new Date(toDate);
						return dateA - dateB; //sort by date descending
					});
					// orderedData = data;

				} else if(params.sorting().date === 'desc') {

				data.sort(function (a, b) {
					var entDate = a.entryDate.split("-").reverse().join("-");
							var toDate = b.entryDate.split("-").reverse().join("-");
							var dateA=new Date(entDate), dateB=new Date(toDate);
					return dateB - dateA; //sort by date descending
				});
				// orderedData = data;
				} else if(!params.sorting().date){
					orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
				}
				orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
				orderedData = $filter('filter')(orderedData, $scope.activeStatus);
				vm.tableParams.total(orderedData.length);
				$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				$scope.totalData = data.length;
				$scope.pageNumber = params.page();
	          	$scope.itemsPerPage = params.count();
	          	$scope.totalPages = Math.ceil($scope.totalData/params.count());
			}
		});
	}
	$scope.TableData2 = function(){
		vm.tableParams2 = undefined;
		vm.tableParams2 = new ngTableParams({
			page: 1,            // show first page
			count: 10,          // count per page
			sorting: {
				invoiceNumber: 'asc'     // initial sorting
			}
		}, {
			// counts: [],
			total: saleData.length, // length of saleData
			getData: function($defer, params) {
				/** ngTable **/
				params.total(saleData.length);
				var orderedData2 = [];
				if(params.sorting().date === 'asc'){
					saleData.sort(function (a, b) {
						
						var entDate = a.entryDate.split("-").reverse().join("-");
								var toDate = b.entryDate.split("-").reverse().join("-");
								var dateA=new Date(entDate), dateB=new Date(toDate);
						return dateA - dateB; //sort by date descending
					});
					orderedData2 = saleData;

				} else if(params.sorting().date === 'desc') {

				saleData.sort(function (a, b) {
					var entDate = a.entryDate.split("-").reverse().join("-");
							var toDate = b.entryDate.split("-").reverse().join("-");
							var dateA=new Date(entDate), dateB=new Date(toDate);
					return dateB - dateA; //sort by date descending
				});
				orderedData2 = $filter('filter')(saleData,$scope.activeStatus);
				} else if(!params.sorting().date){
					orderedData2 = params.sorting() ? $filter('orderBy')(saleData, params.orderBy()) : saleData;
				}
				orderedData2 = params.filter() ? $filter('filter')(orderedData2, params.filter()) : orderedData2;
				orderedData2 = $filter('filter')(orderedData2, $scope.activeStatus);
				vm.tableParams2.total(orderedData2.length);
				$defer.resolve(orderedData2.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				$scope.totalData2 = saleData.length;
				$scope.pageNumber2 = params.page();
	          	$scope.itemsPerPage2 = params.count();
	          	$scope.totalPages2 = Math.ceil($scope.totalData2/params.count());
			}
		});
	}
	$scope.editDataViewSales = function(id){
		getSetFactory.set(data.find(function(item){
			return item.quotationBillId == id;
		}));
		if($scope.headerType == 'Quotations Process'){
			$state.go("app.QuotationPrint");
		}
	}
	$scope.compareActiveStatus = function(status) {
		if ($scope.activeStatus.statusId == status.statusId || $scope.activeStatus.dispatchStatus == status.statusId) 
		{
			return 'active-panel';
		}
		else if ($scope.activeStatus.dispatchStatus==0 && status.statusPosition=='sales' && status.statusPosition=='finalized') 
		{
			return 'active-panel';
		}
		else
		{
			return 'bg-gray-lighter';
		}
	}
	$scope.convertToSales = function(id) {
		var modalInstance = $modal.open({
			templateUrl: 'app/views/PopupModal/Accounting/QuotationFlow.html',
			controller: 'QuotationFlowController as form',
			size: 'md',
			backdrop  : 'static',
			keyboard  : false,
			resolve:{
			  companyId: function(){
				return $rootScope.accView.companyId;
			  },
			  transactionType: function(){
			  	return 'SalesOrder';
			  }
			}
		});

		Modalopened = true;
		modalInstance.opened.then(function() {
			toaster.clear();
		});
		modalInstance.result.then(function (returnModalData) {
			toaster.pop('wait', 'Please Wait', 'Data Updating....',600000);
			Modalopened = false;
			if(angular.isObject(returnModalData)){
				var convertPath = apiPath.postQuotationBill+'/convert/'+id;
				var formdata = new FormData();
				formdata.set('workflowStatus',returnModalData.statusId.statusId);
				formdata.set('assignedTo',returnModalData.userId.userId);
				formdata.set('assignedBy',$rootScope.$storage.authUser.userId);
				apiCall.postCall(convertPath,formdata).then(function(convertres){
					toaster.clear();
					if(apiResponse.ok == convertres){
						$scope.loadInit();
						toaster.pop('success', 'Data Successfully Converted');
					}
					else{
						toaster.pop('warning', '', convertres);
					}
				});
			}
			
		}, function () {
			Modalopened = false;
			return false;
		});
	}
	$scope.itemListModel = function(sale){
		if (Modalopened) return;
	  	toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
	  	var statusType = 'list';
	  	if (sale.dispatchStatus == 0)
	  	{
	  		statusType = 'list';
	  	}
	  	else
	  	{
	  		statusType = 'dispatch';
	  	}
		var modalInstance = $modal.open({
		  templateUrl: 'app/views/PopupModal/Accounting/itemCheckListModal.html',
		  controller: 'AccDispatchItemModalController as form',
		  size: 'md',
		  resolve:
		  {
			  billData: function(){
				return sale;
			  },
			  statusType: function(){
			  	return statusType;
			  }
		  }
		});
		Modalopened = true;
		
		modalInstance.opened.then(function() {
			toaster.clear();
		});
		modalInstance.result.then(function (res) {
			if (res.result=='success') {
				$scope.loadCounts();
				sale.dispatchStatus = res.status;
				fetchArrayService.setUpdatedObject(saleData,sale,sale.saleId,'saleId');
				vm.tableParams2.reload();
				vm.tableParams2.page(1);
			}
			Modalopened = false;
		},function(){
			Modalopened = false;
		});
	}



	// Date picker functions
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
	this.clear = function () {
		this.dt1 = null;
	};
	this.check = function()
	{
		this.dt2 = this.dt1;
	};
	this.disabled = function(date, mode) {
		return false; //( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	this.today = function() {
		this.dt1 = new Date(moment($rootScope.accView.fromDate,apiDateFormate).format('YYYY-MM-DD'));
	};
	this.today();

	this.today2 = function() {
		this.dt2 = new Date(moment($rootScope.accView.toDate,apiDateFormate).format('YYYY-MM-DD'));
	};
	this.today2();

	this.initDate = new Date('2016-15-20');
  	var dateFormats = $rootScope.dateFormats;
}
AccFlowViewController.$inject = ["$rootScope","$scope", "$filter","$http", "ngTableParams","apiCall","apiPath","flotOptions","fetchArrayService","colors","$timeout","getSetFactory","$state","headerType","$modal","$window","toaster","apiResponse","apiDateFormate"];