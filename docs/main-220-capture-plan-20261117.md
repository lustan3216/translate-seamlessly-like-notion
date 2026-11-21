# 2.2.0 新來源實拍與官網切換計畫

## 來源與目前狀態

- 舊批：`61bdbe4024f709e29109b321130023909f89411b`、`2.1.4+202611120405`；14 張 ignored 候選原樣保留。舊 13 張 active／7 個主圖已退出 active，其完整 manifest、33 個 raw／衍生圖片檔均保留追溯，沒有改來源、時間或 bytes。
- 新來源基底：`25040c54255b2f7dd073965a749f19ec378e9677`。該 Git object 的 `pubspec.yaml` 宣告 `2.2.0+202611172050`，public config 為 **v101**；原始 config SHA-256：`15ecba386ea5e4a2f899a267aa192edc4ce1d033326451fbf1cc556c555e0ef6`。
- 既有 Development／Profile artifact 的 source base 為 25040，帶原先 `pubspec.lock` 與 `ios/Podfile.lock` 兩項 delta；artifact/hash/signature/routing 對上 17:34 安裝紀錄及目前 container。**不能稱為 clean-commit build，也沒有讀回裝置 binary bytes。** 本文件 owner 已收到下列原 JSON，核對各自 SHA、主 App 簽章與 compiled Development routing、2.2.0+202611172050、r5 installed-only guard，以及目前 installed metadata 與 baseline 完全相同。這是 artifact／交付／安裝 metadata 關聯證據，不能代替圖片內容或 Provider 成功。
- 新模板：`output/native-captures/fresh/main220-zh-tw.capture.template.json`。19 個槽位，目標 25040、實際批次日期 `2026-11-17`；每張的 PNG、時間、版本、來源、receipt 與 guard 仍待實拍／真證據。模板不可直接匯入。
- 真正已批准的新批候選另存 `output/native-captures/fresh/main220-zh-tw.capture-input.json`，capture set 為 `20261117-zh-tw-main25040-r5`；逐張核原 sidecar／PNG／來源證據後追加。模板的空欄位不是已取得圖片，舊 61bd input 不被覆寫。
- **Root 後續授權先匯入已齊全 11 主圖的 18 張新圖，作本地 partial 中間態。** Content／pricing／icon source 已切 25040，正常 importer 已輸出全新 active 18 張，不混舊 PNG。第 19 張 `screen-text` 仍必須補齊，strict 19 identity gate 不降低；18／19 不能稱完成。

下列結果只來自兩個固定 Git object 的離線比對，不代表 Provider、遠端旗標、裝置 UI 或任何平台已驗收。

新批來源證據均位於 `/Users/luyi/.codex/artifacts/website-native-capture-20261116/`：

| 原 JSON | SHA-256 |
|---|---|
| `artifact-verification-current220-25040.safe.json` | `d7c8806744ef63e2d77cea963f8d3b755c4f8757a6dab18b63b56b6bd0a2ca94` |
| `current220-25040-r5-preflight.safe.json` | `b02b1fb244b07c07abe2980711ab88e0c4b96c7493f87d006941cabb1a5b4198` |
| `device-installed-current220-baseline.json` | `3dafab05e46246cabcdab1e57f9d17bb0fee977935e48076eae5cbdd888ec137` |
| `device-installed-current220-25040-r5.json` | `c2c95c8aadec1bc8f0de02f9534cd6afce5bc522bb317ab54fadbd3aca2da5b3` |
| `current220-25040-r6-preflight.safe.json` | `df9bbfabb1c88eaad1a2da772e07f0b230264f63bf2208f8a0c77f1bbee8c123` |
| `device-installed-current220-25040-r6.json` | `e27f85ef11563804a8b1930bfa30538d5775a4e1d69cebfdef2b4e6f0bc0019d` |

r5 guard 時間為 `2026-11-17T18:02:21.286902+00:00`，確認未 build／reinstall；只有此後、在目前來源仍有效時由 Root 逐張批准的原 PNG，才能加入新批。`sourceCleanAtBuildEnd`、`deviceBinaryBytesRead`、`deviceBinaryHashCompared` 皆為 false，原 receipt 與兩個 lockfile delta hash 需保留。

