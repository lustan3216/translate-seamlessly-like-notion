# 繁中官網 Taste 離線審核 — 2026-11-17

**Taste Browser Gate：未執行，未宣稱 `GATE: PASS`。** 本次純 Node／TypeScript／SSR 檢查通過；目前 active 圖片檢查仍未通過。今晨已拍的新圖候選與尚未更新的 active index 分開計算，不能把 active gate 的缺數當成「尚未拍攝」數。

審核時間基準：2026-11-17 04:27:39 UTC。範圍是 `website-taste-20261114/translator/website` 的未提交工作樹、繁中37條實際路由；App 功能／截圖基準仍為 `61bdbe4024f709e29109b321130023909f89411b`。其他18語系只驗證既有資料完整性與延後範圍，沒有宣稱完成新版內容或圖片。

**04:51 UTC更新：** active已由主代理匯入為7／11個current-main主畫面、13張61bd原生1290×2796圖片，沒有混用歷史圖；尚缺照片、任何App翻譯、語音、小工具。下方04:27 UTC的0／11為當時離線稽核快照，不能視為最新active狀態。本次另完成禁止游泳照片的繁中條件式頁尾署名，見末節。

## 使用的準則與邊界

已讀實體 [taste-skill 2.5.1](/Users/luyi/.codex/artifacts/anytranslator-website-taste-skill-20261114/skills/taste-skill/SKILL.md)，以及其 `references/copy.md`、`copy-voice.md`、`system.md`、`layout-v4.md`。本輪檢查重點是：先說清產品、事實可追溯、每圖對應實際功能、排版使用共同邊界與語意 token、標題與操作名稱清楚、讀屏名稱完整、主題及 reduced-motion 有一致來源。

- 延續使用者已選的 Typeless 方向及 AnyTranslator 品牌，不重新抽配色、字體或加入通用技能的特效。
- 已授權的「情境示範」與真實 App 圖分開；揭露示意、圖片來源與數字歸因，優先於技能不許標示示意的通用偏好。
- 使用者要求只用 Codex 原生瀏覽器。本輪未呼叫任何瀏覽器；skill 的 headless consistency／layout／shoot／perf／gate 皆未執行，也沒有新增 waiver 或降低門檻。
- SSR 透過Vite middleware loader在記憶體載入，`httpServer.listening=false`；未呼叫listen另啟預覽網站。後續Vite的WebSocket初始化警告另記於修正後驗證，loader最後均已關閉。
- 初次離線審核只產出本報告。後續依主代理明確授權，僅修正下列兩項網站hunk；沒有build、部署、commit或修改App／手機／runner／manifest。

## 本輪實際執行結果

| 檢查 | 真實結果與適用範圍 |
| --- | --- |
| `npm run check:marketing` | exit 0。包含 `checkMainContent()`，核對61bd Git object 的完整公開設定 SHA、方案／掃描限制、官方SVG及對話內 Chat 入口；SSR 實掃37條繁中路由，11功能、7使用流程、9篇文章。另驗既有19語系143個行銷字串、18段文章及16個定價字串。 |
| `./node_modules/.bin/tsc --noEmit -p tsconfig.app.json` | exit 0，無輸出。 |
| `node scripts/check-main-routes.mjs` | exit 0。新增路由限繁中，舊 Agent alias、其他語系延後及法律頁語言邊界通過。 |
| `node scripts/check-theme.mjs` | exit 0。真實 dependency 的 SSR prepaint script、6種系統／保存偏好組合、portal語意色、CSS語法及官方 moon SVG bytes 通過。 |
| `npm run check:landing` | exit 0。19語系舊基準的68＋79 keys、171張舊圖、19張舊social圖及12份原始截圖完整性通過；這是歷史檔案完整性，不能當新版截圖驗收。 |
| `npm run check:seo` | exit 0。**只針對現有 `dist`**：633個靜態頁、40 routes、互惠 hreflang、自身 canonical、sitemap／robots與404規則通過。本輪沒有 rebuild，因此不把這項寫成今晨新文案已重新預渲染。 |
| `npm run check:visuals` | exit 1。品牌／social來源檢查通過，後續 active native image gate未通過，詳細狀態見下節。 |
| 額外 SSR 靜態結構掃描 | 37條繁中路由各有1個H1；本次掃描的 main 內容中，沒有缺 alt 的 img、空連結名稱、跳級標題或不存在的內部路由目標。這是字串／結構檢查，不是瀏覽器可操作性或完整無障礙驗收。 |
| 官方 `copy-lint.mjs` | 37／37 exit 0，0 FAIL、0 WARN。輸入為實際 SSR 訪客文案轉成工具支援的 Markdown draft stdin：保留標題、移除 script／style／SVG，不寫頁面檔、不修改 kit。工具以英文詞與空白斷詞為主，其 words 統計不能當作中文字量或逐屏密度合格證明。 |

