App.controller('DemoFileUploadController', [
            '$scope', '$http', '$filter', '$window',
            function ($scope, $http) {
				 var isOnGitHub = window.location.hostname === 'blueimp.github.io',
        url = isOnGitHub ? '//jquery-file-upload.appspot.com/' : 'app/server/php/';
		console.log("dfhsdfh");
                $scope.options = {
                    url: url
                };
                if (!isOnGitHub) {
                    $scope.loadingFiles = true;
                    $http.get(url)
                        .then(
                            function (response) {
								
								console.log(response.data.files);
                                $scope.loadingFiles = false;
                                $scope.queue = response.data.files || [];
								console.log("hi1234567890");
								//console.log($scope.queue);
								console.log("h10");
                            },
                            function () {
                                $scope.loadingFiles = false;
								//console.log("h11");
                            }
							
                        );
						console.log("h2");
						//console.log('After IF');
                }
				//console.log('Last  IF');
            }
        ])