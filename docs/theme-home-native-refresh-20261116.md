# 主題、首頁情境與真實素材更新 — 2026-11-16

**網站設計與程式檢查已完成；新版 App 實拍仍為 0／11，圖片補齊尚未完成。** 本地預覽 <http://127.0.0.1:5178/?lang=zh-tw> 保留，沒有部署正式網站、commit 或 push。

本報告接續 [main 功能更新](main-website-update-20261116.md)。目前固定 App 來源為 `61bdbe4024f709e29109b321130023909f89411b`、公開設定 v98；相對 e9 的新增差異為 RevenueCat 閘道／逾時／告警修正，Chat 行銷功能與公開設定 bytes 未變。其他 18 語依使用者要求暫緩。

## 已實作

- 繁中導覽列加入明暗主題切換。預設跟隨系統，手動選擇後跨頁、重新整理持續保留。使用既有 `next-themes`，相同主題涵蓋 body portal 的語言選單與法律頁，按鈕可點範圍 44×44。
- 首頁補為 5 組、10 個具體情境：旅行／飯店、菜單點餐、文件公告、時刻價目表、影片／其他 App、訊息／鍵盤、Chat 面試練習、日常 Widget、路標／標籤／展覽、工作閱讀／自訂解說。各段直接連到相應功能，後接 11 工具索引。
- 依使用者 Typeless 參考加入 3 組柔和彩色底、分層卡片與前後對照：菜單到原文點單、外文訊息到自己的回覆草稿翻譯、目標的點餐語句單元到餐廳場景練習，穿插於首頁，也用於對應功能頁。它們明確標示「情境示範」，不是 App 實拍；沒有假手機、假 App chrome、虛構速度或節省時間數字。
- 菜單解說圖的拿鐵範例依已查看的 CC0 菜單改為 3.50＋0.40，兩杯合計 7.80，避免與實際素材價格混淆。這不是即時商店價格承諾。
- Mac Blog 圖卡、Mac 下載卡與 Mac 指南加入品牌插圖。使用與 App 原檔 bytes 相同的 1024px 真實 logo，標記 `brand-artwork`；不借 iPhone 圖冒充 Mac 畫面，不保證未驗證的裝置相容性。下載按鈕仍連真實 App Store。
- v98 Chat 文案補入 4 個起始建議、依練習語言更新標籤、AI 看圖的重點理解／下一步，以及原本語音開啟時送出一般建議後的語音接續。兩個學習入口與對話內選擇／難度流程仍分清楚。
- 修正新增 Mac 圖位在 320px 引發的 grid 最小寬度擴張，並補齊功能／案例／Blog 總覽的標題層級。新功能截圖的預設替代文字改取實際功能標題。
- 本輪獨立文案與視覺審核後，Chat 示意改用真實相鄰的第 7／8 單元（點餐語句／餐廳場景）；訊息示意補上使用者自己的中文草稿；Helper 不承諾確知對方意圖。10 個情境整卡連結改用精簡讀屏名稱，3 個示意區各自命名。文件預覽背圖改用 `document/original`，已於 IAB 驗證來源正確。

## 實際檢查

| 項目 | 結果 |
|---|---|
| `npx tsc -p tsconfig.app.json --noEmit` | 通過。 |
| `ANYTRANSLATOR_APP_REPO=... npm run check:marketing` | 通過。固定 61bd Git object、完整公開設定 SHA、7 方案、Scan 限制、官方圖示及 v98 Chat 合約；全部 37 條繁中路由無舊 Agent／模式 sheet／我的句子入口承諾。 |
| `node scripts/check-theme.mjs` | 通過。實際 dependency SSR 初始化、6 組系統／保存偏好、CSS 與官方 moon bytes。 |
| 原生 IAB 主題互動 | 點擊切換、跨頁與 reload 持續；深色語言 portal 背景／文字正確，Escape 關閉與焦點回復已查。 |
| 首頁響應式 | 10 個明暗／寬度組合，涵蓋 320、390、768、1024、1440px；10 情境、3 示意面板、單一 H1、按鈕尺寸及內容邊界檢查通過。 |
| Mac 插圖響應式 | 3 路由 × 2 主題 × 1440／320px，共 12 組；最初發現的兩頁窄版溢出已修正並重測通過。 |
| 本輪示意卡響應式 | 修改後重新檢查 320、390、820、1440px × 明暗 8 組，3 面板均無溢出或文字越界；手機與桌面實際畫面已保存。 |
| taste 文案與對比 | 官方 `copy-lint` 對實際繁中預渲染首頁為 0 finding。淺色 3 個示意標記旁的實際 JPEG 背景採樣對比為 4.65–4.97:1；這是特定畫面採樣，不代替全頁／全主題對比驗收。 |
| 完整 build／圖片驗收 | 最新程式已成功打包、預渲染 633 頁並通過 SEO／品牌來源檢查；命令最後因新版 App 實拍 0／11 而 exit 1，圖片 gate 正確保持 `partial`。不能稱完整 build 通過。 |

