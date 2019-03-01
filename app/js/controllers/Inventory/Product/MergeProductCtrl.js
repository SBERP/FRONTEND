App.controller('MergeProductController', MergeProductController);

function MergeProductController($scope,$interval, $rootScope,$filter, ngTableParams,apiCall,apiPath,$state,apiResponse,toaster,getSetFactory,$modal,productFactory,uniqueArrayService) {
  	'use strict';
  	var vm = this;
  	var formdata;
	vm.loadData = true;
	var Modalopened = false;
	$scope.mergeTemplate = '';
	$scope.mergingStep = 1;
	vm.states=[];
	vm.users = [];
	$scope.productData = [];
	$scope.currentProgress = {'progress':0,'name':''};
	$scope.finishedRequests = [];
	$scope.mergeProcessing = ['Product','Sales Bill','Purchase Bill','Stock', 'Finalizing'];
	$scope.mergeProduct = true;
	$scope.enableDisableColor = true;
	$scope.enableDisableSize = true;
	$scope.enableDisableVariant = true;
	$scope.enableDisableBestBefore = true;
	$scope.enableDisableAdvanceMou = false;
	$scope.getOptionSettingData = function(){
		toaster.clear();
		apiCall.getCall(apiPath.settingOption).then(function(response){
			var responseLength = response.length;
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(angular.isObject(response) || angular.isArray(response))
				{
					if(response[arrayData].settingType=="product")
					{
						var arrayData1 = response[arrayData];
						$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
						$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
						$scope.enableDisableVariant = arrayData1.productVariantStatus=="enable" ? true : false;
						$scope.enableDisableBestBefore = arrayData1.productBestBeforeStatus=="enable" ? true : false;
						$scope.enableDisableAdvanceMou = arrayData1.productAdvanceMouStatus=="enable" ? true : false;
					}
				}
			}
		});
	}
	$scope.getOptionSettingData();

	apiCall.getCall(apiPath.getAllCompany).then(function(response2){
		vm.states = response2;
		$scope.stateCheck = apiCall.getDefaultCompanyFilter(response2);
		productFactory.getProductByCompany($scope.stateCheck.companyId).then(function(data){
			$scope.productData = data;
			vm.loadData = false;
		});
	});
	$scope.setProductData = function(item,type){
		if (type == 'to') {
			if (angular.isDefined($scope.productFrom.productId) && $scope.productFrom.productId == item.productId) {
				toaster.pop('warning', 'Can\'t merge Same Products!!');
				$scope.productTo = {};
				return false;
			}
			$scope.productTo = angular.copy(item);
			$scope.productTo.forSaleStatus = item.notForSale == 'false' ? 'Yes' : 'No';
			if ($scope.enableDisableAdvanceMou) {
				if ($scope.productTo.primaryMeasureUnit == 'lowest') {
					$scope.productTo.primaryMeasure = $scope.productTo.measurementUnit.unitName;
				}else{
					$scope.productTo.primaryMeasure = $scope.productTo[$scope.productTo.primaryMeasureUnit+'MeasurementUnit'].unitName;
				}
			}
		}else{
			if (angular.isObject($scope.productTo) && angular.isDefined($scope.productTo.productId) && $scope.productTo.productId == item.productId) {
				toaster.pop('warning', 'Can\'t merge Same Products!!');
				$scope.productFrom = {};
				return false;
			}
			$scope.productFrom = angular.copy(item);
			$scope.productFrom.forSaleStatus = item.notForSale == 'false' ? 'Yes' : 'No';
			if ($scope.enableDisableAdvanceMou) {
				if ($scope.productFrom.primaryMeasureUnit == 'lowest') {
					$scope.productFrom.primaryMeasure = $scope.productFrom.measurementUnit.unitName;
				}else{
					$scope.productFrom.primaryMeasure = $scope.productFrom[$scope.productFrom.primaryMeasureUnit+'MeasurementUnit'].unitName;
				}
			}
		}
	}
	$scope.cancel = function(){
		$scope.productFrom = {};
		$scope.productTo = {};
		$scope.mergeTemplate = '';
		$scope.mergingStep = 1;
		formdata = undefined;
		toaster.clear();
	}
	$rootScope.mergingPop = function(step,data){
		if (step == 2) {
			$scope.mergingStep = 3;
			$scope.mergeTemplate = '';
			formdata = data;
			$scope.productTo.productName = data.get('productName') != null ? data.get('productName') : $scope.productTo.productName;
			toaster.clear();
		}
		if (step == 1) {
			$scope.cancel();
		}
		if (step == 3) {
			$scope.mergingStep = 4;
			$scope.currentProgress.progress = 0;
			var progressStatus = 0;
			var headerData = {'Content-Type': undefined,'productId':$scope.productTo.productId};
			apiCall.postCallHeader('merge/products/'+$scope.productFrom.productId,headerData,formdata).then(function(response){
				if (apiResponse.ok == response) {
					toaster.pop('success','Products Merged Successfully!');
					$interval.cancel(promise);
					$scope.cancel();
				}else{
					$interval.cancel(promise);
					$scope.mergingStep = 3;
					toaster.pop('warning','Opps..',response);
				}
			});
			function startProgress(){
				$scope.currentProgress.name = $scope.mergeProcessing[progressStatus];
				$scope.currentProgress.progress++;
				if ($scope.currentProgress.progress == 100) {
					progressStatus++;
					if (progressStatus < $scope.mergeProcessing.length) {
						$scope.finishedRequests.push($scope.mergeProcessing[progressStatus]);
						$scope.currentProgress.progress = 0;
						$scope.currentProgress.name = $scope.mergeProcessing[progressStatus];
					}else{
						$interval.cancel(promise);
						$scope.cancel();
					}
				}
			}
			var promise = $interval(startProgress,100);
		}
	}
	$scope.pop = function(){
		if (angular.isDefined($scope.productFrom.productId) && angular.isDefined($scope.productTo.productId)) {
			$scope.productTo.mergeProduct = true;
			$scope.mergingStep = 2;
			getSetFactory.set($scope.productTo);
			$scope.mergeTemplate = 'app/views/Inventory/Product/AddInvProduct.html';
		}else{
			toaster.pop('info','Select Products to Proceed..');
		}
	}
}
MergeProductController.$inject = ["$scope","$interval", "$rootScope", "$filter", "ngTableParams","apiCall","apiPath","$state","apiResponse","toaster","getSetFactory","$modal","productFactory","uniqueArrayService"];