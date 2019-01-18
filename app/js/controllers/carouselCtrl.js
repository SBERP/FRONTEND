
/**=========================================================
 * Module: DemoCarouselController
 * Provides a simple demo for bootstrap ui carousel
 =========================================================*/

App.controller('CarouselDemoCtrl', ["$scope", function ($scope) {
  'use strict';

  $scope.myInterval = 5000;
  var slides = $scope.slides = [];

  $scope.addSlide = function(index) {
    var newWidth = 800 + slides.length;
    index = index || (Math.floor((Math.random() * 2))+1);
    slides.push({
      image: 'app/img/bg' + index + '.jpg',
      text: "Nulla viverra dignissim metus ac placerat."
    });
  };
  for (var i=1; i<=3; i++) {
    $scope.addSlide(i);
  }
}]);