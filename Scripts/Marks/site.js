// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


//keeping this for now because it is a good example of a jQuery ENum
//function Preferences() { };
//Preferences.CartBoxState = 0;
//Preferences.CategoryMenuState = 1;
//Preferences.PageSize = 2;

//this is for cart load messaging
var itemsNotAdded = "These item(s) were not added to cart because \nthere is a discontinued date and no quantity to sell: \n";
var itemsNotAddedFlg = false;

function getAbsoluteUrl(path) {
    return window.location.protocol + "//" + window.location.host + path;
}

ko.validation.configure({
    registerExtenders: true,
    messagesOnModified: true,
    insertMessages: true,
    parseInputAttributes: true,
    messageTemplate: null
});


var defaultHandler = function (jqXHR, textStatus, errorThrown) {
    Loading(false);
    var data = JSON.parse(jqXHR.responseText);
    if (data && data.Url) {
        window.location = data.url;
    }
    else if (data && data.Messages) {
        var messageText = "";
        for (var i = 0; i < data.Messages.length; i++) {
            messageText += (data.Messages[i].Message + "\n");
        }
        confirmationDialog("Error", messageText, null, null);
    } else {
        confirmationDialog("Error", textStatus + ": " + errorThrown, null, null)
    }
};

$(function () {

    $.ajaxSetup({
        'type': 'POST',
        'accepts': 'application/json',
        'contentType': 'application/json',
        'error': function (jqXHR, textStatus, errorThrown) {
            Loading(false);
            if (this[jqXHR.status]) {
                this[jqXHR.status](jqXHR, textStatus, errorThrown);
            }
            else {
                // No handlers were found, handle the situation in a global manner here
            }
        },
        '401': defaultHandler,
        '403': defaultHandler,
        '500': defaultHandler
    });
});

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function InitButtons() {
    $("input.marksButton").each(function (index, element) {
        $(element).button();
    });
}
function InitSliders() {
    $("div.slider").each(function (index, element) {
        $(element).slider();
    });
}
var ACTIVE_SPINNER_COUNT = 0;
function Loading(show) {
    if (show) {
        $("#loading_dialog").loading("loadStart");
        ACTIVE_SPINNER_COUNT++;
    } else {
        ACTIVE_SPINNER_COUNT--;

        //just in case.  Sometimes count gets off and this just continues to go more and more
        //negative.  So now we just set to zero which will turn off spinner.
        //This should fix the occational endless spinner.
        if (ACTIVE_SPINNER_COUNT < 0) {
            ACTIVE_SPINNER_COUNT = 0;
        }

        if (ACTIVE_SPINNER_COUNT == 0) {
            $("#loading_dialog").loading("loadStop");
        }
    }
}

function UIMessage(data) {
    var self = this;
    self.IsError = ko.observable(data.IsError);
    self.Message = ko.observable(data.Message);
    self.RedirectURL = ko.observable(data.RedirectURL);
}

function UIMessageViewModel(data) {
    var self = this;
    self.UIMessagList = ko.observableArray(new Array());
    if (data) {
        for (var i = 0; i < data.length; i++) {
            self.UIMessagList.push(new UIMessage(data[i]));
        }
    }
}

function confirmationDialog(dialogTitle, dialogText, okFunction, cancelFunction) {
    var $dialogDiv = $("#confirmationDialog");
    $dialogDiv.attr("title", dialogTitle);
    $dialogDiv.html("<p><span class='ui-icon ui-icon-alert' style='float:left; margin:0 7px 20px 0;'></span>" + dialogText + "</p>");
    var dialogConfig = {
        resizable: false,
        height: 240,
        modal: true,
        buttons: {
            "OK": function () {
                $(this).dialog("close");
                if (okFunction !== null) {
                    okFunction();
                }
            }
        }
    };
    if (cancelFunction !== null) {
        dialogConfig.buttons.Cancel = function () {
            $(this).dialog("close");
            if (cancelFunction !== null) {
                cancelFunction();
            }
        };
    }
    $dialogDiv.dialog(dialogConfig);
    $dialogDiv.dialog('open');
}

function ieCheck() {
    var ms_ie = false;
    var ua = window.navigator.userAgent;
    var old_ie = ua.indexOf('MSIE ');
    var new_ie = ua.indexOf('Trident/');

    if ((old_ie > -1) || (new_ie > -1)) {
        ms_ie = true;
    }

    if (ms_ie) {
        //IE specific code goes here
        alert('Markspp.com is optimized to work with Google Chrome Browser.  Please restart with that browser.');
    }
    else {
        //This means that NOT ie.
        //alert('browser is NOT IE');
    }
}

