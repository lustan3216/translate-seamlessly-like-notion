# 目前 main 的官網實圖重拍計畫

本次目標來源：`61bdbe4024f709e29109b321130023909f89411b`（53b／358 原證據保留；已追加核對 8727..e9 的 v98 intro、四初始建議、AI 看圖重點與語音回接，學習兩入口不變；e9..61bd 僅 RC／gateway 等修復，沒有新增行銷功能）。所需功能直接取自 `src/data/main-current.mjs` 的 `currentMainFeatures`，共 **11 項**；不再把舊獨立 Voice Agent 當成現行入口，新增獨立表格與「任何 App 翻譯」。目前只驗收 `zh-tw`，其他 18 語系延後，不能用英文或跨功能圖補洞。

## 現在的真實狀態

| 檢查層級 | 本次結果 | 能證明／不能證明的事 |
|---|---|---|
| 原始 PNG、來源宣告與輸出 bytes | 7／11 主圖＋6 張 gallery；共 13 張 active 新圖 | 全部為 11／17 原生 1290×2796 PNG，正常 importer 輸出全幀 lossless WebP；核對原圖／輸出 hash、尺寸與 RGB。 |
| 獨立 artifact 來源 receipt | 7 張主圖、共 13 張圖 | 對上 `61bdbe402…` 的實際已驗證 artifact、版本 `2.1.4+202611120405`、主 App 簽章與 compiled Dev routing，以及 r3 已安裝來源 guard。這不能代替 ScreenBroadcast 路由或 PiP／Provider 實測。 |
| 目前 main 新截圖 | **7／11 主圖，13／13 active 圖** | 已匯入 Text、Helper、Menu、Document、Table、AI 助手、原生鍵盤；缺項保持缺，不用舊來源補。 |
| 尚待實拍 | 任何 App 翻譯、照片、語音、Widget | 任何 App 翻譯只有 setup 候選，未代替結果主圖；其餘尚無本批主圖。舊 664×1440 Widget 僅保留追溯，沒有放大或放回 active。 |
| 歷史與退出 active 圖 | 舊完整 manifest、原圖及 excluded Chat 紀錄皆保留 | 舊 active 的 24 個 raw／衍生圖片檔 hash 不變；舊 manifest 原 bytes 存為 `cfe8d4fd…` provenance archive，連同更早 `f7a9bd59…` archive 由新 manifest 引用。 |

**所有 11 項都要按當前 main 的中性灰 UI 重拍，目前完成 7 項主圖。** 歷史圖不再混入本批 active；不能標成「當前 main 全功能圖已完成」。不得把舊 source commit、原生 build、捕捉日期或舊圖片 bytes 改標成新版本。

## 2026-11-17 本批實拍調整與本地匯入

本段覆蓋下列初始 shot list 的本批拍攝安排，保留既有對話，沒有為了截圖清空私人 Chat。因目前 thread 非空，無法安全拍齊完整 intro 與四個一般初始建議；這項畫面仍未驗收，不以其他內容冒充。

本批沿用 `chat-entry` 技術 gallery key，實際記錄 **AI 助手的初級英文餐廳場景開始、三項任務與四句關鍵表達**：`assistant-restaurant-first-response-042712488300.png`，Root 已全畫面確認無私人對話。它是正常選場景後的新 Provider 首回合（Welcome to Blue Olive），不是 intro 或四個 start chips。alt／reviewNotes 依實際畫面描述；保留 key 不代表已完成舊清單的 intro 要求。

`chat-scenario` 已另拍 `assistant-scenario-public-complete-042901689545.png`：真麥克風 ready 後，由 Mac Samantha 朗讀公開句子經空氣進入 iPhone 麥克風，實際辨識詢問菜單與素食，AI 真正接續問答，畫面顯示更新的關鍵句。正常暫停移除 voice glow，未注入逐字稿；三項任務尚未全部完成，不稱全課通關。

