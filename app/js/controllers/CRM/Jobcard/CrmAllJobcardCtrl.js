
/**=========================================================
 * Module: CompanyController.js
 * Controller for ngTables
 =========================================================*/

App.controller('CrmAllJobcardController', CrmAllJobcardController);

function CrmAllJobcardController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,$state,apiResponse,toaster,$modal,getSetFactory) {
  'use strict';
  var vm = this;
   var formdata = new FormData();
   
   
	 var Modalopened = false;
	 
	 $scope.erpPath = $rootScope.erpPath; // Erp Path
	 $scope.dateFormat =  $rootScope.dateFormats; //Date Format
	
	var data = [];
	
	apiCall.getCall(apiPath.PostJobcard).then(function(response){
		
		if(apiResponse.noContent == response || apiResponse.notFound == response){
				
			data = [];
			 toaster.pop('info', '', 'Data Not Available');
		}
		else{
			
			data = response;
			// for (var i = 0; i < data.length; i++) {
			  // data[i].cityName = ""; //initialization of new property 
			  // data[i].cityName = data[i].city.cityName;  //set the data from nested obj into new property
			// }
			
			$scope.contents = data;
					
					
			$scope.contents.sort(function(a, b){
				var entDate = a.entryDate.split("-").reverse().join("-");
				var toDate = b.entryDate.split("-").reverse().join("-");
				var dateA=new Date(entDate), dateB=new Date(toDate);
				return dateB-dateA; 
			});
			
			data= $scope.contents;
					
		}
		$scope.TableData();
	});
	
	//ajaxCall.abort();
 
 
	$scope.getAllCompanyFunction = function(){
		
		apiCall.getCall(apiPath.getAllCompany).then(function(response){
			
			if(apiResponse.noContent == response || apiResponse.notFound == response){
				
				data = [];
				toaster.pop('info', '', 'Data Not Available');
			}
			else{
				
				data = [];
				data = response;
				for (var i = 0; i < data.length; i++) {
				  data[i].cityName = ""; //initialization of new property 
				  data[i].cityName = data[i].city.cityName;  //set the data from nested obj into new property
				}
				
			}			
			
			vm.tableParams.reload();
		});
	}
	
	$scope.TableData = function()
	{
		
		
	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  sorting: {
			  date: 'desc'     // initial sorting
		  }
	  }, {
		   // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			  
			    var orderedData;

			if(params.sorting().date === 'asc'){

			  data.sort(function (a, b) {
				  
			 var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
						
				return dateA - dateB; //sort by date descending
			  });
			  orderedData = data;

			} else if(params.sorting().date === 'desc') {

			  data.sort(function (a, b) {
				  
				 var entDate = a.entryDate.split("-").reverse().join("-");
						var toDate = b.entryDate.split("-").reverse().join("-");
						var dateA=new Date(entDate), dateB=new Date(toDate);
				return dateB - dateA; //sort by date descending
			  });
			  orderedData = data;

			} else if(!params.sorting().date){

			  if (params.filter().term) {
				orderedData = params.filter() ? $filter('filter')(data, params.filter().term) : data;
			  } else {
				orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
			  }
			  
			}

			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			
			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
		  }
	  });
	}

  //Date Convert
	
	$scope.dateConvert = function(entryDate){
		
		var entDate = entryDate.split("-").reverse().join("-");
		
		return entDate; 
	}
	
 
  $scope.edit_Jobcard = function(dataObject)
  {
	  getSetFactory.set(dataObject);
	  
	 // console.log(dataObject);
	  $state.go("app.CrmJobcard");

  }
  
  $scope.delete_comp = function(size,id)
  {
	  //alert(id);
	  if (Modalopened) return;
	  //return false;
	  
		var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
			  controller: deleteDataModalController,
			  size: size
			});

		 Modalopened = true;
		 
		modalInstance.result.then(function () {
		 
		
		 toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Company Deleting....',60000);
		// return false;
		 /**Delete Code **/
			var deletePath = apiPath.getAllCompany+'/'+id;
	  
			apiCall.deleteCall(deletePath).then(function(deleteres){
				
				 toaster.clear();
				if(apiResponse.ok == deleteres){
						
					toaster.pop('success', 'Title', 'Delete Successfully');
					
					$scope.getAllCompanyFunction();
				}
				else{
					
					toaster.pop('warning', 'Opps!!', deleteres);
				}
			 
			});
		 /** End **/
			 Modalopened = false;
			 
		}, function () {
			
			console.log('Cancel');	
			toaster.clear();
		    Modalopened = false;
			
		});
		
	
  }

}
CrmAllJobcardController.$inject = ["$rootScope","$scope", "$filter","ngTableParams","apiCall","apiPath","$state","apiResponse","toaster","$modal","getSetFactory"];