/**
 * Class ExtendedSlideItMoo
 *
 * Provide methods to handle slideItMoo slider
 * @copyright  MEN AT WORK 2013
 * @package    slideitmoo
 * @license    GNU/LGPL
 */
(function($){

    this.ExtendedSlideItMoo = new Class({

        /**
         * Implementations
         */
        Implements: [Events, Options],

        /**
         * Options
         */
        options: {
            enabled: false,
            containerId: null,
            containerChildsId: null,
            sliderAttr: null,
            childAttr: null,
            containerAttr: {
                overallContainer: {
                    elem: null,
                    styles: {
                        width: null,
                        height: null
                    }
                },
                elementScrolled: {
                    elem: null,
                    styles: {
                        width: null,
                        height: null
                    }
                },
                thumbsContainer: {
                    elem: null,
                    styles: {
                        width: null,
                        height: null
                    }
                }
            },
            slider: null,
            elemCount: null,
            navsSize: {
                width: 0,
                height: 0
            },
            responsive: {},
            resizeTimer: null
        },

        /**
         * Initialize the object
         *
         * @param {object} options
         */
        initialize: function (options) {
            this.setOptions(options);
            if ($(this.options.containerId)) {
                this.options.enabled = true;

                document.documentElement.className += " js-slider";

                // Fix bug from json_encode Fx.Transitions is not a function
                this.options.sliderAttr.transition = eval(this.options.sliderAttr.transition);

                this.options.elemCount = $$(this.options.containerChildsId).length;

                this.setItemDimension().setNavSize().setControlsClass();

                this.options.containerAttr.overallContainer.elem = this.options.sliderAttr.overallContainer;
                this.options.containerAttr.elementScrolled.elem = this.options.sliderAttr.elementScrolled;
                this.options.containerAttr.thumbsContainer.elem = this.options.sliderAttr.thumbsContainer;
            }
        },

        /**
         * Create real slider and set additional attributes
         */
        run: function () {
            var self = this;
            if (this.options.enabled) {
                // Create real slider
                if (this.options.slider === null) {
                    this.options.slider = new SlideItMoo(this.options.sliderAttr);
                } else {
                    this.options.slider.initialize();
                }

                // Set or remove styles
                if (!this.options.sliderAttr.skipInlineStyles && !this.options.sliderAttr.isResponsive) {
                    this.setPixelStyles();
                } else {
                    Object.each(this.options.childAttr, function (value, key) {
                        self.options.childAttr[key] = null;
                    }.bind(self));
                }

                // Set responsive styles
                if (this.options.sliderAttr.isResponsive) {
                    this.setPcentStyles();
                }

                // Add swip event
                if (this.isTouch()) {
                    this.addSwipeEvent();
                }

                this.setAllContainerStyles().addResizeEvent();
            }
        },

        /**
         * Bridge to SlideItMooFramework
         *
         * @param {string} type
         * @param {function} fn
         * @param {object} internal
         */
        addEvent: function (type, fn, internal) {
            this.options.slider.addEvent(type, fn, internal);
        },

        /**
         * Bridge to SlideItMooFramework
         *
         * @param {string} type
         * @param {function} fn
         * @param {object} internal
         */
        removeEvent: function (type, fn) {
            this.options.slider.removeEvent(type, fn);
        },

        // HELPER --------------------------------------------------------------------
        /**
         * Add swipe event
         */
        addSwipeEvent: function () {
            var self = this;

            if(this.options.contao3) {
                // Set new contao 3 swipe methode
                $(this.options.containerId).addEvent('swipe', function(e) {
                    (e.direction == 'left') ? self.options.slider.slide(1) : self.options.slider.slide(-1);
                });
            } else {
                // Set swipe with powertools for older versions than contao 3
                var func = function (event) {
                    if (event.direction === 'left') {
                        self.options.slider.slide(1);
                    } else if (event.direction === 'right') {
                        self.options.slider.slide(-1);
                    }
                };

                if (this.options.elemCount > this.options.sliderAttr.itemsVisible) {
                    $(this.options.containerId).addEvent('swipe', func);

                    $(this.options.containerId).store('swipe:distance', 20);
                    $(this.options.containerId).store('swipe:cancelVertical', true);
                } else {
                    $(this.options.containerId).removeEvents('swipe');
                }
            }
        },

        /**
         * Return if operation system is touch
         */
        isTouch: function () {
            return 'ontouchstart' in window;
        },

        /**
         * Define the dimension of one slider item
         *
         * @returns {object}
         */
        setItemDimension: function () {
            if (this.options.sliderAttr.isResponsive) {
                var elementScrolledPxWidth = $(this.options.sliderAttr.elementScrolled).getWidth();
                var elementScrolledPxHeight = $(this.options.sliderAttr.elementScrolled).getHeight();
                this.options.responsive.thumbsContainer = {
                    pcent: {
                        width: ((this.options.elemCount * 100) / this.options.sliderAttr.itemsVisible),
                        height: ((this.options.elemCount * 100) / this.options.sliderAttr.itemsVisible)
                    },
                    pixel: {
                        width: ((this.options.elemCount * elementScrolledPxWidth) / this.options.sliderAttr.itemsVisible),
                        height: ((this.options.elemCount * elementScrolledPxHeight) / this.options.sliderAttr.itemsVisible)
                    }
                };

                this.options.responsive.child = {
                    pcent: {
                        width: (100 / this.options.elemCount),
                        height: (100 / this.options.elemCount)
                    },
                    pixel: {
                        width: (this.options.responsive.thumbsContainer.pixel.width / this.options.elemCount),
                        height: (this.options.responsive.thumbsContainer.pixel.height / this.options.elemCount)
                    }
                };

                this.options.sliderAttr.itemWidth = this.options.responsive.child.pixel.width.round(2);
                this.options.sliderAttr.itemHeight = this.options.responsive.child.pixel.height.round(2);

                // Fix bug missed itemDimensions
            } else if (!this.options.sliderAttr.itemWidth || this.options.sliderAttr.skipInlineStyles) {
                this.options.sliderAttr.itemWidth = $$(this.options.containerChildsId)[0].getComputedSize().totalWidth;
                this.options.sliderAttr.itemHeight = $$(this.options.containerChildsId)[0].getComputedSize().totalHeight;
            }

            return this;
        },

        /**
         * Define the navigation size
         *
         * @returns {object}
         */
        setNavSize: function () {
            if (this.options.sliderAttr.showControls && !this.options.sliderAttr.skipNavSize) {
                var fwdSize = $(this.options.sliderAttr.overallContainer).getElement(this.options.sliderAttr.navs.fwd).getSize(),
                    bkSize = $(this.options.sliderAttr.overallContainer).getElement(this.options.sliderAttr.navs.bk).getSize();

                this.options.navsSize = {
                    width: fwdSize.x + bkSize.x,
                    height: fwdSize.y + bkSize.y
                };
            }

            return this;
        },

        /**
         * Set the controls class
         *
         * @returns {object}
         */
        setControlsClass: function () {
            if (this.options.elemCount <= this.options.sliderAttr.itemsVisible && this.options.sliderAttr.showControls) {
                $(this.options.sliderAttr.overallContainer).getElement(this.options.sliderAttr.navs.fwd).addClass('hidden');
                $(this.options.sliderAttr.overallContainer).getElement(this.options.sliderAttr.navs.bk).addClass('hidden');
            } else {
                $(this.options.sliderAttr.overallContainer).getElement(this.options.sliderAttr.navs.fwd).removeClass('hidden');
                $(this.options.sliderAttr.overallContainer).getElement(this.options.sliderAttr.navs.bk).removeClass('hidden');
            }

            return this;
        },

        /**
         * Define the styles for all container objects in pixel
         *
         * @returns {object}
         */
        setPixelStyles: function () {
            if (this.options.sliderAttr.slideVertical) {
                this.options.containerAttr.overallContainer.styles.height = (this.options.sliderAttr.itemsVisible * this.options.sliderAttr.itemHeight + this.options.navsSize.height).round(2);
                this.options.containerAttr.elementScrolled.styles.height = (this.options.sliderAttr.itemsVisible * this.options.sliderAttr.itemHeight).round(2);
                this.options.containerAttr.thumbsContainer.styles.height = (this.options.elemCount * this.options.sliderAttr.itemHeight + 10).round(2);
            } else {
                this.options.containerAttr.overallContainer.styles.width = (this.options.sliderAttr.itemsVisible * this.options.sliderAttr.itemWidth + this.options.navsSize.width).round(2);
                this.options.containerAttr.elementScrolled.styles.width = (this.options.sliderAttr.itemsVisible * this.options.sliderAttr.itemWidth).round(2);
                this.options.containerAttr.thumbsContainer.styles.width = (this.options.elemCount * this.options.sliderAttr.itemWidth + 10).round(2);
            }

            return this;
        },

        /**
         * Define the styles for special objects in percent
         */
        setPcentStyles: function () {
            var self = this;
            if (this.options.sliderAttr.slideVertical) {
                this.options.containerAttr.thumbsContainer.styles.height = (this.options.responsive.thumbsContainer.pcent.height).round(2) + '%';
                Object.each(this.options.childAttr, function (value, key) {
                    self.options.childAttr.height = (this.options.responsive.child.pcent.height).round(10) + '%';
                }.bind(self));
            } else {
                this.options.containerAttr.thumbsContainer.styles.width = (this.options.responsive.thumbsContainer.pcent.width).round(2) + '%';
                Object.each(this.options.childAttr, function (value, key) {
                    self.options.childAttr.width = (this.options.responsive.child.pcent.width).round(10) + '%';
                }.bind(self));
            }
        },

        /**
         * Set all styles
         *
         * @returns {object}
         */
        setAllContainerStyles: function () {
            Object.each(this.options.containerAttr, function (e) {
                if ($(e.elem)) {
                    $(e.elem).setStyles(e.styles);
                    if ($(e.elem).get('style') === '') {
                        $(e.elem).removeAttribute('style');
                    }
                }
            });

            // Set styles to childs container
            $$(this.options.containerChildsId).setStyles(this.options.childAttr);

            return this;
        },

        /**
         * Set the given styles for the given element
         *
         * @param {string} container
         * @param {object} objStyles
         * @returns {object}
         */
        setContainerStyles: function (container, objStyles) {
            if ($(container) && !! Object.getLength(objStyles)) {
                Object.each(objStyles, function (value, key) {
                    $(container).setStyle(key, value);
                });
            }

            return this;
        },

        /**
         * Add on resize event
         */
        addResizeEvent: function () {
            window.addEvent('resize', function () {
                // Stop autoslide if enabled
                if (this.options.slider.options.autoSlide) {
                    this.options.slider.stopAutoSlide();
                }

                clearTimeout(this.options.resizeTimer);

                // Set timer function
                this.options.resizeTimer = (function () {
                    // Update slider element dimension
                    this.setItemDimension();
                    this.options.slider.elementWidth = this.options.sliderAttr.itemWidth;
                    this.options.slider.elementHeight = this.options.sliderAttr.itemHeight;

                    // Start autoslide if enabled
                    if (this.options.slider.options.autoSlide) {
                        this.options.slider.startAutoSlide();
                    }
                }.bind(this)).delay(50);
            }.bind(this));
        },

        /**
         * Rebuild framework slider
         */
        rebuildFramework: function () {
            // Stop autoslide if enabled
            if (this.options.slider.options.autoSlide) {
                this.options.slider.stopAutoSlide();
            }

            this.options.elemCount = $$(this.options.containerChildsId).length;
            //
            this.setItemDimension().setNavSize().setControlsClass();

            this.run();

            // Start autoslide if enabled
            if (this.options.slider.options.autoSlide) {
                this.options.slider.startAutoSlide();
            }
        }
    });

})(document.id);