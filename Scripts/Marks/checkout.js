// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//

ko.validation.rules['creditCard'] = {
    getValue: function (o) {
        return (typeof o === 'function' ? o() : o);
    },
    validator: function (val) {
        var self = this;

        var cctype = false;
        
        switch(val.substr(0,1)){
            case "3":
                cctype = "ae";
                break;
            case "4":
                cctype = "vc";
                break;
            case "5":
                cctype = "mc";
                break;
            case "6":
                cctype = "dc";
                break;

        }


        if (!cctype) return false;
        cctype = cctype.toLowerCase();

        if (val.length < 15) {
            return (false);
        }
        var match = cctype.match(/[a-zA-Z]{2}/);
        if (!match) {
            return (false);
        }

        var number = val;
        match = number.match(/[^0-9]/);
        if (match) {
            return (false);
        }

        var fnMod10 = function (number) {
            var doubled = [];
            for (var i = number.length - 2; i >= 0; i = i - 2) {
                doubled.push(2 * number[i]);
            }
            var total = 0;
            for (var i = ((number.length % 2) == 0 ? 1 : 0) ; i < number.length; i = i + 2) {
                total += parseInt(number[i]);
            }
            for (var i = 0; i < doubled.length; i++) {
                var num = doubled[i];
                var digit;
                while (num != 0) {
                    digit = num % 10;
                    num = parseInt(num / 10);
                    total += digit;
                }
            }

            if (total % 10 == 0) {
                return (true);
            } else {
                return (false);
            }
        }

        switch (cctype) {
            case 'dc':
            case 'vc':
            case 'mc':
            case 'ae':
                //Mod 10 check
                if (!fnMod10(number)) {
                    return false;
                }
                break;
        }
        switch (cctype) {
            case 'vc':
                if (number[0] != '4' || (number.length != 13 && number.length != 16)) {
                    return false;
                }
                break;
            case 'mc':
                if (number[0] != '5' || (number.length != 16)) {
                    return false;
                }
                break;

            case 'ae':
                if (number[0] != '3' || (number.length != 15)) {
                    return false;
                }
                break;
            case 'dc':
                if (number[0] != '6' || (number.length != 16)) {
                    return false;
                }
                break;
            default:
                return false;
        }

        return (true);
    },
    message: 'Card number not valid.'
};

ko.validation.registerExtenders();

function CreditCardModel(data) {
    var self = this;
    self.RowId = ko.observable(data.RowId || 0);
    self.ProfileName = ko.observable(data.ProfileName || "");
    self.CardType = ko.observable(data.CardType || "");
    self.CardNumber = ko.observable(data.CardNumber || "");
    self.ExpirationDate = ko.observable(data.ExpirationDate || "");
    self.NameOnCard = ko.observable(data.NameOnCard || "");
    self.Token = ko.observable(data.Token || "");
    self.MaskedCardNumber = ko.computed(function () {
        return "xxxx-xxxx-xxxx-" + self.CardNumber();
    });
    self.DisplayValue = ko.computed(function () {
        return self.ProfileName() + " " + self.MaskedCardNumber() + " " + self.CardType() + " " + self.ExpirationDate();
    });
}

function AddNewCardModel() {
    var self = this;
    self.Address1 = ko.observable("");
    self.Address2 = ko.observable("");
    self.CardNumber = ko.observable("").extend({ required: true,creditCard:true });;
    self.CustomerLocationId = ko.observable();
    self.CardType = ko.observable("");
    self.City = ko.observable("");
    self.CustomerNumber = ko.observable("");
    self.CVV2 = ko.observable("").extend({ required: true, minLength: 3, maxLength: 4  });;
    self.FirstName = ko.observable("").extend({ required: true });;
    self.LastName = ko.observable("").extend({ required: true });;
    self.ProfileName = ko.observable("").extend({ required: true });;
    self.State = ko.observable("");
    self.ZipCode = ko.observable("");
    self.ExpirationMonth = ko.observable(1);
    self.ExpirationYear = ko.observable(2014);
    
    self.CardExpirationDate = ko.computed(function () {
        var month = ("00" + self.ExpirationMonth().toString()).slice(-2);
        var year = self.ExpirationYear().toString().substr(2, 2);
        return month + year;
    });
    self.validationErrors = ko.validation.group([self.CardNumber, self.CVV2, self.FirstName, self.LastName, self.ProfileName]);
    self.Validate = function () {
        if (self.validationErrors().length > 0) {
            self.validationErrors.showAllMessages();
            return false;
        } else {
            return true;
        }
    }

}

