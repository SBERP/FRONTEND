/** Modal to add IMEI/ Serial on bill **/
App.controller('AccDispatchItemModalController', AccDispatchItemModalController);

function AccDispatchItemModalController($scope,toaster,$modalInstance,$filter,statusType,billData,productFactory,ngTableParams,$rootScope,apiCall,apiPath,validationMessage,apiResponse){
    'use strict';
    var vm = this;
    var data = [];
    var orderedData = [];
    vm.users = [];
    $scope.checkArray = [];
    $scope.qtyArray = [];
    $scope.checkAllBox = false;
    $scope.disableButton = false;
    vm.statusType = statusType;
    var dispatchResObj = {result:'success',status:7};
    $scope.fixProducts = function(){
      for (var i = 0; i < $scope.TableData.length; i++) {

        (function(d){
          $scope.qtyArray[d] = angular.copy($scope.TableData[d].qty);
          $scope.checkArray[d] = false;
          productFactory.getSingleProduct($scope.TableData[d].productId).then(function(resData){
            $scope.TableData[d].lengthStatus = resData.measurementUnit.lengthStatus == "enable" ? true : false;
            $scope.TableData[d].heightStatus = resData.measurementUnit.heightStatus == "enable" ? true : false;
            $scope.TableData[d].widthStatus = resData.measurementUnit.widthStatus == "enable" ? true : false;
            $scope.TableData[d].productName = resData.productName;
          });
        })(i);
      }
    }
    if (statusType=='list') {
      var tempData = JSON.parse(billData.productArray);
      $scope.TableData = tempData.inventory;
      $scope.fixProducts();
    }else{
      var jrnSavePath = apiPath.postQuotationBill+'/dispatch/'+billData.saleId;
      apiCall.getCall(jrnSavePath).then(function(resp){
        if (apiResponse.notFound==resp) {
          toaster.pop('info','Data not found!');
        }else{
          $scope.TableData = JSON.parse(resp.remainingInv);
          $scope.fixProducts();
        }
      });
    }
    $scope.parseQty = function(qq){
      return parseFloat(qq);
    }
    $scope.changeQty = function(qtyInp,ind) {
      if (qtyInp > parseFloat($scope.TableData[ind].qty))
        $scope.qtyArray[ind] = $scope.TableData[ind].qty;
    }
    $scope.pop = function () {
      var printContents = document.getElementById('printDiv').innerHTML;
      var mywindow = window.open('', 'PRINT');
      mywindow.document.write('<html>' + document.head.innerHTML  + '<body>');
      mywindow.document.write(printContents);
      mywindow.document.write('</body></html>');
      if (Boolean(mywindow.chrome)) {
              
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
      $modalInstance.dismiss('close');
    };
    $scope.changeAllBox = function(checkss){
      for (var checkBoxCnt = 0; checkBoxCnt < $scope.checkArray.length; checkBoxCnt++) {
        (function(checkBoxCnts){
          $scope.checkArray[checkBoxCnts] = checkss;
        })(checkBoxCnt);
      }
    }
    $scope.ok = function () {
      var formdata;
      $scope.disableButton = true;
      formdata = new FormData();
      if (statusType == 'list') {
        formdata.set('statusId',7);
        dispatchResObj.status = 7;
        formdata.set('dispatchStatus','ready');
        toaster.pop('wait', 'Please Wait', 'Data updating....',30000);
        postDispatchData(formdata,function(ress) {
          $scope.disableButton = false;
          $modalInstance.close(ress);
        });
      }else{
        toaster.pop('wait', 'Please Wait', 'Data updating....',30000);
        var dLength = $scope.TableData.length;
        var dIndex = 0;
        var remainingInv = [];
        var dispatchInv = [];
        
        while(dIndex < dLength)
        {
          (function(dIndex2){
            var invData = $scope.TableData[dIndex2];
            if ($scope.checkArray[dIndex2]) 
            {
              var remainQty = parseFloat(invData.qty) - parseFloat($scope.qtyArray[dIndex2]);
              if (remainQty == 0) 
              {
                dispatchInv.push(invData);
              }
              else if (remainQty > 0) 
              {
                invData.qty = remainQty;
                remainingInv.push(invData);
                invData.qty = parseFloat($scope.qtyArray[dIndex2]);
                dispatchInv.push(invData);
              }
              else
              {
                $scope.disableButton = false;
                toaster.clear();
                toaster.pop('warning','invalid Qty');
                return false;
              }
            }
            else
            {
              remainingInv.push(invData);
            }
            if (dIndex2 == dLength - 1) {
              formdata = undefined;
              formdata = new FormData();
              formdata.set('dispatchInv',JSON.stringify(dispatchInv));
              formdata.set('remainingInv',JSON.stringify(remainingInv));
              formdata.set('dispatchStatus','dispatch');
              if (dispatchInv.length == 0) 
              {
                formdata = undefined;
                $scope.disableButton = false;
                toaster.clear();
                toaster.pop('warning','No Items to Dispatch');
                return false;
              }
              if (remainingInv.length) 
              {
                formdata.set('statusId',8);
                dispatchResObj.status = 8;
              }
              else
              {
                formdata.set('statusId',9);
                dispatchResObj.status = 9;
              }
              postDispatchData(formdata,function(ress2){
                $scope.disableButton = false;
                $modalInstance.close(ress2);
              });
            }

          })(dIndex);
          dIndex++;
        }
      }
      
    };

    function postDispatchData(formdata2,callback) {
      var jrnSavePath = apiPath.postQuotationBill+'/dispatch/'+billData.saleId;
      apiCall.postCall(jrnSavePath,formdata2).then(function(response)
      {
        toaster.clear();
        if(apiResponse.ok == response){
          toaster.clear();
          toaster.pop('success','Data Updated successfully!');
        }
        else{
          toaster.clear();
          toaster.pop('warning',response);
          dispatchResObj = 'fail';
        }
        callback(dispatchResObj);
      });
    }
    $scope.cancel = function () {
      $modalInstance.dismiss('close');
    };
}
AccDispatchItemModalController.$inject = ["$scope","toaster","$modalInstance","$filter","statusType","billData","productFactory","ngTableParams","$rootScope","apiCall","apiPath","validationMessage","apiResponse"];