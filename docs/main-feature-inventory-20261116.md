# main 全功能與官網差異盤點 — 2026-11-16

最新補查至 `358dc9b905ae93cf97b7725c461610d1f0ba07ca`：相較下方 53b 僅新增 Chat 學習兩按鈕上方的導引句及翻譯／測試，入口、功能、公開設定與方案不變。以下 d64／53b 的原始行號與證據保留；最新整合狀態見 [main 官網總覽](main-website-update-20261116.md)。

來源固定為 `d64f37eee635ab71f697b4f1157fba87b78abcf0`，比較舊官網基準 `ebd48f61aa29dda378ac8db689d1abd2d9ed7fc5`。下列行號均屬於此固定 commit。App 版本欄位為 `2.1.4+202611120405`（`pubspec.yaml:19`）；CI／安裝 build number 可能另有覆寫，不能以此推定實機已裝此版。

續接已核對新 main `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487`。上方原始盤點保留作為變動紀錄；最新 Chat 入口、計費依據與公開設定版本，以文末「53bdfc0f 續接差異」及專項報告為準。

本次只讀 App 原碼與公開設定、撰寫繁中官網內容。不操作 main 的既有 dirty 改動，不建置、安裝、操作手機或瀏覽器，不部署或 commit。沒有讀取秘密或 private prompt 全文。這份報告是原碼盤點，沒有宣稱實機 UI、聲學行為或已部署版本驗收通過。Chat 與螢幕翻譯的細節由本輪各自的專項報告補齊。

## 先改正的結論

1. **目前不再有獨立 Voice Agent 任務頁。** `main.dart:1431` 明確記錄 page 7 已退休；底部第 4 個入口實際開啟全螢幕 `TranslationChatScreen`（`main.dart:1424–1426,1584–1587`）。舊程式 key／額度欄位保留 Agent 名稱，不能據此把它再包裝成另一個現行功能。舊官網的「設定任務 → AI 代為向現場人士追問 → 審閱後轉述」介紹需退場，改介紹新版 Chat 真正的流程。
2. **整理模式有明確三種類型：菜單、文件、表格。** 它不是一個只有「加入照片」步驟的通用自動分類流程。使用者在頂部類型列選擇類型，提交時保存該類型；首次預設菜單，之後記住選擇（`translation_image_screen.dart:962,1734–1859`；`user_settings_controller.dart:36–47,78–97`）。繁中底部模式名稱仍為「即時／整理」，三類名稱為「菜單／表格／文件」（`smart_scan_translations.dart:1281,1677`）。
3. **文字主頁已移除譯文旁 Chat 按鈕。** 目前結果工具為語氣、回報、收藏、複製（`translation_text_screen.dart:922–976`）。歷史／收藏列仍有 Chat 入口，翻譯小窗也仍有 `BottomSheetResultChatButton`（`translation_text_bottom_sheet.dart:328–343`）。這些入口是帶入草稿，不能寫成點擊後即自動送出。
4. **App 現在是中性灰點綴。** `theme.dart:83–108` 的 Light accent 是 `#575757`，Dark 為 `#C7C7C7`；黑白背景、主按鈕與 CeraRound 保留。原紫色、後來的霧藍皆非目前主題。鍵盤會接收 App 的語意色 payload（`keyboard_theme.dart:16–58`），原生 Widget 也有本輪更新，不能把舊有色 UI 圖改色後當成新版實拍。
5. **公開 config 已是 v96，免費額度有條件。** 不能繼續沿用網站工作樹舊 v81 的固定免費週額度說法；應以 App 顯示的適用次數、分鐘與下次更新日期為準。Chat 打字／照片扣翻譯次數，Chat 語音扣 AI 助手分鐘；影片字幕與 Audio 共用語音分鐘，畫面文字使用翻譯次數。

## 導覽與功能矩陣

來源入口：[main.dart](/Users/luyi/Github/MyProjects/translator/lib/main.dart:1394)。App 底部是 Text、Audio、Photo、Chat 與 Tools 五個入口；視覺上不顯示文字 label。`Agent`／`VoiceAgentNavigation` 是保留的程式識別，不是另一個新入口。Tools 原碼目前只有鍵盤、學習 Widget、任何 App 翻譯三列（`main.dart:1503–1546`），在 iOS App on Mac 隱藏鍵盤與任何 App 翻譯。設計規範仍有一句「Tools 開 Chat」落後於此固定原碼，官網依程式呈現。

