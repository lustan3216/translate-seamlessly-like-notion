# 真實 App 截圖輸入與驗證 — 2026-11-14

> **歷史紀錄（2026-11-14）**：以下舊功能／頁面／圖片數量、Voice Agent 流程及圖片驗證證據只對當時來源成立，不代表目前 main `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487` 的功能、畫面或新版截圖驗收。
> 最新本地繁中狀態以[更新總覽](main-website-update-20261116.md)、[main 功能盤點](main-feature-inventory-20261116.md)與[新版截圖計畫](main-screenshot-plan-20261116.md)為準；本文保留供追溯。


> 使用者最新範圍：先完成繁體中文的 10 個功能圖與本地官網驗收。其餘 18 語系重拍延後，待使用者確認繁中後再處理。
狀態：主代理已透過原生 XCTest 截圖取得 **1290×2796 真實 iPhone PNG**，後續優先使用這個來源。devicectl framebuffer 在 Mirroring 啟用時仍可能全黑。先前的 664px Mirroring 畫面僅能作為明確標記的暫時素材，必須換成原生高解析度截圖；禁止放大後冒充高清。不能將舊圖、AI 照片、功能插圖、Golden 或 replay 當作替代。網站的 active native index 為 `src/data/native-product-screens.json`；缺圖保留缺圖狀態，禁止默默回退英文、舊 App 圖或設計圖。

本輪授權範圍為 **繁體中文 × 10 功能＝10 張主圖**。網站仍支援 19 語系，但其他 18 語系截圖延後至使用者確認繁中後；目前不要求 190 張完成，也不建立其他語系替代映射。

## 擷取範圍

語系：`en`、`ko`、`ja`、`fr`、`de`、`es`、`it`、`pt-br`、`fi`、`da`、`nl`、`no`、`sv`、`zh-cn`、`zh-tw`、`id`、`vi`、`th`、`ru`。

功能：`text`、`photos`、`voice`、`agent`、`menu`、`document`、`keyboard`、`chat`、`helper`、`widget`。`photos` 必須是實際照片／OCR 功能畫面，不能複用 `document` 原始 PNG。

使用真實 App 正常呈現的畫面，先人工確認版本、來源、UI 語言與內容。可在正常功能中輸入不含個資的示範句，但不可開啟 seed／demo／fixture 模式來偽造功能結果。網頁、重播輸入畫面、元件 golden 與圖像生成輸出都不接受。

## 輸入 manifest

在本機擷取資料夾準備 JSON。以下是欄位格式說明，**不是可執行的假素材或已取得的擷取紀錄**；每個值都必須來自實際擷取與驗證。

```json
{
  "captureSetId": "20261114-native-app",
  "captureBatchDate": "2026-11-14",
  "scope": "繁中本地 review",
  "requiredLocales": ["zh-tw"],
  "captures": [
    {
      "locale": "zh-tw",
      "feature": "photos",
      "captureType": "native-app-screenshot",
      "captureMethod": "device-screenshot",
      "originalPath": "relative/path/to/actual-native-iphone-screenshot.png",
      "capturedAt": "<實際擷取時間，帶時區的 ISO 時間>",
      "actualVersionBuild": "<本次實際讀回的 version+build>",
      "sourceCommit": "<對應實際安裝產物的完整 40 字元 commit>",
      "platform": "ios-device",
      "environment": "development",
      "environmentHost": "<已驗證的純 hostname，不含協定、路徑、query 或憑證>",
      "sha256": "<原始 PNG 的 SHA-256>",
      "width": 1290,
      "height": 2796
    }
  ]
}
```

