
/**=========================================================
 * Module: BranchCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('InvBarcodePrintController', InvBarcodePrintController);

function InvBarcodePrintController($scope,$rootScope, $filter, $state,ngTableParams,apiCall,apiPath,$location,apiResponse,toaster,getSetFactory,$modal,productFactory) {
  'use strict';
  var vm = this;
	//$scope.brandradio="";
	var Modalopened = false;

   $scope.completedQueries = [];
  $scope.erpPath = $rootScope.erpPath; // Erp Path
  
	var flag = 0;
	$scope.filteredItems;
	
	$scope.barcodePrintData = [];
	
	$scope.CheckBox = "<div data-toggle='tooltip' data-title='Check All' class='checkbox c-checkbox'><label><input type='checkbox' checked='true' /><span class='fa fa-check'></span></label></div>";
	
	$scope.showProduct = function(){
		
		$scope.selectedBoxArray = []; //Selected Checkbox Array Null
		
		if($scope.stateCheck){
			
			flag = 1;
			$scope.getProduct($scope.stateCheck.companyId);
			
			
		}
		else{
			
			toaster.clear();
			toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
		
			//apiCall.getCall(apiPath.getAllProduct).then(function(response){
			productFactory.getProduct().then(function(response){
				
				toaster.clear();
				
				if(apiResponse.noContent == response){
					
					  $scope.completedQueries = [];
					toaster.pop('alert', 'Opps!!', 'No Product Available');
					
				}
				else{
					
					  $scope.completedQueries = response;
						filterDataForTable();
				}
				
				 vm.tableParams.reload();
				  vm.tableParams.page(1);
				
			});
		}
	}
	
	function filterDataForTable(){
		var count = $scope.completedQueries.length;
		while(count--) {
		 	$scope.completedQueries[count].productCategoryName = ""; //initialization of new property 
			$scope.completedQueries[count].productCategoryName = $scope.completedQueries[count].productCategory.productCategoryName;  //set the $scope.completedQueries from nested obj into new property
			$scope.completedQueries[count].productGroupName = ""; //initialization of new property 
			$scope.completedQueries[count].productGroupName = $scope.completedQueries[count].productGroup.productGroupName;  //set the $scope.completedQueries from nested obj into new property
		}
	}

	$scope.init = function (){
			
		vm.states=[];
		apiCall.getCall(apiPath.getAllCompany).then(function(response2){
			
			vm.states = response2;
			//Set default Company
			$scope.stateCheck = apiCall.getDefaultCompanyFilter(response2);
			$scope.getProduct($scope.stateCheck.companyId);
		});
		 
	}
	$scope.init();
	
	$scope.getProduct = function(id){
		
		toaster.clear();
		toaster.pop('wait', 'Please Wait', 'Data Loading....',600000);
			
		//apiCall.getCall(apiPath.getProductByCompany+id+'/branch').then(function(response){
		productFactory.getProductByCompany(id).then(function(response){
			
			toaster.clear();
			
			if(apiResponse.noContent == response){
					
				  $scope.completedQueries = [];
				toaster.pop('alert', 'Opps!!', 'No Product Available');
				
			}
			else{
				//console.log('else');
				  $scope.completedQueries = response;
					filterDataForTable();
			}
			
			if(flag == 0){
					
				//console.log('zero');
				$scope.TableData();
			}
			else{
				//console.log('one');
				 vm.tableParams.reload();
				 vm.tableParams.page(1);
			}
			
			 
		});
	}

	function loadCompanyData(companyId,callback)
	{
		//Get Documents Images
		apiCall.getCall(apiPath.getAllCompany+'/'+companyId).then( function (response) {
			callback(response);
		});
	}

	$scope.enableDisableColor = true;
	$scope.enableDisableSize = true;
	//get setting data
	$scope.getOptionSettingData = function(){
		toaster.clear();
		apiCall.getCall(apiPath.settingOption).then(function(response){
			var responseLength = response.length;
			console.log(response);
			for(var arrayData=0;arrayData<responseLength;arrayData++)
			{
				if(angular.isObject(response) || angular.isArray(response))
				{
					if(response[arrayData].settingType=="product")
					{
						var arrayData1 = response[arrayData];
						$scope.enableDisableColor = arrayData1.productColorStatus=="enable" ? true : false;
						$scope.enableDisableSize = arrayData1.productSizeStatus=="enable" ? true : false;
					}
				}
			}
		});
	}
	$scope.getOptionSettingData();
	
	$scope.editProduct = function(id)
	{
		getSetFactory.set(id);
		$state.go('app.AddInvProduct');
	}
	
	$scope.query = {
			productCategoryName: undefined,
			productGroupName: undefined,
			productName: undefined,
			color: undefined,
			size: undefined
		};
	
	$scope.TableData = function(){
		 
	  vm.tableParams = new ngTableParams({
		  page: 1,            // show first page
		  count: 10,          // count per page
		  filter: $scope.query
		  // sorting: {
			  // productCategoryName: 'asc'     // initial sorting
		  // }
	  }, {
		  //counts: [],
		  total:   $scope.completedQueries.length, // length of data
		  getData: function($defer, params) {
			 
			var orderedData = params.sorting() ?
                    $filter('orderBy')($scope.completedQueries, params.orderBy()) :
                    data;
			orderedData	= $filter('filter')(orderedData, params.filter());
            
			params.total(orderedData.length);
			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(),
					                                     params.page() * params.count()));
														 
			$scope.totalData =   $scope.completedQueries.length;
			$scope.pageNumber = params.page();
            $scope.itemsPerPage = params.count();
            $scope.totalPages = Math.ceil($scope.totalData/params.count());
			
		  }
	  });
	}
	$scope.parentCheckBox;
	$scope.selectedBoxArray = [];
	$scope.barcodeFlag = 0;
	
	$scope.changeBox = function(box,pData){
		
		//console.log(box+'...'+pData);
		if(box == true){
			
			$scope.selectedBoxArray.push(pData);
			
		}
		else{
			
			var index = $scope.selectedBoxArray.indexOf(pData);
			$scope.selectedBoxArray.splice(index,1);
		}
	
		//console.log($scope.selectedBoxArray);
	}
	
	$scope.changeAllBox = function(box){
		
		if(box == false){
			
			var count =   $scope.completedQueries.length;
			$scope.barcodeFlag=0;
			
			for(var sat=0;sat<count;sat++){
				
				var dataSet =   $scope.completedQueries[sat];
				
				dataSet.selected = false;
				
			}
			
			$scope.selectedBoxArray = [];
			
		}
		else{
			
			$scope.barcodeFlag=1;
			
		}
		
	}
	
	$scope.singleBarcodePrint = function(qty,pData){
	
		loadCompanyData(pData.companyId,function(responseCompany)
		{
			//console.log(pData);
		
			//var mywindow = window.open('', 'PRINT', 'height=850,width=850');
			var mywindow = window.open('', 'PRINT', 'height=850,width=850');

			 var is_chrome = Boolean(mywindow.chrome);

	        mywindow.document.write('<html><!--head><title>' + document.title  + '</title>');
			
	        mywindow.document.write("</head--> <style type='text/css' media='print'>@page {size: auto;margin: 0mm;} body {background-color:#FFFFFF;margin: 0px; }</style><body>");
			mywindow.document.write('<!--center> <h1> Barcode of ' +  responseCompany.companyName + ' Company </h1> </center-->');
			mywindow.document.write("<table style='width:100%;margin: 0 auto;'>");
			mywindow.document.write("<tr><td colspan='2' style='text-align:center;'><!--h2>" + pData.productName +' ('+ pData.color +' | '+ pData.size + ") </h2--> </td></tr> 	<tr>");
			
			if(qty%2==0){
					
				var space = "";
			}
			else{
				
				var space = "<td></td>";
			}
				var paddingTop = '10px';
			
			var websiteName = responseCompany.websiteName == null || responseCompany.websiteName == undefined || responseCompany.websiteName == '' ? '' : responseCompany.websiteName;

			for(var n=0;n<qty;n++){
				
				if(n != 0){
					paddingTop = '16px';
				}
				
				// margin-left: 14% (www.swaminarayancycles.com)
				mywindow.document.write("<td style='position:relative;float:left; width: 100%;padding-top:"+paddingTop+";padding-left:35px;display: inline-block;'> ");
				mywindow.document.write("<span style='margin-left:23%;font-size:16px;'>"+websiteName+"</span><br /><embed type='image/svg+xml' src='"+$scope.erpPath+"Storage/Barcode/"+pData.documentName+"' /> <br /> <span style='font-size:14px'>"+pData.productName +" ("+ pData.color +" | "+ pData.size + ")</span><br /><span style='font-size:43px'><b>MRP: "+pData.mrp+"</b></span>");
				
				if(n == qty-1){
					
					
					mywindow.document.write("</td> "+ space );
					
					/** Next Code **/
					
						mywindow.document.write("</tr></table>");
			
						mywindow.document.write('</body></html>');

						//mywindow.document.close(); // necessary for IE >= 10
						
						// mywindow.focus(); // necessary for IE >= 10*/
						// mywindow.print();
						// mywindow.close();
						
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
					
						// pData.selected = false;
						
						// $scope.selectedBoxArray = [];	
						// $scope.barcodeFlag = 0;
						return true;
			
					/** End **/
				}
				else{
					mywindow.document.write("</td>");
				}
				// mywindow.document.write("<div style='position:relative;float:left; width: 50%;'> ");
				// mywindow.document.write($scope.stateCheck.companyName+"<br /><embed type='image/svg+xml' src='"+$scope.erpPath+"Storage/Barcode/"+pData.documentName+"' />");
				// mywindow.document.write("</div>");
			}
		});
	}
	
	$scope.multipleBarcodePrint = function(){
		
		
		// console.log($scope.selectedBoxArray);
		//console.log($scope.filteredItems);
		if($scope.barcodeFlag == 1){
				
				var dataArrayLength = $scope.filteredItems.length;
				
				var companyId = $scope.filteredItems[0].companyId;
				
		}
		else{
			
			var dataArrayLength = $scope.selectedBoxArray.length;
			
			var companyId = $scope.selectedBoxArray[0].companyId;
		}

		loadCompanyData(companyId,function(responseCompany)
		{
			
			var CompanyNamePrint = responseCompany.companyName;
			
			var mywindow = window.open('', 'PRINT', 'height=850,width=850');
		
			 var is_chrome = Boolean(mywindow.chrome);

	        mywindow.document.write('<html><!--head><title>' + document.title  + '</title>');

	        mywindow.document.write("</head--><style type='text/css' media='print'>@page {size: auto;margin: 0mm;} body {background-color:#FFFFFF;margin: 0px; }</style><body>");
			mywindow.document.write('<!--center> <h1> Barcode of ' + CompanyNamePrint  + ' Company </h1> </center-->');
			
			
		
			var paddingTop = '10px';
			
			
			
			for(var dataIndex=0;dataIndex<dataArrayLength;dataIndex++){
				
				if(dataIndex != 0){
					paddingTop = '16px';
				}
				
				mywindow.document.write("<table style='width:100%;margin: 0 auto;'>");
				
				if($scope.barcodeFlag == 1){
					
					var arrayProductData = $scope.filteredItems[dataIndex];
				}
				else{
					var arrayProductData = $scope.selectedBoxArray[dataIndex];
				 }
				
				
				mywindow.document.write("<!--tr><td colspan='2' style='text-align:center;'><h2>" + arrayProductData.productName +' ('+ arrayProductData.color +' | '+ arrayProductData.size + ") </h2> </td></tr--><tr>");
				
				if($scope.barcodePrintData.multiQuantity > 0){
					
					var qtyLength = $scope.barcodePrintData.multiQuantity;
				}
				else{
					var qtyLength = arrayProductData.barcodeQuantity;
				}
				
				if(qtyLength%2==0){
					
					var space = "";
				}
				else{
					
					var space = "<td></td>";
				}
				// margin-left: 14% (www.swaminarayancycles.com)
				var websiteName = responseCompany.websiteName == null || responseCompany.websiteName == undefined || responseCompany.websiteName == '' ? '' : responseCompany.websiteName;

				for(var qtyIndex=0;qtyIndex<qtyLength;qtyIndex++){
					
					mywindow.document.write("<td style='position:relative;float:left; width: 100%;padding-top:"+paddingTop+";padding-left:35px;display: inline-block;'> ");
					mywindow.document.write("<span style='margin-left:23%;font-size:16px;'>"+websiteName+"</span><br /><embed type='image/svg+xml' src='"+$scope.erpPath+"Storage/Barcode/"+arrayProductData.documentName+"' /> <br /> <span style='font-size:14px'>"+arrayProductData.productName +" ("+ arrayProductData.color +" | "+ arrayProductData.size + ")</span><br /><span style='font-size:43px'><b>MRP: "+arrayProductData.mrp+"</b></span>");
					
					
					if(qtyIndex == qtyLength-1){
						
						mywindow.document.write("</td> "+ space );
					}
					else{
						mywindow.document.write("</td>");
					}
				}
				mywindow.document.write("</tr></table>");
				
				if(dataIndex == dataArrayLength-1)
				{
					 mywindow.document.write('</body></html>');

					 // mywindow.document.close(); // necessary for IE >= 10
						
						
						if (is_chrome) {
						   setTimeout(function () { // wait until all resources loaded 
								mywindow.focus(); // necessary for IE >= 10
								mywindow.print();  // change window to mywindow
								mywindow.close();// change window to mywindow
							 }, 5000);
						}
						else {
							mywindow.document.close(); // necessary for IE >= 10
							mywindow.focus(); // necessary for IE >= 10
							mywindow.print();
							mywindow.close();
						}
				
				
						// mywindow.focus(); // necessary for IE >= 10*/
					  // mywindow.print();
					// mywindow.close();

					return true;
				}
			}
		});
		
	}
	
	
	$scope.hideQtyArray = [];
	
	$scope.hideMiltiQuantity = function(qty,pId){
		
		$scope.hideQtyFlag = 0;
		
		if(qty > 0){
			
			// $scope.hideQtyFlag = 1;
			angular.forEach($scope.hideQtyArray, function (value) {
				
				if(value == pId){
					$scope.hideQtyFlag=1;
				}
			});
			
			if($scope.hideQtyFlag==0)
			{
				$scope.hideQtyArray.push(pId);
			}
			
		}
		else{
			
			// $scope.hideQtyFlag = 0;
			var index = $scope.hideQtyArray.indexOf(pId);
			$scope.hideQtyArray.splice(index,1);
		}
		
		//console.log($scope.hideQtyArray);
	}
  
  /** Barcode **/
  
	$scope.barcodePopup = function(size,id,pName,pColor,pSize)
	{
		//alert(id);
		
		//return false;
		toaster.clear();
		if (Modalopened) return;
		
		var modalInstance = $modal.open({
			  templateUrl: 'app/views/PopupModal/Inventory/productBarcodeModal.html',
			  controller: productBarcodeModalCtrl,
			  size: size,
			  resolve:{
				  productId: function(){
					 
					return id;
				  },
				  productName: function(){
					 
					return pName;
				  },
				  productColor: function(){
					 
					return pColor;
				  },
				  productSize: function(){
					 
					return pSize;
				  }
				  
			  }
			});

		   Modalopened = true;
		   
		modalInstance.result.then(function () {
		 
		 console.log('ok');
		  Modalopened = false;
		  
		
		}, function () {
		  console.log('Cancel');	
		   Modalopened = false;
		});
			
			
	}
  
  /** End **/

}
InvBarcodePrintController.$inject = ["$scope","$rootScope","$filter","$state", "ngTableParams","apiCall","apiPath","$location","apiResponse","toaster","getSetFactory","$modal","productFactory"];