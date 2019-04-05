
App.controller('QuotationFlowController', QuotationFlowController);

function QuotationFlowController($scope,toaster,$filter, $modalInstance,$rootScope,apiCall,apiPath,companyId,transactionType,validationMessage,apiResponse,getSetFactory,fetchArrayService) {
  	'use strict';
  	var vm = this;
  	var headerDataOnLoad = {'Content-Type': undefined,'companyId':companyId};
	apiCall.getCallHeader(apiPath.getAllStaff,headerDataOnLoad).then(function(response){
		toaster.clear();
		if(apiResponse.noContent == response){
			toaster.pop('alert', 'Opps!!', 'No Staff Available');
		}
		else{
			vm.userDrop = response;
		}
	});
	apiCall.getCall(apiPath.postQuotationBill+'/status').then(function(response2){
		toaster.clear();
		if(apiResponse.noContent == response2){
			toaster.pop('alert', 'Opps!!', 'No Status Data Available');
		}
		else{
			vm.statusDrop = response2.filter(function(element) {
				if (transactionType == 'QuotationPrint') {
					return element.statusType == 'quotation';
				}else if (transactionType == 'SalesOrder') {
					return element.statusType == 'salesorder' || element.statusType == 'sales';
				}
			});
		}
	});
	$scope.ok = function() {
		var res1 = {};
		res1.userId = $scope.assignTo;
		res1.statusId = $scope.quotationStatus;
		$modalInstance.close(res1);
	}
	$scope.cancel = function() {
		var res1 = {};
		res1 = vm.statusDrop.find(function(element) {
			if (transactionType == 'QuotationPrint') {
				return element.status == 'Quotation';
			}else if (transactionType == 'SalesOrder') {
				return element.status == 'Salesorder';
			}
		});
		$modalInstance.dismiss(res1);
	}
}
QuotationFlowController.$inject = ["$scope","toaster","$filter","$modalInstance","$rootScope","apiCall","apiPath","companyId","transactionType","validationMessage","apiResponse","getSetFactory","fetchArrayService"];