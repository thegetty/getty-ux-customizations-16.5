(function(exports) {

	otui.ready(function() {

		var serviceUrl = UsrGrpConstants.USER_GRP_ID_ENDPOINT
				+ UserDetailsManager.getUserDetails().user_id;
		otui.get(serviceUrl, undefined, otui.contentTypes.json, function(
				response) {
			UsrGrpConstants.userGroups = response;
		}, true);

		if (otui.UserFETManager
				.isTokenAvailable(AssetRequestConstants.ASSET_REQUEST_CREATE_FET)) {
			otui.Menus.register({
				'name' : 'createassetrequest',
				'title' : otui.tr("Create Asset Request"),
				'menuimagehover' : "Create Asset Request",
				'select' : AssetRequestViewDialog.show
			});
		}
	}, true);

	AssetRequestViewDialog = {}

	AssetRequestViewDialog.show = function show(event) {
		console.log("new folder view gt show")
		event.stopPropagation();

		AssetRequestViewDialog.calledFromRibbon = true;
		var view = otui.Views.containing(event.currentTarget);
		var foldersList = view.properties.breadcrumb;
		if (!foldersList)
			foldersList = {
				'names' : [],
				'ids' : []
			};
		else
			foldersList = jQuery.extend(true, {}, foldersList);

		var dialogProp = {
			"data" : {
				"targetFolder" : view.properties.breadcrumb
			},
			"options" : {
				'save' : {
					handler : function(dialog, folderProp) {
						NewFolderDialogView.saveHandler(dialog, folderProp);
					}
				}
			}
		}

		var options = {
			'viewProperties' : {
				'NewFolderDialogView' : {
					"newFolderBreadcrumb" : foldersList,
					"dialogProp" : dialogProp
				}
			},
			'dialogclass' : "ot-new-folder-dialog"
		};

		otui.dialog("newfolderdialog", options);

	};

})(window);
