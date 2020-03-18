(function(exports) {
	exports.ShareView.groupsCurrentPage = 0;
	exports.ShareView.groupsTotalPages = 0;
	exports.ShareView.groupAssetsPageInfo = [];

	// /////////////////////////////////////////////////////////////
	// Selection and option setting for Delivery Methods
	// ///////////////////////////////////////////////////////////
	exports.ASSET_TRANSFORMER_OPTION = 0;
	exports.DELIVERY_TRANSFORMER_OPTION = 1;
	exports.METADATA_ONLY_OPTION = 2;

	exports.ShareView.openDeliveryMethods = function(event) {
		if (_deliveryMethods.length > 0) {
			var typeCombo = event.target;
			otui.empty(typeCombo);

			for ( var i in _deliveryMethods) {
				var optionItem = document.createElement("option");
				optionItem.textContent = otui.TranslationManager
						.getTranslation(_deliveryMethods[i].name);
				optionItem.value = _deliveryMethods[i].id;
				optionItem.id = _deliveryMethods[i].id;
				_showNext[optionItem.id] = _deliveryMethods[i].showNext;
				$(typeCombo).append(optionItem);
			}
			ShareView.shareOptionsChanged();
			_deliveryMethods = [];
		}
	}

	exports.ShareView.createDeliveryMethods = function(optionsPane) {
		console.log("create delivery methods")
		var deliveryMethods = _shareDeliveryMethods;
		if (isDownloadDelivery)
			deliveryMethods = _downloadDeliveryMethods;

		if (otui.is(otui.modes.PHONE)) {
			var selectBox = $(optionsPane).find("#shareOptions");
			otui.empty(selectBox[0]);

			if (deliveryMethods.length > 0) {
				var defaultOption;
				var defaultOptionIndex = 0;
				for ( var i in deliveryMethods) {
					var optionItem = document.createElement("option");
					optionItem.id = deliveryMethods[i].id;
					optionItem.value = deliveryMethods[i].id;
					optionItem.textContent = otui.TranslationManager
							.getTranslation(deliveryMethods[i].name);
					selectBox.append(optionItem);

					if (i == 0) {
						defaultOption = optionItem;
						defaultOptionIndex = i;
					}

					if (optionItem.id === "ARTESIA.TRANSFORMER.PROFILE.DOWNLOAD.DEFAULT") {
						if (isDownloadDelivery && singleAssetDownloadAction) {
							defaultOption = optionItem;
							defaultOptionIndex = i;
						}
					}
				}

				optionsPane.setAttribute('value', defaultOption.value);
				selectBox[0].store.select.selectedOptions = defaultOption;
				selectBox[0].store.select.selectedIndex = defaultOptionIndex;
				selectBox[0].value = defaultOption.value;
				selectBox[0].title = defaultOption.value;

				selectBox.change();
			} else {
				var optionItem = document.createElement("option");

				optionItem.id = "none";
				optionItem.text = otui.tr("No delivery options found");
				selectBox.append(optionItem);
			}
		} else {
			otui.empty(optionsPane);
			if (deliveryMethods.length > 0) {
				var defaultOption;
				for ( var i in deliveryMethods) {
					var optionItem = document.createElement("div");
					var optionItemText = document.createElement("div");
					var optionItemArrow = document.createElement("div");
					var optionItemBar = document.createElement("div");
					optionItemText.textContent = otui.TranslationManager
							.getTranslation(deliveryMethods[i].name);
					optionItem.id = deliveryMethods[i].id;
					$(optionItem).attr("class", "ot-share-option-button");
					$(optionItemArrow).attr("class",
							"ot-share-option-button-arrow");
					$(optionItemText).attr("class",
							"ot-share-option-button-text");
					$(optionItemBar)
							.attr("class", "ot-share-option-button-bar");
					$(optionItem).attr("title", optionItem.textContent);
					$(optionItem).on("click", ShareView.shareOptionsChanged);

					$(optionItem).append(optionItemBar);
					$(optionItem).append(optionItemText);
					$(optionItem).append(optionItemArrow);
					$(optionsPane).append(optionItem);

					if (i == 0)
						defaultOption = optionItem;

					// DEV-1391, Quick Download should be preselected option
					// if(optionItem.id ===
					// "ARTESIA.TRANSFORMER.PROFILE.DOWNLOAD.DEFAULT"){
					if (optionItem.id === "ARTESIA.DELIVERY.DOWNLOAD") {
						if (isDownloadDelivery && singleAssetDownloadAction)
							defaultOption = optionItem;
					}
				}

				defaultOption.click();
			} else {
				var optionItem = document.createElement("div");
				optionItem.textContent = otui.tr("No delivery options found");
				$(optionsPane).append(optionItem);
			}
		}

		_deliveryMethods = [];
		_shareDeliveryMethods = [];
		_downloadDeliveryMethods = [];
		_shareEmailGroup = [];
		_shareFtpGroup = [];
	}

	exports.ShareView.openJobTransformers = function(typeCombo) {
		if (_jobTransformers.length > 0) {
			// otui.empty(typeCombo);
			var prefs = ShareView.getSharePrefs();
			var packagingPref = prefs["PACKAGING"];
			for ( var i in _jobTransformers) {
				var optionItem = document.createElement("option");
				optionItem.textContent = otui.TranslationManager
						.getTranslation(_jobTransformers[i].name);
				optionItem.value = _jobTransformers[i].id;
				optionItem.id = _jobTransformers[i].id;
				$(typeCombo).append(optionItem);
				if (packagingPref === _jobTransformers[i].id) {
					typeCombo[0].value = packagingPref;
				}
			}
			$(typeCombo).change(
					function(event) {
						console.log("changing job transformers " + this.value);
						if (this.value != "none") {
							$(finishButton).attr('disabled', false);
						} else {
							var packagingOption = $(
									"input[name='ot-share-contents']:checked")
									.val();
							var formatsSelected = exports.ShareView
									.allFormatsSelected();
							var metadataOnly = packagingOption === "2";
							$(finishButton).attr('disabled',
									!(formatsSelected || metadataOnly));
						}
					})
			_jobTransformers = [];
		}
	};

	exports.ShareView.shareFtpSecureOptionChanged = function(event) {
		var isSecure = event.target.checked;
		if (isSecure)
			_shareFtpGroupOption.currentOptionId = _shareFtpGroupOption.sftpId;
		else {
			var notifyCheckbox = $("#ot-share-ftp-notify");
			if (notifyCheckbox[0].checked)
				_shareFtpGroupOption.currentOptionId = _shareFtpGroupOption.ftpNotifyId;
			else
				_shareFtpGroupOption.currentOptionId = _shareFtpGroupOption.ftpId;
		}

		ShareView.shareOptionsChanged(null);

	};

	exports.ShareView.shareFtpNotifyOptionChanged = function(event) {
		var isNotify = event.target.checked;
		var secureCheckbox = $("#ot-share-ftp-secure");
		if (secureCheckbox[0].checked)
			_shareFtpGroupOption.currentOptionId = _shareFtpGroupOption.sftpId;
		else {
			if (isNotify)
				_shareFtpGroupOption.currentOptionId = _shareFtpGroupOption.ftpNotifyId;
			else
				_shareFtpGroupOption.currentOptionId = _shareFtpGroupOption.ftpId;
		}

		ShareView.shareOptionsChanged(null);
	};

	exports.ShareView.shareEmailOptionsChanged = function(event) {
		var assetUrlRadio = $("#ot-share-email-asset-url");
		if (assetUrlRadio[0].checked)
			_shareEmailGroupOption.currentOptionId = _shareEmailGroupOption.emailAssetUrlId;
		else
			_shareEmailGroupOption.currentOptionId = _shareEmailGroupOption.emailAssetsId;

		ShareView.shareOptionsChanged(null);
	};

	exports.ShareView.shareOptionsChanged = function(event) {
		console.log("share options changed")
		var value;
		var optionsPane = $("#shareOptionsPane");
		var currentValue = optionsPane[0].getAttribute("value");
		if (event && event.currentTarget) {
			console.log(event.currentTarget.id)
			if (event.currentTarget instanceof OTSelectElement)
				value = event.currentTarget.value;
			else
				value = event.currentTarget.id;
			if (currentValue && currentValue == value)
				return;
		} else
			value = currentValue;

		optionsPane.find(".ot-share-option-button[id='" + value + "']")
				.addClass("ot-share-option-button-selected");
		if (currentValue != value)
			optionsPane.find(
					".ot-share-option-button[id='" + currentValue + "']")
					.removeClass("ot-share-option-button-selected");

		optionsPane.attr("value", value);
		optionsPane.attr("selected-value", value);

		var deliveryOptionsLabel = $("#ot-share-deliveryOptionsLabel");
		if (event && event.target)
			deliveryOptionsLabel[0].innerText = event.target.innerText
					+ otui.tr(" settings");

		tableNeedsCreation = true;
		hightailShareConfirmation.hide();
		finishButton.show();
		cancelButton[0].innerText = otui.tr("Cancel");
		cancelButton.attr("display", "inline-block");
		cancelButton.show();

		ShareView.closeTerms(null);
		if (!isTCEnabled) {
			agreeTermsBox.show();
		} else {
			agreeTermsBox.hide();
		}

		if (value == "ARTESIA.DELIVERY.HIGHTAIL.DEFAULT") {
			sendViaHightail = true;
			ShareView.enableFinishButton(false);
			shareFtpCheckboxes.hide();
			shareEmailRadios.hide();
			var view;
			if (event && event.target) {
				view = otui.Views.containing(event.target);
			} else {
				view = otui.Views.containing($(".ot-modal-dialog-title"));
			}
			var hightailHandler = function(isValid) {
				if (!isValid) {
					deliveryOptionsContent.hide();
					hightailLoginContent.show();
					fileOptionsContent.hide();
					settingsButton.hide();
					settingsContent.hide();
					activityName.hide();
					view.internalProperty("hightailValidToken", "false");
				} else {
					deliveryOptionsContent.show();
					hightailLoginContent.hide();
					fileOptionsContent.show();
					settingsButton.show();
					activityName.show();

					ShareView.showFileOptions(event);

					ShareManager.showShareOptionFields(value, undefined);
					view.internalProperty("hightailValidToken", "true");
				}
				view.unblockContent();
			};
			var isValidated = view
					&& view.internalProperty("hightailValidToken");

			if (isValidated) {
				hightailHandler(isValidated === "true");

			} else {
				view.blockContent();
				HightailManager.getIsOauthTokenValid(hightailHandler);
			}
		} else {
			sendViaHightail = false;

			deliveryOptionsContent.show();
			hightailLoginContent.hide();

			shareFtpCheckboxes.hide();
			shareEmailRadios.hide();
			activityName.show();

			if (value === _shareFtpGroupOption.id) {
				shareFtpCheckboxes.show();
				var secureCheckbox = $("#shareFtpSecure");
				var notifyCheckbox = $("#shareFtpNotify");

				if (_shareFtpGroupOption.currentOptionId)
					value = _shareFtpGroupOption.currentOptionId;
				else if (_shareFtpGroupOption.ftpId)
					value = _shareFtpGroupOption.ftpId;
				else if (_shareFtpGroupOption.ftpNotifyId)
					value = _shareFtpGroupOption.ftpNotifyId;

				// No FTP
				if (!_shareFtpGroupOption.ftpId) {
					if (value == _shareFtpGroupOption.ftpNotifyId) {
						notifyCheckbox.show();
						notifyCheckbox.find("input")[0].checked = true;
						notifyCheckbox.find("input")[0].disabled = true;
					} else if (value == _shareFtpGroupOption.sftpId) {
						notifyCheckbox.show();
						notifyCheckbox.find("input")[0].disabled = false;
					}
				}
				// No FTP+Notify
				if (!_shareFtpGroupOption.ftpNotifyId) {
					if (value == _shareFtpGroupOption.ftpId)
						notifyCheckbox.hide();
					else if (value == _shareFtpGroupOption.sftpId)
						notifyCheckbox.show();
				}
				// No SFTP
				if (!_shareFtpGroupOption.sftpId)
					secureCheckbox.hide();
				else
					secureCheckbox.show();
			} else if (value === _shareEmailGroupOption.id) {
				shareEmailRadios.show();
				if (_shareEmailGroupOption.currentOptionId)
					value = _shareEmailGroupOption.currentOptionId;
				else if (_shareEmailGroupOption.emailAssetsId)
					value = _shareEmailGroupOption.emailAssetsId;
			}

			if (!_showFileOptions[value]) {
				fileOptionsContent.hide();
				settingsButton.hide();
				settingsContent.hide();
			} else {
				fileOptionsContent.show();
				settingsButton.show();
				if (settingsVisible)
					settingsContent.show();
				else
					settingsContent.hide();

				ShareView.showFileOptions(event);
			}

			if (value == _downloadGroupOption.id) {
				isQuickDownload = true;
				activityName.hide();
				agreeTermsBox.hide();
				$("#shareOptionFields").hide();
				ShareView.enableFinishButton(true, true);
				downloadOptionsContent.show();
				ShareView.setDownloadPreferences(downloadOptionsContent);
			} else {
				isQuickDownload = false;
				$("#shareOptionFields").show();
				ShareView.enableFinishButton(true);
				downloadOptionsContent.hide();
				ShareManager.showShareOptionFields(value, undefined);
			}
		}

		if (value === "ARTESIA.DELIVERY.HIGHTAIL.DEFAULT"
				|| value === "ARTESIA.DELIVERY.YOUTUBE") {
			settingsContent.find(
					".ot-share-settings-block-contents input[type=radio]")
					.attr("disabled", true);
			settingsContent.find("#ot-share-compress-items").attr("disabled",
					true);
			settingsContent.find("#ot-share-compress-items-filename").attr(
					"disabled", true);
			settingsContent
					.find(
							".ot-share-settings-block-metadataformat input[type=radio]")
					.attr("disabled", true);
			settingsContent.find("#ot-share-preserve-export-hierarchy").attr(
					"disabled", true);
		} else {
			settingsContent.find(
					".ot-share-settings-block-contents input[type=radio]")
					.attr("disabled", false);
			var compressionCheckbox = settingsContent
					.find("#ot-share-compress-items");
			if (value == "ARTESIA.TRANSFORMER.PROFILE.DOWNLOAD.DEFAULT") {
				compressionCheckbox.attr("disabled", true);
				if (settingsVisible)
					compressionCheckbox.prop("checked", true);
			} else {
				compressionCheckbox.attr("disabled", false);
			}
			settingsContent.find("#ot-share-compress-items-filename").attr(
					"disabled", !compressionCheckbox.prop("checked"));
			settingsContent
					.find(
							".ot-share-settings-block-metadataformat input[type=radio]")
					.attr("disabled", false);
			settingsContent.find("#ot-share-preserve-export-hierarchy").attr(
					"disabled", false);
		}

		if (isTCEnabled) {
			ShareManager.checkToEnableFinishButton();
		}
		activityNameInput[0].value = ShareView.getActivityName(value);
	};

	exports.ShareView.getActivityName = function(trasformerId) {
		var activityName = "";
		if (trasformerId === "ARTESIA.DELIVERY.YOUTUBE")
			activityName = otui.tr("Assets sent to YouTube");
		else if (trasformerId === "ARTESIA.DELIVERY.EMAIL.DEFAULT")
			activityName = otui.tr("Assets sent via Email");
		else if (trasformerId === "ARTESIA.DELIVERY.EMAILURL.DEFAULT")
			activityName = otui.tr("Assets link sent via Email");
		else if (trasformerId === "ARTESIA.DELIVERY.FTP.DEFAULT"
				|| trasformerId === "ARTESIA.DELIVERY.FTP_LINK.DEFAULT"
				|| trasformerId === "ARTESIA.DELIVERY.SFTP.DEFAULT")
			activityName = otui.tr("Assets sent via FTP");
		else if (trasformerId === "ARTESIA.DELIVERY.FILE.NETWORK.DEFAULT")
			activityName = otui.tr("Assets sent via File Network");
		else if (trasformerId === "ARTESIA.TRANSFORMER.PROFILE.DOWNLOAD.DEFAULT")
			activityName = otui.tr("Custom asset download");
		else if (trasformerId === "ARTESIA.DELIVERY.PDFCONTACTSHEET.DEFAULT")
			activityName = otui.tr("Assets for contact sheet");
		else if (trasformerId === "ARTESIA.DELIVERY.HIGHTAIL.DEFAULT")
			activityName = otui.tr("Assets sent with Hightail");

		return activityName;
	};

	exports.ShareView.setDownloadPreferences = function(content) {
		var preferences = otui.PreferencesManager.preferences["ARTESIA.PREFERENCE.DOWNLOAD"][0];
		var prefValues = preferences.values;
		var maxIndividualAssetDownload = otui.SystemSettingsManager
				.getSystemSettingValue("WEB", "GENERAL",
						"MAX_INDIVIDUAL_ASSET_DOWNLOAD_COUNT");
		maxIndividualAssetDownload = parseInt(maxIndividualAssetDownload);
		var localPrefValues = [];
		// Initial Setting
		if (prefValues.length > 0) {
			var isOriginal = false;
			var isExportZip = (prefValues.indexOf("individual_files") > -1) ? true
					: false;
			var isEmailNotify = (prefValues.indexOf("send_email_notification") > -1) ? true
					: false;
		}
		var note = undefined;
		note = otui
				.trn(
						"If more than {0} file is selected, it will be sent as a ZIP file",
						"If more than {0} files are selected, they will be sent as a ZIP file.",
						maxIndividualAssetDownload, maxIndividualAssetDownload);
		content.find(".ot-download-preference-info-icon")[0].title = note;

		content.find("#ot-download-lowres")[0].checked = true;

		if (otui.Browser.isIE || !isIndividualDownloadAllowed) {
			// IE does not allow downloading more than 2 files to browser. Hence
			// falling back to Export job.
			content.find("#ot-download-one-file")[0].disabled = true;
			content.find("#ot-download-zip-file")[0].checked = true;
		} else {
			var emailNotification = content.find(".ot-download-email-notify")[0];
			var parentEl = otui.parent(emailNotification,
					".ot-download-format-options");
			if (isExportZip) {
				content.find("#ot-download-one-file")[0].checked = true;
				emailNotification.checked = false;
				emailNotification.disabled = true;
				xtag.addClass(parentEl, "ot-email-notify-disabled");
			} else {
				emailNotification.checked = isEmailNotify;
				content.find("#ot-download-zip-file")[0].checked = true;
				xtag.removeClass(parentEl, "ot-email-notify-disabled");
			}
		}

		var downloadPreviewFET = otui.UserFETManager
				.isTokenAvailable("ASSET.DOWNLOAD_PREVIEW");
		if (!downloadPreviewFET) {
			content.find("#ot-download-lowres")[0].disabled = true;
		}
	};

	// //////////////////////////////////////////////////////////////////////////
	// Create/show formats (transformers) page
	// ///////////////////////////////////////////////////////////////////////

	exports.ShareView.showFileOptions = function(event) {
		if (tableNeedsCreation) {
			tableNeedsCreation = false;
			ShareView.createTableRows();
		}

		ShareView.showFileOptionsTable(event);
	};

	exports.ShareView.createTableRows = function() {
		var numNoneContentAssets = 0;
		var assetList = $("#ot-share-asset-types");
		assetList.empty();

		ShareManager.contentTypeTransformers = [];

		// first we need the display values for the types, and then the array of
		// types
		// should be sorted alphabetically on the display values

		for ( var index in ShareManager.typeCounts) {
			ShareManager.typeCounts[index].display_value = ShareManager.typeCounts[index].key;

			// show the display name for the content type
			for ( var i in ShareManager.domainValues) {
				if (ShareManager.domainValues[i].field_value.value == ShareManager.typeCounts[index].key) {
					ShareManager.typeCounts[index].display_value = ShareManager.domainValues[i].display_value;
					break;
				}
			}
		}

		// sort the array based on display value
		ShareManager.typeCounts.sort(function(a, b) {
			return a.display_value.localeCompare(b.display_value);
		});

		for ( var index in ShareManager.typeCounts) {
			if (ShareManager.typeCounts[index].key != 'NONE') {
				var typeRow = document.createElement("div");

				// create a div as a placeholder for individual asset rows
				var assetRowHolder = document.createElement("div");
				$(assetRowHolder).attr("id",
						"ot-table-rows-" + ShareManager.typeCounts[index].key);

				$(typeRow).append(assetRowHolder);

				ShareManager.typeCounts[index].numAssetsLoaded = 0;

				if (ShareManager.typeCounts[index].value > 1) {
					var tableRow, arrow, groupType, icon, count, formatCell, formatList, addButton;
					var type = otui.resourceAccessors
							.assetType(ShareManager.typeCounts[index].key);

					ShareManager.typeCounts[index].availableTransformers = [];

					if (otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD")
							&& (type.name != "BITMAP")) {
						var transformer = {
							'name' : otui.tr("Original"),
							'id' : 'ORIGINAL'
						};
						ShareManager.typeCounts[index].availableTransformers
								.push(transformer);
					}

					if (otui.UserFETManager
							.isTokenAvailable("ASSET.DOWNLOAD_PREVIEW")
							&& type.name != "ACROBAT") {
						var transformer = {
							'name' : otui.tr("Preview"),
							'id' : 'PREVIEW'
						};
						ShareManager.typeCounts[index].availableTransformers
								.push(transformer);
					}

					for ( var j in ShareManager.typeCounts[index].transformers) {
						var transformer = {
							'name' : ShareManager.typeCounts[index].transformers[j].name,
							'id' : ShareManager.typeCounts[index].transformers[j].id
						};
						ShareManager.typeCounts[index].availableTransformers
								.push(transformer);
					}

					var addedFormatId = ShareManager.typeCounts[index].availableTransformers[0].id;

					if (otui.is(otui.modes.PHONE)) {
						tableRow = otui.Templates.get("ot-share-group-row");

						arrow = tableRow.querySelector(".ot-share-open-arrow");
						arrow.setAttribute("id",
								ShareManager.typeCounts[index].key);

						groupType = tableRow
								.querySelector(".ot-share-table-result-asset-type-with-arrow");
						groupType.textContent = otui.TranslationManager
								.getTranslation(ShareManager.typeCounts[index].display_value);

						icon = tableRow
								.querySelector(".ot-share-preview-image");
						icon.setAttribute("src", type.fallback);

						count = tableRow
								.querySelector(".ot-share-table-result-quantity");
						count.textContent = otui.TranslationManager
								.getTranslation(ShareManager.typeCounts[index].value)
								+ " " + otui.tr("assets");

						formatCell = tableRow
								.querySelector(".ot-share-table-result-format");
						formatCell.id = "ot-format-cell-"
								+ ShareManager.typeCounts[index].key;
						formatCell.type = "grouped";
						formatCell.index = index;
						formatCell.assetCount = ShareManager.typeCounts[index].value;

						formatList = tableRow
								.querySelector(".ot-share-format-dropdown");
						formatList.id = "ot-format-dropdown-"
								+ ShareManager.typeCounts[index].key;
						formatList.index = index;
						formatList.type = "grouped";

						addButton = tableRow
								.querySelector(".ot-share-table-result-add-format > button");
						addButton.setAttribute("id",
								ShareManager.typeCounts[index].key + "");
					} else {
						tableRow = document.createElement("div");
						$(tableRow).attr("class", "ot-table-row");

						arrow = document.createElement("div");
						$(arrow).attr("class", "ot-share-open-arrow");
						$(arrow).attr("id", ShareManager.typeCounts[index].key);
						$(arrow).attr("onclick",
								"ShareView.showHideAssetRows(event)");
						$(tableRow).append(arrow);

						groupType = document.createElement("div");
						groupType.textContent = otui.TranslationManager
								.getTranslation(ShareManager.typeCounts[index].display_value);
						$(groupType)
								.attr("class",
										"ot-table-element ot-share-table-result-asset-type-with-arrow");
						// $(groupType).attr("id",
						// ShareManager.typeCounts[index].key);
						// $(groupType).attr("onclick",
						// "ShareView.showHideAssetRows(event)");
						$(tableRow).append(groupType);

						var thumbnail = document.createElement("div");
						// assetType.textContent = asset.content_type;
						$(thumbnail).attr("class",
								"ot-table-element ot-share-image-container");
						icon = document.createElement("img");
						$(icon).attr("src", type.fallback);
						$(icon).attr("class", "ot-share-preview-image");
						$(thumbnail).append(icon);
						$(tableRow).append(thumbnail);

						count = document.createElement("div");
						$(count)
								.attr("class",
										"ot-table-element ot-share-table-result-quantity");
						count.textContent = otui.TranslationManager
								.getTranslation(ShareManager.typeCounts[index].value)
								+ " " + otui.tr("assets");
						$(tableRow).append(count);

						formatCell = document.createElement("div");
						formatCell.id = "ot-format-cell-"
								+ ShareManager.typeCounts[index].key;
						formatCell.type = "grouped";
						formatCell.index = index;
						formatCell.assetCount = ShareManager.typeCounts[index].value;
						$(formatCell)
								.attr("class",
										"ot-table-element ot-share-table-result-format");

						$(tableRow).append(formatCell);

						formatList = document.createElement("ot-select");
						formatList.id = "ot-format-dropdown-"
								+ ShareManager.typeCounts[index].key;
						$(formatList).attr("class", "ot-share-format-dropdown");
						formatList.index = index;
						formatList.type = "grouped";
						$(formatList).attr("onchange",
								"ShareView.formatOptionChanged(event)");
						$(tableRow).append(formatList);

						var addFormatCell = document.createElement("div");
						$(addFormatCell)
								.attr("class",
										"ot-table-element ot-share-table-result-add-format");
						addButton = document.createElement("button");
						$(addButton).attr("id",
								ShareManager.typeCounts[index].key + "");
						$(addButton).attr("onclick",
								"ShareView.addFormat(event)");
						$(addButton).attr("class",
								"ot-button ot-share-option-button secondary");

						var buttonLabel = document.createElement("span");
						$(buttonLabel).attr("class",
								"ot-share-add-button-label");
						buttonLabel.textContent = otui.tr("Add");

						// var buttonImage = document.createElement("div");
						// $(buttonImage).attr("class",
						// "ot-add-format-button-image");

						// $(addButton).append(buttonImage);
						$(addButton).append(buttonLabel);

						$(addFormatCell).append(addButton);

						$(tableRow).append(addFormatCell);
						var argEl = document.createElement("div");
						$(argEl).attr("class", "ot-share-format-args");
						$(tableRow).append(argEl);
					}

					if (otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD")
							&& (type.name != "BITMAP")) {
						ShareView.addFormatToRow(formatCell, 0, false, true);
					}

					if (ShareManager.typeCounts[index].transformers.length == 0) {
						$(addButton).attr('disabled', true);
					}

					assetList.append(tableRow);
					$(typeRow).hide();

					if (otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD")
							&& (type.name != "BITMAP")) {
						ShareView.modifyCount(formatCell, addedFormatId,
								ShareManager.typeCounts[index].value);
					}
					ShareView.refreshTransformers(formatList, formatCell);
				} else {
					ShareView.createTableAssetRows(assetRowHolder,
							ShareManager.typeCounts[index], otui
									.is(otui.modes.PHONE));
				}

				if (otui.is(otui.modes.PHONE)) {
					var anchor = assetList.find('.ot-share-group-row').last();
					if (!anchor.length)
						anchor = assetList;
					anchor.append(typeRow);
				} else {
					assetList.append(typeRow);
				}

			}
		}

		if (otui.is(otui.modes.PHONE)) {
			ShareView.groupsTotalPages = assetList.find(".ot-share-group-row").length;
			assetList.find(".ot-share-group-paging").text(
					otui.tr("{0} of {1}", 1, ShareView.groupsTotalPages));
		}

		// Commenting out below piece of code as the banner message is being
		// shown even when atleast one folder is included in selection context
		// TODO : The condition below needs to changed in order to show the
		// message
		/*
		 * if(ShareManager.numNoContentAssets!=0){
		 * otui.NotificationManager.showNotification( { 'message' :
		 * otui.tr("There is {0} assets have no content. They can not be added
		 * to list. ", ShareManager.numNoContentAssets), 'stayOpen': false,
		 * 'status' : 'warning' }); }
		 */

	};

	exports.ShareView.createTableAssetRows = function(div, typeCounts,
			moveStuff) {
		// get the next page of assets to display (as children of the given div)
		// for the given asset type

		if (typeCounts.value > typeCounts.numAssetsLoaded) {
			var selectionContext = JSON.parse(JSON
					.stringify(ShareManager.pageSelectionContext));

			selectionContext.selection_context_param.selection_context.property_filters = {
				"content_type_filters" : [ typeCounts.key ]
			};
			selectionContext.selection_context_param.selection_context.page_index = parseInt(typeCounts.numAssetsLoaded
					/ ShareManager.assetPageSize) + 1;
			selectionContext.selection_context_param.selection_context.page_size = parseInt(ShareManager.assetPageSize);

			var view = otui.Views.containing($(".ot-modal-dialog-title"));
			if (view)
				view.blockContent();

			AssetManager
					.getPagedAssetListFromSelectionContext(
							selectionContext,
							typeCounts.numAssetsLoaded,
							function(response, status, success) {
								if (view)
									view.unblockContent();

								if (success) {
									if (!ShareManager.assetList[typeCounts.key])
										ShareManager.assetList[typeCounts.key] = [];
									for (var i = 0; i < response.assets_resource.asset_list.length; i++)
										ShareManager.assetList[typeCounts.key]
												.push(response.assets_resource.asset_list[i]);

									for (var index = typeCounts.numAssetsLoaded; index < typeCounts.numAssetsLoaded
											+ response.assets_resource.asset_list.length; index++) {
										var asset = ShareManager.assetList[typeCounts.key][index];

										var url = "";
										if (asset.rendition_content
												&& asset.rendition_content.thumbnail_content)
											url = asset.rendition_content.thumbnail_content.url;
										else if (asset.name) {
											var mimeType = "";
											if (asset.master_content_info)
												mimeType = asset.master_content_info.mime_type;
											else
												mimeType = asset.mime_type;
											var fileNameSplit = asset.name
													.split(".");
											var fileExtension = fileNameSplit[fileNameSplit.length - 1];
											url = "./style/img/contenttype/"
													+ otui.UploadUtils
															.getImageByMimeType(
																	mimeType,
																	fileExtension)
													+ ".png"
										}

										var tableRow, image, assetName, assetSize, formatCell, formatList, addButton;

										ShareManager.assetList[typeCounts.key][index].availableTransformers = [];

										if (otui.UserFETManager
												.isTokenAvailable("ASSET.DOWNLOAD")
												&& (typeCounts.key != "BITMAP")) {
											var transformer = {
												'name' : otui.tr("Original"),
												'id' : 'ORIGINAL'
											};
											ShareManager.assetList[typeCounts.key][index].availableTransformers
													.push(transformer);
										}

										if (otui.UserFETManager
												.isTokenAvailable("ASSET.DOWNLOAD_PREVIEW")
												&& typeCounts.key != "ACROBAT"
												&& (otui.services.asset
														.getPreviewViewPermission(ShareManager.assetList[typeCounts.key][index].access_control_descriptor.permissions_map.entry) && otui.services.asset
														.getSummaryViewPermission(ShareManager.assetList[typeCounts.key][index].access_control_descriptor.permissions_map.entry))) {
											var transformer = {
												'name' : otui.tr("Preview"),
												'id' : 'PREVIEW'
											};
											ShareManager.assetList[typeCounts.key][index].availableTransformers
													.push(transformer);
										}

										for ( var i in ShareManager.typeCounts) {
											if (ShareManager.typeCounts[i].key == asset.content_type) {
												for ( var j in ShareManager.typeCounts[i].transformers) {
													var transformer = {
														'name' : ShareManager.typeCounts[i].transformers[j].name,
														'id' : ShareManager.typeCounts[i].transformers[j].id
													};
													ShareManager.assetList[typeCounts.key][index].availableTransformers
															.push(transformer);
												}
												break;
											}
										}

										if (otui.is(otui.modes.PHONE)) {
											tableRow = otui.Templates
													.get(moveStuff ? 'ot-share-single-row-group'
															: "ot-share-single-row");

											image = tableRow
													.querySelector(".ot-share-preview-image");

											assetName = tableRow
													.querySelector(".ot-share-table-result-asset-filename");

											assetSize = tableRow
													.querySelector(".ot-share-table-result-quantity");

											formatCell = tableRow
													.querySelector(".ot-share-table-result-format");

											formatList = tableRow
													.querySelector(".ot-share-format-dropdown");

											addButton = tableRow
													.querySelector(".ot-share-table-result-add-format > button");

											ShareView.groupAssetsPageInfo[ShareView.groupsCurrentPage] = {
												currentPage : 0,
												totalPages : response.assets_resource.asset_list.length
											};

											if (moveStuff) {
												tableRow
														.querySelector(".ot-share-group-paging").textContent = otui
														.tr(
																"{0} of {1}",
																1,
																ShareView.groupsTotalPages);
											} else {
												tableRow
														.querySelector(".ot-share-group-assets-paging").textContent = otui
														.tr(
																"{0} of {1}",
																1,
																ShareView.groupAssetsPageInfo[ShareView.groupsCurrentPage].totalPages);
											}
										} else {
											tableRow = document
													.createElement("div");
											$(tableRow).attr("class",
													"ot-table-row-asset");

											var typeInfo = otui.resourceAccessors
													.assetType(asset.content_type);
											var assetType = document
													.createElement("div");
											// assetType.textContent =
											// asset.content_type;
											$(assetType)
													.attr("class",
															"ot-table-element ot-share-image-container");
											/*
											 * var icon =
											 * document.createElement("img");
											 * $(icon).attr("src",
											 * typeInfo.icon);
											 * $(icon).attr("class",
											 * "ot-share-preview-image");
											 * $(assetType).append(icon);
											 */

											if (typeCounts.value == 1) {
												var groupType = document
														.createElement("div");
												groupType.textContent = otui.TranslationManager
														.getTranslation(typeCounts.display_value);
												$(groupType)
														.attr("class",
																"ot-table-element ot-share-table-result-asset-type");
												$(groupType).attr("id",
														typeCounts.key);
												$(groupType).attr("title",
														groupType.textContent);
												$(assetType).append(groupType);
											}

											$(assetType)
													.attr("class",
															"ot-table-element ot-share-table-result-asset-type");
											$(tableRow).append(assetType);

											var imageEntry = document
													.createElement("div");
											$(imageEntry)
													.attr("class",
															"ot-table-element ot-share-image-container");
											image = document
													.createElement("img");
											$(image).attr("class",
													"ot-share-preview-image");
											$(imageEntry).append(image);
											$(tableRow).append(imageEntry);

											var assetInfo = document
													.createElement("div");
											assetName = document
													.createElement("div");
											assetSize = document
													.createElement("div");
											$(assetInfo)
													.attr("class",
															"ot-table-element ot-share-table-result-asset-name");
											$(assetName)
													.attr("class",
															"ot-share-table-result-asset-filename");
											$(assetInfo).attr("title",
													asset.name);
											$(assetInfo).append(assetName);
											$(assetInfo).append(assetSize);
											$(tableRow).append(assetInfo);

											formatCell = document
													.createElement("div");
											$(formatCell)
													.attr("class",
															"ot-table-element ot-share-table-result-format");
											$(tableRow).append(formatCell);

											formatList = document
													.createElement("ot-select");
											$(formatList).attr("class",
													"ot-share-format-dropdown");
											$(formatList)
													.attr("onchange",
															"ShareView.formatOptionChanged(event)");
											$(tableRow).append(formatList);

											var addFormatCell = document
													.createElement("div");
											$(addFormatCell)
													.attr("class",
															"ot-table-element ot-share-table-result-add-format");
											addButton = document
													.createElement("button");
											$(addButton)
													.attr("onclick",
															"ShareView.addFormat(event)");
											$(addButton)
													.attr("class",
															"ot-button ot-share-option-button secondary");

											var buttonLabel = document
													.createElement("span");
											$(buttonLabel)
													.attr("class",
															"ot-share-add-button-label");
											buttonLabel.textContent = otui
													.tr("Add");

											// var buttonImage =
											// document.createElement("div");
											// $(buttonImage).attr("class",
											// "ot-add-format-button-image");

											// $(addButton).append(buttonImage);
											$(addButton).append(buttonLabel);

											$(addFormatCell).append(addButton);

											$(tableRow).append(addFormatCell);

											var argEl = document
													.createElement("div");
											$(argEl).attr("class",
													"ot-share-format-args");
											$(tableRow).append(argEl);
										}

										$(image).attr("src", url);

										assetName.textContent = otui.TranslationManager
												.getTranslation(asset.name);
										assetSize.textContent = otui.FileUploadManager
												.createDisplayFileSize(asset.content_size);

										formatCell.id = "ot-format-cell-"
												+ typeCounts.key
												+ "-"
												+ ShareManager.assetList[typeCounts.key][index].asset_id;
										formatCell.type = "single";
										formatCell.asset_type = typeCounts.key;
										formatCell.modified = false;
										formatCell.index = index;

										formatList.id = "ot-format-dropdown-"
												+ ShareManager.assetList[typeCounts.key][index].asset_id;
										formatList.index = index;
										formatList.type = "single";

										$(addButton)
												.attr(
														"id",
														typeCounts.key
																+ "-"
																+ ShareManager.assetList[typeCounts.key][index].asset_id);

										if (ShareManager.assetList[typeCounts.key][index].availableTransformers.length == 0) {
											$(addButton).attr('disabled', true);
										}

										$(div).append(tableRow);

										ShareView.refreshTransformers(
												formatList, formatCell);
									}

									div.parentElement.className = "ot-share-group-individual-wrapper";

									typeCounts.numAssetsLoaded += response.assets_resource.asset_list.length;

									if (typeCounts.value > 1) {
										var groupFormatCell = $("#ot-format-cell-"
												+ typeCounts.key)[0];
										// groupFormatCell.assetCount =
										// typeCounts.numAssetsLoaded;
										// get the list of all formats in the
										// given format cell
										var formatIds = ShareView
												.getFormatIdsFromFormatCell(groupFormatCell);
										ShareView.adjustGroups(groupFormatCell,
												"show", formatIds);
										// There is no neccessary to add more
										// button because assets without export
										// permission can not added to list,
										// ART-31040
										if (!div.firstOpen) {
											div.firstOpen = true;
											// // if neccessary, add the button
											// to load more assets of this type
											// if (typeCounts.numAssetsLoaded <
											// typeCounts.value)
											// {
											// var tableRow =
											// document.createElement("div");
											// $(tableRow).attr("class","ot-table-row");
											// $(tableRow).attr("id",
											// "ot-load-more-" +
											// typeCounts.key);
											// //var loadMoreDiv =
											// document.createElement("div");
											// //$(loadMoreDiv).attr("class","ot-table-element
											// ot-share-table-result-add-format");
											// var loadButton =
											// document.createElement("button");
											// $(loadButton).attr("id",
											// "ot-load-" + typeCounts.key);
											// $(loadButton).attr("onclick",
											// "ShareView.loadMoreAssets(event)");
											// $(loadButton).attr("class",
											// "ot-button
											// ot-share-load-more-button");
											// loadButton.textContent =
											// otui.tr("Load more");
											// loadButton.asset_type =
											// typeCounts.key;
											// 		
											// $(tableRow).append(loadButton);
											// $(div.parentNode).append(tableRow);
											// }
										}
										// 
										// if (typeCounts.numAssetsLoaded ==
										// typeCounts.value)
										// {
										// var loadMore = $("#ot-load-more-" +
										// typeCounts.key);
										// if (loadMore[0]) loadMore.hide();
										// }
									} else {
										if (typeCounts.key != "BITMAP") {
											ShareView.addFormatToRow(
													formatCell, 0, false, true);
										}
									}

									if (otui.is(otui.modes.PHONE) && moveStuff) {
										$(div)
												.parents(
														'.ot-share-asset-list-body')
												.append(
														$(div)
																.parents(
																		'.ot-share-group-individual-wrapper'));
										ShareView.groupsTotalPages += 1;
										$(div)
												.parents(
														'.ot-share-asset-list-body')
												.find(".ot-share-group-paging")
												.text(
														otui
																.tr(
																		"{0} of {1}",
																		1,
																		ShareView.groupsTotalPages));
									}
								}
							});
		}
	};

	// ////////////////////////////////////////////////////////////////
	// Adding and removing formats from rows
	// /////////////////////////////////////////////////////////////

	ShareView.addFormatToRow = function(formatCell, transformerIndex,
			addRemoveButton, addToContentType, argEntries) {
		// get the list of available transformers

		var availableTransformers = ShareManager
				.getAvailableTransformersFromFormatCell(formatCell);
		var format = availableTransformers[transformerIndex];
		var formatCellIdentifier = formatCell.id.replace("ot-format-cell-", "");
		// add a select field to this table cell

		if (format) {
			var span = document.createElement("span");
			span.id = "ot-format-" + formatCellIdentifier;

			$(span).attr("class", "ot-chicklet");

			span.transformer_id = format.id;
			span.add_to_content_type = addToContentType;

			if (formatCell.type == "grouped") {
				// maintain a count in the group level of all single
				// assets using this format (unless it's all of them)
				if (addToContentType)
					span.count = formatCell.assetCount;
				else
					span.count = 0;
			}

			span.name = format.name;
			span.textContent = otui.TranslationManager
					.getTranslation(format.name);

			if (argEntries && argEntries.length > 0) {
				var infoButton = document.createElement("div");
				$(infoButton).attr("class", "ot-chicklet-info");
				$(infoButton).attr("title",
						otui.tr("Show format option values"));
				$(span).append(infoButton);
			}

			var removeButton = document.createElement("div");
			removeButton.id = formatCellIdentifier;
			$(removeButton).attr("class", "ot-chicklet-closer");
			$(removeButton).attr("onclick", "ShareView.removeFormat(event)");
			$(removeButton).attr("title", otui.tr("Remove format"));
			$(span).append(removeButton);

			$(formatCell).append(span);

			if (argEntries && argEntries.length > 0) {

				var selectedArgsTemplate = otui.Templates
						.get("ot-selected-format-args");
				var selectedArgEntryTemplate = otui.Templates
						.get("ot-selected-format-arg-entry");

				for ( var i in argEntries) {
					var elTempClone = selectedArgEntryTemplate.cloneNode(true);
					elTempClone
							.querySelector('.ot-selected-format-arg-entry-label').textContent = argEntries[i].key;
					elTempClone
							.querySelector('.ot-selected-format-arg-entry-value').textContent = argEntries[i].displayValue;

					$(selectedArgsTemplate).find(
							".ot-selected-format-args-wrapper").append(
							elTempClone);
				}

				var hoverEl = document.createElement("ot-hover");
				$(hoverEl).addClass("ot-selected-format-arguments");
				$(hoverEl).append(selectedArgsTemplate);

				$(infoButton).click(function() {
					hoverEl.show(infoButton);
				});
				$(formatCell).append(hoverEl);
			}

			if (addToContentType || formatCell.type == "single")
				otui.ArrayUtils.removeByIndex(availableTransformers,
						transformerIndex);

			ShareView.refreshTransformers(ShareView
					.getSelectBoxFromFormatCell(formatCell), formatCell);
		}
	};

	ShareView.addFormatIfAvailable = function(formatCell, formatId,
			addToContentType, argEntries) {
		var added = false;
		// check if it's already there, in which case don't add it
		var existingFormat = ShareView.getFormat(formatCell, formatId);
		if (!existingFormat) {
			var availableTransformers = ShareManager
					.getAvailableTransformersFromFormatCell(formatCell);

			for ( var j in availableTransformers) {
				if (availableTransformers[j].id == formatId) {
					ShareView.addFormatToRow(formatCell, j, true,
							addToContentType, argEntries);
					added = true;
					break;
				}
			}
		} else if (formatCell.type == "grouped" && addToContentType) {
			ShareView.removeFormatIfExisting(formatCell, formatId);
			added = ShareView.addFormatIfAvailable(formatCell, formatId,
					addToContentType, argEntries);
		} else if (formatCell.type == "grouped") {
			ShareView.addToAvailableTransformers(formatCell, existingFormat);
		}

		return added;
	};

	ShareView.getFormat = function(formatCell, formatId) {
		var format = undefined;
		var formats = formatCell.querySelectorAll("span.ot-chicklet");
		for (var i = 0; i < formats.length; i++) {
			if (formats[i].transformer_id == formatId) {
				format = formats[i];
				break;
			}
		}
		return format;
	}

	ShareView.removeFormatIfExisting = function(formatCell, formatId) {
		// check if the given format exists in the given cell
		var format = ShareView.getFormat(formatCell, formatId);
		if (format) {
			ShareView.addToAvailableTransformers(formatCell, format);

			$(format).next("ot-hover.ot-selected-format-arguments").remove();
			$(format).remove();

			ShareView.refreshTransformers(null, formatCell);
		}
	};

	ShareView.addToAvailableTransformers = function(formatCell, format) {
		var availableTransformers = ShareManager
				.getAvailableTransformersFromFormatCell(formatCell);

		var exists = false;
		for ( var j in availableTransformers) {
			if (availableTransformers[j].id == format.transformer_id) {
				exists = true;
				break;
			}
		}
		if (!exists) {
			var value = format.transformer_id;
			var text = format.name;
			var transformer = {
				'name' : text,
				'id' : value
			};
			availableTransformers.push(transformer);

			ShareView.refreshTransformers(ShareView
					.getSelectBoxFromFormatCell(formatCell), formatCell);
		}
	};

	ShareView.getSelectBoxFromFormatCell = function(formatCell) {
		var selectBoxId = formatCell.id.replace("ot-format-cell-", "");
		var split = selectBoxId.split("-");
		if (split.length > 1)
			selectBoxId = split[1];
		selectBoxId = "ot-format-dropdown-" + selectBoxId;
		var selectBox = $("#" + selectBoxId)[0];
		return selectBox;
	};

	ShareView.getFormatIdsFromFormatCell = function(formatCell) {
		var formatIds = [];
		if (formatCell) {
			var formats = formatCell.querySelectorAll("span.ot-chicklet");
			for (var i = 0; i < formats.length; i++) {
				if (formats[i].add_to_content_type)
					formatIds.push(formats[i].transformer_id);
			}
		}

		return formatIds;
	};

	ShareView.getGroupFormatCell = function(formatCell) {
		var groupFormatCellId = formatCell.id.substring(0, formatCell.id
				.lastIndexOf("-"));
		var groupFormatCell = $("#" + groupFormatCellId)[0];
		return groupFormatCell;
	};

	ShareView.adjustGroups = function(formatCell, action, formatIds, argEntries) {
		// adding and removing formats from the group rows affects the
		// single asset rows (if open) and vice versa
		if (formatCell) {
			if (formatCell.type == "grouped") {
				if (action == "add") {
					// if a format has been added to the group, add it to all
					// open
					// single asset rows
					var id = formatCell.id;

					Array.prototype.forEach.call($("*[id*=" + id + "-]"),
							function(singleAssetFormatCell) {
								for (var i = 0; i < formatIds.length; i++) {
									ShareView.addFormatIfAvailable(
											singleAssetFormatCell,
											formatIds[i], false);
								}
							});
				} else if (action == "remove") {
					// if a format has been removed from the group, remove it
					// from
					// all single asset rows
					var id = formatCell.id;

					Array.prototype.forEach.call($("*[id*=" + id + "-]"),
							function(singleAssetFormatCell) {
								for (var i = 0; i < formatIds.length; i++) {
									ShareView
											.removeFormatIfExisting(
													singleAssetFormatCell,
													formatIds[i]);
								}
							});
				} else if (action == "show") {
					// we're showing new assets for this asset type. If they
					// haven't been
					// modified, then just make them match the group. If they
					// have, then
					// leave them alone

					var id = formatCell.id;

					Array.prototype.forEach.call($("*[id*=" + id + "-]"),
							function(singleAssetFormatCell) {
								if (!singleAssetFormatCell.modified) {
									for (var i = 0; i < formatIds.length; i++) {
										ShareView.addFormatIfAvailable(
												singleAssetFormatCell,
												formatIds[i], false);
									}
								}
							});
				}

			} else {
				// if a format was added to or removed from a single asset, then
				// show the format in the group row with a number indicating the
				// number
				// of assets which has that format applied (remove if 0)

				// get the formatCell of this group
				var groupFormatCell = ShareView.getGroupFormatCell(formatCell);

				if (action == "add" && groupFormatCell) {
					// if a format has been added to the asset, then add it to
					// the
					// group level (if it doesn't already exist) and increment
					// the
					// count
					var id = formatCell.id;

					ShareView.addFormatIfAvailable(groupFormatCell,
							formatIds[0], false);
					var newCount = ShareView.modifyCount(groupFormatCell,
							formatIds[0], 1);
					if (newCount == groupFormatCell.assetCount
							&& !(argEntries && argEntries.length > 0)) {
						ShareView.addFormatIfAvailable(groupFormatCell,
								formatIds[0], true);
					}

				} else if (action == "remove" && groupFormatCell) {
					// if a format was removed from the asset, decrement the
					// count at the
					// group level, and remove the format from there if the
					// count is 0

					var newCount = ShareView.modifyCount(groupFormatCell,
							formatIds[0], -1);
					if (newCount == 0) {
						ShareView.removeFormatIfExisting(groupFormatCell,
								formatIds[0]);
					} else {
						// make sure the format is added back into the list for
						// the groups
						ShareView.addFormatIfAvailable(groupFormatCell,
								formatIds[0], false);
					}
				} else if (action == "show") {
					// case where there's only one of the asset type
					ShareView.addFormatIfAvailable(formatCell, formatIds[0],
							false);
				}
			}
		}
	};

	ShareView.modifyCount = function(formatCell, formatId, modifier) {
		var format = ShareView.getFormat(formatCell, formatId);
		format.count += modifier;
		if (formatCell.type == "grouped"
				&& format.count > formatCell.assetCount)
			format.count = formatCell.assetCount;

		if (format.count == formatCell.assetCount)
			format.firstChild.data = format.name;
		else
			format.firstChild.data = format.name + " (" + format.count + ")";

		return format.count;
	};

	ShareView.refreshTransformers = function(selectBox, formatCell) {
		// available transformers have changed, so empty the select box and
		// refill with the current list
		if (selectBox) {
			otui.empty(selectBox);

			var availableTransformers = ShareManager
					.getAvailableTransformersFromFormatCell(formatCell);

			for ( var j in availableTransformers) {
				var optionItem = document.createElement("option");
				optionItem.id = "option" + j;

				optionItem.text = availableTransformers[j].name;
				optionItem.value = availableTransformers[j].id;

				$(selectBox).append(optionItem);
			}

			if (availableTransformers.length == 0) {
				var optionItem = document.createElement("option");
				optionItem.id = "NONE";

				optionItem.text = otui.tr("None");
				optionItem.value = "NONE";

				$(selectBox).append(optionItem);
			}
			$(selectBox).trigger("change");
			ShareView.enableAddFormat(formatCell,
					!(availableTransformers.length == 0));
		}

		// Now check how many formats are in the current formatCell. If only
		// one,
		// then don't show a remove button
		var formats = formatCell.querySelectorAll("span.ot-chicklet");
		if (formats.length === 1) {
			$(formats[0]).find(".ot-chicklet-closer").hide();
		} else {
			for (var i = 0; i < formats.length; i++) {
				$(formats[i]).find(".ot-chicklet-closer").show();
			}
		}
	};

	ShareView.enableAddFormat = function(formatCell, enable) {
		var formatCellIdentifier = formatCell.id.replace("ot-format-cell-", "");
		var addFormatBtn = $("button[id=" + formatCellIdentifier + "]");

		$(addFormatBtn).attr('disabled', !enable);
		$(addFormatBtn).find(".ot-add-format-button-image").attr('disabled',
				!enable);
	};

	ShareView.enableAddFormat = function(formatCell, enable) {
		var formatCellIdentifier = formatCell.id.replace("ot-format-cell-", "");
		var addFormatBtn = $("button[id=" + formatCellIdentifier + "]");

		$(addFormatBtn).attr('disabled', !enable);
		$(addFormatBtn).find(".ot-add-format-button-image").attr('disabled',
				!enable);
		var formatsSelected = exports.ShareView.allFormatsSelected();

		$(finishButton).attr('disabled', !formatsSelected);

	};

	exports.ShareView.showFileOptionsTable = function(event) {
		var viewContent = $(".ot-share-main-area");
		if (ShareManager.typeCounts[0]) {
			var formatsEl = viewContent.find("#ot-format-"
					+ ShareManager.typeCounts[0].key);
			if (formatsEl) {
				formatsEl.focus();
			}
		}
		var toolTip = viewContent.find(".ot-add-format-button");
		toolTip.attr("title", otui.tr("Add format"));
	};

	exports.ShareView.showTerms = function(event) {
		if (event.target.getAttribute("disabled")) {
			return;
		}
		event.target.setAttribute("disabled", true);
		event.target.className = "ot-terms-inactive";
		event.target.removeAttribute("ot-i18n-mod");
		event.preventDefault();
		deliveryOptionsContent.hide();
		agreeTermsContent.show();
		agreeTermsBox.hide();
		fileOptionsContent.hide();
		hightailLoginContent.hide();
		finishButton.hide();
		closeButton.show();
		cancelButton.hide();
		settingsButton.hide();
		settingsContent.hide();
		activityName.hide();

		if (otui.is(otui.modes.PHONE)) {
			var optionsPane = $("#shareOptionsPane");
			optionsPane.hide();
			activityName.hide();
		}
	};

	exports.ShareView.closeTerms = function(event) {
		var termsTarget = null;
		if (agreeTermsBox && agreeTermsBox.length > 0)
			termsTarget = agreeTermsBox[0].querySelector("a");

		if (termsTarget) {
			termsTarget.removeAttribute("disabled");
			termsTarget.className = "";
			termsTarget.setAttribute("ot-i18n-mod", "link");
		}

		deliveryOptionsContent.show();
		agreeTermsContent.hide();
		agreeTermsBox.show();
		fileOptionsContent.show();
		hightailLoginContent.hide();
		finishButton.show();
		cancelButton.show();
		closeButton.hide();

		settingsButton.show();
		if (settingsVisible)
			settingsContent.show();

		if (otui.is(otui.modes.PHONE)) {
			var optionsPane = $("#shareOptionsPane");
			optionsPane.show();
			activityName.show();
		}

		if (event && event.target) {
			// Set focus on Terms and Conditions link for 508 complance.
			var view = otui.Views.containing(event.target);
			var termsLink = $("ot-i18n.ot-tac", view.contentArea()).find("a");
			termsLink.focus();
		}
	};

	exports.ShareView.changeTableType = function(event) {
		if (event.target.checked) {
			assetGroupTable.show();
			assetSingleTable.hide();
		} else {
			assetGroupTable.hide();
			assetSingleTable.show();
		}
	};
	exports.ShareView.setDefaults = function(event) {
		var view = otui.Views.containing(event.target);
		var contentArea = view.contentArea();
		var data = [];
		// Populating content export preference
		var contentExportsEl = contentArea
				.find("[name='ot-share-contents']:checked");
		var contentExportsPref = [];
		contentExportsPref.push(contentExportsEl[0].id);
		data.push({
			"type" : "CONTENTS_OF_EXPORT",
			"values" : contentExportsPref
		});
		// Populating metadata format preference
		var metadataFormatEl = contentArea
				.find("[name='ot-share-metadata-format']:checked");
		var metadataFormatPref = [];
		metadataFormatPref.push(metadataFormatEl[0].id);
		data.push({
			"type" : "METADATA_FORMAT",
			"values" : metadataFormatPref
		});
		// Populating export heirarchy preference
		var exportOptionsEl = contentArea
				.find("#ot-share-preserve-export-hierarchy");
		var exportOptionsPref = [];
		exportOptionsPref.push((!!exportOptionsEl[0].checked).toString());
		data.push({
			"type" : "EXPORT_OPTIONS",
			"values" : exportOptionsPref
		});
		var exportOptionsIncludeSubfilesPref = [];
		var exportOptionsIncludeSubfilesEl = contentArea
				.find("#ot-share-include-subfiles");
		exportOptionsIncludeSubfilesPref
				.push((!!exportOptionsIncludeSubfilesEl[0].checked).toString());
		data.push({
			"type" : "INCLUDE_SUBFILES",
			"values" : exportOptionsIncludeSubfilesPref
		});
		// Populating packaging preference
		var packagingEl = contentArea.find("#ot-share-packaging-options");
		var packagingPref = [];
		packagingPref.push(packagingEl[0].value);
		data.push({
			"type" : "PACKAGING",
			"values" : packagingPref
		});
		// Populating compression preference
		var compressionEl = contentArea.find("#ot-share-compress-items");
		var compressionPref = [];
		compressionPref.push((!!compressionEl[0].checked).toString());
		data.push({
			"type" : "COMPRESSION",
			"values" : compressionPref
		});
		// Populating linked assets preference
		var linkedAssetsEl = contentArea
				.find("#ot-share-include-linked-assets");
		var linkedAssetsPref = [];
		linkedAssetsPref.push((!!linkedAssetsEl[0].checked).toString());
		if (linkedAssetsEl[0].checked) {
			// create sub preferences for linked assets
			var sub_preferences = [];
			var linkAssetsDepthEl = contentArea.find("#ot-share-link-depth");
			var linkAssetsDepthPref = [];
			linkAssetsDepthPref.push(linkAssetsDepthEl[0].value);
			sub_preferences.push({
				"type" : "DEPTH_OF_LINKED_ASSETS",
				"values" : linkAssetsDepthPref
			});
			var selectedLinkTypesEl = contentArea
					.find(".ot-share-link-select:checkbox:checked");
			var selectedLinkTypePrefList = "";
			for (var i = 0; i < selectedLinkTypesEl.length; i++) {
				selectedLinkTypePrefList = selectedLinkTypePrefList
						+ selectedLinkTypesEl[i].id + ",";
			}
			var selectedLinkTypePref = [];
			selectedLinkTypePref.push(selectedLinkTypePrefList);
			sub_preferences.push({
				"type" : "ASSET_ASSOCIATION_TYPE",
				"values" : selectedLinkTypePref
			});
			data.push({
				"type" : "LINKED_ASSETS",
				"values" : linkedAssetsPref,
				"sub_preferences" : sub_preferences
			});
		} else {
			data.push({
				"type" : "LINKED_ASSETS",
				"values" : linkedAssetsPref,
				"sub_preferences" : []
			});
		}
		otui.PreferencesManager
				.setPreferenceById(
						'ARTESIA.PREFERENCE.EXPORT.SETTINGS',
						data,
						function(response) {
							if (response.user_preference_resource.preference_data[0]) {
								otui.NotificationManager
										.showNotification({
											'message' : otui
													.tr("Share settings are saved as default."),
											'stayOpen' : false,
											'status' : 'ok'
										});
							} else {
								otui.NotificationManager
										.showNotification({
											'message' : otui
													.tr("Failed to save share settings "),
											'stayOpen' : true,
											'status' : 'error'
										});
							}
						});
	};
	exports.ShareView.setSharePrefs = function(content) {
		ShareView.retrieveSharePrefs();
		var prefs = ShareView.getSharePrefs();
		if (prefs && Object.keys(prefs).length > 0) {
			// Setting content export preference
			var contentExportPref = prefs["CONTENTS_OF_EXPORT"].toLowerCase();
			var contentExportEl = content.find("#" + contentExportPref);
			contentExportEl[0].checked = true;
			if (prefs["CONTENTS_OF_EXPORT"] === "ot-share-assets-and-list") {
				// if the content export option is assets and assets list then
				// hide the metadata format section
				var metadatadataFormatWrapper = content
						.find(".ot-share-settings-block-metadataformat");
				metadatadataFormatWrapper.hide();
			} else {
				// Setting metadata format preference
				var metadatFormatPref = prefs["METADATA_FORMAT"].toLowerCase();
				var metadataFormatEl = content.find("#" + metadatFormatPref);
				metadataFormatEl[0].checked = true;
			}
			// Setting export options checkbox preference
			var exportOptionsPref = prefs["EXPORT_OPTIONS"].toLowerCase();
			var exportOptionsEl = content
					.find("#ot-share-preserve-export-hierarchy");
			exportOptionsEl[0].checked = (exportOptionsPref && exportOptionsPref === "true");

			var exportOptionsIncludeSubfilesPref = (prefs["INCLUDE_SUBFILES"]) ? prefs["INCLUDE_SUBFILES"]
					.toLowerCase()
					: "false";
			var exportOptionsIncludeSubfilesEl = content
					.find("#ot-share-include-subfiles");
			exportOptionsIncludeSubfilesEl[0].checked = (exportOptionsIncludeSubfilesPref && exportOptionsIncludeSubfilesPref === "true");

			// Setting linked assets checkbox preference
			var linkedAssetsPref = prefs["LINKED_ASSETS"].toLowerCase();
			var linkedAssetsEl = content
					.find("#ot-share-include-linked-assets");
			linkedAssetsEl[0].checked = (linkedAssetsPref && linkedAssetsPref === "true");
			if (linkedAssetsEl[0].checked) {
				// Displaying linked assets depth and link types
				linkOptions.show();
				// Setting linked assets depth preference
				var linkedAssetsDepthPref = prefs["DEPTH_OF_LINKED_ASSETS"];
				linkedAssetsDepthPref = (linkedAssetsDepthPref && linkedAssetsDepthPref === "ALL") ? 0
						: linkedAssetsDepthPref;
				var linkedAssetsDepthEl = content.find("#ot-share-link-depth");
				linkedAssetsDepthEl[0].value = linkedAssetsDepthPref;
			}
			// Setting compression checkbox preference
			var compressionPref = prefs["COMPRESSION"].toLowerCase();
			var compressionEl = content.find("#ot-share-compress-items");
			compressionEl[0].checked = (compressionPref && compressionPref === "true");
		}
	};
	exports.ShareView.retrieveSharePrefs = function() {
		var sharePrefs = otui.PreferencesManager
				.getPreferenceDataById("ARTESIA.PREFERENCE.EXPORT.SETTINGS");
		if (sharePrefs && sharePrefs.length > 0) {
			for (var idx = 0; idx < sharePrefs.length; idx++) {
				_settingPrefs[sharePrefs[idx].type] = sharePrefs[idx].values[0];
				if (sharePrefs[idx].sub_preferences) {
					for (var j = 0; j < sharePrefs[idx].sub_preferences.length; j++) {
						_settingPrefs[sharePrefs[idx].sub_preferences[j].type] = sharePrefs[idx].sub_preferences[j].values[0];
					}
				}
			}
		}
	};
	exports.ShareView.getSharePrefs = function() {
		return _settingPrefs;
	};

	exports.ShareView.showSettings = function(event) {
		var settingsArrow = $("#settingsButtonArrow");
		if (settingsVisible) {
			settingsContent.hide();
			settingsVisible = false;

			settingsArrow.removeClass("ot-share-settingsButton-close-arrow");
		} else {
			settingsContent.show();
			settingsVisible = true;

			settingsArrow.addClass("ot-share-settingsButton-close-arrow")

			if (ShareManager.currentInstanceId == "ARTESIA.TRANSFORMER.PROFILE.DOWNLOAD.DEFAULT") {
				$("#ot-share-compress-items").prop("checked", true);
			}
		}
	};

	exports.ShareView.onCompressionChange = function(event) {
		var compressionName = $("#ot-share-compress-items-filename");
		compressionName.attr("disabled", !event.currentTarget.checked);
	};

	exports.ShareView.buildLinkTypes = function() {
		AssetRelationshipManager
				.getLinkTypes(function(linkTypes) {
					var count = 0;
					var newline;
					var prefs = ShareView.getSharePrefs();
					var associationTypePref = prefs["ASSET_ASSOCIATION_TYPE"];
					var associationTypePrefArr = [];
					if (associationTypePref)
						associationTypePrefArr = associationTypePref.split(",");
					for ( var i in linkTypes) {
						if (count % 3 == 0) {
							newline = document.createElement("div");
							$(newline).attr("class", "ot-share-link-newline");
							linkOptions.append(newline);
						}

						var div = document.createElement("span");
						$(div).attr("class", "ot-share-link-type");
						var box = document.createElement("input");
						$(box).attr("id", "ot-share-link-type-" + i);
						$(box).attr("type", "checkbox");
						$(box)
								.attr("class",
										"ot-checkbox ot-share-link-select");
						box.id = linkTypes[i].id;
						if (prefs["LINKED_ASSETS"] === "true"
								&& associationTypePrefArr
								&& associationTypePrefArr
										.indexOf(linkTypes[i].id) > -1) {
							// If linked assets checkbox is checked, then set
							// the link types marked as preferred.
							box.checked = true;
						}
						var label = document.createElement("label");
						$(label).attr("for", "ot-share-link-type-" + i);
						$(label).text(
								otui.TranslationManager
										.getTranslation(linkTypes[i].name));

						$(div).append(box);
						$(div).append(label);

						// linkOptions.append(div);
						$(newline).append(div);

						count++;
					}
				});
	};

	ShareView.fillJobTransformers = function(jobSelectBox, callback) {
		_jobTransformers = [];
		ShareManager
				.getExportJobTransformers(function(transformers) {
					for ( var i in transformers) {
						for ( var j in transformers[i].transformer_instances) {
							if (transformers[i].transformer_instances[j].id != "ARTESIA.TRANSFORMER.ZIP COMPRESSION.DEFAULT") {
								var jt = {
									'id' : transformers[i].transformer_instances[j].id,
									'name' : otui.TranslationManager
											.getTranslation(transformers[i].transformer_instances[j].name)
								};
								_jobTransformers.push(jt);
							} else {
								callback(ShareManager.defaultZipFileName);
							}
						}

					}
					ShareView.openJobTransformers(jobSelectBox);
				});
	};

	// /////////////////////////////////////////////////////
	// Event handlers
	// //////////////////////////////////////////////////

	exports.ShareView.showHideAssetRows = function(event) {
		// show\hide indivdual assets of the selected type
		var type = event.currentTarget.id;

		var typeCounts;

		for (var i = 0; i < ShareManager.typeCounts.length; i++) {
			if (ShareManager.typeCounts[i].key == type) {
				typeCounts = ShareManager.typeCounts[i];
				break;
			}
		}

		var div = $("#ot-table-rows-" + type);

		$(div[0].parentNode).toggle();
		$(event.currentTarget).toggleClass("ot-share-close-arrow");

		if (!div[0].firstOpen) {
			ShareView.createTableAssetRows(div[0], typeCounts);
		}
	}

	exports.ShareView.loadMoreAssets = function(event) {
		var type = event.currentTarget.asset_type;
		var typeCounts;

		for (var i = 0; i < ShareManager.typeCounts.length; i++) {
			if (ShareManager.typeCounts[i].key == type) {
				typeCounts = ShareManager.typeCounts[i];
				break;
			}
		}

		var div = $("#ot-table-rows-" + type);
		ShareView.createTableAssetRows(div[0], typeCounts);
	};

	exports.ShareView.onIncludeLinked = function(event) {
		if (event.currentTarget.checked) {
			// show the link options
			linkOptions.show();
		} else {
			linkOptions.hide();
		}
	};

	exports.ShareView.editChanged = function(event) {
		ShareManager.editFieldChanged(event.currentTarget);
	};

	exports.ShareView.termClicked = function(event) {
		termIsClicked = event.currentTarget.checked;

		if (ShareManager.numEmptyRequiredFields == 0) {
			var valid = true;
			if (ShareView.isSendViaHightail())
				valid = ShareView.checkAccessCodeComplexityFormat();

			ShareView.enableFinishButton((termIsClicked && valid));
		}

		else
			ShareView.enableFinishButton(false);
	};

	exports.ShareView.addFormat = function(event) {
		var view = otui.Views.containing(event.target);
		if (event.currentTarget.disabled == false) {
			var type = event.currentTarget.id;

			var split = type.split("-");
			if (split.length > 1)
				type = split[0];

			var typeCounts;

			for (var i = 0; i < ShareManager.typeCounts.length; i++) {
				if (ShareManager.typeCounts[i].key == type) {
					typeCounts = ShareManager.typeCounts[i];
					break;
				}
			}

			var formatCell = $("#ot-format-cell-" + event.currentTarget.id)[0];
			var format = ShareManager
					.getSelectedFormatFromFormatCell(formatCell);
			var argValues = [];
			var argEntries = [];
			var expFieldValues = $(
					otui.parent(event.target, '[class*="ot-table-row"]')).find(
					".ot-share-format-args").find('[id=ot-export-argument]');
			var expFieldNames = $(
					otui.parent(event.target, '[class*="ot-table-row"]')).find(
					".ot-share-format-args").find('label');

			expFieldValues
					.each(function(i, el) {
						var argumentEntry = {};
						var val = (el.value && el.value !== "undefined") ? el.value
								.trim()
								: null;
						var expInput = xtag.matchSelector(el, 'input') ? $(el)
								: $(el).find("input");

						argumentEntry["key"] = expFieldNames[i].textContent;
						argumentEntry["value"] = val;
						argumentEntry["displayValue"] = expInput.length > 0 ? expInput[0].value
								: ($(el).find("[ot-select-current-value]").length > 0 ? $(
										el).find("[ot-select-current-value]")[0].textContent
										: el.textContent);
						argEntries.push(argumentEntry);
						argValues.push(val);
					});

			if (formatCell.type === "grouped") {
				view.properties.exportFormats[format] = argValues;
			} else {
				view.properties.exportFormats[format
						+ "-"
						+ ShareManager.assetList[formatCell.asset_type][formatCell.index].asset_id] = argValues;
			}
			if (ShareView.addFormatIfAvailable(formatCell, format,
					formatCell.type === "grouped", argEntries)) {
				ShareView.adjustGroups(formatCell, "add", [ format ],
						argEntries);

				if (formatCell.type == "grouped") {
					ShareView.modifyCount(formatCell, format, typeCounts.value);
				}

				if (formatCell.modified != undefined) {
					formatCell.modified = true;
				}

				// if
				// (ShareManager.getAvailableTransformersFromFormatCell(formatCell).length
				// == 0)
				// {
				// $(event.currentTarget).attr('disabled', true);
				// $(event.currentTarget).find(".ot-add-format-button-image").attr('disabled',
				// true);
				// }
			}
		}
	};

	exports.ShareView.removeFormat = function(event) {
		var view = otui.Views.containing(event.target);
		var chicklet = event.target.parentElement;
		var formatCell = event.target.parentElement.parentElement;
		var format = chicklet.transformer_id;
		ShareView.removeFormatIfExisting(formatCell, format);

		var formatCell = $("#ot-format-cell-" + event.target.id)[0];
		if (formatCell.modified != undefined) {
			formatCell.modified = true;
		}

		if (formatCell.type === "grouped") {
			delete view.properties.exportFormats[format];
		} else
			delete view.properties.exportFormats[format
					+ "-"
					+ ShareManager.assetList[formatCell.asset_type][formatCell.index].asset_id];

		ShareView.adjustGroups(formatCell, "remove", [ format ]);

		// var viewObject = otui.main.getChildView(ShareView);
		// var viewContent = viewObject.contentArea();
		// var addFormatBtn = viewContent.find(".ot-add-format-button");
		var addFormatBtn = $("button[id=" + event.target.id + "]");

		// addFormatBtn.focus();

		// if
		// (ShareManager.getAvailableTransformersFromFormatCell(formatCell).length
		// > 0)
		// {
		// $(addFormatBtn).attr('disabled', false);
		// $(addFormatBtn).find(".ot-add-format-button-image").attr('disabled',
		// false);
		// }
	};

	exports.ShareView.finish = function(event) {
		var view = otui.Views.containing(event.target);
		if (!finishButton.attr('disabled')) {
			if (sendViaHightail) {

				var spaceName = $(".ot-share-activity-name").val();
				var spaceType = "share";

				this.properties = {
					hightail : {}
				};
				this.properties.hightail.spaceName = spaceName;
				this.properties.hightail.spaceType = spaceType;
				var self = this;

				HightailManager.createSpace(this, function(space) {

					if (space) {

						var spaceIdField = $("#htSpaceId");
						var spaceTypeField = $("#htSpaceType");

						spaceIdField.find("input")[0].value = space.id;
						spaceTypeField.find("input")[0].value = space.type;

						ShareManager.shareAssets(view);

						deliveryOptionsContent.hide();
						fileOptionsContent.hide();
						hightailLoginContent.hide();
						finishButton.hide();
						closeButton.hide();
						agreeTermsContent.hide();
						settingsButton.hide();
						settingsContent.hide();
						agreeTermsBox.hide();
						linkOptions.hide();
						assetSingleTable.hide();
						activityName.hide();

						if (otui.is(otui.modes.PHONE)) {
							var optionsPane = $("#shareOptionsPane");
							optionsPane.hide();
						}

						cancelButton[0].innerText = otui.tr("Close");
						cancelButton.attr("display", "inline-block");
						cancelButton.show();

						var spaceCreated = $(".ot-hightail-space-created");
						var urlTextArea = $(".ot-hightail-space-created-url");
						urlTextArea[0].value = space.url;

						hightailShareConfirmation.show();
					}
				}, function() {

				});
			} else if (isQuickDownload) {
				ShareView.downloadAssets(event);
			} else {
				ShareManager.shareAssets(view);
				otui.DialogUtils.cancelDialog(event.target, true);
			}
		}
	};

	exports.ShareView.downloadAssets = function downloadAssets(event) {
		var downloadCriteria = {};
		var view = otui.Views.containing(event.target);
		var data = ShareView.createDownloadPrefData(view);
		var prefVals = data[0].values;

		downloadCriteria['type'] = (prefVals.indexOf("original_files") > -1) ? "original"
				: "preview";
		downloadCriteria['delivery'] = (prefVals.indexOf("individual_files") > -1) ? "individual"
				: "zipped";
		downloadCriteria['mailNotify'] = (prefVals
				.indexOf("send_email_notification") > -1) ? true : false;
		view.storedProperty("downloadOption", downloadCriteria);
		otui.DialogUtils.cancelDialog(event.target, true);
	};

	exports.ShareView.setDefaultDownloadPref = function setDefaultDownloadPref(
			event) {
		var view = otui.Views.containing(event.target);
		var data = ShareView.createDownloadPrefData(view);
		view.blockContent();
		ShareView.saveDownloadPreferences(data, true);
		view.unblockContent();
	};

	exports.ShareView.createDownloadPrefData = function createDownloadPrefData(
			view) {
		var contentArea = view.contentArea();
		var downloadOneFile = contentArea.find("#ot-download-one-file")[0];
		var downloadZipFile = contentArea.find("#ot-download-zip-file")[0];
		var downloadFormat = downloadOneFile.checked ? downloadOneFile.value
				: downloadZipFile.value;

		var downloadLowRes = contentArea.find("#ot-download-lowres")[0];
		var downloadOptions = downloadLowRes.value;
		var emailNotification = contentArea.find(".ot-download-email-notify");
		var prefVals = [];
		prefVals.push(downloadFormat);
		prefVals.push(downloadOptions);
		if (emailNotification[0].checked)
			prefVals.push("send_email_notification");

		return [ {
			'values' : prefVals
		} ];
	};

	exports.ShareView.saveDownloadPreferences = function saveDownloadPreferences(
			data, showBanner) {
		otui.PreferencesManager
				.setPreferenceById(
						"ARTESIA.PREFERENCE.DOWNLOAD",
						data,
						function(response) {
							response = response || {};
							var userPrefResource = response.user_preference_resource
									|| {};
							if (userPrefResource.preference_data[0]) {
								if (showBanner) {
									otui.NotificationManager.showNotification({
										'message' : otui
												.tr("Saved to Preferences."),
										'stayOpen' : false,
										'status' : 'ok'
									});
								}
							} else {
								otui.NotificationManager
										.showNotification({
											'message' : otui
													.tr("Unable to save your settings, but you can continue to export/download assets."),
											'stayOpen' : true,
											'status' : 'error'
										});
							}
						});
	};

	ShareView.checkAccessCodeComplexityFormat = function(event) {
		var accessCodeField = deliveryOptionsContent
				.find("input[name='otHightailAccessCode']");
		var accessCodeFieldBlurred = (event && event.type && event.type == "blur");
		if (accessCodeField && accessCodeField[0]) {
			return HightailView.checkAndUpdateAccessCodeComplexityFormat(
					deliveryOptionsContent, accessCodeField[0].value,
					accessCodeFieldBlurred);
		} else
			return true;
	};

	ShareView.signInToHightail = function(event) {
		ShareView.enableFinishButton(false);
		HightailManager.createLoginPopup(function() {
			var view = otui.Views.containing(event.target);
			view.internalProperty("hightailValidToken", undefined);
			ShareView.shareOptionsChanged(event);
		});
	};

	exports.ShareView.isSendViaHightail = function() {
		return sendViaHightail;
	};

	exports.ShareView.isFtpNotifyChecked = function(event) {
		value = false;
		var notifyCheckbox = $("#ot-share-ftp-notify");
		if (notifyCheckbox && notifyCheckbox[0] && notifyCheckbox[0].checked)
			value = true;
		return value;
	};

	exports.ShareView.isFtpGroup = function(event) {
		var optionsPane = $("#shareOptionsPane");
		var currentValue = optionsPane[0].getAttribute("value");
		if (currentValue == _shareFtpGroupOption.id)
			return true;

		return false;
	};

	exports.ShareView.enableFinishButton = function(enable, ignoreTerms) {
		var termsCheckbox = $("#ot-agree-terms-box") ? $("#ot-agree-terms-box")[0]
				: undefined;
		var isTermsClicked = termsCheckbox ? termsCheckbox.checked : false;
		var enableFinish = ignoreTerms ? enable : (enable && isTermsClicked);
		finishButton.attr('disabled', !enableFinish);
	};

	exports.ShareView.shareContentsChanged = function(event) {
		var view = otui.Views.containing(event.currentTarget);
		var contentArea = view.contentArea();
		var metadatadataFormatWrapper = contentArea
				.find(".ot-share-settings-block-metadataformat");
		if (event.currentTarget.value === "1") {
			metadatadataFormatWrapper.hide();
		} else {
			metadatadataFormatWrapper.show();
		}
	};

	exports.ShareView.pageGroups = function(event, delta) {
		var newPage = ShareView.groupsCurrentPage + delta;

		if (newPage >= 0 && newPage < ShareView.groupsTotalPages) {
			var view = otui.Views.containing(event.target);
			var contentArea = view.contentArea();

			contentArea.find('#ot-share-asset-types').css("transform",
					"translateX(-" + (100 * newPage) + "%)");

			ShareView.groupsCurrentPage = newPage;
			ShareView.currentGroupAssetsPage = 0;

			contentArea.find(".ot-share-group-paging").text(
					otui.tr("{0} of {1}", ShareView.groupsCurrentPage + 1,
							ShareView.groupsTotalPages));
		}
	};

	exports.ShareView.pageGroupAssets = function(event, delta) {
		var newPage = ShareView.groupAssetsPageInfo[ShareView.groupsCurrentPage].currentPage
				+ delta;

		if (newPage >= 0
				&& newPage < ShareView.groupAssetsPageInfo[ShareView.groupsCurrentPage].totalPages) {
			var assetsContainer = $(otui.parent(event.target,
					"[id^='ot-table-rows-']"));
			assetsContainer.css("transform", "translateX(-" + (100 * newPage)
					+ "%)");

			ShareView.groupAssetsPageInfo[ShareView.groupsCurrentPage].currentPage = newPage;

			assetsContainer
					.find(".ot-share-group-assets-paging")
					.text(
							otui
									.tr(
											"{0} of {1}",
											newPage + 1,
											ShareView.groupAssetsPageInfo[ShareView.groupsCurrentPage].totalPages));
		}
	};

	exports.ShareView.formatOptionChanged = function(event) {
		var selectedFormatID = event.target.value;
		var selectedExportTransformer;
		var transformerInstanceValues;
		var rowEl = otui.parent(event.target, '[class*="ot-table-row"]');
		var contentType = $(rowEl).find(".ot-share-table-result-format")[0].id
				.split("ot-format-cell-").pop();
		var formatArgsEl = $(rowEl).find(".ot-share-format-args");
		formatArgsEl.empty();

		for ( var i in ShareManager.exportTransformers) {
			for ( var j in ShareManager.exportTransformers[i].transformer_instances) {
				if (ShareManager.exportTransformers[i].transformer_instances[j].id == selectedFormatID) {
					selectedExportTransformer = ShareManager.exportTransformers[i];
					transformerInstanceValues = selectedExportTransformer.transformer_instances[i];
					break;
				}
			}
		}

		if (selectedExportTransformer) {
			for ( var index in selectedExportTransformer.transformer_info.arguments) {
				var name = selectedExportTransformer.transformer_info.arguments[index].name;
				var maxLength = selectedExportTransformer.transformer_info.arguments[index].maximum_length;
				var argumentNum = selectedExportTransformer.transformer_info.arguments[index].argument_number;
				var argumentOption = selectedExportTransformer.transformer_info.arguments[index].argument_option;
				var defaultVal;
				// Check if transformer instance has a default value, it takes
				// precedence over
				// transformer argument values.
				if (transformerInstanceValues) {
					defaultVal = transformerInstanceValues.attribute_values[index].value;
				}
				if (!defaultVal) {
					defaultVal = selectedExportTransformer.transformer_info.arguments[index].default_value;
				}

				if (selectedExportTransformer.transformer_info.arguments[index].display.name == "EDITABLE") {
					var div = document.createElement("div");
					$(div).attr("class", "ot-export-field");
					var editLabel = document.createElement("label");

					var optionType = selectedExportTransformer.transformer_info.arguments[index].option_type.name;
					var editDefaultValue = selectedExportTransformer.transformer_info.arguments[index].default_value;
					var editInput;

					if (optionType === "TEXT STRING") {
						editInput = document.createElement("input");

					} else if (optionType === "PASSWORD") {
						editInput = document.createElement("input");
						editInput.setAttribute("type", "password");
					} else if (optionType === "EMAIL ADDRESS"
							|| optionType === "EMAIL ADDRESS LIST") {
						editInput = document.createElement("ot-email");
						editInput.setAttribute("type", "email");
					} else if (optionType === "SELECT LIST"
							&& selectedExportTransformer.transformer_info.arguments[index].values
							&& selectedExportTransformer.transformer_info.arguments[index].values.length) {
						editInput = document.createElement("ot-select");
						editInput.setAttribute("class", "ot-share-select");
						var instanceValues = [];

						if (selectedExportTransformer.transformer_instances.length > 0
								&& selectedExportTransformer.transformer_instances[0].attribute_values.length > 0) {
							for (var k = 0; k < selectedExportTransformer.transformer_instances[0].attribute_values.length; k++) {
								instanceValues[selectedExportTransformer.transformer_instances[0].attribute_values[k].argument_number] = selectedExportTransformer.transformer_instances[0].attribute_values[k].value;
							}
						}

						var attr_def_value = selectedExportTransformer.transformer_info.arguments[index].default_value;
						for (var j = 0; j < selectedExportTransformer.transformer_info.arguments[index].values.length; j++) {
							var optionItem = document.createElement("option");
							optionItem.textContent = otui.TranslationManager
									.getTranslation(selectedExportTransformer.transformer_info.arguments[index].values[j].name);
							optionItem.value = selectedExportTransformer.transformer_info.arguments[index].values[j].value;
							editInput.appendChild(optionItem);
							var attr_inst_value = instanceValues[selectedExportTransformer.transformer_info.arguments[index].argument_number];
							if (attr_inst_value) {
								if (attr_inst_value === selectedExportTransformer.transformer_info.arguments[index].values[j].value) {
									editInput.value = selectedExportTransformer.transformer_info.arguments[index].values[j].value;
									attr_def_value = undefined;
								} else if (attr_def_value === selectedExportTransformer.transformer_info.arguments[index].values[j].value) {
									// set default arg value
									editInput.value = selectedExportTransformer.transformer_info.arguments[index].values[j].value;
								}
							} else if (attr_def_value === selectedExportTransformer.transformer_info.arguments[index].values[j].value) {
								// set default arg value
								editInput.value = selectedExportTransformer.transformer_info.arguments[index].values[j].value;
							}
						}
					} else if (optionType === "SELECT LIST"
							&& !selectedExportTransformer.transformer_info.arguments[index].values) {
						editInput = document.createElement("ot-select");
						editInput.setAttribute("class", "ot-share-select");
						var optionItem = document.createElement("option");
						optionItem.textContent = "";
						optionItem.value = "";
						editInput.appendChild(optionItem);
					} else {
						editInput = document.createElement("textarea");
						xtag.addClass(editInput, "ot-text-input");
					}

					editInput.argumentNum = argumentNum;
					editInput.setAttribute("id", "ot-export-argument");

					if (optionType != "SELECT LIST") {
						editInput.setAttribute("maxlength", maxLength);

						editInput.rows = maxLength / 500;
						if (transformerInstanceValues
								&& transformerInstanceValues.attribute_values[index].value) {
							if (optionType === "EMAIL ADDRESS"
									|| optionType === "EMAIL ADDRESS LIST") {

							} else {
								editInput.textContent = otui.TranslationManager
										.getTranslation(transformerInstanceValues.attribute_values[index].value);
								editInput.value = otui.TranslationManager
										.getTranslation(transformerInstanceValues.attribute_values[index].value);
								editInput.hasValue = true;
							}
						} else if (selectedExportTransformer.transformer_info.arguments[index].default_value) {
							editInput.textContent = otui.TranslationManager
									.getTranslation(selectedExportTransformer.transformer_info.arguments[index].default_value);
							editInput.value = otui.TranslationManager
									.getTranslation(selectedExportTransformer.transformer_info.arguments[index].default_value);
							editInput.hasValue = true;
						} else
							editInput.hasValue = false;
					}

					editLabel.textContent = otui.TranslationManager
							.getTranslation(name);
					formatArgsEl.append(div);
					$(div).append(editLabel);
					$(div).append(editInput);

					if ((optionType === "EMAIL ADDRESS" || optionType === "EMAIL ADDRESS LIST")
							&& defaultVal) {
						var tmpEmail = defaultVal.trim();
						if (tmpEmail.split(";").length > 0) {
							var tmpEmailArray = tmpEmail.split(";");
							tmpEmailArray.map(function(email) {
								setDefaultInputValue(editInput, email.trim());
							});
						} else {
							setDefaultInputValue(editInput, tmpEmail);
						}
					}
				} else if (selectedExportTransformer.transformer_info.arguments[index].display.name === "READONLY") {
					var div = document.createElement("div");
					$(div).attr("class", "ot-export-field");
					var readFieldLabel = document.createElement("label");
					readFieldLabel.textContent = otui.TranslationManager
							.getTranslation(name);
					var readFieldValue = document.createElement("span");
					$(readFieldValue).attr("id", "ot-export-argument");
					if (transformerInstanceValues
							&& transformerInstanceValues.attribute_values[index].value) {
						readFieldValue.textContent = otui.TranslationManager
								.getTranslation(transformerInstanceValues.attribute_values[index].value);
						readFieldValue.value = otui.TranslationManager
								.getTranslation(transformerInstanceValues.attribute_values[index].value);
					} else if (selectedExportTransformer.transformer_info.arguments[index].default_value) {
						readFieldValue.textContent = otui.TranslationManager
								.getTranslation(selectedExportTransformer.transformer_info.arguments[index].default_value);
						readFieldValue.value = otui.TranslationManager
								.getTranslation(selectedExportTransformer.transformer_info.arguments[index].default_value);
					}
					$(div).append(readFieldLabel);
					$(div).append(readFieldValue);
					formatArgsEl.append(div);
				}
			}
		}
		if (formatArgsEl.find("[id='ot-export-argument']").length > 0) {
			$(rowEl).css("flex-wrap", "wrap");
			$(rowEl).find('button[id=' + contentType + ']').hide();
			var addFormatCell = otui.Templates.get("ot-format-add-button");
			addFormatCell.querySelector("button").setAttribute("id",
					contentType);
			formatArgsEl.append(addFormatCell);
			rowEl.scrollIntoView();
		} else {
			$(rowEl).css("flex-wrap", "");
			$(rowEl).find('button[id=' + contentType + ']').show();
		}
	};

	exports.ShareView.allFormatsSelected = function() {
		var formatsSelected = ShareManager.typeCounts.length > 0;
		for ( var index in ShareManager.typeCounts) {
			var isSelected = $("*[id*=ot-format-"
					+ ShareManager.typeCounts[index].key + "]").length > 0;
			formatsSelected = formatsSelected
					&& ($("*[id*=ot-format-"
							+ ShareManager.typeCounts[index].key + "]").length > 0);
		}
		return formatsSelected;
	}
})(window);
