// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.

// undefined is used here as the undefined global variable in ECMAScript 3 is
// mutable (ie. it can be changed by someone else). undefined isn't really being
// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
// can no longer be modified.

// window and document are passed through as local variables rather than global
// as this (slightly) quickens the resolution process and can be more efficiently
// minified (especially when both are regularly referenced in your plugin).
;( function( $, window, document, undefined ) {
   'use strict';

   var pluginName = 'multiline_control';
   var defaults = {
      sortable: true,
      templateContainer: '<div class="multiline-control"></div>',
      templateAddBtn: '<a href="#" class="mc-add-btn btn btn-success btn-sm">Add</a>',
      templateLine: '\
         <div class="form-group mc-row">\
            <div class="input-group">\
               <input type="text" class="form-control" value="{value}">\
               <a href="#" class="input-group-addon btn btn-default btn-sm mc-remove-btn">\
                  <i class="glyphicon glyphicon-remove"></i>\
               </a>\
            </div>\
         </div>'
   };

   // The actual plugin constructor
   function Plugin( element, options ) {
      this._name = pluginName;
      this.$element = $( element );
      var dataOptions = parseDataOptions( this.$element.data( 'options' ) );

      // jQuery has an extend method which merges the contents of two or
      // more objects, storing the result in the first object. The first object
      // is generally empty as we don't want to alter the default options for
      // future instances of the plugin
      this.options = $.extend( {}, defaults, options );
      this.options = $.extend( {}, this.options, dataOptions );
      this.init();
   }

   function parseDataOptions( dataOptionsRaw ) {
      if ( dataOptionsRaw === undefined ) {
         return [];
      }
      var options = [];
      dataOptionsRaw.split( ';' ).forEach( function( el ) {
         var pair = el.split( ':' );
         if ( pair.length === 2 ) {
            options[ pair[ 0 ].trim() ] = pair[ 1 ].trim();
         }
      } );
      return options;
   }

   // Avoid Plugin.prototype conflicts
   $.extend( Plugin.prototype, {

      /**
       * Plugin initialization
       */
      init: function() {
         var that = this;

         // Hide original element
         this.$element.hide();

         this.buildTemplate();

         this.bindEvents();

         // Add lines
         var lines = this.$element.val().split( /\n/ );
         lines.forEach( function( val ) {
            if ( val === '' ) {
               return;
            }
            that.addLine( val );
         } );
      },

      /**
       * Build template
       */
      buildTemplate: function() {

         // Add container
         this.$container = $( this.options.templateContainer );
         this.$element.after( this.$container );

         // Add "Add" button
         this.$addBtn = $( this.options.templateAddBtn );
         this.$container.after( this.$addBtn );
      },

      /**
       * Bind actions
       */
      bindEvents: function() {
         var that = this;

         // Add button click
         this.$addBtn.click( function( e ) {
            e.preventDefault();
            that.addLine();
            that.$container.find( 'input' ).last().focus();
         } );

         // Remove button click
         this.$container.on( 'click', '.mc-remove-btn', function( e ) {
            e.preventDefault();
            that.removeLine( $( this ) );
         } );

         // On line input blur update textarea value
         this.$container.on( 'blur', 'input', function() {
            that.updateTextarea();
         } );

         // Handle enter and delete keys
         this.$container.on( 'keydown', 'input', function( e ) {
            switch ( e.which ) {
               case 13:
                  that.addLine( '', $( e.target ) ).find( 'input' ).focus();
                  return false;
               case 8:
                  if ( $( e.target ).val() === '' ) {
                     $( e.target ).closest( '.mc-row' ).prev().find( 'input' ).focus();
                     that.removeLine( $( e.target ) );
                     return false;
                  }
            }
         } );
      },

      /**
       * Update textarea value
       */
      updateTextarea: function() {
         var value = '';
         this.$container.find( 'input' ).each( function() {
            if ( $( this ).val() === '' ) {
               return;
            }
            value += $( this ).val() + '\n';
         } );
         this.$element.val( value );
      },

      /**
       * Add new line
       *
       * @param str
       * @param $after
       */
      addLine: function( str, $after ) {
         if ( typeof str === 'undefined' ) {
            str = '';
         }

         var $row = $( this.options.templateLine.replace( '{value}', str ) );

         if ( typeof $after !== 'undefined' ) {
            $after.closest( '.mc-row' ).after( $row );
         } else {
            this.$container.append( $row );
         }

         return $row;
      },

      /**
       * Remove line
       *
       * @param $el
       */
      removeLine: function( $el ) {
         $el.closest( '.mc-row' ).remove();
         this.updateTextarea();
      },

      /**
       * Destroy plugin
       */
      remove: function() {
         this.$container.remove();
         this.$addBtn.remove();
         this.$element.show();
         this.$element.removeData( 'plugin_' + this._name );
      }

   } ); // Plugin.prototype

   $.fn[ pluginName ] = function( options ) {
      var args = [].slice.call( arguments, 1 );
      return this.each( function() {
         if ( !$.data( this, 'plugin_' + pluginName ) ) {
            $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
         } else if ( $.isFunction( Plugin.prototype[ options ] ) ) {
            $.data( this, 'plugin_' + pluginName )[ options ].apply(
               $.data( this, 'plugin_' + pluginName ), args );
         }
      } );
   };

} )( jQuery, window, document );
