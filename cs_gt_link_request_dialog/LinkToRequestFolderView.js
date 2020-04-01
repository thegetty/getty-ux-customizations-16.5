// Now do refactoring add ajax logic to some folder manager.
(function(exports) {
	exports.LinkToRequestFolderView = otui
			.define(
					"LinkToRequestFolderView",
					function() {
						var view;
						this.properties = {
							'name' : 'linkrequestfolderview', // Name is
							'title' : otui.tr("Add to Asset Request"),
							'selectionContext' : undefined
						};
						// Function called to create the content for this view.
						// Note
						// that initContent functions must always have a name.
						this._initContent = function initLinkToRequestFolder(
								self, placeContent) {
							placeContent(this.getTemplate("content"));
							$("#gt-linkrequestfolder-linkButton").attr(
									'disabled', true);
							if (self.properties.recentAR) {
								self.properties.assetRequestName = self.properties.recentAR.name
								$("#assetRequestFolderIB").val(
										self.properties.assetRequestName);
								$("#gt-linkrequestfolder-linkButton").attr(
										'disabled', false);
							}
						};
						this
								.bind(
										"setup",
										function() {
											var self = this;
											$("#assetRequestFolderIB")
													.on(
															"keypress",
															function(event) {
																event
																		.stopPropagation();
																var keycode = (event.keyCode ? event.keyCode
																		: event.which);
																// ENTER key
																if (keycode == '13') {
																	handleEvent(self);
																}
															});
											$(".gt-linkdialog-body")
													.on(
															"mouseover mousemove",
															function(event) {
																var folderName = $(
																		"#assetRequestFolderIB")
																		.val();
																var isEmpty = (folderName == "" || folderName == undefined)
																$(
																		"#gt-linkrequestfolder-linkButton")
																		.attr(
																				'disabled',
																				isEmpty);
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
													.click(function(event) {
														handleEvent(self);
													});
										});
					});

	function handleEvent(view) {
		var folderName = $("#assetRequestFolderIB").val();
		if (folderName == "" || folderName == undefined) {
			$("#gt-linkrequestfolder-linkButton").attr('disabled', true);
			otui.NotificationManager.showNotification({
				'message' : 'Please give name for asset request folder',
				'status' : 'error'
			});
		} else {
			view.properties.assetRequestName = folderName;
			recentAR = RequestFolderManager.getRecentAssetRequest()
			if (recentAR != undefined
					&& recentAR.name == view.properties.assetRequestName
					&& recentAR.asset_id != undefined) {
				RequestFolderManager.linkAssetsToFolder(recentAR,
						view.properties.selectionContext,
						handleLinkResultResponse);
			} else {
				RequestFolderManager.getFolderIdByName(folderName,
						view.properties.selectionContext,
						handleSearchResultResourceResponse)
			}
		}
	}

	function handleSearchResultResourceResponse(data, status, success,
			folderName, selectionContext) {
		if (success) {
			var hitCount = data.search_result_resource.search_result.hit_count;
			if (hitCount == 0) {
				showErrorNotification('Asset Request Folder ' + folderName
						+ ' was not found', folderName);
			} else if (hitCount == 1) {
				assetRequest = {
					'asset_id' : data.search_result_resource.search_result.asset_id_list[0],
					'name' : folderName
				}
				RequestFolderManager.linkAssetsToFolder(assetRequest,
						selectionContext, handleLinkResultResponse);
			} else {
				showErrorNotification('Asset Request Folder ' + folderName
						+ ' has ambigious results', folderName)
			}
		} else {
			if (status == 500)
				showErrorNotification(data.exception_body.message, folderName)
			else {
				showErrorNotification("Didn't link folder " + folderName
						+ " because error has occurred.")
			}
		}
	}

	function handleLinkResultResponse(message, status, assetRequest) {
			otui.NotificationManager
					.showNotification({
						'message' : message,
						'status' : status
					});
	}

	function showErrorNotification(message, folderName) {
		RequestFolderManager.setRecentAssetRequest = {
			'name' : folderName,
			'asset_id' : undefined
		};
		$("#gt-linkrequestfolder-linkButton").attr('disabled', true);
		otui.NotificationManager.showNotification({
			'message' : message,
			'status' : 'error'
		});
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
			var assetRequest = RequestFolderManager.getRecentAssetRequest()
			if (isSelected) {
				LinkToRequestFolderView.asDialog({
					"selectionContext" : selectionContext,
					"recentAR" : assetRequest
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