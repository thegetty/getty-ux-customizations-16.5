(function(exports) {
	/**
	 * Provides CRUD operations on User Details which will be useful while
	 * export and some other places using REST API.
	 */
	var GtUserGroupManager = exports.GtUserGroupManager = function GtUserGroupManager() {
	};
	var _userGroups;

	var _loadGettyUserGroups = function _loadGettyUserGroups(ready) {
		serviceUrl = otui.service + "/usergroups/me"
			otui.get(serviceUrl, undefined, otui.contentTypes.json, function(
					response) {
				_userGroups = response.user_groups_resource.user_group_list
				ready()
			});
	};

	GtUserGroupManager.getUserGroups = function(callback) {
		var userRoles = []
		_userGroups.forEach(function(usergroup) {
			userRoles.push(usergroup.name)
		});
		return callback(userRoles)
	};
	
	otui.onLogin(_loadGettyUserGroups);

})(window)