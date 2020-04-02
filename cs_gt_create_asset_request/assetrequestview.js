(function(exports) {
	exports.AssetRequestConstants = {
		ASSET_REQUEST_FOLDER_ID : "2fb0078a9f514c08ce9c60afba3d95aa5416edc5",
		ASSET_REQUEST_TYPE_ID : "GTRUST.FOLDER.ASSET REQUEST",
		ASSET_REQUEST_ENDPOINT : "/otmmapi/requestid",
		ASSET_REQUEST_CREATE_FET : "CUSTOM.ASSET_REQUEST.CREATE"
	};

	exports.AssetRequestView = otui
			.augment(
					"NewFolderView",
					function() {

						function _initContent(self, callback) {
							var template = self.getTemplate("content");
							var content = $(otui.fragmentContent(template));
							var parentView = this
									.internalProperty("parentView");

							// //
							var folderAssetId = parentView.properties.newFolderBreadcrumb.ids[parentView.properties.newFolderBreadcrumb.ids.length - 1];
							var clickSourceMenu = false;
							if (folderAssetId == null
									|| folderAssetId == undefined) {
								folderAssetId = AssetRequestConstants.ASSET_REQUEST_FOLDER_ID;
								clickSourceMenu = true;

								// store request id to folder name // doing this
								// early to avoid late loading at ui
								var newFolderNameTextBox = content
										.find('#ot-newfolder-name')[0];
								var serviceUrl = AssetRequestConstants.ASSET_REQUEST_ENDPOINT;

								otui
										.get(
												serviceUrl,
												undefined,
												otui.contentTypes.json,
												function(response) {
													newFolderNameTextBox
															.setAttribute(
																	'readonly',
																	true);
													newFolderNameTextBox.value = response;
												});
							}
							// ///

							FolderManager
									.getFolderData(
											folderAssetId,
											function(data) {

												var folderTypes = FolderTypesManager
														.getFolderTypes();

												var options = content
														.find('#newFolderTypes')[0];
												if (options) {
													otui.empty(options);

													folderTypes.sort(function(
															a, b) {
														if (a.name < b.name)
															return -1;
														if (a.name > b.name)
															return 1;

														return 0;
													});

													var showPreview = true;

													var allowed, isActive;
													var containerTypeID;
													var isRootFolder = FolderManager
															.isPublicFolders(data.asset_id)
															|| FolderManager
																	.isMyFolders(data.asset_id);

													for ( var index in folderTypes) {

														// //
														if (clickSourceMenu
																&& folderTypes[index].id != AssetRequestConstants.ASSET_REQUEST_TYPE_ID)
															continue;
														// ///

														allowed = false;
														isActive = !folderTypes[index].inactive;
														if (isActive) {
															allowed = isRootFolder ? true
																	: allowed;
															containerTypeID = data.container_type_id;
															if (containerTypeID) {
																if (folderTypes[containerTypeID]) {
																	allowed = folderTypes[containerTypeID].child_types.length ? false
																			: (isRootFolder ? folderTypes[index].root
																					: true);

																	for (var i = 0; i < folderTypes[containerTypeID].child_types.length; i++) {
																		if (folderTypes[containerTypeID].child_types[i] == index) {
																			allowed = true;
																			break;
																		}
																	}
																} else {
																	allowed = isRootFolder ? folderTypes[index].root
																			: true;
																}
															}
														}

														if (allowed) {

															// //
															var folderTypeTextBox = content
																	.find('#newFolderTypesTextBox')[0];
															folderTypeTextBox.value = folderTypes[index].name;

															var newFolderCreateBtn = $('#ot-newfolder-create-button');

															if (clickSourceMenu) {
																options
																		.setAttribute(
																				'style',
																				"display:none;");
																folderTypeTextBox
																		.setAttribute(
																				'style',
																				"display:inline-block;margin-bottom: 5px;");
																newFolderCreateBtn
																		.attr(
																				'clickSourceMenu',
																				clickSourceMenu);
															} else {
																options
																		.setAttribute(
																				'style',
																				"display:inline-block;");
																folderTypeTextBox
																		.setAttribute(
																				'style',
																				"display:none;");
																newFolderCreateBtn
																		.attr(
																				'clickSourceMenu',
																				false);
															}
															// ///

															// Create the
															// options for page
															// sorting.
															var optionItem = document
																	.createElement("option");
															optionItem.value = folderTypes[index].name;
															optionItem.text = folderTypes[index].name;
															optionItem
																	.setAttribute(
																			'data-folderTypeId',
																			folderTypes[index].id);
															optionItem
																	.setAttribute(
																			'data-description',
																			folderTypes[index].description
																					|| '');
															optionItem
																	.setAttribute(
																			'data-thumbnail',
																			folderTypes[index].thumb_nail_id
																					|| '');
															optionItem
																	.setAttribute(
																			'data-metadataModelId',
																			folderTypes[index].metadata_model_id);

															if (showPreview) {
																NewFolderView
																		.showFolderTypesInfo(
																				optionItem,
																				content);
																showPreview = false;
															}
															if (!parentView
																	.storedProperty(NewFolderConst.METADATA_MODEL_ID)
																	|| !parentView
																			.storedProperty(NewFolderConst.FOLDER_TYPE_ID)) {
																parentView
																		.storedProperty(
																				NewFolderConst.FOLDER_TYPE_ID,
																				folderTypes[index].id);
																parentView
																		.storedProperty(
																				NewFolderConst.METADATA_MODEL_ID,
																				folderTypes[index].metadata_model_id);
															}

															options
																	.appendChild(optionItem);
														}
													}
												}
												callback(content);
											}, true);
						}
						;
						// //
						this._initContent = _initContent;
						var module = window['NewFolderView'];
						module._initContent = _initContent;
						otui.moduleDefinitions['NewFolderView'] = [ _initContent ];
						module.prototype.initialProperties.content[1] = _initContent;
						// ///
					}, true);

	var createFolder = function createFolder(event, newFolderName) {
		console.log("create folder")
		var metadataView = this.getChildView("NewFolderMetaDataView");
		var securityView = this.getChildView("NewFolderSecPolicyView");
		var OTSecurityPolicyElement = securityView.contentArea().find(
				'ot-security-policy');
		var assignedSecurityPolicies = OTSecurityPolicyElement[0]
				.getAssignedSecurityPolicyIdList();
		var selectedFolderId = $('#newFolderTypes')[0].selectedOptions[0]
				.getAttribute('data-folderTypeId');
		var foldersList = this.properties.newFolderBreadcrumb;
		var parentFolderId = foldersList.ids[foldersList.ids.length - 1];
		var clickSourceMenu = $('#ot-newfolder-create-button').attr(
				'clicksourcemenu');
		if ((parentFolderId == null || parentFolderId == undefined)
				&& clickSourceMenu) {
			parentFolderId = AssetRequestConstants.ASSET_REQUEST_FOLDER_ID;
		}
		metadata = metadataView.getFilledMetadata("folder");
		// Manually add requestID field to metadata:
		metadata.folder_resource.folder.metadata.metadata_element_list.push({
			"id" : "GTRUST.FIELD.REQUEST ID",
			"type" : "com.artesia.metadata.MetadataField",
			"value" : {
				"value" : {
					"type" : "int",
					"value" : newFolderName
				}
			}
		})
		console.log(metadata)
		FolderManager.createFolder({
			"name" : newFolderName,
			"type" : selectedFolderId,
			"folderID" : parentFolderId,
			"metadata" : metadata,
			"securityPolicies" : assignedSecurityPolicies
		});
		otui.DialogUtils.cancelDialog(event.target, true);
	}

	exports.NewFolderDialogView.onCreate = function onCreate(event) {
		console.log("New Folder Dialog View on create")
		var newFolderDialogView = otui.Views.containing(event.target);
		console.log("newFolderDialogView " + newFolderDialogView)
		var tabs = newFolderDialogView.childViews;
		var isValid = true;
		var tab;

		// Validate all the tabs before saving.
		for (var idx = 0; idx < tabs.length; idx++) {
			tab = tabs[idx];

			if (!tab.isValid()) {
				newFolderDialogView.properties.selected = tab.properties.name;
				tab.displayError();
				isValid = false;
				break;
			}
		}

		if (!isValid) {
			return;
		}
		var newFolderName = newFolderDialogView.contentArea().find(
				"#ot-newfolder-name").val();
		var duplicateCheckerEnabled = otui.SystemSettingsManager
				.getSystemSettingValue("ASSET", "CONFIG",
						"DUPLICATE_CHECKER_ENABLED");
		if (duplicateCheckerEnabled
				&& duplicateCheckerEnabled.toLowerCase() === "true"
				&& !newFolderDialogView
						.storedProperty("duplicateFolderValidated")) {
			var folderBreadCrumb = newFolderDialogView.properties.newFolderBreadcrumb;
			var parentFolderId = folderBreadCrumb.ids[folderBreadCrumb.ids.length - 1];
			checkForDuplicateFolders.call(newFolderDialogView, newFolderName,
					parentFolderId, function(folderCreate) {
						if (folderCreate)
							createFolder.call(newFolderDialogView, event,
									newFolderName);
					});
		} else {
			createFolder.call(newFolderDialogView, event, newFolderName);
		}
	};

	var checkForDuplicateFolders = function checkForDuplicateFolders(
			newFolderName, parentFolderId, callback) {
		var self = this;
		var folderNamesList = [ newFolderName ];
		var data = {
			"folderNameList" : folderNamesList,
			"parentFolderId" : parentFolderId
		};
		AssetDetailManager
				.checkDuplicateFolders(
						data,
						function(response, success) {
							self.storedProperty("duplicateFolderValidated",
									true);
							if (success && response) {
								var duplicateFoldersCount = ((response.assets_resource || {}).asset_list || []).length;
								if (duplicateFoldersCount > 0) {
									var buttonNames = [ otui.tr("Continue"),
											otui.tr("Cancel") ];
									var validationMessage = otui
											.tr("One or more folders with the same name already exist in the current folder. If you continue, new folder will be created with the same name as the existing folder.");
									otui.confirm({
										'title' : otui.tr("Confirm"),
										'buttons' : buttonNames,
										'message' : validationMessage,
										'type' : otui.alertTypes.CONFIRM
									}, function(doit) {
										self.storedProperty(
												"duplicateFolderValidated",
												true);
										if (doit) {
											callback(true);
										} else {
											callback(false);
										}
									});
								} else {
									callback(true);
								}
							} else {
								callback(true);
							}
						});
	}

	// ///
	exports.AssetRequestSecPolicyViewGT = otui
			.augment(
					"NewFolderSecPolicyView",
					function() {
						this.renderTemplate = function renderTemplate() {
							// hello
							var contentArea;
							// If the view is not loaded or rendered.
							if (!this.internalProperty("loaded")) {
								return;
							}
							contentArea = this.contentArea();
							var securityPolicyEl = contentArea
									.find("ot-security-policy");
							if (!securityPolicyEl
									|| securityPolicyEl.length === 0) {
								return;
							}

							// ///
							/*
							 * If user is in Everyone>GRI, then set to "GRI -
							 * Asset Request Policy" If user is in
							 * Everyone>Museum, then set to "Museum - Restricted
							 * (Registrar's Asset Requests)"
							 */
							var defaultPolicies = [];

							if (AssetRequestViewDialog.calledFromRibbon) {

								var editableSecurityPoliciesList = UserSecurityPolicyManager
										.getEditableSecurityPolicies();
								var userGroupsName = UsrGrpConstants.userGroups;
								var secPolId = window
										.getPolicyIdforGroupName(userGroupsName);
								var secPol = window.getSecurityPolicyById(
										secPolId, editableSecurityPoliciesList);
								secPol != undefined
										&& defaultPolicies.push(secPol);
							}
							AssetRequestViewDialog.calledFromRibbon = false;

							// ///
							if (defaultPolicies.length > 0) {
								securityPolicyEl[0].assignedPolicies = defaultPolicies;
							} else {
								securityPolicyEl[0].assignedPolicies = {};
							}

							var newFolderSecurityArea = contentArea
									.find(".ot-new-folder-security");
							// NewFolderView.setHeight(newFolderSecurityArea);
							var orientChange = function(event) {
								NewFolderView.setHeight(newFolderSecurityArea);
							};
							$(window).on("orientationchange.dialog",
									orientChange);

						};

						/**
						 * Set's the slim scroll for the view.
						 */
						this.setSlimScroll = function() {
							var contentArea = this.contentArea();
							var securityPolicyArea = contentArea
									.find(".ot-new-folder-security");
							otui.slimscroll(securityPolicyArea,
									NewFolderConst.SLIM_SCROLL_CONT_DIMENSIONS);
						};

					}, true);

})(window);
