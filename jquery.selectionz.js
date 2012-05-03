/*!
 * jQuery Selectionz v0.2
 * Copyright (c) 2012 Antti-Jussi Kovalainen (ajk.im)
 */

;(function ($, window, document, undefined) {

    $.fn.selectionz = function () {
        var allSelects = [];

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
            var sel_el         = $('<div class="selectionz" />'),
                toggle         = $('<a class="sz-toggle" />'),
                label          = $('<span class="label"></span>'),
                options_outer  = $('<div class="sz-options-outer" />'),
                options_list   = $('<ul class="sz-options" />');

            createElements();
            hookEvents();

            allSelects.push(sel_el);
            sel_el.attr('tabindex', allSelects.length);

            var zindex = 1;

            function openDropdown() {
                options_outer.toggle()
                sel_el.toggleClass('open');

                if (sel_el.hasClass('open')) {
                    // store old z-index
                    zindex = sel_el.css('z-index');

                    // set crazy high z-index so other selectionz don't get in the way
                    sel_el.css('z-index', 1000);
                }
                else {
                    closeDropdown();
                }
            }

            function closeDropdown() {
                options_outer.hide();

                sel_el.removeClass('open');
                sel_el.css('z-index', zindex);
            }

            function hookEvents() {
                // events
                toggle.click(function (e) {
                    openDropdown();
                });
                
                /* Use mousedown for IE, because the element is hidden (because of 'blur') before click goes thru on IE */
                //options.bind(($.browser.msie ? 'mousedown' : 'click'), function () {
                options.bind('click', function () {
                    var $this = $(this);
                    var value = $this.attr('data-value');

                    $select.val(value).change();
                    
                    var new_current = orig_options.filter('[value="' + value + '"]');
                    setCurrent(new_current);

                    closeDropdown();
                });

                $select.bind('change', function (event) {
                    var value = $select.val();

                    var new_current = orig_options.filter('[value="' + value + '"]');
                    setCurrent(new_current);
                });

                sel_el
                    .bind('focus.selectionz', function () {
                        sel_el.addClass('focus');
                    })
                    .bind('blur.selectionz', function () {
                        // set some delay for better UX! lol. also, to fix the "dumb" event order in IE
                        setTimeout(function () { closeDropdown(); }, 100);
                        sel_el.removeClass('focus');
                    });
            }

            function createElements() {

                sel_el.css({
                    display: 'inline-block',
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

    /* Extra: Sync selections
     * This will sync the selections of the supplied selects */
    $.fn.syncSelections = function () {
        var disableSync = false,
            all = this;

        return this.each(function () {
            var $this = $(this);

            if ($this.is('select') === false) return; // do nothing for non-selects

            $this.bind('change', function () {
                if (disableSync) return;

                disableSync = true;

                var value = $(this).val();
                all.not(this).val(value).change();

                disableSync = false;
            });
        });
    };



})(jQuery, window, document);
