(function(otui) {
	function openRSAsset(event, resource) {
		var renditionObject = resource.rendition_content.preview_content;

		if (resource) {
			event.stopPropagation();
			
			var hiddenIFrameID = 'hiddenDownloader';
			if(jQuery('#'+hiddenIFrameID).length === 0) {
				jQuery("body").append(document.createElement('iframe'));
				jQuery("iframe").attr({
					id:hiddenIFrameID,
					style : "display:none"
				});
			}
			jQuery('#'+hiddenIFrameID).attr({
				src :otui.service + "/assetsGT/" + resource.asset_id + "/quickdownload"
			});
		}
	}

	function setupOpenRSAsset(event, resource) {
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isDownloadable = otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD") && otui.services.asset.getDownloadContentPermission(permissionsMap);
		return (resource.content_type == "BITMAP"  && (resource.rendition_content || resource.rendition_content.preview_content) && !isFolder && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED" && isDownloadable && resource.content_sub_type != "CLIP" && !AssetManager.isUser(resource));
	}

	otui.ready(function() {
		var entry = {
			'name' : 'openRSAsset',
			'text' : 'Quick Download',
			'img' : 'cs_gt_quickdownload/img/quickdownload.png',
			'select' : openRSAsset,
			'setup' : setupOpenRSAsset
	};

	otui.GalleryAssetActions.register(entry,0);
	otui.InspectorAssetActions.register(entry,0);
	
        otui.GalleryAssetActions.remove('download');
        otui.GalleryViewActions.remove('download');
        otui.InspectorAssetActions.remove('download');

        // 9/24/15 CChan - remove additional asset menu items
        otui.GalleryAssetActions.remove('downloadpreview');
        //otui.GalleryAssetActions.remove('setasfolderthumbnail');
        //otui.GalleryAssetActions.remove('foldertemplates');

});
})(otui);