function PaymentOptionsViewModel(data) {
    var self = this;
    self.NewCard = new AddNewCardModel();
    self.CreditCards = ko.observableArray(new Array());

    //added SelectedShipToID because causing a blow up
    self.SelectedShipToId = ko.observable(data.shipToId || 0);
    self.UIMessages = new UIMessageViewModel();
    self.CustomerLocationId = ko.observable(0);

    self.SelectedCardId = ko.observable();
    self.IsAddingNewCard = ko.observable(false);
    self.ShowAddingNewCard = function () {
        self.IsAddingNewCard(true);
    };

    self.PaymentMethods = ko.observableArray(data);
    self.SelectedPaymentMethodId = ko.observable(0);
    //self.SelectedPaymentMethodId.subscribe(function () {
    //    self.IsAddingNewCard(false);
    //});

    self.AddNewCard = function () {
        if (self.NewCard.Validate() === true) {
            self.IsAddingNewCard(false);
            Loading(true);
            var data = ko.toJSON(self.NewCard);
            self.UIMessages.UIMessagList.removeAll();
            $.ajax({
                type: "POST",
                url: "/Checkout/SaveCreditCard",
                data: data,
                contentType: "application/json; charset=utf-8"
                , success: function (response) {
                    if (response.Success == true) {
                        self.CreditCards.push(new CreditCardModel(response.Data));
                        self.NewCard = new AddNewCardModel();
                        self.SelectedCardId(response.Data.RowId);
                    }
                    else {
                        for (var i = 0; i < response.Messages.length; i++) {
                            self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                        }
                    }
                    Loading(false);
                }
            });
        }
    };
    self.SelectedPaymentMethodText = ko.computed(function () {
        var marksAcct = "Charge this order to my Mark's Credit Account";
        var creditCard = "Charge this order to my credit card.";
        if (self.SelectedPaymentMethodId() == 0 || self.SelectedPaymentMethodId() == 1) {
            return marksAcct;
        }
        return creditCard;

    });

}

function ShippingMethodModel(data) {
    var self = this;
    self.ShippingMethodId = ko.observable(data.ShippingMethodId || 0);
    self.ShipperServiceCode = ko.observable(data.ShipperServiceCode || "");
    self.Description = ko.observable(data.Description || "");
    self.TotalCharges = ko.observable(data.TotalCharges || 0.00);
    self.GuaranteedTransitDays = ko.observable(data.GuaranteedTransitDays || 0);
    self.DisplayValue = ko.computed(function () {
        return "$" + toNumeric(self.TotalCharges(),2) + " - " + self.Description();
    })
}


