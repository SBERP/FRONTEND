App.factory('ReportGroupFactory', ['apiCall', 'apiPath', function(apiCall, apiPath) {
    'use strict';
    var savedGroups = [];
    var savedReportGroupTable = [];
    var ajax_currently_loading = false;

    function getReportGroups() {
        if (ajax_currently_loading)
            return;
        if (savedGroups.length)
            return savedGroups;
        ajax_currently_loading = true;
        return apiCall.getCall(apiPath.reportBuilderGroups).then(response => {
            ajax_currently_loading = false;
            if (angular.isArray(response)) {
                savedGroups = response;
                return savedGroups;
            } else {
                return response;
            }
        }).catch(function(res) {
            ajax_currently_loading = false;
            return res;
        });
    }

    // function getReportGroupCategories() {
    //     if (ajax_currently_loading)
    //         return;
    //     if (savedCategory.length)
    //         return savedCategory;
    //     return getReportGroups().then(groups => {
    //         let tempCat = groups.map(grp => {
    //             return grp.rbGroupCategory;
    //         });
    //         savedCategory = [...new Set(tempCat)];
    //         return savedCategory;
    //     });
    // }
    return {
        getReportGroups: getReportGroups,
        // getReportGroupCategories: getReportGroupCategories
    }

}]);