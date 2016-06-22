// Version Date:
// This section is used for auto file versioning. Do not edit this section in any way.
// Do not include any Javascript above the dashed line. 
// It will be lost when the versioning routine runs on the server
//----------------------------------------------------------------------------------------------------------------------------------------------//


function BannerImage(data, parent) {
    if (data === undefined) {
        return null;
    }
    return {
        ImagePath: "/Content/Images/SliderContent/Banners/" + data.ImagePath || "",
        AltText: data.AltText || "",
        LinkLocation: "/Content/Images/SliderContent/Banners/PDFs/" + data.LinkLocation || "",
        Height: data.Height,
        Width: data.Width
    };
}

function FeaturedItemList(data){
    var self = this;
    
    //this is the description of the Featured list, ie: 'Glens List 1'
    self.Description = ko.observable(data.Description).extend({ camelCase: null });


    self.FiFHeight = ko.observable(data.FiFHeight);         //height for div.featured
    self.FiFlHeight = ko.observable(data.FiFlHeight);       //height for div.featured-list
    self.FiFliHeight = ko.observable(data.FiFliHeight);     //height for div.featured-list-items (plural)

    self.FeaturedItems = ko.observableArray();
    self.ScrollPosition = ko.observable(0);
    self.SliderId = ko.computed(function () {
        var descrip = self.Description().replace(/\s+/g, '').replace("'", "");
        return descrip + "-slider";
    });
    self.ScrollPosition.subscribe(function (newValue) {
        //RT.  I had to set a real ID for this div for the scroolbar to work.  Identifying by sliderID didn't work.
        //we may have to revisit this code for sliderbars ni history menu option.  At the moment front page goes first.
        //$("div#" + self.SliderId()).scrollLeft(newValue);
        $("div#SliderControl").scrollLeft(newValue);

        //var maxScroll = $('div#' + self.Description() + '-slider').prop("scrollWidth") - $('div#' + self.Description() + '-slider').width();
        //$('div#' + self.Description() + '-slider').animate({ scrollLeft: newValue }, 1000);
    });

    for (var i = 0; i < data.FeaturedItems.length; i++) {
        self.FeaturedItems.push(new SearchResultItem(data.FeaturedItems[i], self));
    }
}

function HomeViewModel(data){
    var self = this;
    //self.IsInMaintenanceMode = ko.observable(data.IsInMaintenanceMode);
    self.FeaturedItemLists = ko.observableArray();

    for (var i = 0; i < data.FeaturedItemLists.length; i++) {
        self.FeaturedItemLists.push(new FeaturedItemList(data.FeaturedItemLists[i]));
    }


    self.BannerImagePath = ko.observable(new BannerImage(data.BannerImages[0], self).ImagePath);
    self.BannerLinkLocation = ko.observable(new BannerImage(data.BannerImages[0], self).LinkLocation);
    self.BannerHeight = ko.observable(new BannerImage(data.BannerImages[0], self).Height);
    self.BannerWidth = ko.observable(new BannerImage(data.BannerImages[0], self).Width);
    
    var currentImageIndex = 0;

    var BannerImages = new Array();
   
    var GetBannerImage = function(){
        var index = currentImageIndex++;
        if(index>=BannerImages.length){
            index = 0;
        }
        self.BannerImagePath(getAbsoluteUrl(BannerImages[index].ImagePath));
        self.BannerLinkLocation(getAbsoluteUrl(BannerImages[index].LinkLocation));
        self.BannerHeight(getAbsoluteUrl(BannerImages[index].Height));
        self.BannerWidth(getAbsoluteUrl(BannerImages[index].Width));
       
    };
    setInterval(GetBannerImage, 500);
    self.BannerImageClicked = function (sender,event) {
        var image = $(event.target);

        window.open(self.BannerLinkLocation(), "_blank");
    }

    for (var i = 0; i < data.BannerImages.length; i++) {
        BannerImages[i] = new BannerImage(data.BannerImages[i]);
    }
}

$(function () {
    
    if (window.homeModel!=undefined) {
        window.vm.Home = new HomeViewModel(homeModel);
        var homeDivDom = $('#homeDiv')[0];
        ko.applyBindings(vm, homeDivDom);
        InitButtons();
        InitSliders();
    }
});
