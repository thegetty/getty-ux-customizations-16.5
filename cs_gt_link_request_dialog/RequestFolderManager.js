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