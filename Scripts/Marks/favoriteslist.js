// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


$(function () {
    if (window.favoritesListModel != undefined) {
        window.vm.FavoritesList = new CartViewModel(favoritesListModel.Cart);
        window.vm.FavoritesList.IsFavoritesCart(true);
        window.vm.FavoritesList.AddToCart = function () {
            window.vm.ShoppingCart.AddItem(ko.toJS(this));
        }
        window.vm.FavoritesList.AddSelectedToCart = function () {
            for (var i = 0; i < window.vm.FavoritesList.CartItems().length; i++) {
                var item = window.vm.FavoritesList.CartItems()[i];
                if (item.Selected()) {
                    window.vm.ShoppingCart.AddItem(ko.toJS(item));
                }
            }
        }

        self.PLLinkButtonClick = function (sender, event) {
            var btn = $(event.target);
            window.location.href = btn.attr("data-actionurl");
        }
        window.vm.FavoritesList.PartLabelSelectorVisible = ko.observable(false);
        var PLSChanged = false;
        window.vm.FavoritesList.PartLabelSelectorClicked = function () {
            var visible = window.vm.FavoritesList.PartLabelSelectorVisible();
            window.vm.FavoritesList.PartLabelSelectorVisible(!visible);
        }
        window.vm.FavoritesList.PartLabels10ByFavList = function () {
            var postData = {
                shoppingCartId: favoritesListModel.Cart.CartId
            };

            //alert('Use Avery 8163 shipping labels.');

            $.ajax({
                type: "POST",
                url: "/PartLabel/BuildPartLabelFromFavoriteList",
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == true) {
                        //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                        var DocumentURL = "/GenericReport/GeneratePartLabelAvery5163AsPDF?partDetailIds=" + response.Data;
                        var win = window.open(DocumentURL, '_blank');
                        if (win) {
                            //Browser has allowed it to be opened
                            win.focus();
                        }
                    }
                    else {
                        //do nothing for now
                    }
                window.vm.FavoritesList.PartLabelSelectorVisible(false);
                }
            });
            //window.location.href = "/PartLabel/BuildPartLabelFromFavoriteList";

            for (var i = 0; i < window.vm.FavoritesList.CartItems().length; i++) {
                var item = window.vm.FavoritesList.CartItems()[i];
                if (item.Selected()) {
                    window.vm.ShoppingCart.AddItem(ko.toJS(item));
                }
            }
        }
        window.vm.FavoritesList.PartLabels30ByFavList = function () {
            var postData = {
                shoppingCartId: favoritesListModel.Cart.CartId
            };

            //alert('Use Avery 8160 shipping labels.');

            var custId = favoritesListModel.UserAccount.CustomerId;

            $.ajax({
                type: "POST",
                url: "/PartLabel/BuildPartLabelFromFavoriteList",
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == true) {
                        //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                        var DocumentURL = "/GenericReport/GeneratePartLabelAvery5160AsPDF?customerId=" + custId + "&partDetailIds=" + response.Data;
                        var win = window.open(DocumentURL, '_blank');
                        if (win) {
                            //Browser has allowed it to be opened
                            win.focus();
                        }
                    }
                    else {
                        //do nothing for now
                    }
                window.vm.FavoritesList.PartLabelSelectorVisible(false);
                }
            });
            //window.location.href = "/PartLabel/BuildPartLabelFromFavoriteList";

            for (var i = 0; i < window.vm.FavoritesList.CartItems().length; i++) {
                var item = window.vm.FavoritesList.CartItems()[i];
                if (item.Selected()) {
                    window.vm.ShoppingCart.AddItem(ko.toJS(item));
                }
            }
        }
        window.vm.FavoritesList.PartLabels4ByFavList = function () {
            var postData = {
                shoppingCartId: favoritesListModel.Cart.CartId
            };

            //alert('Use Avery 8168 shipping labels.');

            var custId = favoritesListModel.UserAccount.CustomerId;

            $.ajax({
                type: "POST",
                url: "/PartLabel/BuildPartLabelFromFavoriteList",
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == true) {
                        //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                        var DocumentURL = "/GenericReport/GeneratePartLabelAvery5168AsPDF?customerId=" + custId + "&partDetailIds=" + response.Data;
                        var win = window.open(DocumentURL, '_blank');
                        if (win) {
                            //Browser has allowed it to be opened
                            win.focus();
                        }
                    }
                    else {
                        //do nothing for now
                    }
                    window.vm.FavoritesList.PartLabelSelectorVisible(false);
                }
            });
            //window.location.href = "/PartLabel/BuildPartLabelFromFavoriteList";

            for (var i = 0; i < window.vm.FavoritesList.CartItems().length; i++) {
                var item = window.vm.FavoritesList.CartItems()[i];
                if (item.Selected()) {
                    window.vm.ShoppingCart.AddItem(ko.toJS(item));
                }
            }
        }
        window.vm.FavoritesList.PartLabels6ByFavList = function () {
            var postData = {
                shoppingCartId: favoritesListModel.Cart.CartId
            };

            //alert('Use Avery 8164 shipping labels.');

            var custId = favoritesListModel.UserAccount.CustomerId;

            $.ajax({
                type: "POST",
                url: "/PartLabel/BuildPartLabelFromFavoriteList",
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == true) {
                        //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                        var DocumentURL = "/GenericReport/GeneratePartLabelAvery5164AsPDF?customerId=" + custId + "&partDetailIds=" + response.Data;
                        var win = window.open(DocumentURL, '_blank');
                        if (win) {
                            //Browser has allowed it to be opened
                            win.focus();
                        }
                    }
                    else {
                        //do nothing for now
                    }
                    window.vm.FavoritesList.PartLabelSelectorVisible(false);
                }
            });
            //window.location.href = "/PartLabel/BuildPartLabelFromFavoriteList";

            for (var i = 0; i < window.vm.FavoritesList.CartItems().length; i++) {
                var item = window.vm.FavoritesList.CartItems()[i];
                if (item.Selected()) {
                    window.vm.ShoppingCart.AddItem(ko.toJS(item));
                }
            }
        }
        ko.applyBindings(vm, document.getElementById("favoritesListDiv"));
        InitButtons();
    }
});