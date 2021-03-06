(function(exports)
{
	function setupGoGetty(event, resource){
		return true;
	};
	
	function setupGoAdmin(){
		return true;
	}

	function goGetty(event, resource){
		window.open("http://go.getty.edu/GO/cmsGO?page=1353", "PopupWindow", "width=600,height=600,scrollbars=yes,resizable=no");
	};
	
	function goAdmin(event, resource){
		window.open("/teams", "targetWindow", "width=1024,height=768,scrollbars=yes,resizable=yes");
	}

	otui.HelpActions.register({'name' : 'goadmin', 'text' : otui.tr('Administration Portal'), 'setup' : setupGoAdmin, 'select' : goAdmin}, 2);
	otui.HelpActions.register({'name' : 'gogetty', 'text' : otui.tr('GO Help Page'), 'setup' : setupGoGetty, 'select' : goGetty}, 3);
	
})(window);