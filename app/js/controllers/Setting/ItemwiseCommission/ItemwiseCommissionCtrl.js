App.controller('ItemwiseCommissionController', ItemwiseCommissionController);

function ItemwiseCommissionController($rootScope,$scope,$state,$filter,apiCall,apiPath,toaster,apiResponse,validationMessage,getSetFactory,productFactory,uniqueArrayService,ngTableParams,$modal) {
	'use strict';
	var vm = this;
	vm.loadData = true;
	var Modalopened = false;
	vm.states=[];
	vm.users = [];
	var data = [];
	apiCall.getCall(apiPath.getAllCompany).then(function(response2){
		vm.states = response2;
		$scope.stateCheck = apiCall.getDefaultCompanyFilter(response2);
		productFactory.getProductByCompany($scope.stateCheck.companyId).then(function(data){
			$scope.productData = data;
			vm.loadData = false;
		});
		$scope.loadItemwiseCommission($scope.stateCheck.companyId);
	});
	$scope.commissionArray = {};
	$scope.commissionRateTypeDrop = ['Flat','Percentage'];
	$scope.commissionCalcDrop = ['Sales Price','MRP','None'];
	$scope.productData = [];

	// Limit Rate Type Selection
	$scope.changeRateType = function(FName){
		if (FName == 'commissionRateType') {
			if ($scope.commissionArray.commissionRateType == 'Flat') {
				$scope.commissionArray.commissionCalcOn = 'None';
			}else{
				if ($scope.commissionArray.commissionCalcOn == 'None') {
					$scope.commissionArray.commissionCalcOn = 'Sales Price';
				}
			}
		}else if (FName == 'commissionCalcOn') {
			if ($scope.commissionArray.commissionCalcOn == 'None') {
				$scope.commissionArray.commissionRateType 	= 'Flat';
			}else{
				$scope.commissionArray.commissionRateType 	= 'Percentage';
			}
		}
	}
	// Set Product data on select of Product

	$scope.setProductData = function(item){
		$scope.commissionArray.productId = item.productId;
		$scope.commissionArray.fromQty = 1;
		$scope.commissionArray.toQty = 1;
		$scope.commissionArray.commissionRate = 0;
		$scope.commissionArray.commissionRateType = 'Flat';
		$scope.commissionArray.commissionCalcOn = 'None';
		$scope.commissionArray.companyId = $scope.stateCheck.companyId;
	}

	$scope.cancel = function(){
		$scope.commissionArray = [];
	}

	/* Save Data */
	$scope.pop = function(){
		var formdata = new FormData();
		formdata.set('productId',$scope.commissionArray.productId);
		formdata.set('companyId',$scope.commissionArray.companyId);
		formdata.set('commissionFromQty',$scope.commissionArray.fromQty);
		formdata.set('commissionToQty',$scope.commissionArray.toQty);
		formdata.set('commissionRate',$scope.commissionArray.commissionRate);
		formdata.set('commissionRateType',$scope.commissionArray.commissionRateType);
		formdata.set('commissionCalcOn',$scope.commissionArray.commissionCalcOn);
		if (angular.isDefined($scope.commissionArray.productCommissionId)) {
			var jsuggestPath = apiPath.postItemwiseCommission+'/'+$scope.commissionArray.productCommissionId;
		}else{
			var jsuggestPath = apiPath.postItemwiseCommission;
		}
		apiCall.postCall(jsuggestPath,formdata).then(function(response){
			if(apiResponse.ok == response){
				toaster.pop('success', 'Data Inserted!!');
				formdata = undefined;
				$scope.commissionArray = [];
				$scope.loadItemwiseCommission($scope.stateCheck.companyId);
			}
			else{
				toaster.pop('warning', 'Opps!!', response);
			}
		});
	}
	/*Table*/
	$scope.loadItemwiseCommission = function(companyId)
	{
		var jsuggestPath = apiPath.postItemwiseCommission;
	    var headerCr = {'Content-Type': undefined,'companyId':companyId};
	    apiCall.getCallHeader(jsuggestPath,headerCr).then(function(response){
	       	data = angular.copy(response);
	        $scope.TableData();
	    });
	}
	$scope.editProduct = function(item)
	{
		$scope.commissionArray.productId = item.productId;
		$scope.commissionArray.productName = item.productName;
		$scope.commissionArray.companyId = item.companyId;
		$scope.commissionArray.fromQty = item.commissionFromQty;
		$scope.commissionArray.toQty = item.commissionToQty;
		$scope.commissionArray.commissionRate = item.commissionRate;
		$scope.commissionArray.commissionRateType = item.commissionRateType;
		$scope.commissionArray.commissionCalcOn = item.commissionCalcOn;
		$scope.commissionArray.productCommissionId = item.productCommissionId;
	}
	$scope.deleteProduct = function(size,id)
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
			 /**Delete Code **/
			apiCall.deleteCall(apiPath.postItemwiseCommission+'/'+id).then(function(response){
				if(apiResponse.ok == response){
					$scope.loadItemwiseCommission($scope.stateCheck.companyId);
					toaster.pop('success', 'Title', 'Delete SuccessFully');
				}
				else{
					toaster.pop('warning', 'Opps!!', response);
				}
			});
			Modalopened = false;
				 
		}, function () {
			 Modalopened = false;
		});
	}
    $scope.TableData = function(){
      vm.tableParams = new ngTableParams({
          page: 1,
          count: 10,
          sorting: {
              productName: 'asc'
          },
          filter: {
              productName: '',
              commissionFromQty: '',
              commissionToQty: '',
              commissionRate: '',
              commissionCalcOn: ''
            }
        }, {
          total: data.length,
          getData: function($defer, params) {
              var orderedData = params.filter() ?
                     $filter('filter')(data, params.filter()) :
                     data;
              vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
              params.total(orderedData.length);
              $defer.resolve(vm.users);
          }
      });
    }
}
ItemwiseCommissionController.$inject = ["$rootScope","$scope","$state","$filter","apiCall","apiPath","toaster","apiResponse","validationMessage","getSetFactory","productFactory","uniqueArrayService","ngTableParams","$modal"];