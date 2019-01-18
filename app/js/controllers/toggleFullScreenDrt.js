
/**=========================================================
 * Module: FullscreenDirective
 * Toggle the fullscreen mode on/off
 =========================================================*/

App.directive('toggleFullscreen', function() {
  'use strict';

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      // fullscreen not supported on ie
      if( /Edge\/|Trident\/|MSIE /.test(window.navigator.userAgent) )
        return $('[toggle-fullscreen]').addClass('hide');
      
      if (screenfull.enabled) {

        element.on('click', function (e) {
          e.preventDefault();

          screenfull.toggle();

          // Switch icon indicator
          if(screenfull.isFullscreen)
            $(this).children('em').removeClass('fa-expand').addClass('fa-compress');
          else
            $(this).children('em').removeClass('fa-compress').addClass('fa-expand');
        
        });

      } else {
        element.remove();
      }
    }
  };

});