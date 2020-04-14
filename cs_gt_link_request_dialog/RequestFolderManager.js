(function(exports) {
	/**
	 * The RequestFolderManager object interfaces with the REST API services
	 * using standard CRUD methodology, and serves as the caching mechanism to
	 * manage and provide access to folder objects.
	 * 
	 * @namespace RequestFolderManager
	 */
	var RequestFolderManager = exports.RequestFolderManager = function RequestFolderManager() {
	};
	
	RequestFolderManager.attachFolderChildrenErrorMappings = {
			"ASSET_NOT_ALLOWED":"ASSET_NOT_ALLOWED",
			"CANT_BE_ROOT":"Can't append root folder to no root folder.",
			"CIRCULAR":"Circular Dependency. This folder is already part of parent hierarchy.",
			"CONTAINER_TYPE_NOT_ALLOWED":"Can't attach a folder to folder",
			"EXISTING_CHILD":"Asset has been already attached to a folder",
			"INACTIVE":"Asset is not active",
			"NO_EDIT_PARENTS":"NO_EDIT_PARENTS",
			"SINGLE_PARENT":"SINGLE_PARENT",
			"USER_GROUP_CANNOT_CREATE_CONTAINER":"No Permissions to create folder.",
			"NOT_EXIST":"Asset doesn't exist."
	}

	RequestFolderManager.recentlyCreatedARFolder = undefined

	RequestFolderManager.getRecentAssetRequest = function() {
		return RequestFolderManager.recentlyCreatedARFolder;
	}

	RequestFolderManager.setRecentAssetRequest = function(recentAR) {
		RequestFolderManager.recentlyCreatedARFolder = recentAR;
	}

	RequestFolderManager.getFolderIdByName = function(folderName,
			selectionContext, element, callbackSuccess, callbackError) {
		console.log("getFolderIdByName " + folderName)
		var search_condition = {
			"search_condition_list" : {
				"search_condition" : [ {
					"type" : "com.artesia.search.SearchScalarCondition",
					"metadata_field_id" : "GTRUST.FIELD.REQUEST ID",
					"relational_operator_id" : "ARTESIA.OPERATOR.NUMBER.IS",
					"relational_operator_name" : "is",
					"value" : folderName
				} ]
			}
		};
		var params = [
				"load_type=system",
				"level_of_detail=slim",
				"folder_filter=2fb0078a9f514c08ce9c60afba3d95aa5416edc5",
				"return_type=ids",
				"search_condition_list="
						+ encodeURIComponent(JSON.stringify(search_condition)
								.replace(/(\r\n|\n|\r)/gm, "")) ];
		var serviceUrl = otui.service + "/search/text" + "?" + params.join("&");
		otui.post(serviceUrl, undefined, otui.contentTypes.formData, function(
				data, status, success) {
			if (success) {
				var hitCount = data.search_result_resource.search_result.hit_count;
				if (hitCount == 0) {
					callbackError('Asset Request Folder ' + folderName
							+ ' was not found.');
				} else if (hitCount == 1) {
					assetRequest = {
							'asset_id' : data.search_result_resource.search_result.asset_id_list[0],
							'name' : folderName
						}
					callbackSuccess(assetRequest,selectionContext, element)
				} else {
					callbackError('Asset Request Folder ' + folderName
							+ ' has ambigious results.')
				}
			} else {
				if (status == 500)
					callbackError(data.exception_body.message)
				else {
					callbackError("Didn't link folder " + folderName
							+ " because error has occurred.")
				}
			}
		});
	}

	RequestFolderManager.linkAssetsToFolder = function(assetRequest,
			selectionContext, element, callbackSuccess, callbackError) {
		otui.services.folderChildren
				.update(
						{
							'nodeID' : assetRequest.asset_id,
							'action' : 'add',
							'selectionContext' : selectionContext
						},
						function(data, success) {
							if (success) {
								operationResult = data.folder_operation_resource.folder_operation_result
								if (operationResult.valid_children.length == 0) {
									reason = "";
									operationResult.failed_children
											.forEach(function(asset) {
												reason = RequestFolderManager.attachFolderChildrenErrorMappings[asset.reasons[0]]
												if (reason != undefined ) {
													message = reason + " " + assetRequest.name
															+ '.'
												}else{
													message = "Couldn't attach assets to folder"
												}
											})
									callbackError(message)
								} else if (operationResult.valid_children.length > 0
										&& operationResult.failed_children.length > 0) {
									RequestFolderManager
											.setRecentAssetRequest(assetRequest);
									callbackError("Some assets couldn't be attached to asset request folder "
											+ assetRequest.name + '.')
								} else {
									RequestFolderManager
											.setRecentAssetRequest(assetRequest);
									callbackSuccess('Assets have been successfully added to asset request folder '
											+ assetRequest.name + '.', element)
								}
							}
						});
	}
})(window);