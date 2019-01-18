
/**=========================================================
 * Module: CalendarController.js
 * This script handle the calendar demo and events creation
 =========================================================*/

App.controller('CalendarController', ["$scope", "colors", "$http", "$timeout", "touchDrag", function ($scope, colors, $http, $timeout, touchDrag) {
  'use strict';

  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  $scope.calEventsPers = {
      id: 0,
      visible: true,
      className: ['fc-id-0'],
      events: [
        {id: 324, title: 'All Day Event',    start: new Date(y, m, 1) },
        {         title: 'Long Event',       start: new Date(y, m, d - 5),        end: new Date(y, m, d - 2)},
        {id: 999, title: 'Repeating Event',  start: new Date(y, m, d - 3, 16, 0),                                     allDay: false},
        {id: 999, title: 'Repeating Event',  start: new Date(y, m, d + 4, 16, 0),                                     allDay: false},
        {         title: 'Birthday Party',   start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false},
        {         title: 'Click for Google', start: new Date(y, m, 28),           end: new Date(y, m, 29),            url: 'http://google.com/'}
      ]
    };
  
  $scope.googleCalendar = {
      id: 1,
      visible: true,
      color: colors.byName('warning'),
      textColor: '#fff',
      url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
      className: ['fc-id-1', 'gcal-event'],
      currentTimezone: 'America/Chicago'
    };

  // event source that pulls from google.com 
  $scope.eventSources = [ $scope.calEventsPers, $scope.googleCalendar ];


  $http.get('server/calendar/external-calendar.json').success(function(data) {
  
    var calEventsExt = {
      id:        2,
      visible:   true,
      color:     colors.byName('purple'),
      textColor: '#fff',
      className: ['fc-id-2'],
      events:    []
    };
  
    // -----------
    // override dates just for demo
    for(var i = 0; i < data.length; i++) {
        data[i].start = new Date(y, m, d+i, 12, 0);
        data[i].end   = new Date(y, m, d+i, 14, 0);
    }
    // -----------

    calEventsExt.events = angular.copy(data);

    $scope.eventSources.push(calEventsExt);

  });

  
  /* alert on eventClick */
  $scope.alertOnEventClick = function( event, allDay, jsEvent, view ){
      console.log(event.title + ' was clicked ');
  };
  /* alert on Drop */
  $scope.alertOnDrop = function(event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view){
     console.log('Event Droped to make dayDelta ' + dayDelta);
  };
  /* alert on Resize */
  $scope.alertOnResize = function(event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ){
     console.log('Event Resized to make dayDelta ' + minuteDelta);
  };

  /* add custom event*/
  $scope.addEvent = function(newEvent) {
    if(newEvent) {
      $scope.calEventsPers.events.push(newEvent);
    }
  };

  /* remove event */
  $scope.remove = function(index) {
    $scope.calEventsPers.events.splice(index,1);
  };
  /* Change View */
  $scope.changeView = function(view,calendar) {
    $scope.myCalendar.fullCalendar('changeView',view);
  };
  /* Change View */
  $scope.renderCalender = function(calendar) {
    $scope.myCalendar.fullCalendar('render');
  };
  
  $scope.toggleEventSource = function(id) {
    $('.fc-id-'+id).toggleClass('hidden');
   };

  /* config object */
  $scope.uiConfig = {
    calendar:{
      googleCalendarApiKey: '<YOUR API KEY>',
      height: 450,
      editable: true,
      header:{
        left: 'month,basicWeek,basicDay',
        center: 'title',
        right: 'prev,next today'
      },
      eventClick:  $scope.alertOnEventClick,
      eventDrop:   $scope.alertOnDrop,
      eventResize: $scope.alertOnResize,
      // Select options
      selectable: true,
      selectHelper: true,
      unselectAuto: true,
      select: function(start, end) {
        var title = prompt('Event Title:');
        var eventData;
        if (title) {
          eventData = {
            title: title,
            start: start.format(),
            end: end.format()
          };
          $scope.addEvent(eventData);
        }
        // $scope.myCalendar.fullCalendar( 'unselect' );
      },
      viewRender: function( view, element ) {
        touchDrag.addTo(element[0]);
      }
    }
  };

  // Language support
  // ----------------------------------- 
  $scope.changeTo = 'Español';
  $scope.changeLang = function() {
    if($scope.changeTo === 'Español'){
      $scope.uiConfig.calendar.dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      $scope.uiConfig.calendar.dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      $scope.changeTo= 'English';
    } else {
      $scope.uiConfig.calendar.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      $scope.uiConfig.calendar.dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      $scope.changeTo = 'Español';
    }
  };

}]);
