iD.ui.preset.mcombo =
iD.ui.preset.typeMCombo = function(field, context) {
    var event = d3.dispatch('change'),
        optstrings = field.strings && field.strings.options,
        optarray = field.options, // not used here
        strings = {},  //values and their labels (descriptions)   strings[k] is label to value k

        input;

    function mcombo(selection) {
        var combobox = d3.mcombobox();

        input = selection.selectAll('input')
            .data([0]);

        var enter = input.enter()
            .append('input')
            .attr('type', 'text')
            .attr('id', 'preset-input-' + field.id);

        if (optstrings) { enter.attr('readonly', 'readonly'); }

        input
            .call(combobox)
            .on('change', change)
            .on('blur', change)
            .each(function() {
                if (optstrings) {
                    _.each(optstrings, function(v, k) {
                        strings[k] = field.t('options.' + k, { 'default': v });
                    });
                    stringsLoaded();
                } else if (optarray) {
                    _.each(optarray, function(k) {
                        strings[k] = k.replace(/_+/g, ' ');
                    });
                    stringsLoaded();
                } else if (context.taginfo()) {
                    context.taginfo().values({key: field.key}, function(err, data) {
                        if (!err) {
                            _.each(_.pluck(data, 'value'), function(k) {
                                strings[k] = k.replace(/_+/g, ' ');
                            });
                            stringsLoaded();
                        }
                    });
                }
            });

        function stringsLoaded() {
            var keys = _.keys(strings),
                strs = [],
                placeholders;

            combobox.data(
                keys.map(function(k,i) {
                    var s = strings[k],
                        o = {};
                    var index_of_separator = s.indexOf(':');
                    //console.log(s + " " + index_of_separator);
                    if (index_of_separator >= 0) {
                        o.value = k;
                        o.label = s.substr(0,index_of_separator);
                        o.title = s.substr(index_of_separator+1);
                    } else {
                        o.title = o.value = o.label = s;
                    }
                    o.idx = i;
                    o.selected = false;
                    if (o.value.length < 20) { strs.push(o.value); }
                    return o;
            }));

            placeholders = strs.length > 1 ? strs : keys;
            input.attr('placeholder', field.placeholder() ||
                (placeholders.slice(0, 3).join(', ') + '...'));
        }
    }

    /* tries to convert label texts from input.value to osm-values.
     * conversion not used here, because labels are only used for texts on mcombo, input.value are already osm-values
     */
    function change() {
        var stringarray = input.value()
            .split(';')
            .map(function(s) { return s.trim(); });
        var final_value = "";
        for(var i = 0; i < stringarray.length; i++) {
            var osm_value = _.find(_.keys(strings), function(k) { return strings[k] === stringarray[i]; }) || stringarray[i];
            if(osm_value == "yes") //remove placeholder
                continue;
            if(final_value)
                final_value += "; ";
            final_value += osm_value;
        }

        var t = {};
        t[field.key] = final_value || undefined;
        event.change(t);
    }

    // arg1: tags of current OSM objects { key1: value1, ... }
    mcombo.tags = function(tags) {
        var current_value = tags[field.key], // e.g. food+drink;water;
            value = current_value || '';
        if (field.type === 'typeMCombo' && value.toLowerCase() === 'yes')
            value = '';

        input.value(value);
    };

    mcombo.focus = function() {
        input.node().focus();
    };

    return d3.rebind(mcombo, event, 'on');
};
