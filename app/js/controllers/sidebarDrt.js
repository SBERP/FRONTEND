
/**=========================================================
 * Module: SidebarDirective
 * Wraps the sidebar. Handles collapsed state and slide
 =========================================================*/

App.directive('sideBar', ['$rootScope', '$window', '$timeout', '$compile', 'appMediaquery', 'support', '$http', '$templateCache',
    function($rootScope, $window, $timeout, $compile, appMediaquery, support, $http, $templateCache) {
  'use strict';
  
  var $win  = $($window);
  var $html = $('html');
  var $body = $('body');
  var $scope;
  var $sidebar;
  var $sidebarNav;
  var $sidebarButtons;

  return {
    restrict: 'E',
    template: '<nav class="sidebar" ng-transclude></nav>',
    transclude: true,
    replace: true,
    link: function(scope, element, attrs) {
      
      $scope   = scope;
      $sidebar = element;
      $sidebarNav = element.children('.sidebar-nav');
      $sidebarButtons = element.find('.sidebar-buttons');

      // depends on device the event we use
      var eventName = isTouch() ? 'click' : 'mouseenter' ;
      $sidebarNav.on( eventName, '.nav > li', function() {
          
        if( isSidebarCollapsed() && !isMobile() ) {
          toggleMenuItem( $(this) );
          if( isTouch() ) {
            sidebarAddBackdrop();
          }
        }

      });

      // Check for click to slide sidebar navigation menu
      $sidebarNav.on('click', '.nav > li', function() {
        if( isSidebarSlider() && !isSidebarCollapsed()) {
          sidebarSliderToggle(this);
        }
      });
      
      // Check for click to slide sidebar bottom item
      $sidebarButtons.on('click', '.btn-sidebar', function() {
        // call parent method
        $scope.collapseAll();
        // slide sidebar 
        sidebarSliderToggle(this);
      });

      // expose a close function to use a go back
      $sidebarNav.on('click', '.sidebar-close', function(){
        sidebarSliderClose();
      });

      // if something ask us to close the sidebar menu
      $scope.$on('closeSidebarMenu', function() {
        sidebarCloseFloatItem();
      });
      // if something ask us to close the sidebar slide
      $scope.$on('closeSidebarSlide', function() {
        sidebarSliderClose();
      });
      
    }
  };

  // Sidebar slide mode
  // ----------------------------------- 
  
  function sidebarSliderClose() {
    if( !$sidebar.hasClass('sidebar-slide')) return;

    if( support.transition ) {
      return $sidebar
        .on(support.transition.end, removeMenuDom)
        .removeClass('sidebar-slide').length;
    }
    else {
      $timeout(removeMenuDom, 500);
      return $sidebar.removeClass('sidebar-slide').length;
    }

    function removeMenuDom() {
      if(support.transition)
        $sidebar.off(support.transition.end);
      $sidebarNav
        .find('.nav-slide').hide()
        .filter('.sidebar-subnav').remove();
    }
  }

  // expect an level 1 li element
  function sidebarSliderToggle(element) {

    var $el = $(element),
        // Find a template
        $item = $el; //$el.siblings('.sidebar-slide-template');
    // if not exists, find a submenu UL
    if( ! $item.hasClass('btn-sidebar'))
      $item = $el.children('ul');
    // make sure other slider are closed
    if( sidebarSliderClose() )
      return;

    if($item.length) {

      var templatePath = $item.attr('compile');
      var newItem, templateContent;

      // Compile content when it contains angular
      if( templatePath ) {
        templateContent = $templateCache.get(templatePath);
        if( templateContent ) {
          prepareItemTemplate( templateContent, templatePath );
        }
        else {
          $http.get(templatePath).success(function(data) {
            // cache the template markup
            $templateCache.put(templatePath, data);
            prepareItemTemplate( data, templatePath );
          });
          
        }
      }
      else {
        newItem = $item.clone();
        addSlideItemToDom(newItem);
      }
    }
  }

  function prepareItemTemplate(markup, id) {
    if( ! $scope.sbSlideItems ) $scope.sbSlideItems = {};
    
    if( ! $scope.sbSlideItems[id]  ) {
      // create an element and compile it
      $scope.sbSlideItems[id] = $compile(markup)($scope.$parent);

    }

    // append to dom
    addSlideItemToDom($scope.sbSlideItems[id]);
  }

  function addSlideItemToDom(newItem) {
    // the first the item is not in dom so we add it
    if ( ! newItem.inDom ) {
      newItem.inDom = true;
      newItem = newItem.prependTo($sidebarNav).addClass('nav-slide');
    }
    else {
      // nex time only show a hidden item
      newItem.show();
    }
    
    $timeout(function() {
      $sidebar.addClass('sidebar-slide')
              .scrollTop(0);
    }, 100);

    // Actives the items
    newItem.on('click.slide.subnav', 'li:not(.sidebar-subnav-header)', function(e){
      e.stopPropagation();
      $(this).off('click.slide.subnav')
        .siblings('li').removeClass('active')
        .end().addClass('active');

    });
  }

  // Handles hover to open items on 
  // collapsed menu
  // ----------------------------------- 
  function toggleMenuItem($listItem) {

    sidebarCloseFloatItem();

    var ul = $listItem.children('ul');

    if( !ul.length )
      return;

    var navHeader = $('.navbar-header');
    var mar =  $rootScope.app.layout.isFixed ?  parseInt( navHeader.outerHeight(true), 0) : 0;

    var subNav = ul.clone().appendTo( '.sidebar-wrapper' );
    
    var itemTop = ($listItem.position().top + mar) - $sidebar.scrollTop();
    var vwHeight = $win.height();

    subNav
      .addClass('nav-floating')
      .css({
        position: $rootScope.app.layout.isFixed ? 'fixed' : 'absolute',
        top:      itemTop,
        bottom:   (subNav.outerHeight(true) + itemTop > vwHeight) ? 0 : 'auto'
      });

    subNav.on('mouseleave', function() {
      subNav.remove();
    });

  }

  function sidebarCloseFloatItem() {
    $('.dropdown-backdrop').remove();
    $('.sidebar-subnav.nav-floating').remove();
  }

  function sidebarAddBackdrop() {
    var $backdrop = $('<div/>', { 'class': 'dropdown-backdrop'} );
    $backdrop.insertAfter($sidebar).on("click", function () {
      sidebarCloseFloatItem();
    });
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
  function isMobile() {
    return $win.width() < appMediaquery.tablet;
  }
  function isSidebarSlider() {
    return $rootScope.app.sidebar.slide;
  }

}]);