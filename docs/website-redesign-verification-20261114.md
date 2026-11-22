# 官網本地驗證 — 2026-11-14

> **歷史紀錄（2026-11-14）**：以下舊功能／頁面／圖片數量、Voice Agent 流程及圖片驗證證據只對當時來源成立，不代表目前 main `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487` 的功能、畫面或新版截圖驗收。
> 最新本地繁中狀態以[更新總覽](main-website-update-20261116.md)、[main 功能盤點](main-feature-inventory-20261116.md)與[新版截圖計畫](main-screenshot-plan-20261116.md)為準；本文保留供追溯。


本輪先驗收繁體中文，其他 18 語系圖片依使用者指示延後。**圖片工作尚未完成：7／10 主圖＋5 張 Gallery，缺 Photos／Agent／Keyboard，Widget 仍須原生高清替換。** 未 commit、push、合併、上傳或部署。

## 來源與工作位置

- App 功能盤點基準：main `ebd48f61aa29dda378ac8db689d1abd2d9ed7fc5`。各截圖另依實際 2237／2240／2243 安裝來源記錄，不把截圖來源或本地 public config 當成 Production 驗收。
- 官網獨立 repo 基準：main `193e4ba927ce30b3afa244dd4538755ad02eb238`。
- 本地分支：`codex/taste-website-20261114`；工作目錄 `/Users/luyi/.codex/worktrees/website-taste-20261114/translator/website`。
- 預覽：<http://127.0.0.1:5178/?lang=zh-tw>。既有 React／Vite、多語、路由與預渲染沿用；App 與原始官網 checkout 未由本任務改動。

## 內容與圖片

35 個路徑，包括首頁、10 功能、6 情境、定價、下載、關於、聯盟洽詢、聯絡、Blog 與 7 篇指南、支援及既有法律頁。33 個非法律頁 × 19 語系，加 2 個保留英語原文法律頁，共 629 HTML，另有 404。較早的 610 頁／6 篇文章紀錄已被這版取代。

首頁將菜單與文件分開介紹；每個功能有自己的真實流程。新增文件指南，校正 Helper 自訂指示、Widget 直接朗讀、免費 Voice／Agent 每週額度、鍵盤支援邊界、Mac 相容性與合作狀態。最新點單文字改為保留菜單原文，不保證是店員語言；Mac CTA 改為查看 Mac 下載選項。完整依據見 `copy-accuracy-review-20261114.md`。

App 圖全部接真實截圖 index；缺圖收合，沒有舊圖、AI 圖、英文或跨功能替代。菜單為真實掃描／加料／點單三張；文件為段落主圖與表格／原圖／原文對照三張 Gallery。原生圖 1290×2796，lossless WebP 與原 PNG RGB 一致，未放大或修 UI。Widget 664×1440 明示待換。完整來源與最新數量見 `image-refresh-inventory-20261114.md`。

## 自動與原生瀏覽器驗證

| 檢查 | 實際結果 |
| --- | --- |
| TypeScript、`git diff --check` | 最新文案後通過；其後只改 Gallery CSS 與圖片管線 scope／metadata |
| `check:marketing` | 最新 57 欄文案修正後通過；19 語系結構、路由、本地 v81 方案與 1／10 張掃描限制 |
| client／prerender／SEO | 最新短文案後通過 629 HTML＋404、35 routes、canonical／互相對應 hreflang／sitemap／404 |
| 完整 `npm run build` | 最後執行 exit 1：native image gate 未齊；使用者後續將 scope 縮為繁中 10 張，該 gate 目前仍為 7／10＋5 Gallery、3 缺圖及 Widget 待換。未宣稱整體通過 |
| 官方 taste copy-lint | 最新英文首頁 934 words、菜單 345、文件 340、文件指南 441；均 0 FAIL、0 WARN |
| 圖片來源與 bytes | 目前 12 張均驗證原始／輸出 hash、格式、尺寸、lossless RGB；Gate 的缺圖與低解析度待換仍如實 exit 1 |
| 新 Menu Gallery | 1440／1024／768／390／320px 無橫向溢出、無破圖；手機淺色與桌面深色目視清晰／乾淨四角 |
| 新 Document Gallery | 同 5 寬度無溢出／破圖；桌面 3 欄，平板／手機單欄；1440×900 完整落於 y88–846 |
| Document 主圖 | 390px 淺色原生 IAB 實看，完整圖寬 350px，無橫向溢出；原生畫面與段落內容清楚 |
| 語言選單 | 先前已完成 19 選項、深淺色對比、切換保留路徑、選單關閉及手機 Escape；沒有因本輪只做繁中而回退 bug 修正 |
| Mac CTA 長文 | 範圍縮小前已驗 320px 英／法／德／俄／泰，文字完整、按鈕至少 48px、無溢出；其他語系後續實拍暫緩 |

所有網站互動均用 Codex 原生 IAB/CUA。其他原生瀏覽器既有驗證包括行動選單鍵盤／focus、桌面切換後恢復 scroll、Blog 篩選／內鏈、定價週／月額度、聯絡表單錯誤與郵件草稿、reduced motion。未寄測試郵件或做購買。