Voice、Text、Helper 前三張沿用 r5 原 guard。後續曾暫停 r5，native owner 回報限時 pinch 的 test-only signing guard 失敗後即放棄，未啟測試、無手勢或 App／runner 安裝；之後恢復 r6。r6 guard 時間為 `2026-11-17T18:20:28.798294+00:00`，兩份新 JSON hash、installed-only／無 build 或 reinstall、source／版本與 baseline 相符均已核驗。新圖逐張引用 r6 evidence，**沒有把前面三張改標 r6**；capture set 名稱中的 r5 是本批起始識別，不代表每張共用同一輪 guard。

## 61bd → 25040 的必要差異

### Chat 已改為三模式 sheet

`lib/screens/translation_chat_screen.dart` 的這次 diff 有 472 行變動；重要新來源位置：`_visibleModes`／`_showModes` 約 900–1055，`_prepareCustom` 1137 起；`lib/chat/chat_lesson_widgets.dart` 的 `ChatModesView` 1265 起，自訂欄位 1506 起。

- 頂部模式 tag 與 bottom sheet 回來了；只顯示 **智慧對話／目標練習／場景練習**，順序是 `normal`、`goal`、`scenario`。語句仍屬目標單元；不是五模式，也沒有獨立自由練習或「我的句子」入口。
- 舊的對話內 `_openPicker`、`_takeCustomRequest`、`ChatLessonPickerCard` 已退出。介紹訊息的兩個練習按鈕改為展開對應 sheet；點選列只選取，最後由開始按鈕套用、關閉並開始。
- 自訂場景／目標改為 sheet 內的輸入欄，支援已保存內容與目標範例。不能再寫成在對話 picker 開著時，直接說話／打字就自動接管成自訂課程。自訂新目標取代原計畫與進度的限制仍存在（`_prepareCustom` 約 1170–1181）。
- 四個一般起始建議的 action／繁中 label 未變：語音對話、陪我用 `{language}` 聊天、幫我即時口譯、拍照讓 AI 看懂。`chatChips.version` 仍為 8；normal max 改為 4，有接續練習時照片 chip 可讓位，composer 仍保有相機。
- v101 的 chip set 只有 normal／scenario／sentence。scenario 為提示＋文法解釋；sentence 再加其他例句。舊 replay／tutor set 不再是新 UI 的入口。
- bundled `voiceChatEnabled`／`chatLessonsEnabled` 仍為 false；本機來源不能代替 remote Settings 的實際開放證據。重拍必須按當時真實 UI，不能手動開旗標或補假課程。
- `chat/chat-entry` 技術 gallery key 可拍三模式 sheet，alt／notes 明確寫實際畫面。這不等於空白 intro／四 chips 實拍；不為截圖清除私人 Chat。`chat/chat-scenario` key 仍供首頁使用，不改名。

完整來源說明見新 source 的 `docs/chat-lessons-contract.md` v100／v101 段。v101 另增加新 Chat profile header 的相容路徑；它不等於多一個對外功能，也不能使歷史答案變成新 Provider 成果。

### Public config、方案與語氣

- config v98 → **v101**；整個 `subscription` object 保持相同，包含 Free 條件、scheduled policy 與所有付費方案額度。新 pricing snapshot 只需更新 sourceCommit 與完整 public config SHA，不改數量或重置政策。
- tone ids 仍是 polite／humor／letter／oral／concise，加上 App 的自動選項，共六種。繁中 App `oral` 標籤由 **朋友 → 輕鬆**；其餘為自動、禮貌、幽默、書信、精簡。
- 只改真正的語氣選項與「選這個語氣」敘述。一般「朋友聊天／交朋友」及原生 Keyboard 的既有 `oral: 口語` 不做全域替換。

### Helper 預設與原生 Keyboard

- Helper 仍為 11 presets。各 preset 的 `instruction`、繁中 `instructions`、scope、maxInputTokens 均相同。繁中顯示標題有 `collocation` **搭配 → 詞語搭配**、`replySuggestions` **情境回覆 → 回覆建議**；新增語言的翻譯名稱不代表新增 preset。
- `lib/api/settings.dart` 新增 `helperDisplayTitle`（約 249 起）；Text 的 Helper chips／選單與 `custom_block_helper.dart` 會為既有預設紀錄顯示目前介面語系名稱。自訂 prompt 仍保留自己的標題。新 Helper 圖不能拿舊標題當當前 UI。
- `ios/TranslatorKeyboard/translations.swift` 本次改了大量原生字串，繁中區約 2007 起。例：翻譯目標 → 翻譯成、翻譯額度已用完 → 文字翻譯額度已用完，以及自動替換、聽寫、完整取用與貼上說明。`oral` 在此仍是 **口語**；必須拍真正 extension，不以 Flutter preview 補槽。

