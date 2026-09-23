# UniFlow · 大学时序

本地优先的大学生日程与课表应用。课表图片识别在设备上完成；识别出的课程需要确认后才写入课表。

这是 UniFlow 第一版冻结代码，使用 MIT License 开源。当前版本为 0.7.7（构建 18）。

待办与每日小任务会保留本机历史，可按标题、日期、类型和完成状态查询。每日小任务的未完成项目会自动延续到下一天。

## 目前可以使用的版本

- Mac：`build/UniFlow-darwin-arm64/UniFlow.app`。这是供本机试用的未签名版本，尚不是可上传 App Store 的发行包。
- iPhone：`ios/App/App.xcodeproj` 已建立，图标、启动画面和离线资源已放入工程。此电脑尚未安装完整 Xcode，所以尚未编译或在真机上验证。
- 网页预览：`dist/index.html`。网页、Mac 应用和 iPhone 应用各自保存本机数据，目前不会自动互相迁移。

## 继续开发

```sh
npm install
npm run build:mac
npm run sync:ios
npm run open:ios
```

构建产物、依赖目录和 iOS 同步生成的 `ios/App/App/public/` 不进入仓库；运行 `npm run sync:ios` 可重新生成 iOS 静态资源。

Mac 打包需要 macOS；iPhone 编译需要完整 Xcode。

测试版本号由 `package.json` 中的 `version` 和 `uniflowBuildNumber` 统一管理。每次交付新版提高版本号；每次生成新的分发构建提高构建号。打包脚本会把它们同步到 Mac、iPhone 和设置页；`npm run check` 会检查是否一致。

核心页面使用原生 HTML、CSS 与 JavaScript，不依赖前端框架。时间表规则与历史查询各自放在独立模块中并有自动测试；Mac 打包采用严格白名单，只收录运行所需文件。离线中文/英文 OCR 资源约 64 MB，Mac 包其余的大部分体积来自 Electron 运行环境。

## 上架前还需要

1. 确定正式的 Bundle ID，并在 Apple Developer 注册；现在的 `app.uniflow.desktop` 和 `app.uniflow.ios` 只是工程占位值。
2. 使用你的 Apple Developer 账号配置签名、证书及 App Store Connect。
3. Mac 版切换为 Electron 的 MAS 构建并启用 App Sandbox，验证图片选择、剪贴板和本地识别；当前普通 `.app` 不可直接上传 Mac App Store。
4. 用 Xcode 在 iPhone 模拟器及真机测试，检查图片选择与粘贴、日语及深浅色模式。
5. 准备商店截图、应用说明、隐私信息，并提交 Apple 审核；是否获批由 Apple 决定。