工具出現既有 `caniuse-lite` 資料落後25個月的提示。未更新依賴；它沒有令上述檢查失敗。

## 圖片狀態：active 與今晨候選

本輪 `check:visuals` 真正讀回的 active metadata 是6／11張 draft primary、5張 gallery；其中0／11 primary、0／11 active images 符合61bd current-source gate。它驗證了現存PNG／WebP來源、bytes、hash、RGB與metadata，並保留1張待替換的低解析度Widget。其餘不符 current-source 的圖片仍為 historical draft／source-unverified，沒有被升格成新版。

同時間另讀回、但**沒有匯入或修改** `output/native-captures/fresh/main61bd-zh-tw.capture-input.json`：`20261117-zh-tw-main61bd-r3` 已有10個候選記錄，包含5張 primary（Text、Helper、Menu、Document、Table）及5張 gallery（Screen setup、Menu options／staff、Document original、Table cell-source）。因此不能說這5種功能「尚未拍到」。候選仍需主代理逐圖確認與正式 importer 驗證，不能直接算 active gate 通過。

後續新增候選及匯入會改變這些數量；上列只是04:27 UTC附近的離線快照，不是持續更新的任務進度。

## 必要頁面與文案審核

| 頁面 | 本輪結論 |
| --- | --- |
| 首頁 | 首屏有「AI翻譯與語言學習App」、平台、免費下載及Mac／iOS兩個真實下載入口。10個日常情境涵蓋文件、獨立表格、菜單、照片、AI助手、語音、鍵盤、小工具與任何App翻譯；不再把掃描流程誤寫成聆聽／提問。圖片最終完成度仍受 active gate限制。 |
| 功能總覽＋11功能頁 | 已用實際渲染結果核對各功能自己的介紹、步驟與相關工具。照片、菜單、文件與表格沒有互相冒充。AI助手是文字／照片／語音與對話內場景／目標入口，未重新宣傳已移除的獨立模式sheet。 |
| 使用案例＋7細頁 | 每種情境連到對應功能與可行步驟。其他App字幕與畫面文字分開說明；沒有將它寫成現場麥克風翻譯。 |
| 定價 | 免費次數／更新政策以App顯示為準；標準版與語音版分鐘、Helper組數及單批掃描張數對照61bd快照。價格、幣別、優惠與續訂條款交由Apple在購買前顯示，不杜撰本地貨幣價格。 |
| 關於 | 沿用品牌／既有公司名稱，介紹產品用途；沒有虛構創辦人、團隊照片、客戶或推薦語。 |
| 聯盟合作 | 誠實標明接受合作洽詢，佣金／歸因／付款需另約；未宣稱已提供自動追蹤／分潤。原先重複的流程標題已依授權最小修正，見下節。 |
| 聯絡 | 有可見label、欄位錯誤／aria-describedby及status來源；按鈕為「開啟郵件草稿」。明示網站不直接寄送，沒有假裝已收到郵件。未實際觸發郵件App或寄信。 |
| 下載 | Mac／iOS按鈕都通往真實App Store；Mac相容性以商店為準，品牌圖標記為品牌圖，不冒充原生Mac截圖，也未編造dmg／pkg。 |
| Blog＋9文章、支援 | 新AI助手與任何App翻譯指南、獨立文件指南及既有文章皆能SSR。支援提供FAQ／指南與聯絡入口。文章分類及跨頁目的地存在；互動篩選待主代理原生IAB確認。 |