- `captureSetId`：小寫英文、數字與連字號，作為這組素材的本機與公開路徑識別。重新拍攝同一畫面但像素不同時，使用新 ID，不能覆蓋已保存的原始證據。
- `captureBatchDate`：這次擷取工作的明確起始日期，以 Europe/Minsk 日期對照 `capturedAt`。目前這項工作的日期是 **2026-11-14**；工具不自行加上其他任務的歷史日期或任意「幾小時內」規則。後續獲准的新工作應明確指定自己的 batch date。
- `originalPath`：本機實際 PNG 路徑；相對路徑以 manifest 所在目錄為基準。不能是遠端 URL，不能把其他格式改副檔名冒充 PNG。Mirroring 方法的這個 PNG 是經驗證的完整 iPhone viewport 抽取，原始視窗 JPEG 另行保留。
- `capturedAt`：完整 ISO 時間，例如帶 `Z` 或 `+03:00`。Mirroring 一律使用原始 JPEG 的 mtime，不使用較晚產生的 viewport PNG mtime。必須有效、不在未來，且不能早於宣告的 capture job；工具不以檔案建立日期猜測擷取時間。
- `actualVersionBuild`：從實際安裝 App／相符 artifact 讀回的 `version+build`，不能直接抄官網原先盤點的 `pubspec.yaml`。
- `sourceCommit`：與該安裝產物對應的精確 App source commit，不能將同版本字串的另一個 Cloud build 當成同一來源。
- `environment`：`development`、`preview` 或 `production`；`environmentHost` 只放已驗證的 host，不得放金鑰、access URL、query、使用者識別或其他憑證。
- `sha256`、`width`、`height`：原始 PNG 的實際雜湊及像素尺寸，不是輸出圖的預計值。
- `shotId`：可省略，預設 `primary`。同一語系／功能必須恰有一張主圖；其他真實畫面使用 `options`、`staff`、`table`、`original` 等 ID，並各自提供完整擷取 metadata。格式為小寫英文字母開頭、最多 40 字元的英文／數字／連字號，不接受路徑。locale／feature／shotId 組合必須唯一，主圖與 gallery 原始 hash 也必須不同。

支援平台與方法：

| platform | captureMethod |
|---|---|
| `ios-device` | `device-screenshot`、`devicectl-screenshot` 或 `iphone-mirroring` |
| `ios-simulator` | `simctl-screenshot`（仍須是真實執行的 App，不是 seeded／golden） |
| `macos-app` | `native-window-screenshot` |

透過 XCTest 的原生 screenshot API 取得的實體 iPhone 畫面使用 `device-screenshot`。擷取工具只負責讀取真正的螢幕畫素，不得讓 App 以 seed／demo 模式呈現假的功能結果。來源 PNG 保留完整實體螢幕，無 Mirroring 裁切欄位。

Manifest 中若宣告 `seeded`、`demoMode`、`fixture`、`golden`、`replay`、`aiGenerated`、`synthetic` 或 `pixelEdited` 為真，或來源／模式識別為相應類型，工具會拒絕。由 golden、replay、imagegen、editorial、social-v2 或禁止的 screenshots-redesign 目錄讀圖也會拒絕。

## Mirroring 視窗來源與唯一允許的外框抽取

本次 CUA 回傳的原始 Mirroring 視窗是 **696×1532 JPEG**。經主代理對實際視窗確認，完整實體 iPhone 畫面的範圍固定為：

```text
left=16, top=77, width=664, height=1440
```

這個範圍保留整個手機 UI、狀態列及底部 home 區域，只排除外側 Mac 視窗 chrome。這是本次工作已確認的幾何，不是任意裁切 App 內容的權限。工具只接受這一組 geometry；若視窗縮放或尺寸改變，應停止並重新核實整個實體螢幕範圍，不能隨意改參數去裁掉內容。

`iphone-mirroring` 必須另外提供 `originalWindowPath`、`originalWindowSHA256`、`windowWidth: 696`、`windowHeight: 1532` 及 `viewportCrop: { "left": 16, "top": 77, "width": 664, "height": 1440 }`。PNG 的 `width`／`height` 必須是 664／1440。驗證程序會：

1. 確認來源的實際格式是 JPEG，雜湊與 696×1532 尺寸相符。
2. 確認 `capturedAt` 對應來源 JPEG mtime；PNG 抽取時間不冒充捕捉時間。
3. 對來源的固定 viewport 解碼為 sRGB RGB bytes，與 PNG 解碼的 RGB **逐 byte 完全相等**，不允許重畫、補字、遮蓋、補背景或重新組裝 UI。
4. 保存未修改的來源 JPEG 與抽取 PNG，再輸出 664px 無損完整 viewport WebP；不放大、不二次裁切，標記 `replacementRequired: true`。

