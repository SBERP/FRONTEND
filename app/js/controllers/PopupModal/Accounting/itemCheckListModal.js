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
    var printTableWidth = 'calc(50% - 20px)';
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
            $scope.TableData[d].unitName = resData.measurementUnit.unitName;
            $scope.TableData[d].productName = resData.productName;
            $scope.TableData[d].itemCode = resData.itemCode;
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
          setTemplatePrint($scope.TableData);
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
                setTemplatePrint(dispatchInv);
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

    $scope.pop = function () {
      setTemplatePrint($scope.TableData);
      $modalInstance.dismiss('close');
    };
    
    
    // Print Functions
    function setTemplatePrint(printData){
      var htmlTemplate = '';
      deliveredItemTable(printData,function(itemTable){
        htmlTemplate += htmlWrapperBegins;
        printTableWidth = 'calc(50% - 20px)';
        htmlTemplate += tableWrapperBegins('Original');
        htmlTemplate += companyHeader(billData.company);
        htmlTemplate += clientOrderHeader(billData);
        htmlTemplate += itemTable;
        htmlTemplate += tableWrapperEnds(billData.company);

        htmlTemplate += tableWrapperBegins('Duplicate');
        htmlTemplate += companyHeader(billData.company);
        htmlTemplate += clientOrderHeader(billData);
        htmlTemplate += itemTable;
        htmlTemplate += tableWrapperEnds(billData.company);
        htmlTemplate += htmlWrapperEnds;
        printChallan(htmlTemplate);
      });
    }
    function printChallan(htmlTemplate) {
      console.log('pri');
      var mywindow = window.open('', 'PRINT');
      mywindow.document.write(htmlTemplate);
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
    }

    // Delivery Print parts
    var htmlWrapperBegins =  `<!DOCTYPE html><html><head><title>Print Challan</title></head><body>`;
    var htmlWrapperEnds = `</body></html>`;
    function tableWrapperBegins(original)
    {
      return `<table cellspacing=0 style="border: 1px solid #b2b2b2;border-collapse: collapse;width: `+printTableWidth+`;float: left; margin: 10px;"><tbody>
              <tr style="height:15px;">
                <td style="font-family:Arial;text-align:center;font-size:10px;color:#000;font-weight:bold;min-width:50px;padding: 3px;text-transform: uppercase;position:relative;" colspan=10>
                  <span style="position: absolute;left: 10px;">`+original+`</span>
                  <span>|| Shree Ganeshay Namah ||</span>
                  <span style="position: absolute;right: 10px;">Delivery Challan</span>
                </td>
              </tr>`;
    }
    function tableWrapperEnds(companyObject)
    {
      return `<tr style="height:35px;">
                <td style="font-family:Arial;border-top: 1px solid #b2b2b2;text-align:left;font-size:12px;background-color:#ffffff;min-width:50px;vertical-align:top;" colspan="5">
                  <strong>Del. By:</strong>
                </td>
                <td style="font-family:Arial;border-top: 1px solid #b2b2b2;text-align:right;font-size:15px;background-color:#ffffff;min-width:50px;vertical-align:top;" colspan="5">
                  <nobr>For, `+companyObject.companyName+`&nbsp;</nobr>
                </td>
              </tr>
              <tr style="height:35px;">
                <td style="font-family:Arial;text-align:left;font-size:12px;background-color:#ffffff;min-width:50px;vertical-align:bottom;" colspan="5">
                  <strong>&nbsp;Receiver's Signature _____________________</nobr>
                </td>
                <td style="font-family:Arial;text-align:right;font-size:12px;background-color:#ffffff;min-width:50px;vertical-align:bottom;" colspan="5">
                  <strong>(Authorised Signatory)&nbsp;</strong>
                </td>
              </tr></tbody></table>`;
    }
    function companyHeader(companyObject)
    {
      return `<tr style="height:40px;">
                <td style="font-family:Arial;text-align:center;font-size:16px;color:#000;font-weight:bold;min-width:50px;padding: 3px;" colspan=10>
                  <nobr>`+companyObject.companyName+`</nobr>
                </td>
              </tr>`;
    }
    function clientOrderHeader(billObject)
    {
      return `
      <tr style="height:17px;">
        <td style="font-family:Arial;font-size:12px;min-width:50px;border:1px solid #b2b2b2;border-bottom:0px;" colspan=8 rowspan=2>
          <strong>&nbsp;&nbsp;M/S. :</strong>
          <strong>`+billObject.client.clientName+`</strong><br>
          <nobr style="font-size:10px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`+billObject.client.address1+`</nobr>
        </td>
        <td style="font-family:Arial;text-align:left;font-size:10px;min-width:50px;padding-left: 10px;border:1px solid #b2b2b2;border-bottom-color: #fff;" colspan=2>
          <strong>Order Date : </strong>
          <nobr>`+billObject.entryDate+`</nobr>
        </td>
      </tr>
      <tr style="height:17px;">
        <td style="font-family:Arial;text-align:left;font-size:10px;min-width:50px;padding-left: 10px;border-right:1px solid #b2b2b2;" colspan=2>
          <strong>Invoice #: </strong>
          <nobr>`+billObject.invoiceNumber+`</nobr>
        </td>
      </tr>
      <tr style="height:24px;">
      <td style="font-family:Arial;font-size:12px;min-width:50px;border:1px solid #b2b2b2;border-top:0px;" colspan=8 >
        <strong>&nbsp;&nbsp;Phone :</strong>
        <nobr>`+billObject.client.contactNo+`</nobr>
      </td>
      <td style="font-family:Arial;text-align:left;font-size:10px;min-width:50px;padding-left: 10px;border-right:1px solid #b2b2b2;" colspan=2>
        
      </td>
    </tr>`;
    }
    function deliveredItemTable(itemArray,callback)
    {
      var returnableStr = '</tbody><tbody>';
      returnableStr += `
        <tr style="height:24px;">
          <td style="font-family:Arial;font-size:9px;color:#000;font-weight:bold;border:1px solid #b2b2b2;width:50px;text-align:center;">
            <nobr>Sr No</nobr>
          </td>
          <td style="font-family:Arial;font-size:9px;color:#000;font-weight:bold;border:1px solid #b2b2b2;min-width:50px" colspan=7>
            <nobr>&nbsp;&nbsp;Name of Particulars</nobr>
          </td>
          <td style="font-family:Arial;text-align:center;font-size:9px;color:#000;font-weight:bold;border:1px solid #b2b2b2;width:80px">
            <nobr>Delivered</nobr>
          </td>
          <td style="font-family:Arial;text-align:center;font-size:9px;color:#000;font-weight:bold;border:1px solid #b2b2b2;width:80px">
            <nobr>Unit</nobr>
          </td>
        </tr>`;
      var totalItems = itemArray.length;
      var itemIndex = 0;
      var totalQty = 0;
      var remainingHeight = 510;
      while(itemIndex < totalItems)
      {
        (function(itIndex){
          var itemText = itemArray[itIndex].productName;
          if (itemArray[itIndex].lengthStatus || itemArray[itIndex].lengthStatus || itemArray[itIndex].lengthStatus) 
          {
            itemText += ` ( `;
            itemText += itemArray[itIndex].lengthStatus ? itemArray[itIndex].lengthValue : ``;
            itemText += itemArray[itIndex].lengthStatus && (itemArray[itIndex].widthStatus || itemArray[itIndex].heightStatus) ? ` x ` : ``;
            itemText += itemArray[itIndex].widthStatus ? itemArray[itIndex].widthValue : ``;
            itemText += itemArray[itIndex].widthStatus && itemArray[itIndex].heightStatus ? ` x ` : ``;
            itemText += itemArray[itIndex].heightStatus ? itemArray[itIndex].heightValue : ``;
            itemText += ` )`;
          }
          totalQty += parseFloat(itemArray[itIndex].qty);
          remainingHeight -= 17;
          returnableStr += `
            <tr style="height:17px;">
              <td style="font-family:Arial;font-size:9px;border-left:1px solid;border-left-color:#b2b2b2;min-width:50px;text-align:center;">
                <nobr>`+(itIndex+1)+`</nobr>
              </td>
              <td style="font-family:Arial;text-align:left;font-size:9px;border-left:1px solid;border-left-color:#b2b2b2;min-width:50px" colspan=7>
                <nobr>&nbsp;`+itemText+`</nobr>
              </td>
              <td style="font-family:Arial;text-align:center;font-size:9px;border-left:1px solid;border-right:1px solid;border-left-color:#b2b2b2;border-right-color:#b2b2b2;min-width:50px">
                <nobr>`+itemArray[itIndex].qty+`</nobr>
              </td>
              <td style="font-family:Arial;text-align:center;font-size:9px;border-left:1px solid;border-right:1px solid;border-left-color:#b2b2b2;border-right-color:#b2b2b2;min-width:50px">
                <nobr>`+itemArray[itIndex].unitName+`</nobr>
              </td>
            </tr>`;
        if (itIndex == totalItems-1) {
          returnableStr += `<tr style="height:`+remainingHeight+`px;">
                              <td style="border-left:1px solid #b2b2b2;border-right:1px solid #b2b2b2;"></td>
                              <td style="border-left:1px solid #b2b2b2;border-right:1px solid #b2b2b2;" colspan=7></td>
                              <td style="border-left:1px solid #b2b2b2;border-right:1px solid #b2b2b2;"></td>
                              <td style="border-left:1px solid #b2b2b2;border-right:1px solid #b2b2b2;"></td>
                            </tr>
                            <tr style="height:17px;">
                              <td style="border:1px solid #b2b2b2;"></td>
                              <td style="border:1px solid #b2b2b2;" colspan=7></td>
                              <td style="font-family:Arial;font-size:9px;border:1px solid #b2b2b2;text-align:center">
                                <nobr>`+$filter('setDecimal')(totalQty,2)+`</nobr>
                              </td>
                              <td style="border:1px solid #b2b2b2;"></td>
                            </tr>
                            </tbody><tbody>`;
          callback(returnableStr);
        }
        })(itemIndex);
        itemIndex++;
      }
    }
}
AccDispatchItemModalController.$inject = ["$scope","toaster","$modalInstance","$filter","statusType","billData","productFactory","ngTableParams","$rootScope","apiCall","apiPath","validationMessage","apiResponse"];