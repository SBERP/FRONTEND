App.directive("min", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, element, attributes, ngModel) {
                ngModel.$validators.min = function (modelValue) {
                    if (!isNaN(modelValue) && modelValue !== "" && attributes.min !== "")
                        return parseFloat(modelValue) >= attributes.min;
                    else
                        return true;
                }
            }
        };
    });
    
    App.directive("max", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, element, attributes, ngModel) {
                ngModel.$validators.max = function (modelValue) {
                    if (!isNaN(modelValue) && modelValue !== "" && attributes.max !== "")
                        return parseFloat(modelValue) <= attributes.max;
                    else
                        return true;
                }
            }
        };
    });