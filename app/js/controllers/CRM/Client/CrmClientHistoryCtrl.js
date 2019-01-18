

App.controller('CrmClientHistoryController', CrmClientHistoryController);

function CrmClientHistoryController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,$timeout,getSetFactory,$state,$modal,$window,toaster,apiResponse,maxImageSize,validationMessage) {
  'use strict';
  var vm = this;
  var data = [];
  var formdata = new FormData();
  $scope.billData = [];
  $scope.email = [];
  $scope.sms = [];
  $scope.attachFile = [];
  
  var Modalopened = false;
  
	$scope.erpPath = $rootScope.erpPath; //Erp Path
	
	$scope.dateFormat =  $rootScope.dateFormats; //Date Format
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	$scope.openEMail = function(type){
		$scope.emailSMS = type;
		if(type == 'email'){
			// angular.element('#input-btn-switch-default-email').attr('checked', true);
			// angular.element('#input-btn-switch-default-sms').attr('checked', false);
			$state.go('app.CrmClientHistory.compose');
		}
		else{
			// angular.element('#input-btn-switch-default-sms').attr('checked', true);
			// angular.element('#input-btn-switch-default-email').attr('checked', false);
			$state.go('app.CrmClientHistory.sms');
		}
	}
		
	/** Display Company and date **/
	
		var clientFactory = getSetFactory.get();
		getSetFactory.blank();
		
		var clientId = clientFactory.id;
		if(clientId == '' || clientId == null || clientId == undefined || clientId == 0){
			$state.go('app.CrmClientFilterView');
		}
		// console.log(clientFactory);
		// console.log(clientId);
		
		if(clientFactory.tab == 'email' || clientFactory.tab == 'sms'){
			
			$scope.activeDetail = false;
			$scope.activeEmail = true;
			
			// $scope.emailSMS = clientFactory.tab;
			$scope.openEMail(clientFactory.tab);
		}
		else{
			$scope.activeDetail = true;
			$scope.activeEmail = false;
			// $scope.emailSMS = 'email';
			$scope.openEMail('email');
		}
		
		apiCall.getCall(apiPath.getAllClient+'/'+clientId).then(function(res){
			
			$scope.ClientData = res;
			
			toaster.clear();
			//toaster.pop('wait', 'Please Wait', 'Data Loading....',30000);
			
		});
		// $scope.displayCompany = $rootScope.accView.companyId;
		  $scope.displayfromDate = $rootScope.accView.fromDate;
		  $scope.displaytoDate = $rootScope.accView.toDate;
	/** End **/
  // An array of boolean to tell the directive which series we want to show
 
  
	  // console.log($rootScope.accView.companyId);
	  // console.log($rootScope.accView.fromDate);
	  // console.log($rootScope.accView.toDate);
	 
  $scope.TableData = function(){
	
	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  ledgerName: 'asc'     // initial sorting
		  }
	  }, {
		  // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			
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

	//Date Convert
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		return entDate; 
	}
	
	$scope.sortComment = function(comment) {
		
		var getResdate = comment.entryDate;
		var splitedate = getResdate.split("-").reverse().join("-");
		var date = new Date(splitedate);
		return date;
		
	};
	
	
	/** Email/SMS **/
	
		// Bootstrap Wysiwyg
		 // ----------------------------------- 
		 
		  $scope.editorFontFamilyList = [
			'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier',
			'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact',
			'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
			'Times New Roman', 'Verdana'
		  ];
		  
		  $scope.editorFontSizeList = [
			{value: 1, name: 'Small'},
			{value: 3, name: 'Normal'},
			{value: 5, name: 'Huge'}
		  ];
	  
		// Send Mail/SMS
			// -----------------------------------
		$scope.sendEmail = function(){
			
			var formdata = new FormData();
			
			var clientData = $scope.ClientData;
			formdata.set('client[0][clientId]',clientData.clientId);
			
			if($scope.emailSMS == 'email'){
				
				if($scope.email.cc){
					
					formdata.set('ccEmailId',$scope.email.cc);
				}
				if($scope.email.bcc){
					
					formdata.set('bccEmailId',$scope.email.bcc);
				}
				
				formdata.set('subject',$scope.email.subject);
				var conversation = $('#editor').html();
				formdata.set('conversation',conversation);
				// formdata.set('conversationType',$scope.emailSMS);
				
				if($scope.attachFile.length > 0){
					
					formdata.set('file[]',$scope.attachFile[0]);
				}
				
				var mailSmsPath = apiPath.sendEmail;
			}
			else{
				
				var mailSmsPath = apiPath.sendSMS;
				// formdata.set('conversationType','sms');
				formdata.set('conversation',$scope.sms.conversation);
				
				clientData.contactNo != null || clientData.contactNo != undefined || clientData.contactNo != '' ? formdata.set('contactNo',clientData.contactNo) : '';
				
			}
			
			apiCall.postCall(mailSmsPath,formdata).then(function(response){
				if(apiResponse.ok == response){
					$scope.email = [];
					$scope.sms = [];
					$('#editor').html('');
					angular.element("input[type='file']").val(null);
					$scope.attachFile = [];
				}
				else{
					toaster.clear();
					toaster.pop('warning',response);
				}
					
			});
		}
		
		//Set Multiple File In Formdata On Change
		$scope.uploadFile = function(files) {
			$scope.attachFile = [];
			//console.log(files);
			//formdata.append("file[]", files[0]);
			var flag = 0;
			
			for(var m=0;m<files.length;m++){
				
				if(parseInt(files[m].size) > maxImageSize){
					
					flag = 1;
					toaster.clear();
					//toaster.pop('alert','Image Size is Too Long','');
					toaster.pop('alert', 'Opps!!', 'Image Size is Too Long');
					angular.element("input[type='file']").val(null);
					break;
				}
				
			}
			
			if(flag == 0){
				
				toaster.clear();
				angular.forEach(files, function (value,key) {
					$scope.attachFile.push(value);
				});
			}

		};
	
		
	/** End **/
}
CrmClientHistoryController.$inject = ["$rootScope","$scope", "$filter", "ngTableParams","apiCall","apiPath","$timeout","getSetFactory","$state","$modal","$window","toaster","apiResponse","maxImageSize","validationMessage"];