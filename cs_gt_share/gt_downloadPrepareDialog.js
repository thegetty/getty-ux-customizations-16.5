(function(exports){
		DownloadPrepareDialogView.execute = function execute(event)
		{
			var view = otui.Views.containing(event.target);
			var contentArea = view.contentArea();
			var emailNotify = contentArea.find(".ot-download-email-notification");
			
			var isEmailNotify = emailNotify[0].checked;
			view.storedProperty("isEmailNotify",isEmailNotify);
			view.storedProperty("jobAffirmative",true);
			otui.DialogUtils.cancelDialog(event.target, true);
		}
})(window);