| 對外能力 | 目前實作與可介紹範圍 | 入口、限制及官網處理 | 主要來源 |
|---|---|---|---|
| 文字翻譯與語氣 | 輸入／貼上、來源與目標語言、依語氣重翻、讀音／朗讀、複製、收藏、回報內容。 | 保留獨立功能頁。主頁沒有 Chat 快捷鍵；需要時由歷史／收藏或翻譯小窗把譯文帶入 Chat 草稿。 | `translation_text_screen.dart:676–790,915–976,1128–1141,1232–1297`；`translation_text_bottom_sheet.dart:328–343` |
| 文字歷史與收藏 | 搜尋原文或譯文、回開內容、收藏／取消收藏、從項目進入 Chat。文字歷史與收藏是不同檢視。 | 作為文字頁與指南的重要補充，不必另造一個大功能 Hero。不要說所有模組共用同一個總歷史頁。 | `histories_screen.dart:126–170,194–245,309–326`；`translation_archive_screen.dart:63–115,159–216` |
| Helper／自訂知識 | 選擇解說原文或譯文，依內容使用預設解說，儲存／編輯自己的指示，換內容繼續使用。 | 保留獨立頁，介紹「解說方式」與可重用指示；不是檔案上傳型 RAG 知識庫。儲存上限依方案。 | `translation_text_screen.dart:188–228,269–399,552–569`；`custom_block_helper.dart:526–588`；`settings.dart:187–270` |
| 即時語音翻譯 | 四個可見模式：雙向對話、私下聽、幫我說、只看字幕；原文／譯文、逐句朗讀、已存對話、自動摘要、複製／朗讀／分享摘要。 | 保留獨立頁，與 Chat 的「跟 AI 說話」及螢幕「影片字幕」分清楚。私下聽使用聽筒或耳機；雙向時自己的播放可依耳機狀態選擇；幫我說有朗讀中斷選項。不要保證任意音訊路由或無延遲。 | `audio_translation/settings.dart:16–44,80–85,110–156`；`settings_view.dart:11–39,137–178,182–263`；`translation_audio_screen.dart:2108–2143,3645–3656,3752–3783` |
| 照片／即時鏡頭翻譯 | 即時鏡頭 OCR、畫面疊字；拍下畫面或從相簿選圖後翻譯，點文字查看細節。Mac 分支有圖片檔案選擇與貼上。 | 保留獨立頁。「即時」與「整理」用途各自清楚；不把鏡頭翻譯與影片音訊字幕混為一談。不宣稱所有平台都有即時鏡頭。 | `translation_image_screen.dart:225–359,717–747,1019–1123,1258–1318,1635–1731` |
| 菜單整理與點餐 | 選菜單類型、加入照片、菜名／說明／價格／選項、份數、加料、備註、給店員看的原文清單與合計。 | 保留重點獨立頁。免費每批 1 張、Pro 10 張。不同幣別分開加總，不換匯；價格未知不給確定總額。不是送單或付款功能，過敏／食材仍向店員確認。 | `smart_scan_document.dart:1–5`；`translation_image_screen.dart:952–990,1734–1859`；`smart_scan_result_screen.dart:1099–1183,1660–1694,1697–1793,2397–2590,2860–2912` |
| 文件整理 | 選文件類型、各頁照片整批辨識，分區、段落、清單及文件中的表格；查看原圖、點字看原文、搜尋掃描歷史。 | 保留獨立頁。明示照片流程，不把「文件」擴張成 PDF／Word 匯入、編輯、匯出。歷史搜尋依標題或類型，不能寫成全文檢索每個辨識字。 | `translation_image_screen.dart:849–930,952–990`；`smart_scan_result_screen.dart:1833–1867`；`smart_scan_history_screen.dart:97–105` |
| **表格翻譯** | 可直接選表格類型。依列與欄顯示，寬表格可橫向捲動，適用時固定列標籤；有需確認／無法辨識提示，能看原文與原圖。 | **建議新增獨立功能頁。** 現有文件頁只順帶提表格，沒有對應明確入口、寬表格閱讀與辨識提示。不要宣稱可編輯或匯出 Excel／CSV。 | `translation_image_screen.dart:1734–1859`；`smart_scan_result_screen.dart:930–978,1327–1480,2604–2718` |
| 掃描歷史 | 不同類型的掃描，含仍處理／失敗項目、按標題或類型搜尋、回開既有圖片與辨識結果。 | 放在菜單、文件、表格指南的收尾；三者共用掃描歷史，與文字、Audio、Chat 紀錄分開。 | `smart_scan_history_screen.dart:39–50,97–117,173–191` |
| **新版 Chat** | 底部入口開全螢幕 Chat；語音與學習已合併到這個對話介面。 | 舊 Agent 詳頁及相關用例、FAQ、定價說明需重寫／轉向新版 Chat。課程、目標與複習由 `main-chat-audit-20261116.md` 精確列出，本表不重複深挖。 | `main.dart:1392,1424–1431,1584–1620`；新版 `translation_chat_screen.dart` |
| iOS 翻譯鍵盤 | 可用輸入法、輸入語言／翻譯目標切換、語氣、翻譯欄位或選取文字；剪貼簿譯文卡、複製／插入；語言包、教學、原生 iOS 聽寫相容路徑。 | 保留獨立頁，補工具與語言包內容。網路翻譯需完整取用，部分宿主／安全欄位限制第三方鍵盤。輸入法數量不等於翻譯語言數量；不要宣稱 App 自製 ASR 或 Mac 全域聽寫。 | `KeyboardToolsView.swift:7–12,37–38`；`KeyboardInputTypes.swift:6–80`；`KeyboardViewController.swift:563–568,1160–1171`；`translation_keyboard_screen.dart:90–103,187–200,583–694` |
| 學習 Widget | iOS 17+，主畫面小／中／大 Widget；鎖定畫面兩個獨立位置，支援系統的待機呈現；朗讀、再複習、已記住，依回答安排後續。 | 保留獨立頁。免費為自動內容；Pro 可組合單字、搭配、慣用語／諺語、句子、主題與難度，含自訂。鎖定畫面點卡片開 App 並標為再複習，不宣稱在鎖定畫面可做所有主畫面按鈕操作。 | `learning_service.dart:18–44,105–112`；`LearningWidget.swift:142–170,800–819,1115–1143,1357–1415`；`learning_widget_screen.dart:149–396` |
| **任何 App 翻譯** | Tools 新入口；畫面文字與影片音訊字幕，PiP／開始停止、用量與歷史等由專項報告核對。 | **新增獨立功能頁與完整教學。** 依可擷取內容及系統限制表述，不把 iOS 功能寫成 Mac 全域翻譯、任意通話錄音或保證所有串流平台可用。 | `main.dart:1431–1434,1531–1544`；`main-screen-translation-audit-20261116.md` |
| 方案、用量、恢復與管理 | App 用量卡顯示各池餘額及更新日期、訂閱續訂／到期狀態與 Apple 管理入口；訂閱頁可恢復購買、使用 Apple 優惠流程。 | 定價頁介紹使用差別與 App 內確認，不用測試 fixture 假價格。使用者看得到的是標準版／語音版，舊資料與額度欄位名稱不是行銷功能名稱。 | `usage_card.dart:60–143,312–439`；`subscribe_screen.dart:189–210,766–840`；`subscription_plan_names.dart:189–195` |
| 設定與服務 | App 語言、Light／Dark／跟隨系統、個人頭像／顯示、App 內客服、圖片附件、使用說明、評分入口及資料清理。 | 留在支援／FAQ／隱私說明的支持層；不必把每個設定做成功能頁。客服有文字／附圖能力，不等於即時真人回覆保證。不要宣稱無帳戶資料／零留存／所有資料只在本機。 | `user_screen.dart:254–377`；`support_screen.dart:192–278,366–424`；`main.dart:1120–1126,1178–1187` |

