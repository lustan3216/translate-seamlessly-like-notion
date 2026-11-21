# AnyTranslator 官網改版規劃（本地預覽）

> **歷史紀錄（2026-11-14）**：以下舊功能／頁面／圖片數量、Voice Agent 流程及圖片驗證證據只對當時來源成立，不代表目前 main `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487` 的功能、畫面或新版截圖驗收。
> 最新本地繁中狀態以[更新總覽](main-website-update-20261116.md)、[main 功能盤點](main-feature-inventory-20261116.md)與[新版截圖計畫](main-screenshot-plan-20261116.md)為準；本文保留供追溯。


> 使用者最新範圍：先完成繁體中文的 10 個功能圖與本地官網驗收。其餘 18 語系重拍延後，待使用者確認繁中後再處理。
> 最新圖像方案：依使用者要求，產品圖與情境圖全部改用正常 App 操作後取得的真實實機截圖；先前 AI 圖與功能示意圖已退出活躍頁面。重拍進行中，不能把缺圖版位或舊設計當成完成。詳見 `image-refresh-inventory-20261114.md`。

software：跨語言溝通與學習 App。App 來源 `main ebd48f61aa29dda378ac8db689d1abd2d9ed7fc5`（2.1.4+202611120405）；官網為獨立 Git repository，來源 `main 193e4ba927ce30b3afa244dd4538755ad02eb238`。

設計：使用者明確指定參考 Typeless；大字、黑白主次、充足留白、圓角按鈕、短敘事、真實產品畫面。沿用 AnyTranslator logo、既有 Hugeicons、產品截圖及紫藍品牌提示，不重新設計 App。採既有 React/Vite、路由、多語與預渲染系統，不增加框架。保留 19 個官網語系。

## 1. 定位與文案策略

- 核心受眾：旅行者、跨語言工作者、跨國伴侶／朋友、外語閱讀者與學習者。
- 核心行動：下載現有 App。macOS 與 iOS 都連到已存在的 Apple 商店 App，不虛構 DMG。
- 主張：說出想法、讀懂眼前、把事情說清楚，再把語言學起來。翻譯是下一步行動的起點。
- 首頁：短主張 → 產品畫面與可切換示範 → 核心模組 → 情境 → 學習延續 → 隱私說明 → Blog → FAQ → 下載。
- Hero：說出你的想法。讓世界聽懂。／說、譯、看、聊、學。從一則訊息到一段對話，AnyTranslator 陪你找到合適的話，也讀懂話裡的意思。
- 不把「比 Typeless 強」「4 倍快」「零留存」「任何桌面 App 自動插入」當已驗證事實；不捏造用戶、數字、見證或企業方案。
- 每個模組：先描述情境和結果，再展示 App、說明操作與限制，連結相關情境／教學。
- FAQ：免費與 Pro、支援平台、Agent 的範圍、鍵盤權限、掃描、準確性。沿用既有 19 語內容。

## 2. 資訊架構（35 個頁面，含既有法律與支援）

| 層級 | 頁面 | 目的與內容 |
|---|---|---|
| 首頁 | `/` | 建立定位，展示完整能力與下載入口 |
| 功能 | `/features` | 10 個可直接深入的核心模組 |
| 功能細頁 | `/features/text`、`photos`、`voice`、`agent`、`menu`、`document`、`keyboard`、`widget`、`chat`、`helper` | 場景、產品截圖、詳細說明、操作步驟、相關功能；照片能力有獨立頁，也在 document／menu 與總覽呈現 |
| 使用案例 | `/use-cases` | 旅行、工作、點餐、學習、聊天、閱讀 |
| 案例細頁 | `/use-cases/travel`、`work`、`dining`、`study`、`messages`、`reading` | 為甚麼需要、實際流程、相關功能、下一步 |
| 定價 | `/pricing` | Free／Pro 的價值與功能比較；價格由 App Store 當地即時顯示，避免測試 fixture 假價格 |
| 下載 | `/download` | 顯著 macOS 與 iOS 下載、相容性、平台差異 |
| 關於 | `/about` | 為甚麼打造產品、理解之後的下一步、產品原則；不虛構團隊背景 |
| 合作 | `/affiliate` | 創作者、教育者、社群合作邀請、三步洽談、真實狀態；沒有自動追蹤或佣金承諾 |
| 聯絡 | `/contact` | 支援／建議／合作／隱私分類，驗證表單後開啟使用者郵件草稿，絕不假裝送出 |
| Blog | `/blog` | 主題篩選、文章卡、內部連結 |
| 7 篇指南 | `/blog/voice-translation-and-dictation`、`read-a-menu`、`scan-and-read-documents`、`write-across-languages`、`learn-from-translations`、`anytranslator-on-mac`、`ios-translation-keyboard` | 操作型 evergreen 內容，有正文、章節導覽與相關功能；文件掃描有獨立教學，macOS 與語音的能力邊界明確 |
| 支援 | `/support` | 既有 FAQ、教學入口、真實聯絡方式 |
| 法律 | `/privacy-policy`、`/terms-of-service` | 保留既有法律原文，不在改版中擅改條款 |
| 錯誤 | 自訂 404 | 可返回首頁／下載，noindex |

