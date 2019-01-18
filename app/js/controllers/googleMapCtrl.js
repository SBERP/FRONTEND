
/**=========================================================
 * Module: GoogleMapController.js
 * Google Map plugin controller
 =========================================================*/

App.controller('GoogleMapController', GoogleMapController);

function GoogleMapController($scope) {
  'use strict';
  var vm = this;
  // Demo 1
  // ----------------------------------- 

  $scope.$watch(function(){
    return vm.center;
   }, function(center) {
     if (center) {
       vm.centerLat = center.lat();
       vm.centerLng = center.lng();
     }
  });
  
  this.updateCenter = function(lat, lng) {
    vm.center = new google.maps.LatLng(lat, lng);
  };

  // Demo 2
  // ----------------------------------- 

  this.options = {
    map: {
      center: new google.maps.LatLng(48, -121),
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    },
  };
  
  this.volcanoes = [
    {
      id: 0,
      name: 'Mount Rainier',
      img: 'http://www.thetrackerfoundation.org/Images/MountRainier_SM.jpg',
      elevationMeters: 4392,
      location: {
        lat: 46.852947,
        lng: -121.760424
      }
    },
    {
      id: 1,
      name: 'Mount Baker',
      img: 'http://www.destination360.com/north-america/us/washington/images/s/washington-mt-baker-ski.jpg',
      elevationMeters: 3287,
      location: {
        lat: 48.776797,
        lng: -121.814467
      }
    },
    {
      id: 2,
      name: 'Glacier Peak',
      img: 'http://www.rhinoclimbs.com/Images/Glacier.9.jpg',
      elevationMeters: 3207,
      location: {
        lat: 48.111844,
        lng: -121.11412
      }
    }
  ];
  
  this.triggerOpenInfoWindow = function(volcano) {
    vm.markerEvents = [
      {
        event: 'openinfowindow',
        ids: [volcano.id]
      },
    ];
  };

  // Demo 3
  // ----------------------------------- 

  this.options3 = {
    map: {
      center: new google.maps.LatLng(48, -121),
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    },
    notselected: {
      icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png'
    },
    selected: {
      icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png'
    }
  };

  // add to global scope so the map plugin can see the mutated object
  // when we broadcast the changes
  $scope.volcanoes = this.volcanoes;

  this.getVolcanoOpts = function(volcan) {
    return angular.extend(
     { title: volcan.name },
     volcan.selected ? vm.options3.selected :
        vm.options3.notselected
    );
  };
  
  this.selectVolcano = function(volcan) {
    if (vm.volcan) {
      vm.volcan.selected = false;
    }
    vm.volcan = volcan;
    vm.volcan.selected = true;

    $scope.$broadcast('gmMarkersUpdate', 'volcanoes');

  };

}
GoogleMapController.$inject = ["$scope"];