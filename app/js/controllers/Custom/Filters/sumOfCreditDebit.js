App.filter('sumOfDebit', function () {
    return function (data, key) {        
        if (angular.isUndefined(data) && angular.isUndefined(key))
            return 0;        
        var sum = 0;        
        angular.forEach(data,function(value){
			
			if(value['amountType'] == 'debit'){
				sum = sum + parseFloat(value[key]);
			}
        });        
        return sum;
    }
});
App.filter('sumOfCredit', function () {
    return function (data, key) {        
        if (angular.isUndefined(data) && angular.isUndefined(key))
            return 0;        
        var sum = 0;        
        angular.forEach(data,function(value){
			
			if(value['amountType'] == 'credit'){
				sum = sum + parseFloat(value[key]);
			}
        });        
        return sum;
    }
});