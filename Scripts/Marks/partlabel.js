// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function PartLabel(data) {
    var self = this;
    self.IsSelected = ko.observable(data.IsSelected || true);
    self.PartNumber = ko.observable(data.PartNumber || "");
    self.PartDescription = ko.observable(data.PartDescription || "");
}

function PartLabelModel(data) {
    var self = this;
    self.PartLabelList = ko.observableArray(new Array());

    //RTRT

    //save this code to display report
    self.GeneratePartLabelDocument = function (item) {
        var DocumentURL = "/GenericReport/GenerateLabelTemplateAsPDF?salesDocumentId=" + item.SalesDocumentId();
        var win = window.open(DocumentURL, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        }
    }
    self.SelectAll = ko.computed({
        read: function () {
            return true;
        }
    });

    //RTRT
    
    self.UIMessages = new UIMessageViewModel();

    for (var i = 0; i < data.UIMessages.length; i++) {
        self.UIMessages.UIMessagList.push(new UIMessage(data.UIMessages[i]));
    }
}


$(document).ready(function () {

    if (window.partLabelModel != undefined) {
        window.vm.PartLabelLookup = new PartLabelModel(partLabelModel);

        $("input.date-picker").each(function (index, element) {
            $(element).datepicker();
        });
        ko.applyBindings(vm, document.getElementById("partLabelDiv"));
    }
});