function PasswordMeter(data) {
    var self = this;
    var passwordRequiredPattern = new RegExp(data.PasswordRequiredPattern);
    var forbiddenPasswordCharPattern = new RegExp(data.ForbiddenPasswordCharPattern);

    self.PasswordRequirementsText = ko.observable("Your password must be 6-20 characters in length and contain at least 1 number, 1 uppercase letter, 1 lowercase letter and cannot contain a ';' or '%' character.");
    self.PasswordCSS = ko.observable();
    self.PasswordMeterText = ko.observable();

    self.PreventPaste = function (data, event) {
        event.preventDefault();
    }

    self.CheckPasswordStrength = function (data, event) {
        var newValue = event.currentTarget.value;
        if (newValue.length == 0) {
            self.PasswordCSS("hidden");
            self.PasswordMeterText("");
        }
        else {
            //should only show valid / invalid after the minimum character length is achieved
            if (forbiddenPasswordCharPattern.test(newValue)) {

                if (newValue.length <= 1) {
                    event.currentTarget.value = "";
                } else {
                    var oCurrentValue = event.currentTarget.value;
                    event.currentTarget.value = oCurrentValue.substr(0, oCurrentValue.length - 2);
                }
                //alert("The ';' and '%' characters cannot be used in your password.");
            }
            else if (passwordRequiredPattern.test(newValue) && newValue.length >= 6) {
                self.PasswordCSS("strong passwordmeter");
                self.PasswordMeterText("Password Valid");
            }
            else if (newValue.length < 6) {
                //do nothing
                self.PasswordMeterText("");
            }
            else {
                self.PasswordCSS("veryweak passwordmeter");
                self.PasswordMeterText("Password Invalid");
            }
        }
    }
}

function CartItem(data, parent) {
    var self = this;
    var _selected = ko.observable(false);
    self.UIMessages = new UIMessageViewModel();
    self.IsFavoritesCartItem = ko.observable(false);
    self.CartItemId = data.CartItemId || -1;
    self.CartId = data.CartId || -1;
    self.PartDetailId = data.PartDetailId || -1;
    self.PartNumber = data.PartNumber || "";
    self.Description = data.Description || "";
    self.UnitPrice = ko.observable(data.UnitPrice || 0.0).extend({ numeric: 2 });
    self.UnitWeight = data.UnitWeight || 0.0;
    self.CommissionRate = data.CommissionRate || 0.0;
    self.ImageName = data.ImageName || "";
    self.ImagePath = ko.computed(function () {
        return "/Content/Images/Catalog/" + self.ImageName;
    });
    self.ThumbnailImagePath = ko.computed(function () {
        return "/Content/Images/Catalog/thumbs/" + self.ImageName;
    });
    self.FingernailImagePath = ko.computed(function () {
        return "/Content/Images/Catalog/fingers/" + self.ImageName;
    });
    self.Quantity = ko.observable(data.Quantity || 1).extend({ required: true, number: true, min: 1 });
    self.TableRowId = ko.computed(function () {
        return self.CartId + "-item-" + self.CartItemId;
    });
    self.ExtendedPrice = ko.computed(function () {
        var extPrice = self.Quantity() * self.UnitPrice();
        return toNumeric(extPrice, 2);
    });
    self.ViewDetailRoute = ko.computed(function () {
        return "/Catalog/Detail/" + self.PartDetailId;
    });
    self.QtyAvailable = ko.observable(data.QuantityAvailable || 0);
    self.CanWeSell = ko.observable(data.CanWeSell || 0);
    self.IsBuyBoardPart = ko.observable(data.IsBuyBoardPart || false);
    self.AvailabilityImagePath = ko.computed(function () {
        if (self.QtyAvailable() > 0) {
            return "/Content/images/check.png";
        }
        else {
            return "/Content/images/x.gif";
        }
    });
    self.Selected = ko.computed({
        read: function () {
            return _selected();
        },
        write: function (value) {

            var selected = _selected();
            if (value != selected) {
                if (value) {
                    $("tr#" + self.TableRowId()).addClass("selected");
                } else {
                    $("tr#" + self.TableRowId()).removeClass("selected");
                }
                _selected(value);
            }
        },
        owner: self
    });

    self.Select = function () {
        var selected = self.Selected();
        self.Selected(!selected);
    }

    self.toCartItemModel = function () {
        return {
            CartItemId: self.CartItemId,
            CartId: self.CartId,
            PartDetailId: self.PartDetailId,
            PartNumber: self.PartNumber,
            Description: self.Description,
            UnitPrice: self.UnitPrice,
            UnitWeight: self.UnitWeight,
            CommissionRate: self.CommissionRate,
            ImageName: self.ImageName,
            Quantity: self.Quantity(),
            CanWeSell: self.CanWeSell(),
            IsBuyBoardPart: self.IsBuyBoardPart()
        };
    }

    self.errors = ko.validation.group([self.Quantity]);

    self.Save = function () {
        self.UIMessages.UIMessagList.removeAll();
        if (self.errors().length == 0) {
            var data = self.toCartItemModel();
            $.ajax({
                type: "POST",
                url: "/ShoppingCart/UpdateCartItem",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == true) {
                        for (var i = 0; i < response.Messages.length; i++) {
                            self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                        }

                    }
                    if (response.Success == false) {
                        for (var i = 0; i < response.Messages.length; i++) {
                            self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                        }
                    }
                }
            });
        } else {
            self.errors.showAllMessages();
        }
    }

    self.IsAvailableForPurchase = ko.computed(function () {
        return self.UnitPrice() > 0;
    });
}

