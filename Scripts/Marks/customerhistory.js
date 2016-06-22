// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function InvoiceLineViewModel(data){
    var self = this;
    self.PartDetailId = ko.observable(data.PartDetailId);
    self.PartNumber = ko.observable(data.PartNumber);
    self.Quantity = ko.observable(data.Quantity);
    self.UnitPrice = ko.observable(data.UnitPrice);
    self.ReorderPrice = ko.computed(function() {
        return toNumeric(self.UnitPrice(), 2);
    });
    self.Description = ko.observable(data.Description);
    self.ImageUrl = ko.observable("/Content/Images/Catalog/fingers/"+data.ImageUrl);
    self.AddToCart = function(){
        window.vm.ShoppingCart.AddItem({
            PartNumber: self.PartNumber(),
            PartDetailId: self.PartDetailId(),
            Quantity: self.Quantity()
        });
    }
    self.ViewDetail = function(){
        window.location.href = "/Catalog/Detail/" + self.PartDetailId().toString();
    }
}

function InvoiceViewModel(data){
    var self = this;
    
    self.InvoiceId = ko.observable(data.InvoiceId);
    self.InvoiceNumber = ko.observable(data.InvoiceNumber);
    self.InvoiceDate = ko.observable(data.InvoiceDate);
    self.OrderSystemName = ko.observable(data.OrderSystem);

    self.ScrollPosition = ko.observable(0);
    self.SliderId = ko.computed(function () {        
        return self.InvoiceNumber() + "-slider";
    });
    self.ScrollPosition.subscribe(function (newValue) {
        $("div#" + self.SliderId()).scrollLeft(newValue);
        //Might need to reference home.js to see how I got this working for featured items.  RT
    });
    self.InvoiceLineList = ko.observableArray(new Array());
    self.ViewInvoice = function(){
        var DocumentURL = "/GenericReport/GenerateReportAsPDF?documentType=3&documentId=" + self.InvoiceId() + "&documentNumber=" + self.InvoiceNumber() + "&orderSystemName=" + self.OrderSystemName();
        var win = window.open(DocumentURL, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        }
    }
    self.SliderMax = ko.observable(100);
    for(var i=0;i<data.InvoiceLineList.length;i++){
        var invLine = new InvoiceLineViewModel(data.InvoiceLineList[i]);
        self.InvoiceLineList.push(invLine);
    }
    var visibleWidth = 520;
    var itemCount = self.InvoiceLineList().length;
    var itemWidthWithPadding = 228;
    var sliderWidth = itemCount * itemWidthWithPadding;
    self.SlidingDivWidth = sliderWidth.toString()+'px';    
    self.SliderOptions = { min: 0, max: sliderWidth-visibleWidth, range: 'min', step: 10 };
}

function CustomerHistoryViewModel(data){
    var self = this;
    self.CustomerId = ko.observable(data.CustomerId);
    self.CustomerLocationId = ko.observable(data.CustomerLocationId);
    self.SelectedTimeFrameId = ko.observable(data.SelectedTimeFrameId);
    self.TimeFrames = data.TimeFrames;
    self.UIMessages = new UIMessageViewModel();
    self.InvoiceList = ko.observableArray().extend({ paging: 30 });
    self.InitUIElements = function(){
        InitButtons();
        InitSliders();
    }
   
    self.SelectedTimeFrameId.subscribe(function (newValue) {
        Loading(true);
        var model = {
            customerId: self.CustomerId(),
            customerlocationId: self.CustomerLocationId(),
            timeFrameId:newValue
        };
        $.ajax({
            type: "POST",
            url: "/Account/GetInvoiceHistory",
            data: JSON.stringify(model),
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                self.InvoiceList.removeAll();
                if(result.Success===true){
                    for(var i=0;i<result.Data.length;i++){
                        self.InvoiceList.push(new InvoiceViewModel(result.Data[i]))
                    }
                }else{
                    for (var i = 0; i < result.Messages.length; i++) {
                        self.UIMessages.UIMessagList.push(new UIMessage(response.Messages[i]));
                    }
                }
                Loading(false);
            }
        });
    });
    for (var i = 0; i < data.InvoiceList.length; i++) {
        var inv = new InvoiceViewModel(data.InvoiceList[i]);
        self.InvoiceList.push(inv);
    }
    for (var i = 0; i < data.UIMessages.length; i++) {
        self.UIMessages.UIMessagList.push(new UIMessage(data.UIMessages[i]));
    }
   
}

$(function () {

    if (window.customerHistoryModel != undefined) {
        window.vm.CustomerHistory = new CustomerHistoryViewModel(customerHistoryModel);
        var customerHistoryDivDom = $('#customerHistoryDiv')[0];
        ko.applyBindings(vm, customerHistoryDivDom);
    }
});