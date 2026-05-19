(function() {
	function setupNewsToggle() {
		var newsList = document.getElementById('news-list');
		var button = document.getElementById('toggle-news');

		if (!newsList || !button) {
			return;
		}

		var items = newsList.getElementsByTagName('li');
		var maxVisible = 6;

		function setExpanded(isExpanded) {
			for (var i = maxVisible; i < items.length; i++) {
				items[i].hidden = !isExpanded;
			}

			button.textContent = isExpanded ? 'Show Less' : 'More News';
			button.setAttribute('aria-expanded', String(isExpanded));
		}

		button.addEventListener('click', function() {
			setExpanded(button.getAttribute('aria-expanded') !== 'true');
		});

		setExpanded(false);
	}

	document.addEventListener('DOMContentLoaded', setupNewsToggle);
})();
