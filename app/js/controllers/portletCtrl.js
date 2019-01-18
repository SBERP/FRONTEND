
/**=========================================================
 * Module: PortletsController.js
 * Drag and drop any panel based on jQueryUI portlets
 =========================================================*/
 
App.directive('portlet', ["$timeout", function($timeout) {
  'use strict';

  var storageKeyName = 'portletState';
  var $scope;

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      
      $scope = scope;

      // Component is not optional
      if(!$.fn.sortable) return;

      element.sortable({
        connectWith:          '[portlet]',
        items:                'tr.myTable',
        handle:               '.portlet-handler',
        opacity:              0.7,
        placeholder:          'portlet box-placeholder',
        cancel:               '.portlet-cancel',
        forcePlaceholderSize: true,
        iframeFix:            false,
        tolerance:            'pointer',
        helper:               'original',
        revert:               200,
        forceHelperSize:      true,
        start:                setListSize,
        update:               savePortletOrder,
        create:               loadPortletOrder
      });

    }
  };

  function savePortletOrder(event, ui) {
    var self = event.target;
    var data = $scope.$storage[storageKeyName];
    
    if(!data) { data = {}; }

    data[self.id] = $(self).sortable('toArray');

    if(data) {
      $timeout(function() {
        $scope.$storage[storageKeyName] = data;
      });
    }
    
    // save portlet size to avoid jumps
    setListSize(self);
  }

  function loadPortletOrder(event) {
    var self = event.target;
    var data = $scope.$storage[storageKeyName];

    if(data) {
      
      var porletId = self.id,
          panels   = data[porletId];

      if(panels) {
        var portlet = $('#'+porletId);
        
        $.each(panels, function(index, value) {
           $('#'+value).appendTo(portlet);
        });
      }

    }

    // save portlet size to avoid jumps
    setListSize(self);
  }

  // Keeps a consistent size in all portlet lists
  function setListSize(event) {
    var $this = $(event.target || event);
    $this.css('min-height', $this.height());
  }

}]);