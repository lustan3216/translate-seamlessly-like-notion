# main 功能與繁中官網更新 — 2026-11-16

> 後續主題切換、首頁 10 情境／分層設計、main 61bd／v98、本機裝機與實拍連線阻擋的目前狀態，見 [本輪接續報告](theme-home-native-refresh-20261116.md)。以下保留前一階段紀錄，不代表後續圖片已補齊。

**Taste 自動 Browser Gate：未執行；不宣稱 GATE PASS。完整圖片驗收仍未完成。** Skill 的 headless Chrome 流程與本任務「只用 Codex 原生瀏覽器」限制衝突；本輪使用原生 IAB 進行實際版面與互動檢查。未新增 waiver、未降低圖片檢查門檻。

本輪截至 App main `358dc9b905ae93cf97b7725c461610d1f0ba07ca`、公開設定 v97，更新 **繁體中文本地草稿**。完整原始盤點於 `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487`，續查唯一的新 commit：Chat 兩個學習入口上方新增「也可以用這兩種方式學語言：」；入口、功能流程、方案與設定未變。來源 snapshot／圖片管線目標已前移 358；沒有改動舊 App 圖的來源版本。其餘 18 語暫緩。原碼實作、正式服務已開放、裝置安裝版本及實機操作證明分別記錄；本輪沒有把原碼盤點當作實機驗收。

工作樹：`/Users/luyi/.codex/worktrees/website-taste-20261114/translator/website`，分支 `codex/taste-website-20261114`。預覽：<http://127.0.0.1:5178/features?lang=zh-tw>。沒有 commit、push、部署、Production 寫入、App 建置／安裝或手機操作；main 的既有未提交修改未動。

## 目前介紹架構

繁中目錄為 **11 個功能模組、7 個使用案例、9 篇文章**，並保留定價、關於、聯盟合作、聯絡、支援、下載及法律頁面。

| 功能 | 本輪介紹重點 |
|---|---|
| Chat 對話與語言練習 | 文字、照片、語音在同一 Chat；介紹訊息下的場景訓練／目標學習；對話內選內容與難度、自訂需求、八個目標、目標內語句、回饋／回顧／本地歷史。移除舊五模式、獨立語句／自由練習／我的句子入口承諾。 |
| 任何 App 翻譯 | iOS／iPadOS 16+ 的影片字幕、畫面文字、系統螢幕直播、子母畫面、停止與本地文字紀錄。明確區分 App 播放音訊與可見畫面區域、內容保護限制及額度。 |
| 文字翻譯與寫作 | 語言、語氣、朗讀、複製、收藏及正確的歷史／收藏 Chat 草稿入口；不再宣傳主文字結果旁已移除的按鈕。 |
| 照片翻譯 | 即時鏡頭與照片疊字；與整理模式分清楚。 |
| 即時語音翻譯 | 雙向對話、私下聽、幫我說、只看字幕；對話與摘要。與 Chat 語音及影片字幕分清楚。 |
| 菜單掃描與點餐 | 先選菜單類型，照片、菜色、價格／選項、份數、加料、原文點單與合計；不宣稱付款或自動送單。 |
| 文件智慧掃描 | 先選文件類型，逐頁照片、分區段落／清單、原圖原文與掃描歷史；不宣稱 PDF／Word 匯入匯出。 |
| 表格翻譯 | 獨立表格類型及功能頁，列欄、寬表橫向閱讀、原文核對與辨識提示；不宣稱 Excel／CSV 編輯匯出。 |
| iOS 翻譯鍵盤 | 原生 extension、翻譯／語氣、輸入法與語言包；聽寫由 iOS 提供，支援欄位與完整取用限制。 |
| Helper 與自訂知識 | 各種解說與可重用指示，不包裝成檔案上傳知識庫。 |
| 學習 Widget | iOS 17+ 主畫面／鎖定畫面、朗讀與複習，區分免費／Pro 設定及各位置可用操作。 |

新增 `/features/screen-translation`、`/features/table`、`/use-cases/media`、`/blog/chat-language-practice`、`/blog/translate-other-apps`。繁中舊 `/features/agent` 轉向 Chat，React 與 hosting redirect 均保留。Blog 圖片依文章實際功能取用，不再取無關使用案例圖片。

定價資料固定自 main 公開設定：標準版／語音版與週／月／年週期、翻譯次數、語音分鐘及 AI 助手分鐘；免費量依 App 適用政策，不硬寫所有人固定週額度。一般 Chat 文字／照片使用翻譯次數；有效 Chat 語音連線中的文字、語音與照片共用 AI 助手分鐘。商店售價與實際可用量仍由 App／Apple 購買流程確認。

Mac 下載按鈕保留真實 App Store 連結，未虛構 DMG、Intel 支援或 macOS 全域翻譯能力。聯盟合作維持個別洽詢，未編造分潤制度或推薦人收益。

## 已完成的檢查