## Helper 與鍵盤可補充的真實細節

main 公開 config v96 的 Helper 預設包含：同義詞、反義詞、記憶法、搭配、用法說明、逐詞解析、文法、例句、隱含意思、常見錯誤、情境回覆。每個預設有 scope 與輸入長度門檻，不應宣稱每一種輸入都同時出現全部選項。原碼：`anytranslator-api/config/default-prompt.public.json` 的 `uiInformation.helperPresets`；解析契約 `lib/api/settings.dart:187–270`。

鍵盤真正能輸入的模式與翻譯目標清單不同。原碼包含注音、拼音／九宮格、英文區域版面、俄文、泰文、韓文、越南 Telex、馬來文、粵拼／倉頡／速成、日文假名／羅馬字，以及多種直接字母版面（`KeyboardInputTypes.swift:6–80`）。官網可用「支援多種輸入法，依指引下載所需語言包」，不硬報一個與翻譯語言清單混淆的總數。iOS 聽寫是系統能力，`refreshDictationLanguage` 只促使系統重新讀取語言（`KeyboardViewController.swift:1160–1171`），不是 App 自製語音辨識。

## 方案事實與不可直接沿用的數字

資料僅為 main 公開設定 v96，不是當前商店售價或已部署設定驗證。產品顯示名稱的繁中來源為 `lib/locales/subscription_plan_names.dart:189–195`：標準版、語音版；週繳、月繳、年繳。

