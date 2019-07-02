
/**=========================================================
 * Module: CompanyController.js
 * Controller for ngTables
 =========================================================*/

App.controller('CompanyController', CompanyController);

function CompanyController($rootScope,$scope, $filter, ngTableParams,apiCall,apiPath,productFactory,$location,apiResponse,toaster,$modal,getSetFactory) {
  'use strict';
  var vm = this;
   var formdata = new FormData();
   
   $scope.companyradio='ok';
	 var Modalopened = false;
	 
	 $scope.erpPath = $rootScope.erpPath; // Erp Path
	 
  //Go To AddCompany
	$scope.GoToAddCompany = function(){
	  
	 $rootScope.AddCompanyModify = false;
	 $location.path('app/AddCompany'); 
	 
	}
	
	function filterData(){
		var cnt = data.length;
		var i = 0; 
		while(i < cnt) {
		  data[i].cityName = ""; //initialization of new property 
		  data[i].cityName = data[i].city.cityName;  //set the data from nested obj into new property
		  i++;
		}
	}
	
	var data = [];
	
	apiCall.getCall(apiPath.getAllCompany).then(function(response){
		
		if(apiResponse.noContent == response || apiResponse.notFound == response){
				
			data = [];
			 toaster.pop('info', '', 'Data Not Available');
		}
		else{
			
			data = response;
			$rootScope.$storage.defaultCompany = apiCall.getDefaultCompanyFilter(response);
			filterData();
			
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
				data = response;
				// console.log("vvv");
				$rootScope.$storage.defaultCompany = apiCall.getDefaultCompanyFilter(response);
				// console.log("mmm",$rootScope.$storage.defaultCompany);
				filterData();
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
			  companyName: 'asc'     // initial sorting
		  }
	  }, {
		   // counts: [],
		  total: data.length, // length of data
		  getData: function($defer, params) {
			  
			  // use build-in angular filter
			   if(!$.isEmptyObject(params.$params.filter) && ((typeof(params.$params.filter.companyName) != "undefined" && params.$params.filter.companyName != "")  || (typeof(params.$params.filter.address1) != "undefined" && params.$params.filter.address1 != "") || (typeof(params.$params.filter.address2) != "undefined" && params.$params.filter.address2 != "") || (typeof(params.$params.filter.pincode) != "undefined" && params.$params.filter.pincode != "") || (typeof(params.$params.filter.cityName) != "undefined" && params.$params.filter.cityName != "")))
			  {
					 var orderedData = params.filter() ?
					 $filter('filter')(data, params.filter()) :
					 data;

					  vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

					  params.total(orderedData.length); // set total for recalc pagination
					  $defer.resolve(vm.users);
			  

			  }
			  else{
				  
				   params.total(data.length);
				  
			  }
			 
			 	if(!$.isEmptyObject(params.$params.sorting))
			  	{
				
				 //alert('ggg');
				  var orderedData = params.sorting() ?
						  $filter('orderBy')(data, params.orderBy()) :
						  data;
		  
				  $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			  }
			$scope.totalData = data.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
		  }
	  });
	}

  
  $scope.isDefault_comp = function(id,companyStatus,returnData)
  {
	  toaster.clear();
	  
	  if(companyStatus == 'not'){
		 
			formdata.append('isDefault','ok');
			var editCompany2 = apiPath.getAllCompany+'/'+id;
			
			apiCall.postCall(editCompany2,formdata).then(function(response5){
			
				// console.log("default response = ",response5);
				
				//$location.path('app/Company');
				if(apiResponse.ok == response5){
					
					toaster.pop('success', '', 'Default Company Successfully Changed');
					
					$scope.getAllCompanyFunction();

				}
				else{
					toaster.pop('warning', 'Opps!!', response5);
				}
				formdata.delete('isDefault');
			});
	  }
	  else{
		  toaster.pop('info', '', 'Company Already Seleted');
	  }
  }
  
  	$scope.checkDefaultCompany = function(user)
  	{
  		var returnBool = true;

  		if($rootScope.$storage.authUser.defaultCompanyId != 0){
  			if(user.companyId == $rootScope.$storage.authUser.defaultCompanyId){
  				return false;
  			}
  		}

		if(angular.isObject($rootScope.$storage.authUser.company)){
			if ($rootScope.$storage.authUser.company.companyId == user.companyId){
				return false;
			}
		}
		else{
			if ($rootScope.$storage.authUser.companyId){
				if ($rootScope.$storage.authUser.companyId == user.companyId){
					return false;
				}
			}
		}
  		 return returnBool;
  	}
  $scope.edit_comp = function(id)
  {
	  getSetFactory.set(id);
	  $location.path('app/AddCompany');
	  $rootScope.AddCompanyModify = true;
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
					productFactory.blankProduct();
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
  
  /** Sticker Single **/
		$scope.singleStickerPrint = function(pData){
		
		
		var qty  = pData.qty;
		
		var mywindow = window.open('', 'PRINT', 'height=850,width=850');

		 var is_chrome = Boolean(mywindow.chrome);

        mywindow.document.write('<html><!--head><title>' + document.title  + '</title>');
		
        mywindow.document.write("</head--> <style type='text/css' media='print'>@page {size: auto;margin: 0mm;} body {background-color:#FFFFFF;margin: 0px; }</style><body>");
		mywindow.document.write('<!--center> <h1> Barcode of Company </h1> </center-->');
		mywindow.document.write("<table style='width:100%;margin: 0 auto;'>");
		mywindow.document.write("<tr><td colspan='2' style='text-align:center;'><!--h2> </h2--> </td></tr> 	<tr>");
		
		if(qty%2==0){
				
			var space = "";
		}
		else{
			
			var space = "<td></td>";
		}
			
		for(var n=0;n<qty;n++){

			mywindow.document.write("<td style='position:relative;float:left; width: 280px;padding-top: 23px;padding-left:35px;display: inline-block;font-family: Microsoft New Tai Lue'> ");
			mywindow.document.write("<span style='font-size:12px;text-transform:uppercase;'><b>"+pData.companyName+"</b></span><br /><span style='font-size:12px;text-transform:uppercase;margin-left:5px;'>"+pData.address1+"</span><br /><span style='font-size:12px;text-transform:uppercase;margin-left:5px;'>"+pData.address2+"</span><br /><span style='font-size:12px;text-transform:uppercase;margin-left:5px;'>"+pData.cityName+"- PIN "+pData.pincode+"</span><br /><span style='font-size:12px;text-transform:uppercase;margin-left:5px;'>"+pData.customerCare+"</span>");
			
			if(n == qty-1){
				
				
				mywindow.document.write("</td> "+ space );
				
				/** Next Code **/
				
					mywindow.document.write("</tr></table>");
		
					mywindow.document.write('</body></html>');

					
					
					if (is_chrome) {
						
					   setTimeout(function () { // wait until all resources loaded 
							mywindow.focus(); // necessary for IE >= 10
							mywindow.print();  // change window to mywindow
							mywindow.close();// change window to mywindow
						 }, 2000);
					}
					else {
						mywindow.document.close(); // necessary for IE >= 10
						mywindow.focus(); // necessary for IE >= 10
						mywindow.print();
						mywindow.close();
					}
				
					return true;
		
				/** End **/
			}
			else{
				mywindow.document.write("</td>");
			}
		}
	}
	

}
CompanyController.$inject = ["$rootScope","$scope", "$filter","ngTableParams","apiCall","apiPath","productFactory","$location","apiResponse","toaster","$modal","getSetFactory"];