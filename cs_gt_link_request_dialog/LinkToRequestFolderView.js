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
																	handleEvent(
																			self,
																			this);
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
													.click(
															function(event) {
																handleEvent(
																		self,
																		this);
															});
										});
					});

	function handleEvent(view, element) {
		var folderName = $("#assetRequestFolderIB").val();
		if (folderName == "" || folderName == undefined) {
			showErrorNotification('Please give name for asset request folder');
		} else {
			view.properties.assetRequestName = folderName;
			recentAR = RequestFolderManager.getRecentAssetRequest()
			if (recentAR != undefined
					&& recentAR.name == view.properties.assetRequestName
					&& recentAR.asset_id != undefined) {
				RequestFolderManager.linkAssetsToFolder(recentAR,
						view.properties.selectionContext, element,
						handleLinkResultResponse, showErrorNotification);
			} else {
				RequestFolderManager.getFolderIdByName(folderName,
						view.properties.selectionContext, element,
						handleSearchResultResourceResponse, showErrorNotification)
			}
		}
	}

	function handleSearchResultResourceResponse(assetRequest, selectionContext, element) {
		RequestFolderManager.linkAssetsToFolder(assetRequest,
					selectionContext, element, handleLinkResultResponse, showErrorNotification);
	}

	function handleLinkResultResponse(message, element) {
		otui.DialogUtils.cancelDialog(element);
		otui.NotificationManager.showNotification({
			'message' : message,
			'status' : "information"
		});
	}

	function showErrorNotification(message) {
		$("#gt-linkrequestfolder-linkButton").attr('disabled', true);
		otui.NotificationManager.showNotification({
			'message' : message,
			'status' : "error"
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
				showErrorNotification('No assets have been selected')
			}
		} catch (error) {
			showErrorNotification('No assets have been selected')
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