98.3%區塊在本輪實際SSR為「**開發者自述回歸測試通過率**」，同區顯示「98.3%由開發者提供；測試案例、樣本數與評分口徑待補。此數字不代表所有翻譯的準確度。」沒有進入SEO宣稱或冒充本輪測試結果。現有回歸檔案未支持此數字；本報告不替它背書、不將俄德例句視為98.3%證明。獨立回歸查核已另交主代理。

俄文 `с моим другом` 與德文 `mit dem Kunden` 例句正確，且說明為非實機／Provider輸出。自動語氣與校對用途分清楚；自動＋禮貌／幽默／書信／朋友／精簡六個選項符合原碼。Helper描述為可重用的解說指示，未宣稱文件RAG。

語言選單使用同一Radix元件、可用語系由route限制、menuitemradio有選中狀態；theme portal也有共用語意色。另以實際SSR module核對 `getTranslations('zh-tw')` 的**flat keys**：Table、Screen Translation、Chat及Document的gallery名稱均有正確繁中值，沒有raw-label缺陷，無需修改AppScreen。

## 具體項目與修正狀態

### P1：active官網圖片尚未取得新版完整來源驗證

`AppScreen.tsx` 在無對應圖時輸出hidden pending標記。這保護了「不以舊圖／示意圖補新版」的邊界，但也表示目前功能卡、首頁情境及文章仍可能沒有圖，不能達成taste「每個visual都完成」或使用者的全功能真圖要求。

處理：主代理完成新候選內容審核，再以既有importer匯入；不能靠移除檢查、標記假來源或啟用舊圖fallback解除。今晨已拍的5種primary不需要因此重拍，先審核既有候選。active image gate通過後才重新做原生IAB的圖片裁切、四角、解析度及各尺寸驗收。

### P2：聯盟合作同句重複 — 已修正

原 `MarketingPages.tsx` 的合作panel段落與緊接的流程H2都讀 `affiliate.how`（約696、711行），SSR連續顯示兩次「讓我們認識你的觀眾與想法。」現已只在繁中新增 `main-common-zh-tw.json` 的 `marketing.affiliate.processTitle`＝「合作流程」，並將繁中流程H2改讀此key。panel的原句與其他18語系原分支保留，沒有改版面或互動。

### P2：首頁重要下載註記在手機僅11px — 已修正

原 `marketing.css:341–343` 將hero平台／免費與Pro註記設為12px；767px以下規則約1474行再降為11px。現已只將兩處 `.mk-hero .mk-small` 的字級都提高為13px，其他間距、最大寬度及既有設計不變。這是共用hero註記樣式修正，沒有變動其他語系文案。本輪只確認CSS來源，實際換行／對比留給主代理原生IAB驗收。

### 修正後驗證 — 2026-11-17 04:35:08 UTC

- `tsc --noEmit -p tsconfig.app.json`：exit 0。
- `npm run check:marketing`：exit 0；再次完成37條繁中SSR、11功能、7流程、9文章及既有19語系資料檢查。
- 額外SSR斷言：繁中存在 `<h2>合作流程</h2>`，原panel句只出現一次；英文沒有新增繁中文字或未解譯key。PostCSS檢查兩處hero note宣告都為13px。loader已在finally關閉。
- 後一次marketing執行另有 `WebSocket server error: Port is already in use` 及依賴重新最佳化提示；這是既有Vite middleware SSR工具初始化的輸出，未令SSR斷言或命令失敗。沒有另開HTTP預覽站、修改lockfile或處置原有占用程序；所有本次檢查process均已結束。不能將該輸出省略成完全無警告。