| main 現行方案 | 翻譯次數 | 語音翻譯／影片字幕 | AI 助手語音 | Helper 設定 |
|---|---:|---:|---:|---:|
| 標準版週繳 | 不限 | 每週 150 分鐘 | 每週 10 分鐘 | 5 組 |
| 標準版月繳／年繳 | 不限 | 每月 600 分鐘 | 每月 30 分鐘 | 5 組 |
| 語音版週繳 | 不限 | 每週 600 分鐘 | 每週 45 分鐘 | 5 組 |
| 語音版月繳／年繳 | 不限 | 每月 2,400 分鐘 | 每月 135 分鐘 | 5 組 |

年繳是計費週期，上述額度仍按月更新；不能把月額度誤寫成全年總量。免費方案的 main 設定同時含舊用戶 25 次、2026-11-01 起新安裝 15 次、`periodDays:1` 與 2026-12-07 起的 scheduledPolicy；不能只讀 raw `quotaPeriod:'week'` 就宣稱所有免費用戶每週固定量。網站文案採「以 App 用量卡顯示的適用次數、分鐘與更新日期為準」。也不能把已安排的未來政策當作已上線公告。

用量語意：

- Chat 打字／照片使用文字翻譯次數，Chat 語音使用 AI 助手分鐘：`usage_card.dart:139–142`、`usage_translations.dart:24–32`。
- 影片字幕共用 Audio 語音分鐘池：`screen_translate_controller.dart:424–438`。
- 畫面文字使用翻譯次數；一個新畫面 translation batch 共用一個 usage_id，不是每一段扣一次，也不是一次啟動後所有畫面只扣一次：`screen_translate_controller.dart:111–117,1145–1148,1179–1189,1310–1322`（與螢幕翻譯專項交叉確認）。
- 既有訂閱可能有保存的額度快照，網站不保證每位既有訂戶已自動轉成新方案。`usage_info.dart:83–92,134–155,364–394`。
- 價格／優惠／續訂條款由 Apple 在購買前提供；方案不可用、取消或恢復不能在網站模擬成購買成功。

## 建議的官網功能層級

先把舊 10 模組修成 **11 個對外功能介紹**：文字、照片、語音、菜單、文件、表格、Chat、Helper、鍵盤、Widget、任何 App 翻譯。計算是舊 Agent 退場，再新增表格與任何 App 翻譯，不是宣稱 App 有 11 個底部頁籤。

- 新增：`/features/table`、`/features/screen-translation`；螢幕翻譯需自己的教學文章及影片／閱讀情境。表格可先用獨立功能頁與文件指南內的明確流程，不為補頁數再造重複入口。
- 重寫：`/features/chat`、Chat 語音／學習指南，以及首頁示範、FAQ、使用案例、定價的相關說明。Chat 學習在同頁分章完整介紹；若專項審核確認完整課程流程需要獨立長文，可用 Blog／使用指南承接。
- 舊 `/features/agent`：保留可理解的轉向至 Chat，避免死連結；不再以 retired task UI 宣傳現行 main。
- 更新：照片、菜單、文件的「先選類型」步驟；讀文件與表格時對照原文，不接錯到聽說步驟。語音頁補摘要、聲音模式與音訊裝置差異。
- 支持層：歷史／收藏、原生聽寫、語言包、Widget 免費／Pro、App 內客服與方案管理放回相應頁面，不把內部工程名詞或每個設定另做大模組。

## 舊實機圖失效與重拍優先序

先保留所有原 PNG、hash 與來源證據；**舊 source e5c2／build 2243 圖不能改標成 d64f37 的最新實機圖**。以下僅為原碼差異判定，未操作裝置確認目前安裝版本。