上述瀏覽器證據仍含歷史 App 圖或缺圖折疊狀態，新增真圖後需再核對圖片、裁切與版面。

視覺紀錄：[新版首頁示意卡](main-preview-20261116/home-story-menu-light.jpg)、[手機練習示意](main-preview-20261116/home-story-practice-mobile.jpg)、[主題／首頁檢查](main-preview-20261116/theme-home-checks.json)、[Mac 插圖檢查](main-preview-20261116/mac-art-checks.json)。這些是網站 QA／設計示意，不能當成新版 App 實拍。

本輪修正後的畫面以 `main-preview-20261116/typeless-*-desktop-light.jpg`、[手機餐廳練習卡](main-preview-20261116/typeless-practice-mobile-light.jpg)、[8 組斷點檢查](main-preview-20261116/typeless-story-final-checks.json)、[文案檢查](main-preview-20261116/typeless-copy-lint.json) 為準；前述舊飯店練習截圖保留作歷史紀錄。

依 taste-skill 原則人工檢視，保留既有選定設計與本次明確要求的變化。自動 headless Browser Gate 與使用者「只用 Codex 原生瀏覽器」限制衝突，未執行、未宣稱 GATE PASS。

## 原生 App 已交付，實拍被實體連線／驗證阻擋

使用者本輪明確授權本機 Development/Profile 建置、保留資料原地安裝及截圖。等待其他任務完成後，固定 61bd，使用隔離 Flutter 3.44.1／已驗證 framework 修補、Ruby 3.4、CocoaPods 1.17，以共享鎖與最多 2 jobs 建置；沒有改 App source。

- 61bd build、4 bundles 的 Development 簽章／provisioning／App Groups／版本與 Dev routing、實際 binary hashes 均驗證通過。
- 35 個必要 App／plugin UUID 全部 ACK；保留 1 個已記錄的 Flutter vendor 符號不可得限制。交付依規則上傳 Crashlytics 符號，並非網站或 Worker 正式部署。
- Lu 15 已原地安裝 `2.1.4+202611120405`，另行驗證執行 PID `13131`。未卸載、清資料；未宣稱逐資料表比對或所有功能成功。
- 固定 local-build checkout 原 head、兩份既有 dirty 鎖檔與 generated 設定先保存，建置後已還原並核對 hash；未動其他工作的 main dirty 檔。
- 來源 receipt：`/Users/luyi/.codex/artifacts/website-native-capture-20261116/artifact-verification-main61bd.safe.json`，SHA256 `8b13a7acd265f406371bf29d54c696ea5f64e9adea492f607a60a902fabc5cb5`。
- 裝機／process 證據：同目錄 `device-delivery-main61bd.safe.json`。較早 e9 receipt 原檔與 hash 保持不變。

第一次 installed-only XCTest 初始化失敗：`Timed out while enabling automation mode`，exit 65；沒有進 test body、手勢或產生 PNG。實讀裝置為 `transportType=localNetwork`、tcp tunnel，USB proxy 回報 `No connected/matching device found`。不能稱 USB 或截圖服務已連上。

已請使用者以 USB 接回、解鎖並保持 AnyTranslator 亮屏，完成必要的 iOS UI 自動化驗證後回覆「可截圖」，同時發出 macOS 通知。**回覆前不自行重試認證失敗。** r1 runner／proxy 已結束、22088 已關閉、鎖已釋放；不需再重建 App。後續以新 r2 result 路徑與 installed-only runner 接續，不覆蓋為其他舊 binary。

### 收到「可截圖」後的 r2 續接

