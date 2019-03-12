

/**=========================================================
 * Module: SidebarController
 * Provides functions for sidebar markup generation.
 * Also controls the collapse items states
 =========================================================*/

App.controller('SidebarController', ['$rootScope', '$scope', '$location', '$http', '$timeout','$state', 'sidebarMemu', 'appMediaquery', '$window','apiCall','apiPath','fetchArrayService',
	function($rootScope, $scope, $location, $http, $timeout,$state, sidebarMemu, appMediaquery, $window ,apiCall,apiPath,fetchArrayService){
		'use strict';
		var currentState = $rootScope.$state.current.name;
		var $win  = $($window);
		var $html = $('html');
		var $body = $('body');

		// Load menu from json file
		// ----------------------------------- 
		 var check_flag = angular.copy($rootScope.app.sidebar.sidebar_hide);
		 var sidebar_from_topbar = angular.copy($rootScope.app.sidebar.sidebar_from_topbar);
		 
		if (check_flag && !sidebar_from_topbar) {
			sidebarMemu.load();
		}
		
		$scope.settingOption = [];
		apiCall.getCall(apiPath.settingOption).then(function(response2){
			$scope.settingOption = response2;
		});
		// Adjustment on route changes
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			currentState = toState.name;
			if ($scope.settingOption.length == 0) {
				apiCall.getCall(apiPath.settingOption).then(function(response2) {
					$scope.settingOption = response2;
					if (currentState == "app.AccSales") {
						event.preventDefault();
						var settingObj = fetchArrayService.getfilteredSingleObject(response2,'advance','settingType');
						if (settingObj.advanceSalesStatus == "enable") {
							$state.go('app.AccSales');
							$('.loading-bar').remove();
						} else {
							$state.go('app.WholesaleBill');
							$('.loading-bar').remove();
						}
					}

					if (currentState == "app.AccPurchase") {
						event.preventDefault();
						var settingObj = fetchArrayService.getfilteredSingleObject(response2,'advance','settingType');
						if (settingObj.advancePurchaseStatus == "enable") {
							$state.go('app.AccPurchase');
							$('.loading-bar').remove();
						} else {
							$state.go('app.PurchaseBill');
							$('.loading-bar').remove();
						}
					}
				});
			}else{
				if (currentState == "app.AccSales") {
					event.preventDefault();
					var settingObj = fetchArrayService.getfilteredSingleObject($scope.settingOption,'advance','settingType');
					if (settingObj.advanceSalesStatus == "enable") {
						$state.go('app.AccSales');
						$('.loading-bar').remove();
					} else {
						$state.go('app.WholesaleBill');
						$('.loading-bar').remove();
					}
				}

				if (currentState == "app.AccPurchase") {
					event.preventDefault();
					var settingObj = fetchArrayService.getfilteredSingleObject($scope.settingOption,'advance','settingType');
					if (settingObj.advancePurchaseStatus == "enable") {
						$state.go('app.AccPurchase');
						$('.loading-bar').remove();
					} else {
						$state.go('app.PurchaseBill');
						$('.loading-bar').remove();
					}
				}
			}
			
			
			// Hide sidebar automatically on mobile
			$('body.aside-toggled').removeClass('aside-toggled');

			$rootScope.$broadcast('closeSidebarMenu');
		});

		// Normalize state on resize to avoid multiple checks
		$win.on('resize', function() {
			if( isMobile() )
				$body.removeClass('aside-collapsed');
			else
				$body.removeClass('aside-toggled');
		});

		$rootScope.$watch('app.sidebar.isCollapsed', function(newValue, oldValue) {
			// Close subnav when sidebar change from collapsed to normal
			$rootScope.$broadcast('closeSidebarMenu');
			$rootScope.$broadcast('closeSidebarSlide');
		});

		// Check item and children active state
		var isActive = function(item) {

			if(!item || !item.sref) return;

			var path = item.sref, prefix = '#';
			if(path === prefix) {
				var foundActive = false;
				angular.forEach(item.subnav, function(value, key) {
					if(isActive(value)) foundActive = true;
				});
				return foundActive;
			}
			else {
				return (currentState === path);
			}
		};


		$scope.getSidebarItemClass = function(item) {
			return (item.type == 'heading' ? 'nav-heading' : '') +
						 (isActive(item) ? ' active' : '') ;
		};


		// Handle sidebar collapse items
		// ----------------------------------- 
		var collapseList = [];

		$scope.addCollapse = function($index, item) {
			collapseList[$index] = true; //!isActive(item);
		};

		$scope.isCollapse = function($index) {
			return collapseList[$index];
		};

		$scope.collapseAll = function() {
			collapseAllBut(-1);
		};

		$scope.toggleCollapse = function($index) {

			// States that doesn't toggle drodopwn
			if( (isSidebarCollapsed() && !isMobile()) || isSidebarSlider()  ) return true;
			
			// make sure the item index exists
			if( typeof collapseList[$index] === undefined ) return true;

			collapseAllBut($index);
			collapseList[$index] = !collapseList[$index];
		
			return true;

		};
		$scope.settingOptionCheck = function(setting) {
			if (setting == 'workflow') {
				var settingObj = fetchArrayService.getfilteredSingleObject($scope.settingOption,'workflow','settingType');
				if (settingObj.workflowQuotationStatus == 'enable') {
					return true;
				}else{
					return false;
				}
			}else{
				return true;
			}
		}

		function collapseAllBut($index) {
			angular.forEach(collapseList, function(v, i) {
				if($index !== i)
					collapseList[i] = true;
			});
		}

		// Helper checks
		// ----------------------------------- 

		function isMobile() {
			return $win.width() < appMediaquery.tablet;
		}
		function isTouch() {
			return $html.hasClass('touch');
		}
		function isSidebarCollapsed() {
			return $rootScope.app.sidebar.isCollapsed;
		}
		function isSidebarToggled() {
			return $body.hasClass('aside-toggled');
		}
		function isSidebarSlider() {
			return $rootScope.app.sidebar.slide;
		}

}]);