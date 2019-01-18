
/**=========================================================
 * Module: StaffCtrl.js
 * Controller for ngTables
 =========================================================*/

App.controller('InvCategoryController', InvCategoryController);

function InvCategoryController($scope,$filter,$timeout,$templateCache,apiCall,apiPath,$interval,$anchorScroll,apiResponse,toaster,validationMessage,$modal) {
	
  'use strict';
  var vm = this;
	
	$scope.invCategoryData = [];
	var formdata = new FormData();
	$scope.invCategoryID = [];
	var Modalopened = false;
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	
	/* VALIDATION END */
	
	var tree;
	//var myTreeData;

	//Get Category Data
	var rawTreeData=[{"productCategoryName":"","productCategoryId":"","productCategoryDescription":"","isDisplay":"","createdAt":"","updatedAt":"","productParentCategoryId":""}];
	

        var myTreeData = getTree(rawTreeData, 'productCategoryId', 'productParentCategoryId');
		$scope.tree_data = myTreeData;
        $scope.my_tree = tree = {};

        $scope.expanding_property = {
            field: "productCategoryName",
            displayName: "Brand Name",
            sortable: true,
            filterable: true,
            cellTemplate: "<i>{{row.branch[expandingProperty.field]}}</i>"
        };
		
        $scope.col_defs = [
            {
                field: "productCategoryDescription",
				displayName: "Description"
            },
			{
			field: "productCategoryId",
			displayName: "Action",
			cellTemplate: "<i  ng-click=\"cellTemplateScope.editCat(row.branch[col.field])\" class=\"fa fa-edit myCursorPointer\" style=\"font-size:17px;color:#10709f\"></i>&nbsp; &nbsp;<i  ng-click=\"cellTemplateScope.deleteCat(\'sm\',row.branch[col.field])\" class=\"fa fa-times-circle myCursorPointer\" style=\"font-size:17px;color:red\"></i>",
			cellTemplateScope: {
				deleteCat: function(size,data) {         // this works too: $scope.someMethod;
					//console.log(data);
					toaster.clear();
				if (Modalopened) return;
				
			var modalInstance = $modal.open({
				  templateUrl: 'app/views/PopupModal/Delete/deleteDataModal.html',
				  controller: deleteDataModalController,
				  size: size
				});

			    Modalopened = true;
				
				modalInstance.result.then(function () {
				 
				 //console.log('ok');
				 toaster.clear();
				toaster.pop('wait', 'Please Wait', 'Data Deleting....',60000);
				// return false;
				 /**Delete Code **/
					apiCall.deleteCall(apiPath.getAllCategory+'/'+data).then(function(response){
						
						//console.log(response);
						toaster.clear();
						if(apiResponse.ok == response){
							
							toaster.pop('success', 'Title', 'Delete SuccessFully');
							// vm.categoryDrop = [];
							// apiCall.getCall(apiPath.getAllCategory).then(function(response){
							
								// vm.categoryDrop = response;
								// var myTreeData2 = getTree(response, 'productCategoryId', 'productParentCategoryId');
								// $scope.tree_data = myTreeData2;
							
							// });
							$scope.init();
							
						}
						else{
				
							toaster.pop('warning', 'Opps!!', response);
						}
			
					});
				 /** End **/
					 Modalopened = false;
					 
				}, function () {
				  console.log('Cancel');	
					 Modalopened = false;
				});
		
					
				},
				editCat: function(data){
					
					toaster.clear();
					toaster.pop('wait', 'Please Wait', 'Data Fetching....',60000);
					
					$scope.invCategoryID.id = data;
					apiCall.getCall(apiPath.getAllCategory+'/'+data).then(function(response){
						
						toaster.clear();
						
						$scope.invCategoryData.categoryName = response.productCategoryName;
						$scope.invCategoryData.categoryDesc = response.productCategoryDescription;
						//console.log(response);
						if(response.productParentCategoryId==''){
							//console.log('yes');
						}
						else{
							
							apiCall.getCall(apiPath.getAllCategory+'/'+response.productParentCategoryId).then(function(response){
								$scope.invCategoryData.categoryDropDown = response;
							});
						}
					});
					
					$anchorScroll();
				}
			}
			}
        ];
		
        $scope.my_tree_handler = function (branch) {
            //console.log('you clicked on', branch);
        }
		$scope.deleteData = function(){
			alert('Delete');
			//console.log('Here',branch);
		}
		
		$scope.init = function(){
			vm.categoryDrop = [];
			apiCall.getCall(apiPath.getAllCategory).then(function(response){
				if(angular.isArray(response)){
					vm.categoryDrop = response;
				}
				var myTreeData2 = getTree(response, 'productCategoryId', 'productParentCategoryId');
				$scope.tree_data = myTreeData2;
				toaster.clear();
			});
		
		}
		
		$scope.init();
		
     $scope.addUpCategory = function(){
		 
		 
		if($scope.invCategoryData.categoryDropDown)
		{
			formdata.append('productCategoryName',$scope.invCategoryData.categoryName);
			
			if($scope.invCategoryData.categoryDesc){
				formdata.append('productCategoryDescription',$scope.invCategoryData.categoryDesc);
			}
			
			formdata.append('productParentCategoryId',$scope.invCategoryData.categoryDropDown.productCategoryId);
			formdata.append('isDisplay','yes');
			
		}
		else{
			
			formdata.append('productCategoryName',$scope.invCategoryData.categoryName);
			
			if($scope.invCategoryData.categoryDesc){
				formdata.append('productCategoryDescription',$scope.invCategoryData.categoryDesc);
			}
			
			formdata.append('productParentCategoryId','');
			formdata.append('isDisplay','yes');
		}
		
		if($scope.invCategoryID.id){
			
			var categoryPath = apiPath.getAllCategory+'/'+$scope.invCategoryID.id;
			var updateToaster = "Update";
			$scope.invCategoryID = [];
		}
		else{
			var categoryPath = apiPath.getAllCategory;
			var updateToaster = "Insert";
		}
		
		apiCall.postCall(categoryPath,formdata).then(function(response){
			
			
			formdata.delete('productCategoryName');
			formdata.delete('productCategoryDescription');
			formdata.delete('productParentCategoryId');
			formdata.delete('isDisplay');
			
			if(apiResponse.ok == response){
				
				toaster.pop('success', 'Title', updateToaster+' SuccessFully');
				
				$scope.invCategoryData = [];
				// apiCall.getCall(apiPath.getAllCategory).then(function(response){
				
					// vm.categoryDrop = response;
					// var myTreeData2 = getTree(response, 'productCategoryId', 'productParentCategoryId');
					// $scope.tree_data = myTreeData2;
				
				// });
				$scope.init();
			}
			else{
				
				toaster.pop('warning', 'Opps!!', response);
			}
			
		});
		
	 }
 
	$scope.cancel = function(){
		
		$scope.invCategoryData = [];
		
		// apiCall.getCall(apiPath.getAllCategory).then(function(response){
				
			// vm.categoryDrop = response;
			// var myTreeData2 = getTree(response, 'productCategoryId', 'productParentCategoryId');
			// $scope.tree_data = myTreeData2;
		
		// });
		$scope.init();
		
		var formdata = new FormData();
	}
 

  // SORTING
  // ----------------------------------- 
$scope.branchF = [
      {pop: "Branch1" },
      {pop: "Branch2" }
  ];
  
  
	$scope.openCategoryBatchModal = function(){
		
		if (Modalopened) return;
		
		var modalInstance = $modal.open({
			
			templateUrl: 'app/views/PopupModal/Inventory/InventoryBatchModal.html',
			controller: 'InventoryBatchModalController as vm',
			size: 'lg',
			resolve:{
				inventoryType: function(){
					
					return "Brand";
				}
			}
		});
		
		Modalopened = true;
		
		modalInstance.result.then(function (data) {
		 
		  console.log('Ok');	
		  $scope.init();
		   Modalopened = false;
		   
		
		}, function (data) {
		  console.log('Cancel');	
		   Modalopened = false;

		});
	}
  

        function getTree(data, primaryIdName, parentIdName) {
            if (!data || data.length == 0 || !primaryIdName || !parentIdName)
                return [];

            var tree = [],
                rootIds = [],
                item = data[0],
                primaryKey = item[primaryIdName],
                treeObjs = {},
                parentId,
                parent,
                len = data.length,
                i = 0;

            while (i < len) {
                item = data[i++];
                primaryKey = item[primaryIdName];
                treeObjs[primaryKey] = item;
                parentId = item[parentIdName];

                if (parentId) {
                    parent = treeObjs[parentId];

                    if (parent.children) {
                        parent.children.push(item);
                    } else {
                        parent.children = [item];
                    }
                } else {
                    rootIds.push(primaryKey);
                }
            }

            for (var i = 0; i < rootIds.length; i++) {
                tree.push(treeObjs[rootIds[i]]);
            }
            ;

            return tree;
        }
  

}
InvCategoryController.$inject = ["$scope", "$filter","$timeout","$templateCache","apiCall","apiPath","$interval","$anchorScroll","apiResponse","toaster","validationMessage","$modal"];