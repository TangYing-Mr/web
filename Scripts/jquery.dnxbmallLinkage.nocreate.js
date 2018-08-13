(function ($) {

    function getData(url, level, key) {
        var data;
        if (level == -1 || key) {
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
        }
        else
            data = [];
        return data;
    }

    var selectors = {};
    var uid = 0;

    var selectedItems = {};

    var dnxbmallLinkageOptions = {};

    function setDefaultItem(index) {
        if (dnxbmallLinkageOptions[index].enableDefaultItem) {
            if (!$.isArray(dnxbmallLinkageOptions[index].defaultItemsValue)) {
                var arr = [];
                var defaultVallue = dnxbmallLinkageOptions[index].defaultItemsValue;
                if (defaultVallue == null)
                    defaultVallue = '';
                var i = dnxbmallLinkageOptions[index].level;
                while (i--) arr.push(defaultVallue);
                dnxbmallLinkageOptions[index].defaultItemsValue = arr;
            }
            else if (dnxbmallLinkageOptions[index].defaultItemsValue.length < dnxbmallLinkageOptions[index].level) {
                var less = dnxbmallLinkageOptions[index].level - dnxbmallLinkageOptions[index].defaultItemsValue.length;
                while (less--)
                    dnxbmallLinkageOptions[index].defaultItemsValue.push('');
            }

            if (!$.isArray(dnxbmallLinkageOptions[index].defaultItemsText)) {
                var arr = [];
                var defaultText = dnxbmallLinkageOptions[index].defaultItemsText;
                if (defaultText == null)
                    defaultText = '请选择';
                var i = dnxbmallLinkageOptions[index].level;
                while (i--) arr.push(defaultText);
                dnxbmallLinkageOptions[index].defaultItemsText = arr;
            }
            else {
                var itemLength = dnxbmallLinkageOptions[index].defaultItemsText.length;
                if (itemLength < dnxbmallLinkageOptions[index].level) {
                    var less = dnxbmallLinkageOptions[index].level - itemLength;
                    while (less--)
                        dnxbmallLinkageOptions[index].defaultItemsText.push('请选择');
                }
            }
        }
    }


    function clear(startIndex, index) {
        for (var i = startIndex; i < selectors[index].length; i++) {
            if (selectors[index][i]) {
                if (dnxbmallLinkageOptions[index].displayWhenNull)
                    selectors[index][i].empty().attr('disabled', 'disabled');
                else
                    selectors[index][i].empty().hide();
            }
        }
    }


    function drawSelect(level, key, index) {
        var newLevel = level + 1;
        var selector = selectors[index][newLevel];
        if (key == dnxbmallLinkageOptions[index].defaultItemsValue[level])
            clear(newLevel,index);

        if (dnxbmallLinkageOptions[index].displayWhenNull)
            selector.empty().removeAttr('disabled');
        else
            selector.empty().show();
        var data = getData(dnxbmallLinkageOptions[index].url, level, key);
        if (data != null && data.length > 0) {
            if (dnxbmallLinkageOptions[index].enableDefaultItem) {
                var text = '<option ';
                if (dnxbmallLinkageOptions[index].defaultItemsValue[newLevel])
                    text += ' value="' + dnxbmallLinkageOptions[index].defaultItemsValue[newLevel] + '"';
                else
                    text += ' value=""';
                text += '>' + dnxbmallLinkageOptions[index].defaultItemsText[newLevel] + '</option>';
                selector.append(text);
            }
            $.each(data, function (i, item) {
                selector.append('<option value="' + (item.key ? item.key : item.Key) + '">' + (item.value ? item.value : item.Value) + '</option>');
            });

            selector.unbind('change').change(function (item) {
                var currentIndex = parseInt($(this).attr('linkageId'));
                selectedItems[currentIndex][newLevel] = $(this).val();
                if (newLevel < dnxbmallLinkageOptions[currentIndex].level - 1)
                    drawSelect(newLevel, $(this).val(), currentIndex);
                if (dnxbmallLinkageOptions[currentIndex].onChange)
                    dnxbmallLinkageOptions[currentIndex].onChange(newLevel, $(this).val(), $(this).find('option:selected').text());
            });
        }
        else
            clear(newLevel, index);
        var currentIndex = parseInt(selector.attr('linkageId'));
        if (newLevel < dnxbmallLinkageOptions[currentIndex].level -1 )
            drawSelect(newLevel,selector.val(), currentIndex);
    }

    function selectValue(level, key, index) {
        var selector = selectors[index][level];
        selector.val(key);
        if (level + 1 < dnxbmallLinkageOptions[index].level)
            drawSelect(level, key, index);
    }

    function initDefaultSelectedValues(index) {
        var selectedValues = dnxbmallLinkageOptions[index].defaultSelectedValues;
        if (selectedValues && selectedValues.length > 0 && parseInt(selectedValues[0])) {
            selectedValues = [0].concat(selectedValues);
            dnxbmallLinkageOptions[index].defaultSelectedValues = selectedValues;
        }

        for (var i = 1; i < selectedValues.length; i++)
            selectValue(i - 1, selectedValues[i], index);
    }


    $.fn.dnxbmallLinkage = function (options, params) {
        /// <param name="params" type="object">$.fn.dnxbmallLinkage.options</param>
        if (typeof options == "string") {
            return $.fn.dnxbmallLinkage.methods[options](this, params);
        }
        resetData(uid);
        selectors[uid] = [];
        $.each($(this), function (i, item) {
            $(item).attr('linkageId', uid);
            selectors[uid].push($(item));
        })
        $.fn.dnxbmallLinkage.options = $.extend({}, $.fn.dnxbmallLinkage.options, options);
        $.fn.dnxbmallLinkage.options.level = selectors[uid].length;
        dnxbmallLinkageOptions[uid] = $.fn.dnxbmallLinkage.options;
        setDefaultItem(uid);
        drawSelect(-1, null, uid);
        initDefaultSelectedValues(uid);
        uid++;
        return $;
    }

    $.fn.dnxbmallLinkage.options = {
        url: null,//调用地址
        enableDefaultItem: false,//是否显示默认项（即未选中时的项）
        defaultItemsText: [],//默认文本，可以是数组，也可以是统一的值
        defaultItemsValue: [],//默认值，可以是数组，也可以是统一的值
        onChange: null,//select 的change事件
        displayWhenNull: true,//
        defaultSelectedValues:[]
    };


    $.fn.dnxbmallLinkage.methods = {
        value: function (jquery, level) {
            var index = parseInt($(jquery).attr('linkageId'));
            return selectedItems[index][level];
        },
        reset: function (jquery) {
            var index =  parseInt($(jquery).attr('linkageId'));
            drawSelect(-1, null, index);
        }
    }

    function resetData(index) {
        selectors[index] = [];
        selectedItems[index] = [];
    }

})(jQuery);