畫面與機器可讀證據在 `preview-refresh-20261114/`：`native-menu-gallery-mobile-light.jpg`、`native-menu-gallery-desktop-dark.jpg`、`native-document-gallery-desktop-dark.jpg`、`native-document-primary-mobile-light.jpg`、`native-menu-and-mac-checks.json`、`native-document-gallery-checks.json`。舊 `preview-20261114/` 為歷史設計證據，不能當成目前真實圖片已驗收。

## 商店與 taste 界線

2026-11-14 原生瀏覽器實讀既有 App Store listing：Only for iPhone、Designed for iPhone. Not verified for macOS.，有 View in Mac App Store 按鈕；相容性只明列 iOS 16.0。Mac CTA 連真實商店，下載說明／FAQ／文章保留相容性限制，沒有虛構 DMG、Intel 支援或未驗證的 Mac 操作。售價依 Apple 當地商店，不採 fixture；合作為個別洽詢，聯絡表單開啟郵件草稿。

使用官方 taste-skill 2.5.1，commit `f6b76575f949707b4e3c37cd86cb44b0b98643e8`。依使用者 Typeless 方向與既有 AnyTranslator 品牌檢查文案、真實 UI、間距、解析度、四角與互動。**自動 Browser Gate 未執行，不能標示 GATE PASS**：它另啟 headless Chrome，與使用者原生瀏覽器限制衝突。無瀏覽器 copy-lint 已執行。

沒有 Lighthouse、跨瀏覽器、逐語系母語審校、RTL locale、正式流量、完整 App／聲學／主畫面 Widget 互動、Mac 安裝或實際購買驗收。編譯、來源記錄與 screenshot 不能代替這些證據。

## 資源與續接

依使用者要求，手機留到其他工作完成後再使用。本任務 r9 XCTest session 34010 與 USB proxy session 84005 已停止（exit 130），本任務不占建置鎖；其他工作已接手。沒有停止其他 task 的 build／Simulator。手機 UI／腳本／圖片子代理已交付本輪成果並結束活動 turn，尚未完成的手機工作保存於 ignored `output/native-captures/continuation-20261114-1635.md`。

只沿用既有 prebuilt XCTest runner，沒有重編譯／安裝 App、清使用者資料、改後端／Production 或啟用假資料模式。模擬器僅唯讀盤點，沒有 boot／建立／安裝；目前專案的 PostgreSQL simulator provisioning 明確未配置，不以假 identity 代替。

本地 Vite 與預覽分頁仍供這項未完成工作及使用者 review，按資源清理規則保留；本輪未部署。等其他工作使用完畢後，讀回裝置／安裝版本／新畫面，再以繁中批次 CLI 續拍，不使用過期 seen，也不搶占建置鎖。

繁中鍵盤頁與指南再補 8 欄 iOS 原生聽寫介紹，依當前 main Swift／原生聽寫文件核對；只有文案，沒有 App 功能改動。其他語系待繁中確認後同步。`check:marketing` 通過，原生 IAB 734px 文字完整且無橫向溢出；未重做鍵盤聽寫聲學驗收。

## 本輪離線複核

- 首頁功能舞台改成相關真圖：文字搭 Helper、菜單搭加料選項、文件搭譯後表格；Voice／Agent／Chat 僅使用自己的主圖。缺主圖時仍整組收合。原生 IAB 1440／390 實查無溢出，單圖置中；證據 `preview-refresh-20261114/home-demo-related-images.json` 及 `home-menu-related-native-{desktop,mobile}.jpg`。
- 繁中首頁 eyebrow 明確標示「AI 翻譯與語言學習 App」。照片操作修正「把鏡頭對準文字」，Widget 功能說明與學習指南補上 iOS 17 或更新版本限制。其他語系維持待繁中驗收後同步。
- 5 張 gallery 補上可區分加料／原文點單／譯後表格／英文原圖／完整日期對照的 alt。SSR 與型別檢查通過，27 個圖片檔案 hash 未改，沒有為 alt 重壓縮圖片。
- `menu-768.webp` 檔案實為 768×1665，srcset 768w／1290w 正確；瀏覽器 `naturalWidth≈359` 是 width descriptor 的密度換算，不代表來源檔只有 359px。未放大或修改原生圖片。

## 取鎖後實際續跑：r11

2026-11-14 19:55:31 UTC 已在建置鎖空出時接續啟動既有 prebuilt XCTest runner，未重新編譯或安裝 App。實讀手機仍為 `2.1.4+202610292243`，匹配 `e5c2c2d49758a7fca0885da669148e60668d8832` 的已驗證 Development artifact。該 Preview health 為 `3408651f-c698-49b8-9286-d89cf4cd419c`／config v80／PostgreSQL；不代表新的 Provider 成功或 Production 驗證。

XCTest 在執行 test body 前回報 `Timed out while enabling automation mode.`，exit 65，沒有操作手機或取得新功能圖。Runner 與 USB proxy 均已結束，未占用建置鎖；目前已請使用者確認 iPhone／App 並完成可能出現的 iOS 自動化驗證，收到回覆後再等待其他建置結束、以新 r12 result bundle 續跑。圖片仍維持 7／10 主圖＋5 Gallery，不能標示完成。
