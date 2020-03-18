(function(otui)
{
	otui.ready(function()
	{
		otui.ReportDisplayService.deleteReportConfig("AssetsImportedBYContentType.rptdesign", "Assets");
		otui.ReportDisplayService.deleteReportConfig("AssetsImportedBYUserGroups.rptdesign", "Assets");
		otui.ReportDisplayService.deleteReportConfig("TotalAssetsBYContentType.rptdesign", "Assets");
		otui.ReportDisplayService.deleteReportConfig("TotalAssetsBYModel.rptdesign", "Assets");
		otui.ReportDisplayService.deleteReportConfig("TotalDownloadsIn30Days.rptdesign", "Usage");
		otui.ReportDisplayService.deleteReportConfig("TotalSearchesIn30Days.rptdesign", "Usage");
		otui.ReportDisplayService.deleteReportConfig("TotalLoginsIn30Days.rptdesign", "Usage");
		otui.ReportDisplayService.deleteReportConfig("TopSearchesIn30Days.rptdesign", "Usage");
		otui.ReportDisplayService.registerReport
		({
			"id": "AssetsImportedBYContentType.rptdesign",
			"displayText": otui.tr("Asset imported by content type"),
			"type": "Assets",
			"order": 1
		});
	
		otui.ReportDisplayService.registerReport
		({
			"id": "AssetsImportedBYUserGroups.rptdesign",
			"displayText": otui.tr("Asset imported by usergroups"),
			"type": "Assets",
			"order": 2
		});

		otui.ReportDisplayService.registerReport
		({
			"id": "TotalAssetsBYContentType.rptdesign",
			"displayText": otui.tr("Total assets by content type"),
			"type": "Assets",
			"order": 3
		});

		otui.ReportDisplayService.registerReport
		({
			"id": "TotalAssetsBYModel.rptdesign",
			"displayText": otui.tr("Total assets by model"),
			"type": "Assets",
			"order": 7
		});

		otui.ReportDisplayService.registerReport
		({
			"id": "TotalDownloadsIn30Days.rptdesign",
			"displayText": otui.tr("Downloads in last 30 days"),
			"type": "Usage",
			"order": 4
		});

		otui.ReportDisplayService.registerReport
		({
			"id": "TotalSearchesIn30Days.rptdesign",
			"displayText": otui.tr("Searches in last 30 days"),
			"type": "Usage",
			"order": 5
		});

		otui.ReportDisplayService.registerReport
		({
			"id": "TotalLoginsIn30Days.rptdesign",
			"displayText": otui.tr("Logins in last 30 days"),
			"type": "Usage",
			"order": 6
		});

		otui.ReportDisplayService.registerReport
		({
			"id": "TopSearchesIn30Days.rptdesign",
			"displayText": otui.tr("Top search keywords in last 30 days"),
			"type": "Usage",
			"order": 8
		});
});
})(otui);