## 11 功能的實拍重點

| 功能 | 新來源中要注意的實際差異／拍法 |
|---|---|
| AI 助手 | 三模式 tag／sheet、自訂輸入與新繁中名稱有實質 UI 改變；主圖看圖解答、entry 真模式入口、scenario 真餐廳回合各一張。 |
| 任何 App 翻譯 | Flutter／原生擷取與 PiP 主實作檔本次未變，繁中字串有重寫；仍須新來源真正字幕＋畫面文字結果及 setup 三張。不能用 receipt 取代兩模式實測。 |
| 文字 | Helper 標題本地化，以及底部編輯欄 placeholder 改為正常輸入提示；可正常重開公開歷史，notes 寫歷史結果。 |
| 照片 | Photo/OCR 主畫面實作檔未變，Scan 提示與文案有更新；拍實際 OCR 覆蓋／詳情，不能拿 Chat 看圖代替。 |
| 語音 | 模式 tag 改用共享 pulse／clip 行為，設定與場景字串更新；完成雙語回合為主圖，不以設定頁當成果。新 Chat 語音 transport 的改動不當作現場語音翻譯已測。 |
| 菜單 | Scan 主流程未見新增入口，繁中備註／整理／給店員看等字串有改；新 UI 內重拍公開結果、options、staff，核對相同數字，沒辨識幣別就不補幣別。 |
| 文件 | 整理主實作未變，字串更新；段落結果與對應原圖兩張，維持實際頁數，不用表格圖冒充文件主圖。 |
| 表格 | 主實作未變，Scan 字串更新；表格結果與點開原文兩張，重新核對日期與時間。 |
| 鍵盤 | 原生字串大量改寫；在公開未送出草稿實拍正常 extension 翻譯，之後復原鍵盤並只移除本任務草稿。 |
| Helper | 預設標題隨介面語系顯示，新舊紀錄皆受影響；拍完整解說，明記新 Provider 或歷史重開。 |
| Widget | WidgetKit 畫面檔本次未改；API 改為可接受小於或等於預期數量的有效卡片（`LearningWidgetAPI.swift:184` 附近），不承諾每次固定滿額卡數。拍原生 WidgetKit／真 Widget；placeholder 只可稱預覽。 |

`lib/main.dart`、`lib/theme.dart` 與主要 Photo／Scan／ScreenTranslate UI 檔未列入此次 diff，不能由此推定所有 runtime 行為等價。所有新圖仍需新 artifact／guard 實拍，不採相容性重標。

## 19 個槽位與成果界線

模板保留原有 identity：11 個 primary；gallery 為 chat/chat-entry、chat/chat-scenario、screen-translation/screen-text、screen-translation/setup、menu/options、menu/staff、document/original、table/cell-source，共 19 張。

1. safe receipt 與本輪 guard 到齊後才建立真正 input；各張來源填實際 source base／version／環境，notes 保留 lockfile deltas 的來源界線。不以 version/build、舊 r3／r4 guard 或 container 名稱單獨當來源證據。
2. Root 逐張批准全畫面公開性；再核 sidecar、PNG SHA、原生尺寸、時間及 guard／receipt。歷史公開結果可正常重開拍新 UI，但 reviewNotes 明記 **歷史 Provider 結果，沒有本次新請求成功**。
3. 原 PNG、拍攝時間與來源 bytes 不改；sourceVerification 只引用原 safe receipt 的 path/hash，sidecar／guard／復原觀察保留 ignored evidence。沒有資料注入、清歷史或像素重畫。
4. Root 已明確交接 source／snapshot／icons／import／index／manifest ownership，授權 18 張先正常匯入為 partial；19 張齊後再正常追加匯入並驗完整集合。保留舊 full manifest archive／excluded／原圖；不能靠 metadata-only 或假 receipt 變 complete。

## Copy／checker 與 source 切換分開處理

