
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/
//$.getScript('app/vendor/ng-table/ng-table.min.js');
//$.getScript('app/vendor/ng-table/ng-table.min.css');


App.controller('emailSmsModalController',emailSmsModalController);

function emailSmsModalController($scope, $modalInstance,$rootScope,$http,apiCall,apiPath,apiResponse,$timeout,clientArrayData,emailSMS,maxImageSize,toaster,validationMessage) {
  'use strict';
  
	 var data = [];
	 var vm = this;
	 
	$scope.email = [];
	$scope.sms = [];
	$scope.attachFile = [];
	
	$scope.emailSMS = emailSMS;
	$scope.clientArrayData = clientArrayData;
	$scope.stockModel=[];
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	/** Email or SMS **/
		
		if($scope.emailSMS == 'email'){
			$scope.emailOrSms = "app/views/CRM/Client/mailCompose.html";
			$scope.displayName = "Email";

		}
		else{
			$scope.emailOrSms = "app/views/CRM/Client/sms.html";
			$scope.displayName = "SMS";
		}
		
		$scope.sendEmail = function(){
			
			var formdata = new FormData();
			
			var cnt = $scope.clientArrayData.length;
			for(var i=0;i<cnt;i++)
			{
				var clientData = $scope.clientArrayData[i];
				formdata.append('client['+i+'][clientId]',clientData.clientId);
			}
				
			if($scope.emailSMS == 'email'){
				
				if($scope.email.cc){
					
					formdata.append('ccEmailId',$scope.email.cc);
				}
				if($scope.email.bcc){
					
					formdata.append('bccEmailId',$scope.email.bcc);
				}
				
				formdata.append('subject',$scope.email.subject);
				var conversation = $('#editor').html();
				formdata.append('conversation',conversation);
				// formdata.append('conversationType',$scope.emailSMS);
				
				if($scope.attachFile.length > 0){
					formdata.append('file[]',$scope.attachFile[0]);
				}
				
				var mailSmsPath = apiPath.sendEmail;
			}
			else{
				
				var mailSmsPath = apiPath.sendSMS;
				
				// formdata.append('conversationType','sms');
				formdata.append('conversation',$scope.sms.conversation);
				
			}
			
			apiCall.postCall(mailSmsPath,formdata).then(function(response){
				if(apiResponse.ok == response){
					if($scope.emailSMS == 'email'){
						$modalInstance.close('emailSuccess');
						$scope.email = [];
						$('#editor').html('');
						angular.element("input[type='file']").val(null);
						$scope.attachFile = [];
						
					}
					else{
						$modalInstance.close('smsSuccess');
						$scope.sms = [];
					}
				}
				else{
					if(angular.isArray(response)){
						alert('Some Email Not Send');
						console.log(response);
					}
					else{
						alert(response);
					}
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
	
	if($rootScope.ArraystockModel)
	{
		$scope.stockModel.state=$rootScope.ArraystockModel.state;
		$scope.stockModel.state2=$rootScope.ArraystockModel.state2;
		$scope.stockModel.state3=$rootScope.ArraystockModel.state3;
	}
  // $scope.stockModel.state;

    $scope.ok = function () {
      $modalInstance.close('ok');
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
	
	
}

emailSmsModalController.$inject = ["$scope", "$modalInstance","$rootScope","$http","apiCall","apiPath","apiResponse","$timeout","clientArrayData","emailSMS","maxImageSize","toaster","validationMessage"];
