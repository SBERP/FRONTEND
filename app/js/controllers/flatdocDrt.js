

/**=========================================================
 * Module: FlatDocDirective.js
 * Creates the flatdoc markup and initializes the plugin
 =========================================================*/

App.directive('flatdoc', ["$document", function($document) {
  'use strict';
  return {
    restrict: "EA",
    template: ["<div role='flatdoc'>",
                  "<div role='flatdoc-menu' ui-scrollfix='+1'></div>",
                  "<div role='flatdoc-content'></div>",
               "</div>"].join('\n'),
    link: function(scope, element, attrs) {

      var $root = $('html, body');
      
      Flatdoc.run({
        fetcher: Flatdoc.file(attrs.src)
      });

      angular.element($document).on('flatdoc:ready', function() {
        
        var docMenu = element.find('[role="flatdoc-menu"]');
        
        docMenu.find('a').on('click', function(e) {
          e.preventDefault(); e.stopPropagation();
          
          var $this = $(this);
          
          docMenu.find('a.active').removeClass('active');
          $this.addClass('active');

          $root.animate({
                scrollTop: $(this.getAttribute('href')).offset().top - ($('.topnavbar').height() + 10)
            }, 800);
        });

      });
    }
  };

}])
;