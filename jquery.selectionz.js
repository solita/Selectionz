/*!
 * jQuery Selectionz v0.3.1
 * Copyright (c) 2012 Antti-Jussi Kovalainen (ajk.im)
 */

;(function ($, window, document, undefined) {

    var allSelects = [];
    var radios = {};
    var dropdown = $('<div id="sz-dropdown" />');

    function showDropdown(x, y, min_width, options) {
        dropdown.css({
            position: 'absolute',
            left: x,
            top: y,
            visibility: 'visible',
            minWidth: min_width
        });

        dropdown.html(options).show();
        return options;
    }

    function hideDropdown() {
        dropdown.hide().empty();
    }

    $(document).ready(function () {
        $('body').append(dropdown);
    });

    $(document).click(function () {
        $('.selectionz').removeClass('open');
        hideDropdown();
    });

    // main
    $.fn.selectionz = function (options_in) {
        return this.each(function () {

            var element = $(this);
            if (element.is('select') === true) {
                styleSelect(element);
            }
            else if (element.is('input[type=checkbox]') === true) {
                styleCheckbox(element, options_in);
            }
            else if (element.is('label') === true) {
                styleCheckbox(element, options_in);
            }
            else {
                return false;
            }
        });

        function styleSelect($select) {
            $select.hide();

            var orig_options = $select.children('option'),
                options = null,
                current = orig_options.filter('[selected]');

            if (current.length === 0) {
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
                //options_outer.toggle();
                sel_el.toggleClass('open');

                if (sel_el.hasClass('open')) {
                    // store old z-index
                    //zindex = sel_el.css('z-index');

                    // set crazy high z-index so other selectionz don't get in the way
                    //sel_el.css('z-index', 10001);

                    var pos = sel_el.offset();
                    var x = pos.left;
                    var y = pos.top + toggle.outerHeight();
                    var min_width = toggle.outerWidth();

                    options_outer = showDropdown(x, y, min_width, options_outer);
                    options_outer.toggleClass('open');
                    bindOptions( options_outer.find('> ul > li') );
                }
                else {
                    closeDropdown();
                }
            }

            function closeDropdown() {
                sel_el.removeClass('open');
                sel_el.css('z-index', zindex);
                hideDropdown();
            }

            function hookEvents() {
                // events
                toggle.click(function (e) {
                    openDropdown();
                    e.stopPropagation();
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
                        sel_el.removeClass('focus');
                    });
            }

            function bindOptions(options) {
                /* Use mousedown for IE, because the element is hidden (because of 'blur') before click goes thru on IE */
                options.unbind(($.browser.msie ? 'mousedown' : 'click')).bind(($.browser.msie ? 'mousedown' : 'click'), function () {
                    var $this = $(this);
                    var value = $this.attr('data-value');

                    $select.val(value).change();
                    
                    var new_current = orig_options.filter('[value="' + value + '"]');
                    setCurrent(new_current);

                    closeDropdown();
                });
            }

            function createElements() {

                sel_el.css({
                    display: 'inline-block',
                    position: 'relative'
                });

                toggle
                    .append(label)
                    .append(' <span class="arrow"></span>');

                toggle.css({
                    display: 'inline-block'
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

                // options container
                options_outer.append(options_list);

                // append to DOM
                sel_el.append(toggle);
                
                $select.after(sel_el);

                options_outer.css({
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

        } /* styleSelect() */


        /*
         * Helps you style checkboxes and radios. Adds a c_on class to the label when checkbox/radio is checked
         * Note: Checkboxes and radios must be inside a <label> !
         */
        function styleCheckbox(element, options_in) {
            var options = $.extend({
                hideControl: false, // hides the control or radio control
                className: 'sz-control',
                classNameChecked: 'c_on'
            }, options_in);

            var $this = element;
            var label = null;
            var control = null;

            if ($this.is('label')) {
                label = $this;
                control = label.find('[type=checkbox], [type=radio]');
            }
            else if ($this.is('[type=checkbox], [type=radio]')) {
                control = $this;
                label = control.parent();

                if (!label.is('label')) {
                    // control must be inside a <label> !
                    return;
                }
            }
            else {
                return;
            }

            if (!label || !control || !label.length || !control.length) {
                // this is bat country!
                return;
            }

            label.addClass(options.className);

            if (options.hideControl) {
                //control.css({

                //});
            }

            // radio button specific stuff!
            var isRadio = false;
            if (control.is('[type=radio]') === true) {
                isRadio = true; // on se radio!
            }

            if (isRadio) {
                var name = control.attr('name');
                if (name !== undefined) {
                    radios[name] = radios[name] || [];
                    radios[name].push(control);
                }
            }

            function setClass() {
                if (isRadio) {
                    var name = control.attr('name');
                    if (name !== undefined) {
                        var tmp_radios = radios[name];
                        for (var i = 0; i < tmp_radios.length; i++) {
                            tmp_radios[i].parent('label').removeClass(options.classNameChecked);
                        }
                    }
                }

                if (control.is(':checked')) {
                    label.addClass(options.classNameChecked);
                }
                else {
                    label.removeClass(options.classNameChecked);
                }
            }

            setClass();

            control.bind('change', function () {
                setClass();
            });
        }
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
                all.not(this).each(function () {
                    var $this = $(this);
                    if ($this.find('option[value="' + value + '"]').length !== 0) {
                        $this.val(value).change();
                    }
                });

                disableSync = false;
            });
        });
    };

})(jQuery, window, document);
