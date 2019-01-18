App.factory('getSetFactory', function() {
 var savedData = {}
 function set(data) {
   savedData = data;
 }
 function get() {
  return savedData;
 }
 function blank() {
   savedData = {};
 }

 return {
  set: set,
  get: get,
  blank: blank
 }

});