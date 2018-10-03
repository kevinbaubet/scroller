(function ($) {
    'use strict';

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
            toDisplay: '{prefix}-toDisplay',
            hidden: 'is-hidden'
        },
        onComplete: undefined
    };

    $.Scroller.prototype = {
        /**
         * Prépration des options utilisateur
         *
         * @return bool
         */
        prepareOptions: function () {
            var self = this;

            // Classes
            $.each(self.settings.classes, function (key, value) {
                if (typeof value === 'string') {
                    self.settings.classes[key] = value.replace(/{prefix}/, self.settings.classes.prefix);
                }
            });

            return true;
        },

        /**
         * Met à jour les options
         *
         * @param object options Options utilisateur
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
            var lastTime = 0;
            var vendorIndex = 0;
            var vendors = ['o', 'ms', 'moz', 'webkit'];

            for (vendorIndex = 0; vendorIndex < vendors.length && !window.requestAnimationFrame; ++vendorIndex) {
                window.requestAnimationFrame = window[vendors[vendorIndex] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[vendorIndex] + 'CancelAnimationFrame'] || window[vendors[vendorIndex] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
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
         * Met à jour les données de l'offset courant
         *
         * @param string type Type d'offet current,previous
         */
        setOffset: function (type) {
            this.offset[type].x = parseInt(window.pageXOffset);
            this.offset[type].y = parseInt(window.pageYOffset);

            return this;
        },

        /**
         * Récupère l'offset courant
         *
         * @param string type Type d'offet current,previous
         * @return object offset x,y
         */
        getOffset: function (type) {
            return (this.offset[type] !== undefined) ? this.offset[type] : this.offset;
        },

        /**
         * Met à jour les dimensions du conteneur
         */
        setContainerDimensions: function () {
            var self = this;

            // Valeur par défaut
            self.container.width = parseInt(window.innerWidth);
            self.container.height = parseInt(window.innerHeight);

            // Au resize
            $(window).on('resize.scroller orientationchange.scroller', function () {
                self.container.width = parseInt(window.innerWidth);
                self.container.height = parseInt(window.innerHeight);
            });

            return self;
        },

        /**
         * Récupère les dimensions du conteneur
         *
         * @return object container width,height
         */
        getContainerDimensions: function () {
            return this.container;
        },

        /**
         * Événement au scroll
         *
         * @param  function callback Callback à executer lors du scroll
         */
        onScroll: function (callback) {
            var self = this;

            $(window).on('scroll.scroller', function (event) {
                clearTimeout(self.timeout);

                self.timeout = setTimeout(function () {
                    // Transmission de l'objet Scroller
                    event.data = {
                        self: self
                    };

                    // Mise à jour de l'offset
                    self.setOffset('current');

                    // Affiche les éléments au scroll
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

                    // On stock l'offset précédent avant le prochain scroll
                    self.setOffset('previous');

                }, self.settings.timeout);
            });

            return self;
        },

        /**
         * Récupère le sens du scroll
         *
         * @return string
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
         * Affiche les éléments au scroll
         *
         * @param  object options Options utilisateur
         */
        displayElements: function (options) {
            var self = this;

            // Changement des options
            $.extend(self.settings.displayElements, options);

            self.setOptions({
                timeout: 0,
                windowDimensions: true
            });

            // Activation des dimensions du conteneur
            self.setContainerDimensions();

            // Préparation
            if (self.settings.displayElements.element === undefined) {
                self.settings.displayElements.element = $('.' + self.settings.classes.toDisplay);
            }

            // Pour chaque élément, on récupère sa position
            if (self.settings.displayElements.element.length) {
                self.settings.displayElements.element.each(function (i, element) {
                    element = $(element);
                    var offset = element.offset();

                    // Par défaut, on masque l'élément
                    element.addClass(self.settings.classes.hidden);

                    // Récupération des positions
                    var object = {
                        element: element,
                        offset: {
                            top: parseInt(offset.top),
                            bottom: parseInt(offset.top - element.height())
                        }
                    };
                    if (self.settings.axis === 'x') {
                        $.extend(object.offset, {
                            left: parseInt(offset.left),
                            right: parseInt(offset.left + element.width())
                        });
                    }

                    self.toDisplay.push(object);
                });
            }

            // Au chargement de la page, on affiche les éléments présent dans le conteneur
            self.displayElementsOnScroll();

            return self;
        },

        /**
         * Détermine s'il y a des éléments à afficher au scroll
         *
         * @return bool
         */
        hasDisplayElements: function () {
            return (this.toDisplay.length);
        },

        /**
         * Récupération de la limite d'affichage du conteneur en fonction du scroll
         *
         * @return object x,y
         */
        getDisplayLimit: function () {
            var limit = {
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
         * Gestion de l'affichage au scroll
         */
        displayElementsOnScroll: function () {
            var self = this;
            var limit = self.getDisplayLimit();

            // Pour chaque élément à afficher, on test si c'est le moment
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