/**
 * Thumbs Plugin
 * @version 2.0.0
 * @author Abstractic
 * @credit https://github.com/gijsroge/OwlCarousel2-Thumbs
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
    'use strict';

    /**
     * Creates the thumbs plugin.
     * @class The thumbs Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Thumbs = function (carousel) {

        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this.owl = carousel;

        /**
         * All DOM elements for thumbnails
         * @protected
         * @type {Object}
         */
        this._thumbcontent = [];

        /**
         * Instance identiefiers
         * @private
         * @type {String}
         */
        this._gallery = '';
        this._thumbnails = '';

        /**
         * Return current item regardless of clones
         * @protected
         * @type {Object}
         */
        this.owl_currentitem = this.owl.options.startPosition;


        /**
         * The carousel element.
         * @type {jQuery}
         */
        this.$element = this.owl.$element;

        /**
         * Instance identiefier
         * @type {number}
         */
        this._active = 0;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {

            'prepared.owl.carousel': $.proxy(function (e) {
                if (e.namespace && this.owl.options.thumbs && !this.owl.options.thumbImage && !this.owl.options.thumbsPrerendered && !this.owl.options.thumbImage) {
                    if ($(e.content).find('[data-thumb]').attr('data-thumb') !== undefined) {
                        this._thumbcontent.push($(e.content).find('[data-thumb]').attr('data-thumb'));
                    }
                } else if (e.namespace && this.owl.options.thumbs && this.owl.options.thumbImage) {
                    var innerImage = $(e.content).find('img');
                    this._thumbcontent.push(innerImage);
                }
            }, this),

            'initialized.owl.carousel': $.proxy(function (e) {
                if (e.namespace && this.owl.options.thumbs) {
                    this.render();
                    this.listen();
                    this._thumbnails = this.owl.$element.attr('aria-owns');
                    this.setActive();
                    this.position();
                }
            }, this),

            'changed.owl.carousel': $.proxy(function (e) {
                if (e.namespace && e.property.name === 'position' && this.owl.options.thumbs) {
                    this._thumbnails = this.owl.$element.attr('aria-owns');
                    this.setActive();
                    this.position();
                }
            }, this)
        };

        // set default options
        this.owl.options = $.extend({}, Thumbs.Defaults, this.owl.options);

        // register the event handlers
        this.owl.$element.on(this._handlers);
    };


    /**
     * Default options.
     * @public
     */
    Thumbs.Defaults = {

        thumbs: true,
        thumbImage: true,
        thumbsPrerendered: true,
        thumbContainerClass: 'owl-thumbs',
        thumbWrapperClass: 'owl-thumbs-wrapper',
        thumbItemClass: 'owl-thumb-item',
        moveThumbsInside: false
    };


    /**
     * Listen for thumbnail click
     * @protected
     */
    Thumbs.prototype.listen = function () {

        // set default options

        var options = this.owl.options;

        if (options.thumbsPrerendered) {
            
            this._thumbcontent._thumbcontainer = $('.' + options.thumbContainerClass);
            this._thumbcontent._thumbwrapper = $('.' + options.thumbWrapperClass);
        }

        // check what thumbitem has been clicked and move slider to that item

        $(this._thumbcontent._thumbwrapper).on('click', this._thumbcontent._thumbwrapper.children(), $.proxy(function (e) {

            // find relative slider

            this._gallery = $(e.target).closest('.' + options.thumbContainerClass).attr('aria-controls');

            // get index of clicked thumbnail

            var index = $(e.target).parent().is(this._thumbcontent._thumbwrapper) ? $(e.target).index() : $(e.target).closest('.'+options.thumbItemClass).index();

            if (options.thumbsPrerendered) {

                $('#' + this._gallery).trigger('to.owl.carousel', [index, options.dotsSpeed, true]);
            } 
            else {

                this.owl.to(index, options.dotsSpeed);
            }

            e.preventDefault();

        }, this));
    };


    /**
     * Builds thumbnails
     * @protected
     */
    Thumbs.prototype.render = function () {

        // set default options

        var options = this.owl.options;

        // create thumbcontainer

        if (!options.thumbsPrerendered) {
            
            this._thumbcontent._thumbcontainer = $('<div>').addClass(options.thumbContainerClass).appendTo(this.$element);
            this._thumbcontent._thumbwrapper = $('<div>').addClass(options.thumbWrapperClass).appendTo(this._thumbcontent._thumbcontainer);
        }
        else {
            
            this._thumbcontent._thumbcontainer = $('.' + options.thumbContainerClass + '');
            this._thumbcontent._thumbwrapper = $('.' + options.thumbWrapperClass + '');
            
            if (options.moveThumbsInside) {
                
                this._thumbcontent._thumbcontainer.appendTo(this.$element);
            }
        }

        // create thumb items

        var i;

        if (!options.thumbsPrerendered) {

            if (!options.thumbImage) {

                for (i = 0; i < this._thumbcontent.length; ++i) {
                    this._thumbcontent._thumbwrapper.append('<button class=' + options.thumbItemClass + '>' + this._thumbcontent[i] + '</button>');
                }
            } 
            else {
                
                for (i = 0; i < this._thumbcontent.length; ++i) {
                    this._thumbcontent._thumbwrapper.append('<button class=' + options.thumbItemClass + '><img src="' + this._thumbcontent[i].attr('src') + '" alt="' + this._thumbcontent[i].attr('alt') + '" /></button>');
                }
            }
        }
    };


    /**
     * Updates active class on thumbnails
     * @protected
     */
    Thumbs.prototype.setActive = function () {

        // get startslide

        this.owl_currentitem = this.owl._current - (this.owl._clones.length / 2);

        if (this.owl_currentitem === this.owl._items.length) {
            
            this.owl_currentitem = 0;
        }

        //set default options
        
        var options = this.owl.options;

        // set relative thumbnail container

        var thumbContainer = options.thumbsPrerendered ? $('#' + this._thumbnails).find('.' + options.thumbWrapperClass) : this._thumbcontent._thumbwrapper;

        thumbContainer.children().filter('.active').removeClass('active');
        thumbContainer.children().eq(this.owl_currentitem).addClass('active');
    };


    /**
     * Updates position on thumbnails wrapper
     * @protected
     */
    Thumbs.prototype.position = function () {

        // set default options

        var options = this.owl.options;

        this._thumbcontent._thumbcontainer = $('.' + options.thumbContainerClass);
        this._thumbcontent._thumbwrapper = $('.' + options.thumbWrapperClass);
        this._thumbcontent._thumb = $('.' + options.thumbItemClass);

        var container = this._thumbcontent._thumbcontainer.outerWidth();
        var wrapper = this._thumbcontent._thumbwrapper.outerWidth();
        var item = this._thumbcontent._thumb.eq(0).outerWidth(true);
        var margin = this._thumbcontent._thumb.eq(0).outerWidth(true) - this._thumbcontent._thumb.eq(0).outerWidth();
        var total = this._thumbcontent._thumbwrapper.children().length;
        var index = this._thumbcontent._thumbwrapper.find('.active').index() + 1;
        var moving = this._active > index ? 'right' : 'left';
        var visible = Math.round(container / item);
        var half = visible / 2;
        var hidden = Math.round(total - visible);
        var overflow = (container - (visible * item)) + margin;
        var position = 0;
        
        if (index > half) {

            if (index - half <= hidden) {

                if (moving === 'left') {

                    position = (index - half == hidden) ? ((index - half) * item) - overflow : (index - half) * item;
                }
                else {

                    position = ((index - half) * item) - overflow;
                }
            }
            else {

                position = (hidden * item) - overflow;
            }
        }

        this._active = index;
        this._thumbcontent._thumbwrapper.css({ 'left' : - position + 'px' });
    };


    /**
     * Destroys the plugin.
     * @public
     */
    Thumbs.prototype.destroy = function () {

        var handler, property;

        for (handler in this._handlers) {
            this.owl.$element.off(handler, this._handlers[handler]);
        }

        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] !== 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Thumbs = Thumbs;

})(window.Zepto || window.jQuery, window, document);