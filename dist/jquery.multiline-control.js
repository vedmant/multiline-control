/*
 *  multiline-control - v1.0.0
 *  Form control that allows to edit multiple lines, change order, remove lines.
 *  
 *
 *  Made by Vedmant
 *  Under MIT License
 */
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
      templateAddBtn: '<a href="#" class="mc-add-btn btn btn-success btn"><i class="glyphicon glyphicon-plus"></i></a>',
      templateLine:
         '<div class="form-group mc-row">' +
            '<div class="input-group">' +
               '{sorting_handle}' +
               '<input type="text" class="form-control" value="{value}">' +
               '<a href="#" class="input-group-addon btn btn-default btn-sm mc-remove-btn">' +
                  '<i class="glyphicon glyphicon-remove"></i>' +
               '</a>' +
            '</div>' +
         '</div>',
      templateHandle: '<div class="input-group-addon mc-handle" style="cursor: move;"><i class="glyphicon glyphicon-move"></i></div>',
      templateSortablePlaceholder: '<div class="mc-sortable-placeholder form-group form-control" style="border: 1px dashed blue;"></div>',
      onChange: $.noop
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

         if ( this.options.sortable ) {
            this.initSorting();
         }

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
       * Init drag and drop sotring
       */
      initSorting: function() {
         var that = this,
            index,
            $dragging,
            isHandle = false,
            $placeholder = $( this.options.templateSortablePlaceholder );

         // Save clicked item if it's handle
         this.$container.on( 'mousedown', '.mc-handle', function() {
            isHandle = true;
         } );

         // Drag start
         this.$container.on( 'dragstart', '.mc-row', function( e ) {
            if ( isHandle ) {
               index = ( $dragging = $( this ) ).addClass( 'mc-sortable-dragging' ).index();
               var dt = e.originalEvent.dataTransfer;
               dt.effectAllowed = 'move';
               dt.setData( 'Text', 'dummy' );
            } else {
               e.preventDefault();
            }
         } );

         this.$container.on( 'dragend', '.mc-row', function() {
            isHandle = false;
            if ( !$dragging ) {
               return;
            }

            $dragging.removeClass( 'mc-sortable-dragging' ).show();
            $placeholder.detach();

            if ( index !== $dragging.index() ) {
               $dragging.parent().trigger( 'sortupdate', { item: $dragging } );
               that.updateTextarea();
            }

            $dragging = null;
         } );

         this.$container.on( 'dragover dragenter', '.mc-row', function( e ) {
            var $this = $( this );
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'move';
            $dragging.hide();

            if ( $placeholder.index() < $this.index() ) {
               $this.after( $placeholder );
            } else {
               $this.before( $placeholder );
            }
         } );

         this.$container.on( 'drop', '.mc-row, .mc-sortable-placeholder', function( e ) {
            e.stopPropagation();
            $placeholder.after( $dragging );
            $dragging.trigger( 'dragend' );
            return false;
         } );

         // Cancle events on .mc-sortable-placeholder to allow drop event
         this.$container.on( 'dragleave dragover', '.mc-row, .mc-sortable-placeholder', function( e ) {
            e.preventDefault();
            e.stopPropagation();
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
         this.options.onChange( value );
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

         var template = this.options.templateLine.replace( '{value}', str );

         // Add handle if sortable is enabled
         template = template.replace( '{sorting_handle}',
            this.options.sortable ? this.options.templateHandle : '' );

         var $row = $( template );

         if ( this.options.sortable ) {
            $row.attr( 'draggable', 'true' );
         }

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
      destroy: function() {
         this.$container.remove();
         this.$addBtn.remove();
         this.$element.show();
         this.$element.removeData( 'plugin_' + this._name );
      },

      /**
       * Remove all lines
       */
      empty: function() {
         this.$container.find( '.mc-row' ).remove();
      },

      /**
       * Update value
       *
       * @param value
       */
      update: function( value ) {
         var that = this;
         this.empty();

         // Add lines
         var lines = value.split( /\n/ );
         lines.forEach( function( val ) {
            if ( val === '' ) {
               return;
            }
            that.addLine( val );
         } );
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
