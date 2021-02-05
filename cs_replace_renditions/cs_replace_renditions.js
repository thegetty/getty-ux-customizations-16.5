(function(otui) {
	function replaceRenditions(event, resource, parent) {
		if (resource) {
			event.stopPropagation();
			otui.NotificationManager.showNotification({
				'message' : "Executing replace renditions request.",
				'status' : "information"
			});
			RenditionsManager.replaceRenditions(resource.asset_id, function(
					success) {
				if (success) {
					parentView = otui.Views.containing(parent);
					parentView.reload();
				} else {
					otui.NotificationManager.showNotification({
						'message' : "Replace rendition has failed",
						'status' : "error"
					});
				}
			})
		}
	}

	function isEligible(usergroups) {
		is_eligible = false;
		usergroups.forEach(function(usergroup) {
			if (usergroup === 'Administrators'
					|| usergroup === 'Asset Administrators') {
				is_eligible = true
			}
		});
		return is_eligible;
	}

	function setupReplaceRenditions(event, resource, parent) {
		if (!resource)
			return false;
		var is_eligible = GtUserGroupManager.getUserGroups(isEligible)
		var isFolder = (otui.resourceAccessors.type(resource) == 'folder');
		var show = is_eligible && !isFolder && !resource.deleted
				&& resource.content_state !== "SEL_DEL"
				&& resource.content_state !== "DELETED"
	}

	otui.ready(function() {
		var entry = {
			'name' : 'replace_renditions',
			'text' : 'Replace Renditions',
			'select' : replaceRenditions,
			'setup' : setupReplaceRenditions
		};
		otui.GalleryAssetActions.register(entry);
		otui.InspectorAssetActions.register(entry);
	});
})(otui);