(function (global) {
    define(["text!./blog-file.xhtml", "./blog-util.js", "css!./blog-file.css"], function (pageView, myBlog) {
        function BlogFileModel(params, componentInfo) {
            var defaultValue = {
                fileUrl: new FileUrl("default/" + bcstore.GtypeEnum.User + "/" + RootView.user().userId + "/directory/")
            };
            var self = $.extend(this, defaultValue, params, myBlog);
            self.blogFileLsit = ko.observableArray([]);
            self.blogPathEntry = ko.observable(new PathEntry(self.fileUrl.originPath, self.openDirectory));
            self.currentTemplate = ko.observable("my-file-template");

            function menuClickFun(menu) {
                console.log(menu);
            }
            self.leftMenuList = ko.observableArray([
                new Menu({name: '我的文件', icon: 'fa fa-book', menuId: 1001, isActive: true, clickFun: menuClickFun}),
                new Menu({name: '图片', icon: 'fa fa-picture-o', parentId: 1001, clickFun: menuClickFun}),
                new Menu({name: '文档', icon: 'fa fa-file-text-o', parentId: 1001, clickFun: menuClickFun}),
                new Menu({name: '视频', icon: 'fa fa-file-video-o', parentId: 1001, clickFun: menuClickFun}),
                new Menu({name: '音乐', icon: 'fa fa-headphones', parentId: 1001, clickFun: menuClickFun}),
                new Menu({name: '其他', icon: 'fa fa-file-o', parentId: 1001, clickFun: menuClickFun})
            ]);
            self.uploadFilesMenuItems = function () {
                return [
                    new MenuTab("上传文件", {icon: "fa-upload", clickFun: self.uploadFile})
                ];
            };
            self.openDirectory = function (item) {
                if (item instanceof FileItem && item.contentType === directory_contenttype) {
                    self.blogPathEntry(new PathEntry(item.fullPath, self.openDirectory));
                    self.getBlogFile();
                } else if (item instanceof FileUrl && item.originPath) {
                    self.blogPathEntry(new PathEntry(item.originPath, self.openDirectory));
                    self.getBlogFile();
                }
            };
            self.uploadFile = function () {
                uploadAllFile(self.blogPathEntry().getCurrentUrl().originPath, function () {
                    self.getBlogFile();
                });
            };
            self.getBlogOperateMenu = function () {
                return [
                    new MenuTab(l10n('operate.download'), {icon: 'fa-download', clickFun: self.fileDownload, menuType: CustomMenuType.SingleSlection}),
                    new MenuTab(l10n('operate.rename'), {icon: 'fa-edit', clickFun: self.renameFile, menuType: CustomMenuType.SingleSlection}),
                    new MenuTab(l10n('operate.delete'), {icon: 'fa-trash-o', clickFun: self.deleteFile, menuType: CustomMenuType.SingleSlection}),
                    new MenuTab(l10n('operate.delete'), {icon: 'fa-trash-o', clickFun: self.deleteFile, menuType: CustomMenuType.MultipleSelection})
                ];
            };
            self.getBlogFile = function () {
                getRequest("/file/get/" + self.blogPathEntry().getCurrentUrl().originPath, {accept: "application/x-protobuf"}, function (data) {
                    var fileList = bcstore.FileItemList.decode(data);
                    self.blogFileLsit([]);
                    if (fileList.item && fileList.item instanceof Array) {
                        for (var i = 0; i < fileList.item.length; i++) {
                            self.blogFileLsit.push(new FileItem(fileList.item[i], true));
                        }
                    }
                });
            };
            self.deleteFile = function (fileIemList) {
                confirmTipsDialog(l10n('operate.confirmDelete'), function () {
                    fileIemList = fileIemList instanceof Array ? fileIemList : [fileIemList];
                    var req = bcstore.FileItemList.create();
                    for (var i = 0; i < fileIemList.length; i++) {
                        req.item.push(fileIemList[i]);
                    }
                    getRequest("/file/deldete", {method: "POST", type: "application/x-protobuf", accept: "application/x-protobuf", data: bcstore.FileItemList.encode(req).finish()}, function (data) {
                        var rspInfoList = bcstore.RspInfoList.decode(data);
                        toastShowCode(rspInfoList.code);
                        if (rspInfoList.code === bcstore.ReturnCode.Return_OK) {
                            self.getBlogFile();
                        }
                    });
                });
            };
            self.renameFile = function (fileIem) {
                if (!fileIem.fullPath) {
                    return;
                }
                TipsInputDialog(fileIem.fileName, function (value) {
                    var file = new FileItem(fileIem);
                    file.fileName(value);
                    getRequest("/file/rename", {method: "PUT", type: "application/x-protobuf", accept: "application/x-protobuf", data: fileIem.toArrayBuffer()}, function (data) {
                        var rspInfo = bcstore.RspInfo.decode(data);
                        toastShowCode(rspInfo.code);
                        if (rspInfo.code === bcstore.ReturnCode.Return_OK) {
                            self.getBlogFile();
                        }
                    });
                });
            };
            self.addFolder = function () {
                TipsInputDialog("", function (value) {
                    if (!value) {
                        return;
                    }
                    getRequest("/file/addfolder/" + self.blogPathEntry().getCurrentUrl().originPath + "/" + value, {method: "POST", type: "application/x-protobuf", accept: "application/x-protobuf"}, function (data) {
                        var rspInfo = bcstore.RspInfo.decode(data);
                        toastShowCode(rspInfo.code);
                        if (rspInfo.code === bcstore.ReturnCode.Return_OK) {
                            self.getBlogFile();
                        }
                    });
                });
            };
            self.fileDownload = function (fileIem) {
                if (!fileIem.fullPath) {
                    return;
                }
                window.open(getServerUrl("/file/download/" + fileIem.fullPath));
            };

            self.getBlogFile();
        }
        return {
            viewModel: {
                createViewModel: function (params, componentInfo) {
                    return new BlogFileModel(params, componentInfo);
                }
            },
            template: pageView
        };
    });
})(this);
