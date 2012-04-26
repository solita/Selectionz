/*!
 * jQuery Selectionz - version 0.2
 * Copyright (c) 2011 Antti-Jussi Kovalainen (ajk.im)
 */

;(function ($, window, document, undefined) {

    $.fn.selectionz = function () {
        return this.each(function () {

            var $select = $(this);

            if ($select.is('select') === false) return;

            $select.hide();

            var orig_options = $select.children('option'),
                options = null,
                current = orig_options.filter('[selected]');

            if (current.length == 0) {
                current = $select.find('option').first();
            }

            // elements
            var sel_el          = $('<div class="selectionz" />'),
                toggle          = $('<div class="sz-toggle" />'),
                label           = $('<span class="label"></span>'),
                options_outer   = $('<div class="sz-options-outer" />'),
                options_list    = $('<ul class="sz-options" />');

            createElements();
            hookEvents();

            function hookEvents() {
                // events
                toggle.click(function () {
                    options_outer.css({
                        //zIndex: 100
                    });
                    options_outer.toggle();
                });
                
                options.click(function () {
                    var $this = $(this);
                    var value = $this.attr('data-value');

                    $select.val(value).change();
                    
                    var new_current = orig_options.filter('[value="' + value + '"]');
                    setCurrent(new_current);

                    options_outer.hide();
                });

                $select.bind('change', function (event) {
                    var value = $select.val();

                    var new_current = orig_options.filter('[value="' + value + '"]');
                    setCurrent(new_current);
                });

                sel_el.click(function (e) {
                    e.stopPropagation();
                });

                $('html').click(function (e) {
                    options_outer.hide();
                });
            }

            function createElements() {

                sel_el.css({
                    display: 'inline',
                    position: 'relative'
                });

                toggle
                    .append(label)
                    .append(' <span class="arrow">Show/hide</span>');

                toggle.css({
                    display: 'inline-block'
                });                

                // options container
                options_outer.append(options_list);

                options_outer.css({
                    display: 'none',
                    position: 'absolute'
                });

                options_list.css({
                    listStyle: 'none',
                    margin: 0,
                    padding: 0
                });

                // populate our custom options -list
                $select.find('option').each(function () {
                    var $this = $(this),
                        value = $this.attr('value'),
                        text = $this.text();

                    var item = $('<li data-value="' + value +'">' + text + '</li>');
                    options_list.append(item);
                });

                options = options_list.children();

                setCurrent(current);

                // append to DOM
                sel_el.append(toggle);
                sel_el.append(options_outer);
                
                $select.after(sel_el);

                options_outer.css({
                    top: toggle.outerHeight(),
                    minWidth: toggle.outerWidth()
                });
            }

            function setCurrent(new_current) {
                if (!new_current) return;

                current = new_current;

                var label_text = current.text();
                label.html(label_text);

                var value = new_current.attr('value');
                options.removeClass('current');
                options.filter('[data-value="' + value + '"]').addClass('current');
            }

        });
    };

})(jQuery, window, document);