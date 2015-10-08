d3.mcombobox = function() {
    var event = d3.dispatch('accept'),
        data = [],
        suggestions = [],
        minItems = 2;



    var fetcher = function(val, cb) {
        cb(data.filter( function(d) {
            // returns true if val is contained in d.value
            return d.value
                .toString()
                .toLowerCase()
                .indexOf(val.toLowerCase()) !== -1;
        }));
    };

    var mcombobox = function(input) {
        var selected = [],
            container = d3.select(document.body)
                .selectAll('div.combobox')
                .filter(function(d) { return d === input.node(); }),
            shown = !container.empty();

        input
            .classed('combobox-input multiple', true)
            .on('focus.typeahead', focus)
            .on('blur.typeahead', blur)
            .on('keydown.typeahead', keydown)
            .on('keyup.typeahead', keyup)
            .on('input.typeahead', change)
            .each(function() {
                var parent = this.parentNode,
                    sibling = this.nextSibling;

                var caret = d3.select(parent).selectAll('.combobox-caret')
                    .filter(function(d) { return d === input.node(); })
                    .data([input.node()]);

                caret.enter().insert('div', function() { return sibling; })
                    .attr('class', 'combobox-caret');

                caret
                    .on('mousedown', function () {
                        // console.log("mousedown");
                        // prevent the form element from blurring. it blurs
                        // on mousedown
                        d3.event.stopPropagation();
                        d3.event.preventDefault();
                        if (!shown) {
                            input.node().focus();
                            fetch('', render);
                        } else {
                            hide();
                        }
                    });
            });

        function focus() {
            fetch(value(), setup);
        }

        function blur() {
            window.setTimeout(hide, 150);
        }

        function show() {
            if (!shown) {
                container = d3.select(document.body)
                    .insert('div', ':first-child')
                    .datum(input.node())
                    .attr('class', 'combobox')
                    .style({
                        position: 'absolute',
                        display: 'block',
                        left: '0px'
                    })
                    .on('mousedown', function () {
                        // prevent moving focus out of the text field
                        d3.event.preventDefault();
                    });

                d3.select(document.body)
                    .on('scroll.combobox', render, true);

                shown = true;
            }
        }

        function hide() {
            if (shown) {
                selected = [];
                container.remove();

                d3.select(document.body)
                    .on('scroll.combobox', null);

                shown = false;
            }
        }

        function keydown() {
           switch (d3.event.keyCode) {
               // backspace, delete
               case 8:
               case 46:
                   input.on('input.typeahead', function() {
                       // idx = -1;
                       // TODO
                       render();
                       var start = input.property('selectionStart');
                       input.node().setSelectionRange(start, start);
                       input.on('input.typeahead', change);
                   });
                   break;
               // tab
               case 9:
                   container.selectAll('a.selected').each(event.accept);
                   break;
               // return
               case 13:
                   d3.event.preventDefault();
                   break;
               // up arrow
               case 38:
                   nav(-1);
                   d3.event.preventDefault();
                   break;
               // down arrow
               case 40:
                   nav(+1);
                   d3.event.preventDefault();
                   break;
           }
           d3.event.stopPropagation();
        }

        function keyup() {
            switch (d3.event.keyCode) {
                // escape
                case 27:
                    hide();
                    break;
                // return
                case 13:
                    container.selectAll('a.selected').each(event.accept);
                    hide();
                    break;
            }
        }

        function setup() {
            var initial_values =
               _.map( input.value().split(";"),
                   function (s) { return s.trim(); });

            _.forEach(data, function(d) {
                d.selected = _.indexOf(initial_values,d.value) >= 0;
            });

            render();
        }

        function change() {
            fetch(value(), function() {
                autocomplete();
                render();
            });
        }

        function nav(dir) {
            // TODO
            // idx = Math.max(Math.min(idx + dir, suggestions.length - 1), 0);
            // input.property('value', suggestions[idx].value);
            render();
            ensureVisible();
        }

        function value() {
            var value = input.property('value');
            // console.log("!mcombobox.value",value);
            return value;
        }

        function fetch(v, cb) {
            fetcher.call(input, v, function(_) {
                suggestions = _;
                cb();
            });
        }

        function autocomplete() {
            return; // TODO
            var v = _.last(value().split(";")).trim();

            var idx = -1;

            if (!v) return;

            for (var i = 0; i < suggestions.length; i++) {
                if (suggestions[i].value.toLowerCase().indexOf(v.toLowerCase()) === 0) {
                    var completion = v + suggestions[i].value.substr(v.length);
                    idx = i;
                    input.property('value', completion);
                    input.node().setSelectionRange(v.length, completion.length);
                    return;
                }
            }
        }

        function render() {

            if (suggestions.length >= minItems && document.activeElement === input.node()) {
                show();
            } else {
                hide();
                return;
            }

            var options = container
                .selectAll('a.mcombobox-option')
                .data(suggestions, function(d) { return d.value; } )
            ;

            var new_options = options.enter().append('a')
                .attr('class', 'mcombobox-option');

            new_options.append('i');
            new_options.append('span').text( function(d) { return d.label; });

            options
                .attr('title', function(d) { return d.title; })
                .classed('selected', function(d) { return d.selected; })
                .on('click', toggle)
                .order()
            ;

            options
                .selectAll("i")
                .attr('class', function(d) {
                    if ( d.selected) { return 'mcombo check-square'; }
                                else { return 'mcombo square'; }
                })
            ;

            options.exit()
                .remove()
            ;

            var rect = input.node().getBoundingClientRect();

            container.style({
                'left': rect.left + 'px',
                'width': rect.width + 'px',
                'top': rect.height + rect.top + 'px'
            });
        }

        function toggle(d) {
            // console.log("!select",d,i,selected);
            d.selected = !d.selected;
            render();
            input.property('value',
                set_value( input.property('value'),d.value, d.selected )
            ).trigger('change');

        }

        function ensureVisible() {
            var node = container.selectAll('a.selected').node();
            if (node) node.scrollIntoView();
        }

        function set_value(current_values,key,enable) {
            // console.log("set_value",val,key,enable);
            if ( !enable ) {
                current_values = current_values
                    .replace(key,"")
                    .trim()
                    .replace(/;$/,"");
            } else {
                current_values = current_values +"; "+key;
            }
            // console.log("res",val);
            return current_values.replace(/^;[\s]*/,'').replace(/[\s]*;[\s]*;[\s]*/,'; ');
        }

        function accept(d) {
            // console.log("!accept",d);
            if (!shown) return;
            input
                .property('value', d.value )
                .trigger('change');
            event.accept(d);
            hide();
        }
    };

    mcombobox.fetcher = function(_) {
        if (!arguments.length) return fetcher;
        fetcher = _;
        return mcombobox;
    };

    mcombobox.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        return mcombobox;
    };

    mcombobox.minItems = function(_) {
        if (!arguments.length) return minItems;
        minItems = _;
        return mcombobox;
    };

    return d3.rebind(mcombobox, event, 'on');
};

