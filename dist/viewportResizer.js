/*! ViewportResizer - v0.3.0 - 2013-10-28
* https://github.com/KaptinLin/ViewportResizer
* Copyright (c) 2013 amazingSurge; Licensed GPL */
(function(window, document, $, undefined) {
    "use strict";

    function isNumber(num) {
        return (typeof num === 'string' || typeof num === 'number') && !isNaN(num - 0) && num !== '';
    }

    function isEmpty(map) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    function divideByTwo(num) {
        if (isNumber(num)) {
            return num / 2;
        }
        if (typeof num === 'string' && num.charAt(num.length - 1) === '%') {
            return num.substr(0, num.length - 1) / 2 + '%';
        }
    }

    function isPercent(num) {
        if (typeof num === 'string' && num.charAt(num.length - 1) === '%') {
            return true;
        }
        return false;
    }

    /**
     * thank to http://chris-spittles.co.uk/?p=531
     */

    function getScrollbarWidth() {
        var $inner = jQuery('<div style="width: 100%; height:200px;">test</div>'),
            $outer = jQuery('<div style="width:200px; height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
            inner = $inner[0],
            outer = $outer[0];

        jQuery('body').append(outer);
        var width1 = inner.offsetWidth;
        $outer.css('overflow', 'scroll');
        var width2 = outer.clientWidth;
        $outer.remove();

        return (width1 - width2);
    }

    // Constructor
    var self = $.ViewportResizer = function(options) {
        $.extend(true, self.settings, options);
        var switcher, iframe, history, resizable, axis, info, inputer;

        var scrollbarWidth = getScrollbarWidth();

        // Classes
        var switcherClass = self.settings.namespace + '-switcher',
            viewportClass = self.settings.namespace + '-viewport',
            iframeClass = self.settings.namespace + '-iframe',
            resizableClass = self.settings.namespace + '-resizable',
            axisClass = self.settings.namespace + '-axis',
            infoClass = self.settings.namespace + '-info',
            inputerClass = self.settings.namespace + '-inputer';

        /* Private Methods */

        function init() {
            self.current = {};
            self.initialization = {};

            self.$viewport = $('<div />').addClass(viewportClass).appendTo(self.settings.container.viewport);

            self.$viewport.on('change', function(e, data) {
                if (typeof data === "undefined") {
                    return;
                }
                if (typeof data.viewport !== "undefined") {
                    self.current.viewport = data.viewport;

                    if (data.viewport !== 'optional') {
                        data.dimensions = getViewportDimensions(data.viewport);
                    }
                    self.current.width = data.dimensions.width;
                    self.current.height = data.dimensions.height;
                }
                if (typeof data.target !== "undefined") {
                    self.current.target = data.target;
                }

                self.$viewport.trigger('resize', {
                    width: self.current.width,
                    height: self.current.height
                });
            });

            self.$viewport.on('init', function(e, data) {
                if (typeof data === "undefined") {
                    return;
                }
                if (typeof data.viewport !== "undefined") {
                    self.initialization.viewport = data.viewport;
                }
                if (typeof data.target !== "undefined") {
                    self.initialization.target = data.target;
                }
                if (!isEmpty(data.dimensions)) {
                    self.initialization.dimensions = data.dimensions;
                }
            });

            self.$viewport.trigger('init', {
                target: self.settings.target,
                viewport: self.settings.viewport,
                dimensions: self.settings.dimensions
            });

            if (self.settings.components.inputer) {
                inputer.init();
            }
            if (self.settings.components.switcher) {
                switcher.init();
            }
            if (self.settings.components.iframe) {
                iframe.init();
            }
            if (self.settings.components.resizable) {
                resizable.init();
            }
            if (self.settings.components.axis) {
                axis.init();
            }
            if (self.settings.components.info) {
                info.init();
            }
            if (self.settings.components.history) {
                history.init();
            }

            if (!isEmpty(self.initialization)) {
                self.$viewport.trigger('change', self.initialization);
            }
        }

        function getViewportDimensions(viewport) {
            if (viewport === 'auto') {
                return {
                    width: '100%',
                    height: '100%'
                };
            }
            return {
                width: self.settings.viewports[viewport].width,
                height: self.settings.viewports[viewport].height
            };
        }

        history = {
            query: {},
            init: function() {
                $.extend(history.query, history.getQuery());

                self.$viewport.on('init', function(e, data) {
                    if (typeof data === "undefined") {
                        return;
                    }
                    var dimensions = {};
                    if (typeof data.width !== "undefined") {
                        dimensions.width = parseInt(data.width, 10);
                    }
                    if (typeof data.height !== "undefined") {
                        dimensions.height = parseInt(data.height, 10);
                    }

                    self.initialization.dimensions = dimensions;
                });

                if (!isEmpty(history.query)) {
                    self.$viewport.trigger('init', history.query);
                }

                window.onpopstate = function(event) {
                    window.onpopstateing = true;
                    var _data = {};
                    if (event.state !== null) {
                        if (typeof event.state.viewport !== "undefined") {
                            _data.viewport = event.state.viewport;

                            if (_data.viewport === 'optional') {
                                _data.dimensions = {
                                    width: event.state.width ? parseInt(event.state.width, 10) : self.settings.min.width,
                                    height: event.state.height ? parseInt(event.state.height, 10) : self.settings.min.height
                                };
                            }
                        }

                        if (typeof event.state.target !== "undefined") {
                            _data.target = event.state.target;
                        }

                        self.$viewport.trigger('change', _data);
                    }
                    window.onpopstateing = false;
                    event.preventDefault();
                };

                self.$viewport.on('change', function(e, data) {
                    if (typeof data === "undefined") {
                        return;
                    }
                    var _query = {};
                    if (typeof data.viewport !== "undefined") {
                        _query.viewport = data.viewport;
                        if (data.viewport === 'optional' && data.dimensions !== 'undefined') {
                            _query.width = data.dimensions.width;
                            _query.height = data.dimensions.height;
                        } else if (history.query.viewport !== data.viewport) {
                            _query.width = null;
                            _query.height = null;
                        }
                    }
                    if (typeof data.target !== "undefined") {
                        _query.target = data.target;
                    } else {
                        _query.target = self.current.target;
                    }
                    history.setQuery(_query);
                });
            },
            pushState: function(query) {
                if (window.onpopstateing === true) {
                    return;
                }
                if (window.history && window.history.pushState && window.history.replaceState) {
                    var query_array = [];
                    $.each(query, function(k, v) {
                        if (v != null) {
                            query_array.push(k + "=" + v);
                        }
                    });
                    var query_string = '?' + query_array.join('&');
                    window.history.pushState(query, "", query_string);
                }
            },
            getQuery: function() {
                var url = window.location.href;

                var query = {};
                var query_string = url.replace(/#[^\s]+/, '').split('?')[1];
                if (typeof query_string !== "undefined") {
                    query_string = query_string.split('&');

                    $.each(query_string, function(i, arg_string) {
                        var argument = arg_string.split('=');
                        query[argument[0]] = argument[1];
                    });
                }
                return query;
            },
            setQuery: function(query) {
                query = $.extend(history.query, query);
                history.pushState(query);
            }
        };

        inputer = {
            init: function() {
                inputer.build();
                inputer.bind();
            },
            build: function() {
                self.$inputer = $('<div/>').addClass(inputerClass);
                inputer.input = $('<input type="text"/>').addClass(inputerClass + '-input').val(self.settings.inputerPlaceholder).appendTo(self.$inputer);
                inputer.enter = $('<span/>').addClass(inputerClass + '-enter').appendTo(self.$inputer);

                self.$inputer.appendTo(self.settings.container.inputer);
            },
            bind: function() {
                inputer.input.on('focus', function() {
                    if (this.value === self.settings.inputerPlaceholder) {
                        this.value = '';
                    }
                }).on('blur', function() {
                    if (this.value === '') {
                        this.value = self.settings.inputerPlaceholder;
                    }
                });

                inputer.input.on('change', function() {
                    inputer.go(this.value);
                });
                inputer.input.autoGrowInput({
                    comfortZone: 15,
                    maxWidth: 2000
                });

                self.$viewport.on('change', function(e, data) {
                    if (typeof data === "undefined") {
                        return;
                    }
                    if (typeof data.target !== "undefined") {
                        inputer.set(data.target);
                    }
                });
            },
            set: function(target) {
                inputer.input.val(target);
                // inputer.input.trigger('update');
            },
            go: function(target) {
                self.$viewport.trigger('change', {
                    target: target
                });
            }
        };

        switcher = {
            init: function() {
                switcher.build();
                switcher.bind();

                if (self.settings.viewports['optional'] !== false) {
                    switcher.optional.init();
                }
            },
            build: function() {
                self.$switcher = $('<ul/>').addClass(switcherClass);
                var sizeMarkup = [];
                $.each(self.settings.viewports, function(slug, viewport) {
                    if (viewport) {
                        sizeMarkup += "<li data-viewport='" + slug + "' class='" + switcherClass + '-' + slug + "'><a href='#'>" + viewport.description + "</a></li>";
                    }
                });

                self.$switcher.append(sizeMarkup).appendTo(self.settings.container.switcher);
            },
            to: function(viewport, dimensions) {
                self.$switcher.children('[data-current="true"]').attr('data-current', null);
                self.$switcher.children('[data-viewport="' + viewport + '"]').attr('data-current', 'true');
            },
            bind: function() {
                self.$switcher.delegate('a', 'click', function(e) {
                    var viewport = $(this).parent().data('viewport');
                    if (viewport === 'optional') {

                    } else {
                        self.$viewport.trigger('change', {
                            viewport: viewport
                        });
                    }

                    e.preventDefault();
                });

                self.$viewport.on('change', function(e, data) {
                    if (typeof data === "undefined") {
                        return;
                    }
                    if (typeof data.viewport !== "undefined") {
                        if (data.viewport === 'optional' && typeof data.dimensions !== 'undefined') {
                            switcher.to('optional', data.dimensions);
                            switcher.optional.activeMatch(data.dimensions);
                        } else {
                            switcher.to(data.viewport);
                        }
                    }
                });
            }
        };

        switcher.optional = {
            init: function() {
                switcher.optional.build();
                switcher.optional.bind();
            },
            build: function() {
                switcher.$optional = self.$switcher.children('[data-viewport="optional"]');

                switcher.optional.$container = $('<div/>').addClass(switcherClass + '-optional-container');
                switcher.optional.$custom = $("<div class='" + switcherClass + "-optional-add'>" + "<div><label for='optional_width'>Width:</label><input type='number' id='optional_width' min='" + self.settings.min.width + "' value='' /></div>" + "<div><label for='optional_height'>Height:</label><input type='number' id='optional_height' min='" + self.settings.min.height + "' value='' /></div>" + "<div><button id='optional_add'>Add</button>" + "</div>").appendTo(switcher.optional.$container);

                switcher.optional.$width = switcher.optional.$custom.find('#optional_width');
                switcher.optional.$height = switcher.optional.$custom.find('#optional_height');
                switcher.optional.$add = switcher.optional.$custom.find('#optional_add');

                switcher.optional.$saved = $('<ul/>').appendTo(switcher.optional.$container);

                switcher.optional.$container.appendTo(switcher.$optional);
            },
            activeMatch: function(dimensions, callback) {
                var match = false;
                $(switcher.optional.$saved).children().each(function() {
                    if (parseInt($(this).data('width'), 10) === dimensions.width && parseInt($(this).data('height'), 10) === dimensions.height) {
                        $(this).attr('data-current', 'true');
                        $(this).siblings('[data-current="true"]').attr('data-current', null);
                        match = true;
                    }
                });
                return match;
            },
            addToSaved: function(dimensions) {
                if (isNumber(dimensions.width) && isNumber(dimensions.height) && switcher.optional.activeMatch(dimensions) === false) {
                    $("<li><div><span>Width: </span><span>" + dimensions.width + "</span></div><div><span>Height: </span><span>" + dimensions.height + "</span></div><div><button>Delete</button></div></li>").data('width', dimensions.width).data('height', dimensions.height).appendTo(switcher.optional.$saved).trigger('click');
                }
            },
            active: function(element) {
                $(element).attr('data-current', 'true');
                $(element).siblings('[data-current="true"]').attr('data-current', null);

                self.$viewport.trigger('change', {
                    viewport: 'optional',
                    dimensions: {
                        width: parseInt($(element).data('width'), 10),
                        height: parseInt($(element).data('height'), 10)
                    }
                });
            },
            deactive: function() {
                switcher.optional.$saved.find('[data-current="true"]').attr('data-current', null);
            },
            bind: function() {
                switcher.$optional.hover(function(e) {
                    switcher.$optional.attr('data-show', 'true');
                    if (isNumber(self.current.width)) {
                        switcher.optional.$width.val(self.current.width);
                    }
                    if (isNumber(self.current.height)) {
                        switcher.optional.$height.val(self.current.height);
                    }
                }, function(e) {
                    switcher.$optional.attr('data-show', 'false');
                });

                switcher.optional.$width.on('change', function() {
                    if (isNumber(this.value)) {
                        if (this.value < self.settings.min.width) {
                            this.value = self.settings.min.width;
                        }
                        self.$viewport.trigger('resize', {
                            width: this.value
                        });
                    }
                });
                switcher.optional.$height.on('change', function() {
                    if (isNumber(this.value)) {
                        if (this.value < self.settings.min.height) {
                            this.value = self.settings.min.height;
                        }

                        self.$viewport.trigger('resize', {
                            height: this.value
                        });
                    }
                });
                switcher.optional.$add.on('click', function() {
                    switcher.optional.addToSaved({
                        width: switcher.optional.$width.val(),
                        height: switcher.optional.$height.val()
                    });
                });
                switcher.optional.$saved.delegate('button', 'click', function(e) {
                    $(this).closest('li').remove();
                });
                switcher.optional.$saved.delegate('li', 'click', function(e) {
                    if (!$(e.target).is('button')) {
                        switcher.optional.active(this);
                    }
                });

                self.$viewport.on('change', function(e, data) {
                    if (typeof data === "undefined") {
                        return;
                    }
                    if (typeof data.viewport !== "undefined") {
                        if (data.viewport !== 'optional') {
                            switcher.optional.deactive();
                        }
                    }
                });
            }
        };

        iframe = {
            init: function() {
                iframe.build();
                iframe.bind();
            },
            build: function() {
                self.$iframe = $('<iframe frameborder="no"/>').addClass(iframeClass).appendTo(self.$viewport);
            },
            bind: function() {
                self.$viewport.delegate(self.$iframe, 'resize', function(e, dimensions) {
                    if (typeof dimensions === "undefined") {
                        return;
                    }
                    var style = {};
                    if (typeof dimensions.width !== "undefined") {
                        if (self.settings.scrollbarInWidth || !isNumber(dimensions.width)) {
                            style.width = dimensions.width;
                        } else {
                            style.width = dimensions.width + scrollbarWidth;
                        }

                        self.current.width = dimensions.width;
                    }
                    if (typeof dimensions.height !== "undefined") {
                        style.height = dimensions.height;
                        self.current.height = dimensions.height;
                    }
                    e.data.css(style);
                });

                self.$viewport.on('change', function(e, data) {
                    if (typeof data === "undefined") {
                        return;
                    }
                    if (typeof data.target !== "undefined") {
                        iframe.load(data.target);
                    }
                });
            },
            load: function(src) {
                if (-1 === src.search(/http(s){0,1}:\/\//)) {
                    src = 'http://' + src;
                }

                self.$iframe.attr('src', src);
            }
        };

        info = {
            init: function() {
                info.build();
                info.bind();
            },
            build: function() {
                self.$info = $('<div>' + '<div class="' + infoClass + '-width"><span class="' + infoClass + '-lable">Width: </span><span class="' + infoClass + '-value"></span></div>' + '<div class="' + infoClass + '-height"><span class="' + infoClass + '-lable">Height: </span><span class="' + infoClass + '-value"></span></div>' + '</div>').addClass(infoClass).appendTo(self.$viewport);
                self.$infoWidth = self.$info.find('.' + infoClass + '-width .' + infoClass + '-value');
                self.$infoHeight = self.$info.find('.' + infoClass + '-height .' + infoClass + '-value');
            },
            bind: function() {
                self.$viewport.delegate(self.$info, 'resize', function(e, dimensions) {
                    if (typeof dimensions === "undefined") {
                        return;
                    }
                    var style = {};
                    if (typeof dimensions.width !== "undefined") {
                        style.marginLeft = divideByTwo(dimensions.width);
                        self.$infoWidth.text(dimensions.width);
                    }
                    if (typeof dimensions.height !== "undefined") {
                        style.top = dimensions.height;
                        self.$infoHeight.text(dimensions.height);
                    }
                    e.data.css(style);

                });
            }
        };

        axis = {
            init: function() {
                axis.build();
                axis.bind();
            },
            build: function() {
                self.$axis = $('<div />').addClass(axisClass);
                self.$axisX = $('<div />').addClass(axisClass + '-x').prependTo(self.$axis);
                self.$axisY = $('<div />').addClass(axisClass + '-y').prependTo(self.$axis);
                self.$axis.prependTo(self.$viewport);
            },
            bind: function() {
                self.$viewport.delegate(self.$axisX, 'resize', function(e, dimensions) {
                    if (typeof dimensions === "undefined") {
                        return;
                    }
                    if (typeof dimensions.width !== "undefined") {
                        var width = dimensions.width;
                        if (!self.settings.scrollbarInWidth || !isNumber(dimensions.width)) {
                            width = dimensions.width + scrollbarWidth;
                        }
                        e.data.css({
                            marginLeft: divideByTwo(width)
                        });
                    }
                });
                self.$viewport.delegate(self.$axisY, 'resize', function(e, dimensions) {
                    if (typeof dimensions === "undefined") {
                        return;
                    }
                    if (typeof dimensions.height !== "undefined") {
                        e.data.css({
                            top: dimensions.height
                        });
                    }
                });
            }
        };

        resizable = {
            init: function() {
                resizable.build();
                resizable.bind();
            },
            build: function() {
                self.$resizable = $('<div />').addClass(resizableClass);
                self.$resizableX = $('<div />').addClass(resizableClass + '-x').prependTo(self.$resizable);
                self.$resizableY = $('<div />').addClass(resizableClass + '-y').prependTo(self.$resizable);
                self.$resizableXY = $('<div />').addClass(resizableClass + '-xy').prependTo(self.$resizable);
                self.$resizable.appendTo(self.$viewport);
            },
            bind: function() {
                self.$viewport.delegate(self.$resizable, 'resize', function(e, dimensions) {
                    if (typeof dimensions === "undefined") {
                        return;
                    }
                    var style = {};
                    if (typeof dimensions.width !== "undefined") {
                        var width = dimensions.width;
                        if (isPercent(width)) {

                        } else if (!self.settings.scrollbarInWidth || !isNumber(dimensions.width)) {
                            width = dimensions.width + scrollbarWidth;
                        }
                        style.width = width;
                        style.marginLeft = divideByTwo('-' + width);
                    }
                    if (typeof dimensions.height !== "undefined") {
                        style.height = dimensions.height;
                    }
                    e.data.css(style);
                });

                // handle x
                self.$resizableX.drag("start", function(e, dd) {
                    dd.width = self.current.width;
                    self.$viewport.attr('data-resizing', 'onx');
                }).drag(function(e, dd) {
                    self.$viewport.trigger('resize', {
                        width: Math.max(self.settings.min.width, dd.width + parseInt(dd.deltaX, 10) * 2)
                    });
                }).drag("dragend", function(e, dd) {

                    self.$viewport.attr('data-resizing', null);
                });

                // handle y
                self.$resizableY.drag("start", function(e, dd) {
                    dd.height = self.current.height;
                    self.$viewport.attr('data-resizing', 'ony');
                }).drag(function(e, dd) {
                    self.$viewport.trigger('resize', {
                        height: Math.max(self.settings.min.height, dd.height + parseInt(dd.deltaY, 10))
                    });
                }).drag("dragend", function(e, dd) {
                    self.$viewport.attr('data-resizing', null);
                });

                // handle xy
                self.$resizableXY.drag("start", function(e, dd) {
                    dd.width = self.current.width;
                    dd.height = self.current.height;
                    self.$viewport.attr('data-resizing', 'onxy');
                }).drag(function(e, dd) {
                    self.$viewport.trigger('resize', {
                        width: Math.max(self.settings.min.width, dd.width + parseInt(dd.deltaX, 10) * 2),
                        height: Math.max(self.settings.min.height, dd.height + parseInt(dd.deltaY, 10))
                    });
                }).drag("dragend", function(e, dd) {
                    self.$viewport.attr('data-resizing', null);
                });
            }
        };

        init();
    };

    // Default options for the plugin as a simple object
    self.settings = {
        viewport: 'auto',
        target: undefined,
        dimensions: {},
        components: {
            history: true,
            inputer: true,
            switcher: true,
            iframe: true,
            resizable: true,
            axis: true,
            info: true
        },
        namespace: 'resizer',
        container: {
            switcher: 'header',
            inputer: 'header',
            viewport: 'article'
        },
        viewports: {
            auto: {
                width: '100%',
                height: '100%',
                description: 'Auto'
            },
            optional: {
                description: 'Optional'
            },
            mobile: {
                width: 320,
                height: 480,
                description: 'Mobile'
            },
            tablet: {
                width: 480,
                height: 640,
                description: 'Tablet'
            },
            notebook: {
                width: 768,
                height: 1024,
                description: 'Notebook'
            },
            desktop: {
                width: 1200,
                height: 800,
                description: 'Desktop'
            }
        },
        min: {
            width: 240,
            height: 320
        },
        step: 5,
        inputerPlaceholder: 'Type your url here',
        scrollbarInWidth: true
    };

    self.addViewport = function(slug, options) {
        self.viewports.slug = options;
    };
    self.go = function(target) {
        self.$viewport.trigger('change', {
            target: target
        });
    };
    self.use = function(viewport) {
        self.$viewport.trigger('change', {
            viewport: viewport
        });
    };
    self.change = function(data) {
        self.$viewport.trigger('change', data);
    };
    self.resize = function(dimensions) {
        self.$viewport.trigger('resize', dimensions);
    };
    self.resizeWidth = function(val) {
        self.$viewport.trigger('resize', {
            width: val
        });
    };
    self.resizeHeight = function(val) {
        self.$viewport.trigger('resize', {
            height: val
        });
    };
}(window, document, jQuery));


/*
 * http://stackoverflow.com/questions/931207/is-there-a-jquery-autogrow-plugin-for-text-fields
 */
(function(document, $, undefined) {

    $.fn.autoGrowInput = function(o) {

        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 70
        }, o);

        this.filter('input:text').each(function() {

            var minWidth = o.minWidth || $(this).width(),
                val = '',
                input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                    fontSize: input.css('fontSize'),
                    fontFamily: input.css('fontFamily'),
                    fontWeight: input.css('fontWeight'),
                    letterSpacing: input.css('letterSpacing'),
                    whiteSpace: 'nowrap'
                }),
                check = function() {

                    if (val === (val = input.val())) {
                        return;
                    }

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                        currentWidth = input.width(),
                        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth) || (newWidth > minWidth && newWidth < o.maxWidth);

                    // Animate width
                    if (isValidWidthChange) {
                        input.width(newWidth);
                    }

                };

            testSubject.insertAfter(input);

            $(this).bind('keyup keydown blur update', check);

        });

        return this;

    };

}(document, jQuery));