//new web promo code 
function WebPromoCode(data, parent) {
    var self = this;
    self.UIMessages = new UIMessageViewModel();
    self.PromoCodeId = data.PromoCodeId || -1;
    self.CartId = data.CartId || -1;
    self.FlyerId = data.FlyerId || -1;
    self.FlyerCode = data.FlyerCode || "";
    self.PromoCodeVal = data.PromoCodeVal || "";
    self.IsValid = data.IsValid || false;
    self.IsApplicable = data.IsApplicable || false;


    self.toWebPromoCodeModel = function () {
        return {
            PromoCodeId: self.PromoCodeId,
            CartId: self.CartId,
            FlyerId: self.FlyerId,
            FlyerCode: self.FlyerCode,
            PromoCodeVal: self.PromoCodeVal,
            IsValid: self.IsValid,
            IsApplicable: self.IsApplicable
        };
    }

    self.PromoCodeSave = function () {
        self.UIMessages.UIMessagList.removeAll();
        if (self.errors().length == 0) {
            var data = self.toPromoCodeModel();
            $.ajax({
                type: "POST",
                url: "/ShoppingCart/UpdatePromoCode",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == false) {
                        for (var i = 0; i < response.Messages.length; i++) {
                            self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                        }
                    }
                }
            });
        } else {
            self.errors.showAllMessages();
        }
    }


}

WebPromoCode.InitFromCode = function (data, aParent) {
    var PromoCodeData = {
        PromoCodeId: -1,
        CartId: -1,
        FlyerId: -1,
        FlyerCode: "",
        PromoCodeVal: data,
        IsValid: false,
        IsApplicable: false
    };
    return new WebPromoCode(PromoCodeData, aParent);
    //return new PromoCode(PromoCodeData, aParent);
}

//this is old now   vvv
function PromoCode(data, parent) {
    var self = this;
    self.UIMessages = new UIMessageViewModel();
    self.PromoCodeId = data.PromoCodeId || -1;
    self.CartId = data.CartId || -1;
    self.FlyerId = data.FlyerId || -1;
    self.FlyerCode = data.FlyerCode || "";
    self.PromoCode = data.PromoCode || "";
    self.IsValid = data.IsValid || false;
    self.IsApplicable = data.IsApplicable || false;


    self.toPromoCodeModel = function () {
        return {
            PromoCodeId: self.PromoCodeId,
            CartId: self.CartId,
            FlyerId: self.FlyerId,
            FlyerCode: self.FlyerCode,
            PromoCode: self.PromoCode,
            IsValid: self.IsValid,
            IsApplicable: self.IsApplicable
        };
    }

    self.Save = function () {
        self.UIMessages.UIMessagList.removeAll();
        if (self.errors().length == 0) {
            var data = self.toPromoCodeModel();
            $.ajax({
                type: "POST",
                url: "/ShoppingCart/UpdatePromoCode",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == false) {
                        for (var i = 0; i < response.Messages.length; i++) {
                            self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                        }
                    }
                }
            });
        } else {
            self.errors.showAllMessages();
        }
    }


}

PromoCode.InitFromCode = function (data, aParent) {
    var PromoCodeData = {
        PromoCodeId: -1,
        CartId: -1,
        FlyerId: -1,
        FlyerCode: "",
        PromoCode: data,
        IsValid: false,
        IsApplicable: false
    };
    return new PromoCode(PromoCodeData, aParent);
}
//this is old now ^^^


