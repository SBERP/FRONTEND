App.controller('FileDestroyController', [
            '$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
					//console.log("hi");
					//console.log(file);
                if (file.url) {
					//console.log('Filedestroy IF');
                    file.$state = function () {
                        return state;
                    };
                    file.$destroy = function () {
						console.log('Filedestroy Destroy');
                        state = 'pending';
                        return $http({
                            url: file.deleteUrl,
                            method: file.deleteType
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };
                } else if (!file.$cancel && !file._index) {
                    file.$cancel = function () {
						console.log('cancel');
                        $scope.clear(file);
                    };
					
                }
				//console.log('After Else IF');
            }
        ]);