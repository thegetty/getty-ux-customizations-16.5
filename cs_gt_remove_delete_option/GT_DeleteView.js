(function(exports)
{
	/**
	 * TODO Properties need documenting for the delete view
	 * @class DeleteView
	 * @mixes Views.asView
	 * @mixes Views.asViewModule
	 * @mixes Views.asRoutable
	 * @mixes withContent
	 * @constructor
	 * @param {DeleteView} props Properties for this view.
	 * @classdesc
	 * 
	 */
	
	DeleteView.updateFolderNote = function(event)
	{
		if (!deleteSubfoldersBox.checked || !deleteAssetsBox.checked)
		{
			$("#ot-folder-delete-note").show();
		}
		else
		{
			$("#ot-folder-delete-note").hide();
		}
	};
	
	DeleteView.setDefaults = function(event)
	{
		var options = [];
		if (deleteVersionsBox.checked) options.push('ALLVERSIONS');
		if (deleteOnlyContentBox.checked) options.push('ONLYCONTENT');
		if (deleteSubfoldersBox.checked) options.push('SUBFOLDERS');
		if (deleteAssetsBox.checked) options.push('CONTAINEDASSETS');
		var data = [{'values': options}];
		
		otui.PreferencesManager.setPreferenceById('deleteOptions', data, function(response){
			if (response.user_preference_resource.preference_data[0])
			{
				otui.NotificationManager.showNotification(
				{
					'message' : otui.tr("Defaults set."), 
					'stayOpen': false,
					'status' : 'ok' 
				});
			}
			else
			{
				otui.NotificationManager.showNotification(
				{
					'message' : otui.tr("Defaults failed to be set."), 
					'stayOpen': true,
					'status' : 'error' 
				});
			}
		});
	};
	
	DeleteView.help = function(event)
	{
		
	};
	
	DeleteView.show = function(data, options)
	{
		options.confirmClose = false; 
		DeleteView.prototype.dialogProperties = DeleteView.prototype.dialogProperties || {};
		if(options.initialiseCallback)
			DeleteView.prototype.dialogProperties.initialiseCallback = options.initialiseCallback;
		else
		{
			options.initialiseCallback = function (dialog){
					return function (dialog)
					{
						var viewObject = otui.Views.containing(dialog);
						if (viewObject)
						{
							viewObject.properties.dialogProperties = {};
							viewObject.properties.dialogProperties.save = options.save;
							viewObject.properties.dialogProperties.showOnlyAssets = options.showOnlyAssets;
							viewObject.properties.dialogProperties.showOnlyFolder = options.showOnlyFolder;
							viewObject.properties.dialogProperties.fetchRepresentation = options.fetchRepresentation;
							viewObject.setTitle(options.title);
						}
						if(otui.is(otui.modes.DESKTOP))
						$(".ot-delete-footer-layout")[0].recalculate();
						dialog.find("#ot-delete-versions-box").focus();
						if(data && data.savedValues)
						{
							if(data.savedValues.allVersions)
								deleteVersionsBox.checked = true;
							if(data.savedValues.onlyContent)
								deleteOnlyContentBox.checked = true;
							if(data.savedValues.subfolders)
								deleteSubfoldersBox.checked = true;
							if(data.savedValues.containedAssets)
								deleteAssetsBox.checked = true;
						}
						var content = viewObject.contentArea();
						content.find(".ot-delete-message").hide();
						
						if (!options.showOnlyAssets){
							content.find("#ot-asset-delete-options").hide();
						}
						else if(!options.showOnlyFolder){
							content.find("#ot-folder-delete-options").hide();
						}

					};
				};
		}
		if(options.closeCallback)
			DeleteView.prototype.dialogProperties.closeCallback = options.closeCallback;
		DeleteView.prototype.dialogProperties.hideDefaults = options.hideDefaults;
		DeleteView.prototype.dialogProperties.save = options.save;
		otui.dialog("deletedialog", options);
		
	};
	
	
	DeleteView.prepareForDelete = function(event)
	{
		var allVersions = deleteVersionsBox.checked;
		var onlyContent = deleteOnlyContentBox.checked;
		var subfolders = deleteSubfoldersBox.checked;
		var containedAssets = deleteAssetsBox.checked;
		var deleteDialogView =  otui.Views.containing(event.target);
		var preventDefaultRefresh = deleteDialogView.properties.preventDefaultRefresh;
		
		var dialogOptions = {
			"allVersions" : allVersions,
			"onlyContent" : onlyContent,
			"subfolders" : subfolders,
			"containedAssets" : containedAssets,
			"preventDefaultRefresh" : preventDefaultRefresh
		}
		var dialogElement = event.target;
		if(deleteDialogView.properties.dialogProperties.fetchRepresentation)
		{
			var childrenOption = "APPLY_ONLY_TO_THIS_CONTAINER";
			if (subfolders && !containedAssets) childrenOption = "APPLY_ONLY_TO_DESCENDANT_CONTAINERS";
			else if (!subfolders && containedAssets) childrenOption = "APPLY_ONLY_TO_DESCENDANT_ASSETS";
			else if (subfolders && containedAssets) childrenOption = "APPLY_TO_ALL_DESCENDANTS";
			
			var dialogProps = {"asset_state_options_param":{"asset_state_options":{"type": "com.artesia.asset.DeleteAssetOptions", "apply_to_all_versions":allVersions,"delete_only_content":onlyContent,"hierarchical_processing_options":childrenOption}}};
			dialogProps.savedValues = dialogOptions;
			dialogOptions = dialogProps;
		}
		if(deleteDialogView.properties.dialogProperties.save.handler)
			deleteDialogView.properties.dialogProperties.save.handler.call(this, dialogElement, dialogOptions);
			
	}
	
	DeleteView.executeDelete = function(dialogElement , dialogProps)
	{
		var viewObj = otui.Views.containing(dialogElement);
		otui.DialogUtils.cancelDialog(dialogElement, true);
		
		AssetManager.deleteAssets(dialogProps.allVersions, dialogProps.onlyContent, dialogProps.subfolders, dialogProps.containedAssets, dialogProps.preventDefaultRefresh, function(response, success)
		{
			var successList = [];
			var failList = [];
			// The property isDeleteSuccess is used for reload the view after delete action completed successfully. 
			viewObj.storedProperty("isDeleteSuccess", success);
			if (success)
			{
				successList = response.bulk_asset_result_representation.bulk_asset_result.successful_object_list;
				
				FolderManager.updateFolderDeleteStatus(successList, true);
				
				failList = response.bulk_asset_result_representation.bulk_asset_result.failed_object_list;
			}
			
			// output a notification to the user
			if (success)
			{
				var dialogView = viewObj;
				var actionView = dialogView.internalProperties.actionView;
				actionView.reload();
				var numSucceeded = successList ? successList.length : 0;
				var numFailed = failList ? failList.length : 0;
				var message = [];
				var status = 'ok';
				
				if (numSucceeded)
    			{
    				message.push(otui.trn('Deleted {0} item.', 'Deleted {0} items.', numSucceeded, numSucceeded));
    			}
    			if (numFailed)
    			{
    				if (numSucceeded == 0)
    				{
    					status = 'error';
    					message.push(otui.tr('No selected items could be deleted.'));
    				}
    				else
    				{
    					if(numSucceeded)
    						status = 'partialok';
    					else
    						status = 'warning';
    					message.push(otui.trn('{0} item could not be deleted.', '{0} items could not be deleted.', numFailed, numFailed));
    				}
				}
    			
    			otui.NotificationManager.showNotification(
				{
					'message' : message.join(" "), 
					'stayOpen': (status == 'error'),
					'parseHTML' : true,
					'status' : status 
				});
			}
			else
			{
				var errorMsg = otui.tr('No selected items could be deleted.');
				var errorNotification = {'message' : errorMsg, 'stayOpen': true, 'status' : 'error' };
				otui.NotificationManager.showNotification(errorNotification);
			}
		});
	};
	
	/**
	 * Provide a default value for a mandatory NAMED_VIEW
	 */
	DeleteView.getDefault = function () {
		var defaultObj = {
			"asset_state_options_param": {
				"asset_state_options": {
					"type": "com.artesia.asset.DeleteAssetOptions",
					"apply_to_all_versions": false,
					"delete_only_content": false,
					"hierarchical_processing_options": "APPLY_ONLY_TO_THIS_CONTAINER"
				}
			},
			"savedValues": {
				"allVersions": false,
				"onlyContent": false,
				"subfolders": false,
				"containedAssets": false
			}
		};

		return defaultObj;
	};
	
})(window);
