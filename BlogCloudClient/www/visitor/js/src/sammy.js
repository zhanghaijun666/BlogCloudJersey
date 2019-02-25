function SammyPage(options) {
    options = options || {};
    var root = options.view;
    var sammy = Sammy(function () {
        this.get("/", function () {
            this.redirect("#login");
        });
        this.get("#login", function () {
            if (root.isLogin()) {
                this.redirect("#menu");
            } else {
                root.rootPageViewModel({name: 'login-page', params: {}});
            }
        });
        this.get(/\#menu(.*)/, function () {
            if (!root.isLogin()) {
                this.redirect("#login");
                return;
            }
            var params = this.params['splat'][0];
            root.getMenu();
            root.rootPageViewModel({name: 'menu-nav-tabs',
                params: {
                    menuList: root.menuList
                }
            });
        });
        this.get("#messages", function () {
            toastShowMsg("暂未开发，尽情期待！！！");
            this.redirect("#login");
        });
        this.get("#admin", function () {
            toastShowMsg("暂未开发，尽情期待！！！");
            this.redirect("#login");
        });
        this.around(function (callback) {
            callback();
        });
    }).run();
    return sammy;
}
window.SammyPage = SammyPage;
