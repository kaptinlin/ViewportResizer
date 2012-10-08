/*! ViewportResizer - v0.1.0 - 2012-10-08
* https://github.com/KaptinLin/ViewportResizer
* Copyright (c) 2012 KaptinLin; Licensed GPL */

(function (window, document, $, undefined) {
  "use strict";

  // Constructor
  var self = $.ViewportResizer = function (options) {
    $.extend(self.settings, options);
    var switcher, iframe, uri, resizer;

    var scrollbarWidth = getScrollbarWidth();
    // Classes
    var switcherClass = self.settings.classNamePrefix + '-switcher',
        viewportClass = self.settings.classNamePrefix + '-viewport',
        widthAreaClass = self.settings.classNamePrefix + '-width-area',
        iframeClass = self.settings.classNamePrefix + '-iframe',
        widthResizerClass = self.settings.classNamePrefix + '-width-resizer',
        heightResizerClass = self.settings.classNamePrefix + '-height-resizer',
        overlayClass = self.settings.classNamePrefix + '-overlay';

    self.query = {};

    // Private Methods


    function init() {
      switcher.build();
      iframe.build();
      resizer.build();

      switcher.bind();
      resizer.bind();

      uri.init(self.settings.target);

    }

    function switchTo(size, push) {
      switcher.to(size);
      iframe.to(size);
      if (push !== false) {
        $.extend(self.query, {
          viewport: size
        });
        uri.pushState(self.query);
      }
    }

    // bind history event
    window.onpopstate = function (event) {
      if (event.state !== null) {
        if (event.state.viewport !== undefined) {
          switchTo(event.state.viewport, false);
        }
      }
    };

    function getSizeDimensions(size) {
      return {
        width: self.settings.sizes[size].width,
        height: self.settings.sizes[size].height
      };
    }

    // thank to http://chris-spittles.co.uk/?p=531


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

    uri = {
      init: function (target) {
        $.extend(self.query, uri.getQuery());

        if (self.query.viewport !== undefined) {
          if (self.settings.sizes[self.query.viewport] !== undefined) {
            switchTo(self.query.viewport, false);
          }
        }

        if (self.query.target !== undefined) {
          iframe.load(self.query.target);
        } else if (target !== undefined) {
          iframe.load(target);
        }
      },
      pushState: function (query) {
        if (window.history && window.history.pushState && window.history.replaceState) {
          var query_array = [];
          $.each(query, function (k, v) {
            query_array.push(k + "=" + v);
          });
          var query_string = '?' + query_array.join('&');
          window.history.pushState(query, "", query_string);
        }
      },
      getQuery: function (url) {
        if (url === undefined) {
          url = window.location.href;
        }
        var query = {};
        var query_string = url.replace(/#[^\s]+/, '').split('?')[1];
        if (query_string !== undefined) {
          query_string = query_string.split('&');

          $.each(query_string, function (i, arg_string) {
            var argument = arg_string.split('=');
            query[argument[0]] = argument[1];
          });
        }
        return query;
      }
    };

    switcher = {
      build: function () {
        self.$switcher = $('<ul/>').addClass(switcherClass);
        var sizeMarkup = [];
        $.each(self.settings.sizes, function (slug, size) {
          sizeMarkup += "<li data-size='" + slug + "' class='" + switcherClass + '-' + slug + "'><a href='#'>" + size.description + "</a></li>";
        });
        self.$switcher.append(sizeMarkup).appendTo(self.settings.container.switcher);

        self.$sizes = self.$switcher.find('li');
      },
      to: function (size) {
        self.$sizes.filter('[data-current="true"]').attr('data-current', null);
        self.$sizes.filter('[data-size="' + size + '"]').attr('data-current', 'true');
      },
      bind: function () {
        self.$sizes.click(function () {
          switchTo($(this).data('size'));
        });
      }
    };

    iframe = {
      build: function () {
        self.$viewport = $('<div />').addClass(viewportClass).appendTo(self.settings.container.viewport);
        self.$widthArea = $('<div />').addClass(widthAreaClass).appendTo(self.$viewport);
        self.$iframe = $('<iframe />').addClass(iframeClass).appendTo(self.$widthArea);
      },
      load: function (src) {
        if (-1 === src.search(/http(s){0,1}:\/\//)) {
          src = 'http://' + src;
        }
        self.$iframe.attr('src', src);
      },
      to: function (size) {
        var dimensions = getSizeDimensions(size);
        var iframeWidth = dimensions.width + scrollbarWidth;

        self.$widthArea.css({
          width: iframeWidth
        });
        self.$iframe.css({
          height: dimensions.height
        });
        self.$heightResizer.css({
          top: dimensions.height
        });
      }
    };

    resizer = {
      build: function () {
        self.$widthResizer = $('<div />').addClass(widthResizerClass).prependTo(self.$widthArea);
        self.$overlay = $('<div />').addClass(overlayClass).prependTo(self.$widthArea);
        self.$heightResizer = $('<div />').addClass(heightResizerClass).appendTo(self.$viewport);
      },
      bind: function () {
        //width resizer
        self.$widthArea.drag("start", function (ev, dd) {
          self.$overlay.show();
          dd.width = this.clientWidth;
          self.$viewport.attr('data-onResizing', 'true');
        }).drag(function (ev, dd) {
          this.style.width = Math.max(self.settings.resize.minWidth, dd.width + dd.deltaX * 2) + 'px';
        }, {
          handle: '.' + widthResizerClass
        }).drag("dragend", function (ev, dd) {
          self.$overlay.hide();
          self.$viewport.attr('data-onResizing', null);
        });

        //height resizer
        self.$viewport.drag("start", function (ev, dd) {
          self.$overlay.show();
          dd.height = self.$iframe[0].clientHeight;
          self.$viewport.attr('data-onResizing', 'true');
        }).drag(function (ev, dd) {
          self.$iframe[0].style.height = Math.max(self.settings.resize.minHeight, dd.height + dd.deltaY) + 'px';
          self.$heightResizer[0].style.top = self.$iframe[0].style.height;
        }, {
          handle: '.' + heightResizerClass
        }).drag("dragend", function (ev, dd) {
          self.$overlay.hide();
          self.$viewport.attr('data-onResizing', null);
        });
      }
    };

    init();
  };

  // Default options for the plugin as a simple object
  self.settings = {
    classNamePrefix: 'resizer',
    container: {
      switcher: 'header',
      viewport: 'article'
    },
    sizes: {
      mobile: {
        width: 320,
        height: 480,
        description: 'Mobile'
      },
      tablet: {
        width: 460,
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
    resize: {
      minWidth: 240,
      minHeight: 320
    }
  };

  self.addSize = function (slug, options) {
    self.sizes.slug = options;
  };
}(window, document, jQuery));