ko.bindingHandlers.datetext = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        // Provide a custom text value
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var dateFormat = allBindingsAccessor.dateFormat || "M/D/YYYY";
        var strDate = ko.utils.unwrapObservable(value);
        if (strDate) {
            if (moment(strDate).year() > 1970) {
                var date = moment(strDate).format(dateFormat);
                $(element).text(date);
            }
            else {
                $(element).text("-");
            }
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        // Provide a custom text value
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var dateFormat = allBindingsAccessor.dateFormat || "M/D/YYYY";
        var strDate = ko.utils.unwrapObservable(value);
        if (strDate) {
            if (moment(strDate).year() > 1970) {
                var date = moment(strDate).format(dateFormat);
                $(element).text(date);
            }
            else {
                $(element).text("-");
            }
        }
    }
};
ko.bindingHandlers.datevalue = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        // Use the value binding
        ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);

        // Provide a custom text value
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var dateFormat = allBindingsAccessor.dateFormat || "M/D/YYYY";
        var strDate = ko.utils.unwrapObservable(value);
        if (strDate) {
            var date = moment(strDate).format(dateFormat);
            $(element).val(date);
        }
        $(element).datepicker({ formatDate: dateFormat });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        // Use the value binding
        ko.bindingHandlers.value.update(element, valueAccessor, allBindingsAccessor);

        // Provide a custom text value
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var dateFormat = allBindingsAccessor.dateFormat || "M/D/YYYY";
        var strDate = ko.utils.unwrapObservable(value);
        if (strDate) {
            var date = moment(strDate).format(dateFormat);
            $(element).val(date);
        }
    }
};

ko.bindingHandlers.slider = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().sliderOptions || {};
        $(element).slider(options);
        ko.utils.registerEventHandler(element, "slidechange", function (event, ui) {
            var observable = valueAccessor();
            observable(ui.value);
        });
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).slider("destroy");
        });
        ko.utils.registerEventHandler(element, "slide", function (event, ui) {
            var observable = valueAccessor();
            observable(ui.value);
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (isNaN(value)) value = 0;
        $(element).slider("value", value);
    }
};

ko.bindingHandlers.dialog = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = ko.utils.unwrapObservable(valueAccessor()) || {};


        options.close = function () {
            allBindingsAccessor().dialogVisible(false);
        };

        $(element).dialog(options);


        //handle disposal (not strictly necessary in this scenario)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).dialog("destroy");
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        var shouldBeOpen = ko.utils.unwrapObservable(allBindingsAccessor().dialogVisible);
        $(element).dialog(shouldBeOpen ? "open" : "close");

    }
};

ko.bindingHandlers.button = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element).button();
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            disabled = ko.utils.unwrapObservable(value.disabled);

        $(element).button("option", "disabled", disabled);
    }
};

ko.bindingHandlers.placeholder = {
    init: function (element, valueAccessor) {
        var placeholderValue = valueAccessor();
        ko.applyBindingsToNode(element, { attr: { placeholder: placeholderValue } });
    },
    update: function (element, valueAccessor) {
        $.placeholder.shim();
    }
};