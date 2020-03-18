otui.scope("$events", function($events)
{
	var AssetActions = window.AssetActions = function AssetActions(){};

	AssetActions.isLockedOrDeleted = function (resource) {

		return (resource.locked || resource.deleted || resource.content_state === "SEL_DEL" || resource.content_state === "DELETED");
	}

	AssetActions.hasOrphanContext = function(view)
	{
		var breadcrumbIds = (((view || {}).properties || {}).breadcrumb || {}).ids;
		var myOrphansID = UserDetailsManager.getUserDetails().user_id + "Y";
		if(breadcrumbIds && (breadcrumbIds.indexOf("ARTESIA.PUBLIC.TREEY") > -1 || breadcrumbIds.indexOf(myOrphansID) > -1))
		{
			return true;
		}
		else return false;
	};

	AssetActions.isEditable = function(resource)
	{
		if (!resource) return false;

		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var permissionsMap = {};
		permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isEditable;
		if (isFolder) isEditable = otui.UserFETManager.isTokenAvailable("FOLDER.EDIT_PROPERTIES.SINGLE") && otui.services.asset.getMetadataEditPermission(permissionsMap);
		else isEditable = otui.UserFETManager.isTokenAvailable("ASSET.EDIT_PROPERTIES.SINGLE") && otui.services.asset.getMetadataEditPermission(permissionsMap);

		return (isEditable && !resource.locked && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED");
	};

	AssetActions.setupDownload = function(event, resource, point)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isDownloadable = otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD") && otui.services.asset.getDownloadContentPermission(permissionsMap);
		var show = (GalleryActions.actionAllowedInView() && resource.content_type !== "NONE"  && !isFolder && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED" && isDownloadable && resource.content_sub_type != "CLIP" && !AssetManager.isUser(resource));
		if (show)
		{ 
			var text = " (" + otui.FileUploadManager.createDisplayFileSize(resource.master_content_info.content_size) + ")";
			this.title += text;
		}
		return show;
	};
	
	AssetActions.getPreviewInfo = function(resource)
	{
		var previewInfo = {};
		previewInfo.size = 0;
		
		if (resource.rendition_content)
		{
			var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
			var allowPreview = otui.services.asset.getPreviewViewPermission(permissionsMap);
			
			if (allowPreview && resource.rendition_content.pdf_preview_content && resource.rendition_content.pdf_preview_content.content_kind != "MASTER")
			{
				previewInfo.size = resource.rendition_content.pdf_preview_content.content_size;
				previewInfo.url = resource.rendition_content.pdf_preview_content.url;
			}
			else if (allowPreview && resource.rendition_content.preview_content && resource.rendition_content.preview_content.content_kind != "MASTER")
			{
				previewInfo.size = resource.rendition_content.preview_content.content_size;
				previewInfo.url = resource.rendition_content.preview_content.url;
			}
			else if (resource.rendition_content.thumbnail_content)
			{
				previewInfo.size = resource.rendition_content.thumbnail_content.content_size;
				previewInfo.url = resource.rendition_content.thumbnail_content.url;
			}
		}
		
		return previewInfo;
	};
	
	AssetActions.setupDownloadPreview = function(event, resource, point, object, editPreview)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var allowThumb = otui.services.asset.getPreviewViewPermission(permissionsMap);
		var isDownloadable = otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD_PREVIEW") && (allowThumb || otui.services.asset.getDownloadContentPermission(permissionsMap));
		var previewInfo = AssetActions.getPreviewInfo(resource);
		
		var show = (GalleryActions.actionAllowedInView() && isDownloadable && (previewInfo.size > 0) && resource.content_type !== "NONE"  && !isFolder && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED" && resource.content_sub_type != "CLIP" && !AssetManager.isUser(resource));
		if (show && !editPreview)
		{	
			var text = " (" + otui.FileUploadManager.createDisplayFileSize(previewInfo.size) + ")";
			this.title += text;
		}
		return show; 
	};

	AssetActions.setupDownloadCustom = function(event, resource, point)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isDownloadable = otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD") && otui.services.asset.getDownloadContentPermission(permissionsMap);
        var show = (GalleryActions.actionAllowedInView() && resource.content_type !== "NONE"  && !isFolder && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED" && isDownloadable && resource.content_sub_type != "CLIP" && !AssetManager.isUser(resource));

		return show;
	};

	AssetActions.setupAdd = function(event, resource)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');

		var hasPermission = false;
		if (isFolder)
			hasPermission = otui.UserFETManager.isTokenAvailable("FOLDER.ADD_TO_PARENT");
		else
			hasPermission = otui.UserFETManager.isTokenAvailable("ASSET.ADD_TO_PARENT");

		return (hasPermission && ((resource.content_type !== "NONE" && resource.content_type !== "KEYFRAME") || isFolder));
	};

	AssetActions.setupShare = function(event, resource, point)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isExportable = otui.UserFETManager.isTokenAvailable("EXPORT") && otui.services.asset.getDownloadContentPermission(permissionsMap);
		return (GalleryActions.actionAllowedInView() && (resource.content_type !== "NONE"  || isFolder) && !resource.locked && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED" && isExportable);
	};

	AssetActions.setupCopyShortLink = function(event, resource)
	{
		if(!resource || AssetManager.isKeyframe(resource) || resource.content_state === "SEL_DEL" || resource.content_state === "DELETED" || AssetManager.isUser(resource))
			return false;
		
		var showCopyShortLink = true;
		if(FolderManager.isFolder(resource))
		{
			var view =  AssetActions.getCurrentView(event);
			var folderId = view.storedProperty("nodeID");
			var folderData = FolderManager.getCachedFolderData(folderId);

			if(folderData)
			{
				var userId = UserDetailsManager.getUserDetails().user_id;

				if(folderData.path_list)
				{
					folderData.path_list.forEach(function(path)
					{
						if(path.tree_descriptor.tree_id == userId)
						{
							showCopyShortLink = false;
						}
					});
				}
				else
				{
					if(folderData.container_id == (userId + "N"))
					{
						showCopyShortLink = false;
					}
				}
			}
		}

		return showCopyShortLink;
	};

	AssetActions.setupShowProperties = function(event, resource)
	{
		if (!resource)
			return false;
		return !otui.is(otui.modes.PHONE) && (otui.resourceAccessors.type(resource) === 'folder');
	};

	AssetActions.setupEditProperties = function(event, resource)
	{
		var show = false;
		if(resource)
		{
			if (AssetManager.isKeyframe(resource))
				return false;
			var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
			if (otui.resourceAccessors.type(resource) === 'folder')
				show = otui.UserFETManager.isTokenAvailable("FOLDER.EDIT_PROPERTIES.SINGLE") && (otui.services.asset.getMetadataEditPermission(permissionsMap) || otui.services.asset.getSecurityEditPermission(permissionsMap));
			else
				show = otui.UserFETManager.isTokenAvailable("ASSET.EDIT_PROPERTIES.SINGLE") && (otui.services.asset.getMetadataEditPermission(permissionsMap) || otui.services.asset.getSecurityEditPermission(permissionsMap));
		}
		else
			return false;
		//return (show && AssetActions.isEditable(resource) && !AssetManager.isUser(resource));
		//ART-24311 No longer calling isEditable because an asset is editable even if its metadata is not editable.
		return !otui.is(otui.modes.PHONE) && (show && !resource.locked && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED" && !AssetManager.isUser(resource));
	};

	AssetActions.setupAddToLightbox = function(event, resource, point)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var hasPermission =  otui.UserFETManager.isTokenAvailable("LIGHTBOX.VIEW");
		var view = otui.Views.containing(point);
		var addToLightBox = !(view instanceof LightboxView) && hasPermission && resource.content_type !== "KEYFRAME" && !resource.deleted && !AssetManager.isUser(resource) && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED";
		if(!addToLightBox)
			{
			return false;
			}
		else
			{
			return true;
			}
	};

	AssetActions.setupCheckOut = function(event, resource)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');

		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var canCheckout = otui.UserFETManager.isTokenAvailable("ASSET.CHECKOUT");
		var isEditContentPermitted = resource.access_control_descriptor ? AssetDetailManager.getEditContentPermission(resource.access_control_descriptor.permissions_map.entry) : false;
		return (canCheckout && isEditContentPermitted && !isFolder &&!AssetActions.isLockedOrDeleted(resource) && !resource.checked_out && resource.content_type != "NONE" && resource.content_sub_type != "CLIP" && resource.latest_version && !AssetManager.isUser(resource));
	};

	AssetActions.setupCancelCheckOut = function(event, resource)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var canCheckout = otui.UserFETManager.isTokenAvailable("ASSET.CHECKOUT");
		var isEditContentPermitted = resource.access_control_descriptor ? AssetDetailManager.getEditContentPermission(resource.access_control_descriptor.permissions_map.entry) : false;
		return (canCheckout && isEditContentPermitted &&!AssetActions.isLockedOrDeleted(resource) && !isFolder && resource.checked_out);
	};

	AssetActions.setupCheckIn = function(event, resource)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var canCheckout = otui.UserFETManager.isTokenAvailable("ASSET.CHECKOUT");
		var session = JSON.parse(sessionStorage.session);
		var isEditContentPermitted = resource.access_control_descriptor ? AssetDetailManager.getEditContentPermission(resource.access_control_descriptor.permissions_map.entry) : false;
		if(session.user_id === resource.content_lock_state_user_id){
			return !otui.is(otui.modes.PHONE) && (canCheckout && !isFolder &&!AssetActions.isLockedOrDeleted(resource) && resource.checked_out && isEditContentPermitted);
		}else {
			return false;
		}

	};

	AssetActions.setupDelete = function(event, resource)
	{
		if (!resource)
			return false;

		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var isDeletable = otui.services.asset.getDeletePermission(permissionsMap);

		if (isFolder) isDeletable = (isDeletable && otui.UserFETManager.isTokenAvailable("FOLDER.DELETE_UNDELETE"));
		else isDeletable = (isDeletable && otui.UserFETManager.isTokenAvailable("ASSET.DELETE_UNDELETE"));

		return !otui.is(otui.modes.PHONE) && (isDeletable && !AssetManager.isUser(resource) && !resource.checked_out && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED");
	};

	AssetActions.setupUndelete = function(event, resource, point)
	{
		if (!resource)
			return false;
		var showUndeleteForSubClips = true;
		var showUndeleteForSubClipInInspector = true;
		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var isDeletable = otui.services.asset.getDeletePermission(permissionsMap);

		if (isFolder) isDeletable = (isDeletable && otui.UserFETManager.isTokenAvailable("FOLDER.DELETE_UNDELETE"));
		else isDeletable = (isDeletable && otui.UserFETManager.isTokenAvailable("ASSET.DELETE_UNDELETE"));

		if(point && (otui.Views.containing(point) instanceof ClipsView))
		{
			var currentView = otui.Views.containing(point);
			var parentView = currentView.internalProperty("parentView");
			if(!!(parentView instanceof InspectorView))
			{
				var parentViewAssetObject = parentView.internalProperty("asset");
				var parentVideoState = parentViewAssetObject.content_state;
					if(parentVideoState === "DELETED")
						showUndeleteForSubClips = false;
			}
		}
		if(point && (otui.Views.containing(point) instanceof InspectorView)){
			if(resource.parentVideoContentStatus && resource.parentVideoContentStatus === "DELETED")
				showUndeleteForSubClipInInspector = false;
		}

		var showUndeleteForClips = (showUndeleteForSubClips && showUndeleteForSubClipInInspector);
		
		var session = JSON.parse(sessionStorage.session);
		var isLockedByCurrentUser = (session.user_id === resource.asset_lock_state_user_id);

		return !otui.is(otui.modes.PHONE) && ((resource.deleted || resource.content_state == "SEL_DEL") && isDeletable && showUndeleteForClips && isLockedByCurrentUser);
	};

	AssetActions.setupDuplicate = function(event, resource, point)
	{
		if (!resource)
			return false;

		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isClip = resource.content_sub_type && resource.content_sub_type === "CLIP";
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var canDuplicate;
		var view = otui.Views.containing(point);
		if (isFolder) canDuplicate = otui.UserFETManager.isTokenAvailable("FOLDER.DUPLICATE");
		else canDuplicate = otui.UserFETManager.isTokenAvailable("ASSET.DUPLICATE");

		return !otui.is(otui.modes.PHONE) && (AssetActions.isEditable(resource) && canDuplicate && !AssetManager.isUser(resource) && !isClip && !AssetActions.hasOrphanContext(view));
	};


	AssetActions.setupSubscribe = function(event, resource)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');

		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var canSubscribe = otui.services.asset.getSubscribePermission(permissionsMap);
		var isClip = resource.content_sub_type && resource.content_sub_type === "CLIP";

		var hasFET;
		if (isFolder) hasFET = otui.UserFETManager.isTokenAvailable("FOLDER.SUBSCRIBE");
		else hasFET = otui.UserFETManager.isTokenAvailable("ASSET.SUBSCRIBE");

		//ART-24734 Do not show subscribe action for deleted assets.
		return !otui.is(otui.modes.PHONE) && (!isClip && canSubscribe && hasFET && !resource.subscribed_to && !AssetManager.isUser(resource) && !resource.deleted);
	};

	AssetActions.setupUnsubscribe = function(event, resource)
	{
		if (!resource)
			return false;
		var isClip = resource.content_sub_type && resource.content_sub_type === "CLIP";
		var unsubscribe = !otui.is(otui.modes.PHONE) && !isClip && resource.subscribed_to;
		if(!unsubscribe)
			{
			return false;
			}
		else
			{
			return true;
			}
	};

	AssetActions.setupremoveFolderThumbnail = function(event, resource)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');

		var hasRendition = (((resource.rendition_content || {}).thumbnail_content || {}).name || "").indexOf("renditionfile-S-T") > -1;
		var canEditFolder = otui.UserFETManager.isTokenAvailable("FOLDER.EDIT_PROPERTIES.SINGLE");
		return !otui.is(otui.modes.PHONE) && (isFolder && !resource.deleted && hasRendition && canEditFolder);
	};

	AssetActions.setupSetAsFolderThumbnail = function(event, resource, point)
	{
		if (!resource)
			return false;
		if (otui.resourceAccessors.type(resource) == 'folder')
			return false;

		var folderData = FolderManager.getCachedFolderData(FolderManager.selectedFolderID);

		if(folderData && folderData.deleted)
			return false;

		var canEditFolder = otui.UserFETManager.isTokenAvailable("FOLDER.EDIT_PROPERTIES.SINGLE");
		var view = otui.Views.containing(point);


		return !otui.is(otui.modes.PHONE) && (canEditFolder && resource.rendition_content ? (resource.rendition_content.thumbnail_content ? true : false) : false) && !resource.deleted && (view instanceof FolderResultsView || view instanceof InspectorView) && resource.content_state != "SEL_DEL";
	};

		AssetActions.setupFolderSchedule = function(event, resource, point)
	{
		if (!resource)
			return false;
		
		var hasPermission = !otui.is(otui.modes.PHONE) && otui.UserFETManager.isTokenAvailable("SCHEDULE_DELIVERY");

		if ((otui.resourceAccessors.type(resource) == 'folder') && hasPermission)
			return true;
		else
			return false;
	};

	AssetActions.setupSetAsVideoThumbnail = function(event, resource, point)
	{
		if (!resource)
			return false;

		if (!AssetManager.isKeyframe(resource))
			return false;

		var inspectorView = otui.main.getChildView(InspectorView);

		if(!inspectorView)
			return false;

		var targetResource = inspectorView.internalProperties.asset;
		return !otui.is(otui.modes.PHONE) && (AssetActions.isEditable(targetResource) && resource.rendition_content ? (resource.rendition_content.thumbnail_content ? true : false) : false) && !resource.deleted && resource.content_state != "SEL_DEL";
	};

	AssetActions.setupRemoveFromFolder = function(event, resource, point)
	{
		if (!resource)
			return false;

		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var canRemove;

		if (isFolder)
		{
			canRemove = otui.UserFETManager.isTokenAvailable("FOLDER.REMOVE_FROM_PARENT");
			var isRoot = FolderTypesManager.getFolderTypes()[resource.container_type_id] && FolderTypesManager.getFolderTypes()[resource.container_type_id].root;
			var isRootOrphan = isRoot &&  (FolderManager.isPublicOrphan(FolderManager.selectedFolderID) || FolderManager.isPrivateOrphan(FolderManager.selectedFolderID));
			if (isRootOrphan) canRemove = false;
		}
		else canRemove = otui.UserFETManager.isTokenAvailable("ASSET.REMOVE_FROM_PARENT");

		var view = otui.Views.containing(point);

		var isAvailable = !resource.locked && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED";

		return !otui.is(otui.modes.PHONE) && (canRemove && !AssetManager.isUser(resource) && isAvailable && (view instanceof FolderResultsView || view instanceof FolderInspectorView || view instanceof InspectorView) && !AssetActions.hasOrphanContext(view));
	};

	/*
	AssetActions.setupLinkToAssets = function(event, resource)
	{
		if (!resource)
			return false;

		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var lightboxCount =  otui.main.storedProperty("lightboxCount");
		var canLink =  otui.UserFETManager.isTokenAvailable("LINKS.CREATE_LINKS");
		if (canLink && !isFolder && lightboxCount > 0 && AssetActions.isEditable(resource) && !AssetManager.isUser(resource))
			return true;

		return false;
	};
	*/
	
	AssetActions.setupLinkToAssets = function(event, resource)
	{
		if (!resource)
			return false;

		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var canLink =  otui.UserFETManager.isTokenAvailable("LINKS.CREATE_LINKS");
		if (!otui.is(otui.modes.PHONE) && canLink && !isFolder && AssetActions.isEditable(resource) && !AssetManager.isUser(resource))
			return true;

		return false;
	};

	AssetActions.setupAttachContent = function(event, resource)
	{
		if (!resource || otui.is(otui.modes.PHONE))
			return false;
		var isEditContentPermitted = resource.access_control_descriptor ? AssetDetailManager.getEditContentPermission(resource.access_control_descriptor.permissions_map.entry) : false;
		var isFolder = (otui.resourceAccessors.type(resource) === 'folder');
		var hasImportFET = otui.UserFETManager.isTokenAvailable("IMPORT");

		if(resource.content_type === 'NONE' && !isFolder && !AssetManager.isUser(resource) && isEditContentPermitted &&!AssetActions.isLockedOrDeleted(resource) && hasImportFET)
			return true;
		return false;
	};


	AssetActions.setupManageTemplates = function(event, resource)
	{
		if (!resource)
			return false;

		var hasPermission = otui.UserFETManager.isTokenAvailable("FOLDER.SET_PROPERTY_TEMPLATE");

		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		if (!otui.is(otui.modes.PHONE) && isFolder && hasPermission && AssetActions.isEditable(resource))
			return true;

		return false;
	};

	AssetActions.setupAttachPreview = function(event, resource)
	{
		if (!resource || AssetManager.isKeyframe(resource))
			return false;

		var show = false;
		var isFolder = false;
		if(resource)
		{
			var isEditPreviewPermitted = resource.access_control_descriptor ? AssetDetailManager.getPreviewViewPermission(resource.access_control_descriptor.permissions_map.entry) : false;
			var isEditContentPermitted = resource.access_control_descriptor ? AssetDetailManager.getEditContentPermission(resource.access_control_descriptor.permissions_map.entry) : false;
			show = otui.UserFETManager.isTokenAvailable("ASSET.EDIT_PREVIEW");
			show = show && isEditPreviewPermitted && isEditContentPermitted;
			isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		}
		else
			return false;

		return !otui.is(otui.modes.PHONE) && (show && !isFolder && !resource.locked && !AssetManager.isUser(resource));
	};

	 AssetActions.setupGenerateEmbedCode = function(event, resource)
	 {
		if (!resource) return false;

		if (AssetManager.isKeyframe(resource))
			return false;

		var hasFET = otui.UserFETManager.isTokenAvailable("GENERATE_EMBED_CODE");

		return !otui.is(otui.modes.PHONE) && (!resource.deleted && resource.content_state != "SEL_DEL" && hasFET && !AssetManager.isUser(resource));
	 };

	AssetActions.setupShowFolderPath =  function(event, resource, point)
	{
		if(!resource || AssetManager.isKeyframe(resource))
			return false;
		var view = otui.Views.containing(point);
		return !otui.is(otui.modes.PHONE) && ((otui.resourceAccessors.type(resource) == 'folder') && (view instanceof FolderResultsView));

	}

	 AssetActions.setupAddToExistingReview = function(event, resource, point)
	 {
		 if (resource)
		 {
			 var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
			 if (otui.is(otui.modes.PHONE) || isFolder || AssetManager.isUser(resource) || resource.deleted || resource.content_sub_type === "CLIP" || resource.content_state == "SEL_DEL" || AssetManager.isKeyframe(resource)) return false;
		 }
		 //var view = otui.Views.containing(point);
		 //return !!(view && view.constructor.name == "FolderResultsView");
		 return true;
	 };

	 AssetActions.setupAddToNewReview = function(event, resource, point)
	 {
		 if (resource)
		 {
			 return !otui.is(otui.modes.PHONE) && (!AssetManager.isKeyframe(resource) && !AssetManager.isUser(resource) && !resource.deleted && resource.content_state != "SEL_DEL" && resource.content_sub_type !== "CLIP");
		 }

		 return true;
	 };

	AssetActions.setupRetranscode = function(event, resource)
	 {
		if (!resource)
			return false;
		var hasFET = otui.UserFETManager.isTokenAvailable("REGENERATE.VIDEO.PROXIES");
		var isVideoAsset = (resource.content_type == 'VIDEO' && resource.content_sub_type !== 'CLIP');
		var isAudioAsset = resource.content_type == 'AUDIO';
		var isEditContentPermitted = resource.access_control_descriptor ? AssetDetailManager.getEditContentPermission(resource.access_control_descriptor.permissions_map.entry) : false;
		var isEditMetadataPermitted = resource.access_control_descriptor ? AssetDetailManager.getMetadataEditPermission(resource.access_control_descriptor.permissions_map.entry) : false;
		return !otui.is(otui.modes.PHONE) && (!resource.deleted && resource.content_state != "SEL_DEL" && hasFET && (isVideoAsset || isAudioAsset) && isEditContentPermitted  && isEditMetadataPermitted && !AssetManager.isUser(resource));
	 };
	
	AssetActions.setupExpire = function(event,resource)
	{
		if (!resource)
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');

		var canExpire = otui.UserFETManager.isTokenAvailable("ASSET.EXPIRE");
		var isEditMetadataPermitted = resource.access_control_descriptor ? AssetDetailManager.getMetadataEditPermission(resource.access_control_descriptor.permissions_map.entry) : false;
		return !otui.is(otui.modes.PHONE) && (canExpire && isEditMetadataPermitted && !isFolder && !AssetManager.isUser(resource) && !resource.deleted && resource.content_state != "SEL_DEL");
	}
	
	AssetActions.setupAddToExistingJob = function(event, resource, point)
	{
		if (resource)
		{
			if (otui.is(otui.modes.PHONE) || AssetManager.isUser(resource) || resource.deleted || resource.content_state == "SEL_DEL" || AssetManager.isKeyframe(resource))
				return false;
			else
				return true;
		}
		
		return !otui.is(otui.modes.PHONE);
	};
	
	AssetActions.setupAddToNewJob = function(event, resource, point)
	{
		var view = AssetActions.getCurrentView(point);
		
		if (resource)
		{
			return !otui.is(otui.modes.PHONE) && (!AssetManager.isKeyframe(resource) && !AssetManager.isUser(resource) && !resource.deleted && resource.content_state != "SEL_DEL");
		}

		if(otui.is(otui.modes.MOBILE))
			return !otui.is(otui.modes.PHONE);
		else
			return !otui.is(otui.modes.PHONE) && !(view instanceof FolderResultsView);
	};

	AssetActions.getCurrentView = function(event)
	{
		var view = event ? otui.Views.containing(event.currentTarget) : undefined;

		if (event && (event.currentTarget || event.target) && !view)
		{
			var target = event.currentTarget ? event.currentTarget : event.target;
			view =  otui.Views.containing(target.parent || target.parentNode);

			if(!view && target.caller)
				view = otui.Views.containing(target.caller);
		}

		if (!view)
		{
			var pager = $(".ot-paging")[0];
			if (pager)
				view = otui.Views.containing(pager);
		}
		if(!view)
		{
			var actionsList = $(".ot-inspectorview-asset-actions.ot-as-list")[0];
			if (actionsList)
				view = otui.Views.containing(actionsList);
		}

		if(!view)
		{
			var actionsList = $(".ot-folder-asset-actions.ot-as-list")[0];
			if (actionsList)
				view = otui.Views.containing(actionsList);
		}

		if(!view)
		{
			var otResults = document.querySelector('.ot-results') || document.querySelector('.ot-folder-results');
			
			if(otResults)
				view = otui.Views.containing(otResults);
		}
		
		//For tablet, the current view we are getting as WorkflowTaskInspectorView/WorkflowJobInspectorView instead of assets view.
		if(view && !otui.is(otui.modes.DESKTOP) && (view.constructor.name === "WorkflowTaskInspectorView" || view.constructor.name === "WorkflowJobInspectorView"))
			{
			view = view.getChildView(view.storedProperty("selected"));
			}

		return view;
	};
	
	/*
	 AssetActions.linkToAssets = function(event, resource)
	{
		var view = AssetActions.getCurrentView(event);

		var options = {'viewProperties' : {'LinkView': {"assetId" : resource.asset_id}},
				'confirmClose' : false,
				'initialiseCallback' : function (dialog)
				{
					return function (dialog)
					{
						var layout = $("#ot-link-layout")[0];
						if(layout)
							layout.recalculate();
						dialog.find(".ot-select-lightbox-all").focus();
					};
				}};
		otui.dialog("linkdialog", options);
	};
	 */
	
	AssetActions.openLinkPane = function(event, resource)
	{
		var view = AssetActions.getCurrentView(event);

		var options = {'viewProperties' : {'LinkPaneView': {"resource" : resource}}};
		
		var location = $(document.body);
		var linkPane = location.find(".ot-link-pane");
		
		if (linkPane.length)
		{
			// show the link pane
			linkPane.css("display", "inline-block");
			
			// since it already exists, the link pane needs to be explicitly
			// initialized with the asset(s) to be linked
			var linkPaneView = linkPane.find("ot-view[ot-view-type='LinkPaneView']")[0].view;
			LinkPaneView.initFromSelection.call(linkPaneView, resource);
		}
		else
		{
			// create the link pane and attach it to the DOM, which will
			// {recursively) create and initialize all of the views
			var linkView = otui.Templates.get("ot-link-pane", $);
			
			if (resource)
				otui.DialogUtils.setViewProps(linkView[0], options.viewProperties);
			
			location.append(linkView[0]);
			location.css("overflow-y", "hidden");
			linkPane = location.find(".ot-link-pane");
			linkPane.draggable({ handle: ".ot-link-pane-title" });
		}
		
		// sizing to fit the link pane in the view
		var results = $(document.body);
		//results.css("width", "calc(100% - 350px)");
		var top = results.offset().top + 100;
		var middle = results.offset().left + results.width()/2 - linkPane.width()/2;
		
		linkPane.css("top", top);
		linkPane.css("left", middle);
		//linkPane.css("height", "calc(100% - " + (top+5) + "px)");
		
		//view.resize();
	};

	AssetActions.closeLinkPane = function(event)
	{
		var view = AssetActions.getCurrentView();

		var location = $(document.body);
		var linkPane = location.find(".ot-link-pane");
		
		var linkPaneView = linkPane.find("ot-view[ot-view-type='LinkPaneView']")[0].view;
		LinkPaneView.clearAll.call(linkPaneView);
		
		linkPane.css("display", "none");
		var results = location.find(".ot-results-wrapper").first();
		results.css("width", "");
		
		view.resize();
	};
	
	AssetActions.linkToAssets = function(event, resource)
	{
		AssetActions.openLinkPane(event, resource);
	};

	AssetActions.manageTemplates = function(event, resource)
	{
		var options = {'viewProperties' : {'FolderTemplatesView': {"assetId" : resource.asset_id}}, 'confirmClose' : false};
		otui.dialog("foldertemplatesdialog", options);
	};

	function countForAssetAction(view, resource, checkLimit, title)
		{
		var count;

		resource = AssetActions.validateResource(resource, view);

		SelectionManager.singleAssetSelection = undefined;

		if (!resource)
			{
			if(typeof view.getSelectionCount === 'function')
				{
				count = view.getSelectionCount();
				}
			}
		else
			{
			count = 1;
			SelectionManager.singleAssetSelection = resource;
			}

		if (count && checkLimit)
			{
			var limit = otui.SystemSettingsManager.getSystemSettingValue('COMMON', 'CLIENT', 'BULK_OPERATIONS_ASSET_LIMIT');
			if (count > limit)
				{
				otui.alert(otui.tr("Number of assets selected ({0}) exceeds the maximum ({1}).", count, limit), {title:title});
				count = 0;
				}
			}

		return count;
		}

	AssetActions.addToFolder = function(event, resource, props)
		{
		event.stopPropagation();
		var allowMove = null;
		//returing if the user does not have FOLDER.VIEW FET.
		if(!otui.UserFETManager.isTokenAvailable("FOLDERS.VIEW"))
			{
			var validationMessage = otui.tr("You do not have permission to view folders.");
			var notification = {'message' : validationMessage, 'status' : 'error'};
			otui.NotificationManager.showNotification(notification);
			return;
			}
		var allowCopy = true;
		var folderRemoveFET = otui.UserFETManager.isTokenAvailable("FOLDER.REMOVE_FROM_PARENT");
		var assetRemoveFET = otui.UserFETManager.isTokenAvailable("ASSET.REMOVE_FROM_PARENT");
		var folderAddFET = otui.UserFETManager.isTokenAvailable("FOLDER.ADD_TO_PARENT");
		var assetAddFET = otui.UserFETManager.isTokenAvailable("ASSET.ADD_TO_PARENT");
		
		var view =  AssetActions.getCurrentView(event);
		var isLightBoxContext = view instanceof LightboxView || otui.main.getChildView(LightboxView);
		if (props && props.constructor !== Object)
			 props = null;

		var count = countForAssetAction(view, resource, true, otui.tr("Copy/Move to folder"));

		if (count > 0)
			{
			resource = AssetActions.validateResource(resource);
			var breadcrumb = view.properties.breadcrumb;
			var folderId = null;
			if (breadcrumb)
				{
				folderId = breadcrumb.ids[breadcrumb.ids.length-1];
				}
			allowCopy = !AssetActions.hasOrphanContext(view);
			// Restriction for assets and folders. This is applied by default.
			var restriction = 'asset-folders-not-current-folder';
			if (resource)
				{
				if(resource.asset_id === folderId && breadcrumb.ids.length > 1)
					{
					folderId = breadcrumb.ids[breadcrumb.ids.length-2];
					}
				if(otui.resourceAccessors.type(resource) == 'folder')
					{
					allowMove = (view instanceof FolderResultsView || view instanceof InspectorView) && folderRemoveFET && folderId;
					// If it is folder apply only this restriction.
					restriction = 'undeleted-folders-not-current-folder';
					}
				else 
					{
					allowMove = ((view instanceof FolderResultsView || view instanceof InspectorView) && assetRemoveFET && folderId) || isLightBoxContext;
					}
				// If the user cannot perform both copy and move then just display the message and return
				if(!allowMove && !allowCopy)
					{
					var validationMessage = otui.tr("You do not have permission to perform this action.");
					var notification = {'message': validationMessage,'status': 'warning'};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				var options = {'viewProperties' : {'AddToFolderView' : {"selectedAssetsCount" :  count, 'restriction' : restriction, 'allowMove' : allowMove, 'folderId' : folderId, 'allowCopy' : allowCopy, "breadcrumb" : breadcrumb}}};
				if(otui.is(otui.modes.PHONE))
				{
					options.freeflow = true;
					options.closeOnModalSelection = true;
				}
				options = jQuery.extend(options, props || {});
				otui.dialog("folderpindialog", options);
				}
			else
				{
				var selection = SelectionManager.selections.get(view);
				if(selection && selection.assetList && selection.assetList.length > 0 && !selection.allSelected)
					{
					var selectedItemsType = SelectionManager.getSelectionType(view);
					if((!assetAddFET && selectedItemsType.assetsSelected) 
							|| (!folderAddFET && selectedItemsType.foldersSelected))
						{
						var validationMessage = otui.tr("You do not have permission to copy/move " + (folderAddFET ? "assets" : "folders")+".");
						var notification = {'message' : validationMessage, 'status' : 'error'};
						otui.NotificationManager.showNotification(notification);
						return;
						}
					if (((!assetRemoveFET && selectedItemsType.assetsSelected) 
							|| (!folderRemoveFET && selectedItemsType.foldersSelected)) && !isLightBoxContext)
						{
						allowMove = false;
						}
					else
						{
						allowMove = ((view instanceof FolderResultsView || view instanceof InspectorView) && folderId) || isLightBoxContext;
						}
					}
				var selectionContext = null;
				if(view instanceof InspectorView || view instanceof FolderInspectorView)
					{
					selectionContext = SelectionManager.getSelectionContext(view, SelectionManager.singleAssetSelection, {'include_descendants':'NONE'}, true);
					}
				else
					{
					if (selection.allSelected)
						{
						selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'NONE'}, false);
						}
					else
						{
						selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'NONE'}, true);
						}
					}

				AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
					{
					var assetsSummary = response.assets_resource.collection_summary;

					var count = assetsSummary.total_number_of_items;
					if (count > 0)
						{
						var totalFolders = 0;
						var totalAssets = 0;
						var totalUsers = 0;
						for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++)
							{
							if (assetsSummary.group_to_count_map.entry[int].key == "CONTAINER")
								{
								totalFolders = assetsSummary.group_to_count_map.entry[int].value;
								}
							else if (assetsSummary.group_to_count_map.entry[int].key == "ASSET")
								{
								totalAssets = assetsSummary.group_to_count_map.entry[int].value;
								}
							else if (assetsSummary.group_to_count_map.entry[int].key == "USER")
								{
								totalUsers = assetsSummary.group_to_count_map.entry[int].value;
								}
							}
						if((!assetAddFET && totalAssets > 0) 
								|| (!folderAddFET && totalFolders > 0))
							{
							var validationMessage = otui.tr("You do not have permission to copy/move " + (folderAddFET ? "assets" : "folders")+".");
							var notification = {'message' : validationMessage, 'status' : 'error'};
							otui.NotificationManager.showNotification(notification);
							return;
							}
							
						if((allowMove == null) || allowMove)
							{
							if(((!assetRemoveFET && totalAssets > 0) 
								|| (!folderRemoveFET && totalFolders > 0)) && !isLightBoxContext)
								{
								allowMove = false;
								if(folderId)
									{
									var displayMessage = folderRemoveFET ? "assets" : "folder"
									if(!assetRemoveFET && !folderRemoveFET) {
										displayMessage = "the selected item(s)";
									}
									var validationMessage = otui.tr("You do not have permission to move " + displayMessage +".");
									var notification = {'message': validationMessage,'status': 'warning'};
									otui.NotificationManager.showNotification(notification);
									}
								}
					
							else
								{
								allowMove = ((view instanceof FolderResultsView || view instanceof InspectorView) && folderId) || isLightBoxContext;
								}
							}
						
						}
						if(totalUsers > 0)
							{
							// If the selection contains users then show banner message.
							var validationMessage = otui.tr("This operation cannot be performed on users.");
							var notification = {'message' : validationMessage, 'status' : 'warning'};
							otui.NotificationManager.showNotification(notification);
							return;
							}
						if(totalAssets === 0)
							{
							// If no assets present, apply only this restriction.
							restriction = 'undeleted-folders-not-current-folder';
							}
						// If the user cannot perform both copy and move then just display the message and return
						if(!allowMove && !allowCopy)
							{
							var validationMessage = otui.tr("You do not have permission to perform this action.");
							var notification = {'message': validationMessage,'status': 'warning'};
							otui.NotificationManager.showNotification(notification);
							return;
							}
						var options = {'viewProperties' : {'AddToFolderView' : {"selectedAssetsCount" :  count, 'restriction' : restriction, 'allowMove' : allowMove, 'folderId' : folderId, 'allowCopy' : allowCopy, "breadcrumb" : breadcrumb}}};
						if(otui.is(otui.modes.PHONE))
						{
							options.freeflow = true;
							options.closeOnModalSelection = true;
						}
						var options = jQuery.extend(options, props || {});
						otui.dialog("folderpindialog", options);
						
					});				
				}
			if(allowMove != null && !allowMove && folderId)
				{
				var displayMessage = folderRemoveFET ? "assets" : "folder"
				if(!assetRemoveFET && !folderRemoveFET) {
					displayMessage = "the selected item(s)";
				}
				var validationMessage = otui.tr("You do not have permission to move " + displayMessage +".");
				var notification = {'message': validationMessage,'status': 'warning'};
				otui.NotificationManager.showNotification(notification);
				}
			}
		};
	/**
	 * Method to group the assets based on data type.
	 *
	 * @param view view.
	 * @param title title.
	 * @param callback callback.
	 */
	var _groupAssetsByDataType = function _groupAssetsByDataType(view, title, callback, fetchAssetDetails, type)
		{
		var selectionContext = SelectionManager.getSelectionContext(view, SelectionManager.singleAssetSelection, {'include_descendants':'NONE', 'include_deleted_assets':false});
		var pageSelectionContext = SelectionManager.getSelectionContext(view, SelectionManager.singleAssetSelection, {'include_descendants':'NONE', 'include_deleted_assets':false}, true);
		//TODO : Currently we are retrieving selection context twice. Once for POST request and other optimized context for GET reqest
		//TODO : Need to refactor this to fetch the context only once for both the requests.
		var collectionCallback = function(response)
			{
			var assetDetails, assetsResource = response.assets_resource;
			var assetsSummary = assetsResource.collection_summary;
			// check what the limit is for number of assets to be shared.
			var limit = otui.SystemSettingsManager.getSystemSettingValue('COMMON', 'CLIENT', 'BULK_OPERATIONS_ASSET_LIMIT');
			var totalItems = assetsSummary.total_number_of_items;
			if (type !== "BulkEdit" && totalItems > limit)
				{
				otui.alert(otui.tr("Number of assets selected ({0}) exceeds the maximum ({1}).", totalItems, limit), {title:title});
				}
			else
				{
				var totalFolders = 0;
				var totalAssets = 0;
				var totalUsers = 0;
				for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++)
					{
					if (assetsSummary.group_to_count_map.entry[int].key == "CONTAINER")
						totalFolders = assetsSummary.group_to_count_map.entry[int].value;
					else if (assetsSummary.group_to_count_map.entry[int].key == "ASSET")
						totalAssets = assetsSummary.group_to_count_map.entry[int].value;
					else if(assetsSummary.group_to_count_map.entry[int].key == "USER")
						totalUsers = assetsSummary.group_to_count_map.entry[int].value;
					}
				var assetDetails = assetsResource.asset_list;
				var params = {"selectionContext" : selectionContext, "pageSelectionContext" : pageSelectionContext, "totalItemCount" :  totalItems, "totalFoldersCount" : totalFolders, "totalAssetsCount" : totalAssets, "totalUsersCount" : totalUsers, "assetDetails": assetDetails};
				callback(params);
				}
			};
		if(fetchAssetDetails)
			{
			AssetManager.getAssetsDetAndSummaryGroupedBy("data_type", pageSelectionContext, collectionCallback);
			}
		else
			{
			AssetManager.getAssetsSummaryGroupedBy("data_type", pageSelectionContext, collectionCallback);
			}
		};

	AssetActions.duplicate = function(event, resource)
		{
		event.stopPropagation();

		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Duplicate"));

		if (count)
			{
			var createDuplicateViewDialog = function(params)
				{
				// If the selection contains users then show banner message.
				if(params.totalUsersCount && params.totalUsersCount > 0)
					{
					var validationMessage = otui.tr("This operation cannot be performed on users.");
					var notification = {'message' : validationMessage, 'status' : 'warning'};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				// If the selection contains no valid assets, then show message and return
				if(params.totalItemCount === 0)
					{
					var validationMsg = otui.tr("No assets could be duplicated");
					var detailMsg = otui.tr("Unable to process the duplicate request because none of the assets are eligible as they might be deleted.");
					var notification = {'message' : validationMsg, 'status' : 'error', 'details' : detailMsg};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				var assetID = undefined;
				var hasAssetDuplicateFET = otui.UserFETManager.isTokenAvailable("ASSET.DUPLICATE");
				var hasFolderDuplicateFET = otui.UserFETManager.isTokenAvailable("FOLDER.DUPLICATE");
				if((params.totalAssetsCount > 0 && !hasAssetDuplicateFET) || (params.totalFoldersCount > 0 && !hasFolderDuplicateFET))
				{
				  var validationMessage = otui.tr("You do not have permission to duplicate " + (hasFolderDuplicateFET ? "assets" : "folders")+".");
				  var notification = {'message' : validationMessage, 'status' : 'error'};
				  otui.NotificationManager.showNotification(notification);
				  return;
				}
				
				if(count === 1 && view instanceof LightboxView)
					{
					var resultData = view.internalProperty("resultData");
					assetID = resultData && resultData.length > 0 ? resultData[0].asset_id : undefined;
					}
				var foldersList = view.properties.breadcrumb;
					if (!foldersList || !foldersList.ids)
						foldersList = {'names' : [], 'ids' : []};
					else
						foldersList = jQuery.extend(true, {}, foldersList);
				var dialogOptions = {'minWidth': 430,'minHeight': 410, 'viewProperties' : {'DuplicateView' : {"selectionContext" : params.selectionContext, "totalItemCount" : params.totalItemCount, "totalFoldersCount" : params.totalFoldersCount, "totalNoneFoldersCount" : params.totalAssetsCount, "newFolderBreadcrumb" : foldersList, "assetID" : assetID}},
							   'confirmClose' : false,
							   'initialiseCallback' : function (dialog)
								{
									return function (dialog)
									{
										// TODO HARKER THIS IS NOT ACCEPTABLE
										var viewObject = otui.Views.containing(dialog);
										var viewContent = viewObject.internalProperty("physicalContent");

										if (viewContent)
										{
											xtag.requestFrame(function ()
											{
												setTimeout(function () {
													var folderSelectorClearEl = viewContent.find(".ot-folder-selector-clear");
													if(folderSelectorClearEl)
													{
														folderSelectorClearEl.focus();
													}
												}, 100);
											});
										}
									};
								},
								'dragCallback' : function (dialog)
								{
									var viewObject = otui.Views.containing(dialog);
									if (viewObject)
										{
										var contentArea = viewObject.contentArea();
										otui.OTMMHelpers.toggleSecurityPolicyFiltersPosition(contentArea);
								}
								}
							  };
				otui.dialog("duplicatedialog", dialogOptions);
				};
			_groupAssetsByDataType(view, otui.tr("Duplicate"), createDuplicateViewDialog);
			}
		};

	AssetActions.share = function(event, resource, props)
	{
		event.stopPropagation();
		
		var view = AssetActions.getCurrentView(event);
       if (!otui.is(otui.modes.DESKTOP) && view.constructor.name === "InspectorView")
        {
		    if(otui.parent(event.target, "[ot-lookup=RelationshipViewActions]"))
		   {
			   view = view.getChildView(view.storedProperty("InspectorView_selected"));
		   }
        }

		if (props && props.constructor !== Object)
			 props = null;
		
		var count = countForAssetAction(view, resource, true, otui.tr("Share"));
		var breadcrumb = view.properties.breadcrumb;
		if (count)
			{
			var createShareViewDialog = function(params)
				{
				// If the selection contains users, then show banner message.
				if(params.totalUsersCount && params.totalUsersCount > 0)
					{
					var validationMessage = otui.tr("This operation cannot be performed on users.");
					var notification = {'message' : validationMessage, 'status' : 'warning'};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				if(params.totalItemCount === 0)
					{
					var validationMsg = otui.tr("No assets could be exported");
					var detailMsg = otui.tr("Unable to process the export request because none of the assets in request are eligible for export(might be deleted or don't have export permission).");
					var notification = {'message' : validationMsg, 'status' : 'error', 'details' : detailMsg};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				var options = {'viewProperties' : {'ShareView' : {"selectedAssetsCount" :  count, "folderBreadCrumb" : breadcrumb, 'title': otui.tr('Share assets'), 'type': 'share'}}, 'confirmClose' : false, 'minWidth': 820};
					if(otui.is(otui.modes.PHONE))
					{
						options.freeflow = true;
						options.closeOnModalSelection = true;
					}
				otui.dialog("sharedialog", options);
			};
			_groupAssetsByDataType(view, otui.tr("Share"), createShareViewDialog);
			};
	};

	AssetActions.copyShortLinkToClipboard = function(shortLink, name)
	{
		if (document.queryCommandSupported instanceof Function && document.queryCommandSupported("copy") === true)
		{
			var shortLinkInput = $('<textarea style="position: absolute; left: -9999px;">' + shortLink + '</textarea>').appendTo( "body" );
			if(otui.Browser.isSafari && otui.Browser.isiOS)
			{
				shortLinkInput[0].readOnly = true;
				var range = document.createRange();
				range.selectNodeContents(shortLinkInput[0]);
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
				shortLinkInput[0].setSelectionRange(0, 99999);
			}
			else
			{
				shortLinkInput[0].select();
			}
			
			document.execCommand("copy");
			shortLinkInput.remove();
			otui.NotificationManager.showNotification(
			{
				'message' : otui.tr('A link to "{0}" has been copied to your clipboard.', name),
				'stayOpen': false,
				'status' : 'ok'
			});
		}
		else
		{
			var options = {'viewProperties' : {'CopyShortLinkView' : {"shortLink" :  shortLink}}};
			otui.dialog("copyshortlinkdialog", options);
		}
	}

	AssetActions.copyShortLink = function(event, resource)
	{
		event.stopPropagation();

		var linkType = FolderManager.isFolder(resource) ? 'folder' : 'asset';
		var shortLink = otui.rootURL + '/' + otui.baseURL.split('/')[1] +'/go/' + linkType + '/' + resource.asset_id;
		AssetActions.copyShortLinkToClipboard(shortLink, resource.name);
		
	};
	
	AssetActions.schedule = function(event, resource, props)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);
		var folderId ;	
		if(view instanceof SearchView)
			view.selectionContext.alwaysUse = false;
		if(!(view instanceof FolderInspectorView))
		{
			view.getSelectedAssets(undefined, function(assetIds){
				folderId = assetIds[0];
			});
		}
		if(!folderId && resource)
			folderId = resource.asset_id;
		if(view instanceof FolderResultsView || view instanceof SearchView || view instanceof RecentFoldersResultsView || view instanceof FolderInspectorView || view instanceof RelatedFoldersView)
		{
			var options = {'viewProperties' : {'SchedulerView' : {'folderId' : folderId }}, 'confirmClose' : false, 'minWidth': 820,
			'closeCallback' : function (dialog)
							{
								ShareManager.isSchedulerView = false;
							}	
		};
			otui.dialog("schedulerdialog", options);	
		}	  
	}
	
	AssetActions.schedulesavedsearch = function(event, resource, props)
	{
		 event.stopPropagation();
		 var view =  otui.Views.containing(event.target);
		 view.selectionContext.alwaysUse = true;
		 var selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'NONE'});
		 
		 if(view instanceof SearchView)
		 {
			 var options = {'viewProperties' : {'SchedulerView' : {'selectionContext' : selectionContext }}, 'confirmClose' : false, 'minWidth': 820};
			 otui.dialog("schedulerdialog", options);
		 }
	}

	AssetActions.attachPreview = function(event, resource)
	{
		event.stopPropagation();

		var options = {'viewProperties' : {'AttachPreviewView' : {"resource" :  resource}}};
		otui.dialog("attachpreviewdialog", options);
	};

	AssetActions.createSubClips = function(event, resource, props)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);
		var parentView = view.internalProperty("parentView");
		var clipRendtionContent = parentView.storedProperty("clipRenditionContent");
		if (props && props.constructor !== Object)
			 props = null;

		var count = countForAssetAction(view, resource, true, otui.tr("Create Sub clip"));

		if (count)
			{
			var options = {'viewProperties' : {'ClipsView' : {"selectedAssetsCount" :  count}, 'clipRenditionContent': clipRendtionContent}, 'confirmClose' : false};
			var options = jQuery.extend(options, props || {});
			SubClipDialogView.show(options);
			};
	};

	AssetActions.bulkEdit = function(event)
	{
		event.stopPropagation();

		var fetchAssetDetails, view = otui.Views.containing(event.currentTarget);
		//For tablet, the current view we are getting as WorkflowTaskInspectorView/WorkflowJobInspectorView instead of assets view.
		if(view && !otui.is(otui.modes.DESKTOP) && (view.constructor.name === "WorkflowTaskInspectorView" || view.constructor.name === "WorkflowJobInspectorView"))
			{
			view = view.getChildView(view.storedProperty("selected"));
			}
		var assetId = undefined;

		var count = countForAssetAction(view);
		var assetSingleEditFET = otui.UserFETManager.isTokenAvailable("ASSET.EDIT_PROPERTIES.SINGLE");
		var folderSingleEditFET = otui.UserFETManager.isTokenAvailable("FOLDER.EDIT_PROPERTIES.SINGLE");

		if(count)
			{
			if(count === 1)
				{
				fetchAssetDetails = true;
				}
			var createBulkEditDialog = function(params)
				{
				// If the selection contains users then show banner message.
				if(count === 1 && params.totalUsersCount && params.totalUsersCount === 1)
					{
					var validationMessage = otui.tr("This operation cannot be performed on a single user.");
					var notification = {'message' : validationMessage, 'status' : 'warning'};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				//for editing single asset/folder in Results view using Bulk edit option
				if(count === 1)
					{
					if(!assetSingleEditFET  && params.totalAssetsCount === 1)
						{
						var validationMessage = otui.tr("You do not have permission to edit asset.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
						}
					else if(!folderSingleEditFET && params.totalFoldersCount === 1)
						{
						var validationMessage = otui.tr("You do not have permission to edit folder.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
						}
					else if (params.assetDetails && params.assetDetails.length > 0 && (params.assetDetails[0].deleted || params.assetDetails[0].content_state == "SEL_DEL"
								|| params.assetDetails[0].content_state == "DELETED"))
						{
						var validationMessage = otui.tr("You cannot edit a partially deleted or deleted asset.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
						}
					else if(params.totalItemCount == 0)
						{
						var validationMessage = otui.tr("You cannot edit the selected asset. Please check its status.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
						}
					var selectionContext = SelectionManager.getSelectionContext(view);
					if (selectionContext)
						{
						assetId = params.assetDetails[0] && params.assetDetails[0].asset_id;
						}
					if (assetId && params.totalFoldersCount === 1)
						{
						view.callRoute("edit-folder-contents", {'resourceID' : assetId, 'mode': 'edit'});
						}
					else if (assetId && params.totalAssetsCount === 1)
						{
						view.callRoute("edit-contents", {'resourceID' : assetId, 'mode': 'edit'});
						}
					}
				//for editing multiple assets and/or folders
				else if(count > 1)
					{
					var assetBulkEditFET = otui.UserFETManager.isTokenAvailable("ASSET.EDIT_PROPERTIES.BULK");
					var folderBulkEditFET = otui.UserFETManager.isTokenAvailable("FOLDER.EDIT_PROPERTIES.BULK");
					if(!assetBulkEditFET && params.totalAssetsCount > 1)
						{
						var validationMessage = otui.tr("You do not have permission to edit multiple assets.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
						}
					else if(!folderBulkEditFET && params.totalFoldersCount > 1)
						{
						var validationMessage = otui.tr("You do not have permission to edit multiple folder properties.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
						}
					else if(params.totalItemCount == 0)
						{
						var validationMessage = otui.tr("You cannot edit the selected assets. Please check their status.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
						}

					var dialogOptions = {"selectionContext" : params.selectionContext, "pageSelectionContext" : params.pageSelectionContext, "totalItemCount" :  params.totalItemCount,
						"totalFoldersCount" : params.totalFoldersCount, "totalAssetsCount" : params.totalAssetsCount, "totalUsersCount" : params.totalUsersCount, "confirmClose" : false ,
						"save": {
							"handler" :  function(dialogElement , dialogProps){							
									BulkEditDialogView.save(dialogElement , dialogProps);
								}
							},
						"childViews": ["BulkEditMetadataView","BulkEditSecurityView"]
						};
					BulkEditDialogView.show(dialogOptions);
					}
				};
				_groupAssetsByDataType(view, otui.tr("Bulk Edit"), createBulkEditDialog, fetchAssetDetails, "BulkEdit");
			}
	};

	AssetActions.removeAssetsFromLightbox = function(event, resource)
	{
		event.stopImmediatePropagation();

		var view = AssetActions.getCurrentView(event);
		var count = countForAssetAction(view, resource, true, otui.tr("Remove from lightbox"));

		if(count)
		{
			var selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'ALL'}, true);

			LightboxManager.removeAssets(selectionContext, function(response){
				otui.NotificationManager.showNotification(
						{
							'message' : otui.tr("Assets successfully removed from the lightbox."),
							'stayOpen': false,
							'status' : 'ok'
						});
				LightboxManager.route();
			});
		}
	};

	AssetActions.validateResource = function(resource, view)
	{
		// @resource is always undefined for top level actions but for jobs/tasks tab top level actions, it is taking job or task resource instead of undefined
		// This condition verifies the @resource param and returns undefined for only jobs/tasks top level actions.
		if(resource && ((view instanceof WorkflowAssetsView && resource.job_details) ||  (view instanceof TaskAssetsView && resource.task_data))){
			return undefined;
		} else {
			return resource;
		}
	};

	function addLightboxResponse(response)
		{
			if(response.lightbox_operation_result_representation.lightbox_operation_result.valid_asset_id_list.length)
			{
				var message = [];
				var limitExceeded = false;
				var numExisting = 0;
				var status = 'ok';

				if(response.lightbox_operation_result_representation.lightbox_operation_result.valid_asset_id_list.length)
				{
					message.push(otui.trn("{0} asset successfully added to the lightbox.", "{0} assets successfully added to the lightbox.", response.lightbox_operation_result_representation.lightbox_operation_result.valid_asset_id_list.length, response.lightbox_operation_result_representation.lightbox_operation_result.valid_asset_id_list.length));
				}

				var numErrorContainers = 0;

				for ( var lightboxError in response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list) {
					if(response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list[lightboxError].reasons[0] == "CONTAINER_TYPE_NOT_ALLOWED")
						numErrorContainers++;
				}

				if(numErrorContainers != response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list.length)
				{
					if(response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list && response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list.length)
					{
						var errors = response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list;
						for (var i in errors)
						{
							if (errors[i].reasons[0] == "EXCEEDED_LIMIT")
							{
								limitExceeded = true;
							}
							else if (errors[i].reasons[0] == "EXISTING_ELEMENT")
							{
								numExisting++;
							}
						}
						
						var numOtherErrors = response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list.length - numExisting;

						var error = "";
						if (numOtherErrors) error += otui.trn("{0} asset not added to the lightbox. ", "{0} assets not added to the lightbox. ", response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list.length - numErrorContainers, response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list.length - numErrorContainers);
						if (numExisting) error += otui.trn("{0} asset already exists in the lightbox.", "{0} assets already exist in the lightbox.", numExisting, numExisting);
						if (limitExceeded) error += ' ' + otui.tr('Limit exceeded.');
						message.push(error);
						if(response.lightbox_operation_result_representation.lightbox_operation_result.valid_asset_id_list.length)
							status = 'partialok';
						else
							status = 'warning';
					}
				}

				if(numErrorContainers > 0)
				{
					message.push(otui.tr("Please note that for folders, only the contained assets will be added."));
				}

				otui.NotificationManager.showNotification(
				{
					'message' : message.join(" "),
					'stayOpen': (status == 'error'),
					'status' : status
				});
			}
			else if(response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list && response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list.length)
			{
				var numErrorContainers = 0;
				var numErrorExistingElement = 0;

				for ( var lightboxError in response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list) {
					if(response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list[lightboxError].reasons[0] == "CONTAINER_TYPE_NOT_ALLOWED")
						numErrorContainers++;
					if(response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list[lightboxError].reasons[0] == "EXISTING_ELEMENT")
						numErrorExistingElement++;
				}

				if(numErrorContainers == response.lightbox_operation_result_representation.lightbox_operation_result.lightbox_error_list.length)
				{
					otui.NotificationManager.showNotification(
						{
							'message' : otui.tr("There are no assets in your selection to add to your lightbox."),
							'stayOpen': true,
							'status' : 'error'
						});
				}
				else if (numErrorExistingElement)
				{
					otui.NotificationManager.showNotification(
						{
							'message' : otui.trn("{0} asset already exists in the lightbox.", "{0} assets already exist in the lightbox.", numErrorExistingElement, numErrorExistingElement),
							'stayOpen': true,
							'status' : 'error'
						});
				}
				else
				{
					otui.NotificationManager.showNotification(
						{
							'message' : otui.tr("No selected assets could be added to your lightbox."),
							'stayOpen': true,
							'status' : 'error'
						});
				}
			}
		};

	AssetActions.addToLightbox = function(event, resource)
	{
		event.stopPropagation();

		var view = AssetActions.getCurrentView(event);
        if (!otui.is(otui.modes.DESKTOP) && view.constructor.name === "InspectorView")
        {
		    if(otui.parent(event.target, "[ot-lookup=RelationshipViewActions]"))
		   {
			   view = view.getChildView(view.storedProperty("InspectorView_selected"));
		   }
        }  

		var count = countForAssetAction(view, resource, true, otui.tr("Add to lightbox"));

		resource = AssetActions.validateResource(resource, view);

		if (count)
			{
			var lightboxCallback = function(params)
				{
				// If the selection contains users, then show banner message.
				if(params.totalUsersCount && params.totalUsersCount > 0)
					{
					var validationMessage = otui.tr("This operation cannot be performed on users.");
					var notification = {'message' : validationMessage, 'status' : 'warning'};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				else
					{
					LightboxManager.addSelection(SelectionManager.getSelectionContext(view, resource, {include_descendants:'ALL'}), addLightboxResponse);
					}
				};
			_groupAssetsByDataType(view, otui.tr("Add to Lightbox"), lightboxCallback);
			}
	};

	var _postDownloadCallback = function(response)
		{
			var message;
			var notification;
			if (response.export_job_handle && response.export_job_handle.export_response)
			{
				var exportableCount = response.export_job_handle.export_response.exportable_count;
				var unExportableCount = response.export_job_handle.export_response.unexportable_count;
				if (exportableCount > 0 && unExportableCount === 0)
				{
					message = otui.tr("Your request has been submitted. Please check the Activities for status.");
					if(otui.is(otui.modes.PHONE))
						message = otui.tr("Your request has been submitted. Please check the Downloads for status.");
				    notification = {'message': message, 'stayOpen': false, 'status': 'ok'};
				}
				else if (exportableCount > 0 && unExportableCount > 0)
				{
					message = otui.tr("Few of the selected assets could not be downloaded.");
				    notification = {'message': message, 'stayOpen': true, 'status': 'warning'};
				}
				else if (unExportableCount > 0 && exportableCount === 0)
				{
					message = otui.tr("No asset(s) could be exported.");
					notification = {'message': message, 'stayOpen': true, 'status': 'error'};
				}
			}
			else
			{
				message = otui.tr("No asset(s) could be exported.");
				var details = undefined;
				if (response.exception_body) details = response.exception_body.message;
				notification = {'message': message, 'stayOpen': status != 'ok', 'status': 'error', 'details': details};
			}
			otui.main.unblockContent();
			otui.NotificationManager.showNotification(notification);	            	
		};

	/**
	 * This function will initiate a job which will download the selected asset(s)
	 * @param view
	 * @param resource
	 * @param preview
	 */
	var downloadAssetsAsJob = function(view, resource, isPreview)
	{
		//singleAssetSelection must be undefined for menu level actions.(ART-34323)
		SelectionManager.singleAssetSelection = resource;
	    var downloadCallback = function(params)
	    	{
	        // If the selection contains users, then show banner message.
	        if (params.totalUsersCount && params.totalUsersCount > 0)
	        	{
	            var validationMessage = otui.tr("This operation cannot be performed on users.");
	            var notification = {'message': validationMessage, 'status': 'warning'};
	            otui.NotificationManager.showNotification(notification);
	            return;
	        	}
	        if(params.totalItemCount === 0)
	        	{
	        	otui.NotificationManager.showNotification(
	        			{'message': otui.tr('No asset(s) could be exported'), 'stayOpen': true, 'status': 'error', 
	        				'details': "Unable to process the export request because none of the assets in request are eligible for export(might be deleted or doesn't have export permission)."});
	        	return;
	        	}
	        else
	        	{
	            otui.main.blockContent();
	            var isMobile = !otui.is(otui.modes.DESKTOP);
	            if(isMobile)
	            {
	            	var preferences = otui.PreferencesManager.preferences["ARTESIA.PREFERENCE.DOWNLOAD"][0].values;
	            	var params = {
	            		isPreview: isPreview,
    					doNotify: (preferences)? ((preferences.indexOf("send_email_notification") > -1) ? 'Y' : 'N') : 'N'
    				};
	            	AssetManager.downloadAssets(view, resource, _postDownloadCallback, params);
					return;
	            }
	            var mailNotify = view.storedProperty("mailNotify");
					// var options = {'viewProperties' : {'DownloadPrepareDialogView' : {'mailNotify' : mailNotify}} , 'confirmClose' : false, 'minWidth' : 520, 'maximize' : 'false', 'resize' : 'false' ,
					// 		'closeCallback' : function (dialog)
					// 			{
					// 			var downloadView = otui.Views.containing(dialog);
					// 			if(!downloadView.storedProperty("jobAffirmative"))
					// 			{
					// 				otui.main.unblockContent();
					// 				return;
					// 			}
					// 			var parms = {
					// 					isPreview: isPreview,
					// 					doNotify: downloadView.properties.isEmailNotify ? 'Y' : 'N'
					// 			};
					// 			AssetManager.downloadAssets(view, resource, _postDownloadCallback, parms);
					// 			}
					// 	};
					// otui.dialog("downloadpreparedialog",options);

    						var parms = {
    								isPreview: isPreview,
						doNotify: mailNotify ? 'Y' : 'N'
    						};
				            AssetManager.downloadAssets(view, resource, _postDownloadCallback, parms);
 							}
    	    		};
	    _groupAssetsByDataType(view, otui.tr("Download"), downloadCallback);
	}

	var head = function(url, callback)
	{
		var pathArray = location.href.split( '/' );
		var protocol = pathArray[0];
		var host = pathArray[2];
		var baseUrl = protocol + '//' + host + url;
	    jQuery.ajax(
	    	{
	        url: baseUrl,
	        type: "head",
	        xhrFields: {'withCredentials': true },
	        complete: function(xhr)
	        	{
	        	callback(xhr);
				}
	    	});
	}
	/**
	 * This function will download the selected asset(s) to browser
	 * @param assetsInfo
	 * @param preview
	 */
	var downloadAssetsToBrowser = function(assetsInfo, preview)
	{
	    var totalAssets = assetsInfo.totalAssetsCount;
	    var validAssetsCount = assetsInfo.validAssetsCount;
	    var assetList = assetsInfo.assetsToDownloadList;
	    var errorMsgList = assetsInfo.errorMsgList;
	    if (!assetList || !assetList.length)
	    	{
				var errMsgStr = otui.tr("No asset(s) could be downloaded.");
            	var detailsStr = "";
            	if ( errorMsgList.length > 0 ) {
                	if ( errorMsgList.length < 30 ) {
                    	errorMsgList.forEach(function(errorMsg){detailsStr += errorMsg + "<br />"});
                	}
                	else {
                    	errorMsgList.forEach(function(errorMsg, index){
                        	detailsStr += errorMsg + ";&nbsp;&nbsp;&nbsp;&nbsp;"
                        	if ( index % 3 == 2 )
                            	detailsStr += "<br />"
                    	});
                	}
            	}
            	otui.NotificationManager.showNotification(
                	{'message': errMsgStr, 'details': detailsStr, 'stayOpen': true, 'status': 'error', 'parseHTML' : true});
            	return;
	    	}
	    otui.get(otui.service + '/sessions', undefined, otui.contentTypes.json, function(response, success)
	    	{
	        if (success)
	        	{
	        	assetList.forEach(function(asset, i)
	                {
	                var resourceUrl = preview ? asset.url : asset.master_content_info.url;
	                var datadownload = 'hiddenDownloader' + i;
	                if (jQuery('[data-download = ' + datadownload + ']').length === 0)
	                    {
	                	var iframeElement = document.createElement('iframe');
	                	iframeElement.setAttribute("data-download", datadownload);
	                    iframeElement.setAttribute("style", "display:none");
	                    jQuery("body").append(iframeElement);
	                    }
	                jQuery('iframe[data-download = ' + datadownload + ']').attr(
	                    {
	                    src: otui.rootURL + resourceUrl + "?disposition=attachment"
	                    });
	                });
                if (totalAssets === validAssetsCount)
                	{
                    otui.NotificationManager.showNotification(
                    	{'message': otui.tr('Assets are being downloaded.'), 'stayOpen': false, 'status': 'ok'});
                	}
                if (totalAssets > validAssetsCount)
                	{
						var errMsgStr = otui.tr("Few of the selected assets could not be downloaded.");
						var detailsStr = "";
						if ( errorMsgList.length > 0 ) {
							if ( errorMsgList.length < 30 ) {
								errorMsgList.forEach(function(errorMsg){detailsStr += errorMsg + "<br />"});
							}
							else {
								errorMsgList.forEach(function(errorMsg, index){
									detailsStr += errorMsg + ";&nbsp;&nbsp;&nbsp;&nbsp;"
									if ( index % 3 == 2 )
										detailsStr += "<br />"
								});
							}
						}
						otui.NotificationManager.showNotification(
							{'message': errMsgStr, 'details': detailsStr, 'stayOpen': false, 'status': 'warning', 'parseHTML' : true});
					}
	        	}
	        });

	}

    var getDownloadErrorMsg  = function (asset)
    {
    	var isDeleted = (asset.deleted || asset.content_state === "SEL_DEL" || asset.content_state === "DELETED");
        var isClip = asset.content_sub_type === "CLIP" ;
        var isFolder = (otui.resourceAccessors.type(asset) === 'folder');
        var permissionsMap = ((asset.access_control_descriptor || {}).permissions_map || {}).entry || {};
        //return ( asset.content_type !== "NONE"  && !isFolder && !isClip && !isDeleted && !AssetManager.isUser(asset));
		if ( asset.content_type == "NONE"  ){
            return otui.tr("{0} cannot be downloaded : content_type is NONE", asset.name);
        }
        else if ( isFolder ){
            return otui.tr("{0} cannot be downloaded : is folder", asset.name);
        }
        else if ( isClip ){
            return otui.tr("{0} cannot be downloaded : is clip", asset.name);
        }
        else if ( isDeleted ){
            return otui.tr("{0} cannot be downloaded : is deleted", asset.name);
        }
        else if ( AssetManager.isUser(asset) ){
            return otui.tr("{0} cannot be downloaded : is user", asset.name);
        }
        else if (!otui.services.asset.getDownloadContentPermission(permissionsMap)){
            return otui.tr("{0} cannot be downloaded : no permission", asset.name);
        }
        else{
            return "";
        }
    }
    
	/**
	 * This function will download selected assets(s) directly to the browser.
	 * If selected files count exceeds the allowedFilesCount the a job will be initiated.
	 * @param event
	 * @param resource
	 */
	AssetActions.downloadAssets = function(event, resource, dataParams)
	{
	    event.stopPropagation();
	    var isPreview = false; 
	    var isExportJob = false; 
		
	    if(dataParams){
	    	isPreview = (dataParams.type === "preview") ? true : false ; 
	 	    isExportJob = (dataParams.delivery === "zipped") ? true : false;
	    	}
	    var currentView = AssetActions.getCurrentView(event);
		var downloadPreviewFET = otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD_PREVIEW") && otui.UserFETManager.isTokenAvailable("EXPORT");
		var downloadOrginalFET = otui.UserFETManager.isTokenAvailable("ASSET.DOWNLOAD") && otui.UserFETManager.isTokenAvailable("EXPORT");
		if((isPreview && !downloadPreviewFET) || (!isPreview && !downloadOrginalFET))
			{
				otui.NotificationManager.showNotification(
		            {'message': otui.tr('You do not have permission to download.'), 'stayOpen': true, 'status': 'error'});
				return;
			}
	    // For tablet, the current view we are getting as
		// inspector view instead of Relationship view/Versions
		// view.
	    if (!otui.is(otui.modes.DESKTOP) && currentView.constructor.name === "InspectorView"){
	        var view = currentView.getChildView(currentView.storedProperty("InspectorView_selected"));
	    }
	    else{
	        var view = currentView;
	    }
	    resource = AssetActions.validateResource(resource, view);
	    if(dataParams) {
	    	view.storedProperty("mailNotify",dataParams.mailNotify);
	    }


		if(resource && !isExportJob){if(isPreview)
			AssetActions.downloadPreview(event, resource, null);
		else
			AssetActions.download(event, resource, null);
			return;
		}else if (isExportJob || !otui.is(otui.modes.DESKTOP)){
			downloadAssetsAsJob(view, resource, isPreview);
			return;
		}

	    var allowedFilesCount = otui.SystemSettingsManager.getSystemSettingValue('WEB', 'GENERAL', 'MAX_INDIVIDUAL_ASSET_DOWNLOAD_COUNT');
	    var maxSize = parseInt(otui.SystemSettingsManager.getSystemSettingValue('WEB', 'GENERAL', 'MAX_CONTENT_VIEW_SIZE'));
	    var found_largefile = false;
	    if(TransferManager.isTransferSchemeEnabled()){
	    	var transferSizeThreshold = parseInt(otui.SystemSettingsManager.getSystemSettingValue('TRANSFER_SCHEME', 'SWITCH', 'TRANSFER_SIZE_THRESHOLD'));
	    	if(transferSizeThreshold < maxSize){
	    		maxSize = transferSizeThreshold;
	    	}
	    }
	    var selectionContext = SelectionManager.getSelectionContext(view, resource,
	    		{
	        include_descendants: 'ALL',
	        child_type: 'ASSETS_AND_CONTAINERS'
	    	});




	    AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
	    	{
	    	var assetsSummary = response.assets_resource.collection_summary;
	    	var totalAssetsCount = 0;
	    	for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++)
				{
				if (assetsSummary.group_to_count_map.entry[int].key === "ASSET")
					{
					totalAssetsCount = assetsSummary.group_to_count_map.entry[int].value;
					}
				}
	        var assetList = response.assets_resource.asset_list;
			var assetsToDownloadList = [];
			var errorMsgList = [];
			var validAssetsCount = 0;
			if (TransferManager.isInlineDownloadSupported())
				{
				if (view.allSelected())
					{
					downloadAssetsAsJob(view, resource, isPreview);
					otui.NotificationManager.showNotification(
		            {'message': otui.tr('An export job has been triggered. Please check the Activities for status.'), 'stayOpen': false, 'status': 'ok'});
					return;
					}
				var assetObjList = [];
				var isInlineDownloadSupportedForRepository = true;
				for (var i = 0; i < assetList.length; i++)
					{
					var asset = assetList[i];
					var downloadErrorMsg = getDownloadErrorMsg(asset);
					
					if ( downloadErrorMsg ){						
						errorMsgList.push(downloadErrorMsg);
						continue;
					}										
					validAssetsCount++;					
					if (isPreview)
						{						
						var type = 'PREVIEW';
						var previewContent = (asset.rendition_content || {}).preview_content;						
						if(!previewContent)
						{
							previewContent = (asset.rendition_content || {}).pdf_preview_content;
							if(previewContent && previewContent.content_kind === 'PDFRENDITION')
								type = 'PDFRENDITION';
						}
						var previewContentManagerId = previewContent ? previewContent.content_manager_id : "";
						if(!previewContentManagerId)
							validAssetsCount--;
						else
							assetObjList.push({'id' : asset.asset_id, 'type' : type});
						if (previewContentManagerId && !otui.OTMMHelpers.isInlineDownloadSupportedForRepository(previewContentManagerId))
							{
							isInlineDownloadSupportedForRepository = false;							
							break;
							}
						}
					else
						{
						assetObjList.push({'id' : asset.asset_id, 'type' : 'ORIGINAL'});
						if(!otui.OTMMHelpers.isInlineDownloadSupportedForRepository(asset.master_content_info.content_manager_id))
							{
							isInlineDownloadSupportedForRepository = false;							
							break;
							}
						}
					
					}
				if (isInlineDownloadSupportedForRepository)
					{										
					var detailsStr = "";
					if ( errorMsgList.length > 0 ) {
						if ( errorMsgList.length < 30 ) {
							errorMsgList.forEach(function(errorMsg){detailsStr += errorMsg + "<br />"});
						}
						else {
							errorMsgList.forEach(function(errorMsg, index){
								detailsStr += errorMsg + ";&nbsp;&nbsp;&nbsp;&nbsp;"
								if ( index % 3 == 2 )
									detailsStr += "<br />"
							});
						}
					}			
					
					if(validAssetsCount === 0)
					{
						otui.NotificationManager.showNotification(
						{'message': otui.tr('No assets could be downloaded.'), 'details': detailsStr, 'stayOpen': true, 'status': 'error', 'parseHTML' : true}
						);
						return;
					}
					
					var notification = {'message': otui.tr('Files are being individually downloaded via QDS client. Check the download status in Recent activity window.'), 'stayOpen': false, 'status': 'ok'};
					if(totalAssetsCount > validAssetsCount)
						notification = {'message': otui.tr('Files are being individually downloaded via QDS client. Few of the selected assets could not be downloaded. Check the download status in Recent activity window.'), 'details': detailsStr, 'stayOpen': false, 'status': 'warning', 'parseHTML' : true};
											
					var downloadParams = {"assetObjects" : assetObjList, 'notification' : notification};
					var downloadPromise = otui.DataTransferAdaptor.inlineDownload(downloadParams);
					}
				else
					{
					otui.NotificationManager.showNotification(
		            {'message': otui.tr('An export job has been triggered as one or more of the selected assets exist in unsupported storage. Please check the Activities for status.'), 'stayOpen': false, 'status': 'ok'});
					downloadAssetsAsJob(view, resource, isPreview);
					}
				}
			else
				{
				if (totalAssetsCount <= allowedFilesCount )
					{					
					if (isPreview)
						{
						for (var i = 0; i < assetList.length; i++)
							{
							var previewInfo = AssetActions.getPreviewInfo(assetList[i]);

							var downloadErrorMsg = getDownloadErrorMsg(assetList[i]);
							var hasDownloadPermission = true;
							if ( downloadErrorMsg ){
								hasDownloadPermission = false;
								errorMsgList.push(downloadErrorMsg);
							}
							if(previewInfo && previewInfo.size)
								{
								 if ( previewInfo.size > maxSize)
									{
									found_largefile = true;
									break;
									}
								else if (hasDownloadPermission)
									{
									assetsToDownloadList.push(previewInfo);
									validAssetsCount++;
									}
								}
							}
						}
					else
						{
						for (var i = 0; i < assetList.length; i++)
							{

							var downloadErrorMsg = getDownloadErrorMsg(assetList[i]);
							var hasDownloadPermission = true;
							if ( downloadErrorMsg ){
								hasDownloadPermission = false;
								errorMsgList.push(downloadErrorMsg);
							}
							if(assetList[i].master_content_info)
								{
								if (assetList[i].master_content_info.content_size > maxSize)
									{
									found_largefile = true;
									break;
									}
								else if (hasDownloadPermission)
									{
									assetsToDownloadList.push(assetList[i]);
									validAssetsCount++;
									}
								}
							}
						}
					if (!found_largefile)
						{
						var assetsinfo = {
							totalAssetsCount: totalAssetsCount,
							validAssetsCount: validAssetsCount,
							assetsToDownloadList: assetsToDownloadList,
							errorMsgList: errorMsgList
							}
						downloadAssetsToBrowser(assetsinfo, isPreview);
						}
					else
						{
							downloadAssetsAsJob(view, resource, isPreview);
						}
					}
				else
					{
					downloadAssetsAsJob(view, resource, isPreview);
					}
				}
	    	});
	};

	AssetActions.checkOut = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Check out"));

		resource = AssetActions.validateResource(resource, view);

		if (count)
		{
			AssetManager.checkOutAssets(view, resource, function(response, success)
			{
				var successList = [];
				var failList = [];
				if (success)
				{
					successList = response.bulk_asset_result_representation.bulk_asset_result.successful_object_list;
					failList = response.bulk_asset_result_representation.bulk_asset_result.failed_object_list;
				}

				// output a notification to the user
				if (success)
				{
					var numSucceeded = successList ? successList.length : 0;
					var numFailed = failList ? failList.length : 0;
					var message = [];
					var status = 'ok';
					var details = undefined;

					if (numSucceeded)
	    			{
	    				message.push(otui.trn('Checked out {0} asset.', 'Checked out {0} assets.', numSucceeded, numSucceeded));
	    			}
	    			if (numFailed)
	    			{
	    				if (numSucceeded == 0)
	    				{
	    					status = 'error';
	    					message.push(otui.tr('No assets could be checked out.'));
	    				}
	    				else
	    				{
	    					if(numSucceeded)
								status = 'partialok';
							else
								status = 'warning';
	    					message.push(otui.trn('{0} asset could not be checked out.', '{0} assets could not be checked out.', numFailed, numFailed));
	    				}

	    				if (response.exception_body) details = response.exception_body.message;
					}

	    			otui.NotificationManager.showNotification(
					{
						'message' : message.join(" "),
						'stayOpen': (status == 'error'),
						'parseHTML' : true,
						'status' : status,
						'details' : details
					});
				}
				else
				{
					var errorMsg = otui.tr('No assets could be checked out.');
					var errorNotification = {'message' : errorMsg, 'stayOpen': true, 'status' : 'error'};
					errorNotification.details = otui.tr("Unable to check out selected assets because none of the assets are eligible as they might be deleted.");
					otui.NotificationManager.showNotification(errorNotification);
				}
			});
		}
	};

	AssetActions.removeFolderThumbnail = function(event, resource)
	{
		event.stopPropagation();
		var view = AssetActions.getCurrentView(event);

		FolderManager.removeFolderThumbnail(resource.asset_id, function(data, success){
			if(success)
			{
				otui.NotificationManager.showNotification(
				{
					'message' : otui.tr("Folder thumbnail was successfully removed."),
					'stayOpen': false,
					'status' : "ok"
				});
				view.reload();
			}
		});
	};

	AssetActions.removeLinks = function(event, resource)
	{
		var currentView = AssetActions.getCurrentView(event);

		//For tablet, the current view we are getting as inspector view instead of Relationship view/Versions view.
		if(!otui.is(otui.modes.DESKTOP) && currentView.constructor.name === "InspectorView")
			{
			var view = currentView.getChildView(currentView.storedProperty("InspectorView_selected"));
			}
		else
			{
			var view = currentView;
			}

		var count = countForAssetAction(view, null, true, otui.tr("Remove links"));

		if (count)
		{

					var assetId = view.properties.assetID;

					var linkTypeId = $("#assetRelationshipDropdownId")[0].value;

					AssetRelationshipManager.removeLinks(assetId, linkTypeId, view, function(response, status, success)
					{
						if (success)
						{
							otui.NotificationManager.showNotification(
							{
								'message' : otui.tr("Removed links"),
								'stayOpen': false,
								'status' : 'ok'
							});

							var segment = $('#assetRelationshipDropdownId')[0];
							var relationshipView = otui.Views.containing(segment);
							relationshipView.reload(true);
							SelectionManager.unselectAll(view);
							SelectionManager.callSelectionListeners(view);
							/*otui.GalleryViewActions.enableActionButtons(view, false);*/
						}
						else
						{
							otui.NotificationManager.showNotification(
							{
								'message' : otui.tr("Failed to remove links"),
								'stayOpen': true,
								'status' : 'error'
							});
						}
					});

				}
	};

	AssetActions.setAsFolderThumbnail = function(event, resource)
	{
		//ART-24717 Stop the event propagation to prevent default click on asset.
		event.stopPropagation();
		SelectionManager.singleAssetSelection = resource;
		var view = AssetActions.getCurrentView(event);

		var breadcrumb = view.properties.breadcrumb;
		var folderID = breadcrumb.ids[breadcrumb.ids.length-1];
		var folderName = breadcrumb.names[breadcrumb.names.length-1];

		var options = {
			'minWidth': 600,
		  'minHeight': 660,
			'viewProperties' : {"FolderThumbnailEditorView" : {"assetName" : resource.name, 'folderID' : folderID, 'folderName' : folderName, 'canRender' : false}}
		};
		otui.dialog("folderthumbnaileditordialog", options);
	};

	AssetActions.cancelCheckOut = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, "Cancel check out");

		resource = AssetActions.validateResource(resource, view);

		if (count)
		{
			otui.confirm({'title' : otui.tr("Discard checkout"), 'message' : otui.trn("Discard the checkout on {0} asset?", "Discard the checkout on {0} assets?", count, count), 'type' : otui.alertTypes.CONFIRM}, function(doit)
			{
				if (doit)
				{
					AssetManager.cancelCheckOutAssets(view, resource, function(response, success)
					{
						var successList = [];
						var failList = [];
						if (success)
						{
							successList = response.bulk_asset_result_representation.bulk_asset_result.successful_object_list;
							failList = response.bulk_asset_result_representation.bulk_asset_result.failed_object_list;
						}

						// output a notification to the user
						if (success)
						{
							var numSucceeded = successList ? successList.length : 0;
							var numFailed = failList ? failList.length : 0;
							var message = [];
							var status = 'ok';

							if (numSucceeded)
			    			{
			    				message.push(otui.trn('Discarded checkout of {0} asset.', 'Discarded checkout of {0} assets.', numSucceeded, numSucceeded));
			    			}
			    			if (numFailed)
			    			{
			    				if (numSucceeded == 0)
			    				{
			    					status = 'error';
			    					message.push(otui.tr('Failed to discard asset checkouts.'));
			    				}
			    				else
			    				{
			    					if(numSucceeded)
										status = 'partialok';
									else
										status = 'warning';
			    					message.push(otui.trn('Failed to discard checkout of {0} asset.', 'Failed to discard checkout of {0} assets.', numFailed, numFailed));
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
							var errorMsg = otui.tr('Failed to discard asset checkouts.');
							var errorNotification = {'message' : errorMsg, 'stayOpen': true, 'status' : 'error' };
							otui.NotificationManager.showNotification(errorNotification);
						}
					});
				}
			});
		}
	};

	AssetActions.checkIn = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Check-in"));

		resource = AssetActions.validateResource(resource, view);

		if (count)
			{
			AssetManager.checkInAssets(view, resource, function(response)
				{
				if (response)
					{
						//Clean Batch whenever launches a check-in dialog
						var checkedOutFilesArray = [];
						var len = response.assets_resource.asset_list.length;
						for (var i = 0; i < len; i++) {
							var asset = {};

							asset.assetId = response.assets_resource.asset_list[i].asset_id;
							asset.ischeckedout = response.assets_resource.asset_list[i].checked_out;
							asset.isEditContentPermitted = AssetDetailManager.getEditContentPermission(response.assets_resource.asset_list[i].access_control_descriptor.permissions_map.entry);
							var contentType = response.assets_resource.asset_list[i].content_type;
							if(contentType !== "NONE") {
								asset.name = response.assets_resource.asset_list[i].name;
								asset.type = response.assets_resource.asset_list[i].asset_content_info.master_content.mime_type;
								asset.version = response.assets_resource.asset_list[i].version;
								if(contentType === "BITMAP" && response.assets_resource.asset_list[i].rendition_content && response.assets_resource.asset_list[i].rendition_content.thumbnail_content) {
									asset.assetUrl = response.assets_resource.asset_list[i].rendition_content.thumbnail_content.url;
								}
								asset.content_lock_state_user_id = response.assets_resource.asset_list[i].content_lock_state_user_id;
							}

							var checkOutObject = CheckedInManager.createFileObject(asset);
							checkedOutFilesArray.push(checkOutObject);
						}
						CheckinView.isAttachContent = false;
						CheckinView.show(event, resource, checkedOutFilesArray);
					}
				});
			}
	};

	function performRemoveFromFolder(view, resource)
	{
			otui.confirm({'title' : otui.tr("Remove from folder"), 'message' : otui.tr('This action will remove the selected assets/folders from this folder. Continue?'), 'type' : otui.alertTypes.CONFIRM}, function(doit)
			{
				if (doit)
				{
					AssetManager.removeAssetFromFolder(view, resource, function(response, success)
					{
						var successList = [];
						var failList = [];
						if (success)
						{
							successList = response.folder_operation_resource.folder_operation_result.valid_children;
							failList = response.folder_operation_resource.folder_operation_result.failed_children;
						}

						// output a notification to the user
						if (success)
						{
							var numSucceeded = successList ? successList.length : 0;
							var numFailed = failList ? failList.length : 0;
							var message = [];
							var status = 'ok';

							if (numSucceeded)
			    			{
			    				message.push(otui.trn('Removed {0} asset.', 'Removed {0} assets.', numSucceeded, numSucceeded));
			    			}
			    			if (numFailed)
			    			{
			    				if (numSucceeded == 0)
			    				{
			    					status = 'error';
			    					message.push(otui.tr('No assets could be removed.'));
			    				}
			    				else
			    				{
			    					if(numSucceeded)
										status = 'partialok';
									else
										status = 'warning';
			    					message.push(otui.trn('{0} asset could not be removed.', '{0} assets could not be removed.', numFailed, numFailed));
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
							var errorMsg = otui.tr('No assets could be removed.');
							var errorNotification = {'message' : errorMsg, 'stayOpen': true, 'status' : 'error' };
							otui.NotificationManager.showNotification(errorNotification);
						}
					});
				}
			});
		}
	
	AssetActions.removeFromFolder = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);
		
		var count = countForAssetAction(view, resource, true, otui.tr("Remove from folder"));
		
		resource = AssetActions.validateResource(resource, view);
		
		if (count)
		{
			var selection = SelectionManager.selections.get(view);
			
			if(selection && selection.assetList && selection.assetList.length > 0 && !selection.allSelected)
				{
				var selectedItemsType = SelectionManager.getSelectionType(view);
				if((!otui.UserFETManager.isTokenAvailable("ASSET.REMOVE_FROM_PARENT") && selectedItemsType.assetsSelected) 
						|| (!otui.UserFETManager.isTokenAvailable("FOLDER.REMOVE_FROM_PARENT") && selectedItemsType.foldersSelected))
					{
					var validationMessage = otui.tr("You do not have permission to remove the selected item(s) from parent folder.");
					var notification = {'message' : validationMessage, 'status' : 'warning'};
					otui.NotificationManager.showNotification(notification);
					return;
					}
				performRemoveFromFolder(view, resource);
				}			
			else if(selection && selection.allSelected)
				{
				selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'IMMEDIATE'}, false);
				AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
					{
					var assetsSummary = response.assets_resource.collection_summary; 
					
					var count = assetsSummary.total_number_of_items;
					if (count > 0)
						{
						var totalFolders = 0;
						var totalAssets = 0;
						
						for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++) 
							{
							if (assetsSummary.group_to_count_map.entry[int].key == "CONTAINER")
								{
								totalFolders = assetsSummary.group_to_count_map.entry[int].value;
								}
							else if (assetsSummary.group_to_count_map.entry[int].key == "ASSET")
								{
								totalAssets = assetsSummary.group_to_count_map.entry[int].value;
								}
							}
						if((!otui.UserFETManager.isTokenAvailable("ASSET.REMOVE_FROM_PARENT") && totalAssets > 0) 
								|| (!otui.UserFETManager.isTokenAvailable("FOLDER.REMOVE_FROM_PARENT") && totalFolders > 0))
							{
							var validationMessage = otui.tr("You do not have permission to remove the selected item(s) from parent folder.");
							var notification = {'message' : validationMessage, 'status' : 'warning'};
							otui.NotificationManager.showNotification(notification);
							return;
							}
						}
					performRemoveFromFolder(view, resource);
					});
				}
			else
				{
				performRemoveFromFolder(view, resource);
				}
		}
	};

	AssetActions.deleteAssets = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Delete"));

		var selection = SelectionManager.selections.get(view);

		resource = AssetActions.validateResource(resource, view);

		if (count)
		{
			var selectionContext = null;
			if(view instanceof InspectorView || view instanceof FolderInspectorView)
				{
				selectionContext = SelectionManager.getSelectionContext(view, SelectionManager.singleAssetSelection, {'include_descendants':'NONE'}, true);
				}
			else
				{
				if (selection.allSelected)
					selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'IMMEDIATE'}, false);
				else
					selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'NONE'}, true);
				}

			AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
			{
				var assetsSummary = response.assets_resource.collection_summary;

				// check what the limit is for number of assets to be shared.
				var limit = otui.SystemSettingsManager.getSystemSettingValue('COMMON', 'CLIENT', 'BULK_OPERATIONS_ASSET_LIMIT');

				var count = assetsSummary.total_number_of_items;
				if (count > limit)
				{
					otui.alert(otui.tr("Number of assets selected ({0}) exceeds the maximum ({1}).", count, limit), {title:otui.tr("Delete")});
				}
				else if (count > 0)
				{
					var totalFolders = 0;
					var totalAssets = 0;
					var totalUsers = 0;

					for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++)
					{
						if (assetsSummary.group_to_count_map.entry[int].key == "CONTAINER")
						{
							totalFolders = assetsSummary.group_to_count_map.entry[int].value;
						}
						else if (assetsSummary.group_to_count_map.entry[int].key == "ASSET")
						{
							totalAssets = assetsSummary.group_to_count_map.entry[int].value;
						}
						else if (assetsSummary.group_to_count_map.entry[int].key === "USER")
						{
							totalUsers = assetsSummary.group_to_count_map.entry[int].value;
						}
					}
					if(totalUsers > 0)
					{
						// If the selection contains users then show banner message.
						var validationMessage = otui.tr("This operation cannot be performed on users.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
					}
					var hasAssetDeleteFET = otui.UserFETManager.isTokenAvailable("ASSET.DELETE_UNDELETE");
					var hasFolderDeleteFET = otui.UserFETManager.isTokenAvailable("FOLDER.DELETE_UNDELETE");
					if(totalAssets > 0 && !hasAssetDeleteFET)
						{
						// If the user has selected few assets and does not have permission to delete assets,
						// then show a banner message and stop the user from proceeding forward
						var errorNotification =
							{
							'message' : otui.tr("You do not have permission to delete assets"),
							'stayOpen': true,
							'status' : 'error'
							};
						otui.NotificationManager.showNotification(errorNotification);
						return;
						}
					else if(totalFolders > 0 && !hasFolderDeleteFET)
						{
						// If the user has selected few folders and does not have permission to delete folders,
						// then show a banner message and stop the user from proceeding forward
						var errorNotification =
							{
							'message' : otui.tr("You do not have permission to delete folders"),
							'stayOpen': true,
							'status' : 'error'
							};
						otui.NotificationManager.showNotification(errorNotification);
						return;
						}

					// The property preventDefaultRefresh stop default reloading written after delete action succeeds.
					// For Inspector view, we are reloading the view when delete dialog is closed.

					var preventDefaultRefresh = view.postDelete ? true : false;
					
					var options = {'viewProperties' : {'DeleteView' : {"totalFoldersCount" : totalFolders, "totalAssetsCount" : totalAssets, "preventDefaultRefresh" : preventDefaultRefresh}},
						'save': {
							'handler' : function(dialogElement , dialogProps)
							{
								DeleteView.executeDelete(dialogElement , dialogProps);
							}
						},
						'confirmClose' : false , 
						'initialiseCallback' : function (dialog){
							return function (dialog)
							{
								var dialogView = otui.Views.containing(dialog);
								if (dialogView)
								{
									dialogView.internalProperties.actionView = view;
									dialogView.properties.dialogProperties = {};
									dialogView.properties.dialogProperties.save = options.save;
									dialogView.properties.dialogProperties.showOnlyAssets = options.showOnlyAssets;
									dialogView.properties.dialogProperties.showOnlyFolder = options.showOnlyFolder;
								}

								if(otui.is(otui.modes.DESKTOP))
								$(".ot-delete-footer-layout")[0].recalculate();
								dialog.find("#ot-delete-versions-box").focus();

							};
						}, 
						'closeCallback' : function (dialog){
							var deleteView = otui.Views.containing(dialog);
							var isDeleteSuccess = deleteView.storedProperty("isDeleteSuccess");
							var preventDefaultRefresh = view.postDelete ? true : false;
							if(preventDefaultRefresh && isDeleteSuccess)
							{
								view.postDelete();
							}
						}
					};
					DeleteView.show(null , options);
				}
			});
		}
	};


	AssetActions.undelete = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Undelete"));

		var selection = SelectionManager.selections.get(view);

		resource = AssetActions.validateResource(resource, view);

		if (count)
		{
			var selectionContext = null;
			if(view instanceof InspectorView || view instanceof FolderInspectorView)
			{
				selectionContext = SelectionManager.getSelectionContext(view, SelectionManager.singleAssetSelection, {'include_descendants':'NONE'}, true);
			}
			else
			{
				if (selection.allSelected)
				{
					selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'IMMEDIATE'}, false);
				}
				else
				{
					selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'NONE'}, true);
				}
			}

			AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
			{
				var assetsSummary = response.assets_resource.collection_summary;

				// check what the limit is for number of assets to be shared.
				var limit = otui.SystemSettingsManager.getSystemSettingValue('COMMON', 'CLIENT', 'BULK_OPERATIONS_ASSET_LIMIT');

				var count = assetsSummary.total_number_of_items;
				if (count > limit)
				{
					otui.alert(otui.tr("Number of assets selected ({0}) exceeds the maximum ({1}).", count, limit), {title:otui.tr("Undelete")});
				}
				else if (count > 0)
				{
					var totalFolders = 0;
					var totalAssets = 0;
					var totalUsers = 0;

					for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++)
					{
						if (assetsSummary.group_to_count_map.entry[int].key == "CONTAINER")
						{
							totalFolders = assetsSummary.group_to_count_map.entry[int].value;
						}
						else if (assetsSummary.group_to_count_map.entry[int].key == "ASSET")
						{
							totalAssets = assetsSummary.group_to_count_map.entry[int].value;
						}
						else if (assetsSummary.group_to_count_map.entry[int].key === "USER")
						{
							totalUsers = assetsSummary.group_to_count_map.entry[int].value;
						}
					}
					if(totalUsers > 0)
					{
						// If the selection contains users then show banner message.
						var validationMessage = otui.tr("This operation cannot be performed on users.");
						var notification = {'message' : validationMessage, 'status' : 'warning'};
						otui.NotificationManager.showNotification(notification);
						return;
					}

					var hasAssetUndeleteFET = otui.UserFETManager.isTokenAvailable("ASSET.DELETE_UNDELETE");
					var hasFolderUndeleteFET = otui.UserFETManager.isTokenAvailable("FOLDER.DELETE_UNDELETE");
					if(totalAssets > 0 && !hasAssetUndeleteFET)
 						{

						// If the user has selected few assets and does not have permission to undelete assets,
						// then show a banner message and stop the user from proceeding forward
						var errorNotification =
 							{

							'message' : "You do not have permission to undelete assets",
							'stayOpen': true,
							'status' : 'error'
							};
						otui.NotificationManager.showNotification(errorNotification);
						return;
						}
					else if(totalFolders > 0 && !hasFolderUndeleteFET)
						{
						// If the user has selected few folders and does not have permission to delete folders,
						// then show a banner message and stop the user from proceeding forward
						var errorNotification =
 							{

							'message' : "You do not have permission to undelete folders",
							'stayOpen': true,
							'status' : 'error'
							};
						otui.NotificationManager.showNotification(errorNotification);
						return;
						}
 
					var options = {"selectionContext" : selectionContext, "totalFoldersCount" : totalFolders, "totalAssetsCount" : totalAssets, 'confirmClose' : false,
							'initialiseCallback' : function (dialog)
							{
								var dialogView = otui.Views.containing(dialog);
								if (dialogView)
								{
									dialogView.internalProperties.actionView = view;
									var dialogProp = dialogView.properties.dialogProperties = {};
									dialogView.properties.dialogProperties.save = options.save;
									dialogView.properties.dialogProperties.showOnlyAssets = options.showOnlyAssets;
									dialogView.properties.dialogProperties.showOnlyFolder = options.showOnlyFolder;
								}
							},
							'save' : {
								'handler' : function(dialogElement , dialogProps){
									UndeleteView.executeUndelete(dialogElement , dialogProps);
								}
							}
						};
					UndeleteView.show(null, options);
				}
			});
		}
	};


	AssetActions.subscribe = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);
		var allSelected = false;
		
		var count = countForAssetAction(view, resource, true, otui.tr("Subscribe"));

		resource = AssetActions.validateResource(resource, view);

		if (count)
		{
			if(!resource)
			{
				var selection = SelectionManager.selections.get(view);
				allSelected = selection.allSelected
				var assetFET = otui.UserFETManager.isTokenAvailable("ASSET.SUBSCRIBE");
				var folderFET = otui.UserFETManager.isTokenAvailable("FOLDER.SUBSCRIBE");

				if(selection && selection.assetList && selection.assetList.length > 0 && !selection.allSelected)
				{
					var selectedItemsType = SelectionManager.getSelectionType(view);
					if((!assetFET && selectedItemsType.assetsSelected)
							|| (!folderFET && selectedItemsType.foldersSelected))
					{
						var validationMessage = otui.tr("You do not have permission to subscribe " + (folderFET ? "assets" : "folders")+".");
						var notification = {'message' : validationMessage, 'status' : 'error'};
						otui.NotificationManager.showNotification(notification);
						return;
					}

				}
			}
			if(allSelected)
			{
				var selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'IMMEDIATE'}, false);
				AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
					{
						var assetsSummary = response.assets_resource.collection_summary; 
						var count = assetsSummary.total_number_of_items;
						if (count > 0)
							{
							var totalFolders = 0;
							var totalAssets = 0;
							for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++) 
								{
								if (assetsSummary.group_to_count_map.entry[int].key == "CONTAINER")
									{
									totalFolders = assetsSummary.group_to_count_map.entry[int].value;
									}
								else if (assetsSummary.group_to_count_map.entry[int].key == "ASSET")
									{
									totalAssets = assetsSummary.group_to_count_map.entry[int].value;
									}
								}
							}
						if((!assetFET && totalAssets > 0) 
								|| (!folderFET && totalFolders > 0))
							{
								var validationMessage = otui.tr("You do not have permission to subscribe " + (folderFET ? "assets" : "folders")+".");
								var notification = {'message' : validationMessage, 'status' : 'error'};
								otui.NotificationManager.showNotification(notification);
								return;
							}
						AssetManager.subscribeAssets(view, resource, function(response, success)
							{
								var successList = [];
								var failList = [];
								if (success)
								{
									successList = response.bulk_asset_result_representation.bulk_asset_result.successful_object_list;
									failList = response.bulk_asset_result_representation.bulk_asset_result.failed_object_list;
								}
								// output a notification to the user
								AssetActions.subscribeMessage(success, successList, failList);
							});
					});
			}
			else
				{
					AssetManager.subscribeAssets(view, resource, function(response, success)
					{
						var successList = [];
						var failList = [];
						if (success)
						{
							successList = response.bulk_asset_result_representation.bulk_asset_result.successful_object_list;
							failList = response.bulk_asset_result_representation.bulk_asset_result.failed_object_list;
						}
						// output a notification to the user
						AssetActions.subscribeMessage(success, successList, failList);
					});
				}
		}
	};
	
	AssetActions.subscribeMessage = function(success, successList, failList)
	{
		if (success)
		{
			var numSucceeded = successList ? successList.length : 0;
			var numFailed = failList ? failList.length : 0;
			var message = [];
			var status = 'ok';
			
			if (numSucceeded)
			{
				message.push(otui.trn('Subscribed to {0} asset.', 'Subscribed to {0} assets.', numSucceeded, numSucceeded));
			}
			if (numFailed)
			{
				if (numSucceeded == 0)
				{
					status = 'error';
					message.push(otui.tr('Could not subscribe to any assets.'));
				}
				else
				{
					status = 'warning';
					message.push(otui.trn('{0} asset could not be subscribed to.', '{0} assets could not be subscribed to.', numFailed, numFailed));
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
			var errorMsg = otui.tr('Could not subscribe to any assets.');
			var errorNotification = {'message' : errorMsg, 'stayOpen': true, 'status' : 'error' };
			otui.NotificationManager.showNotification(errorNotification);
		}	
	};

	AssetActions.attachContent = function(event, resource) {
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Attach Content"));

		resource = AssetActions.validateResource(resource, view);

		if (count) {
			AssetManager.attachContentAssets(view, resource, function(response)
				{
				if (response)
					{
						//Clean Batch whenever launches a check-in dialog
						var checkedOutFilesArray = [];
						var len = response.assets_resource.asset_list.length;
						var isFolder;
						for (var i = 0; i < len; i++) {
							var asset = {};

							asset.assetId = response.assets_resource.asset_list[i].asset_id;
							asset.isAttachContent = false;
							var contentType = response.assets_resource.asset_list[i].content_type;
							asset.metadata_model_id = response.assets_resource.asset_list[i].metadata_model_id;
							isFolder = (otui.resourceAccessors.type(response.assets_resource.asset_list[i]) == 'folder');
							asset.isEditContentPermitted = AssetDetailManager.getEditContentPermission(response.assets_resource.asset_list[i].access_control_descriptor.permissions_map.entry);
							if(contentType === "NONE" && !isFolder && !AssetManager.isUser(response.assets_resource.asset_list[i]) && asset.isEditContentPermitted &&!AssetActions.isLockedOrDeleted(response.assets_resource.asset_list[i])) {
								asset.isAttachContent = true;
							}
							asset.name = response.assets_resource.asset_list[i].name;
							asset.type = response.assets_resource.asset_list[i].mime_type;
							asset.version = response.assets_resource.asset_list[i].version;
							asset.content_state_user_id = response.assets_resource.asset_list[i].content_state_user_id;

							var checkOutObject = CheckedInManager.createFileObject(asset);
							checkedOutFilesArray.push(checkOutObject);
						}
						CheckinView.isAttachContent = true;
						CheckinView.show(event, resource, checkedOutFilesArray);
					}
				});

		}
	}
	AssetActions.unsubscribe = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Unsubscribe"));

		resource = AssetActions.validateResource(resource, view);

		if (count)
		{
			AssetManager.unsubscribeAssets(view, resource, function(response, success)
			{
				var successList = [];
				var failList = [];
				if (success)
				{
					successList = response.bulk_asset_result_representation.bulk_asset_result.successful_object_list;
					failList = response.bulk_asset_result_representation.bulk_asset_result.failed_object_list;
				}

				// output a notification to the user
				if (success)
				{
					var numSucceeded = successList ? successList.length : 0;
					var numFailed = failList ? failList.length : 0;
					var message = [];
					var status = 'ok';

					if (numSucceeded)
	    			{
	    				message.push(otui.trn('Unsubscribed from {0} folder/asset.', 'Unsubscribed from {0} folders/assets.', numSucceeded, numSucceeded));
	    			}
	    			if (numFailed)
	    			{
	    				if (numSucceeded == 0)
	    				{
	    					status = 'error';
	    					message.push(otui.tr('Could not unsubscribe from any folders/assets.'));
	    				}
	    				else
	    				{
	    					if(numSucceeded)
								status = 'partialok';
							else
								status = 'warning';
	    					message.push(otui.trn('{0} folder/asset could not be unsubscribed from.', '{0} folders/assets could not be unsubscribed from.', numFailed, numFailed));
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
					var errorMsg = otui.tr('Could not unsubscribe from any assets.');
					var errorNotification = {'message' : errorMsg, 'stayOpen': true, 'status' : 'error' };
					otui.NotificationManager.showNotification(errorNotification);
				}
			});
		}
	};

	AssetActions.showProperties = function(event, resource)
	{
		event.stopPropagation();
		var target = event.currentTarget;
		var view =  AssetActions.getCurrentView(event);
		view.callRoute("open-folder-contents", {'resourceID' : resource.asset_id});
	};

	AssetActions.editProperties = function(event, resource)
	{
		event.stopPropagation();
		var target = event.currentTarget;
		var view =  AssetActions.getCurrentView(event);
		otui.invalidateViews(InspectorView);

		if(SelectionManager.mobileSelectionMode) SelectionManager.hideMobileSelectionMode(null);

		if (otui.resourceAccessors.type(resource) === 'folder')
			{
			view.callRoute("edit-folder-contents", {'resourceID' : resource.asset_id, 'mode': 'edit'});
			}
		else
			{
			view.callRoute("edit-contents", {'resourceID' : resource.asset_id, 'mode': 'edit'});
			}
	};
	
	AssetActions.downloadPreview = function(event, resource, point)
	{
		AssetActions.download(event, resource, point, true);
	}

	AssetActions.download = function(event, resource, point, preview) {
		event.stopPropagation();
		var isInlineDownloadSupportedForRepository;
		if(resource)
		{
			var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
			if (isFolder) return AssetActions.downloadAssets(event, resource);
		}

		var maxSize = otui.SystemSettingsManager.getSystemSettingValue('WEB','GENERAL','MAX_CONTENT_VIEW_SIZE');

		var resourceUrl = otui.service + "/assetsGT/" + resource.asset_id + "/download"
		var size = resource.master_content_info.content_size;
		
		if ( preview === true ) 
		{
			var previewInfo = AssetActions.getPreviewInfo(resource);
			
			if (previewInfo.size)
			{
				resourceUrl = otui.service + "/assetsGT/" + resource.asset_id + "/quickdownload"
				size = previewInfo.size;
			}
		}
		
		var currentView = AssetActions.getCurrentView(event);
		var count = countForAssetAction(currentView, resource, true, otui.tr("Download"));
		resource = AssetActions.validateResource(resource, currentView);
		
		var type = (preview === true) ? 'PREVIEW' : 'ORIGINAL';
		if(type === 'PREVIEW')
		{
			var previewContent = (resource.rendition_content || {}).preview_content;						
			if(!previewContent)
			{
				previewContent = (resource.rendition_content || {}).pdf_preview_content;
				if(previewContent && previewContent.content_kind === 'PDFRENDITION')
					type = 'PDFRENDITION';
			}
			var previewContentManagerId = previewContent ? previewContent.content_manager_id : "";
			isInlineDownloadSupportedForRepository = otui.OTMMHelpers.isInlineDownloadSupportedForRepository(previewContentManagerId);
		}
		else
		{
			isInlineDownloadSupportedForRepository = otui.OTMMHelpers.isInlineDownloadSupportedForRepository(resource.master_content_info.content_manager_id);
		}
				
		if(TransferManager.isInlineDownloadSupported() && isInlineDownloadSupportedForRepository)
		{
			if(count)
			{				
				var notification = {'message': otui.tr('Files are being individually downloaded via QDS client. Check the download status in Recent activity window.'), 'stayOpen': false, 'status': 'ok'};
				var downloadParams = {"assetObjects" : [{'id' : resource.asset_id, 'type' : type}], 'notification' : notification};
				var downloadPromise = otui.DataTransferAdaptor.inlineDownload(downloadParams);
			}
		}
		else
		{
			if(TransferManager.isInlineDownloadSupported() && !isInlineDownloadSupportedForRepository)
				otui.NotificationManager.showNotification({'message' : otui.tr("Asset is downloaded inline via browser as it exists in an unsupported repository."), 'stayOpen': false, 'status' : 'ok' });
			if(size <= maxSize) {
				otui.get(otui.service + '/sessions', undefined, otui.contentTypes.json, function(response, success) {
						if(success) {
							var isiPad = otui.is(otui.modes.MOBILE);// navigator.userAgent.match(/iPad/i)
																	// !=
																	// null;
							if(!isiPad) {
								var hiddenIFrameID = 'hiddenDownloader';
								if(jQuery('#'+hiddenIFrameID).length === 0) {
									var iframeElement = document.createElement('iframe');
									iframeElement.setAttribute("id", hiddenIFrameID);
									iframeElement.setAttribute("style", "display:none");
									
									jQuery("body").append(iframeElement);
								}
								jQuery('#'+hiddenIFrameID).attr({
									src : otui.rootURL + resourceUrl+"?disposition=attachment"
								});
							} else {
								var assetUrl = otui.rootURL + resourceUrl+"?disposition=attachment";
								var downloadWindow = window.open("about:blank");
								downloadWindow.document.title = otui.tr("Download Files");
								var formElement = downloadWindow.document;
								window.focus();
								formElement.write("<html><head></head><body style='display: none' ><form method='GET' action='" + assetUrl + "'></form></body></html>");
								var HTMLFORM = jQuery(formElement).find('form');
								HTMLFORM.submit();
							}
						}
					});
			} else {
				
				if(count)
					{
					otui.main.blockContent();
					AssetManager.downloadSingleAsset(currentView, resource, preview, function(response)
						{
						var message, notification;
						if(response.export_job_handle && response.export_job_handle.export_response)
							{
							var exportableCount = response.export_job_handle.export_response.exportable_count;
							if(exportableCount > 0)
								{
									if(otui.is(otui.modes.PHONE))
										message = otui.tr("The requested file exceeds the size limit. An export job has been submitted. Please check the Downloads for status.");
									else
										message = otui.tr("The requested file exceeds the size limit. An export job has been submitted. Please check the Activities for status.");
								notification = {'message' : message, 'stayOpen': false, 'status' : 'ok' };
								}
							else
								{
								message = otui.tr("The requested file exceeds the size limit. You do not have permission to download asset");
								notification = {'message' : message, 'stayOpen': true, 'status' : 'warning' };
								}
							}
						else
							{
							message = otui.tr("The requested file exceeds the size limit. You do not have permission to download asset");
							notification = {'message' : message, 'stayOpen': true, 'status' : 'warning' };
							}
						otui.main.unblockContent();
						otui.NotificationManager.showNotification(notification);
						});
					}
			}
		}
		
	};
	
	AssetActions.downloadViaShareDialog = function(event,
			resource, props) {
		event.stopPropagation();

		var view = AssetActions.getCurrentView(event);
		if (!otui.is(otui.modes.DESKTOP)
				&& view.constructor.name === "InspectorView") {
			if (otui.parent(event.target,
					"[ot-lookup=RelationshipViewActions]")
					|| otui.parent(event.target,
							"[ot-lookup=VersionViewActions]")) {
				view = view
						.getChildView(view
								.storedProperty("InspectorView_selected"));
			}
		}

		if (props && props.constructor !== Object)
			props = null;

		var count = countForAssetAction(view, resource, true,
				otui.tr("Download"));
		var breadcrumb = view.properties.breadcrumb;
		if (count) {
			var createShareViewDialog = function(params) {
				// If the selection contains users, then show
				// banner message.
				if (params.totalUsersCount
						&& params.totalUsersCount > 0) {
					var validationMessage = otui
							.tr("This operation cannot be performed on users.");
					var notification = {
						'message' : validationMessage,
						'status' : 'warning'
					};
					otui.NotificationManager
							.showNotification(notification);
					return;
				}
				if (params.totalItemCount === 0) {
					var validationMsg = otui
							.tr("No assets could be exported");
					var detailMsg = otui
							.tr("Unable to process the export request because none of the assets in request are eligible for export(might be deleted or don't have export permission).");
					var notification = {
						'message' : validationMsg,
						'status' : 'error',
						'details' : detailMsg
					};
					otui.NotificationManager
							.showNotification(notification);
					return;
				}

				var isIndividualDownloadAllowed = true;
				if (view.constructor.name === "ClipsView")
					isIndividualDownloadAllowed = false;
				var options = {
					'viewProperties' : {
						'ShareView' : {
							"selectedAssetsCount" : count,
							"folderBreadCrumb" : breadcrumb,
							'title' : otui
									.tr('Download assets'),
							'type' : 'download',
							'isIndividualDownloadAllowed' : isIndividualDownloadAllowed,
							'singleAssetDownloadAction' : (resource ? true
									: false)
						}
					},
					'closeCallback' : function(dialog) {
						var downloadView = otui.Views
								.containing(dialog);
						if (downloadView.properties.downloadOption) {
							AssetActions
									.downloadAssets(
											event,
											resource,
											downloadView.properties.downloadOption);
						}
					},
					'confirmClose' : false,
					'minWidth' : 820
				};
				if (otui.is(otui.modes.PHONE)) {
					options.freeflow = true;
					options.closeOnModalSelection = true;
				}
				otui.dialog("sharedialog", options);
			};
			_groupAssetsByDataType(view, otui.tr("Share"),
					createShareViewDialog);
		}
		;
	};
	

	AssetActions.setAsVideoThumbnail = function(event, resource)
	{
		event.stopPropagation();
		var currentView = otui.main.getChildView(InspectorView);
		var storyBoardView = currentView.getChildView('StoryBoardView');
		var videoName = currentView.internalProperties.asset.name;
		var canvas = document.createElement('canvas');
	    canvas.width = resource.rendition_content.thumbnail_content.width;
	    canvas.height = resource.rendition_content.thumbnail_content.height;
	    var ctx = canvas.getContext("2d");
		var image = storyBoardView.contentArea().find("ot-rendition[src='" + resource.rendition_content.thumbnail_content.url + "']").find('img');
	    ctx.drawImage(image[0], 0, 0);

	    canvas.toBlob(function(blob)
	    {
			AssetManager.setAssetContents(currentView.properties.assetID, blob, "thumbnail", function()
			{
				 $(".mejs-poster").css({"background-image" : "url(" + resource.rendition_content.thumbnail_content.url + ")"});

				 otui.NotificationManager.showNotification(
				{
					'message' : otui.tr("Thumbnail was set for {0} video.", videoName),
					'stayOpen': false,
					'status' : "ok"
				});
			});
	    });
	};


	AssetActions.generateEmbedCode = function(event, resource)
	 {
		var isFolder = false;
		if(resource)
		{
			var template;
			var currentAssetType = otui.resourceAccessors.type(resource);
			isFolder = (currentAssetType == 'folder');

			if (isFolder)
			{
				template = otui.Templates.getMaster("folder-widget-embed");
				template.querySelector("otmm-folder").setAttribute("folder-id", resource.asset_id);
			}
			else
			{
				template = otui.Templates.getMaster("asset-widget-embed");
				var otmmAssetInspector = template.querySelector("otmm-asset-inspector");
				otmmAssetInspector.setAttribute("asset-id", resource.asset_id);
				var assetType = "detect";
				if(currentAssetType.name == "VIDEO")
					assetType = "video";
				else if(currentAssetType.name == "AUDIO")
					assetType = "audio";
				otmmAssetInspector.setAttribute("asset-type", assetType);
			}

			var templateStr = template.querySelector("div").innerHTML;


			var options = {'viewProperties' : {'EmbedWidgetView' : {"template_string" :  templateStr}}};
			//var options = {'viewProperties' : {'EmbedWidgetView' : {"embedCodeTemplate" :  template}}};
			otui.dialog("embedwidgetdialog", options);
		}
	 };
	 
	AssetActions.showFolderPath = function(event, resource)
	 {
		event.stopPropagation();
		if(resource)
			{
			var currentView = otui.Views.containing(event.target);
			var foldersList = currentView.properties.breadcrumb;
			var lastFolderId;
			if(foldersList && foldersList.ids && foldersList.ids.length > 0)
				{
				foldersList = jQuery.extend(true, {}, foldersList);
				lastFolderId = foldersList.ids[foldersList.ids.length - 1];
				}
			else
				{
				foldersList = {'names' : [], 'ids' : []};
				}
			if(lastFolderId && lastFolderId !== resource.asset_id)
				{
				// if the show folder path action is being done from hover action, then breadcrumb does not hold the current folder info. Hence adding it.
				foldersList["ids"].push(resource.asset_id);
				foldersList["names"].push(resource.name);
				}
			var dialogOptions = {'minWidth': 430,'minHeight': 410, 'viewProperties' : {'FolderPathView' : {"folderPathList" : foldersList}},'confirmClose' : false, 'maximize' : 'false'};
			otui.dialog("folderpathdialog", dialogOptions);
		}
	 };
	
	AssetActions.addToExistingJob = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);
		var folderId = view.storedProperty("nodeID");
		var isPrivateFolder = false;
		
		FolderManager.getFolderData(folderId, function(folderData)
		{
			var userId = UserDetailsManager.getUserDetails().user_id;
			
			if(folderData.path_list)
			{
				folderData.path_list.forEach(function(path)
				{
					if(path.tree_descriptor.tree_id == userId)
					{
						isPrivateFolder = true;
					}
				});
			}
			else
			{
				if(folderData.container_id == (userId + "N"))
				{
					isPrivateFolder = true;
				}
			}
		}, true);
		
		var count = countForAssetAction(view, resource, true, otui.tr("Add to review"));
		
		resource = AssetActions.validateResource(resource, view);
		
		if (count)
		{
			var selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'IMMEDIATE'});

            AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
            {
                var assetsSummary = response.assets_resource.collection_summary;
                var count = assetsSummary.total_number_of_items;
                if (count > 0)
                {
                    var totalUsers = 0;

                    for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++)
                    {
                        if (assetsSummary.group_to_count_map.entry[int].key === "USER")
                            totalUsers = assetsSummary.group_to_count_map.entry[int].value;
                    }
                    if(totalUsers > 0)
                    {
                        // If the selection contains users then show banner message.
                        var validationMessage = otui.tr("This operation cannot be performed on users.");
                        var notification = {'message' : validationMessage, 'status' : 'warning'};
                        otui.NotificationManager.showNotification(notification);
                        return;
                    }
                }

                if (resource)
                {
                    if (otui.resourceAccessors.type(resource) == 'folder')
                    {
                        folderId = resource.asset_id;
                        folderName = resource.name;
                    }

                    if ((view instanceof FolderResultsView || view instanceof InspectorView) && !isPrivateFolder && !(view instanceof FolderInspectorView))
                    {
						var currentView = view;
						var options = {'viewProperties' : {'AddToExistingJobDialogView' : {"selectionContext" : selectionContext, "folderId" : folderId}}};
					
							if(view instanceof InspectorView)
							{
								options.closeCallback = function() 
								{
										var jobsView = currentView.getChildView("AssetJobsView");
										if(!jobsView)
											{
												currentView.addChildView(new AssetJobsView({ 'assetID' : currentView.storedProperty("assetID")}));
												var jobsView = currentView.getChildView("AssetJobsView");
											}
											currentView.storedProperty("selected", "AssetJobsView");
											jobsView.reload();
								}
							}	
                        otui.dialog("addtoexistingjobdialog", options);
                    }
                    else
                    {
                        otui.confirm({'title' : otui.tr('Add to job'), 'message' : otui.tr("The current asset selection will convert any selected jobs into an ad hoc asset job. It will not be associated with a folder. Continue?"), 'type' : otui.alertTypes.WARN}, function(doit)
                        {
                            if (doit)
                            {
                                var options = {'viewProperties' : {'AddToExistingJobDialogView' : {"selectionContext" : selectionContext, "folderId" : folderId, "convertingToAdHoc" : true}}};
                                otui.dialog("addtoexistingjobdialog", options);
                            }
                        });
                    }
                }
                else
                {
                    view.getSelectedAssets({'includeFolders' : false}, function(assets, success, unfilteredCount)
                    {
                        if (unfilteredCount == 1 && assets.length == 0 && !isPrivateFolder)
                        {
                            // special case: the user has selected just one folder, so we can treat this as if the folder was selected from
                            // the hover (asset context) menu
                            folderId = selectionContext.selection_context_param.selection_context.asset_ids[0];

                            var options = {'minWidth': 770,'minHeight': 555, 'viewProperties' : {'AddToExistingJobDialogView' : {"selectionContext" : selectionContext, "folderId" : folderId}}};
                            otui.dialog("addtoexistingjobdialog", options);

                        }
                        else if (!assets || !folderId || (assets.length != unfilteredCount) || isPrivateFolder)
                        {
                            otui.confirm({'title' : otui.tr('Add to job'), 'message' : otui.tr("The current asset selection will convert any selected jobs into an ad hoc asset job. It will not be associated with a folder. Continue?"), 'type' : otui.alertTypes.WARN}, function(doit)
                            {
                                if (doit)
                                {
                                    var options = {'minWidth': 770,'minHeight': 555, 'viewProperties' : {'AddToExistingJobDialogView' : {"selectionContext" : selectionContext, "folderId" : "", "convertingToAdHoc" : true}}};
                                    otui.dialog("addtoexistingjobdialog", options);
                                }
                            });
                        }
                        else
                        {
                            var options = {'minWidth': 770,'minHeight': 555, 'viewProperties' : {'AddToExistingJobDialogView' : {"selectionContext" : selectionContext, "folderId" : folderId}}};
                            otui.dialog("addtoexistingjobdialog", options);
                        }
                    });
                }
            });
		}
	};
	
	AssetActions.addToNewJob = function(event, resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);
		var folderId = view.storedProperty("nodeID");
		var folderName = "";
		
		if (folderId && FolderManager.getCachedFolderData(folderId))
		{
			var params = FolderManager.getRememberedFolderParams();
			if (params && params.breadcrumb && params.breadcrumb.names)
			{
				folderName = params.breadcrumb.names[params.breadcrumb.names.length-1];
			}
		}
		
		var isPrivateFolder = false;
		
		FolderManager.getFolderData(folderId, function(folderData)
		{
			var userId = UserDetailsManager.getUserDetails().user_id;
			
			if(folderData.path_list)
			{
				folderData.path_list.forEach(function(path)
				{
					if(path.tree_descriptor.tree_id == userId)
					{
						isPrivateFolder = true;
					}
				});
			}
			else
			{
				if(folderData.container_id == (userId + "N"))
				{
					isPrivateFolder = true;
				}
			}
		}, true);
		
		var count = countForAssetAction(view, resource, true, otui.tr("Create a new job"));
		
		resource = AssetActions.validateResource(resource, view);
		
		// if (count || (count == 0 && SelectionManager.selectedAssetCount == 0))
		{
			var selectionContext = SelectionManager.getSelectionContext(view, resource, {include_descendants:'IMMEDIATE'});

            AssetManager.getAssetsSummaryGroupedBy("data_type", selectionContext, function(response)
            {
                var assetsSummary = response.assets_resource.collection_summary;
                var count = assetsSummary.total_number_of_items;
                if (count > 0)
                {
                    var totalUsers = 0;

                    for (var int = 0; int < assetsSummary.group_to_count_map.entry.length; int++)
                    {
                    	if (assetsSummary.group_to_count_map.entry[int].key === "USER")
                            totalUsers = assetsSummary.group_to_count_map.entry[int].value;
                    }
                    if(totalUsers > 0)
                    {
                        // If the selection contains users then show banner message.
                        var validationMessage = otui.tr("This operation cannot be performed on users.");
                        var notification = {'message' : validationMessage, 'status' : 'warning'};
                        otui.NotificationManager.showNotification(notification);
                        return;
                    }
                }

                if (resource)
                {
                    if (otui.resourceAccessors.type(resource) == 'folder')
                    {
                        folderId = resource.asset_id;
                        folderName = resource.name;
                    }

                    if (!folderId || isPrivateFolder)
                    {
                        otui.confirm({'title' : otui.tr('Create job'), 'message' : otui.tr("The current asset selection will create an ad hoc asset job. It will not be associated with a folder. Continue?"), 'type' : otui.alertTypes.WARN}, function(doIt)
                        {
                            if (doIt)
                            {
                                var options = {'viewProperties' : {'NewJobDialogView' : {'callingViewType': view.constructor.name, "folderId" : "", "folderName" : "", "assetCount" : count, 'selectionContext': selectionContext}}};
                                NewJobDialogView.show(event, options);
                            }
                        });
                    }
                    else if (view instanceof FolderResultsView || view instanceof InspectorView || view instanceof RecentFoldersResultsView)
                    {
                        var options = {'minWidth': 770,'minHeight': 555, 'viewProperties' : {'NewJobDialogView' : {'callingViewType': view.constructor.name, "inEdit": true, "folderId" : folderId, "folderName" : folderName, "assetCount" : count, 'selectionContext': selectionContext}}};
                        NewJobDialogView.show(event, options);
                    }
                    else
                    {
                        otui.confirm({'title' : otui.tr('Create job'), 'message' : otui.tr("The current asset selection will create an ad hoc asset job. It will not be associated with a folder. Continue?"), 'type' : otui.alertTypes.WARN}, function(doIt)
                        {
                            if (doIt)
                            {
                                var options = {'viewProperties' : {'NewJobDialogView' : {'callingViewType': view.constructor.name, "folderId" : "", "folderName" : "", "assetCount" : count, 'selectionContext': selectionContext}}};
                                NewJobDialogView.show(event, options);
                            }
                        });
                    }
                }
                else
                {
                    view.getSelectedAssets({'includeFolders' : false}, function(assets, success, unfilteredCount)
                    {
                        if (unfilteredCount == 1 && assets.length == 0 && !isPrivateFolder)
                        {
                            // special case: the user has selected just one folder, so we can treat this as if the folder was selected from
                            // the hover (asset context) menu
                            folderId = selectionContext.selection_context_param.selection_context.asset_ids[0];
                            var folder = $("ot-resource[resourceid='" + folderId + "']")[0];
                            folderName = folder.model.name;

                            var options = {'viewProperties' : {'NewJobDialogView' : {'callingViewType': view.constructor.name, "folderId" : folderId, "folderName" : folderName, "assetCount" : count, 'selectionContext': selectionContext}}};
                            NewJobDialogView.show(event, options);

                        }
                        else if (count && (!assets || !folderId || (assets.length != unfilteredCount)) || isPrivateFolder)
                        {
                            otui.confirm({'title' : otui.tr('Create job'), 'message' : otui.tr("The current asset selection will create an ad hoc asset job. It will not be associated with a folder. Continue?"), 'type' : otui.alertTypes.WARN}, function(doIt)
                            {
                                if (doIt)
                                {
                                    var options = {'viewProperties' : {'NewJobDialogView' : {'callingViewType': view.constructor.name, "folderId" : "", "folderName" : "", "assetCount" : unfilteredCount, 'selectionContext': selectionContext}}};
                                    NewJobDialogView.show(event, options);
                                }
                            });
                        }
                        else
                        {
                            if(count == 0)
                                selectionContext = undefined;

                            var options = {'viewProperties' : {'NewJobDialogView' : {'callingViewType': view.constructor.name, "folderId" : folderId, "folderName" : folderName, "assetCount" : count, 'selectionContext': selectionContext}}};
                            NewJobDialogView.show(event, options);
                        }
                    });
                }
            });

		}
	};

    AssetActions.setupApproveInHightail = function(event, resource)
    {
		if (!resource || otui.is(otui.modes.PHONE))
			return false;
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isExportable = otui.UserFETManager.isTokenAvailable("EXPORT") && otui.services.asset.getDownloadContentPermission(permissionsMap);
		var isActionAllowed = GalleryActions.actionAllowedInView();
		var isContentTypeAllowed = (resource.content_type !== "NONE"  || isFolder);

		return (HightailManager.isHightailEnabled() && !AssetManager.isUser(resource) && isActionAllowed && isContentTypeAllowed && !resource.locked && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED" && isExportable);
    };


    AssetActions.approveInHightail = function(event, resource, props)
    {
		event.stopPropagation();

		var view = AssetActions.getCurrentView(event);
		if (!otui.is(otui.modes.DESKTOP) && view.constructor.name === "InspectorView")
		{
			if(otui.parent(event.target, "[ot-lookup=RelationshipViewActions]"))
			{
				view = view.getChildView(view.storedProperty("InspectorView_selected"));
			}
		}

		if (props && props.constructor !== Object)
			props = null;

		var count = countForAssetAction(view, resource, true, otui.tr("Share"));
		var breadcrumb = view.properties.breadcrumb;
		if (count)
		{
			var createShareViewDialog = function(params)
			{
				// If the selection contains users, then show banner message.
				if(params.totalUsersCount && params.totalUsersCount > 0)
				{
					var validationMessage = otui.tr("This operation cannot be performed on users.");
					var notification = {'message' : validationMessage, 'status' : 'warning'};
					otui.NotificationManager.showNotification(notification);
					return;
				}
				if(params.totalItemCount === 0)
				{
					var validationMsg = otui.tr("No assets could be exported");
					var detailMsg = otui.tr("Unable to process the export request because none of the assets in request are eligible for export(might be deleted or don't have export permission).");
					var notification = {'message' : validationMsg, 'status' : 'error', 'details' : detailMsg};
					otui.NotificationManager.showNotification(notification);
					return;
				}
				var options = {'viewProperties' : {'HightailView' : {"selectedAssetsCount" :  count, "folderBreadCrumb" : breadcrumb}}, 'confirmClose' : false, 'minWidth': 820};
				HightailView.show(event, options);
			};
			_groupAssetsByDataType(view, otui.tr("Share"), createShareViewDialog);
		};
    };
	
	AssetActions.setupQuickReview = function(event, resource)
	{
		if (!resource || otui.is(otui.modes.PHONE))
			return false;
		
		var isFolder = (otui.resourceAccessors.type(resource) === 'folder');
		if(otui.JobsManager.hasCreativeReview() && !AssetManager.isKeyframe(resource) && otui.UserFETManager.isTokenAvailable("QUICK.REVIEW") && !(resource.content_type === 'NONE') && !isFolder && !resource.deleted && resource.content_state !== "SEL_DEL" && resource.content_state !== "DELETED")
			return true;
		return false;
	};
	
	AssetActions.quickReview = function(event, resource)
	{
		event.stopPropagation();
		var nonContentAssets = 0, foldernumber = 0;
		var view =  AssetActions.getCurrentView(event);
		view.properties.quickreview_asset_id = resource.asset_id;
		if(resource.data_type == "CONTAINER") foldernumber++;
		if(resource.content_type == "NONE") nonContentAssets++;
		view.properties.quickreview_foldernumbers = foldernumber;
		view.properties.quickreview_nonContentAssets = nonContentAssets;
		view.properties.quickreview_deletedAssets = 0;
		view.quickReviewAssets();
	}

	AssetActions.retranscode = function(event, resource)
	 {
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);
		var count = countForAssetAction(view, resource, true, otui.tr("Transcode"));
		resource = AssetActions.validateResource(resource, view);
		if(count)
		{
			AssetManager.transcodeVideos(view, resource, function(response, success)
				{
					var successList = [];
					var failList = [];
					if (success)
					{
						var jsonResponse = ((response.bulk_asset_result_representation || {}).bulk_asset_result || {});
						successList = jsonResponse.successful_object_list;
						failList = jsonResponse.failed_object_list;
						var numSucceeded = successList ? successList.length : 0;
						var numFailed = failList ? failList.length : 0;
						var resultCode = jsonResponse.result_code;
						var message, status;

						if (resultCode === 0)
						{
							status = 'information';
							message = otui.trn('{0} asset has been sent for transcoding. Please check the status in Activity center.', '{0} assets have been sent for transcoding. Please check the status in Activity center.', numSucceeded, numSucceeded);
						}
						else if (resultCode === 1)
						{
							status = 'warning';
							var msg = [];
							msg.push(otui.trn('{0} asset could not be transcoded.', '{0} assets could not be transcoded.', numFailed, numFailed));
							msg.push(otui.trn('{0} asset has been sent for transcoding. Please check the status in Activity center.', '{0} assets have been sent for transcoding. Please check the status in Activity center.', numSucceeded, numSucceeded));
							message = msg.join("");
						}
						else if (resultCode === 2)
						{
							status = 'error';
							message = otui.tr('Could not transcode any assets.');
						}

						otui.NotificationManager.showNotification(
						{
							'message' : message,
							'stayOpen': (status == 'error'),
							'parseHTML' : true,
							'status' : status
						});
					}
					else
					{
						var errorMsg = otui.tr('Could not transcode any assets.');
						var errorNotification = {'message' : errorMsg, 'stayOpen': true, 'status' : 'error' };
						otui.NotificationManager.showNotification(errorNotification);
					}
				});
		}
	 };
	 
	AssetActions.expire = function(event,resource)
	{
		event.stopPropagation();
		var view =  AssetActions.getCurrentView(event);

		var count = countForAssetAction(view, resource, true, otui.tr("Expire"));

		resource = AssetActions.validateResource(resource, view);

		if (count)
		{
			AssetManager.expireAssets(view, resource, function(response, success)
			{
				var successList = [];
				var failList = [];
				if (success)
				{
					successList = response.bulk_asset_result_representation.bulk_asset_result.successful_object_list;
					failList = response.bulk_asset_result_representation.bulk_asset_result.failed_object_list;
					
					var numSucceeded = successList ? successList.length : 0;
					var numFailed = failList ? failList.length : 0;
					var message = [];
					var status = 'ok';
					var details = undefined;

					if (numSucceeded)
					{
						message.push(otui.trn('Expired {0} asset.', 'Expired {0} assets.', numSucceeded, numSucceeded));
					}
					if (numFailed)
					{
						if (numSucceeded == 0)
						{
							status = 'error';
							message.push(otui.tr('No assets could be expired.'));
						}
						else
						{
							if(numSucceeded)
								status = 'partialok';
							else
								status = 'warning';
							message.push(otui.trn('{0} asset could not be expired.', '{0} assets could not be expired.', numFailed, numFailed));
						}
					}

					otui.NotificationManager.showNotification(
					{
						'message' : message.join(" "),
						'stayOpen': (status == 'error'),
						'status' : status,
					});
					
					view.reload();
				}
				else
				{
					otui.NotificationManager.showNotification(
					{
						'message' : otui.tr("Unable to expire selected assets because none of the assets are eligible to expire."),
						'stayOpen': true,
						'status' : 'error'
					});
				}
			});
		}
		
	};
	
	AssetActions.setupSmartCompose = function(event, resource)
    {
		// Smart compose feature is currently supported only for desktop mode.
		if (!otui.is(otui.modes.DESKTOP))
			return false;

		if (!resource)
			return false;

		var permissionsMap = ((resource.access_control_descriptor || {}).permissions_map || {}).entry || {};
		var isNotLocked = (resource.locked === false);
		var isExportable = otui.UserFETManager.isTokenAvailable("EXPORT") && otui.services.asset.getDownloadContentPermission(permissionsMap);
		var isBitMapContent = (resource.content_type === "BITMAP");
		var isSmartComposeFETEnabled = otui.UserFETManager.isTokenAvailable("ASSET.SUGGEST_CROP");
		var hasFieldGroup = false;
		if( resource.metadata_model_id )
		{
			var modelInfo = otui.MetadataModelManager.getModelByName(resource.metadata_model_id);
			var metadataElmList = modelInfo.metadata_element_list || [];
			hasFieldGroup = metadataElmList.find(function(elm) {  return elm.id === "ARTESIA.CATEGORY.INTELLIGENTCROP DATA" });
        }
        var hasRenditionContent = ( resource.rendition_content ) ? true : false; 
		var hasPreviewPermission = AssetDetailManager.getPreviewViewPermission(permissionsMap);
		var isEnabled = (isSmartComposeFETEnabled && isNotLocked && hasRenditionContent && isExportable && isBitMapContent && !!hasFieldGroup  && hasPreviewPermission);
		return isEnabled;
    };


    AssetActions.smartCompose = function(event, resource, props)
    {
		event.stopPropagation();
		var currentView = AssetActions.getCurrentView(event);
		var dialogOptions = { "viewProperties" : { 
								"SmartComposeView" : {
									"assetID" : resource.asset_id,
									"originalAssetID" : resource.original_asset_id,
									"deliveryURL" : resource.delivery_service_url,
									"renditionName" : (((resource || {}).rendition_content || {}).preview_content || {}).name,
									"hasCropData" : false,
									"renditionProperties" : {
										"thumbnailURL" : (((resource || {}).rendition_content || {}).preview_content || {}).url,
										"previewURL" : (((resource || {}).rendition_content || {}).preview_content || {}).url,
										"mimeType" : resource.mime_type
									}
								}
							},
							"confirmClose" : false,
							"initialiseCallback" : function (dialog) {
								return function (dialog)
									{
										var view = otui.Views.containing(dialog);
										var assetId = view.properties.assetID;
										otui.services.asset.lock({'assetID' : assetId});
									};
								},
							"closeCallback" : function (dialog) {
								var view = otui.Views.containing(dialog);
								if(view.properties.operationList)
									view.properties.operationList.length = 0;
								var assetId = view.properties.assetID;
								var contentArea = view.contentArea();
								var cropCanvas = contentArea.find(".canvas-container");
								cropCanvas.off("mouseup");
								// Clear the polling timer if dialog is closed before crop zone generation.
								if(view.properties.pollCropData)
								{
									window.clearInterval(view.properties.pollCropData);
								}
								if(view.properties.submissionMsgEl)
								{
									otui.NotificationManager.closeNotification(view.properties.submissionMsgEl);
								}
								otui.services.asset.unlock({'assetID' : assetId});
							}
		};
		SmartComposeView.show(dialogOptions);
		
    };

	AssetActions.registrySetupFn = function(gatewayFn)
	{
		var inValidViews = ["StoryBoardView"];
		var getView = $events.getView().then(function(view) {
			if(view && inValidViews.indexOf(view.constructor.name) > -1)
				return $events.response.hide;
			else
				return $events.response.enable;
		});
		
		if(!gatewayFn || typeof gatewayFn !== 'function')
			{
				return getView.apply(this, arguments);
			}
		else
			{
			return function() {				
				if (gatewayFn && !gatewayFn.apply(this, arguments))
					return false;
				return getView.apply(this, arguments);
			}
			}
	};
	
	otui.GalleryAssetActions = new otui.IntegrationPoint("GalleryAssetActions", "assetactions",
			{
			'render' : {'desktop' : otui.IntegrationPoint.OVERFLOW({"maxItems" : 5, 'dimensions' : {'width' : 30, 'height' : 30, 'spacing' : 4}, 'in-menu' : otui.IntegrationPoint.OVERFLOW_IN_MENU.SHOW_OVERFLOWED}),
						'tablet' : otui.IntegrationPoint.MENU(),
						'phone' : otui.IntegrationPoint.MENU()},
			'menu' :
				{
				'name' : 'dropdown',
				'text' : otui.tr('More'),
				'img' : {
					phone: './style/img/more_fab28.svg',
					tablet: './style/img/caret_down12.svg',
					desktop: './style/img/caret_down12.svg'
				}
				}
			});
	
	if(otui.is(otui.modes.PHONE))
	{
		otui.GalleryAssetActions.asContextMenu = function(event, resource)
		{
			event.preventDefault();
			event.stopPropagation();

			var currentView = AssetActions.getCurrentView(event);

			if( currentView.constructor.name === 'InspectorView' ) {
				return false;
			}

			if(resource && resource.data && resource.data.model && FolderManager.isRootFolder(resource.data.model.asset_id))
				return false;
			
			if(SelectionManager.mobileSelectionMode)
				SelectionManager.hideMobileSelectionMode(event);
			else
				SelectionManager.showMobileSelectionMode(event);
			
			return false;
		};
		
		AssetActions.setupHeader = function(event, resource)
		{
			if(resource && resource.name)
			{
				this.querySelector("[ot-text]").textContent = resource.name;
				var backgroundUrl = "url('" + (FolderManager.isFolder(resource) ? "style/img/contenttype/folder148.svg" : resource["ot-resource-type-icon"]) + "')";
				this.querySelector("[ot-img]").style.backgroundImage = backgroundUrl;
				this.querySelector(".ot-menu-only[ot-img]").style.backgroundImage = backgroundUrl;
				
				return true;
			}
			
			return false;
		};
		
		AssetActions.closeActions = function(event, resource, point)
		{
			if(point)
				point.hide();
		};
		
		otui.GalleryAssetActions.register({'name' : 'header', 'setup' : AssetActions.setupHeader, 'select' : AssetActions.closeActions, 'template' : 'phone-single-actions-header'}, 0);
	}
	
	otui.GalleryAssetActions.register({'name' : 'download', 'text' : otui.tr('Download original'), 'img' : {desktop: './style/img/dowload_original24.svg', tablet: './style/img/download16_sprite.png', phone: './style/img/action_download_original24.svg'}, 'setup' : AssetActions.setupDownload, 'select' : AssetActions.download}, 1);
	otui.GalleryAssetActions.register({'name' : 'downloadpreview', 'text' : otui.tr('Download preview'), 'img' : {desktop: './style/img/download_preview24.svg', tablet: './style/img/download_preview16_sprite.png', phone: './style/img/action_download24.svg'}, 'setup' : AssetActions.setupDownloadPreview, 'select' : AssetActions.downloadPreview}, 2);
	otui.GalleryAssetActions.register({'name' : 'downloadcustom', 'text' : otui.tr('Download custom'), 'img' : {desktop: './style/img/action_download_custom24.svg', tablet: './style/img/download_custom.png', phone: './style/img/download_custom.png'}, 'setup' : AssetActions.setupDownloadCustom, 'select' : AssetActions.downloadViaShareDialog}, 3);
	otui.GalleryAssetActions.register({'name' : 'share', 'text' : otui.tr('Share'), 'img' : {desktop: './style/img/action_share24.svg', tablet: './style/img/share16_sprite.png', phone: './style/img/action_share24.svg'}, 'setup' : AssetActions.setupShare, 'select' : AssetActions.share}, 4);
	otui.GalleryAssetActions.register({'name' : 'addToLightbox', 'text' : otui.tr('Add to lightbox'), 'img' : {desktop: 'style/img/action_add_to_lightbox24.svg', tablet: 'style/img/add_to_lightbox16_sprite.png', phone: 'style/img/action_addto_lightbox24.svg'}, 'select' : AssetActions.addToLightbox, 'setup' : AssetActions.setupAddToLightbox}, 5);
	otui.GalleryAssetActions.register({'name' : 'addToFolder', 'text' : otui.tr('Copy/Move to folder'), 'img' : {desktop: './style/img/action_add_to_folder24.svg', tablet: './style/img/add_to_folder16_sprite.png', phone: './style/img/action_move24.svg'}, 'setup' : AssetActions.setupAdd, 'select' : AssetActions.addToFolder}, 6);
	otui.GalleryAssetActions.register({'name' : 'showProperties', 'text' : otui.tr('Show properties'), 'img' : './style/img/view_details24.svg', 'setup' : AssetActions.setupShowProperties, 'select' : AssetActions.showProperties}, 7);
	otui.GalleryAssetActions.register({'name' : 'removefromfolder', 'text' : otui.tr('Remove from folder'), 'img' : './style/img/action_remove_from_folder24.svg', 'select' : AssetActions.removeFromFolder, 'setup' : AssetActions.setupRemoveFromFolder}, 8);
	otui.GalleryAssetActions.register({'name' : 'copyShortLink', 'text' : otui.tr('Copy short link'), 'img' : {desktop: './style/img/action_link24.svg', tablet: './style/img/generate_short_link16.png', phone: './style/img/generate_short_link24.svg'}, 'setup' : AssetActions.setupCopyShortLink, 'select' : AssetActions.copyShortLink}, 9);
	otui.GalleryAssetActions.register({'name' : 'editProperties', 'text' : otui.tr('Edit properties'), 'img' : './style/img/action_edit24.svg', 'setup' : AssetActions.setupEditProperties, 'select' : AssetActions.editProperties}, 10);
	otui.GalleryAssetActions.register({'name' : 'duplicate', 'text' : otui.tr('Duplicate'), 'img' : './style/img/action_duplicate24.svg', 'select' : AssetActions.duplicate, 'setup' : AssetActions.setupDuplicate}, 11);
	otui.GalleryAssetActions.register({'name' : 'delete', 'text' : otui.tr('Delete'), 'img' : './style/img/action_delete24.svg', 'select' : AssetActions.deleteAssets, 'setup' : AssetActions.setupDelete}, 12);
	otui.GalleryAssetActions.register({'name' : 'undelete', 'text' : otui.tr('Undelete'), 'img' : './style/img/action_undelete24.svg', 'select' : AssetActions.undelete, 'setup' : AssetActions.setupUndelete}, 13);
	//otui.GalleryAssetActions.register({'name' : 'foldertemplates', 'text' : otui.tr('Manage templates'), 'img' : './style/img/action_template_manage24.svg', 'select' : AssetActions.manageTemplates, 'setup' : AssetActions.setupManageTemplates}, 14);
	otui.GalleryAssetActions.register({'name' : 'checkout', 'text' : otui.tr('Check-out'), 'img' : {desktop: './style/img/action_check_out24.svg', tablet: './style/img/checked_out16_sprite.png', phone: './style/img/action_checkout24.svg'}, 'select' : AssetActions.checkOut, 'setup' : AssetActions.setupCheckOut}, 15);
	otui.GalleryAssetActions.register({
		'name': 'checkin',
		'text': otui.tr('Check-in'),
		'img': './style/img/action_check_in24.svg',
		'select': AssetActions.checkIn,
		'setup': AssetActions.setupCheckIn
	}, 16);
	otui.GalleryAssetActions.register({'name' : 'cancelcheckout', 'text' : otui.tr('Discard check-out'), 'img' : {desktop: './style/img/action_discard_checkout24.svg', tablet: './style/img/discard_checkout16_sprite.png', phone: './style/img/discard_checkout16_dis_2x.png'}, 'select' : AssetActions.cancelCheckOut, 'setup' : AssetActions.setupCancelCheckOut}, 17);
	otui.GalleryAssetActions.register({'name' : 'subscribe', 'text' : otui.tr('Subscribe'), 'img' : './style/img/action_subscribe24.svg', 'select' : AssetActions.subscribe, 'setup' : AssetActions.setupSubscribe}, 18);
	otui.GalleryAssetActions.register({'name' : 'unsubscribe', 'text' : otui.tr('Unsubscribe'), 'img' : './style/img/action_unsubscribe24.svg', 'select' : AssetActions.unsubscribe, 'setup' : AssetActions.setupUnsubscribe}, 19);
	//otui.GalleryAssetActions.register({'name' : 'link', 'text' : otui.tr('Link to assets'), 'img' : './style/img/link16_sprite.png', 'select' : AssetActions.linkToAssets, 'setup' : AssetActions.setupLinkToAssets}, 17);
	otui.GalleryAssetActions.register({'name' : 'attachContent', 'text' : otui.tr('Attach Content'), 'img' : './style/img/upload24.svg', 'select' : AssetActions.attachContent, 'setup' : AssetActions.setupAttachContent}, 20);
	otui.GalleryAssetActions.register({'name' : 'removeFolderThumbnail', 'text' : otui.tr('Remove thumbnail'), 'img' : {desktop: './style/img/remove_thumbnail24.svg', tablet: './style/img/remove_thumbnail16_sprite.png', phone: './style/img/remove_thumbnail16_sprite.png'}, 'select' : AssetActions.removeFolderThumbnail, 'setup' : AssetActions.setupremoveFolderThumbnail}, 21);
	otui.GalleryAssetActions.register({'name' : 'setasfolderthumbnail', 'text' : otui.tr('Set as folder thumbnail'), 'img' : './style/img/set_folder_thumbnail24.svg', 'select' : AssetActions.setAsFolderThumbnail, 'setup' : AssetActions.setupSetAsFolderThumbnail}, 22);
	otui.GalleryAssetActions.register({'name' : 'setasvideothumbnail', 'text' : otui.tr('Assign as thumbnail'), 'img' : './style/img/set_folder_thumbnail24.svg', 'select' : AssetActions.setAsVideoThumbnail, 'setup' : AssetActions.setupSetAsVideoThumbnail}, 23);
	otui.GalleryAssetActions.register({'name' : 'attachPreview', 'text' : otui.tr('Attach preview'), 'img' : './style/img/action_attach_preview24.svg', 'setup' : AssetActions.setupAttachPreview, 'select' : AssetActions.attachPreview}, 24);
	otui.GalleryAssetActions.register({'name' : 'generateembedcode', 'text' : otui.tr('Generate embed code'), 'img' : './style/img/set_as_video_thumbnail24.svg', 'select' : AssetActions.generateEmbedCode, 'setup' : AssetActions.setupGenerateEmbedCode}, 25);
	otui.GalleryAssetActions.register({'name' : 'showfolderpath', 'text' : otui.tr('Show folder path'), 'img' : './style/img/copy_folder_path24.svg', 'select' : AssetActions.showFolderPath, 'setup' : AssetActions.setupShowFolderPath}, 26);
	otui.GalleryAssetActions.register({'name' : 'reviewassets', 'text' : otui.tr('Quick review'), 'img' : './style/img/manage_review24.svg', 'select' : AssetActions.quickReview, 'setup' : AssetActions.setupQuickReview}, 29);
	otui.GalleryAssetActions.register({'name' : 'retranscode', 'text' : otui.tr('Retranscode'), 'img' : './style/img/video_retranscode_thumbnail24.svg', 'select' : AssetActions.retranscode, 'setup' : AssetActions.setupRetranscode}, 30);
	otui.GalleryAssetActions.register({'name' : 'schedule', 'text' : otui.tr('Schedule'), 'img' : './style/img/calendar24.svg', 'select' : AssetActions.schedule, 'setup' : AssetActions.setupFolderSchedule}, 31);
	otui.GalleryAssetActions.register({'name' : 'expire', 'text' : otui.tr('Expire'), 'img' : './style/img/action_assets_expire_thumbnail24.svg', 'select' : AssetActions.expire, 'setup' : AssetActions.setupExpire}, 32);
	otui.ActionViewRegistry.register(otui.ActionViewRegistry.VIEWTYPE.ASSET_MENU, otui.GalleryAssetActions, AssetActions.registrySetupFn);
	otui.GalleryAssetActions.register({'name' : 'approveinhightail', 'text' : otui.tr('Approve with Hightail'), 'img' : 'style/img/approve24.svg', 'select' : AssetActions.approveInHightail, 'setup' : AssetActions.setupApproveInHightail}, 33);
	otui.GalleryAssetActions.register({'name' : 'smartcompose', 'text' : otui.tr('Smart compose'), 'img' : 'style/img/approve24.svg', 'select' : AssetActions.smartCompose, 'setup' : AssetActions.setupSmartCompose}, 34);
	otui.ready(function()
			{
			if (otui.JobsManager)
				{
				if (otui.UserFETManager.isTokenAvailable("JOB_INITIATOR") || otui.UserFETManager.isTokenAvailable("JOB_PARTICIPANT"))
				{
					otui.GalleryAssetActions.register(
						{
							'name' : 'addtoexistingjob',
							'text' : otui.tr("Add to job"),
							'img' : 'style/img/manage_review24.svg',
							'setup' : AssetActions.setupAddToExistingJob,
							'select' : AssetActions.addToExistingJob
						}
						,27);
				}

				if (otui.UserFETManager.isTokenAvailable("JOB_INITIATOR"))
				{
					otui.GalleryAssetActions.register(
						{
							'name' : 'addtonewjob',
							'text' : otui.tr("New job"),
							'img' : 'style/img/manage_review24.svg',
							'setup' : AssetActions.setupAddToNewJob,
							'select' : AssetActions.addToNewJob
						}
						,28);
				}
					

			}
		}, true);

});;