(function(exports) {
	var RenditionsManager = exports.RenditionsManager = function RenditionsManager() {
	};

	RenditionsManager.replaceRenditions = function(asset_id, handleResponse) {
		var serviceUrl = otui.service + "/assetsGT/" + asset_id
				+ "/replacerenditions"
		otui.post(serviceUrl, 
				undefined, 
				otui.contentTypes.formData, 
				function(data, status, success){
					handleResponse(success)
				}
		);
	}
})(window);