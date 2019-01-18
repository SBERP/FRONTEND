App.factory('productArrayFactory', function() {
    return {
        calculate: function(mainPrice,vat,margin) {
			
            var purchasePrice = parseFloat(mainPrice);
		   
			var percent = parseFloat(vat)+parseFloat(margin);
		
			var totalPercent = purchasePrice * percent/100;	
		
			return purchasePrice + totalPercent;
        },
		calculateTax: function(mainPrice,vat,margin) {
			
            var purchasePrice = mainPrice;
		   
			var percent = parseFloat(vat)+parseFloat(margin);
		
			return purchasePrice * percent/100;	
        }
    };
});

App.filter('sumOfValue', function () {
    return function (data, key) {
        if (angular.isUndefined(data) && angular.isUndefined(key))
            return 0;        
        var sum = 0;        
        angular.forEach(data,function(value){
            sum = sum + parseInt(value[key]);
        });        
        return sum;
    }
});