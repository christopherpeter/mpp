// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function SearchResultItem(data, parent) {
    var self = this;

    self.PartDetailId = data.PartDetailId || -1;
    self.PartNumber = data.PartNumber || "";
    self.ClassId = data.ClassId || 0;
    self.ClassDescription = data.ClassDescription || "";
    self.SubClassId = data.SubClassId || "";
    self.SubClassDescription = data.SubClassDescription || "";
    self.Description = data.Description || "";
    self.SubstitutePartDetailId = data.SubstitutePartDetailId || "";
    self.SubstitutePartNumber = data.SubstitutePartNumber || "";
    self.UnitOfMeasureId = data.UnitOfMeasureId || 0;
    self.UnitOfMeasureAbbreviation = data.UnitOfMeasureAbbreviation || "";
    self.Line1 = data.Line1 || "";
    self.Line2 = data.Line2 || "";
    self.Line3 = data.Line3 || "";
    self.Line4 = data.Line4 || "";
    self.Line5 = data.Line5 || "";
    self.TruckItem = data.TruckItem || false;
    self.ShowOnWeb = data.ShowOnWeb || false;
    self.UnitPrice = ko.observable(data.UnitPrice || 0.00);
    self.UnitPriceForDisplay = ko.computed(function () {
        var price = self.UnitPrice();
        return price ? "$ " + price.toFixed(2) : "$ " + 0.00;
    });

    self.CommissionRate = ko.observable(data.CommissionRate || 0.00);
    self.ImageName = data.ImageName || "";
    self.SellQuantity = data.SellQuantity || 1;
    self.QuantityAvailable = data.QuantityAvailable || 0;
    self.DeadOnDate = data.DeadOnDate || new Date();
    self.Quantity = ko.observable(self.SellQuantity);
    self.ImagePath = ko.computed(function () {
        return "/Content/Images/Catalog/" + self.ImageName;
    });
    self.ThumbnailImagePath = ko.computed(function () {
        return "/Content/Images/Catalog/thumbs/" + self.ImageName;
    });
    self.FingernailImagePath = ko.computed(function () {
        return "/Content/Images/Catalog/fingers/" + self.ImageName;
    });
    self.ViewDetailRoute = ko.computed(function () {
        return "/Catalog/Detail/" + self.PartDetailId.toString();
    });
    self.AddToCart = function () {
        window.vm.ShoppingCart.AddItem({
            PartNumber: self.PartNumber,
            PartDetailId: self.PartDetailId,
            Quantity: self.Quantity()
        });
    }
    self.IsAvailableForPurchase = ko.computed(function () {
        return self.UnitPrice() > 0;
    });
}

