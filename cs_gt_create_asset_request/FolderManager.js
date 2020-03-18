(function(exports)
{
	/**
	 * The FolderManager object interfaces with the REST API services using standard CRUD methodology, and serves as the caching mechanism to manage and provide access to folder objects.
	 * @namespace FolderManager
	 */
    var FolderManager = exports.FolderManager = function FolderManager(){};

    var folders = [];
    var waitQueue = {};

    FolderManager.selectedFolderID = "";
	FolderManager.getChildCounts = false;

	// Displaying the child count is not supported due to performance issues.
	/*otui.ready(function() {
		FolderManager.getChildCounts = (otui.SystemSettingsManager.getSystemSettingValue("UX", "GENERAL", "DISPLAY_FOLDER_CHILD_COUNTS") != "false");
	});*/


    FolderManager.read = function read(data, callback)
    {
    	var nodeID = data.nodeID;
		var isRoot = (nodeID == "ROOT_FOLDERS");
		var folderLimit = otui.SystemSettingsManager.getSystemSettingValue("UX", "GENERAL", "NUM_OF_FOLDERS_TO_LOAD");
		if(folderLimit ===  "-1" || folderLimit === undefined)
		{
			folderLimit = 0;
		}
		var params = ["load_type=system"]
		params.push("limit=" + folderLimit);
		//var data = {"load_metadata":"true","metadata_fields_to_return":["ARTESIA.FIELD.CONTAINER TYPE NAME","ARTESIA.FIELD.IMPORTED BY","ARTESIA.FIELD.MODEL"]};
        //var data = {};

		// ART-24462 Due to performance bottlenecks, we have disabled the "asset" child counting (This does not affect the results list). There is also the option to completely turn off the counts.
		// Once these bottlenecks are resolved, we can remove this area.
		/*if (isRoot)
			params.push('generate_child_count=' + !!(FolderManager.getChildCounts));
		else
			data['child_count_load_type'] = FolderManager.getChildCounts ? "folders" : "none";

		params.push("data_load_request=" + encodeURIComponent(JSON.stringify({"data_load_request": data})));*/

		var serviceUrl = (isRoot ? otui.service + "/folders/rootfolders/" : otui.service + "/folders/" + nodeID + "/folders") + "?" + params.join("&");

		var userID = UserDetailsManager.getUserDetails().user_id;

		otui.get(serviceUrl, undefined, otui.contentTypes.json, function(response, status, success)
        {

			if(!success)
			{
			callback(response, false);
			}
			else
			{
				var jResponse = response.folders_resource.folder_list;
				var nodes = [];

				var myFoldersID = UserDetailsManager.getUserDetails().user_id + "N";
				var myOrphansID = UserDetailsManager.getUserDetails().user_id + "Y";

				for (var i = 0; i < jResponse.length; ++i)
				{
					var node = jResponse[i];
					// If hideOrphans is true and we receive My Orphans/ Public Orphans from server then skip it. 
					if(data.hideOrphans && (node.asset_id === myOrphansID || node.asset_id === "ARTESIA.PUBLIC.TREEY"))
						continue;
					if((node.asset_id != myFoldersID && node.asset_id != "ARTESIA.PUBLIC.TREEY") || ((node.asset_id == myFoldersID && otui.UserFETManager.isTokenAvailable("FOLDER.CREATE")) || (node.asset_id == "ARTESIA.PUBLIC.TREEY" && otui.UserFETManager.isTokenAvailable("FOLDER.PUBLIC_ORPHANS"))))
					{
						var counts = jResponse[i].container_child_counts;

						var childCount = 1;
						var totalCount = 1;
						if (counts)
						{
							childCount = counts.container_count || 0;
							totalCount = childCount + counts.asset_count;
						}
						else
						{
							childCount = isRoot ? 1 : 0;
							totalCount = isRoot ? 1 : 0;
						}

						// Root folders have orphans folders which don't appear with the counts, so make sure they have at least one.
						// Also if we don't have child counting switched on, then hardcode it to 1.
						if (isRoot || !FolderManager.getChildCounts)
							childCount = childCount || 1;

						node.container_child_count = childCount;
						node.total_child_count = totalCount;
						nodes.push(node);
					}
					if(node.asset_id == "ARTESIA.PUBLIC.TREEY") node.name = otui.tr("Public Orphans");
					if(node.asset_id == "ARTESIA.PUBLIC.TREEN") node.name = otui.tr("Public Folders");
					if(node.asset_id == myOrphansID) node.name = otui.tr("My Orphans");
					if(node.asset_id == myFoldersID) node.name = otui.tr("My Folders");
				}

				callback(nodes, success);
			}
		});
    };
    // comment for localized folder name by use regular translation
    // FolderManager.getFoldersNames = function(names, foldernames, description)
    // {
    //   for (var i in foldernames){
    //     var tmp={};
		// 		tmp.purpose = description;
		// 		tmp.name = foldernames[i].name;
		// 		names.push(tmp);
    //   }
    // }
    
    // FolderManager.getURLDataForTranslation = function(serviceUrl)
		//   {
		// 			return new Promise(function(resolve, reject){
		// 				otui.OTMMHelpers.getDBresponse(serviceUrl).then(function(response)
		// 					{
		// 							resolve(response);
		// 					})
		// 					.catch(function(err)
		// 					{
		// 							reject(err);
		// 					});
		// 		});
		// 	}
    
    // FolderManager.getTextForTranslation = function()
    // {
    //   return new Promise(function(resolve, reject)
    //     {
    //       var text = [], promisesArray = [];
    //       var serviceUrl = otui.service + "/folders/rootfolders/?load_type=system&limit=0";
    //       promisesArray.push(FolderManager.getURLDataForTranslation(serviceUrl));
    //       
    //       otui.OTMMHelpers.getDBresponse(serviceUrl).then(function(response)
    //       {
    //         var jResponse = response.folders_resource.folder_list;
    //         var serviceUrlArray = [];
    //         for (var i = 0; i < jResponse.length; ++i)
    // 				{
    //           serviceUrlArray[i] = otui.service + "/folders/" + jResponse[i].asset_id + "/folders?load_type=system&limit=0";
    //           promisesArray.push(FolderManager.getURLDataForTranslation(serviceUrlArray[i]));
    //         }
    //         return promisesArray;
    //       }).then(function(promisesArray)
    //         {
    //           Promise.all(promisesArray.map(function(item, index)
    //   				{
    //             item.then(function(data){
    //                 FolderManager.getFoldersNames(text, data.folders_resource.folder_list, "Folders name");
    //                 resolve(text);
    //             })
    //     				.catch(function(err)
    //     				{
    //     					reject(err);
    //     				});
    //           }));
    //         });
    // 
    //   });
    //   
    // }

    FolderManager.isFolder = function(resource)
    {
    	return (otui.resourceAccessors.type(resource) == 'folder');
    };
    
    FolderManager.setFolderThumbnail = function setFolderThumbnail(folderID, blob, renditionType, callback)
    {
    	var serviceUrl = otui.service + "/folders/" + folderID + "/contents";

    	var data = new FormData();

    	data.append("rendition_type", renditionType);
    	data.append("file", blob, "renditionfile");

    	otui.post(serviceUrl, data, otui.contentTypes.multipart, function(serverData, status, success)
    	{
    		callback(serverData, status, success);
    	});
    };

    FolderManager.removeFolderThumbnail = function removeFolderThumbnail(folderID, callback)
    {
    	var serviceUrl = otui.service + "/folders/" + folderID + "/contents";

    	otui.del(serviceUrl, function(data, status, success)
    	{
    		callback(data, success);
    	});
    };

    FolderManager.createFolder = function createFolder(props)
    {
    	console.log("Create Folder")
    	var serviceUrl = otui.service + "/folders/" + props.folderID;

    	var data = {"folder_resource" : {"folder":{"name": props.name, "container_type_id": props.type}}};

    	if(props.securityPolicies)
    	{
    		var securityPolicies = [];

    		for(var securityPolicy in props.securityPolicies)
    		{
    			securityPolicies.push({"id" : props.securityPolicies[securityPolicy]});
			}

    		data.folder_resource.folder.security_policy_list = securityPolicies;
    	}

		if (props.metadata)
			{
			jQuery.extend(true, data, props.metadata);
			}

		otui.post(serviceUrl, JSON.stringify(data), otui.contentTypes.json, function(response, status, success)
		{
			var message = otui.tr("Folder created successfully.");
			var stayOpen = false;
			var status = "ok";

			if (!success)
			{
				message = otui.tr("Unable to create new folder.");
				stayOpen = true;
				status = "error";
			}
			else
			{
				asset_id = response.folder_resource.folder.asset_id
				name = response.folder_resource.folder.name
				message = "Folder \"" + name + "\" created successfully."
				window.recent_asset_request_asset_id = asset_id;
				console.log("in folder manager " + asset_id)
				FolderManager.clearCachedFolderDataForID(props.folderID);
				if(!FolderManager.getChildCounts)
	    			response.folder_resource.folder.container_child_count = 1;
	    		
	    		var folderSidebarView = otui.main.getChildView(FolderSidebarView);
	    		if(folderSidebarView)
	    		{
	    			var folderView = folderSidebarView.getChildView(FolderView);
	    			if(folderView)
	    				folderView.addNewNodes([response.folder_resource.folder], props.folderID, true);
	    		}
			}
			
    		otui.NotificationManager.showNotification({
				'message' : message,
				'stayOpen' : stayOpen,
				'status' : status
			});
    		
    		
    	});
    };

    FolderManager.addAssetsToFolder = function addAssetsToFolder(event)
    {
    	if (FolderManager.selectedFolderID && FolderManager.selectedFolderID.length > 0)
    	{
    		var view = otui.Views.containing($(".ot-results")[0]);
				// For relationship and version tab in asset inspector view, pagination will not be there
				// so just use for folder asset action element to retrive the current view
				if(!view)
					{
					var list = $(".ot-folder-asset-actions.ot-as-list")[0];
					if (list)
						view = otui.Views.containing(list);
					}

				if(!view)
				{
					var list = $(".ot-inspectorview-asset-actions.ot-as-list")[0];
					if (list)
						view = otui.Views.containing(list);
				}

			var selectionContext = SelectionManager.getSelectionContext(view, SelectionManager.singleAssetSelection);
			
			var action = 'add';
			var fromID = '';
			//var moveAssets = $("#ot-move-assets")[0];
			//if (!moveAssets.hidden && moveAssets.checked)
			var moveAssets = $(".ot-folders-moveto-button")[0];
			if (moveAssets.selected)
			{
				action = 'move';
			
				if (view && (view instanceof FolderResultsView || view instanceof InspectorView))
				{
					var dialogView = otui.Views.containing(event.target);
					fromID = dialogView.properties.folderId;
				}
			}

			otui.services.folderChildren.update({'nodeID' : FolderManager.selectedFolderID, 'action' : action, 'fromID': fromID, 'selectionContext' : selectionContext}, function(response, success)
    		{
    			if (success && response.folder_operation_resource)
    			{
    				var numSucceeded = response.folder_operation_resource.folder_operation_result.valid_children.length;
    				var numFailed = response.folder_operation_resource.folder_operation_result.failed_children.length;
	    			var message = [];
	    			var status = 'ok';
	    			var existingCount = 0;

	    			if (numSucceeded)
	    			{
	    				if (action == 'add')
	    					message.push(otui.trn('{0} asset copied successfully.', '{0} assets copied successfully.', numSucceeded, numSucceeded));
	    				else
	    					message.push(otui.trn('{0} asset moved successfully.', '{0} assets moved successfully.', numSucceeded, numSucceeded));
	    				
						
	    				FolderManager.clearCachedFolderDataForID(FolderManager.selectedFolderID);
	    			}
	    			if (numFailed)
	    			{
	    				var errors = response.folder_operation_resource.folder_operation_result.failed_children;
						for (var i in errors)
						{
							if (errors[i].reasons[0] == "EXISTING_CHILD")
							{
								existingCount++;
							}
						}

						if (existingCount || numSucceeded) status = 'partialok';
						else status = 'error';

						if (numSucceeded == 0 && existingCount == 0)
	    				{
	    					if (action == 'add') message.push(otui.tr('No selected assets could be copied to your folder.'));
	    					else message.push(otui.tr('No selected assets could be moved to your folder.'));
	    				}
	    				else if (existingCount < numFailed)
	    				{
	    					message.push(otui.trn('{0} asset failed.', '{0} assets failed.', numFailed - existingCount, numFailed - existingCount));
	    				}
						
						if (existingCount)
						{
							if (action == 'add') message.push(otui.trn('{0} asset already exists in the selected folder.', '{0} assets already exist in the selected folder.', existingCount, existingCount));
							else message.push(otui.trn('{0} asset removed from source folder, but already existed in the selected destination folder.', '{0} assets removed from source folder, but already existed in the selected destination folder.', existingCount, existingCount));
						}
    				}

	    			if (!numSucceeded && !numFailed)
	    			{
	    				status = 'error';
	    				if (action == 'add') message.push(otui.tr('No assets could be copied.'));
	    				else message.push(otui.tr('No assets could be moved.'));
    				}

	    			otui.NotificationManager.showNotification(
					{
						'message' : message.join(" "),
						'stayOpen': (status == 'error'),
						'status' : status
					});

    			}
    			else
    			{
    				var msg = "";
    				if (action == 'add') msg = otui.tr('No assets could be copied.');
    				else msg = otui.tr('No assets could be moved.');
    				otui.NotificationManager.showNotification(
					{
						'message' : otui.tr('All assets failed to be copied/moved.'),
						'stayOpen': true,
						'status' : 'error'
					});
    			}
    			
    			if ((numSucceeded || existingCount) && action == 'move')	
    			{
					SelectionManager.clearSelection(view);
					view.properties.pageProperties.page = 0;
    				view.reload();
    			}
    		});

    		otui.DialogUtils.cancelDialog(event.target);
    	}
    };

	var _lastFolderParams = undefined;
	var _lastRecentFoldersParams = undefined;
	var _lastSelectedRecentFolders = false;
	var _lastFolderSearchParams = undefined;

	FolderManager.rememberFolder = function rememberFolder(req)
	{
		if(req.params.nodeID !== RecentArtifactsManager.RECENT_FOLDERS)
		{
			var appliedFacets = JSON.parse(req.params.appliedFacets).facets;
			_lastSelectedRecentFolders = false;
			if(appliedFacets.length == 0 && (req.params.searchConfigID == undefined || req.params.searchConfigID == "none"))
				_lastFolderParams = {'nodeID' : req.params.nodeID, 'breadcrumb' : req.params.breadcrumb, 'pageProperties' : req.params.pageProperties, 'appliedFacets' : req.params.appliedFacets, 'filterTerm' : "", 'searchConfigID' : "none", 'searchScopeID' : "none"};
			else if(!_lastFolderParams || !_lastFolderParams.pageProperties)
			{
				_lastFolderParams = {'nodeID' : req.params.nodeID, 'breadcrumb' : req.params.breadcrumb, 'appliedFacets' : req.params.appliedFacets, 'filterTerm' : "", 'searchConfigID' : "none", 'searchScopeID' : "none"};
				_lastFolderParams.pageProperties =  PageManager.createPageProperties(0, req.params.pageProperties.assetsPerPage, PageManager.userSortPrefsMap["FolderResultsView"].sortOrder, PageManager.userSortPrefsMap["FolderResultsView"].sortField);
			}
		}
		else
		{
			_lastRecentFoldersParams = {'nodeID' : req.params.nodeID, 'pageProperties' : req.params.pageProperties};
			_lastSelectedRecentFolders = true;
		}
	};

    FolderManager.getRememberedFolderParams = function()
    {
    	return _lastFolderParams;
    };

	FolderManager.getRememberedRecentFoldersParams = function()
	{
		return _lastRecentFoldersParams;
	};

    FolderManager.resetRememberedFolder = function resetRememberedFolder()
    {
    	if (_lastFolderParams && _lastFolderParams.pageProperties)
    	{
    		// Copy the parameters so they don't get altered in the properties.
    		_lastFolderParams = jQuery.extend(true, {}, _lastFolderParams);
    		_lastFolderParams.pageProperties.page = "0";
    		_lastFolderParams.pageProperties.assetsPerPage = PageManager.assetsPerPage + "";
    	}
    };

    FolderManager.rememberFolderSearch = function rememberFolderSearch(req)
    {
    	var appliedFacets = JSON.parse(req.params.appliedFacets).facets;

    	if(appliedFacets.length > 1 || (req.params.searchConfigID && req.params.searchConfigID != "none"))
    		_lastFolderSearchParams = {'nodeID' : req.params.nodeID, 'breadcrumb' : req.params.breadcrumb, 'pageProperties' : req.params.pageProperties, 'appliedFacets' : req.params.appliedFacets, 'filterTerm' : req.params.filterTerm, 'searchConfigID' : req.params.searchConfigID, 'searchScopeID' : req.params.searchScopeID, 'currentAccordion' : req.params.currentAccordion, 'advancedSearch' : req.params.advancedSearch, 'savedSearchID' : req.params.savedSearchID, 'metadataLocale' : req.params.metadataLocale};
    	else if(!_lastFolderSearchParams || !_lastFolderSearchParams.pageProperties)
    	{
    		_lastFolderSearchParams = {'nodeID' : req.params.nodeID, 'breadcrumb' : req.params.breadcrumb, 'appliedFacets' : req.params.appliedFacets, 'filterTerm' : req.params.filterTerm, 'searchConfigID' : req.params.searchConfigID, 'searchScopeID' : req.params.searchScopeID, 'currentAccordion' : 1, 'advancedSearch' : req.params.advancedSearch, 'savedSearchID' : req.params.savedSearchID, 'metadataLocale' : req.params.metadataLocale};
    		_lastFolderSearchParams.pageProperties =  PageManager.createPageProperties(0, req.params.pageProperties.assetsPerPage, PageManager.userSortPrefsMap["SearchView"].sortOrder, PageManager.userSortPrefsMap["SearchView"].sortField);
    	}

    };

    FolderManager.getRememberedFolderSearchParams = function()
    {
    	return _lastFolderSearchParams;
    };

    FolderManager.performAdvancedSearch = function(folderID, keyword, breadcrumb, searchConfigID, searchConfigName, searchConditionList, sortField, sortOrder, recentSearch, metadataLocale, searchScopeID, searchScopeName, appliedFacets)
	{
		var searchFunction = FolderResultsView.route.use("open", true);

		if(searchFunction)
		{
			var pageProperties = PageManager.createPageProperties(0, PageManager.assetsPerPage, sortOrder, sortField);
			var folderName = breadcrumb.names.join(' > ');

			var searchID = keyword;

			if (!recentSearch)
			{
				SearchManager.addRecentSearch({"type" : "advanced", "name" : otui.tr("Advanced"), "term" : searchID, "searchConfigID" : searchConfigID, "searchConfigName" : searchConfigName, "searchScopeID" : searchScopeID, "searchScopeName" : searchScopeName, "scope" : "folder", "folderName" : folderName, "folderId" : folderID, "searchConditionList" : searchConditionList, "sortField" : sortField, "sortOrder" : sortOrder, "breadcrumb" : breadcrumb});
			}

			SearchManager.clearSearchForKeyword(folderID + "_" + searchConfigID + "_" + keyword);

			if(!_lastFolderSearchParams || _lastFolderSearchParams.filterTerm != keyword)
				searchFunction('open', {'nodeID' : folderID, 'breadcrumb' : breadcrumb, 'metadataLocale' : metadataLocale, 'pageProperties' : pageProperties, 'appliedFacets' : JSON.stringify({'facets':[]}), 'currentAccordion' : 1, 'filterTerm' : keyword, 'searchConfigID' : searchConfigID, 'searchScopeID' : searchScopeID, 'savedSearchID' : 'none', 'searchFolderID' : folderID, 'advancedSearch' : JSON.stringify({'search_condition_list' : searchConditionList})});
			else
			{
				_lastFolderSearchParams.searchConfigID = searchConfigID;
				_lastFolderSearchParams.searchScopeID = searchScopeID;
				_lastFolderSearchParams.searchFolderID = folderID;
				_lastFolderSearchParams.filterTerm = keyword;
				_lastFolderSearchParams.nodeID = folderID;
				_lastFolderSearchParams.breadcrumb = breadcrumb;
				_lastFolderSearchParams.appliedFacets = appliedFacets || JSON.stringify({'facets':[]});
				_lastFolderSearchParams.advancedSearch = JSON.stringify({'search_condition_list' : searchConditionList});
				_lastFolderSearchParams.savedSearchID = 'none';
				_lastFolderSearchParams.metadataLocale = metadataLocale;
				_lastFolderSearchParams.pageProperties = pageProperties;
				searchFunction('open', _lastFolderSearchParams);
			}
		}
	};

    FolderManager.performKeywordSearch = function(term, recentSearch)
	{
    	var searchFunction = FolderResultsView.route.use("open", true);

    	var filterTerm = term || $('#searchInput').val();
    	filterTerm = filterTerm.trim();

		if (filterTerm && filterTerm.length > 0)
		{
			SearchManager.hideMegaSearch(null);

			if(searchFunction)
			{

				var savedSearchID = filterTerm.split("||savedSearch||");

				var pageProperties = PageManager.createPageProperties(0, PageManager.assetsPerPage, PageManager.userSortPrefsMap["SearchView"].sortOrder, PageManager.userSortPrefsMap["SearchView"].sortField);

				var searchConfigID;
				var searchScopeID;
				var searchConfigName;

				var currentView = otui.main.getChildView(FolderResultsView);
				var breadcrumb = recentSearch ? recentSearch.breadcrumb : currentView.properties.breadcrumb;
				var folderID = breadcrumb.ids[breadcrumb.ids.length-1];
				var folderName = breadcrumb.names.join(' > ');

				if (!recentSearch)
				{
					searchConfigID = $("#ot-search-type")[0].selectedOptions[0].id;					
					searchConfigName = $("#ot-search-type")[0].selectedOptions[0].textContent;
					searchScopeID = $("#ot-search-content")[0].selectedOptions[0].id;
					searchScopeName = $("#ot-search-content")[0].selectedOptions[0].textContent;
					// add this search to the recent searches list
					if (savedSearchID[1])
					{
						SearchManager.addRecentSearch({"type" : "saved", "name" : savedSearchID[0], "term" : filterTerm, "searchConfigID" : searchConfigID, "searchConfigName" : searchConfigName, "searchScopeID" : searchScopeID, "searchScopeName" : searchScopeName, "scope" : "folder", "folderName" : folderName, "folderId" : folderID, "breadcrumb" : breadcrumb});
					}
					else
					{
						SearchManager.addRecentSearch({"type" : "keyword", "name" : filterTerm, "term" : filterTerm, "searchConfigID" : searchConfigID, "searchConfigName" : searchConfigName, "searchScopeID" : searchScopeID, "searchScopeName" : searchScopeName, "scope" : "folder", "folderName" : folderName, "folderId" : folderID, "breadcrumb" : breadcrumb});
					}
				}
				else
				{
					searchConfigID = recentSearch.searchConfigID;
					searchScopeID = recentSearch.searchScopeID;
					if (recentSearch.folderId) folderID = recentSearch.folderId;
				}


				SearchManager.clearSearchForKeyword(folderID + "_" + searchConfigID + "_" + filterTerm);

				var folderSidebarView = otui.main.getChildView(FolderSidebarView);
				if(folderSidebarView)
					folderSidebarView.getChildView(FacetsView).properties.needsUpdate = false;
				
				var folderResultsView = otui.main.getChildView(FolderResultsView);
				if(folderResultsView)
					SelectionManager.clearSelection(folderResultsView);

				if(!_lastFolderSearchParams || _lastFolderSearchParams.filterTerm != filterTerm)
					searchFunction('open', {'nodeID' : folderID, 'breadcrumb' : breadcrumb,'pageProperties' : pageProperties, 'savedSearchID' : savedSearchID[1] || 'none', 'advancedSearch' : JSON.stringify({"search_condition_list" : undefined}), 'appliedFacets' : JSON.stringify({'facets':[]}), 'currentAccordion' : 1, 'filterTerm' : filterTerm, 'searchConfigID' : searchConfigID, 'searchScopeID' : searchScopeID});
				else
				{
					_lastFolderSearchParams.searchConfigID = searchConfigID;
					_lastFolderSearchParams.searchScopeID = searchScopeID;
					_lastFolderSearchParams.filterTerm = filterTerm;
					_lastFolderSearchParams.nodeID = folderID;
					_lastFolderSearchParams.breadcrumb = breadcrumb;
					_lastFolderSearchParams.appliedFacets = JSON.stringify({'facets':[]});
					_lastFolderSearchParams.advancedSearch = JSON.stringify({"search_condition_list" : undefined});
					_lastFolderSearchParams.savedSearchID = savedSearchID[1] || 'none';
					searchFunction('open', _lastFolderSearchParams);
				}
			}
		}
	    else
		{
			SearchManager.toggleMegaSearch();
		}
	};

    FolderManager.resetRememberedFolderSearch = function resetRememberedFolder()
    {
    	if (_lastFolderSearchParams && _lastFolderSearchParams.pageProperties)
    	{
    		// Copy the parameters so they don't get altered in the properties.
    		_lastFolderSearchParams = jQuery.extend(true, {}, _lastFolderSearchParams);
    		_lastFolderSearchParams.pageProperties.page = "0";
    		_lastFolderSearchParams.pageProperties.assetsPerPage = PageManager.assetsPerPage + "";
    	}
    };

	FolderManager.route = function route()
		{
		if (!_lastFolderParams && !_lastSelectedRecentFolders)
			{
			var foldersViewFunction = FolderView.route.use("open");
			foldersViewFunction('open');
			}
		else
			{
			if(_lastSelectedRecentFolders)
				{
				var recentFoldersResultsViewFunction = RecentFoldersResultsView.route.use("open");
				recentFoldersResultsViewFunction('open', _lastRecentFoldersParams);
				}
			else
				{
				var foldersResultsViewFunction = FolderResultsView.route.use("open");
				foldersResultsViewFunction('open', _lastFolderParams);
				}
			}
		};

    otui.registerService('folderTree', FolderManager);

    function readFolderData(nodeID, fullPath, callback)
    {
    	var dataLoadRequest;
    	if (fullPath){
    		dataLoadRequest = {'child_count_load_type' : 'both', 'load_path_with_children' : true};
    	}
    	else
    	{
			dataLoadRequest = {'child_count_load_type' : 'both', 'load_path' : true};
    	}
		// We need to get the number of child assets and folders for this folder
		var serviceUrl = "/folders/" + nodeID + '?load_type=custom&data_load_request=' + encodeURIComponent(JSON.stringify({'data_load_request' : dataLoadRequest}));
		otui.get(otui.service + serviceUrl, undefined, otui.contentTypes.json, function(response, status, success)
			{
			if (!success)
				callback(response, false);
			else
				{
				PageManager.numTotalChildren[nodeID] = response.folder_resource.folder.container_child_counts.total_child_count;

				var folderData = response.folder_resource.folder;
				FolderManager.updateFolderData(nodeID, folderData);

				callback(folderData, true);
				}
			});
    }
	
    function doFolderChildrenRead(data, callback, view)
    	{
    	var nodeID = data.nodeID;

    	var cachedData = FolderManager.getCachedFolderData(nodeID);
			
    	var after = function after(folderData)
    		{
			if (view)
    			view.storedProperty("folderData", folderData);

    		var preferenceName = PageManager.getFieldPreferenceName(view.properties.templateName);
			var extraFields = PageManager.getExtraFields();

			var pageProperties = data.pageProperties;
			var assetsPerPage = +(pageProperties.assetsPerPage);
				
    		AssetManager.getAssets(data.nodeID, data.pageProperties, assetsPerPage, preferenceName, extraFields, callback, data.isWidget);
    		};
	   
		var folderSidebarView = typeof FolderSidebarView === 'undefined' ? undefined : otui.main.getChildView(FolderSidebarView);
		var fullPath = false;
//		if(cachedData && (!cachedData.path_list[0].parents || cachedData.path_list[0].parents && !cachedData.path_list[0].parents.length) && folderSidebarView && !folderSidebarView.getChildView(FolderView).model.find(nodeID))
//		{
//			cachedData = undefined;
//			FolderManager.clearCachedFolderDataForID(nodeID);
//			fullPath = true;
//		}
		if(folderSidebarView && !folderSidebarView.getChildView(FolderView).model.find(nodeID))
		{
			cachedData = undefined;
			FolderManager.clearCachedFolderDataForID(nodeID);
			fullPath = true;
		}
			
		if (cachedData && nodeID !== RecentArtifactsManager.RECENT_FOLDERS)
		{
    		after(cachedData);
		}
    	else
    		{
			if(nodeID === RecentArtifactsManager.RECENT_FOLDERS)
				{
				otui.services.recentfolderswithpathlist.read({'nodeID' : nodeID}, callback, this);
				}
			else
				{
				readFolderData(nodeID, fullPath, function(response, success)
					{
					if (!success)
						callback(response, false);
					else
						after(response);
					});
				}
		    }
    	}

    function doFolderChildrenSearch(data, callback, view, pageID, appliedFacets)
    	{
    	var preferenceName = PageManager.getFieldPreferenceName(view.properties.templateName);
		var extraFields = PageManager.getExtraFields();

		var filterTerm = data.filterTerm || "*";
    	SearchManager.getFolderAssetsByKeyword(filterTerm, data.pageProperties.page, data.pageProperties.assetsPerPage, preferenceName, extraFields, data, function(results, totalItems, success)
    			{
    			PageManager.numTotalChildren[pageID] = totalItems;
    			callback(results, success);
    			});
    	}

    function folderChildrenRead(data, callback, view)
    	{
		//returing if the user does not have FOLDER.VIEW FET.
    	if(!otui.UserFETManager.isTokenAvailable("FOLDERS.VIEW")) 
    	{
	    	view.storedProperty("no-results-msg", "You do not have permission to view folders.");
	    	view.contentArea()[0].querySelector('.ot-results-header').remove();
	    	callback();
	    	return;
    	}
    	var nodeID = data.nodeID;
    	// TODO Why do we need to JSON parse applied facets here?
    	var appliedFacets = {'facets':[]};
    	if(data.appliedFacets)
    		appliedFacets = JSON.parse(data.appliedFacets);

    	var hasFacets = !!(appliedFacets.facets.length);
    	var hasSearchTerms = (data.searchConfigID != undefined && data.searchConfigID != "none");

    	var pageID = nodeID;

    	if((hasFacets || hasSearchTerms) && (("searchConfigID" in data) || data.searchID))
    		pageID += "_" + data.searchConfigID + "_" + data.filterTerm;

    	PageManager.savePageData(pageID, data.pageProperties);

    	var needsSearch = hasFacets || hasSearchTerms;

    	var sendResults = function sendResults(response, success)
    		{
    		PageManager.updatePaging(view, pageID);
    		
    		var numTotalChildren = data.pageProperties.assetsPerPage * data.pageProperties.page + response.length;
    		var lastPage = view.properties.ot_start_page == view.properties.ot_end_page;
    		
    		if(lastPage && numTotalChildren != PageManager.numTotalChildren[pageID])
    		{
    			PageManager.numTotalChildren[pageID] = numTotalChildren;
    			PageManager.updatePaging(view, pageID);
    		}
    		
    		if(lastPage && response.length == data.pageProperties.assetsPerPage)
    		{
    			FolderManager.clearCachedFolderDataForID(nodeID);
    			FolderManager.getFolderData(nodeID, function(folderData)
    			{
    				PageManager.updatePaging(view, pageID);
    			}, true);
    		}
    		
			if(!view.properties.folderData)
			{
				FolderManager.getFolderData(nodeID, function(folderData)
    			{
    				view.storedProperty("folderData", folderData);
					
//					var cachedData = FolderManager.getCachedFolderData(nodeID);
//					
//					if(!cachedData)
//						expandFolderTree(folderData);
					
    			}, true);
			}
//			else
//				expandFolderTree(view.properties.folderData);
				
    		PageManager.pageProperties[pageID] = data.pageProperties;
    		callback(response, success);
    		}

    	if (needsSearch)
    		doFolderChildrenSearch(data, sendResults, view, pageID, appliedFacets);
    	else
    		doFolderChildrenRead(data, sendResults, view);
    	}

    otui.registerService('folderChildren', {
    	'read' : folderChildrenRead,
    	'update' : function(data, callback)
    		{
    		var nodeID = data.nodeID;
    		var action = data.action || 'add';
    		var fromID = data.fromID;

    		var selectionContext = data.selectionContext;
    		var assetIDs = data.assetIDs;

    		if (selectionContext && assetIDs)
    			throw "Cannot specify both a selection context and asset IDs";

    		if (!selectionContext && !assetIDs)
    			throw "Must specify one of selectionContext or assetIDs";

    		if (action == 'move' && !fromID)
    			throw "Must specify fromID if moving assets";

    		var params = {'type' : action};

    		if (selectionContext)
    			params.selection_context = JSON.stringify(selectionContext);
    		else if (assetIDs)
    			{
    			if (!Array.isArray(assetIDs))
    				assetIDs = [assetIDs];
    			params.asset_ids = assetIDs.join(",");
    			}

    		if (action == 'move' && fromID)
    			params.parent_id = fromID;

    		var serviceUrl = "/folders/" + nodeID + '/children';

    		otui.put(otui.service + serviceUrl, params, otui.contentTypes.formData, function(response, status, success)
    			{
    			callback(response, success);
    			});
    		}
    });

    /**
	  * This function returns whether the folder has permissions to upload assets or not
	  * @param nodeID
	  * @returns folderPermissions
	  */
	FolderManager.folderCanContainAssets = function folderCanContainAssets(folder) {
		var folderType = folder.container_type_id;
		var folderPermissions = false;
		if (folderType !== undefined) {
			folderPermissions = FolderTypesManager.canUploadAssets(folderType);
		}
		return folderPermissions;
	};

	/**
	  * This function returns whether the folder has permission to edit content or not
	  * @param nodeID
	  * @returns isEditContentPermission
	  */
	FolderManager.canEditFolder = function canEditFolder(folder) {
		// Check for edit content permission for a given folder.
		var permissionArray = null;
		var isEditContentPermission = false;
		if (folder.access_control_descriptor !== undefined) {
			permissionArray = folder.access_control_descriptor.permissions_map.entry;

			$.each(permissionArray, function(index, value) {
			if(value.key === "text.securityPolicy.permission.ContentEditPermission") {
				isEditContentPermission = value.value;
				return;
				}
			});

		  }
		  return isEditContentPermission;
	};


	/**
	  * This function returns whether the folder is marked for Deletion. Assets should not be uploaded in this type of folders.
	  * @param response
	  * @returns folderPermissions
	  */
	FolderManager.isFolderMarkedForDeletion = function isFolderMarkedForDeletion(folder) {
		var folderPermissions = false;
		if (folder !== undefined) {
			if(folder.asset_state === "LOCKED" && folder.content_state === "DELETED"){
				folderPermissions = true;
			}
		}
		return folderPermissions;
	};

	/**
	  * This function returns whether the folder is container children restricted. Sub folders should not be created in this type of folders.
	  * @param response
	  * @returns  containerChildrenRestricted
	  */
	
	FolderManager.isContainerChildrenRestricted = function isContainerChildrenRestricted(folder) {
		var containerChildrenRestricted = false;
		var folderTypeObj = FolderTypesManager.getFolderTypeById(folder.container_type_id);
		if(folderTypeObj && folderTypeObj.container_children_restricted && !folderTypeObj.child_types[0]) {
			containerChildrenRestricted = true;
		}
		return containerChildrenRestricted;
		
	};

	FolderManager.disableUploadForNode = function disableUploadForNode(nodeID) {

			var userID = UserDetailsManager.getUserDetails().user_id;

			if (nodeID == "ARTESIA.PUBLIC.TREEY" || nodeID == userID + "Y"
					|| nodeID == "ARTESIA.PUBLIC.TREEN" || nodeID == userID + "N"
					|| nodeID === RecentArtifactsManager.RECENT_FOLDERS || otui.UploadUtils.inTransfer()) {
				return true;
			}

			return false;
	};

    FolderManager.isRootFolder = function(id)
    {
        return (FolderManager.isPublicFolders(id) || FolderManager.isMyFolders(id));
    };

    FolderManager.isOrphanFolder = function(id)
    {
        return (FolderManager.isPublicOrphan(id) || FolderManager.isPrivateOrphan(id));
    };

	FolderManager.isMyFolders = function(id)
	{
		var userID = UserDetailsManager.getUserDetails().user_id;

		return id == (userID + "N");
	};

	FolderManager.isPublicFolders = function(id)
	{
		return id == "ARTESIA.PUBLIC.TREEN";
	};

	FolderManager.isPublicOrphan = function(id)
	{
		return id == "ARTESIA.PUBLIC.TREEY";
	};

	FolderManager.isPrivateOrphan = function(id)
	{
		var userID = UserDetailsManager.getUserDetails().user_id;

		return id == (userID + "Y");
	};

	FolderManager.folderSupportsFolderCreation = function(data)
	{
		var isMarkedForDeletion = FolderManager.isFolderMarkedForDeletion(data);
		var isChildrenRestricted = FolderManager.isContainerChildrenRestricted(data);
		return otui.UserFETManager.isTokenAvailable("FOLDER.CREATE") && !FolderManager.isPrivateOrphan(data.asset_id) && !FolderManager.isPublicOrphan(data.asset_id) && !isMarkedForDeletion && !isChildrenRestricted;
	};

	FolderManager.folderSupportsUploading = function nodeSupportsUploading(data) {
		var canContainAssets = FolderManager.folderCanContainAssets(data);
		var canEditFolder = FolderManager.canEditFolder(data);
		var isMarkedForDeletion = FolderManager.isFolderMarkedForDeletion(data);

		var nodeID = data.asset_id;

		return !(FolderManager.disableUploadForNode(nodeID)) && canContainAssets && canEditFolder && !isMarkedForDeletion;
	}

	FolderManager.updateFolderData = function updateFolderData(nodeID, data) {
		folders[nodeID] = data;

		var waiting = waitQueue[nodeID];
		if (waiting) {
			waiting.forEach(function(waiter) {
				waiter(data);
			});
		}

		delete waitQueue[nodeID];
	};

	var folderReqs = {};

	FolderManager.getFolderData = function getFolderData(nodeID, callback, doRequest) {
		if (folders[nodeID])
		{
			var clone = {};
			jQuery.extend(true, clone, folders[nodeID]);
			xtag.requestFrame(function() { callback(clone) });
		}
		else {
			var waiting = waitQueue[nodeID] || (waitQueue[nodeID] = []);
			waiting.push(callback);

			if (doRequest && !folderReqs[nodeID])
				{
				folderReqs[nodeID] = true;
				var folderSidebarView = typeof FolderSidebarView === 'undefined' ? undefined : otui.main.getChildView(FolderSidebarView);
				var fullPath = false;
				if(folderSidebarView && !folderSidebarView.getChildView(FolderView).model.find(nodeID))
					fullPath = true;
				readFolderData(nodeID, fullPath, function(response, status) {
					if(!status && callback) {
						callback(response);
						FolderManager.clearCachedFolderDataForID(nodeID);
					}
				});
				}
		}
	};

	FolderManager.cacheURLBreadcrumb = function cacheURLBreadcrumb(breadcrumb)
		{
		var accessor = breadcrumb.ids.join("/");
		if (!(accessor in breadcrumbCache))
			breadcrumbCache[accessor] = breadcrumb;
		}
	
	FolderManager.getCachedURLBreadcrumb = function getCachedURLBreadcrumb(ids)
	{
		var accessor = ids.join("/");
		return breadcrumbCache[accessor];
	}
	
	FolderManager.clearCachedURLBreadcrumb = function getCachedURLBreadcrumb(ids)
	{
		var accessor = ids.join("/");
		delete breadcrumbCache[accessor];
	}
	
	FolderManager.handleURLBreadcrumb = function handleURLBreadcrumb(ids, lastName)
		{
		var id = ids[ids.length-1];
		
		var accessor = ids.join("/");
		if (accessor in breadcrumbCache)
			return breadcrumbCache[accessor];
		
		if (folders[id])
			return FolderManager.getFolderBreadcrumb(folders[id], ids);
		
		var names = new Array(ids.length);
		names[names.length-1] = lastName;
		return {'names' : names, 'ids' : ids, 'incomplete' : true};
		}
	
	var pathCache = {};
	var breadcrumbCache = {};
	
	function matchPath(pathlist, ids) {
		var accessor = ids.join("/");
		if (accessor in pathCache)
			return pathCache[accessor];
		
		var paths = pathlist.slice(0);
			
		for (var i = ids.length-2, j = 0; i >= 0 && paths.length > 1; --i, ++j) {
			var id = ids[i];
			paths = paths.reduce(function(match, path) {
				if (path.parents.length > 0 && path.parents[j].id == id)
					match.push(path);
				
				return match;
			}, []);
		}
		
		if (paths.length == 1)
			pathCache[accessor] = paths[0];
		
		return paths[0];
	}

	FolderManager.getFolderBreadcrumb = function getFolderBreadcrumb(data, ids)
		{
		var userDetails = UserDetailsManager.getUserDetails();
		var userID = userDetails.user_id;
		var path;
		
		if (data.path_list) {
			// If we don't have a list of IDs for this path, or there's only one path, then just choose the first one and be done with it.
			if (!ids || data.path_list.length == 1)
				path = data.path_list[0];
			else {
				path = matchPath(data.path_list, ids);
			}
		} else
			{
			// If there's no path list provided, see if we can mock one up.
			var nodeID = data.asset_id;
			
			if (nodeID === "ARTESIA.PUBLIC.TREEN" || nodeID === "ARTESIA.PUBLIC.TREEY" || nodeID === (userID + "N") || nodeID === (userID + "Y"))
				path = {'tree_descriptor' : {'tree_id' : nodeID }, 'parents' : []};
			}
		var breadcrumb;

		if (path) 
			{
			breadcrumb = {};
			breadcrumb.names = [];
			breadcrumb.ids = [];
			
			if(path.parents && path.parents.length)
			{
				var lastFolderId = path.parents[path.parents.length-1].id;
				var firstFolderId = path.parents[0].id;
				if((FolderManager.isPublicFolders(lastFolderId) || FolderManager.isMyFolders(lastFolderId))
				  || (!(FolderManager.isPublicFolders(lastFolderId) || FolderManager.isMyFolders(lastFolderId))
					  && !(FolderManager.isPublicFolders(firstFolderId) || FolderManager.isMyFolders(firstFolderId))))
					path.parents.reverse();
			}
				
			if((path.parents && !path.parents.length) || (path.parents.length && !path.parents[0].children))
			{
				var treeID = path.tree_descriptor.tree_id;
				var treeName = undefined;

				if (treeID === "ARTESIA.PUBLIC.TREE" || treeID === "ARTESIA.PUBLIC.TREEY")
					{
					treeName = otui.tr("Public Folders");
					treeID = "ARTESIA.PUBLIC.TREEN";
					}
				else if (treeID === userID || treeID === (userID + "Y")) 
					{
					treeName = otui.tr("My Folders");
					treeID = userID + "N";
					}

				if(treeName)
				{
					breadcrumb.names.push(treeName);
					breadcrumb.ids.push(treeID);
				}
				
				if(path.tree_descriptor.detached)
				{
					treeID = path.tree_descriptor.tree_id;
					
					if (treeID === "ARTESIA.PUBLIC.TREE")
					{
						treeName = otui.tr("Public Orphans");
						treeID = treeID + "Y";
					}
					else if (treeID === userID) 
					{
						treeName = otui.tr("My Orphans");
						treeID = userID + "Y";
					}
					
					breadcrumb.names.push(treeName);
					breadcrumb.ids.push(treeID);
				}
			}
				
			path.parents.forEach(function(parent) {
				breadcrumb.names.push(parent.name);
				breadcrumb.ids.push(parent.id);
			});
			
			breadcrumb.names.push(data.name);
			breadcrumb.ids.push(data.asset_id);
				
			var accessor = breadcrumb.ids.join("/");
			if (!(accessor in breadcrumbCache))
				breadcrumbCache[accessor] = breadcrumb;
			}
		
		if(data.asset_id === RecentArtifactsManager.RECENT_FOLDERS)
			{
			breadcrumb = {};
			breadcrumb.names = [];
			breadcrumb.ids = [];
			breadcrumb.names.push(data.name);
			breadcrumb.ids.push(data.asset_id);
			}
		return breadcrumb;
	}

	FolderManager.getCachedFolderData = function getCachedFolderData(nodeID) {
		return folders[nodeID];
	};

	FolderManager.clearCachedFolderDataForID = function(nodeID)
	{
		folders[nodeID] = undefined;
		folderReqs[nodeID] = false;
	};
	
	FolderManager.updateFolderDeleteStatus = function(foldersList, deleted)
	{
		if(foldersList && foldersList.length)
		{
			var sidebar = otui.main.getChildView(FolderSidebarView);
			if (sidebar)
			{
				var contentArea = sidebar.getChildView(FolderView).contentArea();
				var node = undefined;
				var otPoint = undefined;

				for(var i=0; i < foldersList.length; i++)
				{
					node = contentArea.find("[resourceid='" + foldersList[i] + "']");
					otPoint = node.find("#folderStatusIcons")[0];
					if(otPoint)
					{
						node[0].data.model.deleted = deleted;
						otPoint.reevaluate();
					}
				}
			}
		}
	};
})(window);