| 檢查 | 結果與範圍 |
|---|---|
| TypeScript | `npx tsc -p tsconfig.app.json --noEmit` 通過，實際檢查 App 檔案。 |
| 內容與來源 | `npm run check:marketing` 通過；固定 Git object、完整公開設定 SHA、7 個方案、Scan 1／10 張限制、官方 SVG hash、繁中 11／7／9 adapter 與 SSR；掃描全部 37 條繁中路由的過時 Agent／Chat 入口承諾。 |
| 既有語系合約 | 19 語既有資料檢查通過；不代表其餘 18 語已翻譯新增功能。 |
| 原生瀏覽器響應式 | 49 組頁面／寬度檢查，涵蓋 320、390、768、1024、1440px。H1、主內容邊界及舊 Agent 文案檢查無發現；先前 320px Blog 三頁的卡片標題溢出已修正，相關窄版重測通過。這不是完整無障礙／碰撞自動驗收。此證據保留原 53b 時點；358 差異只更新 App 導引句與網站來源 metadata，網站可見內容／CSS 未變。 |
| 語言選單 | 新增的繁中專用頁只列可用語言；舊英文 Agent 示範切繁中會回 Chat；舊 Agent URL 轉向已確認。桌面 Chat 頁 Escape 關閉選單，焦點回 `language-picker-header`。 |
| Vite、預渲染與 SEO | 最新 `npm run build` 完成 Vite、633 個本地化頁面＋404、40 條原始路由及 SEO／品牌來源檢查；**最終 exit 1，停在新版原生圖片驗收**。不是全 build 通過。 |
| 差異檢查 | `git diff --check` 通過。 |

響應式紀錄：[responsive-checks.json](main-preview-20261116/responsive-checks.json)。本輪網站畫面：[Chat 桌面](main-preview-20261116/chat-desktop-53b.jpg)、[任何 App 翻譯手機](main-preview-20261116/screen-translation-mobile-53b.jpg)、[Blog 320px](main-preview-20261116/blog-320-53b.jpg)。**以上是網站 QA 截圖，不是 App 新截圖。**

Build 詳細紀錄位於本地 `output/main-review-20261116-build.log`。現有 Browserslist 資料過舊及約 1,025.55 kB minified／395.51 kB gzip chunk 警告保留；未做效能分數或載入速度宣稱。

## Taste 與素材驗收限度

套用 [taste-skill](/Users/luyi/.codex/artifacts/anytranslator-website-taste-skill-20261114/skills/taste-skill/SKILL.md) 的文案、真實 UI、等邊距、圖片對應、解析度、四角與互動檢視原則；延續使用者已選的 Typeless 方向及 AnyTranslator 既有黑白／中性灰、Hugeicons 與版面，沒有再抽新配色或重做 App。網站為 software 類型，主要動作為下載。未加入 AI 情境照、重繪 App UI、虛構見證或客戶數；無新增 stock stand-in。

本輪保留既有選定設計，沒有另設 dealt moment 或 effect；**不宣稱符合技能的全套構圖／動效／效能 Gate**。先前英文 copy-lint 證據只屬舊報告，本輪繁中新文案的檢查是上述 source／rendered content checker 與人工核對，不能混稱為新 taste copy-lint PASS。

| 原生素材 | 現況 |
|---|---|
| 固定新版 main 主圖 | **0／11**，全部仍待真正匹配 358 artifact 的拍攝。 |
| 仍在本地顯示的舊素材 | 6 張舊主圖＋5 張 gallery，共 11 張；只作歷史草稿，未改標新版。 |
| 有獨立 artifact receipt 的舊素材 | 2 張主圖／7 張合計。 |
| 完全缺少草稿主圖 | Chat、任何 App 翻譯、照片、表格、鍵盤；缺圖位置保持不顯示，不代換其他功能。 |
| Widget | 舊 664px Mirroring 圖仍需原生解析度替換；不可算符合新主圖需求。 |
| 圖片 bytes | 27 個原始／衍生 hash 維持；未重新壓縮、偽改版本／時間、注入結果或以 golden／replay 冒充實拍。 |

因此圖片 checker 正確保留 `partial`／exit 1。所有 Light／Dark App UI、鍵盤／Widget 原生狀態、真實 Provider／語音／PiP 流程、裝置版本與新版截圖尚未驗收。本輪網站以 light 進行實際檢視；其他語系長文與 RTL 暫緩，不能宣稱全部完成。瀏覽器測試的 viewport 與 media emulation 已恢復預設，預覽分頁與本地 Vite 保留供使用者檢視；本輪沒有持有 iOS 建置鎖或啟動手機 runner／proxy。

## 後續拍攝依據

依 [新版截圖計畫](main-screenshot-plan-20261116.md) 與相同 main 的實際 artifact，正常操作並保存公開範例的原始解析度、版本、來源、時間與 hash。Chat 優先拍 intro 兩入口、對話內 picker、目標內語句、真實回饋；任何 App 翻譯要有兩模式的真實 PiP 結果；菜單／文件／表格各拍其實際結果。手機依使用者要求排最後，尊重其他任務及共享建置鎖；本次未自動重試先前失敗的 automation。

詳細來源：[完整功能盤點](main-feature-inventory-20261116.md)、[最新 Chat 審查](main-chat-audit-20261116.md)、[任何 App 翻譯審查](main-screen-translation-audit-20261116.md)。舊 20261114 文件已加歷史註記，不取代本報告的最新數量及驗收狀態。
