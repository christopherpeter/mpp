// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//

function RegistrationViewModel(data) {
    var self = this;

    self.UIMessages = new UIMessageViewModel();

    self.IsExistingCustomer = ko.observable(data.IsExistingCustomer || false);
    self.IsExistingCustomer.ForEditing = ko.computed({
        read: function () {
            return self.IsExistingCustomer().toString();
        },
        write: function (newValue) {
            self.IsExistingCustomer(newValue === "true");
        },
        owner: self
    });
    
    self.PasswordMeter = new PasswordMeter({
        PasswordRequiredPattern: data.PasswordRequiredPattern,
        ForbiddenPasswordCharPattern : data.ForbiddenPasswordCharPattern
    });
    
    self.AllowNewCustomers = ko.observable(data.AllowNewCustomers || false);    
    self.CustomerNumber = ko.observable().extend({ required: true, minLength: 6, maxLength: 12 });
    self.BillingZipCode = ko.observable().extend({ required: true, minLength: 5, maxLength: 5 });
    self.FirstName = ko.observable().extend({ required: true });
    self.LastName = ko.observable().extend({ required: true });
    self.UserName = ko.observable().extend({ required: true, minLength: 2, maxLength: 24 });
    self.Password = ko.observable().extend({ required: true, minLength: 6, maxLength: 24, pattern: {params:data.PasswordRequiredPattern,message:self.PasswordMeter.PasswordRequirementsText()} });
    
    self.EmailAddress = ko.observable().extend({ required: true, email: true });
    self.BillingAddress = new AddressViewModel(data.BillingAddress || {});
    self.ShippingAddress = new AddressViewModel(data.ShippingAddress || {});
    self.UseBillingAddressForShipping = ko.observable(data.UseBillingAddressForShipping || false);
    self.RegistrationStep = ko.observable(1);

    self.accountInfoErrors = ko.validation.group([self.CustomerNumber, self.BillingZipCode]);
    self.personnalInfoErrors = ko.validation.group([self.FirstName, self.LastName, self.UserName, self.Password, self.EmailAddress]);

    self.StateList = ko.observableArray(data.StateList);

    if (self.AllowNewCustomers() == false) {
        self.IsExistingCustomer(true);
        self.RegistrationStep(2);
        InitButtons();
    }

    var getStateAbbr = function(id){
        for(var i=0;i<self.StateList().length;i++){
            if(self.StateList()[i].State===id){
                return self.StateList()[i].StateAbbreviation;
            }
        }
    }
    
    var registerCustomer = function () {

            //start spinner
            Loading(true);


            self.UIMessages.UIMessagList.removeAll();
            var model = ko.toJSON(self);
            $.ajax({
                type: "POST",
                url: "/Account/Register",
                data: model,
                contentType: "application/json; charset=utf-8"
               , success: function (response) {
                   if (response.Success == true) {
                       if (response.Messages != null) {

                           //Note:, Here we are using a new property of the UIMessage class called redirect URL
                           // This property gives us a simple way to navigate out of anyone of the famous scripted, step based nightmares 
                           // that the original version of this website contained.
                           if ((response.Messages[0].RedirectURL != null) && (response.Messages[0].RedirectURL != ''))
                           {
                               if (response.Messages[0].IsError == true) {
                                   alert(response.Messages[0].Message);
                                   self.RegistrationStep(2);
                               }
                               window.location.href = response.Messages[0].RedirectURL;
                           }
                           else
                           {
                               for (var i = 0; i < response.Messages.length; i++) {
                                   self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                               }

                           }
                       }
                       Loading(false);

                       //success
                       self.RegistrationStep(4);
                       InitButtons();
                   }
                   else {
                        //see if we have any messages
                       if (response.Messages.length > 0) {
                            
                            for (var i = 0; i < response.Messages.length; i++) {
                                self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                            }
                       }
                       else {
                           //defaultHandler(jqXHR, textStatus, errorThrown);
                           self.UIMessages.UIMessagList.push(new UIMessage("We have a default error message."));
                       }

                       Loading(false);

                       self.RegistrationStep(2);
                   }
                   //error
               }
            });
    }

    var validateShipToAddress = function () {
        Loading(true);
        self.UIMessages.UIMessagList.removeAll();
        var model = ko.toJSON(self.ShippingAddress);
        $.ajax({
            type: "POST",
            url: "/Account/ValidateAddress",
            data: model,
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    if (response.Data.FoundExactMatch == true) {
                        if (response.Data.Candidates.length > 0) {
                            var addr = response.Data.Candidates[0];
                            
                            self.ShippingAddress.Street1(addr.Street1);
                            self.ShippingAddress.Street2(addr.Street2);
                            self.ShippingAddress.City(addr.City);
                            self.ShippingAddress.Zip(addr.Zip);                            
                        }
                        self.ShippingAddress.IsVerified(true);
                    } else {
                        self.ShippingAddress.IsVerified(false);                        
                    }
                    registerCustomer();
                }
                else
                {
                    for (var i = 0; i < response.Messages.length; i++)
                    {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }
                Loading(false);
            }
        });
    }

    var validateBillToAddress = function () {
        Loading(true);
        self.UIMessages.UIMessagList.removeAll();
        var model = ko.toJSON(self.BillingAddress);
        $.ajax({
            type: "POST",
            url: "/Account/ValidateAddress",
            data: model,
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    if (response.Data.FoundExactMatch == true) {
                        if(response.Data.Candidates.length >0){
                            var addr = response.Data.Candidates[0];
                            
                            self.BillingAddress.Street1(addr.Street1);
                            self.BillingAddress.Street2(addr.Street2);
                            self.BillingAddress.City(addr.City);
                            self.BillingAddress.Zip(addr.Zip);                            
                        }
                        self.BillingAddress.IsVerified(true);
                        
                    } else {
                        self.BillingAddress.IsVerified(false);
                    }
                    if (self.UseBillingAddressForShipping() == true) {
                        self.ShippingAddress.IsVerified(self.BillingAddress.IsVerified());
                        registerCustomer();
                    } else {
                        validateShipToAddress();
                    }
                }
                else
                {
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }
                Loading(false);
            }
        });
    }

    //self.StepOneContinue = function () {
    //                self.RegistrationStep(2);
    //                InitButtons();
    //}

    var validateUserNameAndEmail = function () {
        self.UIMessages.UIMessagList.removeAll();

        $.ajax({
            type: "POST",
            url: "/Account/ValidateUserNameAndEmail",
            data: JSON.stringify({ userName: self.UserName(), emailAddress: self.EmailAddress() }),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    //we are good to move forward so call next step
                    self.RegistrationStep(2);
                    InitButtons();
                }
                else {
                    //show any error messages relating to existing username or emailaddress
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }
            },
            error: function (result) {
                alert("error");
            }
        });
    }

    self.StepOneContinue = function () {
        //check to see if ok to continue
        validateUserNameAndEmail();
    }

    self.StepTwoContinue = function () {
        if (self.IsExistingCustomer() == true) {
            if (self.accountInfoErrors().length == 0 && self.personnalInfoErrors().length == 0) {
                self.StepThreeContinue();
            } else {
                self.accountInfoErrors.showAllMessages();
                self.personnalInfoErrors.showAllMessages();
            }
        }
        else {
            if (self.personnalInfoErrors().length == 0) {
                self.RegistrationStep(3);
            } else {
                self.personnalInfoErrors.showAllMessages();
            }
        }
        InitButtons();
    }

    self.StepThreeContinue = function () {
        if (self.IsExistingCustomer() == false) {
            if (self.BillingAddress.errors().length > 0 || (self.UseBillingAddressForShipping() == false && self.ShippingAddress.errors().length > 0)) {
                self.BillingAddress.errors.showAllMessages();
                if (self.UseBillingAddressForShipping() == false) {
                    self.ShippingAddress.errors.showAllMessages();
                }
                return false;
            } else {
                validateBillToAddress();
            }
        } else {
            registerCustomer();
        }
    }
}

$(function () {

    if (window.registrationModel != undefined) {
        window.vm.Registration = new RegistrationViewModel(registrationModel);
        ko.applyBindings(vm, document.getElementById("registrationDiv"));
        InitButtons();
    }
});