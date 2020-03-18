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
							console.log("term " + term)
							var folderId = window.recent_asset_request_asset_id
							console.log("folderId " + folderId)
							canLink = (typeof term !== "undefined" && term !== "" && typeof folderId !== "undefined"
									&& folderId !== "")
							console.log("canLink " + canLink)
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
																// Need to have
																// selection
																// capability,
																// in case, user
																// decides to
																// change folder
																// name,
																// so we link to
																// correct
																// folder id
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