## 尚未驗證與收尾條件

- 本輪沒有瀏覽器截圖或computed layout，不能判定1440／1024／820／768／390／320的實際邊界、首屏高度、字型載入、觸控尺寸、對比、深淺色、語言menu鍵盤互動或四角像素均已通過。
- 主代理正在另用原生IAB檢查98.3區1440／390與深淺主題；這份離線報告不冒稱自己執行或替它擴張成全站視覺通過。
- 沒有Lighthouse、瀏覽器性能測量、真實購買、郵件送達或Mac安裝證據。
- 本輪未新增虛構價格、時間、推薦語或素材，也未新增waiver；未執行 `npm run build`。目前純Node／SSR checks的通過不代替圖片或完整產品功能驗收。
- 所有本輪Node檢查與SSR loader均已正常結束；沒有留下本輪伺服器、watcher、瀏覽器或背景程序。

## 公開範例媒體出處方案與NoSwimming落地

初版先整理已保存的公開來源／授權證據及最小實作方案。後續依主代理明確授權，只將已active的禁止游泳照片署名實作；草地／ToS仍待最終採圖，沒有空placeholder或預先啟用。以下素材檔案是App輸入，不是App截圖或Provider成功證明。本輪沒有改capture pipeline、native index、圖片、manifest或手機狀態。

### 已確認的來源與授權