獨立主圖 `assistant-dismiss-keyboard-for-result-043108147589.png` 透過正常相簿附加公開 CC0 禁止游泳照片、繁中提問並得到真 Provider 解答，說明禁止游泳標示與英文提醒。Root 已確認完整 viewport 僅本任務公開餐廳及照片問答，沒有私人對話或通知。此圖代表 AI 看圖理解，不能延伸成 OCR 正確率證據。三張原生 PNG 皆為 1290×2796，來源 receipt 與 r3 已安裝來源 guard 已核對，已隨本批正常匯入。

Root 授權後，從 14 張 ignored 候選另建 `main61bd-zh-tw.import-input.json`，以正常 importer 匯入 **13 張／7 個完整功能組**，capture set 為 `20261117-zh-tw-main61bd-r3`、真實拍攝批次 `2026-11-17`。`screen/setup` 因缺同功能 primary 而留在候選，沒有跳過每組恰一主圖的 gate。原候選 bytes、原 PNG、sidecar、時間與 source 皆未改。此為本地 active 更新，沒有 build 或部署，狀態仍為 partial。

## 逐功能主圖與補充圖

每個功能先有一張清楚的真實主圖；補充圖必須來自同一功能的正常操作，不能拿另一個功能的畫面充數。以下 shotId 為待拍命名規劃，**不是已取得素材**。

| 功能 ID | 主圖內容 | 建議補充圖／操作證據 |
|---|---|---|
| `chat` | 新版 Chat 中，公開語言問題與真實 AI 回覆，保留現行 composer、麥克風入口與最新導覽。 | `chat-entry`：本批實拍餐廳場景開始、三任務與四關鍵句（見上方調整），不可稱 intro／四初始建議；完整 intro／四建議仍待隱私安全的拍攝條件；`chat-goals`：對話內目標卡、語言列與既有進度；`chat-scenarios`：對話內場景卡及選取後的難度卡，選難度即開始；`chat-custom-goal`：目標卡開著時打字／說出公開需求後，實際產生的第一單元；`chat-sentence`：從目標計畫正常進入的語句卡與回答後狀態；`chat-scenario`：真實角色、任務與作答對話；`chat-voice`：真實麥克風回合與同一 Chat 字幕；`chat-live-translation`：點口譯建議後的真正接續翻譯，可另驗已開語音送出建議後回接；`chat-recap`：實際作答後回顧；`chat-photo`：公開照片的重點、提醒事項與下一步解答；`chat-history`：只看本任務公開內容的唯讀歷史。旗標與支援語言需由目標環境實讀；不要用 bundled catalog 或假進度冒充已啟用。 |
| `screen-translation` | 在其他 App 觀看公開授權影片，真正 ReplayKit App 音訊與 Provider 產生繁中 PiP 字幕。 | `screen-text` 必拍：公開外文網頁／文件＋真正畫面文字 PiP，能看出翻譯區域；`setup`：兩模式與目標語言；`running`：本次原文／譯文記錄；`history`：本地紀錄。系統直播確認可供指南，但不能取代兩模式結果。不得重畫 PiP、注入逐字稿或使用 fake replay。 |
| `text` | 公開短訊息／Email 的正常翻譯結果，顯示新中性灰 UI。 | `tone`：真實選用一種語氣後的結果；需要時補收藏／Helper／Chat 正常入口。不要讓純設定畫面代替結果。 |
| `photos` | 從相簿正常匯入可公開的英文標示原圖，完成正常 OCR／翻譯並顯示譯文覆蓋；不需要人拿手機對鏡頭。 | `detail`：點真正辨識區塊後的翻譯詳情；可保留原圖比對。相機空畫面、沒有文字或只停在照片 picker 不算完成。 |
| `voice` | 真實公開範例語音經正常麥克風／Provider 流程得到的雙語字幕；以完成回合為主。 | `modes`：當前四種模式；`summary`：實際完成對話後的總結。不能只用舊「實驗」設定 sheet 當語音成果；不植入 transcript 或合成正常 App 沒有的泡泡。 |
| `menu` | 當前「Scan／整理」類型選為菜單，使用真實公開菜單，實際辨識的菜名／價格。 | `options`：真實加選、份數與正確金額；`staff`：給店員看的原文點單；`original`：原圖。主圖與點單數字應自洽，不挑明顯誤譯菜名當重點；不能修圖片上的翻譯或價格。 |
| `document` | 當前文件類型，真實公開文件整理成段落／標題／清單的完成結果。 | `original`、`source-text`：原圖與真正文字原文對照；多頁功能需真實加入多頁，不能用單頁 screenshot 宣稱多頁驗收。原 table gallery 不改當新 table 主圖。 |
| `table` | 當前新增表格類型的真實公開表格結果，欄列、數字／日期清楚可核對。 | `original`：原表格；`cell-source`：實際點文字核對原文。拍圖前核對重要數字、欄標與可捲動行為；不得用舊文件 gallery 換 feature 名稱來補槽。 |
| `keyboard` | 在支援的安全公開輸入欄中，真正 AnyTranslator 原生 extension 翻譯文字／調整語氣的結果。 | `clipboard`：正常剪貼簿翻譯結果卡；可選 `dictation`：iOS 原生聽寫後由使用者檢查文字，再翻譯。App 裡未聚焦的靜態 KeyboardPreview 不是 extension 實拍；不替使用者新增 Full Access 或其他權限。 |
| `helper` | 公開文字的實際文法／例句／逐詞等解說結果，符合當前中性灰 UI。 | `custom-instruction`：正常保存並套用公開自訂解說指示的結果；只寫既有功能，不能當文件知識庫上傳。盡量透過正常 Home→App 重開移除非必要的其他 App 返回標記，不改像素。 |
| `widget` | 優先拍系統 WidgetKit 小工具圖庫中 AnyTranslator 的原生預覽，或真正主畫面 Widget，原生高清且內容可公開。 | 以原生 WidgetKit 圖庫避免公開私人桌面；Flutter 教學／指引不作原生 Widget 主圖。僅有 placeholder 時明記預覽狀態，不當作 Provider 成功。可補 Lock Screen 的實際 Widget／開啟流程。iOS 17+。舊 664px Mirroring 不能放大後當原生高清；App、Keyboard、Widget 各保留自身呈現方式。 |

