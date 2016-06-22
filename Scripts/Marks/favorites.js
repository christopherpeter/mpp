// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function FavoritesViewModel(data){
    var self = this;
    self.UIMessages = new UIMessageViewModel();
    $("input#addNewListButton").button();
    

    self.UserId = ko.observable(data.UserAccount.UserId || "");
    self.NewListName = ko.observable("");
    self.AddNewList = function () {
        self.UIMessages.UIMessagList.removeAll();
        $.ajax({
            type: "POST",
            url: "/Favorites/AddNewList/" + self.NewListName(),            
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if(response.Success){
                    AddNewList(response.Data);
                    self.NewListName("");
                    $("input#addNewListButton").button("enable");
                }else{
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }                
            }
        });
    }
    var AddNewList = function (data) {
        var newList = new CartViewModel(data);
        self.FavoritesLists.push(newList);
        return newList;
    }
    self.CopyToCart = function(){
        var cart = this;
        for (var i = 0; i < cart.CartItems().length; i++) {
            var item = cart.CartItems()[i].toCartItemModel();
            window.vm.ShoppingCart.AddItem(item);
        }
    }
    
    self.DeleteList = function () {
        $.ajax({
            type: "POST",
            url: "/Favorites/DeleteList/"+this.CartId(),
            contentType: "application/json; charset=utf-8"
        });
        self.FavoritesLists.remove(this);
    }
    self.ManageList = function () {
        window.location.href = "/Favorites/Edit/" + this.CartId();
    }
    self.FavoritesLists = ko.observableArray(new Array());

    for (var i = 0; i < data.FavoritesLists.length; i++) {
        if (data.FavoritesLists[i].CartName != "") {
            self.FavoritesLists.push(new CartViewModel(data.FavoritesLists[i]));
        }
    }

}


$(function () {
    
    if (window.favoritesModel!=undefined) {
        window.vm.Favorites = new FavoritesViewModel(favoritesModel);
        ko.applyBindings(vm, document.getElementById("favoritesDiv"));
        InitButtons();
    }
});