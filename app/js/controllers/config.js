
/**=========================================================
 * Module: config.js
 * App routes and resources configuration
 =========================================================*/
/*App.factory('httpRequestInterceptor',
['$rootScope','apiResponse', function($rootScope,apiResponse)
 {
    return {
        request: function($config) {
             $config.headers['Content-Type'] = undefined;
            if( $rootScope.$storage.authToken )
            {
             $config.headers['authenticationToken'] = $rootScope.$storage.authToken;
            }
          return $config;
        },
         response: function(response) {
            console.log(response);
            if(apiResponse.noMatch == response.data || apiResponse.tokenExpired == response.data || apiResponse.notExists == response.data){
                    $rootScope.$state.go('page.login');
            }
            return response;
        }
    };
}]);*/

App.config(['$stateProvider','$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'appDependencies','$httpProvider',
    function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider,appDependencies,$httpProvider) {
      'use strict';
	

      App.controller = $controllerProvider.register;
      App.directive  = $compileProvider.directive;
      App.filter     = $filterProvider.register;
      App.factory    = $provide.factory;
      App.service    = $provide.service;
      App.constant   = $provide.constant;
      App.value      = $provide.value;
      
    //$httpProvider.defaults.useXDomain = true;

    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {}; 
    //$httpProvider.defaults.headers.get = {};
    
    //$httpProvider.defaults.withCredentials = true;

    $httpProvider.useApplyAsync(true);

	  // $compileProvider.debugInfoEnabled(false);
      // LAZY LOAD MODULES
      // ----------------------------------- 

      $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        modules: appDependencies.modules
      });


      // default route to Login
      $urlRouterProvider.otherwise('/page/login');

      // 
      // App Routes
      // -----------------------------------   
      $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
			cache: false,
            templateUrl: basepath('app.html'),
            controller: 'AppController',
            resolve: requireDeps('icons', 'screenfull', 'sparklines', 'slimscroll', 'toaster', 'ui.knob', 'animate')
        })
        .state('app.dashboard', {
            url: '/dashboard',
            templateUrl: basepath('dashboard.html'),
            resolve: requireDeps('ngTable','angular-chosen','flot-chart','flot-chart-plugins','moment','ngLetterAvatar','wysiwyg')
        })
        .state('app.buttons', {
            url: '/buttons',
            templateUrl: basepath('buttons.html')
        })
        .state('app.palette', {
            url: '/palette',
            templateUrl: basepath('palette.html')
        })
        .state('app.notifications', {
            url: '/notifications',
            templateUrl: basepath('notifications.html'),
            controller: 'NotificationController'
        })
        .state('app.bootstrapui', {
            url: '/bootstrapui',
            templateUrl: basepath('bootstrap-ui.html')
        })
        .state('app.panels', {
            url: '/panels',
            templateUrl: basepath('panels.html')
        })
        .state('app.portlets', {
            url: '/portlets',
            templateUrl: basepath('portlets.html'),
            resolve: requireDeps('jquery-ui')
        })
        .state('app.maps-google', {
            url: '/maps-google',
            templateUrl: basepath('maps-google.html'),
            resolve: requireDeps('loadGoogleMapsJS', function() { return loadGoogleMaps(); }, 'AngularGM')
        })
        .state('app.maps-vector', {
            url: '/maps-vector',
            templateUrl: basepath('maps-vector.html'),
            resolve: requireDeps('vector-map', 'vector-map-maps')
        })
        .state('app.grid', {
            url: '/grid',
            templateUrl: basepath('grid.html')
        })
        .state('app.grid-masonry', {
            url: '/grid-masonry',
            templateUrl: basepath('grid-masonry.html')
        })
        .state('app.typo', {
            url: '/typo',
            templateUrl: basepath('typo.html')
        })
        .state('app.icons-feather', {
            url: '/icons-feather',
            templateUrl: basepath('icons-feather.html')
        })
        .state('app.icons-fa', {
            url: '/icons-fa',
            templateUrl: basepath('icons-fa.html')
        })
        .state('app.icons-weather', {
            url: '/icons-weather',
            templateUrl: basepath('icons-weather.html')
        })
        .state('app.icons-climacon', {
            url: '/icons-climacon',
            templateUrl: basepath('icons-climacon.html')
        })
		//Show Company
        .state('app.Company', {
            url: '/Company',
            templateUrl: basepath('Company/Company.html'),
            resolve: requireDeps('ngTable', 'ngTableExport','toaster')
        })
		//Add Company
        .state('app.AddCompany', {
            url: '/AddCompany',
            templateUrl: basepath('Company/AddCompany.html'),
            resolve: requireDeps('inputmask', 'angular-chosen','toaster')
        })
		//Show Branch
		.state('app.Branch', {
            url: '/Branch',
            templateUrl: 'app/views/Branch/Branch.html?r='+new Date().getTime(),
			controller: 'BranchController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		//Add Branch
		.state('app.AddBranch', {
            url: '/AddBranch',
            templateUrl: basepath('Branch/AddBranch.html'),
			//controller: 'AddBranchController as form',
            resolve: requireDeps('inputmask', 'angular-chosen','toaster')
        })
		//Show Staff
		.state('app.Staff', {
            url: '/Staff',
            templateUrl: basepath('Staff/Staff.html'),
            resolve: requireDeps('ngTable','angular-chosen','toaster')
        })
		//Add Staff
		.state('app.AddStaff', {
            url: '/AddStaff',
            templateUrl: basepath('Staff/AddStaff.html'),
            resolve: requireDeps('inputmask', 'angular-chosen','toaster')
        })
		//Invoice#
		.state('app.Invoice', {
            url: '/Invoice',
            templateUrl: basepath('Invoice/Invoice.html'),
            resolve: requireDeps('angular-chosen','ngTable','ngTableExport','toaster')
        })
		//Quotation#
		.state('app.Quotation', {
            url: '/Quotation',
            templateUrl: basepath('Quotation/Quotation.html'),
            resolve: requireDeps('angular-chosen','ngTable','ngTableExport','toaster')
        })
		/*** Template ***/
		//General
		.state('app.tempGeneral', {
			cache: false,
            url: '/tempGeneral',
            templateUrl: basepath('Template/General.html'),
			controller: 'tempGeneralController as form',
			resolve: requireDeps('angular-chosen','toaster','tinymce')
        })
		//Email
		// .state('app.tempEmail', {
            // url: '/tempEmail',
            // templateUrl: basepath('Template/General.html'),
			// controller: 'tempGeneralController as form',
			// resolve: angular.extend(requireDeps('angular-chosen','toaster'),{
				// tempType: function(){
					// return 'email';
				// }
			// })
        // })
		//SMS
		// .state('app.tempSMS', {
            // url: '/tempSMS',
            // templateUrl: basepath('Template/General.html'),
			// controller: 'tempGeneralController as form',
			// resolve: angular.extend(requireDeps('angular-chosen','toaster'),{
				// tempType: function(){
					// return 'sms';
				// }
			// })
        // })
		/*** End Template ***/
		/*** Setting ***/
            //Option
            .state('app.SettingOption', {
                url: '/SettingOption',
                templateUrl: basepath('Setting/SettingOption/SettingOption.html'),
                resolve: requireDeps('angular-chosen','toaster')
            })
			//Itemwise Commission
			.state('app.ItemwiseCommission', {
				url: '/ItemwiseCommission',
				templateUrl: basepath('Setting/ItemwiseCommission/ItemwiseCommission.html'),
				resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
			})
            //Integration
            .state('app.SettingIntegration', {
                url: '/SettingIntegration',
                templateUrl: basepath('Setting/SettingIntegration/SettingIntegration.html'),
                resolve: requireDeps('angular-chosen','toaster')
            })
			//Jobcard#
			.state('app.SettingJobcardNumber', {
				url: '/SettingJobcardNumber',
				templateUrl: basepath('Setting/SettingJobcardNumber/SettingJobcardNumber.html'),
				resolve: requireDeps('angular-chosen','ngTable','ngTableExport','toaster')
			})
			//Client Profession
			.state('app.SettingClientProfession', {
				url: '/SettingClientProfession',
				templateUrl: basepath('Setting/SettingClientProfession/SettingClientProfession.html'),
				resolve: requireDeps('angular-chosen','treeGrid','toaster')
			})
            //Reminders
            .state('app.SettingReminders', {
                url: '/SettingReminders',
                templateUrl: basepath('Setting/SettingReminders/SettingReminders.html'),
                resolve: requireDeps('angular-chosen','toaster')
            })
            //Expense
            .state('app.SettingExpenses', {
                url: '/SettingExpenses',
                templateUrl: basepath('Setting/SettingExpenses/SettingExpense.html'),
                resolve: requireDeps('ngTable','angular-chosen','toaster')
            })
            //Advance Measurement
            .state('app.AdvanceMeasureUnits', {
                url: '/AdvanceMeasureUnits',
                templateUrl: basepath('Setting/AdvanceMeasureUnits/AdvanceMeasureUnits.html'),
                resolve: requireDeps('ngTable','angular-chosen','toaster')
            })
		/*** End Setting ***/
		//Add Inventory Product
		.state('app.AddInvProduct', {
            url: '/AddInvProduct',
            templateUrl: basepath('Inventory/Product/AddInvProduct.html'),
            resolve: requireDeps('angular-chosen','toaster','ngTableToCsv','importExcel','exportExcel','googleKeyboard')
        })
        //Show Inventory Product
        .state('app.InvProduct', {
            url: '/InvProduct',
            templateUrl: basepath('Inventory/Product/InvProduct.html'),
            resolve: angular.extend(requireDeps('toaster','ngTable','angular-chosen','ngTableToCsv','importExcel','exportExcel'),{
                 ProductLoad: function(productFactory){
                    return productFactory.getProduct().then(function(response){
                        return response;
                    });
                }
            })
        })
		//Show Inventory Product
		.state('app.MergeProduct', {
            url: '/MergeProduct',
            templateUrl: basepath('Inventory/Product/MergeProduct.html'),
            resolve: angular.extend(requireDeps('toaster','ngTable','angular-chosen'),{
                 ProductLoad: function(productFactory){
                    return productFactory.getProduct().then(function(response){
                        return response;
                    });
                }
            })
        })
		//Inventory Barcode Print Product
		.state('app.InvBarcodePrint', {
            url: '/InvBarcodePrint',
            templateUrl: basepath('Inventory/BarcodePrint/InvBarcodePrint.html'),
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		//Add Inventory Stock
		.state('app.AddInvStock', {
            url: '/AddInvStock',
            templateUrl: basepath('Inventory/StockRegister/AddInvStock.html'),
            resolve: requireDeps('angular-chosen','toaster')
        })
		//Show Inventory Stock
		.state('app.InvStock', {
            url: '/InvStock',
            templateUrl: basepath('Inventory/StockRegister/InvStock.html'),
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		//Show Inventory Category
		.state('app.InvCategory', {
            url: '/InvCategory',
            templateUrl: basepath('Inventory/Category/InvCategory.html'),
            resolve: requireDeps('angular-chosen','treeGrid','toaster','ngTableToCsv','importExcel','exportExcel')
        })
		//Show Inventory Group
		.state('app.InvGroup', {
            url: '/InvGroup',
            templateUrl: basepath('Inventory/Group/InvGroup.html'),
            resolve: requireDeps('angular-chosen','treeGrid','toaster','ngTableToCsv','importExcel','exportExcel')
        })
		//Stock Summary
		.state('app.InvStockSummary', {
            url: '/InvStockSummary',
            templateUrl: basepath('Inventory/StockSummary/InvStockSummary.html'),
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		
		/** END INVENTORY **/
		
		//Accounting Sales
		.state('app.AccSales', {
            url: '/AccSales',
			controller: 'AccSalesController as form',
            templateUrl: basepath('Accounting/Sales/AccSales.html'),
            resolve: requireDeps('angular-chosen','toaster')
        })
		//Accounting View Sales
		.state('app.AccViewSales', {
            url: '/AccViewSales',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
				viewDataType: function(){
					return 'sales';
				}
			})
        })
        //Accounting Data Sales
        .state('app.AccDataSales', {
            url: '/AccDataSales',
            templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
            controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins','toaster'),{
                headerType: function(){
                    return 'sales';
                }
            })
        })
		//Accounting View Retail Sales
		.state('app.AccViewRetailSales', {
            url: '/AccViewRetailSales',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
				viewDataType: function(){
					return 'Retailsales';
				}
			})
        })
        //Accounting Data Retail Sales
        .state('app.AccDataRetailSales', {
            url: '/AccDataRetailSales',
            templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
            controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster'),{
                headerType: function(){
                    return 'Retailsales';
                }
            })
        })
        //Accounting Data Retail Sales
        .state('app.AccDataQuotations', {
            url: '/AccDataQuotations',
            templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
            controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster','moment'),{
                headerType: function(){
                    return 'Quotations';
                }
            })
        })
        //Accounting Data Retail Sales
        .state('app.AccDataQuotationsFlow', {
            url: '/AccDataQuotationsFlow',
            templateUrl: basepath('Accounting/viewData/AccFlowViews.html'),
            controller: 'AccFlowViewController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster','moment'),{
                headerType: function(){
                    return 'Quotations Process';
                }
            })
        })
		//Accounting Data Retail Sales
		.state('app.AccDataSalesOrders', {
            url: '/AccDataSalesOrders',
            templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
			controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster','moment'),{
				headerType: function(){
					return 'Sales Orders';
				}
			})
        })
        //Accounting View Whole Sales
        .state('app.AccViewWholeSales', {
            url: '/AccViewWholeSales',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
            controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
                viewDataType: function(){
                    return 'Wholesales';
                }
            })
        })
        //Accounting View Sales Orders
        .state('app.AccViewSalesOrders', {
            url: '/AccViewSalesOrders',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
            controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster','moment'),{
                viewDataType: function(){
                    return 'Sales Orders';
                }
            })
        })
		//Accounting View Quotations
		.state('app.AccViewQuotations', {
            url: '/AccViewQuotations',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster','moment'),{
				viewDataType: function(){
					return 'Quotations';
				}
			})
        })

        //Accounting Data Sales
        .state('app.QuotationFlowView', {
            url: '/QuotationFlowView',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
            controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins','toaster'),{
                viewDataType: function(){
                    return 'Quotations Process';
                }
            })
        })
		//Accounting Data Whole Sales
		.state('app.AccDataWholeSales', {
            url: '/AccDataWholeSales',
            templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
			controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster','moment'),{
				headerType: function(){
					return 'Wholesales';
				}
			})
        })
		//Accounting Retail Purchase
		.state('app.AccPurchase', {
            url: '/AccPurchase',
            templateUrl: basepath('Accounting/Purchase/AccPurchase.html'),
			controller: 'AccPurchaseController as form',
            resolve: angular.extend(requireDeps('angular-chosen','toaster'),{
				purchaseType: function(){
					return 'retail';
				}
			})
        })
		//Accounting Tax Purchase
		// .state('app.AccTaxPurchase', {
  //           url: '/AccTaxPurchase',
  //           templateUrl: basepath('Accounting/Purchase/AccPurchase.html'),
		// 	controller: 'AccPurchaseController as form',
  //           resolve: angular.extend(requireDeps('angular-chosen','toaster'),{
		// 		purchaseType: function(){
		// 			return 'tax';
		// 		}
		// 	})
  //       })
        .state('app.AccTaxPurchase', {
            url: '/AccTaxPurchase',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
            controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
                viewDataType: function(){
                    return 'Tax-Purchase';
                }
            })
        })
        //Accounting Data Tax Purchase
        .state('app.AccDataTaxPurchase', {
            url: '/AccDataTaxPurchase',
            templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
            controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster','moment'),{
                headerType: function(){
                    return 'Tax-Purchase';
                }
            })
        })
		//Accounting View Purchase
		.state('app.AccViewPurchase', {
            url: '/AccViewPurchase',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
				viewDataType: function(){
					return 'purchase';
				}
			})
        })
		//Accounting Data Purchase
		.state('app.AccDataPurchase', {
            url: '/AccDataPurchase',
             templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
			controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins','toaster'),{
				headerType: function(){
					return 'purchase';
				}
			})
        })
		//Accounting View Credit Notes
		.state('app.AccViewCreditNotes', {
            url: '/AccViewCreditNotes',
            templateUrl: basepath('Accounting/CreditNotes/AccViewCreditNotes.html'),
            resolve: requireDeps('angular-chosen','toaster')
        })
		//Accounting Data Credit Notes
		.state('app.AccDataCreditNotes', {
            url: '/AccDataCreditNotes',
            templateUrl: basepath('Accounting/CreditNotes/AccDataCreditNotes.html'),
			controller: 'AccDataCreditNotesController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins')
        })
		//Accounting View Debit Notes
		.state('app.AccViewDebitNotes', {
            url: '/AccViewDebitNotes',
            templateUrl: basepath('Accounting/DebitNotes/AccViewDebitNotes.html'),
            resolve: requireDeps('angular-chosen','toaster')
        })
		//Accounting Data Debit Notes
		.state('app.AccDataDebitNotes', {
            url: '/AccDataDebitNotes',
            templateUrl: basepath('Accounting/DebitNotes/AccDataDebitNotes.html'),
			controller: 'AccDataCreditNotesController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins')
        })
		//Accounting Special journal
		.state('app.AccSpecialJrnl', {
            url: '/AccSpecialJrnl',
            templateUrl: basepath('Accounting/SpecialJournal/AccSpecialJrnl.html'),
            resolve: requireDeps('angular-chosen','toaster')
        })
		//Accounting View Special journal
		.state('app.AccViewSpecialJrnl', {
            url: '/AccViewSpecialJrnl',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
				viewDataType: function(){
					return 'specialJournal';
				}
			})
        })
		//Accounting Data Special journal
		.state('app.AccDataSpecialJrnl', {
            url: '/AccDataSpecialJrnl',
             templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
			controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins','toaster'),{
				headerType: function(){
					return 'specialJournal';
				}
			})
        })
		//Accounting Payment
		.state('app.AccPayment', {
            url: '/AccPayment',
            templateUrl: basepath('Accounting/Payment/AccPayment.html'),
            resolve: requireDeps('angular-chosen','toaster')
        })
		//Accounting View Payment
		.state('app.AccViewPayment', {
            url: '/AccViewPayment',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
				viewDataType: function(){
					return 'payment';
				}
			})
        })
		//Accounting Data Payment
		.state('app.AccDataPayment', {
            url: '/AccDataPayment',
             templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
			controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins','toaster','moment'),{
				headerType: function(){
					return 'payment';
				}
			})
        })
		//Accounting Receipt
		.state('app.AccReceipt', {
            url: '/AccReceipt',
            templateUrl: basepath('Accounting/Receipt/AccReceipt.html'),
            resolve: requireDeps('angular-chosen','toaster')
        })
		//Accounting View Receipt
		.state('app.AccViewReceipt', {
            url: '/AccViewReceipt',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen','moment'),{
				viewDataType: function(){
					return 'receipt';
				}
			})
        })
		//Accounting Data Receipt
		.state('app.AccDataReceipt', {
            url: '/AccDataReceipt',
             templateUrl: basepath('Accounting/viewData/AccDataViews.html'),
			controller: 'AccViewDataController as table',
            resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins','toaster'),{
				headerType: function(){
					return 'receipt';
				}
			})
        })
		//Accounting Trail Balance
		.state('app.AccTrailBalance', {
            url: '/AccTrailBalance',
            templateUrl: basepath('Accounting/Statements/AccTrailBalance.html'),
			controller: 'AccTrailBalanceController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		//Accounting BalanceSheet
		.state('app.AccBalanceSheet', {
            url: '/AccBalanceSheet',
            templateUrl: basepath('Accounting/Statements/AccBalanceSheet.html'),
			controller: 'AccBalanceSheetController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		//Accounting Profit & Loss
		.state('app.AccProfitLoss', {
            url: '/AccProfitLoss',
            templateUrl: basepath('Accounting/Statements/AccProfitLoss.html'),
			controller: 'AccProfitLossController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		//Accounting Cash Flow
		.state('app.AccCashFlow', {
            url: '/AccCashFlow',
            templateUrl: basepath('Accounting/Statements/AccCashFlow.html'),
			controller: 'AccCashFlowController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','toaster')
        })
		
		/** Taxation **/
		
			//Accounting View Sales Taxation
			.state('app.AccViewSalesTaxation', {
				url: '/AccViewSalesTaxation',
				templateUrl: basepath('Accounting/viewData/AccView.html'),
				controller: 'AccViewController as form',
				resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
					viewDataType: function(){
						return 'salesTaxation';
					}
				})
			})
			//Accounting Sales Taxation
			.state('app.AccSalesTaxation', {
				url: '/AccSalesTaxation',
				templateUrl: basepath('Accounting/Taxation/AccSalesTaxation.html'),
				controller: 'AccTaxationController as table',
				resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
					headerType: function(){
						return 'salesTaxation';
					}
				})
			})
			//Accounting View Purchase Taxation
			.state('app.AccViewPurchaseTaxation', {
				url: '/AccViewPurchaseTaxation',
				templateUrl: basepath('Accounting/viewData/AccView.html'),
				controller: 'AccViewController as form',
				resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
					viewDataType: function(){
						return 'purchaseTaxation';
					}
				})
			})
			//Accounting Purchase Taxation
			.state('app.AccPurchaseTaxation', {
				url: '/AccPurchaseTaxation',
				templateUrl: basepath('Accounting/Taxation/AccPurchaseTaxation.html'),
				controller: 'AccTaxationController as table',
				resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
					headerType: function(){
						return 'purchaseTaxation';
					}
				})
			})
			//Accounting View Purchase Detail Taxation
			.state('app.AccViewPurchaseDetailTaxation', {
				url: '/AccViewPurchaseDetailTaxation',
				templateUrl: basepath('Accounting/viewData/AccView.html'),
				controller: 'AccViewController as form',
				resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
					viewDataType: function(){
						return 'purchaseDetailTaxation';
					}
				})
			})
			//Accounting Purchase Detail Taxation
			.state('app.AccPurchaseDetailTaxation', {
				url: '/AccPurchaseDetailTaxation',
				templateUrl: basepath('Accounting/Taxation/AccPurchaseDetailTaxation.html'),
				controller: 'AccTaxationController as table',
				resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
					headerType: function(){
						return 'purchaseDetailTaxation';
					}
				})
			})
			//GST Return View
            .state('app.AccViewGstReturn', {
                url: '/AccViewGstReturn',
                templateUrl: basepath('Accounting/viewData/AccView.html'),
                controller: 'AccViewController as form',
                resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
                    viewDataType: function(){
                        return 'GST Return';
                    }
                })
            })
            
            //GST Return Data
            .state('app.AccDataGstReturn', {
                url: '/AccDataGstReturn',
                templateUrl: basepath('Accounting/Taxation/AccGstReturn.html'),
                controller: 'AccTaxationController as table',
                resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
                    headerType: function(){
                        return 'GST Return';
                    }
                })
            })

            //GST Return2 View
            .state('app.AccViewGstR2', {
                url: '/AccViewGstR2',
                templateUrl: basepath('Accounting/viewData/AccView.html'),
                controller: 'AccViewController as form',
                resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
                    viewDataType: function(){
                        return 'GST Return2';
                    }
                })
            })
            //GST Return2 Data
            .state('app.AccDataGstReturn2', {
                url: '/AccDataGstReturn2',
                templateUrl: basepath('Accounting/Taxation/AccGstR2.html'),
                controller: 'AccTaxationController as table',
                resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
                    headerType: function(){
                        return 'GST Return2';
                    }
                })
            })

            //GST Return3 View
			.state('app.AccViewGstR3', {
				url: '/AccViewGstR3',
				templateUrl: basepath('Accounting/viewData/AccView.html'),
				controller: 'AccViewController as form',
				resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
					viewDataType: function(){
						return 'GST Return3';
					}
				})
			})

			//GST Return3 Data
			.state('app.AccDataGstReturn3', {
				url: '/AccDataGstReturn3',
				templateUrl: basepath('Accounting/Taxation/AccGstR3.html'),
				controller: 'AccTaxationController as table',
				resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
					headerType: function(){
						return 'GST Return3';
					}
				})
			})

            //GST Return3b View
            .state('app.AccViewGstR3b', {
                url: '/AccViewGstR3b',
                templateUrl: basepath('Accounting/viewData/AccView.html'),
                controller: 'AccViewController as form',
                resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
                    viewDataType: function(){
                        return 'GST Return3b';
                    }
                })
            })
            
            //GST Return3 Data
            .state('app.AccDataGstReturn3b', {
                url: '/AccDataGstReturn3b',
                templateUrl: basepath('Accounting/Taxation/AccGstR3b.html'),
                controller: 'AccTaxationController as table',
                resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
                    headerType: function(){
                        return 'GST Return3b';
                    }
                })
            })
		/** End Taxation **/
		
		//Accounting Ledger
		.state('app.AccLedger', {
            url: '/AccLedger',
            templateUrl: basepath('Accounting/Ledger/Ledger.html'),
            resolve: requireDeps('inputmask', 'angular-chosen','ngTable','toaster')
        })
		//Accounting Data Ledger
		.state('app.AccDataLedger', {
            url: '/AccDataLedger',
            templateUrl: basepath('Accounting/Ledger/AccDataLedger.html'),
			controller: 'AccDataLedgerController as table',
            resolve: requireDeps('ngTable', 'ngTableExport','angular-chosen','flot-chart','flot-chart-plugins','toaster')
        })
		/*** Quick Menu ***/
			//Retailsale Bill
			.state('app.RetailsaleBill', {
				url: '/RetailsaleBill',
				templateUrl: basepath('QuickMenu/RetailsaleBill.html'),
				resolve: angular.extend(requireDeps('angular-chosen','toaster','twain'),{
					saleType: function(){
						return 'RetailsaleBill';
					}
				})
			})
			//WholeSale Bill
			.state('app.WholesaleBill', {
				url: '/WholesaleBill',
				templateUrl: basepath('QuickMenu/RetailsaleBill.html'), 
				controller: 'RetailsaleBillController as form',
				resolve: angular.extend(requireDeps('taxInvoice','twain','toaster','angular-chosen','ngTable','uiCropper','moment','jquery-ui','googleKeyboard'),{
					saleType: function(){
						return 'WholesaleBill';
					}
				})
			})
			//Purchase Bill
			.state('app.PurchaseBill', {
				url: '/PurchaseBill',
				templateUrl: basepath('QuickMenu/PurchaseBill.html'),
				controller: 'PurchaseBillController as form',
				resolve: angular.extend(requireDeps('purchaseBill','toaster','angular-chosen','twain','ngTable','uiCropper','jquery-ui'),{
                    purchaseType: function(){
                        return 'purchaseBill';
                    }
                })
			})
            //WholeSale Bill Return
            .state('app.AccSalesReturn', {
                url: '/AccSalesReturn',
                templateUrl: basepath('QuickMenu/salesReturnBill.html'), 
                controller: 'SalesReturnBillController as form',
                resolve: angular.extend(requireDeps('twain','toaster','angular-chosen','ngTable','uiCropper','moment','jquery-ui'),{
                    saleType: function(){
                        return 'SalesReturn';
                    }
                })
            })
            //Purchase Order
            .state('app.PurchaseOrder', {
                url: '/PurchaseOrder',
                templateUrl: basepath('QuickMenu/PurchaseBill.html'),
                controller: 'PurchaseBillController as form',
                resolve: angular.extend(requireDeps('purchaseBill','toaster','angular-chosen','twain','ngTable','uiCropper','jquery-ui'),{
                    purchaseType: function(){
                        return 'purchaseOrder';
                    }
                })
            })
			//Quotation Print
			.state('app.QuotationPrint', {
				url: '/QuotationPrint',
				templateUrl: basepath('QuickMenu/RetailsaleBill.html'),
				controller: 'RetailsaleBillController as form',
				resolve: angular.extend(requireDeps('taxInvoice','angular-chosen','toaster','ngTable','uiCropper','moment','jquery-ui'),{
					saleType: function(){
						return 'QuotationPrint';
					}
				})
			})
            //Sales Order (Same as WholeSale bill)
            .state('app.AccSalesOrder', {
                url: '/AccSalesOrder',
                templateUrl: basepath('QuickMenu/RetailsaleBill.html'),
                controller: 'RetailsaleBillController as form',
                resolve: angular.extend({
                    saleType: function(){
                        return 'SalesOrder';
                    }
                },requireDeps('taxInvoice','twain','toaster','angular-chosen','ngTable','uiCropper','moment','jquery-ui'))
            })
		/*** End Quick Menu ***/
		
		/** CRM **/
		
			//View All Jobcard
			.state('app.CrmAllJobcard', {
				url: '/CrmAllJobcard',
				templateUrl: basepath('CRM/Jobcard/CrmAllJobcard.html'),
				resolve: requireDeps('ngTable', 'ngTableExport','toaster')
			})
		
			//Jobcard Add/Edit
			.state('app.CrmJobcard', {
				url: '/CrmJobcard',
				templateUrl: basepath('CRM/Jobcard/CrmJobcard.html'),
				controller: 'CrmJobcardController as form',
				resolve: requireDeps('angular-chosen','toaster')
			})
			
			//Client Filter
			.state('app.CrmClientFilterView', {
				url: '/CrmClientFilterView',
				templateUrl: basepath('Accounting/viewData/AccView.html'),
				controller: 'AccViewController as form',
				resolve: angular.extend(requireDeps('toaster','angular-chosen','moment'),{
					viewDataType: function(){
						return 'CrmClientFilterView';
					},
                    ClientLoad: function(clientFactory){
                        return clientFactory.getClient().then(function(response){
                           return response;
                        });
                    },
                    ProfessionLoad: function(clientFactory){
                        return clientFactory.getProfession().then(function(response){
                           return response;
                        });
                    }
				})
			})
			//Client Filter Data
			.state('app.CrmClientFilterData', {
				url: '/CrmClientFilterData',
				templateUrl: basepath('CRM/Client/CrmClientFilterData.html'),
				controller: 'CrmClientFilterDataController as table',
				resolve: requireDeps('toaster','ngTable','angular-chosen','wysiwyg')
			})
			//Client History
			.state('app.CrmClientHistory', {
				url: '/CrmClientHistory',
				 templateUrl: basepath('CRM/Client/CrmClientHistory.html'),
				controller: 'CrmClientHistoryController as table',
				resolve: requireDeps('ngTable','angular-chosen','toaster')
			})
		
			 .state('app.CrmClientHistory.compose', {
				url: '/mailCompose',
				views: {
				  'container@app.CrmClientHistory': {
					templateUrl: basepath('CRM/Client/mailCompose.html')
				  }
				},
				resolve: requireDeps('wysiwyg')
			})
			
			.state('app.CrmClientHistory.sms', {
				url: '/sms',
				views: {
				  'container@app.CrmClientHistory': {
					templateUrl: basepath('CRM/Client/sms.html')
				  }
				},
				resolve: requireDeps('wysiwyg')
			})
		/** End CRM **/
		
		/*** PriceList ***/
		//Form RetailSales
		.state('app.FormPriceListRetailSales', {
            url: '/FormPriceListRetailSales',
            templateUrl: basepath('PriceList/RetailSales/FormPriceListRetailSales.html'),
			controller: 'FormPriceListRetailSalesController as form',
            resolve: angular.extend(requireDeps('angular-chosen','toaster'),{
				saleType: function(){
					
					return 'retail_sales';
				}
			})
        })
		//Show RetailSales
		.state('app.PriceListRetailSales', {
            url: '/PriceListRetailSales',
            templateUrl: basepath('PriceList/RetailSales/PriceListRetailSales.html'),
			controller: 'PriceListRetailSalesController as table',
			 resolve: angular.extend(requireDeps('ngTable', 'ngTableExport','PriceListTreeGrid','angular-chosen'),{
				saleType: function(){
					
					return 'retail_sales';
				}
			})
        })
		//Form WholeSales
		.state('app.FormPriceListWholeSales', {
            url: '/FormPriceListWholeSales',
            templateUrl: basepath('PriceList/RetailSales/FormPriceListRetailSales.html'),
			controller: 'FormPriceListRetailSalesController as form',
            resolve: angular.extend(requireDeps('angular-chosen','toaster'),{
				saleType: function(){
					
					return 'whole_sales';
				}
			})
        })
		//Show WholeSales
		.state('app.PriceListWholeSales', {
            url: '/PriceListWholeSales',
            templateUrl: basepath('PriceList/RetailSales/PriceListRetailSales.html'),
			controller: 'PriceListRetailSalesController as table',
			 resolve: angular.extend(requireDeps('ngTable', 'treeGrid','ngTableToCsv','ngTableExport','angular-chosen'),{
				saleType: function(){
					
					return 'whole_sales';
				}
			})
        })
		/*** End PriceList ***/
		
		/***  Analyzer Reports **/
		
		//View Police Report
		.state('app.ReportPolice', {
            url: '/ReportPolice',
            templateUrl: basepath('Accounting/viewData/AccView.html'),
			controller: 'AccViewController as form',
            resolve: angular.extend(requireDeps('toaster','angular-chosen'),{
				viewDataType: function(){
					return 'PoliceReport';
				}
			})
        })
		//Data Plice Reports
		.state('app.ReportPoliceData', {
			url: '/ReportPoliceData',
			templateUrl: basepath('Analyzer/Reports/ReportPoliceData.html'),
			controller: 'PoliceReportController as table',
			resolve: angular.extend(requireDeps('ngTable','angular-chosen','toaster'),{
				headerType: function(){
					return 'PoliceReport';
				}
			})
		})
		/*** End Analyzer Reports **/
        .state('app.form-validation', {
            url: '/form-validation',
            templateUrl: basepath('form-validation.html')
        })
        .state('app.form-wizard', {
            url: '/form-wizard',
            templateUrl: basepath('form-wizard.html')
        })
        .state('app.charts', {
            url: '/charts',
            templateUrl: basepath('charts.html'),
            resolve: requireDeps('flot-chart','flot-chart-plugins')
        })
        .state('app.table-responsive', {
            url: '/table-responsive',
            templateUrl: basepath('table-responsive.html')
        })
        .state('app.calendar', {
            url: '/calendar',
            templateUrl: basepath('calendar.html'),
            resolve: requireDeps('jquery-ui', 'moment', 'ui.calendar', 'gcal')
        })
        .state('app.invoice', {
            url: '/invoice',
            templateUrl: basepath('invoice.html')
        })
        .state('app.search', {
            url: '/search',
            templateUrl: basepath('search.html'),
            resolve: requireDeps('moment',  'angular-chosen', 'slider')
        })
        .state('app.price', {
            url: '/price',
            templateUrl: basepath('price-table.html')
        })
        .state('app.tasks', {
            url: '/tasks',
            templateUrl: basepath('tasks.html'),
            controller: 'TasksController as taskctrl'
        })
        .state('app.template', {
            url: '/template',
            templateUrl: basepath('template.html')
        })
        .state('app.documentation', {
            url: '/documentation',
            templateUrl: basepath('documentation.html'),
            resolve: requireDeps('flatdoc')
        })
        // Mailbox
        // ----------------------------------- 
        .state('app.mailbox', {
            url: '/mailbox',
            abstract: true,
            templateUrl: basepath('mailbox.html'),
            resolve: requireDeps('moment')
        })
        .state('app.mailbox.folder', {
            url: '/folder',
            abstract: true
        })
        .state('app.mailbox.folder.list', {
            url: '/:folder',
            views: {
              'container@app.mailbox': {
                templateUrl: basepath('mailbox-folder.html')
              }
            }
        })
        .state('app.mailbox.folder.list.view', {
            url: '/:id',
            views: {
              'mails@app.mailbox.folder.list': {
                templateUrl: basepath('mailbox-view-mail.html')
              }
            },
            resolve: requireDeps('wysiwyg')
        })
        .state('app.mailbox.compose', {
            url: '/compose',
            views: {
              'container@app.mailbox': {
                templateUrl: basepath('mailbox-compose.html')
              }
            },
            resolve: requireDeps('wysiwyg')
        })
        // 
        // Single Page Routes
        // ----------------------------------- 
        .state('page', {
            url: '/page',
            templateUrl: 'app/pages/page.html',
            resolve: requireDeps('icons', 'animate')
        })
        .state('page.login', {
            url: '/login',
            templateUrl: 'app/pages/login.html?r='+Math.random()
        })
        .state('page.register', {
            url: '/register',
            templateUrl: 'app/pages/register.html'
        })
        .state('page.recover', {
            url: '/recover',
            templateUrl: 'app/pages/recover.html'
        })
        .state('page.lock', {
            url: '/lock',
            templateUrl: 'app/pages/lock.html'
        })
        // 
        // CUSTOM RESOLVE FUNCTION
        //   Add your own resolve properties
        //   following this object extend
        //   method
        // ----------------------------------- 
        // .state('app.yourRouteState', {
        //   url: '/route_url',
        //   templateUrl: 'your_template.html',
        //   controller: 'yourController',
        //   resolve: angular.extend(
        //     requireDeps(...), {
        //     // YOUR CUSTOM RESOLVES HERE
        //     }
        //   )
        // })
        ;


        // Change here your views base path
        function basepath(uri) {
          return 'app/views/' + uri;
        }

        // Generates a resolve object by passing script names
        // previously configured in constant.appDependencies
        // Also accept functions that returns a promise
        function requireDeps() {
          var _args = arguments;
          return {
            deps: ['$ocLazyLoad','$q', function ($ocLL, $q) {
              // Creates a promise chain for each argument
              var promise = $q.when(1); // empty promise
              for(var i=0, len=_args.length; i < len; i ++){
                promise = addThen(_args[i]);
              }
              return promise;

              // creates promise to chain dynamically
              function addThen(_arg) {
                // also support a function that returns a promise
                if(typeof _arg == 'function')
                    return promise.then(_arg);
                else
                    return promise.then(function() {
                      // if is a module, pass the name. If not, pass the array
                      var whatToLoad = getRequired(_arg);
                      // simple error check
                      if(!whatToLoad) return $.error('Route resolve: Bad resource name [' + _arg + ']');
                      // finally, return a promise
                      return $ocLL.load( whatToLoad );
                    });
              }
              // check and returns required data
              // analyze module items with the form [name: '', files: []]
              // and also simple array of script files (for not angular js)
              function getRequired(name) {
                if (appDependencies.modules)
                    for(var m in appDependencies.modules)
                        if(appDependencies.modules[m].name && appDependencies.modules[m].name === name)
                            return appDependencies.modules[m];
                return appDependencies.scripts && appDependencies.scripts[name];
              }

            }]};
        }

}]).config(['$tooltipProvider', function ($tooltipProvider) {

    $tooltipProvider.options({appendToBody: true});

}]).config(['$translateProvider', function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix : 'app/langs/',
        suffix : '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useLocalStorage();

}]).config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
	cfpLoadingBarProvider.loadingBarTemplate = '<div id="loading-bar" style="top:inherit !important"><div class="bar"><div class="peg"></div></div></div>';
	//cfpLoadingBarProvider.barColor = '#fff';
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.latencyThreshold = 500;
   // cfpLoadingBarProvider.parentSelector = '.app-container > section';
    cfpLoadingBarProvider.parentSelector = '.myTopBarPos';
	//cfpLoadingBarProvider.spinnerTemplate = "<div><span class='fa fa-spinner'>Loading...</div>";
}]).config(['$httpProvider', function($httpProvider) {
    //$httpProvider.defaults.headers.common['Authorization'] = /* ... */;
  
   //$httpProvider.interceptors.push('httpRequestInterceptor');
    //$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    //$httpProvider.defaults.headers.common["X-XSRF-TOKEN"] = 'tocken';
    //$httpProvider.defaults.headers.common["Content-Type"] = undefined;
    //$httpProvider.defaults.headers.common["authenticationToken"] = $rootScope.$storage.authToken;
}]);
