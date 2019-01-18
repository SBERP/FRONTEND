
/**=========================================================
 * Module: MailboxController.js
 * Mailbox APP controllers
 =========================================================*/

App.controller('MailboxController', ["$rootScope", "$scope", "$state", function($rootScope, $scope, $state) {
  'use strict';
  // For mail compose
  $scope.mail = {
    cc: false,
    bcc: false
  };

  // Mailbox editr initial content
  $scope.content = "<p>Type something..</p>";

  
  // Manage collapsed folders nav
  $scope.mailboxMenuCollapsed = true;
  $scope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
      closeFolderNav();
    });

  $scope.$on('closeFolderNav', closeFolderNav);

  function closeFolderNav() {
    $scope.mailboxMenuCollapsed = true;
  }

  $scope.mailboxFolders = [
    { name: 'inbox',  count: 3,  icon: 'fa-inbox' },
    { name: 'sent',   count: 8,  icon: 'fa-paper-plane-o' },
    { name: 'draft',  count: 1,  icon: 'fa-edit' },
    { name: 'trash',  count: 12, icon: 'fa-trash-o' }
  ];

  // Define mails at parent scope to use as cache for mail request
  $scope.mails = [];

}]);

App.controller('MailboxFolderController', ["$scope", "$stateParams", "$state", "appMediaquery", "$window", "$timeout", function($scope, $stateParams, $state, appMediaquery, $window, $timeout) {

  var $win = angular.element($window);
  
  $scope.mailPanelOpened = false;

  // Load mails in folder
  // ----------------------------------- 

  // store the current folder
  $scope.folder = $stateParams.folder || 'inbox';
  
  // If folder wasn't loaded yet, request mails using api
  if( ! $scope.mails[$scope.folder] ) {
    
    // Replace this code with a request to your mails API
    // It expects to receive the following object format

    // only populate inbox for demo
    $scope.mails['inbox'] = [
      {
        id: 0,
        subject: 'Morbi dapibus sollicitudin',
        excerpt: 'Nunc et magna in metus pharetra ultricies ac sit amet justo. ',
        time: '09:30 am',
        from: {
          name: 'Sass Rose',
          email: 'mail@example.com',
          avatar: 'app/img/user/01.jpg'
        },
        unread: false
      }
    ];
    // Generate some random user mails
    var azarnames = ['Floyd Kennedy','Brent Woods', 'June Simpson', 'Wanda Ward', 'Travis Hunt'];
    var azarnsubj = ['Nam sodales sollicitudin adipiscing. ','Cras fermentum posuere quam, sed iaculis justo rutrum at. ', 'Vivamus tempus vehicula facilisis. '];
    for(var i =0; i < 10; i++) {
      var m = angular.copy($scope.mails['inbox'][0]);
      m.from.name = azarnames[(Math.floor((Math.random() * (azarnames.length) )))];
      m.from.email = m.from.name.toLowerCase().replace(' ', '') + '@example.com';
      m.subject = azarnsubj[(Math.floor((Math.random() * (azarnsubj.length) )))];
      m.from.avatar = 'app/img/user/0'+(Math.floor((Math.random() * 8))+1)+'.jpg';
      m.time = moment().subtract(i,'hours').format('hh:mm a');
      m.id = i + 1;
      $scope.mails['inbox'].push(m);
    }
    $scope.mails['inbox'][0].unread=true;
    $scope.mails['inbox'][1].unread=true;
    $scope.mails['inbox'][2].unread=true;
    // end random mail generation
  }

  // requested folder mails to display in the view
  $scope.mailList = $scope.mails[$scope.folder];


  // Show and hide mail content
  // ----------------------------------- 
  $scope.openMail = function(id) {
    // toggle mail open state
    toggleMailPanel(true);
    // load the mail into the view
    $state.go('app.mailbox.folder.list.view', {id: id});
    // close the folder (when collapsed)
    $scope.$emit('closeFolderNav');
    // mark mail as read
    $timeout(function() {
      $scope.mailList[id].unread = false;
    }, 1000);
  };

  $scope.backToFolder = function() {
    toggleMailPanel(false);
    $scope.$emit('closeFolderNav');
  };

  // enable the open state to slide the mails panel 
  // when on table devices and below
  function toggleMailPanel(state) {
    if ( $win.width() < appMediaquery['tablet'] )
      $scope.mailPanelOpened = state;
  }

}]);

App.controller('MailboxViewController', ["$scope", "$stateParams", "$state", function($scope, $stateParams, $state) {

  // move the current viewing mail data to the inner view scope
  $scope.viewMail = $scope.mailList[$stateParams.id];

}]);