USB 已確實恢復為 wired／paired。r2 來源 guard 發現同版本 App 的 bundle URL 已換過，先停止；確認無其他建置／裝置工作後，沿用本任務既有明確原地安裝授權，以相同 61bd artifact 重驗四 bundle／AOT hashes、Development 簽章與 provisioning，再通過 35 個必要 UUID 的符號 gate，保留資料原地裝回。沒有重建、卸載或清資料。新裝機／process 證據為 artifact 目錄的 `device-delivery-main61bd-r2.safe.json`，PID `13233`；原 artifact receipt bytes 不變。

r2 installed-only XCTest 再次在 test body 前 exit 65，沒有手勢或 App 實拍。這次透過官方 devicectl 只讀取得 1290×2796 診斷 PNG，主代理實際查看後已定位：**手機正在顯示「Enter iPhone Passcode for “XCTest”／Enable UI Automation」系統密碼頁。** 已透過 async 問題與 macOS 通知請使用者在手機直接完成此驗證、回覆「XCTest 已驗證」，不要求將密碼傳到聊天，也不代為操作驗證。

`main61bd-r2-cleanup.safe.json` 已核對 runner／proxy 退出、自有 PID 消失、22088 無監聽、共享鎖 idle。等待新回覆後使用 fresh r3 result 路徑續接，不需重新建置或安裝。新版 App 實拍仍為 0／11。

並行準備的真實公開照片已有英文草地路牌（Mike Shaw，CC BY-SA 4.0）與禁止游泳符號近拍（Schism.07，CC0），原檔、授權與 hash 在 ignored public-inputs manifest；尚未匯入手機或當作 App 圖使用。若最終網站實拍含路牌照片，須在頁尾加入作者／授權 credit。

## 待完成的圖片

目前仍只有 6 張歷史主圖＋5 張歷史 gallery；11 項新版主圖皆未取得。原 source、拍攝日期與 bytes 不改標；Widget 664px 鏡像草稿仍需原生解析度替換。缺的圖片不以另一功能、假結果或 AI 重畫填充。

ignored `output/native-captures/fresh/main-current-zh-tw.capture.template.json` 提供 11 主圖＋8 必要 gallery 的未填計畫；所有未取得證據保持 null，不能直接匯入。根據 [重拍計畫](main-screenshot-plan-20261116.md) 正常操作公開素材後，才填每張實際 PNG、日期、版本、source receipt 與 hash。

螢幕翻譯已備妥官方授權的 *Tears of Steel* 英語短片作輸入。40 秒 MP4 保留原 H.264 影片封包，僅轉換 AAC 音訊以便播放；來源、CC BY 3.0、credit、原檔／片段 hash 在 ignored `public-inputs/tears-of-steel-public-video-input.json`。它不是 App 圖或 Provider 字幕；尚未在 iPhone 播放。實際使用時須從 Files／Preview 正常播放、經 ReplayKit 與 Provider 產生字幕，再拍真正 PiP；若網站圖片使用電影畫面，加入相應來源 credit。

取得新圖後，還需匯入完整新 capture set、通過原生圖片驗收、重建網站與做含真圖的最終桌機／手機明暗檢視。Vite 與本地預覽分頁保留供後續工作及使用者檢視；等待不代表整項任務完成。


## 2026-11-17 新批次實拍與本地更新（最新狀態）

前文的連線失敗、0/11與舊圖計數是歷史紀錄；以下為本輪實際狀態。使用者已在 Sandbox 自行訂閱，App 正常額度已可使用。root沒有代購、修改 quota、重置 identity 或寫入後端資料。XCTest 驗證完成後，沿用同一61bd artifact、r3 installed-only runner，在Lu 15正常操作並直接取得1290×2796 PNG。

已批准14張新候選；正常importer已將其中13張完整功能組匯入active：7張主圖（文字、Helper、菜單、文件、表格、AI助手、原生鍵盤）及6張補充圖。任何App翻譯setup另保留候選，等該功能主圖後才匯入。active內沒有舊來源或鏡像圖；原PNG、原時間、sidecar、來源receipt及歷史excluded/provenance皆保留，不把舊圖改標新版。

