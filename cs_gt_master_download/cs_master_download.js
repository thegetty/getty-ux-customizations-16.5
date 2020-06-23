(function(otui) {
	function downloadOriginal(event, resource) {
		if (resource) {
			event.stopPropagation();

			var hiddenIFrameID = 'hiddenDownloader';
			if (jQuery('#' + hiddenIFrameID).length === 0) {
				jQuery("body").append(document.createElement('iframe'));
				jQuery("iframe").attr({
					id : hiddenIFrameID,
					style : "display:none"
				});
			}
			jQuery('#' + hiddenIFrameID).attr({
				src : otui.service + "/assets/" + resource.asset_id + "/contents?disposition=attachment"
			});
		}
	}
	
	function isDownloadable(usergroups){
		is_Downloadable = false;
		usergroups
			.forEach(function(usergroup) {
			if (usergroup === 'GRI - Digital Services'
					|| usergroup === 'Museum - Imaging Services') {
				is_Downloadable = true
			}
		});
		return is_Downloadable;
	}

	function setupDownloadOriginal(event, resource) {
		if (!resource)
			return false;
		var is_downloadable = GtUserGroupManager.getUserGroups(isDownloadable)
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var show = is_downloadable && 
			   !isFolder && 
			   !resource.deleted && 
			   resource.content_state !== "SEL_DEL" && 
			   resource.content_state !== "DELETED" &&
			   resource.content_type == "BITMAP"
		if (show){ 
			var text = " (" + otui.FileUploadManager.createDisplayFileSize(resource.master_content_info.content_size) + ")";
			this.title += text;
		}
		return show
	}

	otui.GalleryAssetActions.remove('download');
	otui.InspectorAssetActions.remove('download');

	otui.GalleryAssetActions.remove('downloadpreview');
	otui.InspectorAssetActions.remove('downloadpreview');

	otui.GalleryAssetActions.remove('downloadcustom');
	otui.InspectorAssetActions.remove('downloadcustom');
	
	otui.ready(function() {
		var entry = {
			'name' : 'download',
			'text' : 'Download Original' ,
			'img' : {
				desktop: './style/img/dowload_original24.svg',
				tablet: './style/img/dowload_original24.svg',
				phone: './style/img/dowload_original24.svg'
			},
			'select' : downloadOriginal,
			'setup' : setupDownloadOriginal
		};

		otui.GalleryAssetActions.register(entry, 1);
		otui.InspectorAssetActions.register(entry, 1);
	});
})(otui);
