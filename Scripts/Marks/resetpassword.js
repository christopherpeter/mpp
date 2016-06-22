// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function ResetPasswordViewModel(data) {
    var self = this;
    self.Username = ko.observable(data.UserName || "");
    self.UserId = ko.observable(data.UserId || "");
    self.PasswordResetTime = ko.observable(data.PasswordResetTimeString || "");
    self.PasswordResetExpTime = ko.observable(data.PasswordResetExpireTimeString || "");
    self.ResetPossible = ko.observable(data.CanWeResetPW || false);

    self.PasswordMeter = new PasswordMeter({
        PasswordRequiredPattern: data.PasswordRequiredPattern,
        ForbiddenPasswordCharPattern: data.ForbiddenPasswordCharPattern
    });
    self.Password = ko.observable("").extend({ required: true, minLength: 6, maxLength: 20, pattern: { params: data.PasswordRequiredPattern, message: self.PasswordMeter.PasswordRequirementsText() } });
    self.Password2 = ko.observable("").extend({ required: true, minLength: 6, maxLength: 20, pattern: { params: data.PasswordRequiredPattern, message: self.PasswordMeter.PasswordRequirementsText() } });
    self.PassKey = ko.observable(data.PassKey || "");
    self.ResetAttempted = ko.observable(false);
    self.ResetFailed = ko.observable(false);
    self.UIMessages = new UIMessageViewModel();
    self.errors = ko.validation.group([self.Password,self.Password2]);
    self.ResetPasswordClicked = function () {

        Loading(true);

        if (self.errors().length == 0) {
            var model = {
                PassKey: self.PassKey(),
                Password: self.Password(),
                OldPassword:self.Password2()
            };

            self.ResetAttempted(false);
            self.ResetFailed(false);
            self.UIMessages.UIMessagList.removeAll();
            $.ajax({
                type: "POST",
                url: "/Account/ResetPassword",
                data: JSON.stringify(model),
                contentType: "application/json; charset=utf-8"
                , success: function (response) {
                    self.ResetAttempted(true);
                    self.ResetFailed(!response.Success);
                    for (var i = 0; i < response.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }

                    Loading(false);
                }
            });
        } else {
            //if we have an error turn off spinner
            self.errors.showAllMessages();
            Loading(false);
        }
    }

    self.RecoverPasswordClickFromReset = function () {

        self.UIMessages.UIMessagList.removeAll();

        var model = {
            RecoveryValue: self.Username()
        };

        Loading(true);

        
        $.ajax({
            type: "POST",
            url: "/Account/RecoverPassword",
            data: JSON.stringify(model),
            contentType: "application/json; charset=utf-8"
            , success: function (response) {
                for (var i = 0; i < response.Messages.length; i++) {
                    self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                }

                Loading(false);

                if (response.Success == true) {
                    //success so return to home page.
                    window.location.href = "/Home";
                }
            }
        });

    }

}

$(function () {
    if (window.resetPasswordModel != undefined) {
        window.vm.ResetPassword = new ResetPasswordViewModel(resetPasswordModel);
        ko.applyBindings(vm, document.getElementById("passwordResetDiv"));
        InitButtons();
    }
});