後續 `53bdfc0f4` 已移除 Chat mode sheet，改為 intro 與對話內情境／目標選擇；兩種螢幕翻譯模式也改成共用可支援的目標語言。此處 shot list 已對齊 `main-chat-audit-20261116.md`：不拍已移除的五模式 sheet、獨立語句訓練、自由練習或「我的句子」入口；語句只拍目標計畫內正常進入的單元。圖片管線依 `main-current.mjs` 取得目標；本計畫最新目標為 `61bdbe4024f709e29109b321130023909f89411b`；e9 Chat 證據行號保留，e9..61bd 沒有改 Chat UI 或公開 v98 設定。358 在兩按鈕上方增加 `ChatIntroLearn` 導引句；e9／v98 再更新 AI 語言助手 intro、四初始建議、AI 看圖解答與一般 send 建議語音回接。最新 intro 實拍需完整保留導引句與實際四建議；既有 53b 功能證據行號與初次 d64 審查仍由各功能 audit 保留作追溯。

Chat 的完整來源、旗標與每張內容見 `main-chat-audit-20261116.md`；任何 App 翻譯見 `main-screen-translation-audit-20261116.md`。兩者的圖片應與頁面段落逐一對應，不能同一張主圖在各種課程／字幕／文字模式之間反覆充數。

## 來源與清晰度要求

- 拍攝前、批次結束時核對實際安裝的 App `version+build`，並與對應 binary 的 source／環境 receipt 相符。main merge、Flutter test、golden、replay、mock 或網站畫面都不是實際 App 操作證據。
- 只使用正常 App UI 與可公開內容；避免私人聊天、歷史、通知、帳號和交易資訊。必要的新權限或 iOS 自動化驗證由使用者完成，不以假資料／假 identity／直接改資料庫繞過。
- 原始 PNG／其原始 metadata 不變；保存來源 source commit、環境、時間、尺寸、SHA-256 與 Provider 成功／UI 完成狀態。`captureBatchDate` 是實際原拍攝批次，更新 review 日期不改成今天。
- 原始 screenshot 使用該裝置真正原生解析度；不放大、不重畫 UI、不修訂譯文，不把 Mac 鏡像視窗投影當成原生高解析截圖。輸出為全幀 lossless WebP；768px responsive 版僅在確實較小時產生，descriptor 對應真實像素寬。
- 完成前看清原圖、四角、文字和數字，檢查載入／錯誤／來源與結果是否一致。編碼與 hash 通過不能代替 UI 內容和實際互動驗收。

