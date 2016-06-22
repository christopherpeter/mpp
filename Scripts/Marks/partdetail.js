// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function PartDetailViewModel(data) {
    var self = this;
    self.Part = new SearchResultItem(data.Part, self);
    self.FavoritesLists = new Array();
    for (var i = 0; i < data.FavoritesLists.length; i++) {
        self.FavoritesLists[i] = {
            CartName: data.FavoritesLists[i].CartName,
            CartId: data.FavoritesLists[i].CartId
        };
    }

    self.AddToListSelectedOption = ko.observable(-1);
    if(self.FavoritesLists.length>0){
        self.AddToListSelectedOption(self.FavoritesLists[0].CartId);
    }
    self.AddToList = function(){
        var item={
            CartId: self.AddToListSelectedOption(),
            PartDetailId: self.Part.PartDetailId,
            Quantity:self.Part.Quantity()
        }
        $.ajax({
            type: "POST",
            url: "/ShoppingCart/AddCartItem",
            data: JSON.stringify(item),
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                confirmationDialog("Success", 'The item has been added to your favorites list.', null, null);
            }
        });
    }
}

$(function () {

    if (window.partDetailModel != undefined) {
        window.vm.PartDetail = new PartDetailViewModel(partDetailModel);
        ko.applyBindings(vm, document.getElementById("partDetailDiv"));
        InitButtons();
    }
});