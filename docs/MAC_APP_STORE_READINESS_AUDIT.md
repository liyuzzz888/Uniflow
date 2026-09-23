# UniFlow Mac App Store Readiness Audit

审计日期：2026-09-23  
审计范围：`/Users/liyuze/Documents/Uniflow` 当前工作区；本轮只做检查、静态分析和验证，不做整改。

## Executive Summary

当前仓库是一个以原生 HTML/CSS/JavaScript 为 UI 的 Electron macOS 应用，同时包含一个 Capacitor iOS 工程。它不是 SwiftUI macOS 工程，也没有 macOS Xcode target。

当前普通 Mac 构建可以生成并启动所需的 arm64 `.app`，但该产物不是 Mac App Store 发行包：打包脚本使用 `@electron/packager` 的 `darwin/arm64` 路径，没有 MAS 专用构建、App Sandbox entitlement、Apple Developer 签名、Team 或正式 Bundle ID。Apple 明确要求提交 Mac App Store 的 macOS app 启用 App Sandbox；当前产物的代码签名为 ad-hoc，不能进入正式提交流程。[Apple App Sandbox](https://developer.apple.com/documentation/security/app_sandbox) 

产品层面基本符合 local-first 目标：应用代码没有发现网络请求、Analytics、广告、崩溃上报或云同步实现；用户数据和图片识别主要在本机完成。不过，数据写入缺少损坏恢复/写入失败反馈，且 UI 中仍有若干未纳入本地化字典的硬编码文字。

结论：**当前不建议进入 Stage 2 之外的发布阶段；可以进入 Stage 2，但必须先解决下列 BLOCKER。** 本轮没有改变产品设计、数据架构或权限配置。

## Repository and Architecture Snapshot

- Mac 入口：`desktop/main.cjs`，由 Electron 44.4.3 加载 `dist/index.html`。
- Mac 打包：`scripts/package-mac.cjs`，调用 `@electron/packager`，固定 `platform: 'darwin'`、`arch: 'arm64'`、`appBundleId: 'app.uniflow.desktop'`。
- iOS 工程：`ios/App/App.xcodeproj`，只有一个 `App` iOS target；其 deployment target 为 iOS 15.0，Swift 版本为 5.0，Bundle ID 为 `app.uniflow.ios`。
- 当前 Mac 版本/构建号：0.7.2 (13)，与 `package.json`、`dist/version.js` 及 iOS 工程同步。
- 当前生成 Mac 包最低系统版本：macOS 13.0；当前构建架构为 Apple Silicon arm64。仓库没有 Intel/x86_64 或 universal 构建配置。
- 现有构建产物约 299 MB，主要来自 Electron runtime 与离线 OCR 资源。

## PASS

### PASS — Local-first application behavior

Evidence:

- `dist/app.js` 使用 `localStorage` 保存 `uniflow-v1` 状态，包含 settings、tasks、blocks、todos、courses。
- OCR worker、WASM、中文/英文模型均从 `dist/vendor` 加载；源码未发现应用层 `fetch`、XHR、WebSocket、Beacon 或第三方服务 endpoint。

Reason:

实际代码与“无需登录、尽量不收集数据、设备内 OCR”的产品 baseline 基本一致。这里的结论仅针对仓库可见代码，不等同于已完成 Apple 或第三方依赖的最终二进制扫描。

### PASS — Renderer security baseline

Evidence:

- `desktop/main.cjs` 设置 `nodeIntegration: false`、`contextIsolation: true`、`sandbox: true`、`webSecurity: true`。
- 应用使用受限的 `uniflow://app` scheme，并对路径做了 URL 解码、根目录约束和导航拦截。
- 外部 window 打开被拒绝。

Reason:

这降低了 renderer 直接访问 Node 或任意本地文件的风险。它不替代 Mac App Sandbox entitlement。

### PASS — Build allow-list

Evidence:

- `scripts/package-mac.cjs` 使用严格 ignore 规则，只把 `desktop`、`dist` 和 `package.json` 纳入 app 资源。

Reason:

不会因为项目目录旁的个人文件而自动打进应用包。

### PASS — Version consistency check

Evidence:

- `npm run check` 中的 `scripts/sync-version.mjs --check` 通过。
- 当前版本为 0.7.2，构建号为 13。

Reason:

Mac、iOS 和设置页使用的版本值在当前工作区一致。

### PASS — Existing automated tests

Evidence:

- `npm run check` 通过。
- Node test runner 共 9 个测试，9 passed，0 failed。

Reason:

课表解析、课程合并、周规则、待办历史及迁移相关的现有单元测试当前通过。

### PASS — Mac packaging smoke path

Evidence:

- 在允许下载 Electron 运行时后，`npm run build:mac` 完成，生成 `build/UniFlow-darwin-arm64/UniFlow.app`。
- 产物内含 `UniFlow` 图标资源、版本 0.7.2/13 和最低 macOS 13.0。

Reason:

普通 arm64 开发/试用包的打包链路是可重复执行的。该 PASS 不表示可提交 Mac App Store。

### PASS — No unnecessary app code access to arbitrary user paths

Evidence:

- 应用代码没有 `NSOpenPanel`、绝对用户路径、Documents/Downloads/Desktop 遍历、shell 执行或外部 executable 调用。
- 图片通过 HTML file input、拖放或 clipboard image 进入 renderer，OCR 后只保留应用状态。

Reason:

当前图片导入交互方向符合“用户主动选择/提供内容后处理”的最小权限原则。MAS 版仍需验证 Electron 的 file chooser、clipboard 和 sandbox 行为。

## NEEDS FIX

### NEEDS FIX — Persistence failure and corruption handling

Evidence:

- `dist/app.js:110-126` 在 JSON 解析或读取异常时直接返回 defaults。
- `dist/app.js:151-154` 直接调用 `localStorage.setItem`，没有容量不足、写入失败或恢复提示。

Impact:

损坏或不可读数据可能被静默视为首次启动；写入失败可能让用户以为数据已保存。当前不是架构重写问题，但不适合作为 1.0 的可靠性基线。

Recommended minimal fix:

在 Stage 2/4 增加可观测的恢复分支和用户提示；保留现有 localStorage 数据格式，先不要替换数据库。

### NEEDS FIX — Localization coverage is incomplete

Evidence:

- `dist/app.js` 有中文/English/日本語及 bilingual 字典。
- `dist/index.html` 仍有未标记 `data-i18n` 的 aria-label、title、placeholder、周几选项、确认弹窗默认文案和输入默认值。

Impact:

切换 English、日本語或中英双语时会出现混合语言；长文本和辅助功能标签也没有经过完整验证。

Recommended minimal fix:

仅补齐现有页面的本地化 key 和 macOS 窗口尺寸下的溢出测试，不新增语言或产品功能。

### NEEDS FIX — Privacy manifest and dependency privacy review

Evidence:

- 仓库没有 `PrivacyInfo.xcprivacy`。
- 直接依赖包括 Electron、Capacitor、Tesseract.js/WASM、OCR language data、Sharp，以及 Capacitor CLI/packager 等构建工具。
- Apple 文档要求隐私 manifest 描述 app/SDK 的数据收集和适用的 required-reason API；第三方 SDK 也可能需要自己的 manifest。[Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)

Impact:

当前没有证据表明 UniFlow 收集数据，但最终 MAS 发行包仍需对 Electron runtime、原生模块和嵌入资源做 bundle 级检查，不能只依据产品声明。

Recommended minimal fix:

列出最终 app bundle 的可执行文件/动态库及其 manifest 状态；根据实际 API 使用创建最小 manifest。不要在没有证据时声明不存在的数据类型或 required reason。

### NEEDS FIX — Unnecessary generated permissions and metadata

Evidence:

生成的 `build/UniFlow-darwin-arm64/UniFlow.app/Contents/Info.plist` 含有：

- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`
- `NSAudioCaptureUsageDescription`
- `NSBluetoothPeripheralUsageDescription`
- `NSBluetoothAlwaysUsageDescription`
- `NSAppTransportSecurity/NSAllowsArbitraryLoads = true`
- `LSApplicationCategoryType = public.app-category.developer-tools`

源码没有发现相机、麦克风、蓝牙、音频采集或联网功能；当前产品也不是开发者工具。

Impact:

这些默认 Electron metadata 不符合 least privilege，可能触发隐私审查疑问；任意网络加载设置也扩大了发行包配置范围。

Recommended minimal fix:

在 MAS 构建配置中移除未使用的 usage descriptions 和任意加载设置，并改用真实的 App Store 类别。只保留产品实际使用的能力。

### NEEDS FIX — macOS UX release QA

Evidence:

- 主流程是 Electron HTML UI；仓库没有 macOS 原生 Settings/About/Menu 命令实现或 UI tests。
- 当前测试只覆盖 `schedule.js` 和 `history.js` 的 Node 单元逻辑。

Impact:

窗口、菜单、键盘焦点、file chooser、clipboard、空状态、错误状态、浅色/深色模式和日语布局还没有可重复的发行级证据。

Recommended minimal fix:

Stage 4/5 增加手工验收矩阵和必要的端到端 smoke tests；不进行大规模视觉重构。

### NEEDS FIX — Release build and signing verification are absent

Evidence:

- 当前只有普通 Electron `.app` 打包脚本，没有 Release/Archive/Validate 流程。
- `npm run build:mac` 未执行签名、notarization 或 MAS validation。

Impact:

无法证明正式安装、更新、签名链、嵌套 helper 和最终分发包行为。

Recommended minimal fix:

在解决 BLOCKER 后，建立可复现的 Release Candidate 验证清单，并对所有嵌套 helper 做签名和 sandbox 检查。

### NEEDS FIX — Dependency inventory and native-binary review

Evidence:

| Dependency | Purpose | Necessary | Privacy impact | App Store risk | Native alternative |
|---|---|---:|---|---|---|
| Electron | Mac runtime | Current path: yes | No app telemetry found; runtime needs bundle review | High until MAS/sandbox path is configured | Native SwiftUI/AppKit would be a product/architecture change |
| @electron/packager | Build tool | Yes for current path | Build-time only | High because it produces ordinary darwin app here | Electron MAS-capable packaging/signing flow |
| Tesseract.js/core + chi_sim/eng data | On-device OCR | Product feature: yes | OCR input remains local in app code | Bundle size and embedded-runtime review | Vision framework would be a feature/accuracy change |
| sharp | Icon/build asset preparation | Build-time only | None observed | Low in final app if excluded | `iconutil`/asset tooling where sufficient |
| Capacitor core/ios/cli | iOS shell and sync | iOS path: yes; Mac path: no | No data service found | Separate iOS review; not part of Mac runtime | Native iOS shell would be a redesign |

Reason:

No abandoned or analytics dependency was identified from the direct dependency list. The main unresolved risk is not a third-party service, but whether the Electron runtime and all nested components are packaged, signed and sandboxed correctly.

## BLOCKER

### BLOCKER — No Mac App Store-capable target or packaging path

Evidence:

- Only `ios/App/App.xcodeproj` exists; its single target is iOS (`SDKROOT = iphoneos`, `IPHONEOS_DEPLOYMENT_TARGET = 15.0`).
- No macOS Xcode target, macOS scheme, entitlements file, or Mac Release configuration exists.
- `scripts/package-mac.cjs` calls `@electron/packager` with `platform: 'darwin'` and `arch: 'arm64'`; it does not create a Mac App Store build.

Why this blocks release:

The current build is a development/distribution-style Electron app, not a configured Mac App Store target. It has no place to define the required MAS sandbox/signing settings.

Minimal remediation:

Choose and implement one supported Mac distribution path (Electron MAS packaging or a deliberate native macOS target), then keep the existing UI/data model unless a concrete compatibility issue requires change. This decision must precede Archive or Upload.

### BLOCKER — App Sandbox is not enabled

Evidence:

- No `.entitlements` file exists.
- `codesign -d --entitlements :- build/UniFlow-darwin-arm64/UniFlow.app` returns no entitlements.
- The app bundle is the ordinary Electron bundle generated by the current `darwin` script.

Why this blocks release:

Apple states that a macOS app submitted to the Mac App Store must enable App Sandbox.[App Sandbox](https://developer.apple.com/documentation/security/app_sandbox)

Minimal remediation:

Add the MAS sandbox configuration only after choosing the packaging path. For current functionality, begin with the app container and user-selected read access needed for image import; do not add Downloads/Desktop/all-files access without evidence. Apple documents standard open panels and user-selected file access as the intended route.[Accessing files from the macOS App Sandbox](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox)

### BLOCKER — Current Mac binary is ad-hoc signed

Evidence:

`codesign -dvvv build/UniFlow-darwin-arm64/UniFlow.app` reports:

- `Signature=adhoc`
- `TeamIdentifier=not set`
- `Info.plist=not bound`
- `Sealed Resources=none`

Why this blocks release:

There is no Apple Developer identity, designated Team, provisioning/signing configuration, or nested-helper signing verification. This cannot be used as the signed artifact for App Store Connect.

Minimal remediation:

Register the final Bundle ID, configure the developer team and distribution signing, sign/verify the main app and every nested helper, then run validation on the exact archive intended for upload.

### BLOCKER — Bundle ID is an explicit placeholder

Evidence:

- Mac packaging uses `app.uniflow.desktop`.
- iOS uses `app.uniflow.ios`.
- README calls both values placeholders.

Why this blocks release:

The final Mac Bundle ID must be registered and match the App Store Connect app record before a build can be associated with the Mac app version. Apple describes the Bundle ID and version in the app bundle as the values used to associate an uploaded build.[Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds)

Minimal remediation:

Confirm the final identifier with the owner, register it in Apple Developer/App Store Connect, and update only the release configuration and version synchronization source.

## UNKNOWN

### UNKNOWN — Apple Developer account and signing assets

Cannot confirm from the repository:

- Apple Developer Program membership and signed agreements.
- Team ID, distribution certificate, provisioning profile, and signing identity.
- Whether the final Bundle ID is available and registered.

### UNKNOWN — App Store Connect record and legal/store metadata

Cannot confirm:

- App record, category, copyright, support URL, privacy policy URL, age rating, pricing and availability.
- Final localized name, subtitle, description, keywords and Mac screenshots.

### UNKNOWN — Final device architecture decision

Current code explicitly builds Apple Silicon arm64 only. Supporting Intel would require an x86_64 build or universal artifact, separate dependency/runtime validation (notably Electron and native build tooling), and Intel QA. Keeping Apple Silicon only is technically consistent with the current script and reduces package/QA cost, but whether that is acceptable for UniFlow’s intended audience is a product decision and has not been changed.

### UNKNOWN — Apple review outcome and final dependency bundle scan

No repository audit can predict App Review acceptance or replace final validation of the signed archive, nested Electron helpers, embedded WASM/data, and any SDK privacy declarations in the chosen 2026 submission toolchain.

## Validation Record

| Check | Result | Notes |
|---|---|---|
| `npm run check` | PASS | Version check, JS syntax checks, 9/9 unit tests passed |
| `npm run build:mac` | PASS with warning | Succeeds after allowing Electron runtime download; ordinary arm64 `.app`, not MAS |
| `xcodebuild -project ios/App/App.xcodeproj -list` | NOT COMPLETED | Environment could not write Xcode/SwiftPM cache under `~/Library`; not a Mac target validation |
| Mac code signature inspection | FAIL for release | Ad-hoc signature, no Team ID, no entitlements |
| UI/E2E/OCR/file-picker/clipboard QA | NOT RUN | No existing automated UI test path |
| Release/Archive/Validate/Upload | NOT RUN | Correctly deferred by this audit stage |

## Release Roadmap

### Stage 2 — Critical Fixes

1. Choose the Mac App Store packaging strategy and introduce a real Mac release target/configuration.
2. Register and confirm the final Bundle ID and Apple Developer team.
3. Enable App Sandbox with least privilege; verify user-selected image import and clipboard behavior under sandbox.
4. Replace the ad-hoc build with a signed, nested-helper-complete release path.

### Stage 3 — Store Compatibility

1. Remove unused Electron permission descriptions and arbitrary-load settings.
2. Add/verify the minimal privacy manifest and dependency declarations.
3. Validate the final app bundle, entitlements, hardened runtime/signature chain and architecture.

### Stage 4 — Product Polish

1. Harden local persistence failure/corruption behavior.
2. Complete the existing Chinese/English/Japanese/bilingual localization coverage.
3. Fix only release-relevant macOS behavior and layout issues found by the acceptance matrix.

### Stage 5 — Release Candidate

Run a clean Release build and test first launch, repeated launch, upgrade data migration, empty/corrupt state, image picker, drag/drop, clipboard, offline OCR, malformed image, delete/undo expectations, light/dark mode, all four language modes, Apple Silicon, and (only if chosen) Intel.

### Stage 6 — App Store Connect

Prepare App Name, Subtitle, Description, Keywords, Category, Age Rating, privacy answers, Support URL, Privacy Policy URL, Copyright and Mac screenshots. Apple requires an app record before uploading a build.[Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app)

### Stage 7 — TestFlight

Upload the signed Release Candidate, wait for processing, answer export-compliance questions if presented, and validate the actual TestFlight build on clean user data and upgraded user data.

### Stage 8 — Submission

Archive → Validate → Upload → wait for App Store Connect processing → select the processed build → submit for review. Uploading a build alone does not submit it for review; Apple documents build selection as a separate step.[Choose a build to submit](https://developer.apple.com/help/app-store-connect/manage-builds/choose-a-build-to-submit)

## Audit Decision

**Do not Archive or Upload yet.** Stage 2 is appropriate after owner approval, with the minimum scope limited to the four BLOCKER items above. No feature addition, data-layer replacement, UI redesign, CloudKit, account system, analytics, server, AI or subscription work is recommended by this audit.