- Root 後續授權先套最小 copy 與 v101 checker：`main-common-zh-tw.json` 只把真正六語氣選項的朋友改為輕鬆；`main-chat-zh-tw.json` 將自訂需求的「說出主題」改為自訂場景／目標，並對齊目標練習／場景練習。保留一般朋友情境及價值式文案。原提案保留在 `output/main-220-review/main-220-copy.review.patch`，**已套過，不重套**。
- `check-main-content.mjs` 的 v101／三模式／自訂輸入／新 intro／輕鬆語氣契約也已套用。原四起始建議與 source／PNG gate 保留；移除對所有模式 sheet 的錯誤禁止，仍禁止五模式、自由練習與獨立「我的句子」。實際 checker 的 Node 語法檢查與兩個 copy JSON parse 已通過。
- Root 後續明確授權的 18 張中間態已執行：`main-current.mjs`、pricing source/SHA、icon snapshot source 均切為 25040，方案額度與 SVG bytes 不改。`main-220-source-switch.remaining.patch` 已套過，僅留追溯，不重套。
- 正常 importer 產出 active 18 張／11 主圖，全部為 25040 來源，0 歷史圖與 0 低解析 Mirroring。Importer 與 checker 共用原本相同的 19 identity 集合；補了 importer 完成條件，避免只因 11 主圖齊就錯標 complete。4 個小 self-check 覆蓋 19 可完整、18 缺 screen-text 必須 partial、重複圖／額外 identity 不能通過；既有 source／PNG／WebP／RGB 與 excluded-history gate 保留。
- 完整 native checker 已逐張通過 18 張 bytes／RGB／獨立 receipt，最終 **exit 1 只因缺 `zh-tw/screen-translation/screen-text`**，manifest 正確為 partial。舊 13 張 manifest 原 bytes 存為 `output/native-captures/provenance/18ad164f19d04e5b1ef8bd2c5fdec7eba51bff3477c95da453db7bad3ec10464.json`；33 個舊圖片檔 hash 全不變。紀錄在 ignored `main220-import-before.safe.json`／`main220-import-after.safe.json`。
- `output/main-220-review/prospective-files.json` 保存原提案與 preimage，`source-review.safe.json` 保存來源／receipt 證據；不得把其中已套 patch 當成尚待套用。

本文件 owner 沒有手機操作、runner、App build 或部署；已做的是本地網站 source 切換與正常 native image 匯入。截圖／操作最終驗收仍由真 receipt、本輪 guard 與 Root 批准的實拍圖建立。

## 最後一張的唯一真實額外來源（Root 已批准，證據到齊才啟用）

另一工作已安裝同版本、不同 container 的 App。Root 明確決定不重拍既有 18 張、不降版／重裝、不把新圖重標 25040；只允許 **`zh-tw/screen-translation/screen-text`** 使用真來源 `c8d7b2d5522abb1edc89b9bf01fd9847e5d4f991`。

- 固定 Git object 比對已確認：runtime diff 只改 `base_snack_bar.dart` 的 toast 背景色，另有其測試檔變動；Screen surface 檔未變。兩個 source 的完整 public config 均為 v101，原 bytes SHA 都是 `15ecba386ea5e4a2f899a267aa192edc4ce1d033326451fbf1cc556c555e0ef6`。本文件 owner 另先核新保存 IPA 的 package hash，再實取其中 bundled public JSON，SHA 亦相同；13 個 Screen／PiP／Broadcast／theme／字串／config Git blob 逐項一致。
- Content／pricing baseline 保留 25040。新圖填真 c8d7 source、真拍攝時間、新 receipt／guard；舊 18 張 metadata／source／時間／bytes 完全不重標。
- 只為這一個 identity 固定額外來源白名單與真 receipt／surface proof hash，不接受任意 commit，不引入一般化相容性或舊圖代表新來源的機制。
- Manifest 明列來源分配；新圖使用 `verified-review-source`，不是 `current-main/25040`。保留 `currentMainImageCount=18`，另以明確的 `verifiedReviewImageCount` 與同一 strict 19 identities 判定本批完整；每圖原 artifact/source/pixel gate 照常驗。
- 窄 schema／classifier／checker 已實作，政策檔為 `scripts/native-capture-review-policy.mjs`，只接受此 identity／c8d7／指定真 proof。成功新 guard SHA 刻意留 **null**，因此目前 c8 圖仍不可採；不是將 r8 preflight 當成功。術語只存在 metadata／本地文件，不放官網購買流程。

### 本輪交接：18／19 partial，停止輪詢

