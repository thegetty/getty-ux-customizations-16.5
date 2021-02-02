(function(otui) {
	otui.augment("HomeView", function() {
		otui.ready(function() {
			urlToFile = "/otmm/ux-html/cs_gt_alert/user_alert_message.txt"
			var xhr = new XMLHttpRequest();
			xhr.open('GET', urlToFile, false);
			xhr.send();
			console.log(urlToFile + " " + xhr.status)
			if (xhr.status == "200") {
				alert_text = xhr.response
				alert_text = alert_text.trim()
				if (alert_text.length > 0)
					otui.NotificationManager.showNotification({
						'message' : alert_text,
						'status' : "information"
					});
			}
		})
	});
})(otui);