function CartViewModel(data) {
    var self = this;
    var _IsFavoritesCart = ko.observable(false);
    self.UIMessages = new UIMessageViewModel();
    self.UserId = ko.observable(data.UserId);
    self.CartId = ko.observable(data.CartId);
    self.CartName = ko.observable(data.CartName);
    self.CartType = ko.observable(data.CartType);
    self.CartItems = ko.observableArray([]);
    self.AssignedPromoCode = ko.observable(data.WebPromoCode || "");

    //self.CurrentPromoCode = ko.observable("");
    self.CurrentPromoCode = ko.observable();
    var _dummyObservable = ko.observable();

    //this will retrieve the promo code
    var GetPromoCodeVal = function () {
        //try to get from DB
        _dummyObservable();
        var output = "";

        $.ajax({
            type: "POST",
            url: "/Account/GetPromoCodeVal",
            data: JSON.stringify({ id: 0 }),
            contentType: "application/json; charset=utf-8"
            , success: function (response) {
                self.CurrentPromoCode(response.Data);
            }
            , error: function (response) {
                output = "";
            }
        });
        self.CurrentPromoCode(output);
    };
    self.RunThis = ko.computed(function () {
        GetPromoCodeVal();
    });

    //this is the observable which will make button enabled or disabled
    self.pcApplyEnabled = ko.observable(false);
    //this is the logic which sets the pcApplyEnabled observable.
    self.pcApplyBtn = function (data, event) {
        var pcVal = $('#promoCodeText');
        var val = pcVal[0].value;

        if (val.length > 0) {
            self.pcApplyEnabled(true);
        }
        else {
            self.pcApplyEnabled(false);
            return false;
        }
        return true;
    }


    self.ShowAvailability = ko.observable(false);
    self.ReadOnly = ko.observable(false);
    self.SalesTaxRate = ko.observable(data.SalesTaxRate || 0);
    self.IsFreightTaxable = ko.observable(data.IsFreightTaxable);
    self.IsSalesTaxable = ko.observable(data.IsSalesTaxable);
    self.FreightCharges = ko.observable(data.FreightCharges || 0);
    self.ShippingMethodId = ko.observable(data.ShippingMethodId || 0);
    self.CheckoutEnabled = ko.observable(false);
    self.CartItems.subscribe(function (changes) {
        if (self.CartItems().length > 0) {
            self.CheckoutEnabled(true);
        } else {
            self.CheckoutEnabled(false);
        }
    })
    self.SelectAll = ko.computed({
        read: function () {
            for (var i = 0; i < self.CartItems().length; i++) {
                if (self.CartItems()[i].Selected() == false) {
                    return false;
                }
            }
            return true;
        },
        write: function (newValue) {
            for (var i = 0; i < self.CartItems().length; i++) {
                self.CartItems()[i].Selected(newValue);
            }
        }
    });

    self.IsFavoritesCart = ko.computed({
        read: function () {
            return _IsFavoritesCart()
        },
        write: function (newValue) {
            _IsFavoritesCart(newValue);
            for (var i = 0; i < self.CartItems().length; i++) {
                self.CartItems()[i].IsFavoritesCartItem(newValue);
            }
        }
    });

    var calculateSubTotal = function () {
        var output = 0;

        for (var i = 0; i < self.CartItems().length; i++) {
            var item = self.CartItems()[i];
            var extendedPrice = parseFloat(item.ExtendedPrice());
            output += extendedPrice;
        }
        return output;
    };

    self.SubTotal = ko.computed(function () {

        var output = calculateSubTotal();
        return toNumeric(output, 2);
    });

    self.SalesTaxAmount = ko.computed(function () {
        if (self.IsSalesTaxable() == false) {
            return toNumeric(0.00, 2);
        }
        var subTotal = calculateSubTotal();
        return toNumeric(subTotal * self.SalesTaxRate(), 2);
    });
    self.FreightTaxAmount = ko.computed(function () {
        if (self.IsFreightTaxable() == false) {
            return toNumeric(0.00, 2);
        }
        return toNumeric(self.FreightCharges() * self.SalesTaxRate(), 2);
    });
    self.DocumentTotal = ko.computed(function () {
        var subTotal = calculateSubTotal();
        var tot = subTotal + (subTotal * self.SalesTaxRate()) + self.FreightCharges() + (self.FreightCharges() * self.SalesTaxRate());
        return toNumeric(tot, 2);
    });


    var AddItem = function (data) {
        self.CartItems.remove(function (currItem) {
            return currItem.PartNumber == data.PartNumber;
        });
        var newItem = new CartItem(data, self);
        if (self.IsFavoritesCart == true) {
            newItem = newItem;
            newItem.IsFavoritesCartItem(self.IsFavoritesCart());
        }

        //now check to see if cart item can be added
        //this check is based on discontinued date and quantity available to sell
        if (newItem.CanWeSell() == true) {
            //we should be able to sell this item

            // Check for BuyBoard Lockoutr
            self.CartItems.push(newItem);


        }
        else {
            //cannot add item to cart, so add to message
            itemsNotAdded = itemsNotAdded + newItem.PartNumber + ", ";
            itemsNotAddedFlg = true;

            //after adding part number to message now remove part from shopping cart DB table.
            //This way message showing which parts have not been added to cart does not keep
            //appearing when every page is loaded.
            self.RemoveItem(newItem);
        }
        return newItem;
    }

    self.toShoppingCartModel = function () {
        try {
            var data = {
                UserId: self.UserId(),
                CartId: self.CartId(),
                CartName: self.CartName(),
                CartType: self.CartType(),
                CartItems: new Array(),
                AssignedPromoCode: self.AssignedPromoCode
            }

            for (var i = 0; i < self.CartItems().length; i++) {
                data.CartItems[i] = self.CartItems()[i].toCartItemModel();
            }

        }
        catch (exx) {
            var msg1 = exx.message;
            throw exx;
        }

        return data;
    }

    self.QuickAddItem = function () {
        if (self.QuickAddErrors().length == 0) {
            self.AddItem({ PartNumber: self.QuickAddPartNumber(), Quantity: self.QuickAddQuantity() });
        } else {
            self.QuickAddErrors.showAllMessages();
        }
    }
    self.AddItem = function (data) {
        self.UIMessages.UIMessagList.removeAll();
        var item = {};
        if (isFunction(data)) {
            item = data();
        }
        else {
            item = data;
        }
        item.CartId = self.CartId();
        $.ajax({
            type: "POST",
            url: "/ShoppingCart/AddCartItem",
            data: JSON.stringify(item),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success) {
                    AddItem(response.Data);
                } else {
                    if (response.Messages != null) {
                        for (var i = 0; i < response.Messages.length; i++) {
                            self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                        }
                    }
                }
            }
        });
    }
    self.RemoveItem = function (data) {
        self.UIMessages.UIMessagList.removeAll();
        var item = {};
        if (isFunction(data)) {
            item = data();
        }
        else {
            item = data;
        }
        item.CartId = self.CartId();
        $.ajax({
            type: "POST",
            url: "/ShoppingCart/RemoveCartItem",
            data: JSON.stringify(item),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success) {
                    self.CartItems.remove(data);
                } else {
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }
            }
        });

    }

    var UpdateItems = function (data) {
        self.CartItems.removeAll();
        for (var i = 0; i < data.length; i++) {
            AddItem(data[i]);
        }
    }

    self.PromotionCodeMessages = new UIMessageViewModel();
    self.ApplyPromotionCode = function () {
        var newPromoCode = WebPromoCode.InitFromCode($("#promoCodeText").val().toUpperCase(), self);


        newPromoCode.CartId = self.CartId;
        self.AssignedPromoCode = newPromoCode;

        self.PromotionCodeMessages.UIMessagList.removeAll();

        //var tt = JSON.stringify(self.toShoppingCartModel())


        $.ajax({
            type: "POST",
            url: "/Checkout/ApplyPromotionCode",
            data: JSON.stringify(self.toShoppingCartModel()),
            //data: tt,
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success) {
                    //setting this will refresh promo code to current screen.
                    self.CurrentPromoCode(response.Data.AssignedPromoCode.PromoCodeVal);

                    //blank out the text box if the code was valid
                    $("#promoCodeText").val("");
                    self.pcApplyEnabled(false);

                    UpdateItems(response.Data.CartItems);
                } else {
                    self.AssignedPromoCode = null;

                    //blank out the text box if the code was invalid
                    $("#promoCodeText").val("");
                    self.pcApplyEnabled(false);
                }
                for (var i = 0; i < response.Messages.length; i++) {
                    self.PromotionCodeMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                }
            }
        });

    };
    self.SelectItem = function () {
        var selected = this.Selected();
        this.Selected(!selected);
    };

    self.DeleteSelected = function () {
        var itemsRemoved = self.CartItems.remove(function (item) {
            return item.Selected();
        });
        var data = ko.toJSON(itemsRemoved);
        $.ajax({
            type: "POST",
            url: "/ShoppingCart/RemoveCartItems",
            data: data,
            contentType: "application/json; charset=utf-8"
        });
    };

    self.PartLabelSelectorVisible = ko.observable(false);
    var PLSChanged = false;
    self.PartLabelSelectorClicked = function () {
        var visible = self.PartLabelSelectorVisible();
        self.PartLabelSelectorVisible(!visible);
    }
    self.PartLabelSelectorSelected = function (sender) {
        self.PartLabelSelectorVisible(false);
    }

    self.QuickAddQuantity = ko.observable().extend({ required: true, number: true, min: 1 });
    self.QuickAddPartNumber = ko.observable().extend({ required: true, digit: true, MinLength: 5, MaxLength: 5 });
    self.QuickAddErrors = ko.validation.group([self.QuickAddQuantity, self.QuickAddPartNumber]);

    //this will initially load items to cart upon login,  maybe more....
    itemsNotAddedFlg = false;
    for (var i = 0; i < data.CartItems.length; i++) {
        AddItem(data.CartItems[i], self);
    }

    if (itemsNotAddedFlg == true) {
        var res = itemsNotAdded.substr(0, itemsNotAdded.length - 2);        //remove the last comma
        alert(res);
    }
}

