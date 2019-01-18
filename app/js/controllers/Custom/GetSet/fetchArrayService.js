App.service('fetchArrayService',[function() {
	 'use strict';
	 
	function getfilteredArray(arrayData,id,firstParam,secondParam = null){
		var StateArray = [];
		var productIndex = arrayData ? arrayData.length : 0;
		while(productIndex--){
			var singleProductData = arrayData[productIndex];
			var compareId = secondParam !== null ? singleProductData[firstParam][secondParam] : singleProductData[firstParam];
			if(compareId == id) StateArray.push(singleProductData);
		}
		return StateArray;
	}
	
	function getfilteredSingleObject(arrayData,id,firstParam,secondParam = null){
		var productIndex = arrayData ? arrayData.length : 0;
		while(productIndex--){
			var singleProductData = arrayData[productIndex];
			var compareId = secondParam !== null ? singleProductData[firstParam][secondParam] : singleProductData[firstParam];
			if(compareId == id){
				return arrayData[productIndex];
			}
		}
	}
	
	function setUpdatedObject(arrayData,data,id,firstParam){
		var productIndex = arrayData ? arrayData.length : 0;
		while(productIndex--){
			var singleProductData = arrayData[productIndex];
			if(singleProductData[firstParam] == id){
				arrayData[productIndex] = data;
				break;
			}
		}
	}
	
	function setNewObject(arrayData,vdata,matchParam,newParam) {	
		var firstMatchParam;
		var secondMatchParam;
		if (angular.isArray(matchParam)) {
			firstMatchParam = matchParam[0];
			secondMatchParam = matchParam[1];
		} else {
			firstMatchParam = matchParam;
			secondMatchParam = matchParam;
		}

		var productIndex = arrayData ? arrayData.length : 0;
		while(productIndex--){
			var singleProductData = arrayData[productIndex];
			var findObject = vdata.find(i2 => singleProductData[firstMatchParam] === i2[secondMatchParam]) || {};
			singleProductData[newParam] = findObject;
		}

		// let filterData = arrayData.reduce((a,b) => {
		// 	// item[newParam] = {};
		//   let item2 = vdata.find(i2 => i2[matchParam] === b[matchParam]) || {};
		//   // let item3 = item[newParam];
		//    b[newParam] = item2;
		//   return;
		// },[]);

		return arrayData;

	}

	//get Index Data
	function myIndexOfObject(a,b,f,c,d,e){
		var countl = a ? a.length : 0;
	 for(c=countl,d=c*1;c--;){
	  if(a[c][f]==b)return a[c];
	  if(a[e=d-1-c][f]==b)return a[e];
	 }
	 return -1
	}

	//get Index
	function myIndexOf(a,b,f,c,d,e){
		var countl = a ? a.length : 0;
	 for(c=countl,d=c*1;c--;){
	  if(a[c][f]==b)return a;
	  if(a[e=d-1-c][f]==b)return a;
	 }
	 return -1
	}

	return {
		getfilteredArray: getfilteredArray,
		getfilteredSingleObject: getfilteredSingleObject,
		setUpdatedObject: setUpdatedObject,
		setNewObject: setNewObject,
		myIndexOfObject:myIndexOfObject,
		myIndexOf:myIndexOf
	}

}]);