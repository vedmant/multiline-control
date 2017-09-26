# Multiline control

Form control that allows to edit multiple lines, change order, remove lines.

Turn your textarea to multiline control.

[Here's a demo!](https://vedmant.github.io/multiline-control/)

### Features

- Bootstrap forms layout
- Sort order
- Validation
- Lightweight

### Usage

1. Include jQuery:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
```

2. Include plugin's code:
    
```html
<script src="dist/jquery.multiline-control.min.js"></script>
```

3. Call the plugin:

```javascript
$('.multiline-control').multiline_control();
```

### Install via NPM or Yarn

1. Install via npm of yarn

```bash
npm install --save multiline-control
# OR
yarn add multiline-control
```

2. Import from your app.js

```ecmascript 6
import 'multiline-control'
```    

3. Then add initialize control with

```ecmascript 6
$('.multiline-control').multiline_control();
```   

Make sure you have available global jQuery variable,
if case you use Webpack, add ProvidePlugin to your plugins config

```ecmascript 6
new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
})
```

### Configuration

Full list of congifuration options with default values:

```ecmascript 6
$('.multiline-control').multiline_control({
    sortable: true,
    templateContainer: '<div class="multiline-control"></div>',
    templateAddBtn: '<a href="#" class="mc-add-btn btn btn-success btn"><i class="glyphicon glyphicon-plus"></i></a>',
    templateLine:
        '<div class="form-group mc-row">' +
           '<div class="input-group">' +
              '{sorting_handle}' +
              '<input type="text" class="form-control" name="{name}" value="{value}">' +
              '<a href="#" class="input-group-addon btn btn-default btn-sm mc-remove-btn">' +
                 '<i class="glyphicon glyphicon-remove"></i>' +
              '</a>' +
           '</div>' +
        '</div>',
    templateHandle: '<div class="input-group-addon mc-handle" style="cursor: move;"><i class="glyphicon glyphicon-move"></i></div>',
    templateSortablePlaceholder: '<div class="mc-sortable-placeholder form-group form-control" style="border: 1px dashed blue;"></div>',
    onChange: $.noop
});
```


### Contributing

Check [CONTRIBUTING.md](https://github.com/vedmant/multiline-control/blob/master/CONTRIBUTING.md) for more information.

### Browser support
Compatible with all modern browsers with HTML5 support.

### License
  
Muntiline control is licensed under the [MIT license](http://opensource.org/licenses/MIT).
