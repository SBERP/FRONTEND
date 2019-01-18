App.service('pusherFactory',
['$pusher', function($pusher)
 {
	 	var pusher = new Pusher('0948d2ac6b0e6180a3c7', {
		  cluster: 'ap2'
		});
	
        return $pusher(pusher);
   
}]);