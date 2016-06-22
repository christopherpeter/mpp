// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function EditCartViewModel(data) {
    var self = this;
    self.UIMessages = new UIMessageViewModel();
    self.CheckOut = function () {
        window.location.href = "/Checkout/1";
    }
    self.SaveAsQuote = function () {
        window.location.href = "/Checkout/2";
    }
    self.ContinueShopping = function () {
        window.location.href = "/Home";
    }
    self.AddSelectedToList = function () {
        self.UIMessages.UIMessagList.removeAll();
        var selectedItems = new Array();
        for (var i = 0; i < window.vm.ShoppingCart.CartItems().length; i++) {
            var item = window.vm.ShoppingCart.CartItems()[i];
            if(item.Selected()){
                selectedItems[i] = item.toCartItemModel();
                selectedItems[i].CartId = self.AddToListSelectedOption();
            }
        }

        $.ajax({
            type: "POST",
            url: "/ShoppingCart/AddCartItems",
            data: JSON.stringify(selectedItems),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if(response.Success){
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }                
            }
        });
    }

    self.PartLabelSelectorVisible = ko.observable(false);
    var PLSChanged = false;
    self.PartLabelSelectorClicked = function () {
        var visible = self.PartLabelSelectorVisible();
        self.PartLabelSelectorVisible(!visible);
    }
    self.PartLabels10ByShoppingCart = function () {
        var self = this;
        
        var postData = {
            shoppingCartId: self.ShoppingCart.CartId()
        };

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromCurrentCart",
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
                    //do nothing
                    //alert('Problem getting part detail ids from cart.');
                }
            self.EditCart.PartLabelSelectorVisible(false);
            }
        });

    }
    self.PartLabels30ByShoppingCart = function () {
        var self = this;

        var postData = {
            shoppingCartId: self.ShoppingCart.CartId()
        };

        var custId = self.UserAccount.CustomerId();

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromCurrentCart",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                    //var DocumentURL = "/GenericReport/GeneratePartLabelAvery5163AsPDF?partDetailIds=" + response.Data;
                    var DocumentURL = "/GenericReport/GeneratePartLabelAvery5160AsPDF?customerId=" + custId + "&partDetailIds=" + response.Data;
                    var win = window.open(DocumentURL, '_blank');
                    if (win) {
                        //Browser has allowed it to be opened
                        win.focus();
                    }
                }
                else {
                    //do nothing
                    //alert('Problem getting part detail ids from cart.');
                }
                self.EditCart.PartLabelSelectorVisible(false);
            }
        });

    }
    self.PartLabels4ByShoppingCart = function () {
        var self = this;

        var postData = {
            shoppingCartId: self.ShoppingCart.CartId()
        };

        var custId = self.UserAccount.CustomerId();

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromCurrentCart",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                    //var DocumentURL = "/GenericReport/GeneratePartLabelAvery5163AsPDF?partDetailIds=" + response.Data;
                    var DocumentURL = "/GenericReport/GeneratePartLabelAvery5168AsPDF?customerId=" + custId + "&partDetailIds=" + response.Data;
                    var win = window.open(DocumentURL, '_blank');
                    if (win) {
                        //Browser has allowed it to be opened
                        win.focus();
                    }
                }
                else {
                    //do nothing
                    //alert('Problem getting part detail ids from cart.');
                }
                self.EditCart.PartLabelSelectorVisible(false);
            }
        });

    }
    self.PartLabels6ByShoppingCart = function () {
        var self = this;

        var postData = {
            shoppingCartId: self.ShoppingCart.CartId()
        };

        var custId = self.UserAccount.CustomerId();

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromCurrentCart",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                    //var DocumentURL = "/GenericReport/GeneratePartLabelAvery5163AsPDF?partDetailIds=" + response.Data;
                    var DocumentURL = "/GenericReport/GeneratePartLabelAvery5164AsPDF?customerId=" + custId + "&partDetailIds=" + response.Data;
                    var win = window.open(DocumentURL, '_blank');
                    if (win) {
                        //Browser has allowed it to be opened
                        win.focus();
                    }
                }
                else {
                    //do nothing
                    //alert('Problem getting part detail ids from cart.');
                }
                self.EditCart.PartLabelSelectorVisible(false);
            }
        });

    }

    self.FavoritesLists = new Array();
    for (var i = 0; i < data.FavoritesLists.length; i++) {
        self.FavoritesLists[i] = {
            CartName: data.FavoritesLists[i].CartName,
            CartId: data.FavoritesLists[i].CartId
        };
    }
    if (self.FavoritesLists.length > 0) {
        self.AddToListSelectedOption = ko.observable(self.FavoritesLists[0].CartId || -1);
    }else{
        self.AddToListSelectedOption = ko.observable(-1);
    }

    
}

$(function () {

    if (window.editCartModel != undefined) {
        window.vm.EditCart = new EditCartViewModel(editCartModel);
        ko.applyBindings(vm, document.getElementById("shoppingCartDiv"));
        InitButtons();
    }
   
});