function CatalogMenuItem(data, parent) {
    var self = this;
    self.Text = ko.observable(data.Text).extend({ camelCase: null });
    self.Id = data.Id;
    self.SubMenuItems = new Array();

    for (var i = 0; i < data.SubMenuItems.length; i++) {
        self.SubMenuItems[i] = new CatalogMenuItem(data.SubMenuItems[i], self);
    }
}

function CatalogMenuViewModel(data) {
    var self = this;
    self.Items = new Array();
    self.ItemClicked = function () {
        window.location.href = "/Catalog/Browse/" + this.Id;
    }
    for (var i = 0; i < data.Items.length; i++) {
        self.Items[i] = new CatalogMenuItem(data.Items[i], self);
    }
}
function AddressViewModel(data, parent) {
    var self = this;
    self.CompanyName = ko.observable(data.CompanyName || "");
    self.Attention = ko.observable(data.Attention || "");
    self.Street1 = ko.observable(data.Street1 || undefined).extend({ required: true });
    self.Street2 = ko.observable(data.Street2 || "");
    self.Number = ko.observable(data.Number || 0);
    self.Direction = ko.observable(data.Direction || "");
    self.Suite = ko.observable(data.Suite || "");
    self.City = ko.observable(data.City || undefined).extend({ required: true });
    self.State = ko.observable(data.State || undefined).extend({ required: true });
    self.StateAbbreviation = ko.observable(data.StateAbbreviation || "");
    self.Zip = ko.observable(data.Zip || undefined).extend({ required: true, minLength: 5, maxLength: 10 });
    self.PhoneNumber = ko.computed(function () {
        if (data.PhoneNumber !== null && typeof data.PhoneNumber !== 'undefined') {
            return data.PhoneNumber.substring(0, 3) + "-" + data.PhoneNumber.substring(3, 6) + "-" + data.PhoneNumber.substring(6);
        } else {
            return "";
        }
    });
    self.Extension = ko.observable(data.Extension || "");
    self.FaxNumber = ko.observable(data.FaxNumber || "");
    self.IsVerified = ko.observable(data.IsVerified || false);
    self.CityStateZip = ko.computed(function () {
        return self.City() + " " + self.StateAbbreviation() + " " + self.Zip();
    });
    self.errors = ko.validation.group(self);
}
function UserAccountViewModel(data) {
    var self = this;
    var _dummyObservable = ko.observable();


    self.UserId = ko.observable(data.UserId || -1);
    self.UserName = ko.observable(data.UserName || "");
    self.CustomerId = ko.observable(data.CustomerId || -1);
    self.CustomerNumber = ko.observable(data.CustomerNumber || "");
    self.CompanyNameShow = ko.observable("");
    self.FirstName = ko.observable(data.FirstName || "");
    self.LastName = ko.observable(data.LastName || "");
    self.FullName = ko.computed(function () {
        return self.FirstName() + " " + self.LastName();
    });
    self.PhoneNumber = ko.computed(function () {
        if (data.PhoneNumber !== null && typeof data.PhoneNumber !== 'undefined') {
            return data.PhoneNumber.substring(0, 3) + "-" + data.PhoneNumber.substring(3, 6) + "-" + data.PhoneNumber.substring(6);
        } else {
            return "";
        }
    });
    self.EmailAddress = ko.observable(data.EmailAddress || "");
    self.EmailVerifiedString = ko.observable(data.EmailVerifiedString || "false");
    self.IsCreditCardOnly = ko.observable(data.IsCreditCardOnly);
    self.IsOnCreditHold = ko.observable(data.IsOnCreditHold);
    self.IsPrepayRequired = ko.observable(data.IsPrepayRequired);
    //self.CategoryMenuState = ko.observable(data.CategoryMenuState || 1);
    //self.CartBoxState = ko.observable(data.CartBoxState || 1);
    self.CategoryMenuState = ko.observable(1 || 1);
    self.CartBoxState = ko.observable(1 || 1);
    self.PageSize = ko.observable(data.PageSize || 30)
    self.PasswordMeter = new PasswordMeter({
        PasswordRequiredPattern: data.PasswordRequiredPattern,
        ForbiddenPasswordCharPattern: data.ForbiddenPasswordCharPattern
    });
    self.OldPassword = ko.observable("");
    self.NewPassword = ko.observable("").extend({ required: true, minLength: 6, maxLength: 20, pattern: { params: data.PasswordRequiredPattern, message: self.PasswordMeter.PasswordRequirementsText() } });

    self.ExpandCollapseStates = data.ExpandCollapseStates;
    self.PageSizeOptions = data.PageSizeOptions;
    self.ShipToList = data.ShipToList;
    self.DefaultShipTo = ko.observable(data.DefaultShipTo || 0);
    self.SelectedShipToText = ko.observable("");

    //this will retrieve the company name 
    var GetCompanyName = function () {
        _dummyObservable();
        var defST = self.DefaultShipTo();
        var CompanyName = "";

        $.ajax({
            type: "POST",
            url: "/Account/GetCompanyName",
            data: JSON.stringify({ clId: defST }),
            contentType: "application/json; charset=utf-8"
            , success: function (response) {
                self.CompanyNameShow(response.Data);
            }
            , error: function (response) {
                self.CompanyNameShow("ERROR RETRIEVING COMPANY NAME.");
            }
        });
    };

    self.SelectedShipToAddress = ko.computed(function () {
        for (var i = 0; i < self.ShipToList.length; i++) {
            if (self.ShipToList[i].CustomerLocationId == self.DefaultShipTo()) {

                //setting ship to address at this point we need to load company name
                GetCompanyName();
                return new AddressViewModel(self.ShipToList[i].Address);
            }
        }
    });

    self.BillingAddress = new AddressViewModel(data.BillingAddress);

    var UpdateSelectedShipToText = function () {
        var selectedShipToId = self.DefaultShipTo();
        for (var i = 0; i < self.ShipToList.length; i++) {
            if (self.ShipToList[i].CustomerLocationId == selectedShipToId || selectedShipToId == 0) {
                self.SelectedShipToText(self.ShipToList[i].CustomerNumber);
            }
        }

    }



    self.ShipToDropDownVisible = ko.observable(false);
    var shipToChanged = false;
    self.ShipToDropDownClicked = function () {
        var visible = self.ShipToDropDownVisible();
        self.ShipToDropDownVisible(!visible);
    }
    self.ShipToSelected = function (sender) {
        if (self.DefaultShipTo() !== sender.CustomerLocationId) {
            shipToChanged = true;
        }
        self.ShipToDropDownVisible(false);
        self.DefaultShipTo(sender.CustomerLocationId);
        UpdateSelectedShipToText();

    }

    self.ChangePasswordMessages = new UIMessageViewModel();
    self.ChangePassword = function () {

        Loading(true);

        var model = {
            UserId: self.UserId(),
            NewPassword: self.NewPassword(),
            OldPassword: self.OldPassword()
        };

        //remove all message lists in the screen before we start
        self.SaveAccountInfoMessages.UIMessagList.removeAll();
        self.SaveDefaultsMessages.UIMessagList.removeAll();
        self.ChangePasswordMessages.UIMessagList.removeAll();


        $.ajax({
            type: "POST",
            url: "/Account/ChangePassword",
            data: JSON.stringify(model),
            contentType: "application/json; charset=utf-8"
			, success: function (response) {
			    for (var i = 0; i < response.Messages.length; i++) {
			        self.ChangePasswordMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
			    }
			    Loading(false);
			}
        });
    }

    self.SaveDefaultsMessages = new UIMessageViewModel();
    self.SaveDefaults = function () {

        Loading(true);

        var prefs = new Array();

        prefs[0] = {
            UserId: self.UserId(),
            PreferenceType: 0,
            PreferenceValue: self.CartBoxState()
        };
        prefs[1] = {
            UserId: self.UserId(),
            PreferenceType: 1,
            PreferenceValue: self.CategoryMenuState()
        };
        prefs[2] = {
            UserId: self.UserId(),
            PreferenceType: 2,
            PreferenceValue: self.PageSize()
        };


        //var tester = JSON.stringify(prefs);

        //remove all message lists in the screen before we start
        self.SaveAccountInfoMessages.UIMessagList.removeAll();
        self.SaveDefaultsMessages.UIMessagList.removeAll();
        self.ChangePasswordMessages.UIMessagList.removeAll();


        $.ajax({
            type: "POST",
            url: "/Account/UpdateWebsiteDefaults",
            data: JSON.stringify(prefs),
            contentType: "application/json; charset=utf-8"
			, success: function (response) {
			    for (var i = 0; i < response.Messages.length; i++) {
			        self.SaveDefaultsMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
			    }

			    Loading(false);
			}
        });
    }

    self.SaveAccountInfoMessages = new UIMessageViewModel();
    self.SaveAccountInfo = function () {

        Loading(true);

        var account = ko.toJSON(self);

        //remove all message lists in the screen before we start
        self.SaveAccountInfoMessages.UIMessagList.removeAll();
        self.SaveDefaultsMessages.UIMessagList.removeAll();
        self.ChangePasswordMessages.UIMessagList.removeAll();



        if (shipToChanged === true) {
            confirmationDialog("Change Default Ship To?", "Click OK to change default ship to or Cancel to abort.", function () {
                $.ajax({
                    type: "POST",
                    url: "/Account/UpdateAccountInformation",
                    data: account,
                    contentType: "application/json; charset=utf-8"
				, success: function (response) {
				    for (var i = 0; i < response.Messages.length; i++) {
				        self.SaveAccountInfoMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
				    }
				    
				    Loading(false);
				}
                });
            }, function () {
            });
        }
        else {
            $.ajax({
                type: "POST",
                url: "/Account/UpdateAccountInformation",
                data: account,
                contentType: "application/json; charset=utf-8"
				, success: function (response) {
				    for (var i = 0; i < response.Messages.length; i++) {
				        self.SaveAccountInfoMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
				    }

				    Loading(false);
				}
            });
        }
        shipToChanged = false;
    }



    UpdateSelectedShipToText();

    if (self.DefaultShipTo() == 0) {
        self.DefaultShipTo(self.ShipToList[0].CustomerLocationId);
    }
}