原始 JPEG 可能包含 Mac 視窗標題，因此只存在本機 `output/native-captures/`，不對外發布。公開網站只使用手機完整 viewport 的 WebP。sourceWindow 的實際 App／裝置來源仍需人工核實；像素相等只能證明抽取沒有改畫面，不能靠 hash 自行證明 App 真實性。

## 匯入

在官網工作目錄執行：

```sh
node scripts/prepare-native-app-images.mjs /absolute/path/to/verified-capture-manifest.json
```

此命令只在所有輸入 PNG 都先通過驗證後寫出：

1. `output/native-captures/<captureSetId>/<locale>/<feature>.png`：完整保存已驗證的主圖 PNG，位元組不變。額外圖片用 `<feature>-<shotId>.png`。Mirroring 同時保存相應的 `-window.jpg` 原始 JPEG bytes 與 mtime。已存在但雜湊不同的原始路徑不會被覆蓋。
2. `public/app-preview/native/<captureSetId>/<locale>/<feature>.webp`：使用 **無損 WebP**，完整保留原生畫面到最多 **1440px 寬**，禁止放大、再裁切 App 內容、改寫 UI 或內容拼接。1290×2796 原圖輸出仍是 1290×2796，解碼後 sRGB RGB bytes 必須與原 PNG 完全一致。若來源寬度大於 768px，先編碼 768px 無損等比版本，**只有其 bytes 小於完整圖才寫出 `<feature>-768.webp` 並加入 srcSet**；縮圖反而較大時僅使用完整原圖。Mirroring 的唯一外框抽取必須先通過上述來源與 RGB 對照，664px 不放大、不產生 768px 版本。
3. `src/data/native-product-screens.json`：只包含確實有驗證擷取的 exact locale／feature，不建立英文或其他畫面的替代映射。`src`、`width`、`height` 一律指向完整解析度主圖；有 responsive 版本才增加 `srcSet`。真實額外圖片放在可省略的 `gallery` 陣列，主圖 API 保持相容。
4. `public/app-preview/native/manifest.json`：每張主圖與額外圖片各自保存 `shotId`、原始／輸出尺寸與檔案雜湊、來源版本、commit、平台、時間、環境及處理方式；每張增加 `encoding: "lossless-webp"`、`originalRGBSHA256`、`decodedRGBSHA256`、`fullResolutionPixelPreserved`、`responsiveVariants`、`resolutionStatus` 及 `replacementRequired`。responsive record 有自己的路徑、尺寸、檔案 bytes／SHA-256、encoding 與 decoded RGB hash。Mirroring 再記錄 `rawWindowPath`、window hash／尺寸、viewport bounds 與一致的 `viewportPixelSHA256`。`verifiedCaptureCount` 只計主圖，`verifiedImageCount` 計所有主圖及 gallery。不公開輸入原始絕對路徑或任意額外欄位。

網站 index 的輸出格式（路徑以實際 captureSetId／locale／feature 產生）：

```js
{
  src: "/app-preview/native/<captureSetId>/zh-tw/helper.webp",
  width: 1290,
  height: 2796,
  srcSet: "/app-preview/native/<captureSetId>/zh-tw/helper-768.webp 768w, /app-preview/native/<captureSetId>/zh-tw/helper.webp 1290w"
}
```

`srcSet` 只在 768px 版本確實節省 bytes 時出現，包含這張圖已驗證的 768px 與完整版本，沒有其他語系或缺圖替代。不節省時 `responsiveVariants` 是空陣列，index 及 capture 均省略 `srcSet`。頁面元件負責將 `srcSet` 與適當的 `sizes` 傳給 `<img>`；不要把完整 `src` 改成 768px。`resolutionStatus` 在正常原生圖為 `native-resolution`、`replacementRequired: false`；Mirroring 一律為 `temporary-low-resolution-mirroring`、`replacementRequired: true`。

### 同一功能的多張真實畫面

輸入仍是平坦的 `captures[]`。例如菜單的主圖省略 `shotId` 或填 `primary`；真正的選項畫面與給店員看的點單畫面，另放完整 capture records 並分別填 `shotId: "options"`、`shotId: "staff"`。文件可用 `table` 與 `original` 保存表格結果及原圖畫面。每張都要自己的原始 PNG、時間、版本／來源與 hash，不能用同一個設定畫面複製成不同名稱。