## 3. 能力證據與平台限制

- 文字：`lib/screens/translation_text_screen.dart`，語氣改寫及翻譯、朗讀、收藏、歷史；Helper 語法、詞彙解說與儲存自訂解說指示，不宣稱上傳文件知識庫。
- 語音：`lib/screens/translation_audio_screen.dart` 與 `lib/audio_translation/settings.dart`，雙向、幫我說、私下聽譯、字幕，並有總結。沒有 Mac 系統音訊直接擷取證據。
- 照片：`lib/screens/translation_image_screen.dart`、`lib/models/smart_scan_document.dart`，OCR、菜單、表格、文件、點餐與歷史。
- Agent：`lib/screens/voice_agent_task_screen.dart`，協助追問、整理、審核與確認，不承諾自動付款／訂房／送件。
- Chat：`lib/screens/translation_chat_screen.dart`，文字／照片追問與歷史。
- iOS 鍵盤：`ios/TranslatorKeyboard/`；`lib/main.dart` 隱藏 Mac 鍵盤入口。支援欄位可搭配 iOS 原生聽寫先轉文字，再用鍵盤翻譯／調整語氣；不把它宣傳成 App 自製 ASR 或 Mac 全域聽寫工具。
- 學習 Widget：`lib/learning/`、`ios/LearningWidget/`，學習卡、主畫面／鎖定畫面；不宣稱所有平台同功能。
- macOS：main 具有 iPhone／iPad App 在 Mac 執行的支援，沒有獨立 `macos/` target。2026-11-14 實讀現有 App Store 頁面顯示「Only for iPhone」「Designed for iPhone. Not verified for macOS.」，有 View in Mac App Store 按鈕，但相容性僅列 iOS 16.0。下載按鈕按要求保留並連至真實商店；網站與文章都明示未驗證狀態，不能把 main 程式支援當已上架的 Mac 驗收證據。正式發布前須再確認商店可下載狀態。
- 價格：`lib/storekit_service.dart` 使用 Apple ProductDetails.price；StoreKit fixture 不是正式售價。語音翻譯／Agent 額度分別計算，舊訂戶可保有不同快照。
- 隱私：本地與服務端資料皆存在，AI 需要網路，沿用既有政策，不借用 Typeless 零保留宣稱。

## 4. 首頁的畫面節奏

1. Hero：大字與雙平台下載，建立品牌主張；畫面首屏只留必要說明。
2. 實際產品舞台：手動切換文字／語音／菜單／文件／Agent／Chat，沒有定時輪播。每種功能只使用自己新擷取的真實畫面。
3. 功能總覽：菜單與文件掃描各自有重點區塊，其餘 8 模組另列；10 個功能都有獨立說明與真實操作步驟。
4. 生活案例：6 個具體起點，用產品內容而非無關裝飾圖承接。
5. 理解到學習：大字敘事與 Helper／Widget 截圖。
6. 信任：清楚說明線上處理與政策，不用未證實的保證。
7. Blog：7 篇教學，帶向實際操作。
8. FAQ 和下載結尾：解除疑慮、回到同一行動。

## 5. SEO 與內容擴展

Evergreen 正式頁面適合 index，這次僅本地，不上傳、不部署、不新增正式服務。每頁有獨立 title／description／canonical／hreflang、可預渲染正文、站內連結、sitemap；文章加 Article schema，無虛構作者或日期。既有英語法律頁維持英語，不假裝翻譯。

後續選題：Voice Agent 與逐句翻譯怎麼選、飯店入住清單、商務信件語氣、文件表格對照、Helper 自訂指示、Widget 複習、照片掃描準確性與過敏原確認。依功能實際版本安排，不宣稱尚未驗證的功能。

## 6. taste skill 的適用與驗證界線

使用官方 Leonxlnx/taste-skill 2.5.1 的文案與一致性原則。使用者指定 Typeless 風格及現有品牌，優先於技能隨機配色／字體與強制視效。專案明確要求 Hugeicons，優先於技能其他圖示建議。使用者要求所有網站互動只用 Codex 內建瀏覽器，因此不執行技能會另開 Chrome 的 consistency／shoot／perf／gate browser scripts；以原生 CUA 實際查看與互動驗證取代，不能標成 taste 自動 Gate PASS。

本地驗證紀錄在 `website-redesign-verification-20261114.md`。不操作 App 建置、不安裝、不更改後端、不寫 Production、不提交或推送。
