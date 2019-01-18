
App.controller('settingIntegrationController', settingIntegrationController);

function settingIntegrationController($rootScope,$scope,apiCall,apiPath,toaster,apiResponse,validationMessage) {
  'use strict';
  var vm = this;
 
  $scope.integration = {};
  $scope.integration.web={};
 
  var formdata = new FormData();

	/* VALIDATION */
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	/* VALIDATION END */
	
	// Web Integration
  	// ----------------------------------- 
	vm.updateBirthReminder = function()
	{
	      // console.log("birth reminder data = ",$scope.integration.web);
	       // var formdata = new FormData();
        formdata.set('webintegrationUserId',$scope.integration.web.userId);
        formdata.set('webintegrationPassword',$scope.integration.web.password);
        formdata.set('webintegrationPushUrl',$scope.integration.web.pushUrl);
        if($scope.integration.web.toggle)
        {
          formdata.set('webintegrationStatus',"on");
        }
        else
        {
          formdata.set('webintegrationStatus',"off"); 
        }
         
	      var reminderApiPath = apiPath.settingOption;
	      
	      if($scope.webIntegrationButton == "Update")
	      {
	      	var apiPostPatchCall = apiCall.patchCall;
	        $scope.insertReminderData(apiPostPatchCall,reminderApiPath,"web");
	      }
	      else
	      {
	      	var apiPostPatchCall = apiCall.postCall;
	        $scope.insertReminderData(apiPostPatchCall,reminderApiPath,"web");
	      }
    }

    //insert data
    $scope.insertReminderData = function(apiPostPatchCall,reminderApiPath,type)
    {
      	//api call post or patch
      	apiPostPatchCall(reminderApiPath,formdata).then(function(integrationResponseData)
      	{
      		console.log('insert/Update Integration',integrationResponseData);
	        if(apiResponse.ok == integrationResponseData)
	        {
	            if(type==="web")
	            {
	                $scope.webIntegrationButton="Update";
	            }

	            toaster.pop('success', 'Title', 'Successfull');
	            formdata = new FormData();
	            //get reminder-data
	            $scope.getAllIntegrationData();
	        }
	        else
	        {
	            toaster.pop('warning', 'Opps!!', integrationResponseData);
	        }
	          formdata.delete('webintegrationUserId');
	          formdata.delete('webintegrationPassword');
	          formdata.delete('webintegrationPushUrl');
	          formdata.delete('webintegrationStatus');
      	}); 
    }

    $scope.getAllIntegrationData = function()
    {
      var reminderApiPath = apiPath.settingOption;
      apiCall.getCall(reminderApiPath).then(function(getResponse){
          console.log('get Integration',getResponse);

          var dataArrayLength = getResponse.length;
          var webFlag=0;
          for(var dataArray=0;dataArray<dataArrayLength;dataArray++)
          {
            if(getResponse[dataArray].settingType == "webintegration")
            {
              $scope.webIntegrationButton="Update";
              webFlag=1;
              $scope.integration.web.toggle = getResponse[dataArray].webintegrationStatus==="on" ? true :false;
              $scope.integration.web.userId = getResponse[dataArray].webintegrationUserId;
              $scope.integration.web.password = getResponse[dataArray].webintegrationPassword;
              $scope.integration.web.pushUrl = getResponse[dataArray].webintegrationPushUrl;
            }
          }
          if(webFlag==0)
          {
            $scope.webIntegrationButton="Save";
          }
      });
    }
    $scope.getAllIntegrationData();
  // Datepicker
  // ----------------------------------- 

  this.today = function() {
    this.dt = new Date();
  };
  this.today();

  this.clear = function () {
    this.dt = null;
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

  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  this.initDate = new Date('2016-15-20');
  this.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  this.format = this.formats[0];

  // Timepicker
  // ----------------------------------- 
  this.mytime = new Date();

  this.hstep = 1;
  this.mstep = 15;

  this.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  this.ismeridian = true;
  this.toggleMode = function() {
    this.ismeridian = ! this.ismeridian;
  };

  this.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    this.mytime = d;
  };

  this.changed = function () {
    console.log('Time changed to: ' + this.mytime);
  };

  this.clear = function() {
    this.mytime = null;
  };

  // Input mask
  // ----------------------------------- 

  this.testoption = {
        "mask": "99-9999999",
        "oncomplete": function () {
            console.log();
            console.log(arguments,"oncomplete!this log form controler");
        },
        "onKeyValidation": function () {
            console.log("onKeyValidation event happend! this log form controler");
        }
    };

  //default value
  this.test1 = new Date();

  this.dateFormatOption = {
      parser: function (viewValue) {
          return viewValue ? new Date(viewValue) : undefined;
      },
      formatter: function (modelValue) {
          if (!modelValue) {
              return "";
          }
          var date = new Date(modelValue);
          return (date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()).replace(/\b(\d)\b/g, "0$1");
      },
      isEmpty: function (modelValue) {
          return !modelValue;
      }
  };

  this.mask = { regex: ["999.999", "aa-aa-aa"]};

  this.regexOption = {
      regex: "[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+\\.[a-zA-Z]{2,4}"
  };

  this.functionOption = {
   mask: function () {
      return ["[1-]AAA-999", "[1-]999-AAA"];
  }};

  // Bootstrap Wysiwyg
  // ----------------------------------- 
 
  this.editorFontFamilyList = [
    'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier',
    'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact',
    'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
    'Times New Roman', 'Verdana'
  ];
  
  this.editorFontSizeList = [
    {value: 1, name: 'Small'},
    {value: 3, name: 'Normal'},
    {value: 5, name: 'Huge'}
  ];
}
settingIntegrationController.$inject = ["$rootScope","$scope","apiCall","apiPath","toaster","apiResponse","validationMessage"];