輸出的 index 形狀如下，只有確實匯入額外真實圖片才出現 `gallery`，以下僅說明結構：

```js
{
  "zh-tw": {
    menu: {
      src: "/app-preview/native/<captureSetId>/zh-tw/menu.webp",
      width: 1290,
      height: 2796,
      gallery: [
        { shotId: "options", src: "/app-preview/native/<captureSetId>/zh-tw/menu-options.webp", width: 1290, height: 2796 },
        { shotId: "staff", src: "/app-preview/native/<captureSetId>/zh-tw/menu-staff.webp", width: 1290, height: 2796 }
      ]
    }
  }
}
```

每個 gallery entry 可以有自己通過 bytes 節省檢查的 `srcSet`。工具會拒絕重複 locale／feature／shotId、沒有主圖的 gallery、主圖與 gallery 共用 PNG hash、Photo／Menu／Document 之間共用 PNG hash，以及會與另一張圖或其 768px 版本衝突的檔名。`requiredCaptureCount` 在本輪為 **10**；`scope` 為 `繁中本地 review`、`requiredLocales` 為 `["zh-tw"]`，其餘支援語系明示於 `deferredLocales`。只有唯一 locale／feature 的主圖計入覆蓋，Gallery 不能補足缺少的功能。

可以分階段匯入真實部分集合，但輸入 manifest 是 **active set 的完整替換**：後續匯入時要包含仍要使用的所有已驗證 captures。不要只傳新的一張圖，卻期待工具默默合併未審核的舊 index。

會拒絕全黑、全白、透明空白或近乎單一顏色的原始圖與輸出圖；capture 指令成功不代表畫面可用。這個檢查只排除明顯空白，仍要人工確認是真正的目標 App 畫面。

不會刪除歷史原始檔，也不會部署、建立 App、操作裝置、呼叫 Provider 或取得憑證。沒有來源時不會自行產生畫面。

## 完整性檢查

```sh
node scripts/check-native-app-images.mjs
```

檢查每張主圖與 gallery 的原始 PNG 格式、hash 與像素、非空白／非單一顏色、版本與來源必要欄位、非合成／非 seeded provenance、輸出 WebP 的 hash／完整比例／不放大、精確語系／功能／shotId index，以及照片、菜單、文件的獨立來源。直接讀取 WebP RIFF chunks 確認是 `VP8L` 無損編碼，拒絕 `VP8` 有損圖；完整版與存在的 responsive 版均逐 byte 對照相應完整來源 raster 的 decoded RGB。未縮圖時另確認輸出與原 PNG 的 RGB hash 完全相等。768px 版本可省略，但存在時必須比完整圖小，`srcSet` 必須剛好對應已驗證的兩張圖與實際寬度。

缺少 captures 或尚有 Mirroring 暫時素材待換時回傳非零，輸出本輪 `已驗證數 / 10` 並列出繁中缺少功能與待換圖片。只有繁中 10 個 exact pairs 全部有可驗證來源、沒有待換的低解析度 Mirroring 且 manifest 標記完整，才會通過。其他 18 語系維持 deferred，不能宣稱完成。沒有找到檔案不等於可使用別的素材補位。

工具驗證的是 **provenance 記錄與 bytes 的一致性**，不是靠 hash 證明來源真實性。它只能驗證提供的檔案與記錄是否一致，不能靠 metadata 取代實際擷取、畫面人工核對與安裝來源驗證，也不能從文字宣告推論實機效能。若有個資／通知／私人聊天，應重新拍乾淨的正常畫面，不能在此管線中修圖抹除後仍宣稱原始截圖。

## 本次工具驗證狀態

最新 active set、主圖／Gallery 數量與待換項目以 `image-refresh-inventory-20261114.md` 及 `public/app-preview/native/manifest.json` 為準。先前 3／4／5 張的階段紀錄已由後續集合取代，不能當成目前覆蓋數。