機器可讀交接檔為 `output/main-220-review/current-handoff.safe.json`。Active manifest 與 index 的完整 bytes 仍與 18 張正常 import 後相同，18 張的 source／版本／時間／平台／環境／原 PNG hash 與尺寸已逐項比對保留；沒有 c8 新圖被採用。

| 真證據 | 路徑與 SHA-256 |
|---|---|
| c8 canonical artifact receipt | `/Users/luyi/.codex/artifacts/website-native-capture-20261116/artifact-verification-current220-c8d7-r2.safe.json`；`da8ad351bde2e96f9510fab14f0326baf487ceadba1e4ce79e159ec624dc9251` |
| Native surface diff | `/Users/luyi/.codex/artifacts/website-native-capture-20261116/current220-c8d7-surface-diff-from25040.safe.json`；`53ceda4ac685e4413d315dd511ea3fdbd677ce477dae078545b62f15b6dd833e` |
| Git＋實際 IPA public config／13 surface hashes 的固定 review proof | `output/native-captures/review-source-verification/454bbdd6463a55b5568d4684db64653f583b376a54792440c5fcc2ae7504120d.safe.json`；hash 同檔名 |
| 不可採圖的 r8 preflight | `/Users/luyi/.codex/artifacts/website-native-capture-20261116/current220-c8d7-r8-preflight.safe.json`；`e7004380a696973811995c3a4e888b2283f1d90fc57fdc31f2a71304e90733af` |
| r8 actual installed metadata | `/Users/luyi/.codex/artifacts/website-native-capture-20261116/device-installed-current220-c8d7-r8.json`；`59752ab271686cd143984aded150df53dbb53da7f4051be1b7fca731ec3c05bf` |

r8 未完成 XCTest 驗證、沒有 runner ready；官方診斷 PNG 是驗證頁，未採用。Root 已詢問使用者並通知，尚待回覆。r9 只離線備妥，沒有新的成功 guard 或已批准 c8 截圖。新 receipt 仍記兩項既有 lockfile delta、非 clean build、未讀／比對 device binary bytes；新安裝輸出沒有 container URL，當前 container 由獨立 installed metadata／guard 固定，不擴大聲稱。

接手只需：

1. 使用者完成驗證後，由 native owner 核當前 source／container，提供真正成功的新 c8 guard 與 installed metadata path/hash。不得使用 r8 的失敗 guard、診斷圖，或只靠同版本號。
2. 將該成功 guard 的真 SHA 填入政策檔；收取 Root 批准的正常 `screen-text` 原 PNG／sidecar。新圖填真 c8 source、canonical `sourceVerification`、固定 `reviewSourceVerification` 及新 `installedSourceGuard`，不動原 18 張。
3. 保存當前 18 張 partial manifest archive，再正常匯入 19 張；新增圖不走 metadata-only。Native check 應顯示 baseline 25040 圖 18 張、verified review 19 張、實際來源分配 18＋1，並通過同一 exact 19 identity 與全部 source／pixel gate。

目前已完成 syntax、窄 scope 負例與 native 18 圖檢查：所有 bytes／RGB／receipt 驗證通過，唯一 exit 1 為缺 `screen-text`。沒有重跑 full build。Root 回報網站 ts／marketing、打包／633 路由／SEO 已過，full build 的唯一未過項亦為第 19 張；詳見 Root 的 `main-220-local-review-20261117.md`。本代理無背景程序，停止輪詢並交回 Root；Vite／本地預覽由 Root 保留。沒有 commit、push 或部署。

## 後續階段：GPT Image 語系衍生圖

- 使用者已授權：截圖完成後，用 GPT Image 將圖中文字依對應介面語言本地化。**先完成並讓使用者確認繁中，再啟動其他語系**；目前 18 語仍 deferred，不提前生成。
- 保留本輪原始 PNG、原 hash／時間／來源證據，另產生衍生圖。沿用真實版面、配色、按鈕、數字與功能；參照 App 真實語系字串，讓原文／譯文角色和語言對保持合理，不增造功能或測試結果。
- 衍生圖需記 target locale、原圖路徑／hash 與 GPT Image 編輯來源，明確分類為本地化衍生圖；**不能冒充該語系原生實機截圖或新 Provider 證據**，也不寫入本輪 native raw／source gate。
- 本輪 19 張仍只接受未改像素的繁中原生截圖；後續圖像文字編輯不會補足、覆蓋或降低此 gate。
