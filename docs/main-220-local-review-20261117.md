# 2.2 繁中官網：本地實拍與 Taste 複查

狀態：**18／19 張，尚未完整驗收**。僅本地預覽，沒有 commit、push 或部署。

## 已完成

- 正常匯入 18 張全新 1290×2796 實機圖，覆蓋全部 11 個功能主圖與 7 張補充圖。原始 PNG、時間、hash 與來源保留；全幅 lossless WebP 的 RGB／來源檢查通過。舊批 archive 與 33 個原有檔案 hash 保持一致，沒有把舊圖改標成新版。
- 文字／Helper、照片 OCR、雙語語音、菜單／加料／店員點單、文件／原圖、表格／原文、AI 助手／三模式／餐廳場景、原生翻譯鍵盤、WidgetKit 預覽、ReplayKit 真影片字幕均已有對應畫面。歷史掃描重開、場景開場、原生預覽與新 Provider 結果分別如實記在 capture notes。
- 真實草地照片與 Tears of Steel 的來源、作者、授權及必要變更說明，僅在精確對應的新版圖啟用時顯示。沒有套用到整個 App／UI。
- Taste 複查修正 Helper 的「回覆建議」名稱、Mac Blog 的文章標題；繁中首頁改為先展示新版 AI 助手。桌機用真模式入口與看圖解答雙圖，767px 以下只顯示較大的主圖，避免兩張手機畫面縮得太小。
- 保留 10 個首頁應用場景、11 功能、7 使用流程與 9 篇文章。文案維持價值主句及核心重點，段落最長 78 字。

## 本輪檢查及界線

- 最新 TypeScript、`check:marketing` 與 `git diff --check` 通過。37 條繁中 SSR 路由及官方 Taste copy-lint 通過；英文與其他 18 語系保持延後範圍。
- Codex 原生 IAB 檢查 37 頁的 1440／1024／768／390px，以及 320px 窄螢幕；另核對代表頁桌機／手機深色模式、實際繁中→英文→繁中切換與明暗語言選單。沒有發現橫向溢出或破圖。320px 有三筆初始讀取早於 React 渲染，等待實際 H1 出現後複查均正常；原始觀察與複查分開保留。
- 首頁最後的雙圖／手機大圖調整，另實操六個預覽切換 × 桌機／手機，均載入正確實機圖且無溢出；桌機明暗構圖也已實看。
- 中間態 full build 已完成 Vite 打包、633 頁 prerender、SEO 與品牌檢查，但整體 exit 1：**只缺 `zh-tw/screen-translation/screen-text`**。之後的首頁微調以最新 TypeScript、SSR 與 IAB 驗證，尚未宣稱最新整體 build 通過。
- 官方 Taste headless Browser Gate 未執行：本專案要求所有網頁互動使用 Codex 原生瀏覽器。上述 IAB／離線檢查不是 `GATE: PASS`。

IAB 證據：`docs/main-preview-20261117/`；SSR／lint／build 證據：`output/taste-final-audit-20261117/`。

## 唯一缺圖與續接

18 張已採圖來源為 `25040c54255b2f7dd073965a749f19ec378e9677`，Development／TestFlight routing，含既有兩個 lockfile delta，不能稱 clean-commit build；沒有讀回手機 binary bytes。

拍最後一張畫面文字 PiP 時，r6 controller 發生原生 driver trap。之後依使用者要求等待其他工作用完建置鎖；另一工作已原地安裝 source `c8d7b2d5522abb1edc89b9bf01fd9847e5d4f991`。它的獨立 artifact／交付／安裝來源已驗，Screen surface 與 public config 另有真實檔案比對證據。既有 18 張不重拍、不重標、不降版。

最後一圖會保留它實際的新 source／receipt／新 guard；只允許這個確切 identity 的已驗來源，不改原有 18 張的 metadata，也不降低 19 張集合與像素驗證要求。Content／pricing 基準仍為已審核的 25040。

r8 沒有 ready；USB 原生診斷圖實際顯示「Enter iPhone Passcode for “XCTest”／Enable UI Automation」。已請使用者直接在手機完成、不要傳送密碼，並發出原生 macOS 通知。等待「已驗證」後再啟已準備的 installed-only r9，不重建／重裝 App。Root 是唯一 UI 手勢 owner；恢復後先觀察，再正常關閉 Files 播放器、完成公開文字畫面與 PiP 翻譯，最後確認停止直播。

本機 helper 現在以官方 `devicectl device orientation get` 的真 `deviceOrientation == portrait` 作手勢前置條件；不以 portrait PNG 或 `NonFlat` 值冒充方向，也不每次強制改方向。非 portrait 時拒絕手勢，需另明確設定後重拍重看；讀取到手勢間仍存在方向變化的時間界線。這次 helper 調整僅過離線語法檢查，新手勢仍待實機續接。

Native owner 保存 r9／c8 receipt 與 guard 路徑於 `/Users/luyi/.codex/artifacts/website-native-capture-20261116/`。本任務 r8 與 proxy 已停止，建置鎖已釋放；預覽 Vite 與 IAB 分頁保留供使用者查看。

## 圖片文字本地化

依使用者新增要求，三張仍有英文 UI 的繁中衍生圖提示已備於 `output/imagegen-localization-220/zh-tw-prompts.json`，**尚未生成或採用**。等原圖拍齊後使用內建 GPT Image，只換介面標籤；保留照片、數字、功能、真實版面、來源原文與譯文的語言角色。衍生圖另存並記為文字本地化編輯，不冒充未編輯的原生截圖。其他語系仍待使用者確認繁中後才處理。
