// Now do refactoring add ajax logic to some folder manager.
(function(exports) {
	exports.LinkToRequestFolderView = otui
			.define(
					"LinkToRequestFolderView",
					function() {
						var view;
						// Properties for the business card.
						this.properties = {
							'name' : 'linkrequestfolderview', // Name is
							'title' : otui.tr("Add to Asset Request"),
							'assetId' : undefined
						};
						// Function called to create the content for this view.
						// Note
						// that initContent functions must always have a name.
						this._initContent = function initLinkToRequestFolder(
								self, placeContent) {
							placeContent(this.getTemplate("content"));
							var term = window.recent_asset_request_name;
							var folderId = window.recent_asset_request_asset_id
							canLink = (typeof term !== "undefined" && term !== "" && typeof folderId !== "undefined"
									&& folderId !== "")
							if (canLink) {
								$("#assetRequestFolderIB").val(term);
							}
							$("#gt-linkrequestfolder-linkButton").attr('disabled', !canLink);
						};
						this
								.bind(
										"setup",
										function() {
											var self = this;
											$("#assetRequestFolderIB").change(function(event){
												resource = event.currentTarget
												var currentTerm = $(resource).val();
												console.log("change " + currentTerm)
												if (currentTerm !=window.recent_asset_request_name)
													RequestFolderManager.getFolderIdByName(currentTerm, handleSearchResultResourceResponse)	
											})
											$("#assetRequestFolderIB").on("mouseout", function(event){
												resource = event.currentTarget
												var currentTerm = $(resource).val();
												console.log("blur " + currentTerm)
												if (currentTerm !=window.recent_asset_request_name)
													RequestFolderManager.getFolderIdByName(currentTerm, handleSearchResultResourceResponse)	
											})
											$(
													"#gt-linkrequestfolder-cancelButton")
													.click(
															function(event) {
																otui.DialogUtils
																		.cancelDialog(this);
															});

											$(
													"#gt-linkrequestfolder-linkButton")
													.click(
															function(event) {
																var folderId = window.recent_asset_request_asset_id
																if (folderId === "") {
																	otui.NotificationManager
																			.showNotification({
																				'message' : 'Please give name for asset request folder',
																				'status' : 'warning'
																			});
																} else {
																	console
																			.log(self.properties.assetId);
																	RequestFolderManager
																			.linkAssetsToFolder(
																					folderId,
																					self.properties.assetId);

																}
																otui.DialogUtils
																		.cancelDialog(event.target);
															});
										});
					});

	
	function handleSearchResultResourceResponse(data, status, success, folderName){
		if(!success){
			console.log(status)
		}
		var hitCount = data.search_result_resource.search_result.hit_count;
		if (hitCount == 0) {
			window.recent_asset_request_asset_id=undefined
			window.recent_asset_request_name=folderName
			$("#gt-linkrequestfolder-linkButton").attr('disabled', true);
			otui.NotificationManager.showNotification({
				'message' : 'Asset Request Folder '
				+ folderName
				+ ' was not found',
				'status' : 'warning'
			});
			} else if (hitCount == 1) {
				window.recent_asset_request_asset_id=data.search_result_resource.search_result.asset_id_list[0]
				window.recent_asset_request_name=folderName
				$("#gt-linkrequestfolder-linkButton").attr('disabled', false);
			} else {
				window.recent_asset_request_asset_id=undefined
				window.recent_asset_request_name=folderName
				$("#gt-linkrequestfolder-linkButton").attr('disabled', true);
				otui.NotificationManager.showNotification({
					'message' : 'Asset Request Folder '
						+ folderName
						+ ' has ambigious results',
					'status' : 'warning'
				});
			}
	}

	function linkToRequestFolder(event, resource) {
		event.stopPropagation();
		var selectionContext = null;
		if (resource) {
			selectionContext = SelectionManager.getSelectionContext(view,
					resource);
		} else {
			selectionContext = SelectionManager.getSelectionContext(view,
					SelectionManager.singleAssetSelection);
		}
		try {
			var isSelected = selectionContext.selection_context_param.selection_context.asset_ids.length > 0
			if (isSelected) {
				LinkToRequestFolderView.asDialog({
					"assetId" : selectionContext
				});
			} else {
				otui.NotificationManager.showNotification({
					'message' : 'No assets have been selected',
					'status' : 'error'
				});
			}
		} catch (error) {
			otui.NotificationManager.showNotification({
				'message' : 'No assets have been selected',
				'status' : 'error'
			});
		}
	}

	function setupLinkToRequestFolder(event, resource, parent) {
		view = otui.Views.containing(parent);
		var hasPermission = otui.UserFETManager
				.isTokenAvailable("CUSTOM.ASSET_REQUEST.CREATE");
		return hasPermission;
	}

	otui.ready(function() {
		console.log("otui link to request folder view")
		// Create definition of the menu entry.
		var entry = {
			'name' : 'linkToRequestFolder',
			'text' : 'Add to Asset Request',
			'img' : 'style/img/add_to_folder16_sprite.png',
			'setup' : setupLinkToRequestFolder,
			'select' : linkToRequestFolder
		};
		// Then add it to all the locations available.
		otui.GalleryViewActions.register(entry);
		otui.GalleryAssetActions.register(entry);
	});

})(window)