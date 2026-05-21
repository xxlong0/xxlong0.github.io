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

	function setupHighlightProjects() {
		var carousels = document.querySelectorAll('[data-highlight-carousel]');

		for (var i = 0; i < carousels.length; i++) {
			initHighlightCarousel(carousels[i]);
		}
	}

	function setupPublicationVideos() {
		var videos = Array.prototype.slice.call(document.querySelectorAll('#two .work-item video'));

		if (!videos.length) {
			return;
		}

		function loadVideo(video) {
			var src = video.getAttribute('src');

			if (!src || src === 'images/publications/') {
				return;
			}

			video.muted = true;
			video.loop = true;
			video.preload = 'metadata';
			video.setAttribute('playsinline', '');
			video.setAttribute('webkit-playsinline', '');

			if (video.dataset.publicationVideoLoaded !== 'true') {
				video.dataset.publicationVideoLoaded = 'true';
				video.load();
			}

			var playRequest = video.play();

			if (playRequest && playRequest.catch) {
				playRequest.catch(function() {
					// Some browsers block autoplay from local files; metadata loading still shows the preview frame.
				});
			}
		}

		function pauseVideo(video) {
			if (!video.paused) {
				video.pause();
			}
		}

		if ('IntersectionObserver' in window) {
			var observer = new IntersectionObserver(function(entries) {
				for (var i = 0; i < entries.length; i++) {
					if (entries[i].isIntersecting) {
						loadVideo(entries[i].target);
					} else {
						pauseVideo(entries[i].target);
					}
				}
			}, {
				rootMargin: '600px 0px',
				threshold: 0.01
			});

			for (var j = 0; j < videos.length; j++) {
				observer.observe(videos[j]);
			}
		} else {
			for (var k = 0; k < videos.length; k++) {
				loadVideo(videos[k]);
			}
		}

		window.addEventListener('load', function() {
			for (var i = 0; i < Math.min(videos.length, 8); i++) {
				loadVideo(videos[i]);
			}
		});
	}

	function initHighlightCarousel(root) {
		var viewport = root.querySelector('.highlight-carousel-viewport');
		var track = root.querySelector('.highlight-track');
		var prev = root.querySelector('.highlight-nav-prev');
		var next = root.querySelector('.highlight-nav-next');

		if (!viewport || !track || !prev || !next) {
			return;
		}

		var paused = false;
		var originalCards = Array.prototype.slice.call(track.querySelectorAll('.highlight-card'));
		var originalCount = originalCards.length;
		var resumeTimer = null;
		var autoDelay = 3200;
		var scrollSettledDelay = 700;

		for (var i = 0; i < originalCards.length; i++) {
			var clone = originalCards[i].cloneNode(true);
			clone.setAttribute('aria-hidden', 'true');
			track.appendChild(clone);
		}

		function cardStep() {
			var card = root.querySelector('.highlight-card');
			var gap = 16;

			if (card) {
				var style = window.getComputedStyle(root.querySelector('.highlight-track'));
				gap = parseFloat(style.columnGap || style.gap) || gap;
				return card.getBoundingClientRect().width + gap;
			}

			return viewport.clientWidth * 0.75;
		}

		function loopWidth() {
			return cardStep() * originalCount;
		}

		function normalizePosition() {
			var width = loopWidth();

			if (width <= 0) {
				return;
			}

			if (viewport.scrollLeft >= width) {
				viewport.scrollLeft = viewport.scrollLeft - width;
			}
		}

		function pauseTemporarily() {
			paused = true;

			if (resumeTimer) {
				window.clearTimeout(resumeTimer);
			}

			resumeTimer = window.setTimeout(function() {
				paused = false;
			}, 2200);
		}

		function scrollByCard(direction) {
			var width = loopWidth();
			var step = cardStep();
			var target;

			if (width <= 0 || viewport.scrollWidth <= viewport.clientWidth) {
				return;
			}

			normalizePosition();

			if (direction < 0 && viewport.scrollLeft < step * 0.5) {
				viewport.scrollLeft = viewport.scrollLeft + width;
			}

			target = viewport.scrollLeft + (direction * step);

			viewport.scrollTo({
				left: target,
				behavior: 'smooth'
			});

			window.setTimeout(function() {
				normalizePosition();
			}, scrollSettledDelay);
		}

		var lastPointerActivation = 0;

		function activateButton(direction, event) {
			if (event && event.type === 'click' && Date.now() - lastPointerActivation < 500) {
				return;
			}

			if (event && event.type === 'pointerdown') {
				lastPointerActivation = Date.now();
			}

			if (event && event.preventDefault) {
				event.preventDefault();
			}

			pauseTemporarily();
			scrollByCard(direction);
		}

		function activateOnKey(direction, event) {
			if (event.key === 'Enter' || event.key === ' ') {
				activateButton(direction, event);
			}
		}

		prev.addEventListener('pointerdown', function(event) {
			activateButton(-1, event);
		});

		prev.addEventListener('click', function(event) {
			activateButton(-1, event);
		});

		prev.addEventListener('keydown', function(event) {
			activateOnKey(-1, event);
		});

		next.addEventListener('pointerdown', function(event) {
			activateButton(1, event);
		});

		next.addEventListener('click', function(event) {
			activateButton(1, event);
		});

		next.addEventListener('keydown', function(event) {
			activateOnKey(1, event);
		});

		root.addEventListener('click', function(event) {
			var link = event.target.closest && event.target.closest('.highlight-media-link');

			if (link && link.getAttribute('href') === '#') {
				event.preventDefault();
			}
		});

		root.addEventListener('focusin', function() {
			paused = true;
		});

		root.addEventListener('focusout', function() {
			paused = false;
		});

		window.setInterval(function() {
			if (paused || viewport.scrollWidth <= viewport.clientWidth) {
				return;
			}

			scrollByCard(1);
		}, autoDelay);
	}

	document.addEventListener('DOMContentLoaded', function() {
		setupNewsToggle();
		setupHighlightProjects();
		setupPublicationVideos();
	});
})();
