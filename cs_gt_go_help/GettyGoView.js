(function(exports)
{
	function setupGoGetty(event, resource)
	{
		return true;
	};;

	function goGetty(event, resource)
	{
		window.open("http://go.getty.edu/GO/cmsGO?page=1353", "PopupWindow", "width=600,height=600,scrollbars=yes,resizable=no");
	};

	otui.HelpActions.register({'name' : 'gogetty', 'text' : otui.tr('GO Help Page'), 'setup' : setupGoGetty, 'select' : goGetty}, 2);
})(window);