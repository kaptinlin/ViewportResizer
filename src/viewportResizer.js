(function (window, document, $, undefined) {
  "use strict";

  // Constructor
  var self = $.ViewportResizer = function (options) {
    $.extend(self.settings, options);
    var switcher, iframe, uri, resizable, axis, info;

    var scrollbarWidth = getScrollbarWidth();
    // Classes
    var switcherClass = self.settings.classNamePrefix + '-switcher',
        viewportClass = self.settings.classNamePrefix + '-viewport',
        iframeClass = self.settings.classNamePrefix + '-iframe',
        resizableClass = self.settings.classNamePrefix + '-resizable',
        axisClass = self.settings.classNamePrefix + '-axis',
        infoClass = self.settings.classNamePrefix + '-info';

    self.query = {};

    // Private Methods


    function init() {
      self.$viewport = $('<div />').addClass(viewportClass).appendTo(self.settings.container.viewport);
      self.current = {};

      //build doms
      switcher.build();
      iframe.build();
      resizable.build();
      axis.build();
      info.build();

      //bind events
      switcher.bind();
      iframe.bind();
      resizable.bind();
      axis.bind();
      info.bind();

      uri.init(self.settings.target);
      self.$viewport.attr('data-current', 'auto');
    }

    // function switchTo(size, push) {
    //   switcher.to(size);
    //   iframe.to(size);
    //   self.$viewport.attr('data-current',size);
    //   if (push !== false) {
    //     $.extend(self.query, {
    //       viewport: size
    //     });
    //     uri.pushState(self.query);
    //   }
    // }
    // bind history event
    window.onpopstate = function (event) {
      if (event.state !== null) {
        if (event.state.viewport !== undefined) {
          switchTo(event.state.viewport, false);
        }
      }
    };

    function getViewportDimensions(viewport) {
      return {
        width: self.settings.viewports[viewport].width + scrollbarWidth,
        height: self.settings.viewports[viewport].height
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
          if (self.settings.viewports[self.query.viewport] !== undefined) {
            switcher.to(self.query.viewport);
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
        $.each(self.settings.viewports, function (slug, viewport) {
          if(slug == 'optional'){
            sizeMarkup += "<li data-viewport='" + slug + "' class='" + switcherClass + '-' + slug + "'>"+
                "<a href='#'>" + viewport.description + "</a>"+
                "<div class='"+switcherClass+"-optional-detail'><ul>"+
                  "<li><label for='optional_width'>Width:</label><input type='text' id='optional_width' value='' /></li>"+
                  "<li><label for='optional_height'>Height:</label><input type='text' id='optional_height' value='' /></li>"+
                "</ul></div>"+
              "</li>";
          }else{
            sizeMarkup += "<li data-viewport='" + slug + "' class='" + switcherClass + '-' + slug + "'><a href='#'>" + viewport.description + "</a></li>";
          }
        });
        self.$switcher.append(sizeMarkup).appendTo(self.settings.container.switcher);
        
      },
      to: function (viewport) {
        self.current.viewport = viewport;

        var dimensions = getViewportDimensions(self.current.viewport);
        self.current.width = dimensions.width;
        self.current.height = dimensions.height;

        self.$switcher.children('[data-current="true"]').attr('data-current', null);
        self.$switcher.children('[data-viewport="' + viewport + '"]').attr('data-current', 'true');
        self.$viewport.trigger('resize', self.current);
      },
      bind: function () {
        self.$switcher.delegate('a','click',function (e) {
          var viewport = $(this).parent().data('viewport');
          if(viewport === 'optional'){
            switcher.showOptional();
          }
          switcher.to(viewport);
          e.preventDefault();
        });
      },
      showOptional: function(){
        var $optional = self.$switcher.children('[data-viewport="optional"]');

        $optional.attr('data-show','true');
        $optional.find('#optional_width').val(self.current.width);
        $optional.find('#optional_height').val(self.current.height);
      }
    };

    iframe = {
      build: function () {
        self.$iframe = $('<iframe />').addClass(iframeClass).appendTo(self.$viewport);

      },
      bind: function () {
        self.$viewport.delegate(self.$iframe, 'resize', function (e, dimensions) {
          var style = {};
          if (undefined != dimensions.width) {
            style.width = dimensions.width;
            self.current.width = dimensions.width;
          }
          if (undefined != dimensions.height) {
            style.height = dimensions.height;
            self.current.height = dimensions.height;
          }
          e.data.css(style);
        });
      },
      load: function (src) {
        if (-1 === src.search(/http(s){0,1}:\/\//)) {
          src = 'http://' + src;
        }
        self.$iframe.attr('src', src);
      }
    };

    info = {
      build: function () {
        self.$info = $('<div>' + '<div class="' + infoClass + '-width"><span class="' + infoClass + '-lable">Width: </span><span class="' + infoClass + '-value"></span></div>' + '<div class="' + infoClass + '-height"><span class="' + infoClass + '-lable">Height: </span><span class="' + infoClass + '-value"></span></div>' + '</div>').addClass(infoClass).appendTo(self.$viewport);
        self.$infoWidth = self.$info.find('.' + infoClass + '-width .' + infoClass + '-value');
        self.$infoHeight = self.$info.find('.' + infoClass + '-height .' + infoClass + '-value');
      },
      bind: function () {
        self.$viewport.delegate(self.$info, 'resize', function (e, dimensions) {
          var style = {};
          if (undefined != dimensions.width) {
            //style.width = dimensions.width;
            style.marginLeft = dimensions.width / 2;
            self.$infoWidth.text(dimensions.width - scrollbarWidth);
          }
          if (undefined != dimensions.height) {
            style.top = dimensions.height;
            self.$infoHeight.text(dimensions.height);
          }
          e.data.css(style);

        });
      }
    };

    axis = {
      build: function () {
        self.$axis = $('<div />').addClass(axisClass);
        self.$axisX = $('<div />').addClass(axisClass + '-x').prependTo(self.$axis);
        self.$axisY = $('<div />').addClass(axisClass + '-y').prependTo(self.$axis);
        self.$axis.prependTo(self.$viewport);
      },
      bind: function () {
        self.$viewport.delegate(self.$axisX, 'resize', function (e, dimensions) {
          if (undefined != dimensions.width) {
            e.data.css({
              marginLeft: dimensions.width / 2
            });
          }
        });
        self.$viewport.delegate(self.$axisY, 'resize', function (e, dimensions) {
          if (undefined != dimensions.height) {
            e.data.css({
              top: dimensions.height
            });
          }
        });
      }
    };

    resizable = {
      build: function () {
        self.$resizable = $('<div />').addClass(resizableClass);
        self.$resizableX = $('<div />').addClass(resizableClass + '-x').prependTo(self.$resizable);
        self.$resizableY = $('<div />').addClass(resizableClass + '-y').prependTo(self.$resizable);
        self.$resizableXY = $('<div />').addClass(resizableClass + '-xy').prependTo(self.$resizable);
        self.$resizable.prependTo(self.$viewport);
      },
      bind: function () {
        self.$viewport.delegate(self.$resizable, 'resize', function (e, dimensions) {
          var style = {};
          if (undefined != dimensions.width) {
            style.width = dimensions.width;
            style.marginLeft = -dimensions.width / 2;
          }
          if (undefined != dimensions.height) {
            style.height = dimensions.height;
          }
          e.data.css(style);
        });

        // handle x
        self.$resizableX.drag("start", function (e, dd) {
          dd.width = self.current.width;
          self.$viewport.attr('data-resizing', 'onx');
        }).drag(function (e, dd) {
          self.$viewport.trigger('resize', {
            width: Math.max(self.settings.resize.minWidth, dd.width + dd.deltaX * 2)
          });
        }).drag("dragend", function (e, dd) {
          self.$viewport.attr('data-resizing', null);
        });

        // handle y
        self.$resizableY.drag("start", function (e, dd) {
          dd.height = self.current.height;
          self.$viewport.attr('data-resizing', 'ony');
        }).drag(function (e, dd) {
          self.$viewport.trigger('resize', {
            height: Math.max(self.settings.resize.minHeight, dd.height + dd.deltaY)
          });
        }).drag("dragend", function (e, dd) {
          self.$viewport.attr('data-resizing', null);
        });

        // handle xy
        self.$resizableXY.drag("start", function (e, dd) {
          dd.width = self.current.width;
          dd.height = self.current.height;
          self.$viewport.attr('data-resizing', 'onxy');
        }).drag(function (e, dd) {
          self.$viewport.trigger('resize', {
            width: Math.max(self.settings.resize.minWidth, dd.width + dd.deltaX * 2),
            height: Math.max(self.settings.resize.minHeight, dd.height + dd.deltaY)
          });
        }).drag("dragend", function (e, dd) {
          self.$viewport.attr('data-resizing', null);
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

  self.addViewport = function (slug, options) {
    self.viewports.slug = options;
  };
}(window, document, jQuery));