| 優先 | 畫面 | 必須更新的理由與拍攝內容 |
|---|---|---|
| P0 | 新 Chat | 舊 Chat 與 Voice Agent 分開的介紹、訊息樣式和任務流程已不代表目前 main。需新文字／照片對話、真正的即時語音狀態、課程與課後複習等專項 shot list。 |
| P0 | 任何 App 翻譯 | 新功能，舊素材沒有對應畫面。需設定／模式、正常開始與停止、真實可公開來源文字翻譯、影片字幕／PiP及紀錄，不能用測試 shell、golden 或原型冒充。 |
| P0 | Photo 整理入口 | 上方明確的菜單／文件／表格類型列、下方即時／整理控制已改；需要新版完整介面與每類正常公開輸入結果。 |
| P1 | 菜單主圖／選項／給店員看 | 中性灰、分頁、合計浮動呈現與其他共用元件有變；用公開菜單重新操作份數／加料／原文點單。不能只把舊紫色像素改灰。 |
| P1 | 文件與表格 | 新類型入口及寬表格／辨識提示 UI；文件用段落主圖，表格用足夠欄位的真實結果及原文對照。保留輸入頁照片為原始素材，送新版 App 再產生結果。 |
| P1 | Text／Helper | 主頁 Chat 按鈕已移除，來源切換／Helper與共用按鈕、色彩已變。需新版完整主頁、可公開字句與解說設定；截圖應顯示正確的現行入口。 |
| P1 | Audio | 共用灰階、語者訊息／聲音設定與播放控制有變。優先真實雙語字幕與摘要，設定模式圖作輔助，不用舊實驗設定 sheet 當唯一功能範例。 |
| P1 | Keyboard | 真正 extension 優先。即使原生檔案部分未變，App 發送的語意色 payload 已改；App 中 KeyboardPreview／教學示意不等於真正 extension。 |
| P1 | Widget | 原生 Swift 已變，原先 664px 鏡像圖畫質仍不合格。App 教學中的手機／桌布與卡片是程式繪製的示意（`learning_widget_screen.dart:551–873`），不能冒充真實主畫面 Widget；可另拍 App 設定作輔助，主功能應拍原生 Widget。 |

原生畫面應保留本來的排版與顏色、使用公開範例、原始解析度，不注入假結果、不用重繪／AI 修補控制元件，不修改使用者歷史或私人內容。畫面來源、App build、source commit 與實際功能結果分開記錄；靜態原碼盤點不等於這些截圖或實機流程已完成。

## 已交付的繁中文案檔

新增 `src/translations/marketing/main-common-zh-tw.json`，僅覆寫繁中；其他 18 語系依使用者指示暫緩。

- `features`：8 個既有功能的完整必要覆寫，加上新的 `table` FeatureDetail（每項均含 title／summary／heading／body／3 steps）。不含 Chat、螢幕翻譯及 retired Agent，由專項／root 整合。
- `scan`：首頁整理區明示菜單／文件／表格三類。
- `workflows`：travel、work、dining、messages、reading 各 3 步；改掉舊 Agent 與文字主頁 Chat 快捷鍵說法。
- `articles`：voice、menu、work、mac、keyboard 的 intro／tip／limit；不覆蓋另一代理負責的 study／media 內容。
- `documentArticle`：明確的文件／表格流程與照片格式邊界。
- `marketing`：首頁短介紹與功能總覽，另提供 `faq.FreeQ/A`、`faq.AgentQ/A`、`faq.ScanQ/A` 六個現行繁中 FAQ 覆寫。Agent FAQ 已改為「Chat 語音和語音翻譯有什麼不同？」，免費不固定量，整理說明明列菜單／文件／表格。
- `pricing`：方案名稱、計費池、免費條件、現行 main 付費方案 facts 與管理／恢復說明。定價數字仍須在正式發布前對照實際產品設定與 App 顯示，不在本任務發布。

JSON 解析及欄位檢查通過：9 個完整 FeatureDetail、5 組各 3 步流程、15 個文章段落、6 個 FAQ 字串，以及全部為字串的 pricing copy；沒有 retired Voice Agent 或已移除的文字主頁快捷鍵宣稱。不執行建置或裝置測試。原碼外的商店相容性、已部署 config、真實 API、實機 UI 與全部新截圖均未驗證。

