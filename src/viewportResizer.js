(function (window, document, $, undefined) {
  "use strict";

  function UriParser(uri) {
    if (uri === undefined) {
      uri = window.location.href;
    }

    function get_hash() {
      var hash = uri.match(/#([^\s]+)/);

      if (hash !== null) {
        return hash.pop();
      } else {
        return null;
      }
    }

    function get_query() {
      var _uri = uri.replace(/#[^\s]+/, '');
      var query = {};
      var query_string = _uri.split('?')[1];
      if (query_string !== undefined) {
        query_string = query_string.split('&');

        $.each(query_string, function (i, arg_string) {
          var argument = arg_string.split('=');
          query[argument[0]] = argument[1];
        });
      }
      return query;
    }

    function set_query(value) {

    }

    function set_hash(value) {

    }

    return {
      get: function (type) {
        switch (type) {
        case 'query':
          return get_query();
        case 'hash':
          return get_hash();
        default:
          return uri;
        }
      },
      set: function (type, value) {
        switch (type) {
        case 'query':
          return set_query(value);
        case 'hash':
          return set_hash(value);
        }
      }
    };
  }

  // Constructor
  var self = $.ViewportResizer = function (options) {

    // if (typeof options === 'string') {
    //   options = {
    //     target: options
    //   };
    // }
    $.extend(self.settings, options);
    var swithcer, iframe, uri;

    var scrollbarWidth = getScrollbarWidth();
    // Classes
    var switcherClass = self.settings.classNamePrefix + '-switcher',
        iframeClass = self.settings.classNamePrefix + '-iframe';

    self.query = {};

    // Private Methods

    function init() {
      swithcer.build();
      iframe.build();

      self.$sizes.click(function () {
        switchTo($(this).data('size'));
      });


      if (typeof self.settings.target !== 'undefined') {
        uri.init(self.settings.target);
      } else {
        uri.init();
      }
    }

    function switchTo(size, push) {
      swithcer.to(size);
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
        if (typeof event.state.viewport !== 'undefined') {
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
        var $uriParser = UriParser();

        $.extend(self.query, $uriParser.get('query'));

        if (typeof self.query.viewport !== 'undefined') {
          if (typeof self.settings.sizes[self.query.viewport] !== 'undefined') {
            switchTo(self.query.viewport, false);
          }
        }

        if (typeof self.query.target !== 'undefined') {
          iframe.load(self.query.target);
        } else if (typeof target !== 'undefined') {
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
      }
    };

    swithcer = {
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
      }
    };

    iframe = {
      build: function () {
        self.$iframe = $('<iframe />').addClass(iframeClass).appendTo(self.settings.container.iframe);
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

        self.$iframe.attr('width', iframeWidth).css({
          width: iframeWidth
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
      iframe: 'article'
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
    }
  };

  self.addSize = function (slug, options) {
    self.sizes.slug = options;
  };
}(window, document, jQuery));