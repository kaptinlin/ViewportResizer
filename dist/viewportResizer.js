/*! ViewportResizer - v0.1.0 - 2012-09-27
* https://github.com/KaptinLin/ViewportResizer
* Copyright (c) 2012 KaptinLin; Licensed GPL */

(function (window, document, $, undefined) {
  // Optional, but considered best practice by some
  "use strict";

  var namespace = 'plugin';

  // Constructor
  var Plugin = $.Plugin = function (element, options) {
    //private variables
    var privateVariable; // private member only available within the constructor fn
    //protected variables
    this.protectedVariable = ''; // protected menber can access within the object instance fn
    // Attach element to the 'this' keyword
    this.element = element;
    this.$element = $(element);

    // Merge the options given by the user with the defaults
    this.options = $.extend({}, Plugin.defaults, options);

    //private methods

    function privateMethod() {}

    //protected methods
    this.protectedMethod = function () {};

    // Initialization code to get the ball rolling
    this.init();
  };

  // Default options for the plugin as a simple object
  Plugin.defaults = {
    property: 'value',
    anotherProperty: 10
  };

  // A 'static method', it's just like a normal function
  // it has no relation with any 'Plugin' object instance
  Plugin.staticMethod = function () {

  };

  // This is a public function that users can call
  // Prototype methods are shared across all elements
  Plugin.prototype.publicMethod = function () {
    // the 'this' keyword refers to the object instance
    // you can access only 'protected' and 'public' members
    this.protectedVariable = ''; // example for accessing Protected Variable
    this.protectedMethod(); // also you can accessing protected mehtod here
  };

  // Plugin initializer - prepare your plugin
  Plugin.prototype.init = function () {

  };

  // Global Mehtod that can accessing anywhere in the plugin

  function globalMehtod() {

  }

  // Custom selector.
  $.expr[':'].plugin = function (elem) {
    return elem.textContent.indexOf('plugin') >= 0;
  };

  // Collection method.
  $.fn.Plugin = function (options) {
    return this.each(function () {
      if (!$.data(this, namespace)) {
        $.data(this, namespace, new Plugin(this, options));
      }
    });
  };
}(jQuery));