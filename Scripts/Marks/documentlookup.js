// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function SalesDocument(data) {
    var self = this;
    self.CustomerId = ko.observable(data.CustomerId || 0);
    self.CustomerLocationId = ko.observable(data.CustomerLocationId || 0);
    self.DocumentNumber = ko.observable(data.DocumentNumber || data.SalesDocumentId);
    self.DocumentDate = ko.observable(eval("new " + data.DocumentDate.slice(1, -1)) || new Date());
    self.DocumentAmount = ko.observable(data.DocumentAmount || 0.00);
    self.DocumentAmountForDisplay = ko.computed(function () {
        return toNumeric(self.DocumentAmount(), 2);
    })
    self.OrderSystemName = ko.observable(data.OrderSystemName);
    self.SalesDocumentId = ko.observable(data.SalesDocumentId || 0);
    self.TalkedToName = ko.observable(data.TalkedToName || "");
    self.SalesDocumentTypeId = ko.observable(data.SalesDocumentTypeId || 0);
    self.CustomerLocationNumber = ko.observable(data.CustomerLocationNumber || "");
    self.CustomerPurchaseOrderNumber = ko.observable(data.CustomerPurchaseOrderNumber || "");

    //This just shows/hides label print pictures selection
    self.PartLabelSelectorVisible = ko.observable(false);
    self.PartLabelSelectorClicked = function () {
        var visible = self.PartLabelSelectorVisible();
        self.PartLabelSelectorVisible(!visible);
    }
}

function DocumentLookupModel(data) {
    var self = this;

    var SalesDocumentType = data.SalesDocumentType || 0;
    self.StartDate = ko.observable(eval("new " + data.StartDate.slice(1, -1)) || new Date());
    self.EndDate = ko.observable(eval("new " + data.EndDate.slice(1, -1)) || new Date());
    self.CustomerId = ko.observable(data.CustomerId || 0);
    self.CurrentCustomerLocationId = ko.observable(data.CurrentCustomerLocationId || 0);
    self.SalesDocumentList = ko.observableArray(new Array());
    self.ViewDocument = function (item) {
        var DocumentURL = "/GenericReport/GenerateReportAsPDF?documentType=" + item.SalesDocumentTypeId() + "&documentId=" + item.SalesDocumentId() + "&documentNumber=" + item.DocumentNumber() + "&orderSystemName=" + item.OrderSystemName();
        var win = window.open(DocumentURL, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        }
    }
    
    self.ViewPartLabelInvoiceDoc10 = function (item) {
        var postData = {
            invDocNo: item.DocumentNumber()
        };

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromIvoiceDoc",
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
                    //alert('Problem loading part detail ids from Invoices Window');
                }
                item.PartLabelSelectorVisible(false);
            }
        });
    }
    self.ViewPartLabelInvoiceDoc30 = function (item) {
        var postData = {
            invDocNo: item.DocumentNumber()
        };
        
        var cid = item.CustomerId();

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromIvoiceDoc",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                    var DocumentURL = "/GenericReport/GeneratePartLabelAvery5160AsPDF?customerId=" + cid + "&partDetailIds=" + response.Data;
                    var win = window.open(DocumentURL, '_blank');
                    if (win) {
                        //Browser has allowed it to be opened
                        win.focus();
                    }
                }
                else {
                    //do nothing for now
                    //alert('Problem loading part detail ids from Invoices Window');
                }
            item.PartLabelSelectorVisible(false);
            }
        });
    }
    self.ViewPartLabelInvoiceDoc4 = function (item) {
        var postData = {
            invDocNo: item.DocumentNumber()
        };

        var cid = item.CustomerId();

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromIvoiceDoc",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                    var DocumentURL = "/GenericReport/GeneratePartLabelAvery5168AsPDF?customerId=" + cid + "&partDetailIds=" + response.Data;
                    var win = window.open(DocumentURL, '_blank');
                    if (win) {
                        //Browser has allowed it to be opened
                        win.focus();
                    }
                }
                else {
                    //do nothing for now
                    //alert('Problem loading part detail ids from Invoices Window');
                }
                item.PartLabelSelectorVisible(false);
            }
        });
    }
    self.ViewPartLabelInvoiceDoc6 = function (item) {
        var postData = {
            invDocNo: item.DocumentNumber()
        };

        var cid = item.CustomerId();

        $.ajax({
            type: "POST",
            url: "/PartLabel/BuildPartLabelFromIvoiceDoc",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                if (response.Success == true) {
                    //this will build the part labels.  response.Data contains a list of part detail ids comma-seperated                    
                    var DocumentURL = "/GenericReport/GeneratePartLabelAvery5164AsPDF?customerId=" + cid + "&partDetailIds=" + response.Data;
                    var win = window.open(DocumentURL, '_blank');
                    if (win) {
                        //Browser has allowed it to be opened
                        win.focus();
                    }
                }
                else {
                    //do nothing for now
                    //alert('Problem loading part detail ids from Invoices Window');
                }
                item.PartLabelSelectorVisible(false);
            }
        });
    }
    
    self.Search = function () {
        var postData = {
            customerLocationId: self.CurrentCustomerLocationId(),
            salesDocumentTypeId: SalesDocumentType,
            startDate: self.StartDate(),
            endDate: self.EndDate(),
            customerId: self.CustomerId()
        };
        Loading(true);
        $.ajax({
            type: "POST",
            url: "/Account/GetSalesDocumentList",
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                self.SalesDocumentList.removeAll();
                if (response.Data != null) {
                    for (var i = 0; i < response.Data.length; i++) {
                        self.SalesDocumentList.push(new SalesDocument(response.Data[i]));
                    }
                }
                Loading(false);
            }
        });
    }

    self.BuyQuote = function (item) {
        self.UIMessages.UIMessagList.removeAll();

        confirmationDialog("Buy Quote", "Buying a quote will empty current cart. Click OK to continue or Cancel to abort.", function () {            
            //get salesdocumentid ready to send
            var sdId = item.SalesDocumentId();

            $.ajax({
                type: "POST",
                url: "/Checkout/BuyQuote",
                data: JSON.stringify({ id: sdId }),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    if (response.Success == false) {
                        for (var i = 0; i < response.Messages.length; i++) {
                            self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                        }
                    }
                    else {
                        //send back to main page
                        window.location.href = "/Home";
                    }
                }
            })
        }, function () {
        });
    }

    self.UIMessages = new UIMessageViewModel();

    for (var i = 0; i < data.UIMessages.length; i++) {
        self.UIMessages.UIMessagList.push(new UIMessage(data.UIMessages[i]));
    }
    self.CurrentCustomerLocationId.subscribe(function () {
        self.Search();
    });
    if (data.SalesDocumentList !== null) {
        for (var i = 0; i < data.SalesDocumentList.length; i++) {
            self.SalesDocumentList.push(new SalesDocument(data.SalesDocumentList[i]));
        }
    }
}


$(document).ready(function () {

    if (window.documentLookupModel != undefined) {
        window.vm.DocumentLookup = new DocumentLookupModel(documentLookupModel);
        $("input.date-picker").each(function (index, element) {
            $(element).datepicker();
        });
        ko.applyBindings(vm, document.getElementById("documentlookupDiv"));
    }
});
