(function(otui) {
	function quickDownload(event, resource, options) {
		var renditionObject = resource.rendition_content.preview_content;

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
			jQuery('#' + hiddenIFrameID).attr(
					{
						src : otui.service + "/assetsGT/" + resource.asset_id
								+ "/quickdownload"
					});
		}
	}

	function setupGettyDownload(event, resource) {
		if (!resource)
			return false;
		
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var isAssetRequestFolder = false

		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry
				|| {};
				
		var isDownloadable = otui.UserFETManager
				.isTokenAvailable("ASSET.DOWNLOAD")
				&& otui.services.asset
						.getDownloadContentPermission(permissionsMap);
		
		if(isFolder)
			isAssetRequestFolder= (resource.container_type_id == 'GTRUST.FOLDER.ASSET REQUEST')
			
		if(isAssetRequestFolder)
			return (GalleryActions.actionAllowedInView()
					&& isAssetRequestFolder
					&& !resource.deleted && resource.content_state !== "SEL_DEL"
					&& resource.content_state !== "DELETED" && isDownloadable
					&& resource.content_sub_type != "CLIP" && !AssetManager
					.isUser(resource));
		else
			return (GalleryActions.actionAllowedInView()
					&& !isFolder
					&& !resource.deleted && resource.content_state !== "SEL_DEL"
					&& resource.content_state !== "DELETED" && isDownloadable
					&& resource.content_sub_type != "CLIP" && !AssetManager
					.isUser(resource));
	}

	otui.GalleryAssetActions.remove('download');
	otui.InspectorAssetActions.remove('download');

	otui.GalleryAssetActions.remove('downloadpreview');
	otui.InspectorAssetActions.remove('downloadpreview');

	otui.GalleryAssetActions.remove('downloadcustom');
	otui.InspectorAssetActions.remove('downloadcustom');

	otui.ready(function() {
		var entry = {
			'name' : 'gtdownloadcustom',
			'text' : otui.tr('Download custom'),
			'img' : {
				desktop : './style/img/action_download_custom24.svg',
				tablet : './style/img/download_custom.png',
				phone : './style/img/download_custom.png'
			},
			'setup' : setupGettyDownload,
			'select' : AssetActions.downloadViaShareDialog
		};

		otui.GalleryAssetActions.register(entry, 0);
		otui.InspectorAssetActions.register(entry, 0);

	});
})(otui);
