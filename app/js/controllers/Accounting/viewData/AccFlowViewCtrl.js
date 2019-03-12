App.controller('AccFlowViewController', AccFlowViewController);

function AccFlowViewController($rootScope,$scope, $filter, $http, ngTableParams,apiCall,apiPath,flotOptions, colors,$timeout,getSetFactory,$state,headerType,$modal,$window,toaster,apiResponse,apiDateFormate) {
  	'use strict';
  	var vm = this;
  	var data = [];
   	$scope.filteredItems;
  	var Modalopened = false;
  
	$scope.erpPath = $rootScope.erpPath; //Erp Path
	$scope.headerType = headerType;
	$scope.dateFormat =  $rootScope.dateFormats; //Date Format
   	$scope.statusCounts = [];
   	$scope.activeStatus = {statusId : 1};
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
  		if($scope.headerType == 'Quotations Process'){
			var getStatusPath = apiPath.postQuotationBill+'/status/'+$rootScope.accView.companyId;
			var headerData = {'Content-Type': undefined,'fromDate':$rootScope.accView.fromDate,'toDate':$rootScope.accView.toDate,'isQuotationProcess':'yes'};
			var getJrnlPath = apiPath.postQuotationBill;
		}
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);  		
			apiCall.getCallHeader(getStatusPath,headerData).then(function(response){
			$scope.statusCounts = response;
		});
  		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
  		apiCall.getCallHeader(getJrnlPath,headerData).then(function(response){
			$scope.reLoadPdfData(response);
		}).catch(function (reason) {
			 if (reason.status === 500) {
				alert('Encountered server error');
			 }
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
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		
		return entDate; 
	}
	/** Reload Load Data **/
	$scope.reLoadPdfData = function(response)
	{
		toaster.clear();
		if (apiResponse.notFound == response) {
			toaster.pop('alert', 'Opps!!', 'No Data Found');
			return false;
		}
		data = response;
		$scope.totalAmountDisplay = 0;

		var cnt = data.length;
		for(var p=0;p<cnt;p++)
		{
			$scope.totalAmountDisplay = $filter('setDecimal')( parseFloat($scope.totalAmountDisplay) + parseFloat(data[p].total),2);

			if ($scope.headerType == 'Quotations Process') {
				if (!$rootScope.accView.branchId)  {
					if (angular.isObject(data[p].branch)) {
						data[p].branchName = data[p].branch.branchName;
					}
					else{
						data[p].branchName = '-';
					}
				}
			}
			data[p].repeatIcon = false;
			data[p].imageIcon = false;
			data[p].pdfIcon = false;
			data[p].singlePdfIcon = false;
			var productArrays = JSON.parse(data[p].productArray);
			data[p].displayProduct = productArrays.inventory;
			var fileCnt = data[p].file.length;
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
		$scope.TableData();
	}
	$scope.loadStatusData = function(obj)
	{
		$scope.activeStatus.statusId = obj.statusId;
	}
	$scope.TableData = function(){
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
				var orderedData;
				if(params.sorting().date === 'asc'){
					data.sort(function (a, b) {
						
						var entDate = a.entryDate.split("-").reverse().join("-");
								var toDate = b.entryDate.split("-").reverse().join("-");
								var dateA=new Date(entDate), dateB=new Date(toDate);
						return dateA - dateB; //sort by date descending
					});
					orderedData = data;

				} else if(params.sorting().date === 'desc') {

				data.sort(function (a, b) {
					var entDate = a.entryDate.split("-").reverse().join("-");
							var toDate = b.entryDate.split("-").reverse().join("-");
							var dateA=new Date(entDate), dateB=new Date(toDate);
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
	$scope.editDataViewSales = function(id){
		getSetFactory.set(data.find(function(item){
			return item.quotationBillId == id;
		}));
		if($scope.headerType == 'Quotations Process'){
			$state.go("app.QuotationPrint");
		}
	}
	$scope.compareActiveStatus = function(status) {
		if ($scope.activeStatus.statusId == status.statusId) {
			return 'active-panel';
		}else{
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
}
AccFlowViewController.$inject = ["$rootScope","$scope", "$filter","$http", "ngTableParams","apiCall","apiPath","flotOptions","colors","$timeout","getSetFactory","$state","headerType","$modal","$window","toaster","apiResponse","apiDateFormate"];