function CheckoutViewModel(data) {
    var self = this;
    self.CheckoutMode = ko.observable(data.CheckoutState.CheckoutMode);
    self.PORequired = ko.observable(data.CheckoutState.PORequired);
    self.CanCheckout = ko.observable(data.CheckoutState.CanCheckout);

    var submitOrderUrl = ko.computed(function () {
        if (self.CheckoutMode() === 2) {
            return "/Checkout/SubmitQuote";
        }
        else {
            return "/Checkout/SubmitOrder";
        }
    });
    self.SubmitButtonText = ko.computed(function () {
        if (self.CheckoutMode() === 2) {
            return "Submit Quote";
        }
        else {
            return "Submit Order";
        }
    });

    self.SubmitAllowed = ko.computed(function () {
        if (self.CheckoutMode() === 2)
        {
            return true;
        }
        else
        {
            if (self.CanCheckout()) {
                return true;
            }
            else
            {
                return false;
            }
        }
    });


   self.MonthList = ko.observableArray(new Array());
    self.YearList = ko.observableArray(new Array());
    for (var i = 1; i <= 12; i++) {
        self.MonthList.push({ Text: i.toString(), Value: i });
    }
    var currentYear = new Date().getFullYear();
    for (var i = currentYear; i <= currentYear + 10; i++) {
        self.YearList.push({ Text: i.toString(), Value: i });
    }

    self.StateList = ko.observableArray(data.CheckoutState.StateList);
    var getStateAbbr = function (id) {
        for (var i = 0; i < self.StateList().length; i++) {
            if (self.StateList()[i].State === id) {
                return self.StateList()[i].StateAbbreviation;
            }
        }
    }

    self.CustomerId = ko.observable(data.UserAccount.CustomerId);
    self.SelectedShipToId = ko.observable(data.UserAccount.DefaultShipTo || 0);
    self.PurchaseOrderNumber = ko.observable().extend({ required: { onlyIf: self.PORequired }, maxLength: 20 });


    //self.PurchaseOrderNumber = ko.observable();
    //self.PurchaseOrderNumber.extend({
    //    required: {
    //        message: "PO Number is required",
    //        onlyIf: self.PORequired
    //            //function () {
    //            //if (self.PORequired() === true) {
    //            //    return true;
    //            //}
    //            //else {
    //            //    return false;
    //            //}
    //            //return self.PORequired;
    //        //}
    //    }
    //});
    


    self.PurchaserFirstName = ko.observable(data.UserAccount.FirstName || "");
    self.PurchaserLastName = ko.observable(data.UserAccount.LastName || "");
    self.CheckoutStep = ko.observable(data.CheckoutState.CheckoutStep || 1);
    self.UIMessages = new UIMessageViewModel();
    self.StepChanged = function (event, ui) {
        var oldTabIndex = ui.oldTab.index();
        var newTabIndex = ui.newTab.index();
        self.CheckoutStep(newTabIndex + 1);

        var startIndex = newTabIndex + 1;
        if (self.CheckoutStep() == 5) {
            startIndex = 0;
        }
        for (var i = startIndex ; i < 5; i++) {
            $("#tabs").tabs("disable", i);
        }
        if (self.CheckoutStep() == 2) {
            self.GetShippingMethods();
        }
    };
    self.NextStep = function () {
        var tabs = $("#tabs").tabs('widget');
        tabs.tabs('enable', self.CheckoutStep());
        tabs.tabs("option", "active", self.CheckoutStep());
    }
    $('#tabs').tabs({
        disabled: [1, 2, 3, 4],
        activate: self.StepChanged
    });
    self.ShippingMethods = ko.observableArray(new Array());
    self.SelectedShippingMethodId = ko.observable(0);

    self.GetShippingMethods = function () {
        self.ShowFreeShippingMessage(false);
        Loading(true);
        var data = { shipToId: self.SelectedShipToId() };
        self.UIMessages.UIMessagList.removeAll();
        $.ajax({
            type: "POST",
            url: "/Checkout/GetFreightOptions",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8"
            , success: function (response) {
                if (response.Success == true) {
                    self.ShippingMethods.removeAll();
                    if (self.CheckoutMode() === 3) {
                        var id = self.SelectedShippingMethodId();
                        self.SelectedShippingMethodId(0);
                        for (var i = 0; i < response.Data.length; i++) {
                            var shippingMethod = new ShippingMethodModel(response.Data[i])
                            if (shippingMethod.ShippingMethodId() === id) {
                                shippingMethod.TotalCharges(self.FreightCharges());
                                self.ShippingMethods.push(shippingMethod);
                                self.SelectedShippingMethodId(id);
                                break;
                            }
                        }
                    }
                    else {
                        self.SelectedShippingMethodId(0);

                        for (var i = 0; i < response.Data.length; i++) {
                            self.ShippingMethods.push(new ShippingMethodModel(response.Data[i]));
                        }

                        var smId = 0;

                        if (response.Data.length > 0) {
                            var firstRcd = response.Data[0];
                            smId = firstRcd.ShippingMethodId;

                            //now set shipping method ID radio button to first record ID
                            self.SelectedShippingMethodId(smId);
                        }
                        else {
                            self.SelectedShippingMethodId(1);
                        }
                    }
                } else {
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }
                if(self.ShippingMethods().length===0){
                    self.ShowFreeShippingMessage(true);
                }
                Loading(false);
            }
        });
    }
    self.PaymentOptions = new PaymentOptionsViewModel(data.CheckoutState.PaymentOptions);
    
    self.FreightCharges = ko.observable(0);
    self.SelectedShippingMethodId.subscribe(function (newValue) {
        if (newValue === 0) {
            return;
        }
        for (var i = 0; i < self.ShippingMethods().length; i++) {
            if (newValue == self.ShippingMethods()[i].ShippingMethodId()) {
                self.FreightCharges(self.ShippingMethods()[i].TotalCharges());
                break;
            }
        }
    });

    self.ShowFreeShippingMessage = ko.observable(false);

    self.PaymentOptions.SelectedCardId(0);
    self.PaymentOptions.CustomerLocationId(self.SelectedShipToId());
    if (data.CheckoutState.CreditCards.length > 0) {
        for (var i = 0; i < data.CheckoutState.CreditCards.length; i++) {
            var card = new CreditCardModel(data.CheckoutState.CreditCards[i]);
            self.PaymentOptions.CreditCards.push(card);
        }
        self.PaymentOptions.SelectedCardId(self.PaymentOptions.CreditCards()[0].RowId());
    }

    self.BackorderOptions = ko.observableArray(data.CheckoutState.BackorderOptions || new Array());
    self.SelectedBackorderOption = ko.observable(0);
    self.SelectedBackorderOptionText = ko.computed(function () {
        for (var i = 0; i < self.BackorderOptions().length; i++) {
            if (self.BackorderOptions()[i].Value == self.SelectedBackorderOption()) {
                return self.BackorderOptions()[i].Text;
            }
        }
        return "";
    });


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

    if (self.CheckoutMode() === 2) {
        //quote mode
        confirmationDialog("Create Quote", "In order to create a quote you need to complete the quote checkout process.", null, null);
    }

    if (self.CheckoutMode() === 3) {
        self.FreightCharges(data.ShoppingCart.FreightCharges);
        self.SelectedShippingMethodId(data.ShoppingCart.ShippingMethodId);
    }
    
    self.step4ValidationErrors = ko.validation.group([self.PurchaseOrderNumber]);
    self.step4Valid = function () {
        if (self.step4ValidationErrors().length > 0) {
            self.step4ValidationErrors.showAllMessages();
            return false;
        } else {
            return true;
        }
    }

    self.SubmitOrder = function () {
        if (self.step4Valid()===true) {
            Loading(true);
            var data = {
                CustomerId: self.CustomerId(),
                CustomerLocationId: self.SelectedShipToId(),
                PaymentMethodId: self.PaymentOptions.SelectedPaymentMethodId(),
                CreditCardId: self.PaymentOptions.SelectedPaymentMethodId() == 0 ? -1 : self.PaymentOptions.SelectedCardId(),
                PurchaseOrderNumber: self.PurchaseOrderNumber(),
                BackorderOptionId: self.SelectedBackorderOption(),
                FirstName: self.PurchaserFirstName(),
                LastName: self.PurchaserLastName(),
                DocumentTotal: checkoutModel.ShoppingCart.DocumentTotal,
                SubTotal: checkoutModel.ShoppingCart.SubTotal,
                FreightChargeAmount: self.FreightCharges(),
                IsFreightTaxable: checkoutModel.ShoppingCart.IsFreightTaxable,
                FreightTaxAmount: checkoutModel.ShoppingCart.FreightTaxAmount,
                IsSalesTaxable: checkoutModel.ShoppingCart.IsSalesTaxable,
                SalesTaxRate: checkoutModel.ShoppingCart.SalesTaxRate,
                SalesTaxAmount: checkoutModel.ShoppingCart.SalesTaxAmount,
                ShippingMethodId: self.SelectedShippingMethodId(),
                LabelSize: self.LabelSize()
            };

            $.ajax({
                type: "POST",
                url: submitOrderUrl(),
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8"
                , success: function (response) {
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                    Loading(false);
                    self.NextStep();
                }
            });
        }
    }



    //----------------------------------------------------------------------------------------------
    //add for labels on checkout
    self.RadioFreeLabel = ko.observable("No");      //defaults radio button to No when page loaded
    //self.LabelSize = ko.observable(0);               //keeps track of page size for later use, starts at 0
    self.LabelSize = ko.observable().extend({ required: { onlyIf: function () { return self.RadioFreeLabel() === "Yes"; } } });

    //when image is clicked go here.
    self.fireEvent = function (newValue) {
        //set new labelsize on click
        self.LabelSize(newValue);
    };
    //----------------------------------------------------------------------------------------------



    self.PaymentOptionsComplete = ko.computed(function() {
        var rtval = false;

        //this will make sure that label size is selected if click want labels
        if (self.RadioFreeLabel() === 'Yes') {

            if (self.LabelSize() <= 0 || self.LabelSize() === undefined) {
                //alert('tried to skip out on size selection');
                //selected 'Yes' for labels but no size yet.
                self.LabelSize(0);
                return false;
            }
        }
        else {
            //if we click 'No' then reset LabelSize to 0
            self.LabelSize(0);
        }

        if (self.PaymentOptions.SelectedPaymentMethodId() == 0 || self.PaymentOptions.SelectedPaymentMethodId()==1){
            rtval = true;
        } else if (self.PaymentOptions.SelectedPaymentMethodId() == 2){
            if(self.PaymentOptions.SelectedCardId()>0){
                rtval = true;
            }
        }
        return rtval;
    });

}

