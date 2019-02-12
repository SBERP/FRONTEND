
/**=========================================================
 * Module: constants.js
 * Define constants to inject across the application
 =========================================================*/

App
  .constant('appDependencies', {
    // jQuery based and standalone scripts
    scripts: {
      'animate':            ['app/vendor/animate.css/animate.min.css'],
      'icons':              ['app/vendor/fontawesome/css/font-awesome.min.css',
                             'app/vendor/weather-icons/css/weather-icons.min.css',
                             'app/vendor/feather/webfont/feather-webfont/feather.css'],
      'sparklines':         ['app/js/sparklines/jquery.sparkline.min.js'],
      'slider':             ['app/vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js',
                             'app/vendor/seiyria-bootstrap-slider/dist/css/bootstrap-slider.min.css'],
      'wysiwyg':            ['app/vendor/bootstrap-wysiwyg/bootstrap-wysiwyg.js',
                             'app/vendor/bootstrap-wysiwyg/external/jquery.hotkeys.js'],
      'slimscroll':         ['app/vendor/slimscroll/jquery.slimscroll.min.js'],
      'screenfull':         ['app/vendor/screenfull/dist/screenfull.min.js'],
      'vector-map':         ['app/vendor/ika.jvectormap/jquery-jvectormap-1.2.2.min.js',
                             'app/vendor/ika.jvectormap/jquery-jvectormap-1.2.2.css'],
      'vector-map-maps':    ['app/vendor/ika.jvectormap/jquery-jvectormap-world-mill-en.js',
                             'app/vendor/ika.jvectormap/jquery-jvectormap-us-mill-en.js'],
      'loadGoogleMapsJS':   ['app/js/gmap/load-google-maps.js'],
      'flot-chart':         ['app/vendor/Flot/jquery.flot.js'],
      'flot-chart-plugins': ['app/vendor/flot.tooltip/js/jquery.flot.tooltip.min.js',
                             'app/vendor/Flot/jquery.flot.resize.js',
                             'app/vendor/Flot/jquery.flot.pie.js',
                             'app/vendor/Flot/jquery.flot.time.js',
                             'app/vendor/Flot/jquery.flot.categories.js',
                             'app/vendor/flot-spline/js/jquery.flot.spline.min.js'],
      'jquery-ui':          ['app/vendor/jquery-ui/jquery-ui.min.js',
                             'app/vendor/jqueryui-touch-punch/jquery.ui.touch-punch.min.js'],
      'moment' :            ['app/vendor/moment/min/moment-with-locales.min.js'],
      'inputmask':          ['app/vendor/jquery.inputmask/dist/jquery.inputmask.bundle.min.js'],
      'flatdoc':            ['app/vendor/flatdoc/flatdoc.js'],
      'gcal':               ['app/vendor/fullcalendar/dist/gcal.js'],
      'PriceListTreeGrid':  ['app/vendor/PriceListTreeGrid/treeGrid.css',
                             'app/vendor/PriceListTreeGrid/tree-grid-directive.js'],
      'getBranchSrv':       ['app/js/controllers/Branch/getBranchFactory.js'],
      'tinymce':            ['app/vendor/tinymce/js/tinymce/jquery.tinymce.min.js',
                             'app/vendor/tinymce/js/tinymce/tinymce.min.js'],
      'printJS':            ['app/js/jQuery.print.js'],
      'barcodeScanner':     ['app/js/customeJS/qrCodeLib.js',
                             'app/js/customeJS/webcodecamjquery.js'],
      'twain' :             [],
      'importExcel':        ['app/js/customeJS/excel/xlsx.full.min.js',
                             'app/js/customeJS/excel/ods.js',
                             'app/js/customeJS/excel/ui-grid.min.js',
                             'app/js/customeJS/excel/ui-grid.min.css'],
      'exportExcel':        ['https://cdn.jsdelivr.net/alasql/0.3/alasql.min.js']
    },
    // Angular based script (use the right module name)
    modules: [
      {name: 'toaster',           files: ['app/vendor/angularjs-toaster/toaster.js',
                                          'app/vendor/angularjs-toaster/toaster.css']},
      {name: 'ui.knob',           files: ['app/vendor/angular-knob/src/angular-knob.js',
                                          'app/vendor/jquery-knob/dist/jquery.knob.min.js']},
      {name: 'angularFileUpload', files: ['app/vendor/angular-file-upload/dist/angular-file-upload.min.js']},
      {name: 'angular-chosen',    files: ['app/vendor/chosen_v1.2.0/chosen.jquery.min.js',
                                          'app/vendor/chosen_v1.2.0/chosen.min.css',
                                          'app/vendor/angular-chosen/angular-chosen.min.js']},                  
      {name: 'ngTable',           files: ['app/vendor/ng-table/ng-table.min.js',
                                          'app/vendor/ng-table/ng-table.min.css']},
      {name: 'ngTableExport',     files: ['app/vendor/ng-table-export/ng-table-export.js']},
      {name: 'AngularGM',         files: ['app/vendor/AngularGM/angular-gm.min.js']},
      {name: 'ui.calendar',       files: ['app/vendor/fullcalendar/dist/fullcalendar.min.js',
                                          'app/vendor/fullcalendar/dist/fullcalendar.css',
                                          'app/vendor/angular-ui-calendar/src/calendar.js']},
      {name: 'ngTableToCsv',      files: ['app/js/customeJS/ngExport.js']},
      {name: 'ngLetterAvatar',    files: ['app/js/customeJS/ngletteravatar.min.js']},
      {name: 'uiCropper',         files: ['app/js/customeCSS/ui-cropper.css',
                                          'app/js/customeJS/ui-cropper.js']},
      {name: 'treeGrid',          files: ['app/vendor/tree-grid/treeGrid.css',
                                          'app/vendor/tree-grid/tree-grid-directive.js']},
      {name: 'pusher-angular',    files: ['https://js.pusher.com/4.1/pusher.min.js',
                                          '//cdn.jsdelivr.net/npm/pusher-angular@latest/lib/pusher-angular.min.js',
                                          'app/js/customeJS/pusher/pusherConfig.js']},
      {name: 'taxInvoice',         files: ['app/js/controllers/QuickMenu/RetailsaleBillCtrl.js'] },
      {name: 'purchaseBill',       files: ['app/js/controllers/QuickMenu/PurchaseBillCtrl.js'] }
    ]

  })
  // Same colors as defined in the css
  .constant('appColors', {
    'primary':                '#43a8eb',
    'success':                '#88bf57',
    'info':                   '#8293b9',
    'warning':                '#fdaf40',
    'danger':                 '#eb615f',
    'inverse':                '#363C47',
    'turquoise':              '#2FC8A6',
    'pink':                   '#f963bc',
    'purple':                 '#c29eff',
    'orange':                 '#F57035',
    'gray-darker':            '#2b3d51',
    'gray-dark':              '#515d6e',
    'gray':                   '#A0AAB2',
    'gray-light':             '#e6e9ee',
    'gray-lighter':           '#f4f5f5'
  })
  // User Permission Key (Fisrt Parameter key... Second key is on json file in server/sidebar/*.json with "permission" key )
  .constant('userPermisionKey', {
    'configuration':          'configuration',
    'accounting':             'accounting',
    'inventory':              'inventory',
    'crm':                    'crm',
    'analyzer':               'analyzer',
    'pricelist':              'pricelist',
    'quickMenu':              'quickMenu'
  })
   //Api Path
  .constant('apiPath', {
  'rootPath'              : 'http://api.siliconbrain.co.in',
  'getAllBranch'          : 'branches',
  'getOneBranch'          : 'branches/company/',
  'getAllCompany'         : 'companies',
  'getAllState'           : 'states',
  'getAllCity'            : 'cities/state/',
  'getOneCity'            : 'cities',
  'getLedgerGroups'       : 'accounting/ledger-groups',
  'getAllInvoice'         : 'settings/invoice-numbers',
  'getAllQuotation'       : 'settings/quotation-numbers',
  'getAllTemplate'        : 'settings/templates',
  'getTemplateByCompany'  : 'settings/templates/company/',
  'getAllLedgerGroup'     : 'accounting/ledger-groups',
  'getAllLedger'          : 'accounting/ledgers',
  'getAllProduct'         : 'products',
  'getProductByCompany'   : 'products/company/',
  'getAllCategory'        : 'product-categories',
  'getBulkCategory'       : 'product-categories/bulk',
  'getAllGroup'           : 'product-groups',
  'getBulkGroup'          : 'product-groups/bulk',
  'getJrnlNext'           : 'accounting/journals/next',
  'postJrnl'              : 'accounting/journals',
  'getAllClient'          : 'clients',
  'getAllBank'            : 'banks',
  'getAllBankBranch'      : 'banks/branches',
  'postBill'              : 'accounting/bills',
  'postQuotationBill'     : 'accounting/quotations',
  'getLatestInvoice1'     : 'settings/invoice-numbers/company/',
  'getLatestInvoice2'     : '/latest',
  'getLatestQuotation'    : 'settings/quotation-numbers/company/',
  'getJrnlByCompany'      : 'accounting/journals/company/',
  'getOneJrnl'            : 'accounting/journals/',
  'getLedgerJrnl'         : 'accounting/ledgers/company/',
  'getAllStaff'           : 'users',
  'getOneStaff'           : 'users/',
  'loginAuth'             : 'authenticate',
  'deleteToken'           : 'logout/user/',
  'getBill'               : 'accounting/bills/company/',
  'getTrailBalance'       : 'accounting/trial-balance/company/',
  'reGeneratePdf'         : 'documents/bill',
  'billPaymentRefund'     : 'accounting/bills/',
  'settingOption'         : 'settings',
  'getBalanceSheet'       : 'accounting/balance-sheet/company/',
  'getProfitLoss'         : 'accounting/profit-loss/company/',
  'getCashFlow'           : 'accounting/cash-flow/company/',
  'getSalesTax'           : 'accounting/taxation/sale-tax/company/',
  'getPurchaseTax'        : 'accounting/taxation/purchase-tax/company/',
  'getStockData'          : 'accounting/taxation/stock-detail/company/',
  'getIncomeExpenseData'  : 'accounting/taxation/income-expense/company/',
  'getPurchaseDetail'     : 'accounting/taxation/purchase-detail/company/',
  'getGstReturn'          : 'accounting/taxation/gst-return/company/',
  'getGstReturn2'         : 'accounting/taxation/gst-r2/company/',
  'getGstReturn3'         : 'accounting/taxation/gst-r3/company/',
  'getGstReturn3b'        : 'accounting/taxation/gst-r3b/company/',
  'batchBrand'            : 'product-categories/batch',
  'batchCategory'         : 'product-groups/batch',
  'batchProduct'          : 'products/batch',
  'policeReport'          : 'reports/polish-report/company/',
  'stockSummary'          : 'products/company/',
  'stockSummary2'         : '/stock-summary',
  'getJobcardNumber'      : 'crm/job-form-number',
  'getLatestJobcardNumber': 'crm/job-form-number/company/',
  'PostJobcard'           : 'crm/job-form',
  'sendEmail'             : 'crm/conversations/bulk-email',
  'sendSMS'               : 'crm/conversations/bulk-sms',
  'clientProfession'      : 'settings/professions',
  'settingExpense'        : 'settings/expenses',
  'postPurchaseBill'      : 'accounting/purchase-bills',
  'PurchaseBillByCompany' : 'accounting/purchase-bills/company/',
  'documentDelete'        : 'documents/',
  'getSetDraft'           : 'accounting/bills/draft-bill',
  'settingMeasurementUnit': 'settings/measurement-units',
  'multipleBillPrint'     : 'accounting/bills/bulk-print',
  'getStaffCommission'    : 'users/commissions/',
  'getItemizeStockSummary' : 'products/itemize-summary/',
  'getItemizeStockRegister' : 'products/itemize-register/'
  })
  //Api Path
  .constant('apiResponse', {
    'ok': '200: OK',
  'noContent': '204: No Content',
  'notFound': '404: Not Found',
  'noMatch': 'NoMatch: Token Not Matched',
  'tokenExpired': 'Expired: Token Expired',
  'notExists': 'NotExists: Token Not Exists',
  'contentNotProper': 'content: not proper content',
  'mappingError': 'mapping field is missing'
  })
  //API Date Formate
  .constant('apiDateFormate','DD-MM-YYYY')
  //Validation Pattern
  .constant('maxImageSize',2097152)
  //Validation Pattern
  .constant('validationPattern', {
    'alphabets': '/^[a-zA-Z]*$/'
  })
  //Validation Error Message
  .constant('validationMessage', {
    'require': 'This Field is Required',
  'Alphabets': 'Only Alphabets',
  'AlphaNumeric': 'Only Alphabets & Numbers',
  'Numbers': 'Only Numbers',
  'longLength': 'Length is too Long.',
  'shortLength': 'Length is too Short.',
  'thisSpecialCharacter': 'This Special Character Not Allowed',
  'thisSpecialCharacterAndNumber': 'Special Character & Number Not Allowed',
  'email': 'Enter a Valid Email',
  'notMatch': 'Not Match!'
  })
  // Same MQ as defined in the css
  .constant('appMediaquery', {
    'desktopLG':             1200,
    'desktop':                992,
    'tablet':                 768,
    'mobile':                 480
  })
   // Back End Url
  .constant('hostUrl', {
    'localhost': 'http://localhost/SCER-back-end/',
    'scerp1': 'http://www.scerp1.com/',
    'arihant': 'http://api.siliconbrain.in/',
    'enterpriceArihant': 'http://api.arihantdeals.com/',
    'salesArihant': 'http://saleapi.arihantdeals.com/',
    'swaminarayan': 'http://api.swaminarayancycles.com/',
    'swaminarayanNew': 'http://swaminarayanapi.siliconbraintechnosoft.com/',
    'v2erpKey': 'http://v2api.siliconbrain.in/',
    'siliconbrain':  'http://api.siliconbrain.co.in/',
    'prabandhak':  'http://beta.prabandhak.co.in/ERP/back-end/',
    'arnexim':  'http://api.prabandhak.co.in/',
    'arnknits':  'http://api.prabandhak.co.in/',
    'demoPrabandhak': 'http://api.prabandhak.co.in/',
    'stageErp': 'http://stageapi.siliconbraintechnosoft.com/',
    'vastu':'http://api.vastuinteriorsolution.com/'
  })
  // front-end Url
  .constant('hostFrontUrl', {
    'localhost': 'http://localhost/SCER-back-end/public/front-end/',
    'scerp1': 'http://www.scerp1.com/front-end/',
    'arihant': 'http://arihant.siliconbrain.in/',
    'enterpriceArihant': 'http://enterprise.arihantdeals.com/',
    'salesArihant': 'http://sales.arihantdeals.com/',
    'swaminarayan': 'http://erp.swaminarayancycles.com/',
    'swaminarayanNew': 'http://swaminarayanerp.siliconbraintechnosoft.com/',
    'v2erpKey': 'http://v2erp.siliconbrain.in/',
    'siliconbrain':  'http://erp.siliconbrain.co.in/',
    'prabandhak':  'http://beta.prabandhak.co.in/ERP/front-end/',
  'arnexim':  'http://arnexim.prabandhak.co.in/',
  'arnknits':  'http://arnknits.prabandhak.co.in/',
  'demoPrabandhak': 'http://demo.prabandhak.co.in/',
  'stageErp': 'http://stage.siliconbraintechnosoft.com/',
  'vastu':'http://erp.vastuinteriorsolution.com/'
  })
  // Google Captcha Site Key
  .constant('googleSiteKey', {
    'localhost': '6Ld6HSYTAAAAADSDPt5td0Te37OIgB2R10JvAgQg',
    'scerp1': '6LcedD4UAAAAANmxR1qBspyC3Xh_Ii0xYHn5CYn_',
    'arihant': '6Lex4jQUAAAAAL_5SEoYozXVeC-WYzDeORO64Rfw',
    'enterpriceArihant': '6LdoIWcUAAAAAEeQ7nRQURyoGe0GkQg7U4w0EDHD',
    'salesArihant': '6Le8IWcUAAAAAPnCzcSjn0wwp-uOoPf-_vsd5tvN',
    'swaminarayan': '6Leb_z8UAAAAADbbEgHvvgi3i5Bilm27tASJCPUd',
    'swaminarayanNew': '6LdhIGcUAAAAAAxXB4LjzDiDtDqL5l-MV9Q0v_jP',
    'v2erpKey': '6LfxfhwUAAAAAL3B7C6bI-_ZCuCYvO1vNFu4f4-6',
    'siliconbrain':  '6LchHRoUAAAAAIZHW5kSReJ6ZLRJ1gmT4D36Kdhv',
    'prabandhak':  '6Leghh0UAAAAAEr155Ro63rus07_jm0kJ0qWWhUH',
  'arnexim':  '6LdUHDAUAAAAAAVe8YkqlUm79uLJTtcXqEFLYdO0',
  'arnknits':  '6LcNHDAUAAAAAGSxm7_laHly5BVFrzNNDckUIBb9',
  'demoPrabandhak': '6LddYzAUAAAAAFby3EOjaHBvNDI9p4nVbq8R1MIi',
  'stageErp': '6LfBqosUAAAAAOWfCStKdw3Nnjq5Nzq7ThfSglyF',
  'vastu': '6Lczw3YUAAAAAOtoh04wnIew3yRbhx_wC6H4LOM2'
  })
  // front-end Url
  .constant('pusherKey', {
    'localhost': '0948d2ac6b0e6180a3c7',
    // 'localhost': '0948d2ac6b0e6180a3c7',
    'arihant': '0948d2ac6b0e6180a3c7',
    'swaminarayan': '0948d2ac6b0e6180a3c7@',
    'v2erpKey': '0948d2ac6b0e6180a3c7@',
    'siliconbrain':  '0948d2ac6b0e6180a3c7',
    'prabandhak':  '0948d2ac6b0e6180a3c7@',
  'arnexim':  '0948d2ac6b0e6180a3c7@',
  'arnknits':  '0948d2ac6b0e6180a3c7@',
  'demoPrabandhak': '0948d2ac6b0e6180a3c7@'
  });