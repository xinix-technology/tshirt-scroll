(function ($, window, document) {
	"use strict";

	// Constant
	window.ONSWIPE = false;

	$.fn.scroll = function (options) {
		// Default Settings
		var defaults = {
				canBeMoved: true,
				rubber: false,
				scrollVertical: true,
				scrollHorizontal: false
			},
			settings = $.extend({}, defaults, options);

		this.each(function () {
			// Get params
			var canBeMoved = settings.canBeMoved,
				rubber = settings.rubber,
				scrollVertical = settings.scrollVertical,
				scrollHorizontal = settings.scrollHorizontal;
			// Determine the map first position
			var matrix = 0,
				mapX = 0,
				mapY = 0
			// Save the first touch positon
			var firstX = 0,
				firstY = 0,
				deltaX = 0,
				deltaY = 0,
				posX = 0,
				posY = 0,
				scrollPosX = 0,
				scrollPosY = 0,
				originX = 0,
				originY = 0,
				scaleX = 1,
				scaleY = 1;
			// To be used to slow down animation
			var accelerator = 0.25,
				velocity = 0,
				transition = "";
			// For stopping too much scroll
			var stopScroll = 0;
			// Used for detecting mousewheel stop
			var timer;
			// Current item
			var elem = $(this);

			// Assign transform CSS
			elem.css ("transform", "translate3d(0,0,0)");

			// Assign touch event
			elem.swipe({
				swipeStatus:function(event, phase, direction, distance, duration, fingers, fingerdata) {
					var parent = this.parent ();

					if (canBeMoved) {
						canBeMoved = false;
						// Map
						matrix = this.css ("transform").split (", ");
						mapX = matrix[4];
						mapY = matrix[5].split (")");
						mapY = mapY[0];
						// Touch
						if (event.changedTouches === undefined) {
							firstX = event.pageX;
							firstY = event.pageY;
						} else {
							firstX = event.changedTouches[0].pageX;
							firstY = event.changedTouches[0].pageY;
						}
					}

					if (phase === 'move') {
						// Make a status no element can't be tap
						ONSWIPE = true;
						// Count movement delta
						if (event.changedTouches === undefined) {
							deltaX = firstX - event.pageX;
							deltaY = firstY - event.pageY;
						} else {
							deltaX = firstX - event.changedTouches[0].pageX;
							deltaY = firstY - event.changedTouches[0].pageY;
						}
						// Constrain movement
						posX = mapX - deltaX;
						posY = mapY - deltaY;

						// Count the viewable boundry
						if (rubber) {
							if (posX >= 0) {
								originX = posX = 0;
								scaleX = 1 - (deltaX / parent.width ())
							}
							if (posY >= 0) {
								originY = posY = 0;
								scaleY = 1 - (deltaY / parent.height ())
							}
							if ((posX + this.width ()) <= parent.width ()) {
								posX = parent.width () - this.width ();
								originX = 100;
								scaleX = 1 + (deltaX / parent.width ());
							}
							if ((posY + this.height ()) <= parent.height ()) {
								posY = parent.height () - this.height ();
								originY = 100;
								scaleY = 1 + (deltaY / parent.height ());
							}
							if (this.width () <= parent.width ()) {
								originX = posX = 0;
								scaleX = 1;
							}
							if (this.height () <= parent.height ()) {
								originY = posY = 0;
								scaleY = 1;
							}
						}

						if (scrollHorizontal) { posY = 0; scaleY = 1; }
						if (scrollVertical) { posX = 0; scaleX = 1; }
						transition = "all 0s linear";
					} else if (phase === 'end' || phase === 'cancel') {
						// Count the the move speed for slow down animation
						// TODO: Rethink about this
						accelerator = 0.25;
						velocity = duration / distance;
						if ( velocity < 2) {
							accelerator = 4 - velocity;
							deltaX *= accelerator;
							deltaY *= accelerator;
							posX = mapX - deltaX;
							posY = mapY - deltaY;
							if (scrollHorizontal)
								posY = 0;
							if (scrollVertical)
								posX = 0;
							transition = "all 0.25s cubic-bezier(0, 0, " + velocity / 2 + ", 1)";
						} else {
							transition = "all 0.15s cubic-bezier(0, 0, 0.5, 1)";
						}
						// Count the viewable boundry
						if (posX >= 0)
							posX = 0;
						if (posY >= 0)
							posY = 0;
						if ((posX + this.width ()) <= parent.width ())
							posX = parent.width () - this.width ();
						if ((posY + this.height ()) <= parent.height ())
							posY = parent.height () - this.height ();
						if (this.width () <= parent.width ())
							posX = 0;
						if (this.height () <= parent.height ())
							posY = 0;
						scaleX = scaleY = 1;
						canBeMoved = true;
						// Make a status no element can be tap
						ONSWIPE = false;
					}

					this.css ({
						"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
						"transform-origin": originX + "% " + originY + "%",
						"transition": transition
					});

					$('[data-twin=' + this.attr("data-twin") + ']').css ({
						"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
						"transform-origin": originX + "% " + originY + "%",
						"transition": transition
					});

					console.log ()
				},
				triggerOnTouchLeave:true,
				excludedElements:''
			});
		});

		// Currently disable - Mouse Scroll
		/*
		function mouseScroll (event) {
			var parent = this.parent ();

			event.preventDefault();

			if (canBeMoved) {
				canBeMoved = false;
				// Map
				matrix = $(scrollArea).css ("transform").split (", ");
				mapX = matrix[4];
				mapY = matrix[5].split (")");
				mapY = mapY[0];
			}

			// Count movement delta
			if (event.type === "DOMMouseScroll") {
				deltaX = 0;
				deltaY = event.originalEvent.detail * 10;
			} else {
				deltaX = event.originalEvent.wheelDeltaX;
				deltaY = event.originalEvent.wheelDeltaY;
			}

			// Constrain movement
			posX = (mapX -= (deltaX * -1) / 4);
			posY = (mapY -= (deltaY * -1) / 4);

			scrollPosX -= (deltaX * -1) / 16;
			scrollPosY -= (deltaY * -1) / 16;

			if (rubber) {
				if (posX > 0) { originX = posX = 0; scaleX = 1 + (scrollPosX / parent.width ()); }
				if (posY > 0) { originY = posY = 0; scaleY = 1 + (scrollPosY / parent.height ()); }
				if ((posX + $(scrollArea).width ()) < parent.width ()) { posX = parent.width () - $(scrollArea).width (); originX = 100; scaleX = 1 - (scrollPosX / parent.width ()); }
				if ((posY + $(scrollArea).height ()) < parent.height ()) { posY = parent.height () - $(scrollArea).height (); originY = 100; scaleY = 1 - (scrollPosY / parent.height ()); }
				if ($(scrollArea).width () < parent.width ()) { originX = posX = 0; scaleX = 1 }
				if ($(scrollArea).height () < parent.height ()) { originY = posY = 0; scaleY = 1 }
			}

			// Shouldn't be "dower"
			if (scrollHorizontal) { posY = 0; scaleY = 1; }
			if (scrollVertical) { posX = 0; scaleX = 1; }

			transition = "all 0s linear";

			$(scrollArea).css ({
				"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
				"transform-origin": originX + "% " + originY + "%",
				"transition": transition
			});
			if ($(scrollArea).parent ().attr ("data-scroll-id") != undefined) {
				$("[data-scroll-id='" + $(scrollArea).parent ().attr ("data-scroll-id") + "'] > .scroll").css ({
					"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
					"transform-origin": originX + "% " + originY + "%",
					"transition": transition
				});
			}

			// TODO: Detect over scroll
			clearTimeout(timer);
			timer = setTimeout(function() {
				if (!canBeMoved) {
					// Count the viewable boundry
					if (posX >= 0) posX = 0;
					if (posY >= 0) posY = 0;
					if ((posX + $(scrollArea).width ()) <= parent.width ()) posX = parent.width () - $(scrollArea).width ();
					if ((posY + $(scrollArea).height ()) <= parent.height ()) posY = parent.height () - $(scrollArea).height ();
					if ($(scrollArea).width () <= parent.width ()) posX = 0;
					if ($(scrollArea).height () <= parent.height ()) posY = 0;

					scrollPosX = scrollPosY = 0;
					scaleX = scaleY = 1;
					transition = "";
					canBeMoved = true;

					$(scrollArea).css ({
						"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
						"transform-origin": originX + "% " + originY + "%",
						"transition": transition
					});
					if ($(scrollArea).parent ().attr ("data-scroll-id") != undefined) {
						$("[data-scroll-id='" + $(scrollArea).parent ().attr ("data-scroll-id") + "'] > .scroll").css ({
							"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
							"transform-origin": originX + "% " + originY + "%",
							"transition": transition
						});
					}

					stopScroll = 0;

					clearTimeout(timer);
				}
			}, 16);
		}
		*/

	}
}(jQuery, window, document));