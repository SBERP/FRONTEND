
App.controller('settingRemindersController', settingRemindersController);

function settingRemindersController($rootScope,$scope,apiCall,apiPath,toaster,apiResponse,validationMessage) {
  'use strict';
  var vm = this;
 
  $scope.birthReminder = {};
  $scope.anniReminder = {};
  $scope.paymentDate = {};
  $scope.birthReminder.birthday={};
  $scope.anniReminder.annivesary={};
  $scope.paymentDate.payment={};
  var formdata = new FormData();

  $scope.anniReminder.annivesary.notify = 'sms';
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	// Birthday
  	// ----------------------------------- 
		vm.reminderHour = ["1 hour","2 hour","4 hour","6 hour","12 hour","24 hour"];         
		vm.beforeAfterTime = ["before","after"];  
    var formdata = new FormData();       
		// Birthday
		vm.updateBirthReminder = function(birthReminder){
      console.log("birth reminder data = ",birthReminder);
      
      formdata.append('birthreminderNotifyBy',birthReminder.birthday.notify);
      formdata.append('birthreminderType',birthReminder.birthday.prefixTime);
      formdata.append('birthreminderTime',birthReminder.birthday.time);
      if(birthReminder.birthday.toggle)
      {
        formdata.append('birthreminderStatus',"on");
      }
      else
      {
        formdata.append('birthreminderStatus',"off");
      }
      var reminderApiPath = apiPath.settingOption;
      
      if($scope.birthDateButton == "Update")
      {
        $scope.updateReminderData(reminderApiPath,"birth");
      }
      else
      {
        $scope.insertReminderData(reminderApiPath,"birth");
      }
    }

    //AnniversaryDate
    vm.updateAnniReminder = function(anniReminder){
			formdata.append('annireminderNotifyBy',anniReminder.annivesary.notify);
      formdata.append('annireminderType',anniReminder.annivesary.prefixTime);
      formdata.append('annireminderTime',anniReminder.annivesary.time);
      if(anniReminder.annivesary.toggle)
      {
        formdata.append('annireminderStatus',"on");
      }
      else
      {
        formdata.append('annireminderStatus',"off");
      }
      var reminderApiPath = apiPath.settingOption;
      
      if($scope.anniDateButton == "Update")
      {
        $scope.updateReminderData(reminderApiPath,"anni");
      }
      else
      {
        $scope.insertReminderData(reminderApiPath,"anni");
      }
		}

    //paymentdata
    vm.updatepaymentData = function(paymentData)
    {
        formdata.append('paymentdateNoOfDays',paymentData.payment.noOfDays);
        if(paymentData.payment.toggle)
        {
          formdata.append('paymentdateStatus',"on");
        }
        else
        {
          formdata.append('paymentdateStatus',"off");
        }
        var reminderApiPath = apiPath.settingOption;
        if($scope.paymentButton == "Update")
        {
          $scope.updateReminderData(reminderApiPath,"paymentData");
        }
        else
        {
          $scope.insertReminderData(reminderApiPath,"paymentData");
        }
    }

    //insert reminder data
    $scope.insertReminderData = function(reminderApiPath,type)
    {
      //api call for saving birthdate-anniversarydate
      apiCall.postCall(reminderApiPath,formdata).then(function(reminderResponseData)
      {
          if(apiResponse.ok == reminderResponseData)
          {
              if(type==="anni")
              {
                $scope.anniDateButton="Update";  
              }
              else if(type==="birth")
              {
                $scope.birthDateButton="Update";
              }
              else if(type == "paymentData")
              {
                $scope.paymentButton="Update";
              }
              toaster.pop('success', 'Title', 'Successfull');
              formdata = new FormData();
              //get reminder-data
              $scope.getReminderData();
          }
          else
          {
            toaster.pop('warning', 'Opps!!', reminderResponseData);
          }
          formdata.delete('birthreminderNotifyBy');
          formdata.delete('birthreminderType');
          formdata.delete('birthreminderTime');
          formdata.delete('annireminderNotifyBy');
          formdata.delete('annireminderType');
          formdata.delete('annireminderTime');
          formdata.delete('paymentdateNoOfDays');
          formdata.delete('paymentdateStatus');
          formdata.delete('annireminderStatus');
          formdata.delete('birthreminderStatus');
      }); 
    }

    //update reminder data
    $scope.updateReminderData = function(reminderApiPath,type)
    {
      //api call for saving birthdate-anniversarydate
      apiCall.patchCall(reminderApiPath,formdata).then(function(reminderResponseData)
      {
          if(apiResponse.ok == reminderResponseData)
          {
              if(type==="anni")
              {
                $scope.anniDateButton="Update";  
              }
              else if(type==="birth")
              {
                $scope.birthDateButton="Update";
              }
              else if(type == "paymentData")
              {
                $scope.paymentButton="Update";
              }
              toaster.pop('success', 'Title', 'Successfull');
              formdata = new FormData();
              //get reminder-data
              $scope.getReminderData();

          }
          else
          {
            toaster.pop('warning', 'Opps!!', reminderResponseData);
          }
          formdata.delete('birthreminderNotifyBy');
          formdata.delete('birthreminderType');
          formdata.delete('birthreminderTime');
          formdata.delete('annireminderNotifyBy');
          formdata.delete('annireminderType');
          formdata.delete('annireminderTime');
          formdata.delete('paymentdateNoOfDays');
          formdata.delete('paymentdateStatus');
          formdata.delete('annireminderStatus');
          formdata.delete('birthreminderStatus');
      }); 
    }

    $scope.getReminderData = function()
    {
      var reminderApiPath = apiPath.settingOption;
      apiCall.getCall(reminderApiPath).then(function(getResponse){
          
          var dataArrayLength = getResponse.length;
          var birthFlag=0;
          var anniFlag=0;
          var paymentFlag=0;
          for(var dataArray=0;dataArray<dataArrayLength;dataArray++)
          {
            if(getResponse[dataArray].settingType == "birthreminder")
            {
              $scope.birthDateButton="Update";
              birthFlag=1;
              $scope.birthReminder.birthday.toggle = getResponse[dataArray].birthreminderStatus==="on" ? true :false;
              $scope.birthReminder.birthday.notify = getResponse[dataArray].birthreminderNotifyBy;
              $scope.birthReminder.birthday.time = getResponse[dataArray].birthreminderTime;
              $scope.birthReminder.birthday.prefixTime = getResponse[dataArray].birthreminderType;
              $scope.birthReminder.birthday.settingId = getResponse[dataArray].settingId;
            }
            if(getResponse[dataArray].settingType == "annireminder")
            {
              $scope.anniDateButton="Update";
              anniFlag=1;
              $scope.anniReminder.annivesary.toggle = getResponse[dataArray].annireminderStatus==="on" ? true :false;
              $scope.anniReminder.annivesary.notify = getResponse[dataArray].annireminderNotifyBy;
              $scope.anniReminder.annivesary.time = getResponse[dataArray].annireminderTime;
              $scope.anniReminder.annivesary.prefixTime = getResponse[dataArray].annireminderType;
              $scope.anniReminder.annivesary.settingId = getResponse[dataArray].settingId;
            }
            if(getResponse[dataArray].settingType == "paymentdate")
            {
              $scope.paymentButton="Update";
              paymentFlag=1;
              $scope.paymentDate.payment.toggle = getResponse[dataArray].paymentdateStatus==="on" ? true :false;
              $scope.paymentDate.payment.noOfDays = getResponse[dataArray].paymentdateNoOfDays;
            }
          }
          if(birthFlag==0)
          {
            $scope.birthDateButton="Save";
          }
          if(anniFlag==0)
          {
            $scope.anniDateButton="Save";
          }
          if(paymentFlag==0)
          {
            $scope.paymentButton="Save";
          }
      });
    }
    $scope.getReminderData();
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
settingRemindersController.$inject = ["$rootScope","$scope","apiCall","apiPath","toaster","apiResponse","validationMessage"];