//多级联动

(function ($) {
    var container;

    function getData(url,level,key) {
        var data;
        $.ajax({
            url: url,
            async: false,
            data: { level: level, key: key },
            type: "post",
            dataType: "json",
            success: function (returnData) {
                data = returnData;
            }
        });
        return data;
    }

    var selectors = [];

    var selectedItems = [];

    function clear(startIndex) {
        for (var i = startIndex; i < selectors.length; i++) {
            if (selectors[i]) {
                selectors[i].remove();
                selectors[i] = null;
            }
        }
    }

    function drawSelect(level, key) {
        var newLevel = level + 1;
        var selector = selectors[newLevel];
        if (key == $.fn.dnxbmallLinkage.options.defaultItemsValue[level])
            clear(newLevel);
        if (!selector) {
            selector = $('<select class="' + $.fn.dnxbmallLinkage.options.styleClass + '"></select>');
            selectors[newLevel] = selector;
            selector.appendTo(container);
        }
        else {
            clear(newLevel + 1);
        }

        selector.empty();
        var data = getData($.fn.dnxbmallLinkage.options.url, level, key);
        if (data.length > 0) {
            if ($.fn.dnxbmallLinkage.options.enableDefaultItem) {
                var text = '<option ';
                if ($.fn.dnxbmallLinkage.options.defaultItemsValue[newLevel])
                    text += ' value="' + $.fn.dnxbmallLinkage.options.defaultItemsValue[newLevel] + '"';
                text += '>' + $.fn.dnxbmallLinkage.options.defaultItemsText[newLevel] + '</option>';
                selector.append(text);
            }
            $.each(data, function (i, item) {
                selector.append('<option value="' + (item.key ? item.key : item.Key) + '">' + (item.value ? item.value : item.Value) + '</option>');
            });

            selector.unbind('change').change(function (item) {
                selectedItems[newLevel] = $(this).val();
                if (newLevel < $.fn.dnxbmallLinkage.options.level - 1)
                    drawSelect(newLevel, $(this).val());
                if ($.fn.dnxbmallLinkage.options.onChange)
                    $.fn.dnxbmallLinkage.options.onChange(newLevel, $(this).val(), $(this).text());
            });
        }
        else
            clear(newLevel);
    }


    function setDefaultItem() {
        if ($.fn.dnxbmallLinkage.options.enableDefaultItem) {
            if (!$.isArray($.fn.dnxbmallLinkage.options.defaultItemsValue)) {
                var arr = [];
                var defaultVallue = $.fn.dnxbmallLinkage.options.defaultItemsValue;
                if (defaultVallue == null)
                    defaultVallue = '';
                var i = $.fn.dnxbmallLinkage.options.level;
                while (i--) arr.push(defaultVallue);
                $.fn.dnxbmallLinkage.options.defaultItemsValue = arr;
            }
            else if ($.fn.dnxbmallLinkage.options.defaultItemsValue.length < $.fn.dnxbmallLinkage.options.level) {
                var less = $.fn.dnxbmallLinkage.options.level - $.fn.dnxbmallLinkage.options.defaultItemsValue.length;
                while (less--)
                    $.fn.dnxbmallLinkage.options.defaultItemsValue.push('');
            }

            if (!$.isArray($.fn.dnxbmallLinkage.options.defaultItemsText)) {
                var arr = [];
                var defaultText = $.fn.dnxbmallLinkage.options.defaultItemsText;
                if (defaultText == null)
                    defaultText = '请选择';
                var i = $.fn.dnxbmallLinkage.options.level;
                while (i--) arr.push(defaultText);
                $.fn.dnxbmallLinkage.options.defaultItemsText = arr;
            }
            else {
                var itemLength = $.fn.dnxbmallLinkage.options.defaultItemsText.length;
                if (itemLength < $.fn.dnxbmallLinkage.options.level) {
                    var less = $.fn.dnxbmallLinkage.options.level - itemLength;
                    while (less--)
                        $.fn.dnxbmallLinkage.options.defaultItemsText.push('请选择');
                }
            }
        }
    }

    $.fn.dnxbmallLinkage = function (options, params) {
        /// <param name="params" type="object">$.fn.dnxbmallLinkage.options</param>

        if (typeof options == "string") {
            return $.fn.dnxbmallLinkage.methods[options](this, params);
        }

        container = $(this);
        $.fn.dnxbmallLinkage.options = $.extend({}, $.fn.dnxbmallLinkage.options, options);
        setDefaultItem();
        drawSelect(-1);
        return $;
    }

    $.fn.dnxbmallLinkage.options = {
        level: 1,//级数
        url: null,//调用地址
        selectorWidth: 120,//select框宽度
        styleClass: '',//select框样式
        enableDefaultItem: false,//是否显示默认项（即未选中时的项）
        defaultItemsText: [],//默认文本，可以是数组，也可以是统一的值
        defaultItemsValue: [],//默认值，可以是数组，也可以是统一的值
        onChange:null//select 的change事件
    };


    $.fn.dnxbmallLinkage.methods = {
        value: function (jquery,level) {
            return selectedItems[level];
        }
    }

})(jQuery);