
/**=========================================================
 * Module: SettingClientProfessionController.js
 * Controller for input components
 =========================================================*/

App.controller('SettingClientProfessionController', SettingClientProfessionController);

function SettingClientProfessionController($rootScope,$scope,$filter,apiCall,apiPath,toaster,apiResponse,validationMessage,$modal,$anchorScroll,clientFactory) {
  'use strict';
 var vm = this;
 //var data = [{'professionName': 'Doctor'},{'professionName': 'Engineer'}];
 $scope.clientProfessionForm = [];
 
 var Modalopened = false;
 
  var formdata = new FormData();
  
 //var JobcardGetApiPath = apiPath.getJobcardNumber;
 
	
	/* VALIDATION */
	
	$scope.errorMessage = validationMessage; //Error Messages In Constant
	//$scope.validationPattern = validationPattern; //pattern
	
	/* VALIDATION END */
	
	
	//$scope.TableData = function(){
		
	/* Tree */
	
		
	var tree;
	//var myTreeData;
	
	//Get Category Data
	var rawTreeData=[{"professionName":"","professionId":"","description":"","createdAt":"","updatedAt":"","professionParentId":""}];
	
        var myTreeData = getTree(rawTreeData, 'professionId', 'professionParentId');
		$scope.tree_data = myTreeData;
        $scope.my_tree = tree = {};

        $scope.expanding_property = {
            field: "professionName",
            displayName: "Profession Name",
            sortable: true,
            filterable: true,
            cellTemplate: "<i>{{row.branch[expandingProperty.field]}}</i>"
        };
		
        $scope.col_defs = [
            {
                field: "description",
				displayName: "Description"
            },
			{
			field: "professionId",
			displayName: "Action",
			cellTemplate: "<i ng-click=\"cellTemplateScope.editCat(row.branch[col.field])\" class=\"fa fa-edit myCursorPointer\" style=\"font-size:17px;color:#10709f\"></i>&nbsp; &nbsp;<i ng-click=\"cellTemplateScope.deleteCat(\'sm\',row.branch[col.field])\" class=\"fa fa-times-circle myCursorPointer\" style=\"font-size:17px;color:red\"></i>",
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
					clientFactory.deleteSingleProfession(data).then(function(response){
						
						//console.log(response);
						toaster.clear();
						if(apiResponse.ok == response){
							
							toaster.pop('success', 'Delete', 'Delete SuccessFully');
							// vm.categoryDrop = [];
							// apiCall.getCall(apiPath.clientProfession).then(function(response){
							
								// vm.categoryDrop = response;
								// var myTreeData2 = getTree(response, 'professionId', 'professionParentId');
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
					
					$scope.clientProfessionForm.id = data;
					clientFactory.getSingleProfession(data).then(function(response){
						
						toaster.clear();
						$scope.clientProfessionForm.professionName = response.professionName;
						
						//console.log(response);
						if(response.professionParentId==''){
							//console.log('yes');
						}
						else{
							
							clientFactory.getSingleProfession(response.professionParentId).then(function(response){
								$scope.clientProfessionForm.professionDropDown = response;
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
		
		$scope.init = function(){
			
			vm.professionDrop = [];
			clientFactory.getProfession().then(function(response){
				
				if(angular.isArray(response)){
					var allProfession = angular.copy(response);
					vm.professionDrop = allProfession;
					var myTreeData2 = getTree(allProfession, 'professionId', 'professionParentId');
					$scope.tree_data = myTreeData2;
				}
				toaster.clear();
			});
		
		}
		$scope.init();
	/* End Tree */
 	
	//}
	  
	//Set Changed Data in FormData
	$scope.changeProfessionData = function(key,value){
		
		if(formdata.has(key))
		{
			formdata.delete(key);
		}
		formdata.append(key,value);
	}
	
  //Insert Client Profession
  $scope.insertProfessionData = function()
  {
	var profId = null;
	
	if($scope.clientProfessionForm.id){
		profId = $scope.clientProfessionForm.id;
	}
	
	clientFactory.insertAndUpdateProfession(formdata,profId).then(function(response5){
		//console.log(response5);
		if(apiResponse.ok == response5){
			
			if($scope.clientProfessionForm.id){
				toaster.pop('success', 'Updated', 'Profession Updated Successfully');
				clientFactory.setGetUpdatedProfession(profId).then(function(response){
					$scope.init();
				});
			}
			else{
				toaster.pop('success', 'Inserted', 'Profession Inserted Successfully');
				$scope.init();
			}
			$scope.clientProfessionForm = [];
			formdata = undefined;
			formdata = new FormData();
			
		}
		else{
			toaster.pop('warning', 'Opps!!', response5);
		}
	});
  }
  
	$scope.cancel = function(){
		
		$scope.clientProfessionForm = [];
		var formdata = FormData();
		formdata.delete('professionParentId');
		formdata.delete('professionName');
		
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
SettingClientProfessionController.$inject = ["$rootScope","$scope","$filter","apiCall","apiPath","toaster","apiResponse","validationMessage","$modal","$anchorScroll","clientFactory"];