$(function () {
    if (window.checkoutModel != undefined) {
        window.vm.Checkout = new CheckoutViewModel(checkoutModel);
        window.vm.Checkout.CheckoutStep.subscribe(function (newvalue) {
            if (newvalue == 1) {
                window.vm.ShoppingCart.ReadOnly(false);
            } else if (newvalue == 4) {
                window.vm.ShoppingCart.ReadOnly(true);
            }
        })
        window.vm.ShoppingCart.ShowAvailability(true);
        if (window.vm.UserAccount.IsCreditCardOnly() == true) {
            window.vm.Checkout.PaymentOptions.SelectedPaymentMethodId(2);
        }
        window.vm.Checkout.FreightCharges.subscribe(function (newValue) {
            $.ajax({
                type: "POST",
                url: "/ShoppingCart/ApplyFreightChargesToCart",
                data: JSON.stringify({ amount: newValue, shippingMethodId: window.vm.Checkout.SelectedShippingMethodId() }),
                contentType: "application/json; charset=utf-8"
                , success: function (response) {
                    if (response.Success == true) {
                        window.vm.ShoppingCart.FreightCharges(newValue);
                        window.vm.ShoppingCart.ShippingMethodId(window.vm.Checkout.SelectedShippingMethodId());
                    }
                }
            });
        });
        //window.vm.Checkout.PurchaseOrderNumber.extend({
        //    required: {
        //        message: "PO Number is required",
        //        onlyIf: function () {
        //            if (window.vm.Checkout.PORequired() === true) {
        //                //self.PurchaseOrderNumber() = true;
        //                return true;
        //            }
        //            else {
        //                //self.PurchaseOrderNumber() = false;
        //                return false;
        //            }
        //        }
        //    }
        //});
        ko.applyBindings(vm, document.getElementById("checkoutDiv"));
        InitButtons();
    }
});