## 管線的新來源 gate

`scripts/prepare-native-app-images.mjs` 與 `check-native-app-images.mjs` 共同匯入 `main-current.mjs` 的目標來源與 11 項功能，仍只要求繁中，18 語系 deferred。

### 可用舊圖與當前 main 分開計數

Manifest 現在保存：

- `verifiedCaptureCount`／`verifiedImageCount`：原始 source metadata、PNG、lossless 輸出及 locale／feature 對應的驗證數；包含明示的歷史草稿。
- `sourceVerifiedCaptureCount`／`sourceVerifiedImageCount`：有獨立 artifact 來源 receipt 並對上 source／version／build／signature／routing 的數量；不要求該 source 等於本次 main，因此不能當 current 數。
- `currentMainCaptureCount`／`currentMainImageCount`：精確符合 `targetSourceCommit`、具有效 receipt，且不是待替換 Mirroring 的數量。
- `historicalDraftCaptureCount`／`historicalDraftImageCount`、`staleImageCount`：舊來源或尚未完成來源／解析度條件的 active 圖。
- 每張圖與 index 都有 `sourceCommit`／`freshness`，不把舊圖悄悄改標新 main。

只有 11 項必需主圖都符合 current-main、而且所有 active gallery 也都符合時，才可變成 `status: complete`。舊圖 bytes 完全有效、甚至有真實舊 artifact receipt，也無法讓這個 gate 通過。

### artifact receipt

新拍攝 input 可加：

```json
{
  "sourceVerification": {
    "path": "/absolute/path/to/artifact-verification.safe.json",
    "sha256": "the actual 64-character SHA-256 of that existing receipt"
  }
}
```

這是輸入格式說明，不是已取得任何新 main 圖片的宣告。Receipt 須有真正來源 `sourceCommit`、`bundles` 中 `com.gpt.langpt` 的 version／nativeBuild、已驗證 signature／routing，以及 routing environment。分支 gateway override 必須與 capture host 相同；使用預設 gateway 時則須 `aotRoutingVerified: true`。本次舊 Menu／Document 沿用實際已存在、來源為 e5c2… 的 safe receipt，**仍舊不等於本輪目標 main**。

管線會驗原始 receipt hash，將它原封不動保存於 ignored `output/native-captures/source-verification/`，public manifest 只記本地相對引用，不公開原始 absolute artifact 路徑。影像來源及內容仍須人工／實機記錄核實，不能只手寫一個 `verified: true`。

### 前次僅更新 metadata（匯入前紀錄）

前次匯入前曾使用：

```sh
node scripts/prepare-native-app-images.mjs output/native-captures/fresh/verified-zh-tw-main-review-20261116.json --metadata-only
node scripts/check-native-app-images.mjs
```

`--metadata-only` 只可保留已存在 capture set／拍攝日期和既有原圖；不得新增圖、改 source／version／拍攝時間或替換 bytes。它不呼叫 WebP encoder。

舊完整 manifest 已按原始 bytes 的 hash 保存為 `output/native-captures/provenance/f7a9bd594a7a3d1b7cf936f78df0bcd8a4ca27294beb05784685f715c899b6ea.json`，並由 public manifest 引用／驗 hash。匯入與 checker 都核對這份保留來源，禁止把同一原 PNG hash 改標另一個 source／build。舊 Chat 的退出原因亦在 `excludedCaptures`；它不再出現在 active index。

## 2026-11-17 正常匯入的實際檢查

```sh
node scripts/prepare-native-app-images.mjs output/native-captures/fresh/main61bd-zh-tw.import-input.json
node scripts/check-native-app-images.mjs
```

