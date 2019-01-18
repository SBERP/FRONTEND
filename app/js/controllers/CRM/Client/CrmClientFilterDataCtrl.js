
/**=========================================================
 * Module: CrmClientFilterDataController.js
 * Controller for ngTables
 =========================================================*/

App.controller('CrmClientFilterDataController', CrmClientFilterDataController);

function CrmClientFilterDataController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,apiResponse,toaster,getSetFactory,$window,$state,$modal,clientFactory) {
  'use strict';
  var vm = this;
	//$scope.brandradio="";
	
	var erpPath = $rootScope.erpPath;
	$scope.dateFormat =  $rootScope.dateFormats; //Date Format
	
	$scope.sticker = [];
	$scope.filteredItems;
	
  var data = [];
	var flag = 0;
	
	//$scope.filterCompanyId = $rootScope.accView.companyId;
	$scope.clientContact = $rootScope.accView.clientContact;
	$scope.clientName = $rootScope.accView.clientName;
	$scope.professionId = $rootScope.accView.professionId;
	
	$scope.clientEmailId = $rootScope.accView.emailId;
	$scope.clientAddress = $rootScope.accView.address;
	
	$scope.invoiceNumber = $rootScope.accView.invoiceNumber;
	$scope.jobCardNumber = $rootScope.accView.jobCardNumber;
	
	$scope.displayfromDate = $rootScope.accView.fromDate;
	$scope.displaytoDate = $rootScope.accView.toDate;
	$scope.displayJobCardFromDate = $rootScope.accView.jobCardFromDate;  // Jobcard
	$scope.displayJobCardToDate = $rootScope.accView.jobCardToDate;		// Jobcard
	

	$scope.enableDisableAddress = false;
	// $scope.enableDisableWorkNo = false;
	$scope.enableDisableState = false;
	$scope.enableDisableCity = false;
	$scope.enableDisableEmailId = false;
	
	// $scope.divTag = false;
	// $scope.colspanValue = '6';
	// $scope.colspanAdvanceValue = '7';
	// $scope.totalTd = '13';
	var settingResponse = [];
	//get setting data
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
		// console.log("setting response",response);
		for(var arrayData=0;arrayData<responseLength;arrayData++)
		{
			if(angular.isObject(response) || angular.isArray(response))
			{
				if(response[arrayData].settingType=="client")
				{
					var arrayData1 = response[arrayData];
					$scope.enableDisableAddress = arrayData1.clientAddressStatus=="enable" ? true : false;
					// $scope.enableDisableWorkNo = arrayData1.clientWorkNoStatus=="enable" ? true : false;
					$scope.enableDisableState = arrayData1.clientStateStatus=="enable" ? true : false;
					$scope.enableDisableCity = arrayData1.clientCityStatus=="enable" ? true : false;
					$scope.enableDisableEmailId = arrayData1.clientEmailIdStatus=="enable" ? true : false;
				}
			}
		}
	}
	// console.log('Contact: '+$rootScope.accView.clientContact);
	// console.log('Name: '+$rootScope.accView.clientName);
	// console.log('Email: '+$rootScope.accView.emailId);
	// console.log('Address: '+$rootScope.accView.address);
	// console.log('Invoice: '+$rootScope.accView.invoiceNumber);
	// console.log('Jobcard: '+$rootScope.accView.jobCardNumber);
	// console.log('fromdate: '+$rootScope.accView.fromDate);
	// console.log('todate: '+$rootScope.accView.toDate);
	//console.log('JobacrdFrom: '+$rootScope.accView.jobCardFromDate);
	//console.log('JobcardTo: '+$rootScope.accView.jobCardToDate);
	
	
	/** Display Company and date **/
		function getClientFilterData(){
			
			var headerData = {'Content-Type': undefined};
			
			if($scope.displayfromDate != '1-1-1970'){
				headerData.invoiceFromDate = $scope.displayfromDate;
			}
			
			if($scope.displaytoDate != '1-1-1970'){
				headerData.invoiceToDate = $scope.displaytoDate;
			}
			
			if($scope.displayJobCardFromDate != '1-1-1970'){
				headerData.jobCardFromDate = $scope.displayJobCardFromDate;
			}
			
			if($scope.displayJobCardToDate != '1-1-1970'){
				headerData.jobCardToDate = $scope.displayJobCardToDate;
			}
			
			if($scope.clientContact != undefined && $scope.clientContact != ''){
				headerData.contactNo = $scope.clientContact;
			}
			
			if($scope.clientName != undefined && $scope.clientName != ''){
				headerData.clientName = $scope.clientName;
			}
			
			if($scope.professionId != undefined && $scope.professionId != ''){
				headerData.professionId = $scope.professionId;
			}
			
			if($scope.clientEmailId != undefined && $scope.clientEmailId != ''){
				headerData.emailId = $scope.clientEmailId;
			}
			
			if($scope.clientAddress != undefined && $scope.clientAddress != ''){
				headerData.address = $scope.clientAddress;
			}
			
			if($scope.invoiceNumber != undefined && $scope.invoiceNumber != ''){
				headerData.invoiceNumber = $scope.invoiceNumber;
			}
			
			if($scope.jobCardNumber != undefined && $scope.jobCardNumber != ''){
				headerData.jobCardNumber = $scope.jobCardNumber;
			}
			
			if(Object.keys(headerData).length == 2 && headerData.hasOwnProperty('professionId')){
				var proId = headerData.professionId;
				clientFactory.getClientByProfession(proId).then(function(response){
					var arrangeDataVar = angular.copy(response);
					arrangeData(arrangeDataVar);
				});
			}
			else{
				loadingStart();
				apiCall.getCallHeader(apiPath.getAllClient,headerData).then(function(res){
					//console.log(res);
					var arrangeDataVar = res;
					arrangeData(arrangeDataVar);
					
				});
			}
		}
		
	getClientFilterData();
	
	
	function arrangeData(res){

		if(angular.isArray(res)){
					
			data = res;
			var cnt = res.length;
			
			for(var i=0;i<cnt;i++){
				
				data[i].selected = false;
				data[i].stateAbb = "";
				data[i].stateAbb = res[i].state.stateName;
				data[i].cityName = "";
				if(angular.isArray(res[i].city))
				{
					data[i].cityName = res[i].city.cityName;
				}
				data[i].professionName = "";
				data[i].professionName = res[i].profession.professionName;
			}
			toaster.clear();
		}
		else{
			if(res == ''){
				toaster.pop('info', 'No Response From Server');
			}
			else{
				toaster.pop('info', res);
			}
		}
		
		TableData();

	}
	/** End **/
	
	function loadingStart(){
		setTimeout(function() {
			toaster.pop('wait', 'Please Wait', 'Data Loading....',6000);
		}, 500);
		
	}
	// console.log($scope.filterCompanyId);
	// console.log($scope.displayfromDate);
	// console.log($scope.displaytoDate);
	
	//return false;
	$scope.checkAllArray = [];
	/** Api Call And NgTable **/
		
		function TableData(){
			 
		  $scope.tableParams = new ngTableParams({
			  page: 1,            // show first page
			  count: 10,          // count per page
			  sorting: {
				  clientName: 'asc'     // initial sorting
			  }
		  }, {
			  //counts: [],
			  total: data.length, // length of data
			  getData: function($defer, params) {
				 
				  /** New Sort Code **/
					  var filteredData = params.filter() ?
                  $filter('filter')(data, params.filter()) :
                  data;
				  
				  
				  
				  var orderedData = params.sorting() ?
						  $filter('orderBy')(filteredData, params.orderBy()) :
						  data;
						  
				  params.total(orderedData.length); // set total for recalc pagination
				  $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				  /** End **/
				$scope.filteredItems = orderedData;	
				$scope.totalData = data.length;
				$scope.pageNumber = params.page();
				$scope.itemsPerPage = params.count();
				$scope.totalPages = Math.ceil($scope.totalData/params.count());
				
				  }
		  });
		}
		
	/** End **/
	
	$scope.goToClientTransaction = function(id,tab = "",group=""){
		
		if(group == ""){
			getSetFactory.blank();
			var obj = {};
			obj.id = id;
			obj.tab = tab;
			getSetFactory.set(obj);
			
			if(tab == ""){
				$state.go('app.CrmClientHistory');
			}
			else{
			
				if(tab == 'email'){
					$state.go('app.CrmClientHistory.compose');
				}
				else{
					$state.go('app.CrmClientHistory.sms');
				}
			}
		}
		else{
			$scope.emailSmsPopup('lg',tab);
		}
		
	}
  
	$scope.selectedBoxArray = [];
	$scope.clientFlag=0;
	
	$scope.changeBox = function(box,pData){
		
		//console.log(box+'...'+pData);
		if(box == true){
			$scope.selectedBoxArray.push(pData);
		}
		else{
			var index = $scope.selectedBoxArray.indexOf(pData);
			$scope.selectedBoxArray.splice(index,1);
		}
		if($scope.selectedBoxArray.length < 1){
			$scope.sticker.multiQty = 0;
		}
	}
  
	$scope.changeAllBox = function(box){
		// console.log("innn change all box");
		if(box == false){
			// console.log("iff");
			$scope.clientFlag=0;
			$scope.selectedBoxArray = [];
			var cnt  = data.length;
			for(var k=0;k<cnt;k++){
				data[k].selected = false;
			}
		}
		else{
			// console.log("else");
			$scope.clientFlag=1;
			$scope.selectedBoxArray = [];
			$scope.selectedBoxArray = $scope.filteredItems;
			// console.log("consoldeeeeadsada  ",$scope.selectedBoxArray);
			if(Array.isArray($scope.selectedBoxArray))
			{
				var cnt  = $scope.selectedBoxArray.length;
				for(var k=0;k<cnt;k++){
					$scope.selectedBoxArray[k].selected = true;
				}
			}
			
		}
	}
	
	/** Sticker Single **/
		$scope.singleStickerPrint = function(pData){
	
		var qty  = pData.qty;
		
		var mywindow = window.open('', 'PRINT', 'height=850,width=850');

		 var is_chrome = Boolean(mywindow.chrome);

		var clientAddress = pData.address1 ? pData.address1:'----------';
		var clientContactNo= pData.contactNo ? pData.contactNo:'0000000000';
		var clientEmailId = pData.emailId ? pData.emailId:'@@@@@@@@@@';
		
		var textContactNo = '',textAddress = '',textEmail = '';
		
		if(clientContactNo != ''){
			textContactNo = "<br /><span style='font-size:12px'><b style='font-size:18px; vertical-align:middle'>&#128241; </b>&nbsp;&nbsp;"+clientContactNo+"</span>";
		}
		if(clientAddress != ''){
			textAddress = "<br /><span style='font-size:13px'><b style='font-size:18px;vertical-align:middle'>&#127968; </b>"+clientAddress+"</span>";
		}
		if(clientEmailId != ''){
			textEmail = "<br /><span style='font-size:12px'><b style='font-size:18px; vertical-align:middle'>&#x2709; </b>&nbsp;"+clientEmailId+"</span>";
		}
		var paddingButtom = '0px';
		
		for(var n=0;n<qty;n++){
		
			if(n != 0){
				paddingButtom = '5px';
			}
			mywindow.document.write('<html><!--head><title>' + document.title  + '</title>');
		
			mywindow.document.write("</head--> <style type='text/css' media='print'>@page {size: auto;margin: 0mm;} @media print {html, body {width: 7.4cm;height: 3.8cm;  }</style><body>");
			mywindow.document.write('<!--center> <h1> Barcode of Company </h1> </center-->');
			mywindow.document.write("<table><tr>");
		
			mywindow.document.write("<td style='display:inline-block;padding-top:0px;padding-bottom:"+paddingButtom+";'> ");
			
			mywindow.document.write("<span style='font-size:14px'><b>"+pData.clientName +"</b></span>"+textAddress+textContactNo+textEmail+"</td>");
				
			mywindow.document.write("</tr></table>");
			mywindow.document.write('</body></html>');
			
			if(n == qty-1){
				/** Next Code **/
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
				/** End **/
			}
			else{
				mywindow.document.write("</td>");
			}
		}
	}
	
	
	$scope.multiStickerPrint = function(){
		
		if($scope.clientFlag == 1){
			var dataArrayLength = $scope.filteredItems.length;
		}
		else{
			var dataArrayLength = $scope.selectedBoxArray.length;
		}
		
		var mywindow = window.open('', 'PRINT', 'height=850,width=850');
	
		 var is_chrome = Boolean(mywindow.chrome);
		 
		var paddingButtom = '0px';
		
		for(var dataIndex=0;dataIndex<dataArrayLength;dataIndex++){
			
			if($scope.clientFlag == 1){
				
				var arrayProductData = $scope.filteredItems[dataIndex];
			}
			else{
				var arrayProductData = $scope.selectedBoxArray[dataIndex];
			 }
			
			if($scope.sticker.multiQty > 0){
				
				var qtyLength = $scope.sticker.multiQty;
			}
			else{
				var qtyLength = arrayProductData.qty;
			}
			
			//Client Data
			var clientAddress = arrayProductData.address1 ? arrayProductData.address1:'----------';
			var clientContactNo= arrayProductData.contactNo ? arrayProductData.contactNo:'0000000000';
			var clientEmailId = arrayProductData.emailId ? arrayProductData.emailId:'@@@@@@@@@@';
			
			var textContactNo = '',textAddress = '',textEmail = '';
			
			if(clientContactNo != ''){
				textContactNo = "<br /><span style='font-size:12px'><b style='font-size:18px; vertical-align:middle'>&#128241; </b>&nbsp;&nbsp;"+clientContactNo+"</span>";
			}
			if(clientAddress != ''){
				textAddress = "<br /><span style='font-size:13px'><b style='font-size:18px;vertical-align:middle'>&#127968; </b>"+clientAddress+"</span>";
			}
			if(clientEmailId != ''){
				textEmail = "<br /><span style='font-size:12px'><b style='font-size:18px; vertical-align:middle'>&#x2709; </b>&nbsp;"+clientEmailId+"</span>";
			}
			//End Client Data
			
			for(var qtyIndex=0;qtyIndex<qtyLength;qtyIndex++){
				
				if(n != 0){
					paddingButtom = '5px';
				}
			
				mywindow.document.write('<html>');
		
				mywindow.document.write("<style type='text/css' media='print'>@page {size: auto;margin: 0mm;} @media print {html, body {width: 7.4cm;height: 3.8cm;  }</style><body>");
				mywindow.document.write('<!--center> <h1> Barcode of Company </h1> </center-->');
				mywindow.document.write("<table><tr>");
		
				mywindow.document.write("<td style='display:inline-block;padding-top:5px;padding-bottom:"+paddingButtom+";'> ");
				
				mywindow.document.write("<span style='font-size:14px'><b>"+arrayProductData.clientName +"</b></span>"+textAddress+textContactNo+textEmail+"</td>");
				
				mywindow.document.write("</tr></table>");
				mywindow.document.write('</body></html>');
	
			}
			
			if(dataIndex == dataArrayLength-1)
			{
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
			
				// mywindow.focus(); // necessary for IE >= 10*/
				// mywindow.print();
				// mywindow.close();

				return true;
			}
		}
	}
	/** End **/
	/** Email/SMS Popup **/
		var Modalopened = false;
		
		$scope.emailSmsPopup = function(size,tab){
		
			toaster.clear();
			
			if (Modalopened) return;
			
			 toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
		
			var modalInstance = $modal.open({
				templateUrl: 'app/views/PopupModal/CRM/emailSms.html',
				controller: emailSmsModalController,
				resolve:{
					clientArrayData: function(){
						return $scope.selectedBoxArray;
					},
					emailSMS: function(){
						return tab;
					}
				}
			});

			Modalopened = true;
		   
			modalInstance.opened.then(function() {
				toaster.clear();
			});
		
				modalInstance.result.then(function (data) {
					Modalopened = false;
					toaster.clear();
					if(data == 'emailSuccess'){
						toaster.pop('success','Email Successfully Send');
					}
					else if(data == 'smsSuccess'){
						toaster.pop('success','SMS Successfully Send');
					}
				}, function () {
				  console.log('Cancel');
					Modalopened = false;
				});
			
			
		}
		
	/** End **/
	
	
	/** Client Update Modal **/
		$scope.editClientData = function(size,userData){
		
			toaster.clear();
			
			if (Modalopened) return;
			
			 toaster.pop('wait', 'Please Wait', 'popup opening....',600000);
		
			var modalInstance = $modal.open({
				templateUrl: 'app/views/PopupModal/CRM/clientForm.html',
				controller: 'clientFormModalController as form',
				resolve:{
					clientEditData: function(){
						return userData;
					}
				}
			});

			Modalopened = true;
		   
			modalInstance.opened.then(function() {
				toaster.clear();
			});
		
				modalInstance.result.then(function (returnModalData) {
					Modalopened = false;
					afterEditClient(returnModalData);
					
				}, function () {
				  console.log('Cancel');
					Modalopened = false;
				});
			
			
		}
	/** End **/
	
	//After Edit Client
	function afterEditClient(returnModalData){
		if(angular.isObject(returnModalData)){
			returnModalData.stateAbb = "";
			returnModalData.stateAbb = returnModalData.state.stateName;
			returnModalData.cityName = "";
			returnModalData.cityName = returnModalData.city.cityName;
			returnModalData.professionName = "";
			returnModalData.professionName = returnModalData.profession.professionName;
			var cId = returnModalData.clientId;
			var index = data.findIndex(function(o){
				 return o.clientId == cId;
			});
			if (index !== -1){
				data[index] = returnModalData;
			}
			toaster.pop('success','Updated Successfully');
			$scope.tableParams.reload();
		}
	}
	//Date Convert
	
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		
		return entDate; 
	}
	
}
CrmClientFilterDataController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","apiResponse","toaster","getSetFactory","$window","$state","$modal","clientFactory"];