- 腳本語法、真實 PNG 的 hash／尺寸／RGB、實際 lossless WebP 及有條件 responsive 檢查已執行。
- 實際全黑的 devicectl PNG 被拒絕；不是以成功的 capture 命令當作成功畫面。
- 真實 Mirroring 原視窗的固定 viewport 與 PNG RGB 完全一致；刻意偏移 geometry 被拒絕。
- 真實原生 PNG 的完整 lossless WebP 保留原像素；同來源的有損 WebP 被拒絕。縮圖反而較大時不發布該版本。
- Gallery 的非空索引／Feature／Blog 呈現已用真實圖片驗證。重複 ID、同圖改名、跨掃描功能共圖、缺主圖及 responsive 檔名碰撞會被拒絕，Gallery 不增加主圖覆蓋數。
- 沒有為通過工具而建立假 capture、篡改來源 metadata 或略過本輪 10 張與原生解析度 gate。範圍由使用者明確縮為繁中，現為 7／10 主圖＋5 Gallery，另有 Widget 待原生高清；尚未完成。

## 真實實機操作與來源

本次由指定的 native capture agent 獨占手機 UI；主代理管理既有 XCTest runner、USB proxy 與共用 build lock，不同代理不重疊操作裝置。沿用已存在的 prebuilt runner，沒有重新編譯／安裝 App、清除資料或啟用 screenshot seed 模式。

- 裝置：Lu 15，iPhone 15 Pro Max；原生螢幕 1290×2796。
- 2237、2240、2243 的照片依實際擷取版本與相符產物分別記錄，不能互相改標。2243 為 `e5c2c2d49758a7fca0885da669148e60668d8832`、`claude/screen-translate` 的 Development 產物；Photo／Scan 功能另與選定 main 核對。
- 先讀回 installed App、精確 foreground 與實際 screenshot，再依已觀察畫面正常操作。其他任務可能更新手機，不沿用舊版本假設。
- `/runningApp` 只以指定 bundle 的精確 foreground match 為證據；SpringBoard fallback 不能證明實際主畫面。舊 `/viewHierarchy` 有自動權限處理副作用，不用來探索未知系統提示或判斷前景。
- 每次手勢前即時確認 portrait，使用 100ms touch 並等待正常轉場；避免舊 driver FaceUp 處理崩潰。手機未連線、未知前景或未知權限提示時停下，不觸控其他 App。
- 正常 Home 使用已從本機 Maestro client 確認的 `POST /pressButton {"button":"home"}`；只擷取實際畫面確認轉場，再正常啟用 AnyTranslator。狀態列系統返回標記透過正常回主畫面再開 App 去除，不能修圖抹掉。
- 公開菜單及文件透過 USB image clipboard → Files → Preview → Save Image → App Photos picker 匯入，逐張以正常 Provider 請求產生結果；原始公開素材及來源／hash 在 ignored `output/native-captures/public-inputs/public-inputs-manifest.json`。匯入流程曾接受儲存所需的 add-only Photos 提示。
- 菜單 Provider 已正常完成；先前 noisette 錯譯候選不放入 active index，保留原始證據並正常重拍。文件表格結果的 15 個時間已對原圖，長日期表頭截斷的畫面只作補充，另拍段落主圖及原文對照。

正常 App 畫面真實存在，不代表所有功能、語言或聲學效果已驗收。若後續只改介面語言後拍已儲存結果，須分開記錄 UI locale 與既有結果語言，不能把重新顯示既有結果說成新的 Provider 輸出。

本機持久操作流程在 ignored `output/native-captures/phone-r7.py` 與 `phone-r7-next.md`。啟動／重啟測試仍必須先重新讀主專案的 build/device rules、確認鎖與裝置；不得停止其他工作、繞過鎖、變更帳號或安全設定。網站互動與畫面驗證只用 Codex 原生 IAB/CUA。

## 最新資源狀態

使用者要求手機最後再用並先釋放建置鎖；本任務 r9 runner／USB proxy 已停止，沒有自行重試或接管其他工作。等其他工作用完才續拍。安全續接在 ignored `output/native-captures/continuation-20261114-1635.md`，繁中批次 CLI 在 `output/native-captures/automation/phone-cli.py`；讀回新裝置／版本／畫面後才操作，不重用過期 seen。
