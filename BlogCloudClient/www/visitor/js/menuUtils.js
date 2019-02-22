function MenuUtils(root) {
    var self = root || this;

    self.menuList = ko.observableArray([]);

    self.getMenu = function (callback) {
        getRequest("/menu/hash/" + RootView.getHash(), {accept: "application/x-protobuf"}, function (data) {
            let menuList = bcstore.MenuList.decode(data);
            self.menuList().length = 0;
            ko.utils.arrayForEach(menuList.items, function (menu) {
                self.menuList.push(new Menu(menu));
            });
            if (isFunction(callback)) {
                callback(self.menuList());
            }
        });
    };

}