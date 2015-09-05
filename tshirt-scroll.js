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
				onScroll: function (posX, posY, scaleX, scaleY, originX, originY, transition, state) {},
				onReachTop: function (posX, posY, scaleX, scaleY, originX, originY, transition, state) {},
				onReachBottom: function (posX, posY, scaleX, scaleY, originX, originY, transition, state) {},
				onReachLeft: function (posX, posY, scaleX, scaleY, originX, originY, transition, state) {},
				onReachRight: function (posX, posY, scaleX, scaleY, originX, originY, transition, state) {}
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
				timer = 768;
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
			// Helper
			var transformExtract = function (style) {
				var matrix = "",
					mapX = 0,
					mapY = 0;

				if (style.webkitTransform != "") matrix = style.webkitTransform;
				else if (style.MozTransform != "") matrix = style.MozTransform;
				else if (style.msTransform != "") matrix = style.msTransform;
				else if (style.OTransform != "") matrix = style.OTransform;
				else if (style.transform != "") matrix = style.transform;

				matrix += "";
				matrix = matrix.replace (/\px/g, "");
				matrix = matrix.split(", ");

				mapX = parseInt(matrix[0].replace ("translate3d(", ""));
				mapY = parseInt(matrix[1]);

				return [mapX, mapY];
			};
			// Move the vslider
			var updateVSliderPosition = function (content)  {
					var vslider = null,
						vscrollbar = null;

					if (content.length > 1) {
						Array.prototype.forEach.call(content, function(el, i) {
							updateVSliderPosition (el);
						});

						clearTimeout(vscrollbartimeout);
						vscrollbartimeout = setTimeout (function () {
							clearTimeout(vscrollbartimeout);
							Array.prototype.forEach.call(content, function(el, i) {
								if (el.parentNode.querySelector(".vslider"))
									el.parentNode.querySelector(".vslider").style.opacity = 0;
							});
						}, (timer + (timer / 4)));
					} else {
						vslider = content.parentNode.querySelector(".vslider"),
						vscrollbar = content.parentNode.querySelector(".vscrollbar");

						if (showScroll && (vslider !== null)) {
							scrollPosY = -posY / (content.offsetHeight - content.parentNode.offsetHeight) * (vscrollbar.offsetHeight - vslider.offsetHeight);

							if (scrollPosY < 0) scrollPosY = 0;
							else if (scrollPosY > vscrollbar.offsetHeight - vslider.offsetHeight) scrollPosY = vscrollbar.offsetHeight - vslider.offsetHeight;

							vslider.style.transition = transition;
							vslider.style.transform = "translate3d(0px," + scrollPosY + "px,0)";
							vslider.style.webkitTransform = vslider.style.transform;
							vslider.style.mozTransform = vslider.style.transform;
							vslider.style.msTransform = vslider.style.transform;
							vslider.style.oTransform = vslider.style.transform;
							vslider.style.opacity = 1;

							clearTimeout(vscrollbartimeout);
							vscrollbartimeout = setTimeout (function () {
								clearTimeout(vscrollbartimeout);
								vslider.style.opacity = 0;
							}, (timer + (timer / 4)));
						}
					}
				},
				updateHSliderPosition = function (content)  {
					var hslider = null,
						hscrollbar = null;

					if (content.length > 1) {
						Array.prototype.forEach.call(content, function(el, i) {
							updateHSliderPosition (el);
						});

						clearTimeout(hscrollbartimeout);
						hscrollbartimeout = setTimeout (function () {
							clearTimeout(hscrollbartimeout);
							Array.prototype.forEach.call(content, function(el, i) {
								if (el.parentNode.querySelector(".hslider"))
									el.parentNode.querySelector(".hslider").style.opacity = 0;
							});
						}, (timer + (timer / 4)));
					} else {
						hslider = content.parentNode.querySelector(".hslider");
						hscrollbar = content.parentNode.querySelector(".hscrollbar");

						if (showScroll && (hslider !== null)) {
							scrollPosX = -posX / (content.offsetWidth - content.parentNode.offsetWidth) * (hscrollbar.offsetWidth - hslider.offsetWidth);

							if (scrollPosX < 0) scrollPosX = 0;
							else if (scrollPosX > hscrollbar.offsetWidth - hslider.offsetWidth) scrollPosX = hscrollbar.offsetWidth - hslider.offsetWidth;

							hslider.style.transition = transition;
							hslider.style.transform = "translate3d(" + scrollPosX + "px,0px,0)";
							hslider.style.webkitTransform = hslider.style.transform;
							hslider.style.mozTransform = hslider.style.transform;
							hslider.style.msTransform = hslider.style.transform;
							hslider.style.oTransform = hslider.style.transform;
							hslider.style.opacity = 1;

							clearTimeout(hscrollbartimeout);
							hscrollbartimeout = setTimeout (function () {
								clearTimeout(hscrollbartimeout);
								hslider.style.opacity = 0;
							}, (timer + (timer / 4)));
						}
					}
				};
			// Update content position
			var updateContentPosition = function (elem) {
					if (elem.length > 1) {
						Array.prototype.forEach.call(elem, function(el, i) {
							updateContentPosition (el);
						});
					} else {
						elem.style.transform = "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)";
						elem.style.webkitTransform = elem.style.transform;
						elem.style.mozTransform = elem.style.transform;
						elem.style.msTransform = elem.style.transform;
						elem.style.oTransform = elem.style.transform;
						elem.style.transformOrigin = originX + "% " + originY + "%";
						elem.style.webkitTransformOrigin = elem.style.transformOrigin;
						elem.style.mozTransformOrigin = elem.style.transformOrigin;
						elem.style.msTransformOrigin = elem.style.transformOrigin;
						elem.style.oTransformOrigin = elem.style.transformOrigin;
						elem.style.transition = transition;
						elem.style.webkitTransition = transition;
						elem.style.mozTransition = transition;
						elem.style.msTransition = transition;
						elem.style.oTransition = transition;
					}
				},
				constrainContentPosition = function (child, parent) {
					if ((posX + child.offsetWidth) <= parent.offsetWidth) posX = parent.offsetWidth - child.offsetWidth;
					if (posX >= 0) posX = 0;
					if ((posY + child.offsetHeight) <= parent.offsetHeight) posY = parent.offsetHeight - child.offsetHeight;
					if (posY >= 0) posY = 0;
				};

			// Assign transform CSS
			elem.children ().css ("transform", "translate3d(0,0,0)");

			// Create scroll bar
			if (showScroll) {
				elem.each (function () {
					var that = this,
						content = that.querySelector(":not(.scrollbar)"),
						vsliderheight = (that.offsetHeight / (content.offsetHeight) * 100),
						hsliderwidth = (that.offsetWidth / (content.offsetWidth) * 100),
						vslider = "",
						hslider = "",
						defaultScrollStyle = function (elem) {
							elem.style.position = "absolute";
							elem.style.top = 0;
							elem.style.opacity = 0;
							elem.style.background = "#666";
							elem.style.border = "1px solid #ccc";
							elem.style.cursor = "pointer";
							elem.style.transition = "all 0.256s cubic-bezier(0, 0, 0.5, 1)";
							elem.style.boxSizing = "border-box";
							elem.style.webkitBoxSizing = elem.style.boxSizing;
							elem.style.mozBoxSizing = elem.style.boxSizing;
							elem.style.msBoxSizing = elem.style.boxSizing;
							elem.style.oBoxSizing = elem.style.boxSizing;
						};

					// Constrain the slider size so it won't be to small
					if (vsliderheight < 32) vsliderheight = 32;
					if (hsliderwidth < 32) hsliderwidth = 32;

					// Create the scrollsbars
					that.style.position = "relative";
					if (vsliderheight < 100) {
						that.innerHTML += "<div class='scrollbar vscrollbar'><div class='vslider'></div></div>";

						vscrollbar = that.querySelector(".vscrollbar");
						vscrollbar.style.position = "absolute";
						vscrollbar.style.top = "8px";
						vscrollbar.style.bottom = "8px";
						vscrollbar.style.left = "initial";
						vscrollbar.style.right = 0;
						vscrollbar.style.width = "8px";

						defaultScrollStyle (vscrollbar.querySelector(".vslider"));
					}
					if (hsliderwidth < 100) {
						that.innerHTML += "<div class='scrollbar hscrollbar'><div class='hslider'></div></div>";

						hscrollbar = that.querySelector(".hscrollbar");
						hscrollbar.style.position = "absolute";
						hscrollbar.style.top = "initial";
						hscrollbar.style.bottom = 0;
						hscrollbar.style.left = "8px";
						hscrollbar.style.right = "8px";
						hscrollbar.style.height = "8px";

						defaultScrollStyle (hscrollbar.querySelector(".hslider"));
					}
					// Need to be recall after innerHTML
					content = that.querySelector(":not(.scrollbar)");

					that.querySelector(".scrollbar").style.position = "absolute";

					// Vertical Slider actions
					vslider = that.querySelector(".vslider");
					if (vslider) {
						vslider.style.top = 0;
						vslider.style.left = "initial";
						vslider.style.right = 0;
						vslider.style.width = "8px";
						vslider.style.height = vsliderheight + "%";

						vslider.onmouseover = function () {
							transition = "opacity 0.25s cubic-bezier(0, 0, 0.5, 1)";
							updateVSliderPosition(content);
							clearTimeout(vscrollbartimeout);
						};
						vslider.onmouseout = function () {
							updateVSliderPosition(content);
						};

						$(vslider).hammer().on("dragstart drag dragend tap", function(event) {
							var percentageScroll = 0;

							if (event.type === "dragstart") {
								// Touch
								scrollStartY = event.gesture.center.pageY;

								// Constrain movement
								scrollPosY = scrollMapY = transformExtract (this.style)[1];
							}
							if (event.type === 'drag' || event.type === 'dragend') {
								// Count movement delta
								deltaY = -event.gesture.deltaY;
								// Constrain movement
								scrollPosY = scrollMapY - deltaY;
							}

							percentageScroll = scrollPosY / this.parentNode.offsetHeight * 100;
							posY = percentageScroll / 100 * -content.offsetHeight;

							constrainContentPosition (content, that);

							// Set the transition
							transition = "all 0s linear, opacity 0.25s cubic-bezier(0, 0, 0.5, 1)";

							// Found out if it have twin
							if (content.getAttribute("data-twin")) content = document.querySelectorAll('[data-twin=' + content.getAttribute("data-twin") + ']');

							// Move the scroll bar
							updateVSliderPosition(content);
							clearTimeout(vscrollbartimeout);

							// Move the content
							updateContentPosition (content);

							if (event.type === "drag" || event.type === "dragstart" || event.type === "dragend") {
								event.gesture.preventDefault();
								event.gesture.stopPropagation();
							}
						});
					}

					// Horizontal Slider actions
					hslider = that.querySelector(".hslider");
					if (hslider) {
						hslider.style.top = 0;
						hslider.style.left = 0;
						hslider.style.width = hsliderwidth + "%";
						hslider.style.height = "8px";

						hslider.onmouseover = function () {
							transition = "opacity 0.25s cubic-bezier(0, 0, 0.5, 1)";
							updateHSliderPosition(content, "all 0.25s cubic-bezier(0, 0, 0.5, 1)");
							clearTimeout(hscrollbartimeout);
						};
						hslider.onmouseout = function () {
							updateHSliderPosition(content, "all 0.25s cubic-bezier(0, 0, 0.5, 1)");
						};
						$(hslider).hammer().on("dragstart drag dragend tap", function(event) {
							var percentageScroll = 0;

							if (event.type === "dragstart") {
								// Touch
								scrollStartX = event.gesture.center.pageX;

								// Constrain movement
								scrollPosX = scrollMapX = transformExtract (this.style)[0];
							}
							if (event.type === 'drag' || event.type === 'dragend') {
								// Count movement delta
								deltaX = -event.gesture.deltaX;
								// Constrain movement
								scrollPosX = scrollMapX - deltaX;
							}

							percentageScroll = scrollPosX / this.parentNode.offsetWidth * 100;
							posX = percentageScroll / 100 * -content.offsetWidth;

							constrainContentPosition (content, that);

							// Set the transition
							transition = "all 0s linear";

							// Found out if it have twin
							if (content.getAttribute("data-twin")) content = document.querySelectorAll('[data-twin=' + content.getAttribute("data-twin") + ']');

							// Move the scroll bar
							updateHSliderPosition(content);
							clearTimeout(hscrollbartimeout);

							// Move the content
							updateContentPosition (content);

							if (event.type === "drag" || event.type === "dragstart" || event.type === "dragend") {
								event.gesture.preventDefault();
								event.gesture.stopPropagation();
							}
						});
					}
				});
			}

			// Assign touch event
			elem.hammer().on("dragstart drag dragend tap", function(event) {
				var that = this,
					content = that.querySelector(":not(.scrollbar)"),
					isVslider = new RegExp('(^| )' + "vslider" + '( |$)', 'gi').test(event.target.className),
					isHslider = new RegExp('(^| )' + "hslider" + '( |$)', 'gi').test(event.target.className);

				if (!isVslider && !isHslider) {
					if (event.type === "dragstart") {
						// Map
						matrix = transformExtract (content.style);
						mapX = matrix[0];
						mapY = matrix[1];

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
							if ((posX + content.offsetWidth) <= that.offsetWidth) {
								posX = that.offsetWidth - content.offsetWidth;
								originX = 100;
								scaleX = 1 + (deltaX / that.offsetWidth);
							}
							if ((posY + content.offsetHeight) <= that.offsetHeight) {
								posY = that.offsetHeight - content.offsetHeight;
								originY = 100;
								scaleY = 1 + (deltaY / that.offsetHeight);
							}

							if (posX >= 0) {
								originX = posX = 0;
								scaleX = 1 - (deltaX / that.offsetWidth)
							}
							if (posY >= 0) {
								originY = posY = 0;
								scaleY = 1 - (deltaY / that.offsetHeight)
							}
						}

						// Calling the callbacks
						if ((posX + content.offsetWidth) <= that.offsetWidth)  		onReachRight  (posX, posY, scaleX, scaleY, originX, originY, transition, event.type);
						if ((posY + content.offsetHeight) <= that.offsetHeight) 	onReachBottom (posX, posY, scaleX, scaleY, originX, originY, transition, event.type);
						if (posX >= 0)   											onReachLeft   (posX, posY, scaleX, scaleY, originX, originY, transition, event.type);
						if (posY >= 0)  											onReachTop    (posX, posY, scaleX, scaleY, originX, originY, transition, event.type);

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
						if (accelerator < 1) transition = "all " + accelerator + "s cubic-bezier(0, 0, 0.5, 1)";
						else transition = "all 0.512s cubic-bezier(0, 0, 0.5, 1)";

						// Count the viewable boundry
						constrainContentPosition (content, that);

						if (content.offsetWidth <= that.offsetWidth) posX = 0;
						if (content.offsetHeight <= that.offsetHeight) posY = 0;

						scaleX = scaleY = 1;

						// Make a status no element can be tap
						ONSWIPE = false;
					}
					if (event.type === 'tap') {
						// Map
						matrix = transformExtract (content.style);
						mapX = matrix[0];
						mapY = matrix[1];

						posX = mapX;
						posY = mapY;

						scaleX = scaleY = 1;

						originX = originY = 0;

						transition = "all 0.512s cubic-bezier(0, 0, 0.5, 1)";
					}

					// It's shorter than container
					if (!allowSmaller) {
						if (content.offsetWidth <= that.offsetWidth) {
							originX = posX = 0;
							scaleX = 1;
						}
						if (content.offsetHeight <= that.offsetHeight) {
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
					if (content.getAttribute("data-twin")) content = document.querySelectorAll('[data-twin=' + content.getAttribute("data-twin") + ']');

					// Move the scroll bar
					if (showScroll) {
						if (deltaY) updateVSliderPosition(content);
						if (deltaX) updateHSliderPosition(content);
					}

					// Move the content
					updateContentPosition (content);

					onScroll (posX, posY, scaleX, scaleY, originX, originY, transition, event.type);

					if (event.type === "drag" || event.type === "dragstart" || event.type === "dragend") {
						event.gesture.preventDefault();
						event.gesture.stopPropagation();
					}
				}
			});

			// Assign Mouse Scroll
			elem.on('mousewheel', function (event) {
				var that = this,
					content = that.querySelector(":not(.scrollbar)"),
					lastDeltaX = 0,
					lastDeltaY = 0;

				// Map
				matrix = transformExtract (content.style);
				mapX = matrix[0];
				mapY = matrix[1];

				// Count movement delta
				lastDeltaX = Math.abs(deltaX = parseInt(event.deltaX));
				lastDeltaY = Math.abs(deltaY = parseInt(event.deltaY));

				if (Math.abs(deltaX) > Math.abs(deltaY)) deltaY = 0;
				else if (Math.abs(deltaX) < Math.abs(deltaY)) deltaX = 0;
				else deltaX = deltaY = 0;

				// Constrain movement
				posX = (mapX -= (deltaX * 1));
				posY = (mapY -= (deltaY * -1));

				transition = "all 0s linear, opacity 0.25s cubic-bezier(0, 0, 0.5, 1)";

				// Count the viewable boundry
				if (rubber) {
					// It's on bottom
					if ((posY + content.offsetHeight) <= that.offsetHeight) {
						posY = that.offsetHeight - content.offsetHeight;
						originY = 100;
						scaleY = 1 + Math.abs(deltaY / that.offsetHeight);
						onReachBottom (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
					// It's on top
					if (posY >= 0) {
						originY = posY = 0;
						scaleY = 1 + Math.abs(deltaY / that.offsetHeight);
						onReachTop (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
					// It's on right
					if ((posX + content.offsetWidth) <= that.offsetWidth) {
						posX = that.offsetWidth - content.offsetWidth;
						originX = 100;
						scaleX = 1 + Math.abs(deltaX / that.offsetWidth);
						onReachRight (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
					// It's on left
					if (posX >= 0) {
						originX = posX = 0;
						scaleX = 1 + Math.abs(deltaX / that.offsetWidth);
						onReachLeft (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
				} else {
					// It's on bottom
					if ((posY + content.offsetHeight) <= that.offsetHeight && scrollVertical) {
						posY -= (1 / (posY * 100));
						if ((posY + content.offsetHeight) <= -(that.offsetHeight * 2) ) posY = -(that.offsetHeight * 2) - content.offsetHeight;
						onReachBottom (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
					// It's on top
					if (posY > 0 && scrollVertical) {
						if (posY >= that.offsetHeight) posY = that.offsetHeight;
						onReachTop (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
					// It's on right
					if ((posX + content.offsetWidth) <= that.offsetWidth && scrollHorizontal) {
						posX -= (1 / (posX * 100));
						if ((posX + content.offsetWidth) <= -(that.offsetWidth * 2) ) posX = -(that.offsetWidth * 2) - content.offsetWidth;
						onReachRight (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
					// It's on left
					if (posX > 0 && scrollHorizontal) {
						if (posX >= that.offsetWidth) posX = that.offsetWidth;
						onReachLeft (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");
					}
				}

				// It's shorter than container
				if (!allowSmaller) {
					if (content.offsetWidth <= that.offsetWidth) {
						originX = posX = 0;
						scaleX = 1;
					}
					if (content.offsetHeight <= that.offsetHeight) {
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
				if (content.getAttribute("data-twin")) content = document.querySelectorAll('[data-twin=' + content.getAttribute("data-twin") + ']');

				// Move the scroll bar
				if (showScroll) {
					if (deltaY) updateVSliderPosition(content);
					if (deltaX) updateHSliderPosition(content);
				}

				// Move the content
				updateContentPosition (content);

				// Prevent element to over scrolled
				clearTimeout(scrolltimeout);
				scrolltimeout = setTimeout (function () {
					// Constrain the position
					constrainContentPosition (content, that);

					// Set the transition
					transition = "all 0.25s cubic-bezier(0, 0, 0.5, 1)";

					// Move the content
					updateContentPosition (content);

					clearTimeout(scrolltimeout);
				}, timer);

				onScroll (posX, posY, scaleX, scaleY, originX, originY, transition, "mousescroll");

				event.preventDefault();
			});
		});

	}
}(jQuery, window, document));