(function(otui) {
	
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

		if (isFolder)
			isAssetRequestFolder = (resource.container_type_id == 'GTRUST.FOLDER.ASSET REQUEST')

		if (isAssetRequestFolder)
			return (GalleryActions.actionAllowedInView()
					&& isAssetRequestFolder && !resource.deleted
					&& resource.content_state !== "SEL_DEL"
					&& resource.content_state !== "DELETED" && isDownloadable
					&& resource.content_sub_type != "CLIP" && !AssetManager
					.isUser(resource));
		else
			return (GalleryActions.actionAllowedInView() && !isFolder
					&& !resource.deleted
					&& resource.content_state !== "SEL_DEL"
					&& resource.content_state !== "DELETED" && isDownloadable
					&& resource.content_sub_type != "CLIP" && !AssetManager
					.isUser(resource));
	}

	otui.GalleryAssetActions.remove('downloadpreview');
	otui.InspectorAssetActions.remove('downloadpreview');

	otui.ready(function() {
		otui.GalleryAssetActions.modify("downloadcustom", {'text':'Download','setup':setupGettyDownload,'select':AssetActions.downloadViaShareDialog});
		otui.InspectorAssetActions.modify("downloadcustom", {'text':'Download', 'setup':setupGettyDownload,'select':AssetActions.downloadViaShareDialog});
	});
})(otui);
