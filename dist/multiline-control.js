/**
 * Multiline control jQeury plugin
 */
(function($, window, document, undefined) {

   var pluginName = 'multiline_control';
   var defaults = {
      sortable: true,
      template_container: '<div class="multiline-control"></div>',
      template_add_btn: '<a href="#" class="mc-add-btn btn btn-success btn-sm">Add</a>',
      template_line: '\
         <div class="form-group mc-row">\
            <div class="input-group">\
               <input type="text" class="form-control" value="{value}">\
               <a href="#" class="input-group-addon btn btn-default btn-sm mc-remove-btn"><i class="glyphicon glyphicon-remove"></i></a>\
            </div>\
         </div>',
   };

   function Plugin(element, options) {
      this._name = pluginName;
      this.element = element;
      this.$element = $(element);
      var data_options = parse_data_options(this.$element.data('options'));
      this.options = $.extend({}, defaults, options);
      this.options = $.extend({}, this.options, data_options);
      this.init();
   }

   function parse_data_options(data_options_raw) {
      if (data_options_raw === undefined) return [];
      var options = [];
      data_options_raw.split(';').forEach(function(el) {
         var pair = el.split(':');
         if (pair.length == 2) options[pair[0].trim()] = pair[1].trim();
      });
      return options;
   }

   Plugin.prototype = {

      /**
       * Plugin initialization
       */
      init: function() {
         var that = this;

         // Hide original element
         this.$element.hide();

         this.build_template();

         this.bind_events();

         // Add lines
         var lines = this.$element.val().split(/\n/);
         lines.forEach(function(val, i) {
            if (val == '') return;
            that.add_line(val);
         });
      },

      /**
       * Build template
       */
      build_template: function() {
         // Add container
         this.$container = $(this.options.template_container);
         this.$element.after(this.$container);

         // Add "Add" button
         this.$add_btn = $(this.options.template_add_btn);
         this.$container.after(this.$add_btn);
      },

      /**
       * Bind actions
       */
      bind_events: function() {
         var that = this;

         // Add button click
         this.$add_btn.click(function(e) {
            e.preventDefault();
            that.add_line();
            that.$container.find('input').last().focus();
         });

         // Remove button click
         this.$container.on('click', '.mc-remove-btn', function(e) {
            e.preventDefault();
            that.remove_line($(this));
         });

         // On line input blur update textarea value
         this.$container.on('blur', 'input', function() {
            that.update_textarea();
         });

         // Handle enter and delete keys
         this.$container.on('keydown', 'input', function(e) {
            switch (e.which) {
               case 13:
                  that.add_line('', $(e.target)).find('input').focus();
                  return false;
               case 8:
                  if ($(e.target).val() == '') {
                     $(e.target).closest('.mc-row').prev().find('input').focus();
                     that.remove_line($(e.target));
                     return false;
                  }
            }
         });
      },

      /**
       * Update textarea value
       */
      update_textarea: function() {
         var value = '';
         this.$container.find('input').each(function() {
            if ($(this).val() == '') return;
            value += $(this).val() + "\n";
         });
         this.$element.val(value);
      },

      /**
       * Add new line
       *
       * @param str
       * @param $after
       */
      add_line: function(str, $after) {
         if (typeof str === 'undefined') str = '';

         var $row = $(this.options.template_line.replace('{value}', str));

         if (typeof $after !== 'undefined') {
            $after.closest('.mc-row').after($row);
         } else {
            this.$container.append($row);
         }

         return $row;
      },

      /**
       * Remove line
       *
       * @param $el
       */
      remove_line: function($el) {
         $el.closest('.mc-row').remove();
         this.update_textarea();
      },

      /**
       * Destroy plugin
       */
      remove: function() {
         this.$container.remove();
         this.$add_btn.remove();
         this.$element.show();
         this.$element.removeData('plugin_' + this._name);
      }

   }; // Plugin.prototype

   $.fn[pluginName] = function(options) {
      var args = [].slice.call(arguments, 1);
      return this.each(function() {
         if (! $.data(this, 'plugin_' + pluginName))
            $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
         else if ($.isFunction(Plugin.prototype[options]))
            $.data(this, 'plugin_' + pluginName)[options].apply($.data(this, 'plugin_' + pluginName), args);
      });
   }
})(jQuery, window, document);