function SearchResultsViewModel(data) {
    var self = this;
    var _currentPage = ko.observable(1), _pageSize = ko.observable(data.CatalogSearchResult.DefaultPageSize || 30);
    //var _currentSort = ko.observable(1), _sortValue = ko.observable(data.SearchParamaters.SortValue || 'Price Low to High');

    self.SearchResults = ko.observableArray(new Array());

    self.ButtonPress = false;

    self.TotalItemCount = ko.observable(data.CatalogSearchResult.TotalItemCount || 0);
    self.StartIndex = ko.observable(data.SearchParamaters.StartIndex || 0);
    self.EndIndex = ko.observable(data.SearchParamaters.EndIndex || 30);
    self.SortValueParamater = ko.observable(data.SearchParamaters.SortValueParamater || 'PartNo Low to High');
    //is this called from my reports menu(no sorting) or browsings / searches
    self.IsMyReports = ko.observable(data.IsMyReports || false);



    self.PageSize = ko.computed({
        read: _pageSize,
        write: function (newValue) {

            _pageSize(newValue);

            var startIndex = 1;
            var endIndex = newValue;
            $.post("/Catalog/SetCurrentPageSize", JSON.stringify({ size: newValue }));
            var currPage = self.CurrentPage();

            self.CurrentPage(1);
            if (currPage == 1) {
                GetDataForPage(startIndex, endIndex, self.SortValueChoice.value, 'pagesize');
            }

        }
    });

    self.PageCount = ko.computed(function () {
        return Math.ceil(self.TotalItemCount() / self.PageSize()) || 1;
    });

    self.HasResults = ko.computed(function () {
        if (self.SearchResults.length > 0) {
            return true;
        } else {
            return false;
        }
    });


    self.SearchParamaters = data.SearchParamaters || {};



    var GetDataForPage = function (startIndex, endIndex, sortValue, caller) {
        Loading(true);

        var cVal = caller;

        var actionUrl = "/Catalog/GetSearchResults";
        self.SearchParamaters.StartIndex = startIndex;
        self.SearchParamaters.EndIndex = endIndex;
        self.SearchParamaters.SortValueParamater = sortValue;

        var tester = JSON.stringify(self.SearchParamaters);


        $.ajax({
            type: "POST",
            url: actionUrl,
            data: JSON.stringify(self.SearchParamaters),
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                self.SearchResults.removeAll();
                self.StartIndex(result.StartIndex);
                self.EndIndex(result.EndIndex);
                //self.SortValueChoice(result.SortValueParamater);
                for (var i = 0; i < result.SearchResults.length; i++) {
                    self.SearchResults.push(new SearchResultItem(result.SearchResults[i]));
                }
                InitButtons();

                if (self.ButtonPress == true) {
                    //this resets scroll bar to top of page
                    $("html, body").stop(true);
                    $("html, body").animate({ scrollTop: 0 }, "fast");
                    self.ButtonPress = false;
                }
                //let this spin if was are resetting to top of page before turning off
                Loading(false);

                ////for next time
                //if (self.ResetSortData() == true) {
                //    self.ResetSortData(false);
                //}

            }
        });
    }

    //added 200 items per page as MAX
    self.AvailablePageSizes = ko.observableArray([14, 30, 60, 200]);
    self.CurrentPage = ko.computed({
        read: _currentPage,
        write: function (newValue, skipHistoryUpdate) {
            var updateHistory = true;

            if (skipHistoryUpdate == true) {
                updateHistory = false;
            }

            // Cannot push history on these browsers
            if (($.browser.msie) && ($.browser.version <= 9)) {
                updateHistory = false;
            }

            if (updateHistory) {
                var state = history.state || {};
                state.PageNumber = newValue;
                history.pushState(state, "SearchResults", "");
            }

            if (newValue > self.PageCount()) {
                _currentPage(self.PageCount());
            }
            else if (newValue <= 0) {
                _currentPage(1);
            }
            else {
                _currentPage(newValue);
            }

            if (newValue > self.PageCount()) {
                newValue = self.PageCount();
            } else if (newValue <= 0) {
                newValue = 1;
            }

            var startIndex = self.PageSize() * (newValue - 1) + 1;
            var endIndex = self.PageSize() * newValue;
            if (endIndex > self.TotalItemCount()) {
                endIndex = self.TotalItemCount();
            }

            GetDataForPage(startIndex, endIndex, self.SortValueChoice(), 'currentpage');
        }
    });

    self.CurrentPage.subscribe(function (newPageNumber) {

        if (newPageNumber > self.PageCount()) {
            newPageNumber = self.PageCount();
        } else if (newPageNumber <= 0) {
            newPageNumber = 1;
        }

        var startIndex = self.PageSize() * (newPageNumber - 1) + 1;
        var endIndex = self.PageSize() * newPageNumber;
        if (endIndex > self.TotalItemCount()) {
            endIndex = self.TotalItemCount();
        }

        GetDataForPage(startIndex, endIndex, self.SortValueChoice(), 'currentpagesubscribe');
    });

    self.ShowingItemsString = ko.computed(function () {
        var totalItems = self.TotalItemCount();
        var startIndex = self.StartIndex();
        var endIndex = self.EndIndex();
        var currPage = self.CurrentPage();
        var pageSize = self.PageSize();

        if (self.SearchResults().length < endIndex) {
            endIndex = self.SearchResults().length;
        }

        var movableEndIdx = (currPage - 1) * pageSize + endIndex;
        var ItemsLine = "Items " + startIndex.toString() + " to " + movableEndIdx.toString() + " of " + totalItems.toString();
        return ItemsLine;
    })

    self.MoveFirst = function () {
        self.ButtonPress = true;
        self.CurrentPage(1);
    };
    self.MovePrevious = function () {
        self.ButtonPress = true;
        self.CurrentPage(self.CurrentPage() - 1);
    };
    self.MoveNext = function () {
        self.ButtonPress = true;
        self.CurrentPage(self.CurrentPage() + 1);
    };
    self.MoveLast = function () {
        self.ButtonPress = true;
        self.CurrentPage(self.PageCount());
    };

    for (var i = 0; i < data.CatalogSearchResult.SearchResults.length; i++) {
        var item = new SearchResultItem(data.CatalogSearchResult.SearchResults[i], self);
        self.SearchResults.push(item);
    }


    //These 2 options have been removed because of pricing engine issue.
    //'Price Low to High', 'Price High to Low', 
    self.AvailableSortBy = ko.observableArray(['PartNo Low to High', 'PartNo High to Low', 'Description A-Z', 'Description Z-A', 'Class']);
    self.SortValueChoice = ko.observable('PartNo Low to High');
    self.SortValueChoice.subscribe(function (newValue) {
        //alert("the new value is " + newValue);
        //any resort will reset to page 1 and sort based on new style
        self.CurrentPage(1);
        GetDataForPage(self.StartIndex(), self.EndIndex(), self.SortValueChoice(), 'selectionChanged');
    });
}


$(function () {

    if (window.searchResultModel != undefined) {
        window.vm.SearchResults = new SearchResultsViewModel(searchResultModel);
        var searchResultsDivDom = $('#searchResultsDiv')[0];
        ko.applyBindings(vm, searchResultsDivDom);
        InitButtons();
        window.onpopstate = function (event) {
            if (event.state) {
                vm.SearchResults.CurrentPage(event.state.PageNumber, true);
            }
        }
    }
});