## 53bdfc0f 續接差異

本節固定於新 main `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487`，只稽核相對於 `d64f37eee635ab71f697b4f1157fba87b78abcf0` 的 10 個 commit。下列行號屬於新 commit；既有九項共通功能、Free／付費方案與文案是否仍成立，依此差異核對。Chat 與螢幕翻譯的完整差異仍由各自專項報告承接。

### 共通設定與 Audio 沒有新的方案／模式變更

公開 config 升為 v97。以 JSON 解析後逐值比較，`subscription`、`versionInformation`，以及 `uiInformation` 的 `toneOptions`、`helperPresets`、`cloudPronunciationEnabled`、`cloudPronunciationLanguages` 均與 v96 相同；`uiInformation` 只有 `chatChips` 與 `chatLessonCatalog` 有變。故上方 Free 條件、標準版／語音版的各週期額度、Helper 設定數與菜單／文件／表格張數邊界不需因這次版本調整而變更。這仍是原碼公開設定，不代表已部署 config、App Store 商品或每位既有訂戶的實際餘額。

`lib/audio_translation/settings_view.dart` 僅刪除 `ModeSummaryTag` 類別。d64 原本唯一引用在 Chat（舊 `translation_chat_screen.dart:70,1281`），不是 Audio；53b 已無該符號引用。`translation_audio_screen.dart`、`audio_translation/settings.dart` 沒有本次差異，因此雙向對話／私下聽／幫我說／只看字幕四模式與 Audio 摘要的現有介紹維持。

### Chat 入口採新流程，不把保留程式當現行入口

Chat 專項已核對：移除原模式 sheet 及獨立語句訓練、自由練習、「我的句子」入口。現在 intro 提供「場景訓練」與「目標學習」，在對話內選項、難度後開課；第一階段也能直接打字／說話提出自訂需求。目標計畫仍有語句與場景單元，不能把這些單元描述成 intro 的獨立第三入口。

共通 JSON 的首頁與 FAQ 已改為「場景訓練或目標學習」，移除把目標、語句、場景並列為三種入口的句式。五組 workflows、Helper、Widget 與 voice 文章沒有宣傳被移除的獨立入口，保留各自現行功能；Widget 的「句子」為原生 Widget 內容類型，與 Chat 入口不同。

### 用量卡不再顯示 Chat 計費註記，改以執行程式確認

`lib/components/usage_card.dart` 與 `lib/locales/usage_translations.dart` 已移除 `UsageChatChargeNote`。上方 d64 節的 `usage_card.dart:139–142`／`usage_translations.dart:24–32` 是舊版 UI 註記，不能再當作 53b 的可見內容或計費證據；文字移除本身也不代表計費合約改動。

53b 的實際計費路徑：

- `anytranslator-api/shared/usage.mjs:26–34,292–309` 將 `chat`、`chat_custom_lesson` 列為翻譯次數任務。
- `lib/api/realtime_voice.dart:128–132` 為 Chat 即時語音申請 `/v1/voice-agent/sessions/full`；`shared/usage.mjs:158–159,186–187` 將方案 `voiceAgentMinutes` 轉為 `voiceAgentLimitSeconds`；`shared/voice-agent-usage.mjs:36–49,111–112` 使用此額度並在不足時拒絕。
- `anytranslator-api/provider-handler.mjs:1627–1643` 對帶有 session 的 Chat 請求驗證同 installation 的 live lease；有效時只 `consumeRequest`，不另行 `acceptAi` 扣翻譯次數。`lib/api/chat.dart:842–844,874` 傳入 session；`translation_chat_screen.dart:2890–2898` 只有未在語音 session 的照片才預檢翻譯額度。
- 因此一般 Chat 文字／照片使用翻譯次數；**Chat 語音連線期間，該段文字、語音與照片共用 AI 助手分鐘**。共通 JSON 的兩個 pricing 用量說明已補此條件，避免把語音連線中的照片寫成再扣一次翻譯。
- 影片字幕共用 Audio 分鐘、畫面文字按新畫面 translation batch 使用翻譯次數仍由螢幕翻譯專項確認；這次沒有調整付費池額度。

本次只修改共通繁中 JSON 與本報告；沒有修改 App、帳務、private prompt、其他語系或部署。重跑 JSON 結構／舊入口字樣檢查及 `git diff --check`；未建置、操作裝置或驗證已部署版本。
