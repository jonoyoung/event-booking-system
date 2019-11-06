// Materialize side nav initialise.
$(document).ready(function() {
	$(".sidenav").sidenav({
		edge: 'right'
	});

	$('.collapsible').collapsible();
	$('.dropdown-trigger').dropdown();
	$('input#shortDesc').characterCounter();
});

// Animations.
function alertCloseClick(closeBtn, element) {
	$(closeBtn).click(function() {
		$(element).addClass("animated fadeOutLeft");
	});
}