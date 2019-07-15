App.factory('productFactory', ['apiCall', 'apiPath', 'apiResponse', '$q', 'fetchArrayService', 'uniqueArrayService', function(apiCall, apiPath, apiResponse, $q, fetchArrayService, uniqueArrayService) {
    'use strict';

    var savedData = null;
    var ajax_currently_loading = false;

    function setUpdatedProduct(productId) {
        return apiCall.getCall(apiPath.getAllProduct + '/' + productId).then(function(data) {
            if (angular.isObject(data)) {
                var tempArray = [];
                tempArray.push(data);
                return getProductAPIObjects(tempArray).then(function(filterData) {
                    fetchArrayService.setUpdatedObject(savedData, filterData[0], productId, 'productId');
                    return filterData[0];
                });
            } else {
                return data;
            }
        });
    }

    function setNewProduct(companyId, productName, color, size, variant, pushIt = true) {
        // companyId == '' || productName == '' || color == '' || size == '' ? return 'Parameters are Mising or Wrong' : '';
        var searchPath = apiPath.getProductByCompany + companyId;
        var headerSearch = { 'Content-Type': undefined, 'productName': productName, 'color': color, 'size': size, 'variant': variant };
        return apiCall.getCallHeader(searchPath, headerSearch).then(function(response) {
            if (angular.isArray(response)) {
                return getProductAPIObjects(response).then(function(filterData) {
                    if (pushIt === true) {
                        savedData === null ? savedData = [] : '';
                        savedData.push(filterData[0]);
                    }
                    return filterData[0];
                });
            } else {
                return response;
            }
        });
    }

    function getProduct() {
        if (savedData !== null) {
            var deferredMenu = $q.defer();
            deferredMenu.resolve(savedData);
            return deferredMenu.promise;
        } else {
            if (!ajax_currently_loading) {
                ajax_currently_loading = true;
                return apiCall.getCall(apiPath.getAllProduct).then(function(data) {
                    ajax_currently_loading = false;
                    if (angular.isArray(data)) {
                        return getProductAPIObjects(data).then(function(reData) {
                            savedData = reData;
                            return savedData;
                        });
                    } else {
                        return data;
                    }
                }).catch(function(res) {
                    ajax_currently_loading = false;
                    return res;
                });
            }
        }
    }

    function blankProduct() {
        savedData = null;
    }

    function getSingleProduct(proId) {
        if (savedData !== null) {
            var deferredMenu = $q.defer();
            deferredMenu.resolve(fetchArrayService.getfilteredSingleObject(savedData, proId, 'productId'));
            return deferredMenu.promise;
        } else {
            getProduct();
            return apiCall.getCall(apiPath.getAllProduct + '/' + proId).then(function(data) {
                if (angular.isArray(data)) {
                    return getProductAPIObjects(data).then(function(filterData) {
                        return filterData;
                    });
                } else if (angular.isObject(data)) {
                    return getProductAPIObjects([data]).then(function(filterData) {
                        return filterData[0];
                    });
                } else {
                    return data;
                }
            });
        }
    }

    function getProductByCompany(compId) {
        if (savedData !== null) {
            var deferredMenu = $q.defer();
            deferredMenu.resolve(fetchArrayService.getfilteredArray(savedData, compId, 'companyId'));
            return deferredMenu.promise;
        } else {
            getProduct();
            return apiCall.getCall(apiPath.getProductByCompany + compId).then(function(data) {
                return getProductAPIObjects(data).then(function(filterData) {
                    return filterData;
                });
            });
            //return single_company_ajax;
        }
    }

    function deleteSingleProduct(proId) {
        if (proId != '' && proId != null && proId != undefined) {
            return apiCall.deleteCall(apiPath.getAllProduct + '/' + proId).then(function(response) {
                if (apiResponse.ok == response) {
                    /** Splice **/
                    // var index = fetchArrayService.indexOf(savedData,proId,'productId');
                    var index = savedData.findIndex(x => x['productId'] == proId);
                    // var index = array_search(proId, $array);
                    if (index !== -1) savedData.splice(index, 1);
                    /** Splice **/
                    return response;
                } else {
                    return response;
                }
            });
        } else {
            var deferredMenu = $q.defer();
            deferredMenu.resolve('Product Parameter Not Proper');
            return deferredMenu.promise;
        }
    }

    function getProductAPIObjects(data) {
        var productCategoryArray = uniqueArrayService.getUniqueData(data, 'productCategoryId');
        var headerBulk = { 'Content-Type': undefined, 'productCategoryId': productCategoryArray };
        return apiCall.getCallHeader(apiPath.getBulkCategory, headerBulk).then(function(resBulk) {
            let filData = fetchArrayService.setNewObject(data, resBulk, 'productCategoryId', 'productCategory');
            return getGroupAPIObjects(filData).then(function(resGroupBulk) {
                return getMeasurementUnitAPIObjects(resGroupBulk).then(function(resMaesureBulk) {
                    return resMaesureBulk;
                });
            });
        });
    }

    function getGroupAPIObjects(data) {
        var productGroupArray = uniqueArrayService.getUniqueData(data, 'productGroupId');
        var headerGroupBulk = { 'Content-Type': undefined, 'productGroupId': productGroupArray };
        return apiCall.getCallHeader(apiPath.getBulkGroup, headerGroupBulk).then(function(resBulkGroup) {
            return fetchArrayService.setNewObject(data, resBulkGroup, 'productGroupId', 'productGroup');
        });
    }

    // function getMeasurementUnitAPIObjects(data)
    // {
    // 	return apiCall.getCall(apiPath.settingMeasurementUnit).then(function(resBulkMeasure) {
    // 		console.log(resBulkMeasure);
    // 		var matchParams = ['highestMeasurementUnitId','measurementUnitId'];
    // 		data = fetchArrayService.setNewObject(data,resBulkMeasure,matchParams,'highestMeasurementUnit');
    // 		matchParams = ['higherMeasurementUnitId','measurementUnitId'];
    // 		data = fetchArrayService.setNewObject(data,resBulkMeasure,matchParams,'higherMeasurementUnit');
    // 		return fetchArrayService.setNewObject(data,resBulkMeasure,'measurementUnitId','measurementUnit');
    // 	});
    function getMeasurementUnitAPIObjects(data) {
        return apiCall.getCall(apiPath.settingMeasurementUnit).then(function(resBulkMeasure) {
            var unitParams = ['highest', 'higher', 'medium', 'mediumLower', 'lower', 'lowest'];
            for (var i = 0; i < unitParams.length; i++) {
                if (i < unitParams.length - 1) {
                    var matchParams = [unitParams[i] + 'MeasurementUnitId', 'measurementUnitId'];
                    fetchArrayService.setNewObject(data, resBulkMeasure, matchParams, unitParams[i] + 'MeasurementUnit');
                } else {
                    return fetchArrayService.setNewObject(data, resBulkMeasure, 'measurementUnitId', 'measurementUnit');
                }

            }
        });
    }
    return {
        setUpdatedProduct: setUpdatedProduct,
        setNewProduct: setNewProduct,
        getProduct: getProduct,
        blankProduct: blankProduct,
        getSingleProduct: getSingleProduct,
        getProductByCompany: getProductByCompany,
        deleteSingleProduct: deleteSingleProduct,
        getProductAPIObjects: getProductAPIObjects
    }

}]);