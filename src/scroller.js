(function ($) {
    'use strict';

    /**
     * Scroller
     *
     * @return {boolean}
     */
    $.Scroller = function (options) {
        // Config
        $.extend(true, (this.settings = {}), $.Scroller.defaults, options);

        // Variables
        this.toDisplay = [];
        this.timeout = null;
        this.container = {
            width: 0,
            height: 0
        };
        this.offset = {
            current: {
                x: 0,
                y: 0
            },
            previous: {
                x: 0,
                y: 0
            }
        };
        this.direction = null;

        // Init
        if (this.prepareOptions()) {
            return this.init();
        }

        return false;
    };

    $.Scroller.defaults = {
        axis: 'y',
        containerDimensions: false,
        timeout: 0,
        displayElements: {
            element: undefined,
            percent: 60,
            hide: false,
            onShow: undefined,
            onHide: undefined
        },
        classes: {
            prefix: 'scroller',
            toDisplay: '{prefix}-to-display',
            hidden: 'is-hidden'
        },
        onComplete: undefined
    };

    $.Scroller.prototype = {
        /**
         * Prepare user options
         *
         * @return {boolean}
         */
        prepareOptions: function () {
            let self = this;

            // Classes
            $.each(self.settings.classes, function (key, value) {
                if (typeof value === 'string') {
                    self.settings.classes[key] = value.replace(/{prefix}/, self.settings.classes.prefix);
                }
            });

            return true;
        },

        /**
         * Set options
         *
         * @param {object} options User options
         */
        setOptions: function (options) {
            $.extend(true, this.settings, options);

            return this;
        },

        /**
         * Initialisation
         */
        init: function () {
            this.requestAnimationFramePolyfill();

            if (this.settings.containerDimensions) {
                this.setContainerDimensions();
            }

            // User callback
            if (this.settings.onComplete !== undefined) {
                this.settings.onComplete.call({
                    scroller: this
                });
            }

            return this;
        },

        /**
         * Polyfill requestAnimationFrame
         */
        requestAnimationFramePolyfill: function () {
            let lastTime = 0;
            let vendorIndex = 0;
            let vendors = ['o', 'ms', 'moz', 'webkit'];

            for (vendorIndex = 0; vendorIndex < vendors.length && !window.requestAnimationFrame; ++vendorIndex) {
                window.requestAnimationFrame = window[vendors[vendorIndex] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[vendorIndex] + 'CancelAnimationFrame'] || window[vendors[vendorIndex] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback) {
                    let currTime = new Date().getTime();
                    let timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    let id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    }, timeToCall);

                    lastTime = currTime + timeToCall;

                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }
        },

        /**
         * Update specific offset
         *
         * @param {string} type Offset type: current, previous
         */
        updateOffset: function (type) {
            this.offset[type].x = parseInt(window.pageXOffset);
            this.offset[type].y = parseInt(window.pageYOffset);

            return this;
        },

        /**
         * Get specific offset
         *
         * @param {string=undefined} type Offset type: current, previous
         * @return {object} offset x,y
         */
        getOffset: function (type) {
            return this.offset[type] !== undefined ? this.offset[type] : this.offset;
        },

        /**
         * Update container dimensions
         */
        setContainerDimensions: function () {
            let self = this;

            // Default value
            self.container.width = parseInt(window.innerWidth);
            self.container.height = parseInt(window.innerHeight);

            // On resize
            $(window).on('resize.scroller orientationchange.scroller', function () {
                self.container.width = parseInt(window.innerWidth);
                self.container.height = parseInt(window.innerHeight);
            });

            return self;
        },

        /**
         * Get container dimensions
         *
         * @return {object} container: width, height
         */
        getContainerDimensions: function () {
            return this.container;
        },

        /**
         * Scroll event
         *
         * @param {function} callback function to execute during scroll event
         */
        onScroll: function (callback) {
            var self = this;

            $(window).on('scroll.scroller', function (event) {
                clearTimeout(self.timeout);

                self.timeout = setTimeout(function () {
                    event.data = {
                        self: self
                    };

                    self.updateOffset('current');

                    // Display elements
                    if (self.hasDisplayElements()) {
                        self.displayElementsOnScroll();
                    }

                    // Callback
                    if (callback !== undefined) {
                        callback.call({
                            scroller: self,
                            event: event,
                            window: window,
                            containerDimensions: self.getContainerDimensions(),
                            offset: self.getOffset(),
                            direction: self.getScrollDirection()
                        });
                    }

                    self.updateOffset('previous');
                }, self.settings.timeout);
            });

            return self;
        },

        /**
         * Get scroll direction
         *
         * @return {string}
         */
        getScrollDirection: function () {
            if (this.settings.axis === 'x') {
                if (this.offset.previous.x > this.offset.current.x) {
                    this.direction = 'left';
                } else if (this.offset.previous.x < this.offset.current.x) {
                    this.direction = 'right';
                }
            } else {
                if (this.offset.previous.y > this.offset.current.y) {
                    this.direction = 'up';
                } else {
                    this.direction = 'down';
                }
            }

            return this.direction;
        },

        /**
         * Display elements during scroll
         *
         * @param {object} options User options
         */
        displayElements: function (options) {
            let self = this;

            $(window).on('load', function () {
                // Set user options
                $.extend(self.settings.displayElements, options);

                // Set Scroller options
                self.setOptions({
                    timeout: 0,
                    containerDimensions: true
                });
                self.setContainerDimensions();

                // Prepare
                if (self.settings.displayElements.element === undefined) {
                    self.settings.displayElements.element = $('.' + self.settings.classes.toDisplay);
                }

                // For every element => get position
                if (self.settings.displayElements.element.length) {
                    self.settings.displayElements.element.each(function (i, element) {
                        element = $(element);
                        let offset = element.offset();
                        let customOffsetAttr = element.attr('data-scroller-offset');
                        let customOffset = customOffsetAttr !== undefined ? parseInt(customOffsetAttr) : 0;

                        // Per default, the element is hidden
                        element.addClass(self.settings.classes.hidden);

                        // Get positions
                        let object = {
                            element: element,
                            offset: {}
                        };
                        if (self.settings.axis === 'y') {
                            object.offset.top = parseInt(offset.top + customOffset);
                            object.offset.bottom = parseInt((offset.top + customOffset) - element.height());
                        }
                        if (self.settings.axis === 'x') {
                            object.offset.left = parseInt(offset.left + customOffset);
                            object.offset.right = parseInt((offset.left + customOffset) + element.width());
                        }

                        self.toDisplay.push(object);
                    });
                }

                // On load, display elements in current viewport
                self.displayElementsOnScroll();
            });

            return self;
        },

        /**
         * Determines if there are elements to display
         *
         * @return {boolean}
         */
        hasDisplayElements: function () {
            return (this.toDisplay.length > 0);
        },

        /**
         * Récupération de la limite d'affichage du conteneur en fonction du scroll
         *
         * @return {object} x,y
         */
        getDisplayLimit: function () {
            let limit = {
                x: 0,
                y: 0
            };

            // Calcul de la ligne d'affichage par rapport au conteneur, un pourcentage d'affichage et l'axe
            if (this.settings.axis === 'x') {
                limit.x = this.offset.current.x + (this.container.width * this.settings.displayElements.percent / 100);
            } else {
                limit.y = this.offset.current.y + (this.container.height * this.settings.displayElements.percent / 100);
            }

            return limit;
        },

        /**
         * Display elements handler
         */
        displayElementsOnScroll: function () {
            let self = this;
            let limit = self.getDisplayLimit();

            $.each(self.toDisplay, function (i, toDisplay) {
                if ((self.settings.axis === 'y' && limit.y >= toDisplay.offset.top) || (self.settings.axis === 'x' && limit.x >= toDisplay.offset.left)) {
                    toDisplay.element.removeClass(self.settings.classes.hidden);

                    // User callback
                    if (self.settings.displayElements.onShow !== undefined) {
                        self.settings.displayElements.onShow.call({
                            scroller: self,
                            toDisplay: toDisplay,
                            displayLimit: limit
                        });
                    }
                }

                if (self.settings.displayElements.hide && ((self.settings.axis === 'y' && limit.y < toDisplay.offset.bottom) || (self.settings.axis === 'x' && limit.x < toDisplay.offset.left))) {
                    toDisplay.element.addClass(self.settings.classes.hidden);

                    // User callback
                    if (self.settings.displayElements.onHide !== undefined) {
                        self.settings.displayElements.onHide.call({
                            scroller: self,
                            toDisplay: toDisplay,
                            displayLimit: limit
                        });
                    }
                }
            });

            return self;
        }
    };
})(jQuery);