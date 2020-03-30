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

	RequestFolderManager.getFolderIdByName = function(requestId, callback) {
		console.log("getFolderIdByName " + requestId)
		var search_condition = {
			"search_condition_list" : {
				"search_condition" : [ {
					"type" : "com.artesia.search.SearchScalarCondition",
					"metadata_field_id" : "GTRUST.FIELD.REQUEST ID",
					"relational_operator_id" : "ARTESIA.OPERATOR.NUMBER.IS",
					"relational_operator_name" : "is",
					"value" : requestId
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
		console.log(serviceUrl)
		otui.post(serviceUrl, undefined, otui.contentTypes.formData, function(data, status, success){
			callback(data, status, success, requestId)
		});
	}

	RequestFolderManager.linkAssetsToFolder = function(folderId,
			selectionContext) {
		otui.services.folderChildren
				.update(
						{
							'nodeID' : folderId,
							'action' : 'add',
							'selectionContext' : selectionContext
						},
						function(folderResponse, success) {
							if (success === true) {
								otui.NotificationManager
										.showNotification({
											'message' : 'Assets have been successfully added to asset request folder.',
											'status' : 'information'
										});
							} else {
								otui.NotificationManager
										.showNotification({
											'message' : "Assets couldn't be added to asset request folder",
											'status' : 'error'
										});
							}
						});
	}
})(window);