- 菜單為真實CC0公開原菜單的新正常辨識；兩份Latte / flat white、燕麥奶+0.40，合計7.80；店員頁真實法文指示。截圖本身未顯示幣別符號，alt沒有加£。
- 文件使用公開NPS Getting Around，真實繁中段落及對應1/1原圖。沒有把單頁稱為已驗多頁或PDF匯入。
- 表格使用另一張公開NPS shuttle原表；已逐項視覺核對3日期區間、15個時間值一致，另正常點第一列開英文原文bottom sheet。不能擴張成現行班表或整體準確率保證。
- AI助手餐廳場景由正常入口選英文／初級；Mac Samantha讀公開文字，經空氣由手機麥克風實際辨識並取得AI回應，未注入transcript。三任務沒有全部完成。chat-entry實際是場景開始、三任務與四關鍵句，並非非空thread無法取得的完整intro四chips。未清除既有私人thread。
- AI助手主圖由正常照片入口加入CC0禁止游泳真照片、發公開問題，AI真實解說並給英文提醒；不是OCR或預造回答。所有採圖viewport都由root確認無私人舊對話或通知。
- 鍵盤是原生iOS AnyTranslator extension，實際把公開英文draft替換繁中；不是Flutter教學預覽。拍後恢復English (US)鍵盤，只移除本次未送出draft。

完整原生checker已核對13張PNG／lossless WebP／responsive來源、bytes、hash、RGB及獨立artifact receipt；7/11主圖、13/13active current-source，0歷史／0低解析。它正確exit1，缺任何App翻譯、照片、語音、小工具四主圖，status仍partial。checker的historical excluded判斷曾只比較identity而誤擋同slot新圖，現已最小修正為identity＋原PNG hash；新hash放行、相同hash及缺hash保守拒絕的self-check均通過，舊排除紀錄未刪。

繁中可見Chat已統一為AI助手；俄文／德文格位、詞尾與六種實際語氣已介紹。98.3%保留明確『開發者自述回歸測試通過率』及同區口徑待補說明，沒有冒充本輪實測或全翻譯準確度。37條繁中SSR、tsc、marketing、routes、theme及官方copy-lint通過；文案lint為英文規則，不能單獨證明中文字量合格。

root以Codex原生IAB檢查新增98.3區、俄德／六語氣區的桌機1440與手機390明暗版面；新圖7功能頁另完成28組（7×1440/390×light/dark），以實際html data-theme及aria-pressed核對主題，無橫向溢出、壞圖或圖片越界。證據為main-preview-20261116/fresh-seven-feature-checks.json及fresh-*.jpg。語言menu明暗選中、Escape關閉與焦點返回已實操；其他語言仍deferred。聯盟頁重複標題改為合作流程，hero平台／購買註記最低13px，手機實際computed style已查。

官方taste headless Browser Gate與使用者只用原生IAB的限制衝突，沒有執行、沒有宣稱GATE PASS。人工審核與純Node checks記於taste-offline-review-20261117.md。

04:35 UTC手機出現來電，root未碰來電控制也未開mic；其後正常前景guard回SpringBoard、04:36:55原生診斷PNG全黑。已請使用者解鎖回AnyTranslator並保持亮屏，另送macOS通知。這是目前剩餘實拍的外部阻擋，不是額度或建置失敗。未重建、重裝、清資料或重新索取XCTest驗證。為釋放共享資源，已請native owner精準停止閒置r3／proxy、保留r4續接；最終清理結果另存safe receipt。任務尚未完成，保留本地Vite及交付預覽供後續。

沒有commit、push、正式網站／Worker部署。

本輪資源釋放已回讀：自有r3 runner／proxy停止，PID81293／81414／82075消失、22088關閉；自有共享鎖已釋放，但當時另一個Claude storekit proof-selection工作隨即取得鎖，不能稱全機idle。cleanup與r4 resume receipt見artifact目錄main61bd-r3-cleanup.safe.json／main61bd-r4-resume.safe.json。用戶回App後仍須先等其他建置完成，再以installed-only r4續接；不需重建、重裝。

新增條件式繁中頁尾署名，只對active CC0 NoSwimming截圖顯示Commons／Schism.07／CC0真連結，不匯入私人manifest。桌機／手機與明暗均有畫面紀錄；手機浮動客服按鈕曾遮最後一行，已把mobile footer底部留白調為88px＋safe-area。重新實查390×844明暗：credit bottom755.78px，文字不再被浮鈕遮住；desktop仍原留白。

最終本地程式（含footer浮鈕留白修正）的npm run build已重新執行：Vite打包、633頁預渲染、SEO與品牌來源檢查通過；整體exit1僅因7/11圖片完整度門檻，沒有跳過gate。實際log與起迄/exit receipt位於ignored output/native-captures/fresh/website-build-footer-final-20261117.log及.safe.json。Vite原預覽伺服器與交付IAB分頁保留，其他本輪子代理工作已結束。