| 素材 | 精確來源與必要署名 | 授權與變更說明 |
| --- | --- | --- |
| 真實草地告示照片 | [Please Keep Off Grass](https://commons.wikimedia.org/wiki/File:%22Please_Keep_Off_Grass%22_sign_at_Skara_Brae_Visitor_Centre_01.jpg)，作者Mike Shaw（[LittleDwangs](https://commons.wikimedia.org/wiki/User:LittleDwangs)）。署名：`Mike Shaw / Wikimedia Commons / CC BY-SA 4.0`。 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)。保存的原始JPEG未改圖；最終App截圖若加入翻譯覆蓋，頁尾須明示此呈現變更，不能稱整張截圖是未修改原照，也不將整個網站／App套用該授權。 |
| 真實禁止游泳照片 | [Zoomed-In No Swimming Sign](https://commons.wikimedia.org/wiki/File:Zoomed-In_%22No_Swimming%22_Sign.jpg)，作者Schism.07。可選署名：`Schism.07 / Wikimedia Commons / CC0`。 | 保存來源的[CC0 1.0連結](http://creativecommons.org/publicdomain/zero/1.0/deed.en)。無強制署名要求，仍可在同一行清楚交代照片來源。不能將Chat回答歸為照片作者所作。 |
| Tears of Steel (2012) | [Blender官方影片](https://download.blender.org/demo/movies/ToS/tears_of_steel_720p.mov)。官方要求保留精確署名：`(CC) Blender Foundation \| mango.blender.org`。授權依據為保存的[Sharing](https://mango.blender.org/sharing/)與[About](https://mango.blender.org/about/)頁面。 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)。使用20–60秒節錄；iOS MP4的video byte-stream未改，MP3音訊轉AAC160k。不能沿用早期MOV的「音訊未轉碼」說法。影片片段未含原始片尾credit roll；這次只規劃網站實機截圖的來源署名，未重新稽核整部影片公開播放。標誌／商標不在電影CC授權內。 |

保存證據均位於`output/native-captures/public-inputs/`：`public-inputs-manifest.json`、`en-live-ocr-keep-off-grass-source.json`、`chat-visual-no-swimming-source.json`、`tears-of-steel-public-video-input.json`、`tears-of-steel-official-source-evidence.json`。這些本地input／evidence不匯入前端bundle。

- 草地原始JPEG：6000×4000、15,527,104 bytes，SHA256 `84792e31de77f145d1f4c09b9826e84e45ce35791bca2d5c21b3e57128f544fe`。
- 禁止游泳原始JPEG：SHA256 `026d9d241ca65bfffc08e141ed6a5f71583a40e55d385436860b71d394968d77`。
- iOS影片MP4：1280×534、40.267008秒、20,942,516 bytes，SHA256 `2f639b6fbe85a1f3d4cb9dea05c2674c4f9c3b9c1dd70b3e67cee430d0c77f7e`。

### 最小網站實作與啟用條件

1. 只在`MarketingShell.tsx`頁尾加入一個可換行的繁中出處段落；必要時新增小型`FooterMediaCredits`元件。沿用`mk-small`及既有頁尾色彩，不改其他語言的DOM／文案，不以`white-space: nowrap`製造手機溢出。
2. 每個已審核的**App截圖**建立明確的`src + sourceCommit + originalSHA256 → media ID`對照。這裡的hash是原始App截圖hash，不是上列素材input hash；兩者不能混用。不得因feature是`photos`／`screen-translation`就推定出現了該素材。
3. 只有active native index仍引用該精確`src`／`sourceCommit`的primary或gallery時，才輸出相應出處；移除該截圖後出處也消失。同一素材只署名一次；沒有有效對照或介面語言不是繁中就不輸出此段。
4. 最終採圖後，先以離線檢查核對registry的原始截圖hash與active manifest完全相同，再做SSR條件與語意連結檢查。runtime不匯入整份public manifest或ignored input檔。這是建置／交付時的hash核對，不能寫成瀏覽器對圖片bytes作了即時驗證。
5. 頁尾一個段落可組合「範例照片：作者／來源／授權；範例影片：作品／必要署名／授權」；作品名、來源與授權以正常`a`連結分別提供。草地／影片的覆蓋變更文案須以最終實機圖實際內容決定，未採用的媒體完全不顯示。

當前已由主代理確認且active manifest可讀回的禁止游泳Chat主圖為：`/app-preview/native/20261117-zh-tw-main61bd-r3/zh-tw/chat.webp`，sourceCommit `61bdbe4024f709e29109b321130023909f89411b`，originalSHA256 `b066a6a8f73b9860705bbdbac0ab21838539b50a06602ccb50123f6d7cd868db`。它已加入可選CC0署名。草地／ToS尚無主代理確認的最終採用截圖hash，因此沒有為其預先啟用任何頁尾內容。

### NoSwimming實作與驗證 — 2026-11-17 04:51 UTC

- `MarketingShell.tsx`只新增小型`FooterMediaCredits`；新元件內僅一筆已採圖registry，保留精確原始App PNG hash。runtime只比active native index的`src`與`sourceCommit`，沒有匯入public／private manifest。相同src不可覆寫成不同raw hash的保護仍由既有importer負責，本次沒有修改它。
- 繁中頁尾輸出一個可換行的13px段落：「範例照片：Wikimedia Commons ／ Schism.07 ／ CC0 1.0。」三項各有真實來源／作者／授權超連結與可見底線。沿用既有語意色／焦點樣式；其他語言不輸出段落，沒有引入照片或影片placeholder。
- `tsc --noEmit -p tsconfig.app.json`與`npm run check:marketing`均exit 0。後者再次完成37條繁中SSR及既有19語系資料檢查。
- 額外小斷言exit 0：registry的`src`、`sourceCommit`、`originalSHA256`與active manifest完全相同；目前active顯示、old src／different commit／empty index／英文不顯示；primary／gallery引用均支援；實際繁中SSR只有一段署名與三個語意連結，英文Footer沒有中文署名／作者／CC0，草地／ToS不出現。
- 額外Vite middleware loader沒有呼叫HTTP listen，最後正常close。本次僅出現依賴重新最佳化與既有Browserslist過期提示，沒有重現前次WebSocket port占用警告。沒有build、部署或commit，沒有留下本輪檢查process。頁尾實際桌機／手機換行及深淺模式畫面仍留給主代理原生IAB驗證。
