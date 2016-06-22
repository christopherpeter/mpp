ko.extenders.camelCase = function (target) {
    var result = ko.computed({
        read: target,
        write: function (newValue) {
            var current = target();
            var valueToWrite = newValue.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
                return match.toUpperCase();
            });

            if(valueToWrite !== current) {
                target(valueToWrite);
            } else {
                if(newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({ notify: 'always' });
    result(target());
    return result;
}

function toNumeric(value,precision){    
    var newValueAsNum = new Number(isNaN(value) ? 0 : parseFloat(+value));
    return newValueAsNum.toFixed(precision);
}

ko.extenders.numeric = function (target, precision) {
    //create a writeable computed observable to intercept writes to our observable
    var result = ko.computed({
        read: target,  //always return the original observables value
        write: function (newValue) {
            var current = target();                
            var valueToWrite = toNumeric(newValue,precision);

            //only write if it changed
            if(valueToWrite !== current) {
                target(valueToWrite);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if(newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
};

ko.extenders.paging = function (target, pageSize) {
    var _pageSize = ko.observable(pageSize || 30), // default pageSize to 10
        _currentPage = ko.observable(1); // default current page to 1

    target.PageSize = ko.computed({
        read: _pageSize,
        write: function (newValue) {
            if (newValue > 0) {
                _pageSize(newValue);
            }
            else {
                _pageSize(30);
            }
        }
    });
    target.AvailablePageSizes = ko.observableArray([14, 30, 60, 200]);
    target.CurrentPage = ko.computed({
        read: _currentPage,
        write: function (newValue) {
            if (newValue > target.PageCount()) {
                _currentPage(target.PageCount());
            }
            else if (newValue <= 0) {
                _currentPage(1);
            }
            else {
                _currentPage(newValue);
            }
        }
    });
    target.ShowingItemsString = ko.computed(function () {
        var pageSize = _pageSize(),
            pageIndex = _currentPage(),
            startIndex = pageSize * (pageIndex - 1),
            endIndex = pageSize * pageIndex;

        if (endIndex > target().length) {
            endIndex = target().length;
        }
        return "Items " + (startIndex + 1).toString() + " to " + (endIndex).toString() + " of " + target().length.toString();
    });
    target.PageCount = ko.computed(function () {
        return Math.ceil(target().length / target.PageSize()) || 1;
    });

    target.CurrentPageData = ko.computed(function () {
        var pageSize = _pageSize(),
            pageIndex = _currentPage(),
            startIndex = pageSize * (pageIndex - 1),
            endIndex = pageSize * pageIndex;

        return target().slice(startIndex, endIndex);
    });

    target.MoveFirst = function () {
        target.CurrentPage(1);
    };
    target.MovePrevious = function () {
        target.CurrentPage(target.CurrentPage() - 1);
    };
    target.MoveNext = function () {
        target.CurrentPage(target.CurrentPage() + 1);
    };
    target.MoveLast = function () {
        target.CurrentPage(target.PageCount());
    };

    return target;
};