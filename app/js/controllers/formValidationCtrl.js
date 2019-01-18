
/**=========================================================
 * Module: FormValidationController.js
 * Controller for input validation using AngularUI Validate
 =========================================================*/

App.controller('FormValidationController', FormValidationController);

function FormValidationController($scope) {
  'use strict';
  
  this.notBlackListed = function(value) {
    var blacklist = ['bad@domain.com','verybad@domain.com'];
    return blacklist.indexOf(value) === -1;
  };

  this.words = function(value) {
    return value && value.split(' ').length;
  };
}
FormValidationController.$inject = ["$scope"];