function AppViewModel(model) {
    var self = this;

    var HeaderMenu = $("ul#headermenu");
    var CatalogMenu = $("ul#catalogMenu");

    HeaderMenu.menu({
        position: {
            my: 'left top',
            at: 'left bottom'
        }

    });

    CatalogMenu.menu({
        position: {
            my: 'left top',
            at: 'right+3 top',
            collission: "fit"
        }
    });
    if (model.IsLoggedIn) {
        self.ShoppingCart = new CartViewModel(model.ShoppingCart);
    }
    self.CatalogMenu = new CatalogMenuViewModel(model.CatalogMenu);
    //self.SearchText = ko.observable().extend({ required: true, minLength: { params: 2, message: "Need to enter at least 2 characters to search." } });
    self.SearchText = ko.observable();
    self.IsLoggedIn = ko.observable(model.IsLoggedIn || false);
    self.RunInTestMode = ko.observable(model.RunInTestMode || false);
    self.LoginError = ko.observable(model.LoginError || false);
    self.ShowSideBar = ko.observable(model.ShowSideBar);


    //self.ShowCartPreview = ko.observable(model.CartBoxState);
    //self.ShowCatalogMenu = ko.observable(model.CategoryMenuState && self.CatalogMenu.Items.length > 0);
    self.ShowCartPreview = ko.observable(1);
    self.ShowCatalogMenu = ko.observable(1);

    self.ShowCartPreview.subscribe(function (newvalue) {
        $.ajax({
            type: "POST",
            url: "/Account/SetCartBoxState",
            data: JSON.stringify({ state: newvalue }),
            contentType: "application/json; charset=utf-8"
        });
    });

    self.ShowCatalogMenu.subscribe(function (newvalue) {
        $.ajax({
            type: "POST",
            url: "/Account/SetCategoryMenuState",
            data: JSON.stringify({ state: newvalue }),
            contentType: "application/json; charset=utf-8"
        });
    });

    self.ToggleCartPreview = function () {
        var currentState = self.ShowCartPreview();
        self.ShowCartPreview(!currentState);
    }
    self.ToggleCatalogMenu = function () {
        var currentState = self.ShowCatalogMenu();
        self.ShowCatalogMenu(!currentState);
    }

    self.BreadCrumbs = ko.observableArray();


    if (self.IsLoggedIn() == true) {
        self.UserAccount = new UserAccountViewModel(model.UserAccount);
        self.TriggerEmailVerification = function () {
            $.ajax({
                type: "POST",
                url: "/Account/TriggerEmailVerification",
                contentType: "application/json; charset=utf-8"
				, success: function (response) {
				    var title = response.Success == true ? "Success" : "Error";
				    var txt = response.Messages[0].Message;
				    confirmationDialog(title, txt, null, null);
				}
            });
        };
    }

    self.RecoverUser = ko.observable("Username");
    self.RecoverEmail = ko.observable("Email Address");

    self.RecoverPasswordMessages = new UIMessageViewModel();

    self.RecoverPasswordClick = function () {
        var model = {
            RecoveryValue: self.RecoverUser()
        };

        Loading(true);

        self.RecoverUsernameMessages.UIMessagList.removeAll();
        self.RecoverPasswordMessages.UIMessagList.removeAll();

            $.ajax({
                type: "POST",
                url: "/Account/RecoverPassword",
                data: JSON.stringify(model),
                contentType: "application/json; charset=utf-8"
                , success: function (response) {
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.RecoverPasswordMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                    Loading(false);

                }
            });

    }


    self.RecoverUsernameMessages = new UIMessageViewModel();
    self.RecoverUsernameClick = function () {
        var model = {
            RecoveryValue: self.RecoverEmail()
        };

        Loading(true);

        self.RecoverUsernameMessages.UIMessagList.removeAll();
        self.RecoverPasswordMessages.UIMessagList.removeAll();

            $.ajax({
                type: "POST",
                url: "/Account/RecoverUserName",
                data: JSON.stringify(model),
                contentType: "application/json; charset=utf-8"
                , success: function (response) {

                    for (var i = 0; i < response.Messages.length; i++) {
                        self.RecoverUsernameMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                    Loading(false);
                }
            });
    }

    self.LinkButtonClick = function (sender, event) {
        var btn = $(event.target);
        window.location.href = btn.attr("data-actionurl");
    }
    $("#loading_dialog").loading().loading("loadStop");
    for (var i = 0; i < model.BreadCrumbs.length; i++) {
        self.BreadCrumbs.push({ value: model.BreadCrumbs[i] });
    }
}
ko.bindingHandlers.stopBinding = {
    init: function () {
        return { controlsDescendantBindings: true };
    }
};

ko.virtualElements.allowedBindings['if'] = true;
window.vm = new AppViewModel(viewModel);
ko.applyBindings(vm);
InitButtons();