- 正常 importer 成功；未使用 `--metadata-only`。完整 checker 已逐張驗過 13 張 raw PNG、獨立 source receipt、full-frame lossless WebP、實際存在的 responsive 版、RGB、hash、尺寸、index 對應與來源身分。結果為 **7／11 current-main 主圖，13／13 active 圖，0 舊來源、0 低解析 Mirroring**。
- Checker 按要求 **exit 1**，原因只有缺少 `screen-translation`、`photos`、`voice`、`widget` 四項 current-main 主圖，manifest 正確維持 `partial`。18 語仍 deferred；不得報成全功能完成。
- 匯入首次檢查揭露舊 excluded gate 只比 identity，會把不同原 PNG hash 的新 `chat/primary` 也誤判成已排除舊圖。Root 授權後窄修為同 identity 再核對原 SHA：同 hash 仍拒絕、任何一方缺有效 hash 仍保守拒絕；舊 excluded 與完整 provenance 原樣保留。小 self-check 覆蓋新 hash 可用、同 hash 拒絕、缺 historical／active hash 拒絕，且 Node 語法檢查通過。
- 匯入前後確認原 ignored 14 筆候選 bytes 不變、舊 active 的 24 個 raw／衍生檔 hash 不變；新 13 張保存原 `capturedAt`、source、version/build、1290×2796 與原 PNG hash。Importer／checker 已結束，未建置、未部署。

### 本輪 owner 交接

- 候選檔：`output/native-captures/fresh/main61bd-zh-tw.capture-input.json`，共 14 筆；含尚未匯入的 `screen-translation/setup`，以及不計入 captures 的鍵盤復原觀察。`supersededCandidates` 保留舊 keyboard-open Text 候選。只有 Root 全畫面批准的原 PNG 才能追加，不能自行從 observations 補槽。
- Active 匯入輸入：`output/native-captures/fresh/main61bd-zh-tw.import-input.json`，本輪 13 張、7 個完整功能組。Active index 為 `src/data/native-product-screens.json`，manifest 為 `public/app-preview/native/manifest.json`。匯入前後證據為 ignored `main61bd-import-before.safe.json`／`main61bd-import-after.safe.json`；後者記錄 checker exit 1 僅因四項缺圖。
- 後續接手者可續管候選、正常 importer 與 active 影像輸出；先保留原 source／bytes／時間／receipt／guard 與歷史 archive，不將 incomplete 狀態改成 complete。新批次必須重驗當時已安裝的來源，不能單憑同 version/build 沿用 r3 guard。
- Root 已告知本輪手機全黑、等待使用者回 App；native owner 已關閉 r3／22088 並釋放自己的鎖，另留 r4 resume receipts。此處只交接 Root 的狀態，沒有再操作手機或重新取得建置鎖；下輪仍須等其他建置用完，再按專案規則續拍。
- 本子任務沒有未結束的 importer、checker、server、build 或裝置連線；停止輪詢並將 ownership 交回 Root。網站預覽由 Root 保留給使用者檢視。

## 前次僅刷新 metadata 的檢查留存（匯入前）

- 只改兩支管線、active index／manifest、相關 ignored metadata 與本計畫；未碰 App、CSS、AppScreen、瀏覽器、手機、建置或後端。
- 兩支 Node 檔語法檢查與有意義的來源 gate self-check 通過：舊 source 不能當 current、只宣告目標但沒有 receipt 不能 current、同 bytes 不可改標 source／build、錯 source receipt 被拒、Mirroring 不算 current。
- metadata refresh 前後比對 **27 個 raw／衍生圖片檔案，hash 全相同**，包含已退出 active 的舊 Chat；沒有重壓縮、放大、重畫或刪除圖片。
- `check-native-app-images.mjs` 已逐張重新核對來源宣告、raw PNG、WebP／responsive dimensions／bytes／RGB，並正確 **exit 1**：0／11 current-main，6／11 historical draft 主圖＋5 gallery；缺草稿的五項是 Chat／任何 App 翻譯／照片／表格／鍵盤，Widget 另需原生高清替換。這是正確未完成狀態，沒有跳過 gate。
