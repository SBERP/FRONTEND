
/**=========================================================
 * Module: HeaderNavController
 * Controls the header navigation
 =========================================================*/

App.controller('HeaderNavController', ['$scope','$rootScope','$http','$templateCache','$state','apiPath','apiCall','apiResponse','$modal','userPermisionKey', function($scope,$rootScope,$http,$templateCache,$state,apiPath,apiCall,apiResponse,$modal,userPermisionKey) {
  'use strict';
  
	if($rootScope.$storage.authUser){
		
		$scope.userName = $rootScope.$storage.authUser.userName;
		
	}
	else{
		$rootScope.$storage.$reset();
		$state.go("page.login");
	}
	
  
  	$scope.headerMenuCollapsed = false;

  	$scope.userPermisionKey = userPermisionKey;
  	// console.log($scope.userPermisionKey);
	//Permission Array
	if(angular.isArray($rootScope.$storage.permissionArray))
	{
		var permissionArray = $rootScope.$storage.permissionArray[0];
	}
	else
	{
		var permissionArray = {};
	}
	// console.log(permissionArray);
	//Topbar Icon hide/Show by permission
	//-----------------------------	
		$scope.permissionCheck = function(name){
			if(name!=undefined && name!=null && name!='undefined' && name!='null' && name!="")
			{
				if(permissionArray[name]!=undefined && permissionArray[name]!=null && permissionArray[name]!='undefined' && permissionArray[name]!='null' && permissionArray[name]!="")
				{
					if(Object.keys(permissionArray[name]).length){
						return true;
						// console.log("success");
					}	
				}
			}
			
		}

		$scope.taxInvoicePermission = false;
		$scope.taxPurchasePermission = false;
		if(permissionArray.hasOwnProperty('quickMenu'))
		{
			if(permissionArray.quickMenu.hasOwnProperty('taxInvoice'))
			{
				$scope.taxInvoicePermission = permissionArray[$scope.userPermisionKey.quickMenu]['taxInvoice'];
			}

			if(permissionArray.quickMenu.hasOwnProperty('taxPurchase'))
			{
				$scope.taxPurchasePermission = permissionArray[$scope.userPermisionKey.quickMenu]['taxPurchase'];
			}
		}
		

	$scope.myClass = $rootScope.app.theme.sidebar;
	
	  $scope.toggleHeaderMenu = function() {
		$scope.headerMenuCollapsed = !$scope.headerMenuCollapsed;
	  };
	  
	  $scope.accountSelected;
	  $scope.invetorySelected;
	  $scope.stockSummarySelected;
	  $scope.priceListSelected;
	  $scope.analyzerSelected;
	  $scope.crmSelected;
 
	$scope.getClass = function(){
	
		return 'active';
	 }

  $scope.getsidebar = function(){
	  $scope.show_sidebar();
	  // $templateCache.removeAll();
	   // $templateCache.remove('/front-end/#/app/form-inputs');
	    //$templateCache.removeAll();
		 //location.reload();
		$scope.accountSelected = true;
	  $scope.invetorySelected = false;
	  $scope.stockSummarySelected = false;
	  $scope.priceListSelected = false;
	   $scope.analyzerSelected = false;
	   $scope.crmSelected = false;
	   
	var menuJson = 'server/sidebar/Accounting.json',
      menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
	
      $http.get(menuURL)
        .success(function(items) {

          	$rootScope.menuItems = items;
		  	$rootScope.permissionKey = $scope.userPermisionKey.accounting;
		  	
        })
        .error(function(data, status, headers, config) {
          alert('Failure loading menu');
        });
		
		 //$scope.toggleHeaderMenu();
		$scope.headerMenuCollapsed = false;
  };
  
  $scope.configuration = function(){
	
		$scope.accountSelected = false;
	  $scope.invetorySelected = false;
	  $scope.stockSummarySelected = false;
	  $scope.priceListSelected = false;
	   $scope.analyzerSelected = false;
	   $scope.crmSelected = false;
	   
	var menuJson = 'server/sidebar/sidebar-items.json',
      menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
	
      $http.get(menuURL)
        .success(function(items) {
        	$scope.show_sidebar();
           $rootScope.menuItems = items;
		   $rootScope.permissionKey = $scope.userPermisionKey.configuration;
		   
        })
        .error(function(data, status, headers, config) {
          alert('Failure loading menu');
        });
		
	 //$scope.toggleHeaderMenu();
   $scope.headerMenuCollapsed = false;
		
  };
  
	  // GET Inventory Sidebar
	  $scope.getInventory = function(){
		 
		 $state.go('app.InvStockSummary');
		 $scope.accountSelected = false;
	  $scope.invetorySelected = true;
	  $scope.stockSummarySelected = false;
	  $scope.priceListSelected = false;
	   $scope.analyzerSelected = false;
	   $scope.crmSelected = false;
	  
		var menuJson = 'server/sidebar/Inventory.json',
		  menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
		
		  $http.get(menuURL)
			.success(function(items) {
				//$rootScope.menuItems=[];
			   $rootScope.menuItems = items;
			   $rootScope.permissionKey = $scope.userPermisionKey.inventory;
			   $scope.show_sidebar();
			})
			.error(function(data, status, headers, config) {
			  alert('Failure loading menu');
			});
			
			 //$scope.toggleHeaderMenu();
			  $scope.headerMenuCollapsed = false;
	  };
	  
	  // GET Price List Sidebar
	  $scope.getPriceList = function(){
		 
		 
		 $scope.accountSelected = false;
	  $scope.invetorySelected = false;
	  $scope.stockSummarySelected = false;
	  $scope.priceListSelected = true;
	  $scope.analyzerSelected = false;
	  $scope.crmSelected = false;
	  
		var menuJson = 'server/sidebar/PriceList.json',
		  menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
		
		  $http.get(menuURL)
			.success(function(items) {
				//$rootScope.menuItems=[];
			   $rootScope.menuItems = items;
			   $rootScope.permissionKey = $scope.userPermisionKey.pricelist;
			   $scope.show_sidebar();
			})
			.error(function(data, status, headers, config) {
			  alert('Failure loading menu');
			});
			
			// $scope.toggleHeaderMenu();
			 $scope.headerMenuCollapsed = false;
	  };
  
	// GET Reports Sidebar
	  $scope.getAnalyzer = function(){
		 
		 $scope.accountSelected = false;
	  $scope.invetorySelected = false;
	  $scope.stockSummarySelected = false;
	  $scope.priceListSelected = false;
	  $scope.analyzerSelected = true;
	  $scope.crmSelected = false;
	  
		var menuJson = 'server/sidebar/Analyzer.json',
		  menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
		
		  $http.get(menuURL)
			.success(function(items) {
				//$rootScope.menuItems=[];
			   $rootScope.menuItems = items;
			   $rootScope.permissionKey = $scope.userPermisionKey.analyzer;

			   $scope.show_sidebar();

			})
			.error(function(data, status, headers, config) {
			  alert('Failure loading menu');
			});
			
			// $scope.toggleHeaderMenu();
			 $scope.headerMenuCollapsed = false;
	  };
	  
	  
	  // GET Stock Summary
	  $scope.getStockSummary = function(){
		 
		 $scope.accountSelected = false;
	  $scope.invetorySelected = false;
	  $scope.stockSummarySelected = true;
	  $scope.priceListSelected = false;
	  $scope.analyzerSelected = false;
	  $scope.crmSelected = false;
			
			var menuJson = 'server/sidebar/Inventory.json',
		  menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
		
		  $http.get(menuURL)
			.success(function(items) {
				//$rootScope.menuItems=[];
			   $rootScope.menuItems = items;
			   $rootScope.permissionKey = $scope.userPermisionKey.inventory;

			   $scope.show_sidebar();
			})
			.error(function(data, status, headers, config) {
			  alert('Failure loading menu');
			});
			
			// $scope.toggleHeaderMenu();
			 $scope.headerMenuCollapsed = false;
	  };
	  
	  // GET CRM
	  $scope.getCRM = function(){
		 
		 $scope.accountSelected = false;
	  $scope.invetorySelected = false;
	  $scope.stockSummarySelected = false;
	  $scope.priceListSelected = false;
	  $scope.analyzerSelected = false;
	  $scope.crmSelected = true;
			
			var menuJson = 'server/sidebar/CRM.json',
		  menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache
		
		  $http.get(menuURL)
			.success(function(items) {
				//$rootScope.menuItems=[];
			   $rootScope.menuItems = items;
			   $rootScope.permissionKey = $scope.userPermisionKey.crm;

			   $scope.show_sidebar();
			})
			.error(function(data, status, headers, config) {
			  alert('Failure loading menu');
			});
			
			// $scope.toggleHeaderMenu();
			 $scope.headerMenuCollapsed = false;
	  };
	  
	  var Modalopened = false;
	  
	   /**
	  Calculator Model Start
	  **/
	  $scope.openCalculator = function (size) {
		
		$templateCache.remove('http://'+window.location.host+'/front-end/app/views/PopupModal/TopBar/calcuatorModal.html');
		$templateCache.remove('http://'+window.location.host+'/front-end/app/views/PopupModal/TopBar/CalcSS3.js');
		//$templateCache.remove('http://'+window.location.host+'/front-end/app/views/PopupModal/TopBar/calcuatorModal.html');
		
		if (Modalopened) return;
		
		//toaster.pop('wait', 'Please Wait', 'Calculator opening....',600000);
			
			var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/TopBar/calcuatorModal.html?buster='+Math.random(),
			  controller: calculatorController,
			  size: size,
			  cache: false
			});

			Modalopened = true;
			
			modalInstance.opened.then(function() {
				//toaster.clear();
			});

			modalInstance.result.then(function (data) {
			 
				
				
				Modalopened = false;
			
			}, function () {
			  console.log('Cancel');	
			  Modalopened = false;
			});
		
	  };
	  /**
	  Calculator Model End
	  **/

	  	/** Show Side bar **/
	  	$scope.show_sidebar = function()
	  	{
	  		$rootScope.app.sidebar.sidebar_from_topbar = true;
  			$rootScope.app.sidebar.isCollapsed = false;
	  		$rootScope.app.sidebar.sidebar_hide = true;
	  	}
	  	/* End **/
  
	  $scope.logout = function()
	  {
		  
		//alert('in');2e7719b36240c051e694a88cc511d4a6  d29ac73b666a3be3fc463448fdc5d9fc
		apiCall.deleteCall(apiPath.deleteToken+$rootScope.$storage.authUser.userId).then(function(deleteres){
			
			if(apiResponse.ok == deleteres){
				$rootScope.$storage.$reset();
				$state.go("page.login");
			}
			else{
				alert('Opps!, Problem Occure');
			}
		 
		});
		$state.go("page.login");
	  }
}]);