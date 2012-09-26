/*
 * viewportResizer
 * https://github.com/KaptinLin/ViewportResizer
 *
 * Copyright (c) 2012 KaptinLin
 * Licensed under the GPL license.
 */

(function($) {

  // Collection method.
  $.fn.viewportResizer = function() {
    return this.each(function() {
      $(this).html('awesome');
    });
  };

  // Static method.
  $.viewportResizer = function() {
    return 'viewportResizer';
  };
}(jQuery));
