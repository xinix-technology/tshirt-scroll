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
			var elem = $(this).parent ()
				timer = null;

			// Assign transform CSS
			elem.children ().css ("transform", "translate3d(0,0,0)");

			// Assign Mouse Scroll
			elem.on('mousewheel', function (event) {
				var parent = $(this),
					child = $(this).children ();

				// Map
				matrix = child.css ("transform").split (", ");
				mapX = matrix[4];
				mapY = matrix[5].split (")");
				mapY = mapY[0];

				// console.log(event, event.deltaX, event.deltaY, event.deltaFactor);

				// Count movement delta
				deltaX = event.deltaX;
				deltaY = event.deltaY;

				// Constrain movement
				posX = (mapX -= (deltaX * 1));
				posY = (mapY -= (deltaY * -1));

				scrollPosX -= (deltaX * 1);
				scrollPosY -= (deltaY * -1);

				// Count the viewable boundry
				if (rubber) {
					// It's on bottom
					if ((posX + child.width ()) <= parent.width ()) {
						posX = parent.width () - child.width ();
						originX = 100;
						scaleX = 1 - (deltaX / parent.width ());
					}
					if ((posY + child.height ()) <= parent.height ()) {
						posY = parent.height () - child.height ();
						originY = 100;
						scaleY = 1 - (deltaY / parent.height ());
					}

					// It's on top
					if (posX >= 0) {
						originX = posX = 0;
						scaleX = 1 + (deltaX / parent.width ());
					}
					if (posY >= 0) {
						originY = posY = 0;
						scaleY = 1 + (deltaY / parent.height ());
					}
				} else {
					var timer = 256,
						_transition = "all 0.25s cubic-bezier(0, 0, 0.5, 1)";

					// TODO: It's on bottom
					if ((posX + child.width ()) <= (parent.width () - (parent.width () / 2))) {
						transition = _transition;
						posX = (parent.width () - (parent.width () / 2)) - child.width () + deltaX;
					}
					if ((posY + child.height ()) <= (parent.height () - (parent.height () / 2))) {
						transition = _transition;
						posY = (parent.height () - (parent.height () / 2)) - child.height () + deltaY;
					}

					// It's on top
					if (posX >= parent.width () / 2) {
						transition = _transition;
						posX = (parent.width () / 2) - deltaX;
					}
					if (posY >= parent.height () / 2) {
						transition = _transition;
						posY = (parent.height () / 2) - deltaX;
					}

					// Save the current element
					window.tempparent = parent;

					// Prevent element to over scrolled - should be on mouse up
					clearTimeout (window.temptimer);
					window.temptimer = setTimeout (function () {
						tempparent.each(function (){
							// It's on bottom
							if ((posX + child.width ()) <= parent.width ())
								posX = parent.width () - child.width ();
							if ((posY + child.height ()) <= parent.height ())
								posY = parent.height () - child.height ();

							// It's on top
							if (posX >= 0)
								posX = 0;
							if (posY >= 0)
								posY = 0;

							transition = "all 0.25s cubic-bezier(0, 0, 0.5, 1)";

							child.css ({
								"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
								"transform-origin": originX + "% " + originY + "%",
								"transition": transition
							});

							$('[data-twin=' + child.attr("data-twin") + ']').css ({
								"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
								"transform-origin": originX + "% " + originY + "%",
								"transition": transition
							});
						});
					}, timer);
				}

				// It's shorter than container
				if (child.width () <= parent.width ()) {
					originX = posX = 0;
					scaleX = 1;
				}
				if (child.height () <= parent.height ()) {
					originY = posY = 0;
					scaleY = 1;
				}

				// Make sure the other end not moving
				if (scrollHorizontal) {
					posY = 0;
					scaleY = 1;
				}
				if (scrollVertical) {
					posX = 0;
					scaleX = 1;
				}

				transition = "";

				child.css ({
					"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
					"transform-origin": originX + "% " + originY + "%",
					"transition": transition
				});
				if (parent.attr ("data-scroll-id") != undefined) {
					$("[data-scroll-id='" + parent.attr ("data-scroll-id") + "'] > .scroll").css ({
						"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
						"transform-origin": originX + "% " + originY + "%",
						"transition": transition
					});
				}

				event.preventDefault();
			});

			// Assign touch event
			elem.swipe({
				swipeStatus:function(event, phase, direction, distance, duration, fingers, fingerdata) {
					var parent = $(this),
						child = $(this).children ();

					if (canBeMoved) {
						canBeMoved = false;
						// Map
						matrix = child.css ("transform").split (", ");
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
							if ((posX + child.width ()) <= parent.width ()) {
								posX = parent.width () - child.width ();
								originX = 100;
								scaleX = 1 + (deltaX / parent.width ());
							}
							if ((posY + child.height ()) <= parent.height ()) {
								posY = parent.height () - child.height ();
								originY = 100;
								scaleY = 1 + (deltaY / parent.height ());
							}

							if (posX >= 0) {
								originX = posX = 0;
								scaleX = 1 - (deltaX / parent.width ())
							}
							if (posY >= 0) {
								originY = posY = 0;
								scaleY = 1 - (deltaY / parent.height ())
							}

							if (child.width () <= parent.width ()) {
								originX = posX = 0;
								scaleX = 1;
							}
							if (child.height () <= parent.height ()) {
								originY = posY = 0;
								scaleY = 1;
							}
						}

						if (scrollHorizontal) {
							posY = 0;
							scaleY = 1;
						}
						if (scrollVertical) {
							posX = 0;
							scaleX = 1;
						}
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
							transition = "all 0.25s cubic-bezier(0, 0, 0.5, 1)";
						}

						// Count the viewable boundry
						if ((posX + child.width ()) <= parent.width ())
							posX = parent.width () - child.width ();
						if ((posY + child.height ()) <= parent.height ())
							posY = parent.height () - child.height ();

						if (posX >= 0)
							posX = 0;
						if (posY >= 0)
							posY = 0;

						if (child.width () <= parent.width ())
							posX = 0;
						if (child.height () <= parent.height ())
							posY = 0;

						scaleX = scaleY = 1;
						canBeMoved = true;

						// Make a status no element can be tap
						ONSWIPE = false;
					}

					child.css ({
						"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
						"transform-origin": originX + "% " + originY + "%",
						"transition": transition
					});

					$('[data-twin=' + child.attr("data-twin") + ']').css ({
						"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
						"transform-origin": originX + "% " + originY + "%",
						"transition": transition
					});
				},
				triggerOnTouchLeave:true,
				excludedElements:''
			});
		});

	}
}(jQuery, window, document));