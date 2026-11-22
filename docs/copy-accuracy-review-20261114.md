# 官網文案校正 — 2026-11-14

> **歷史紀錄（2026-11-14）**：以下舊功能／頁面／圖片數量、Voice Agent 流程及圖片驗證證據只對當時來源成立，不代表目前 main `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487` 的功能、畫面或新版截圖驗收。
> 最新本地繁中狀態以[更新總覽](main-website-update-20261116.md)、[main 功能盤點](main-feature-inventory-20261116.md)與[新版截圖計畫](main-screenshot-plan-20261116.md)為準；本文保留供追溯。


> 使用者最新範圍：先完成繁體中文的 10 個功能圖與本地官網驗收。其餘 18 語系重拍延後，待使用者確認繁中後再處理。
本地工作分支 `codex/taste-website-20261114`；未 commit、push、合併或部署。功能依 main `ebd48f61aa29dda378ac8db689d1abd2d9ed7fc5` 核對；實機截圖另記錄各張實際安裝來源，不把本地 config 或截圖版本當成 Production 驗收。

## 功能與操作的校正依據

| 模組 | 原始碼依據 | 對外介紹重點 |
| --- | --- | --- |
| 文字、Helper | `lib/screens/translation_text_screen.dart`、`lib/components/custom_block_helper.dart` | 翻譯與六種語氣、朗讀／複製／收藏、Chat 追問；Helper 解說原文或譯文，儲存的是自訂指示，沒有上傳文件知識庫的承諾 |
| 語音 | `lib/audio_translation/settings.dart`、`lib/screens/translation_audio_screen.dart` | 雙向對話、私下聽、幫我說、只看字幕；雙語逐字稿、結束後摘要與分享 |
| Voice Agent | `lib/screens/voice_agent_task_screen.dart` | 說明任務、補問、確認開始、現場對話、先審閱總結再批准轉述；沒有自動打電話、送單或付款的承諾 |
| 照片 | `lib/screens/translation_image_screen.dart` | 「即時」鏡頭／單張圖片覆蓋翻譯，與「整理」掃描分開介紹 |
| 菜單 | `lib/models/smart_scan_document.dart`、`lib/screens/smart_scan_result_screen.dart` | 菜名／分類／價格、加料選項、份數、備註、保留菜單原文的點單；已知價格按幣別加總、不換匯，未知價格不提供確定總額 |
| 文件 | 同上 | 依序加入照片、整批處理、標題／段落／清單／表格、原圖／原文對照、歷史搜尋；免費 1 張／Pro 每批最多 10 張，沒有 PDF／Word 匯入編輯匯出的承諾 |
| 鍵盤 | `ios/TranslatorKeyboard/KeyboardViewController.swift` | 完整取用、支援欄位、iOS 原生聽寫轉文字、選取文字優先、語言／語氣、自己確認傳送；剪貼簿為獨立結果卡，不宣稱所有 App／安全欄位皆支援 |
| Widget | `lib/learning/learning_service.dart`、`ios/LearningWidget/LearningWidget.swift` | 主畫面直接朗讀、再複習、已記住；鎖定畫面開 App；免費自動內容／Pro 自訂條件 |
| 方案與平台 | `anytranslator-api/config/default-prompt.public.json` v81、商店實讀紀錄 | 免費 Voice 5 分鐘／Agent 2 分鐘均為每週；售價依 App 商店；Mac 按鈕連真實既有商店，保留未驗證相容性說明 |

## 全站修正

- `feature-details-{base,asia,europe-a,europe-b}.json` 為 19 語系、10 功能的統一來源，各語系 95 個非空欄位，共 1,805 欄。首頁、卡片、詳情、情境與 Blog 使用相同校正內容。
- 每個功能都有自己的介紹與三步操作。文件不再套用說話／聆聽步驟；掃描示範不使用語音波形。
- 首頁有菜單與文件的獨立重點區塊，以及文件示範分頁；其他 8 功能另外介紹。六種使用案例描述具體的連續操作。
- 35 個路徑、7 篇指南；文件新增 `/blog/scan-and-read-documents`，菜單有 `/blog/read-a-menu`。語音文章標題不再暗示全系統聽寫。
- 19 語系最新再修 57 欄：`features.menu.summary` 與 `case.dining.body` 改為保留菜單原文的點單，不保證店員／餐廳的語言；`download.mac` 改為查看 Mac 下載選項，保留 `macNote`。
- 合作頁為個別洽詢，未承諾佣金、追蹤或自動結算；聯絡表單只開啟郵件草稿，不假稱已送達。
- 關於、隱私與平台介紹不捏造團隊、客戶、數字、零留存或尚未上架的獨立 Mac App。

