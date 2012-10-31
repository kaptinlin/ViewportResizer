# ViewportResizer

ViewportResizer is jQuery plugin used to quickly change the dimensions of a webpage to test responsive design.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/KaptinLin/viewportResizer/master/dist/viewportResizer.min.js
[max]: https://raw.github.com/KaptinLin/viewportResizer/master/dist/viewportResizer.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/viewportResizer.min.js"></script>
<script>
jQuery(function($) {
  $.viewportResizer();
});
</script>
```

## Documentation
_(Coming soon)_

## Examples

```javascript
$.ViewportResizer({
    viewport: 'auto',
    target:'http://foundation.zurb.com',
    components:{
      inputer:true,
      switcher:true,
      iframe:true,
      resizable:true,
      axis:true,
      info:true,
      history:false
    }
});
$.ViewportResizer.go('http://baidu.com');
$.ViewportResizer.use('mobile');
$.ViewportResizer.change({
    target: 'http://baidu.com',
    viewport: 'mobile'
});
$.ViewportResizer.resize({width: 300, height: 400});
$.ViewportResizer.resizeWidth(300);
$.ViewportResizer.resizeHeight(400);
```

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 KaptinLin
Licensed under the CC BY-NC 3.0 license.