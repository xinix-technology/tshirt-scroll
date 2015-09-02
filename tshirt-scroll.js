(function ($, window, document) {
	"use strict";

	// Constant
	window.ONSWIPE = false;

	// Global variable
	window.scrolltimeout = null;
	window.vscrollbartimeout =  null;
	window.hscrollbartimeout =  null;

	$.fn.scroll = function (options) {
		// Default Settings
		var defaults = {
				rubber: false,
				scrollVertical: true,
				scrollHorizontal: false,
				allowSmaller: false,
				showScroll: true,
				onScroll: function (posX, posY, scaleX, scaleY, originX, originY, transition) {},
				onReachTop: function (posX, posY, scaleX, scaleY, originX, originY, transition) {},
				onReachBottom: function (posX, posY, scaleX, scaleY, originX, originY, transition) {},
				onReachLeft: function (posX, posY, scaleX, scaleY, originX, originY, transition) {},
				onReachRight: function (posX, posY, scaleX, scaleY, originX, originY, transition) {}
			},
			settings = $.extend({}, defaults, options);

		this.each(function () {
			// Get params
			var rubber = settings.rubber,
				scrollVertical = settings.scrollVertical,
				scrollHorizontal = settings.scrollHorizontal,
				allowSmaller = settings.allowSmaller,
				showScroll = settings.showScroll,
				onScroll = settings.onScroll,
				onReachTop = settings.onReachTop,
				onReachBottom = settings.onReachBottom,
				onReachLeft = settings.onReachLeft,
				onReachRight = settings.onReachRight;
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
				originX = 0,
				originY = 0,
				scaleX = 1,
				scaleY = 1;
			// To be used to slow down animation
			var acceleratorX = 0,
				acceleratorY = 0,
				accelerator = 0,
				velocity = 0,
				transition = "";
			// Current item
			var elem = $(this).parent (),
				timer = 512;
			// Timestamp
			var timestamp;
			// Scroll element,
			var hscrollbar = null,
				vscrollbar = null,
				scrollPosX = 0,
				scrollPosY = 0,
				scrollMapX = 0,
				scrollMapY = 0,
				scrollStartX = 0,
				scrollStartY = 0;
			// Move the vslider
			var updateVSliderPosition = function (vslider, transition)  {
					if (showScroll && vslider.length > 0) {
						scrollPosY = (posY / (vslider.parent().siblings().outerHeight() - vscrollbar.outerHeight()) * 100) * -1;
						scrollPosY -= (vslider.outerHeight() / vscrollbar.outerHeight() * 100) * (scrollPosY / 100);

						if (scrollPosY < 0) scrollPosY = 0;
						if (scrollPosY > (100 - (vslider.outerHeight() / vscrollbar.outerHeight() * 100))) scrollPosY = (100 - (vslider.outerHeight() / vscrollbar.outerHeight() * 100));

						vslider.css({
							"opacity": 1,
							"top": scrollPosY + "%",
							"transition": transition
						});

						clearTimeout(vscrollbartimeout);
						vscrollbartimeout = setTimeout (function () {
							clearTimeout(vscrollbartimeout);

							vslider.css({
								"opacity": 0
							});
						}, (timer + (timer / 4)));
					}
				}, updateHSliderPosition = function (hslider, transition)  {
					if (showScroll && hslider.length > 0) {
						scrollPosX = (posX / (hslider.parent().siblings().outerWidth() - hscrollbar.outerWidth()) * 100) * -1;
						scrollPosX -= (hslider.outerWidth() / hscrollbar.outerWidth() * 100) * (scrollPosX / 100);

						if (scrollPosX < 0) scrollPosX = 0;
						if (scrollPosX > (100 - (hslider.outerWidth() / hscrollbar.outerWidth() * 100))) scrollPosX = (100 - (hslider.outerWidth() / hscrollbar.outerWidth() * 100));

						hslider.css({
							"opacity": 1,
							"left": scrollPosX + "%",
							"transition": transition
						});

						clearTimeout(hscrollbartimeout);
						hscrollbartimeout = setTimeout (function () {
							clearTimeout(hscrollbartimeout);

							hslider.css({
								"opacity": 0
							});
						}, (timer + (timer / 4)));
					}
				};
			// Update content position
			var updateContentPosition = function (elem) {
					elem.css ({
						"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
						"transform-origin": originX + "% " + originY + "%",
						"transition": transition
					});
				}, constrainContentPosition = function (child, parent) {
					// It's on bottom
					if ((posX + child.outerWidth ()) <= parent.outerWidth ())
						posX = parent.outerWidth () - child.outerWidth ();
					if ((posY + child.outerHeight ()) <= parent.outerHeight ())
						posY = parent.outerHeight () - child.outerHeight ();

					// It's on top
					if (posX >= 0)
						posX = 0;
					if (posY >= 0)
						posY = 0;
				};

			// Assign transform CSS
			elem.children ().css ("transform", "translate3d(0,0,0)");

			// Create scroll bar
			if (showScroll) {
				elem.each (function () {
					var hsliderwidth = ($(this).outerWidth() / ($(this).children ().outerWidth()) * 100),
						vsliderheight = ($(this).outerHeight() / ($(this).children ().outerHeight()) * 100);

					// Constrain the slider size so it won't be to small
					if (hsliderwidth < 32) hsliderwidth = 32;
					if (vsliderheight < 32) vsliderheight = 32;

					// Create the scrollsbars
					if (vsliderheight < 100) {
						$(this).append("<div class='scrollbar vscrollbar'><div class='vslider' /></div>").css({
							"position": "relative"
						});
						vscrollbar = $(this).find(".vscrollbar").css({
							"top": 0,
							"bottom": 0,
							"left": "initial",
							"right": 0,
							"width": 8,
							"height": "100%"
						});
					}
					if (hsliderwidth < 100) {
						$(this).append("<div class='scrollbar hscrollbar'><div class='hslider' /></div>").css({
							"position": "relative"
						});
						hscrollbar = $(this).find(".hscrollbar").css({
							"position": "absolute",
							"top": "initial",
							"bottom": 0,
							"left": 0,
							"right": 0,
							"width": "100%",
							"height": 8
						});
					}
					$(this).find(".scrollbar").css({
						"position": "absolute"
					}).children().css({
						"position": "absolute",
						"top": 0,
						"background": "rgba(0,0,0,0.48)",
						"border": "1px solid rgba(255,255,255,0.48)",
						"border-radius": 8,
						"opacity": 0,
						"transition": "all 0.256s cubic-bezier(0, 0, 0.5, 1)",
						"box-sizing": "border-box",
						"cursor": "pointer"
					});

					// Vertical Slider actions
					$(this).find(".vslider").css({
						"top": 0,
						"left": "initial",
						"right": 0,
						"width": 8,
						"height": vsliderheight + "%",
					}).hover (function () {
						var parent = $(this).parent().siblings(),
							twin = $("[data-twin=" + parent.data("twin") + "]");

						if (twin.length > 0) parent = twin;
						parent.each(function () {
							updateVSliderPosition($(this).siblings().children(".vslider"), "all 0.25s cubic-bezier(0, 0, 0.5, 1)");
						});
						clearTimeout(vscrollbartimeout);
					}, function () {
						var parent = $(this).parent().siblings(),
							twin = $("[data-twin=" + parent.data("twin") + "]");

						if (twin.length > 0) parent = twin;

						clearTimeout(vscrollbartimeout);
						vscrollbartimeout = setTimeout (function () {
							clearTimeout(vscrollbartimeout);

							parent.each(function () {
								$(this).siblings().children(".vslider").css({
									"opacity": 0,
									"transition": "all 0.25s cubic-bezier(0, 0, 0.5, 1)"
								});
							});
						}, timer);
					}).hammer().on("dragstart drag dragend tap", function(event) {
						var child = $(this).parent().siblings (":not(.scrollbar)"),
							parent = child.parent(),
							percentageScroll = 0;

						if (event.type === "dragstart") {
							// Touch
							scrollStartY = event.gesture.center.pageY;

							// Constrain movement
							scrollPosY = scrollMapY = parseInt($(this).position().top);
						}
						if (event.type === 'drag' || event.type === 'dragend') {
							// Count movement delta
							deltaY = -event.gesture.deltaY;
							// Constrain movement
							scrollPosY = scrollMapY - deltaY;
						}

						percentageScroll = scrollPosY / $(this).parent().outerHeight () * 100;
						posY = percentageScroll / 100 * -child.outerHeight ();

						constrainContentPosition (child, parent);

						// Set the transition
						transition = "all 0s linear";

						// Found out if it have twin
						if (child.data("twin")) child = $('[data-twin=' + child.data("twin") + ']');
						// Move the scroll bar
						updateVSliderPosition(child.siblings().children(".vslider"), transition);
						clearTimeout(vscrollbartimeout);
						// Move the content
						updateContentPosition (child);
					});

					// Horizontal Slider actions
					$(this).find(".hslider").css({
						"top": 0,
						"left": 0,
						"width": hsliderwidth + "%",
						"height": 8
					}).hover (function () {
						var parent = $(this).parent().siblings(),
							twin = $("[data-twin=" + parent.data("twin") + "]");

						if (twin.length > 0) parent = twin;
						parent.each(function () {
							updateHSliderPosition($(this).siblings().children(".hslider"), "all 0.25s cubic-bezier(0, 0, 0.5, 1)");
						});
						clearTimeout(hscrollbartimeout);
					}, function () {
						var parent = $(this).parent().siblings(),
							twin = $("[data-twin=" + parent.data("twin") + "]");

						if (twin.length > 0) parent = twin;

						clearTimeout(hscrollbartimeout);
						hscrollbartimeout = setTimeout (function () {
							clearTimeout(hscrollbartimeout);

							parent.each(function () {
								$(this).siblings().children(".hslider").css({
									"opacity": 0,
									"transition": "all 0.25s cubic-bezier(0, 0, 0.5, 1)"
								});
							});
						}, timer);
					}).hammer().on("dragstart drag dragend tap", function(event) {
						var child = $(this).parent().siblings (":not(.scrollbar)"),
							parent = child.parent(),
							percentageScroll = 0;

						if (event.type === "dragstart") {
							// Touch
							scrollStartX = event.gesture.center.pageX;

							// Constrain movement
							scrollPosX = scrollMapX = parseInt($(this).position().left);
						}
						if (event.type === 'drag' || event.type === 'dragend') {
							// Count movement delta
							deltaX = -event.gesture.deltaX;
							// Constrain movement
							scrollPosX = scrollMapX - deltaX;
						}

						percentageScroll = scrollPosX / $(this).parent().outerWidth () * 100;
						posX = percentageScroll / 100 * -child.outerWidth ();

						constrainContentPosition (child, parent);

						// Set the transition
						transition = "all 0s linear";

						// Found out if it have twin
						if (child.data("twin")) child = $('[data-twin=' + child.data("twin") + ']');
						// Move the scroll bar
						updateHSliderPosition(child.siblings().children(".hslider"), transition);
						clearTimeout(hscrollbartimeout);
						// Move the content
						updateContentPosition (child);

						if (event.type === "drag" || event.type === "dragstart" || event.type === "dragend") {
							event.gesture.preventDefault();
							event.gesture.stopPropagation();
						}
					});
				});
			}

			// Assign touch event
			elem.hammer().on("dragstart drag dragend tap", function(event) {
				var parent = $(this),
					child = $(this).children (":not(.scrollbar)");

				if (!$(event.target).hasClass ("hslider") && !$(event.target).hasClass ("vslider") ) {
					if (event.type === "dragstart") {
						// Map
						matrix = child.css ("transform").split (", ");
						mapX = parseInt(matrix[4]);
						mapY = matrix[5].split (")");
						mapY = parseInt(mapY[0]);

						// Touch
						firstX = event.gesture.center.pageX;
						firstY = event.gesture.center.pageY;

						// Constrain movement
						posX = mapX;
						posY = mapY;
					}
					if (event.type === 'drag') {
						// Make a status no element can't be tap
						ONSWIPE = true;
						// Count movement delta
						deltaX = -event.gesture.deltaX;
						deltaY = -event.gesture.deltaY;
						// Constrain movement
						posX = mapX - deltaX;
						posY = mapY - deltaY;

						// Count the viewable boundry
						if (rubber) {
							if ((posX + child.outerWidth ()) <= parent.outerWidth ()) {
								posX = parent.outerWidth () - child.outerWidth ();
								originX = 100;
								scaleX = 1 + (deltaX / parent.outerWidth ());
							}
							if ((posY + child.outerHeight ()) <= parent.outerHeight ()) {
								posY = parent.outerHeight () - child.outerHeight ();
								originY = 100;
								scaleY = 1 + (deltaY / parent.outerHeight ());
							}

							if (posX >= 0) {
								originX = posX = 0;
								scaleX = 1 - (deltaX / parent.outerWidth ())
							}
							if (posY >= 0) {
								originY = posY = 0;
								scaleY = 1 - (deltaY / parent.outerHeight ())
							}
						}

						// Calling the callbacks
						if ((posX + child.outerWidth ()) <= parent.outerWidth ())  		onReachRight  (posX, posY, scaleX, scaleY, originX, originY, transition);
						if ((posY + child.outerHeight ()) <= parent.outerHeight ()) 	onReachBottom (posX, posY, scaleX, scaleY, originX, originY, transition);
						if (posX >= 0)   												onReachLeft   (posX, posY, scaleX, scaleY, originX, originY, transition);
						if (posY >= 0)  												onReachTop    (posX, posY, scaleX, scaleY, originX, originY, transition);

						// Get the last accelerator
						acceleratorX = event.gesture.velocityX;
						acceleratorY = event.gesture.velocityY;
						if (acceleratorX > acceleratorY) accelerator = acceleratorX;
						else accelerator = acceleratorY;

						transition = "all 0s linear";
						timestamp = Math.round(+new Date() / 100);
					}
					if (event.type === 'dragend') {
						// Count the the move speed for slow down animation
						if (acceleratorX > 0.1)
							posX = mapX - (deltaX * (10 * acceleratorX));
						if (acceleratorY > 0.1)
							posY = mapY - (deltaY * (10 * acceleratorY));

						if (scrollHorizontal && !scrollVertical) {
							posY = 0;
							scaleY = 1;
						}
						if (!scrollHorizontal && scrollVertical) {
							posX = 0;
							scaleX = 1;
						}

						accelerator = Math.round (accelerator * 100) / 100;
						if (accelerator < 1)
							transition = "all " + accelerator + "s cubic-bezier(0, 0, 0.5, 1)";
						else
							transition = "all 0.512s cubic-bezier(0, 0, 0.5, 1)";

						// Count the viewable boundry
						if ((posX + child.outerWidth ()) <= parent.outerWidth ())
							posX = parent.outerWidth () - child.outerWidth ();
						if ((posY + child.outerHeight ()) <= parent.outerHeight ())
							posY = parent.outerHeight () - child.outerHeight ();

						if (posX >= 0)
							posX = 0;
						if (posY >= 0)
							posY = 0;

						if (child.outerWidth () <= parent.outerWidth ())
							posX = 0;
						if (child.outerHeight () <= parent.outerHeight ())
							posY = 0;

						scaleX = scaleY = 1;

						// Make a status no element can be tap
						ONSWIPE = false;
					}
					if (event.type === 'tap') {
						matrix = child.css ("transform").split (", ");
						mapX = parseInt(matrix[4]);
						mapY = matrix[5].split (")");
						mapY = parseInt(mapY[0]);

						posX = mapX;
						posY = mapY;

						scaleX = scaleY = 1;

						originX = originY = 0;

						transition = "all 0s cubic-bezier(0, 0, 0.5, 1)";
					}

					// It's shorter than container
					if (!allowSmaller) {
						if (child.outerWidth () <= parent.outerWidth ()) {
							originX = posX = 0;
							scaleX = 1;
						}
						if (child.outerHeight () <= parent.outerHeight ()) {
							originY = posY = 0;
							scaleY = 1;
						}
					}

					if (scrollHorizontal && !scrollVertical) {
						posY = 0;
						scaleY = 1;
					}
					if (!scrollHorizontal && scrollVertical) {
						posX = 0;
						scaleX = 1;
					}

					posX = Math.round (posX);
					posY = Math.round (posY);

					// Found out if it have twin
					if (child.data("twin")) child = $('[data-twin=' + child.data("twin") + ']');
					// Move the scroll bar
					if (showScroll) {
						updateVSliderPosition(child.siblings().children(".vslider"), transition);
						updateHSliderPosition(child.siblings().children(".hslider"), transition);
					}
					// Move the content
					updateContentPosition(child);

					onScroll (posX, posY, scaleX, scaleY, originX, originY, transition);

					if (event.type === "drag" || event.type === "dragstart" || event.type === "dragend") {
						event.gesture.preventDefault();
						event.gesture.stopPropagation();
					}
				}
			});

			// Assign Mouse Scroll
			elem.on('mousewheel', function (event) {
				var parent = $(this),
					child = $(this).children (":not(.scrollbar)");

				// Map
				matrix = child.css ("transform").split (", ");
				mapX = parseInt(matrix[4]);
				mapY = matrix[5].split (")");
				mapY = parseInt(mapY[0]);

				// Count movement delta
				deltaX = parseInt(event.deltaX);
				deltaY = parseInt(event.deltaY);

				if (deltaX === 0) deltaX = 1;
				if (deltaY === 0) deltaY = 1;

				// Constrain movement
				posX = (mapX -= (deltaX * 1));
				posY = (mapY -= (deltaY * -1));

				transition = "all 0s linear";

				// Count the viewable boundry
				if (rubber) {
					// It's on right
					if ((posX + child.outerWidth ()) <= parent.outerWidth ()) {
						posX = parent.outerWidth () - child.outerWidth ();
						originX = 100;
						scaleX = 1 + Math.abs(deltaX / parent.outerWidth ());
						onReachRight (posX, posY, scaleX, scaleY, originX, originY, transition);
					}

					// It's on bottom
					if ((posY + child.outerHeight ()) <= parent.outerHeight ()) {
						posY = parent.outerHeight () - child.outerHeight ();
						originY = 100;
						scaleY = 1 + Math.abs(deltaY / parent.outerHeight ());
						onReachBottom (posX, posY, scaleX, scaleY, originX, originY, transition);
					}

					// It's on left
					if (posX >= 0) {
						originX = posX = 0;
						scaleX = 1 + Math.abs(deltaX / parent.outerWidth ());
						onReachLeft (posX, posY, scaleX, scaleY, originX, originY, transition);
					}

					// It's on top
					if (posY >= 0) {
						originY = posY = 0;
						scaleY = 1 + Math.abs(deltaY / parent.outerHeight ());
						onReachTop (posX, posY, scaleX, scaleY, originX, originY, transition);
					}
				} else {
					// It's on right
					if ((posX + child.outerWidth ()) <= parent.outerWidth () && scrollHorizontal) {
						posX -= (1 / (posX * 100));
						if ((posX + child.outerWidth ()) <= -(parent.outerWidth () * 2) ) posX = -(parent.outerWidth () * 2) - child.outerWidth ();
						onReachRight (posX, posY, scaleX, scaleY, originX, originY, transition);
					}

					// It's on bottom
					if ((posY + child.outerHeight ()) <= parent.outerHeight () && scrollVertical) {
						posY -= (1 / (posY * 100));
						if ((posY + child.outerHeight ()) <= -(parent.outerHeight () * 2) ) posY = -(parent.outerHeight () * 2) - child.outerHeight ();
						onReachBottom (posX, posY, scaleX, scaleY, originX, originY, transition);
					}

					// It's on left
					if (posX >= 0 && scrollHorizontal) {
						posX += (1 / (deltaX * 100));
						if (posX >= parent.outerWidth ()) posX = parent.outerWidth ();
						onReachLeft (posX, posY, scaleX, scaleY, originX, originY, transition);
					}

					// It's on top
					if (posY >= 0 && scrollVertical) {
						posY += (1 / (deltaY * 100));
						if (posY >= parent.outerHeight ()) posY = parent.outerHeight ();
						onReachTop (posX, posY, scaleX, scaleY, originX, originY, transition);
					}
				}

				// It's shorter than container
				if (!allowSmaller) {
					if (child.outerWidth () <= parent.outerWidth ()) {
						originX = posX = 0;
						scaleX = 1;
					}
					if (child.outerHeight () <= parent.outerHeight ()) {
						originY = posY = 0;
						scaleY = 1;
					}
				}

				// Make sure the other end not moving
				if (scrollHorizontal && !scrollVertical) {
					posY = 0;
					scaleY = 1;
				}
				if (!scrollHorizontal && scrollVertical) {
					posX = 0;
					scaleX = 1;
				}

				// Found out if it have twin
				if (child.data("twin")) child = $('[data-twin=' + child.data("twin") + ']');

				// Move the scroll bar
				if (showScroll) {
					updateVSliderPosition(child.siblings().children(".vslider"), transition);
					updateHSliderPosition(child.siblings().children(".hslider"), transition);
				}

				// Move the content
				updateContentPosition (child);

				// Prevent element to over scrolled
				clearTimeout(scrolltimeout);
				scrolltimeout = setTimeout (function () {
					clearTimeout(scrolltimeout);

					parent.each(function (){
						constrainContentPosition (child, parent);

						// Set the transition
						transition = "all 0.25s cubic-bezier(0, 0, 0.5, 1)";

						// Found out if it have twin
						if (child.data("twin")) child = $('[data-twin=' + child.data("twin") + ']');

						// Move the scroll bar
						if (showScroll) {
							updateVSliderPosition(child.siblings().children(".vslider"), transition);
							updateHSliderPosition(child.siblings().children(".hslider"), transition);
						}

						// Move the content
						updateContentPosition (child);
					});
				}, timer);

				onScroll (posX, posY, scaleX, scaleY, originX, originY, transition);

				event.preventDefault();
			});
		});

	}
}(jQuery, window, document));