## 真實範例核對

- 菜單：正常 Provider 掃描、燕麥奶 +0.40、2 份、5.80 合計，與公開原圖一致；options／staff 已取得。noisette 的歧義錯譯未後製修字，改用正常 UI 新構圖，原證據保留。
- 點單說明確實以菜單推定主要語言，本次混合法英菜單產出法文，不能把它說成確知店員使用的語言。
- 文件：段落主圖已完成，介紹、自行車／駕駛分區、列點與公開原文對應；15 個表格時間亦相符。長日期表頭被 App 截斷，改作補充，另有原圖與點日期看完整原文的真實對照圖。
- 現有 Text／Voice／Chat／Helper／Widget 未見私人資訊、錯誤／loading 或確定的語意錯誤。Voice 尚為模式 sheet，Widget 尚為加入指南；不能據此宣稱已證明雙人對話或 iOS 主畫面互動。

## 實際驗證

| 檢查 | 狀態 |
| --- | --- |
| `npm run check:marketing` | 最新 57 欄修正後通過；19 語系結構、獨立流程、案例／文章路由、本地 v81 方案與 1／10 張 scan 限制 |
| TypeScript、`git diff --check` | 最新文案後通過 |
| client／prerender／SEO | 最新短文案後通過 35 routes、629 HTML＋404；完整 build 最後仍被缺圖 gate 擋下 |
| 官方 taste copy-lint | 最新英文首頁 934 words、菜單 345、文件 340、文件指南 441；四份皆 0 FAIL、0 WARN |
| 原生 IAB | 既有 30 組多尺寸／多語與 6 組中文標題檢查通過；新菜單及文件 Gallery 各 5 尺寸無橫向溢出或破圖；手機淺色／桌面深色目視已確認 |
| 最新 Mac CTA 長文 | 320px 英／法／德／俄／泰首頁皆完整可讀，按鈕至少 48px 高，無文字或頁面溢出 |
| 完整 build | 最後完整 build 未通過；本輪 gate 已依使用者縮為繁中 10 張，目前 7／10＋5 Gallery，仍缺 3 種功能與 Widget 高清，待補齊後重跑 |

圖片來源與最新數量：`image-refresh-inventory-20261114.md`。原生瀏覽器證據：`preview-refresh-20261114/native-menu-and-mac-checks.json`、`native-menu-gallery-mobile-light.jpg`、`native-menu-gallery-desktop-dark.jpg`、`native-document-gallery-desktop-dark.jpg`、`native-document-primary-mobile-light.jpg`。

## taste 與證據界線

使用官方 taste-skill 2.5.1，來源 commit `f6b76575f949707b4e3c37cd86cb44b0b98643e8`，持久副本在 `/Users/luyi/.codex/artifacts/anytranslator-website-taste-skill-20261114/skills/taste-skill/SKILL.md`。按使用者的 Typeless 方向、現有品牌與 Hugeicons 基準，檢查文案、真實畫面、一致性、四角、清晰度與 responsive 呈現。

**自動 Browser Gate 未執行，不能稱 GATE PASS**：該工具會另啟 headless Chrome，與使用者限定 Codex 原生瀏覽器衝突。採原生 IAB 實際驗證；官方無瀏覽器 copy-lint 可獨立執行。沒有 Lighthouse、跨瀏覽器、逐語系母語人工審校、正式流量、實際購買、郵件寄送、Mac 安裝或完整 App 功能驗收。

本地預覽：<http://127.0.0.1:5178/?lang=zh-tw>。

依使用者要求，手機操作留到其他工作完成後；本任務 XCTest runner 與 USB proxy 已停止並釋放建置鎖，網站的離線整合與檢查繼續。

## 繁中補充：鍵盤原生聽寫

另核對 main Swift 的 `refreshDictationLanguage`／`primaryLanguage` BCP47 與 `docs/keyboard-native-dictation-20261113.md`：主線採 iOS 提供的原生聽寫，自製背景語音未進 main。只為本輪繁中補齊鍵盤 summary／body／3 steps 及 Blog intro／tip／limit，共 8 欄；說明「原生聽寫→檢查文字→AnyTranslator 翻譯／語氣→自行傳送」，並保留宿主、安全欄位、系統／語言／設定可用性條件。沒有宣稱 App 自製 ASR 或 Mac 全域工具，也沒有更改 App UI／流程。其他語系依使用者指示延後同步；新增 keys 為零。`check:marketing` 通過，原生 IAB 的 734px 繁中功能頁一個 h1、無橫向溢出。
