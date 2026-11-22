# 官網真實圖片更新 — 2026-11-14

> **歷史紀錄（2026-11-14）**：以下舊功能／頁面／圖片數量、Voice Agent 流程及圖片驗證證據只對當時來源成立，不代表目前 main `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487` 的功能、畫面或新版截圖驗收。
> 最新本地繁中狀態以[更新總覽](main-website-update-20261116.md)、[main 功能盤點](main-feature-inventory-20261116.md)與[新版截圖計畫](main-screenshot-plan-20261116.md)為準；本文保留供追溯。


本輪範圍：依使用者最新指示，**先驗收繁體中文 10 個功能**；其他 18 語系重拍延後至使用者確認繁中後。所有修改只在本地，未 commit、push、合併或部署。

## 當前真實圖片

Active set：`20261114-zh-tw-review-r9-document2243`；範圍 `繁中本地 review`、`requiredLocales: ["zh-tw"]`；更新時間 `2026-11-14T16:32:23.456Z`。

**7／10 張主圖＋5 張 Gallery，共 12 張** 通過來源記錄、hash、尺寸與 lossless RGB 檢查。仍缺 Photos、Agent、Keyboard 3 張主圖；Widget 尚為 664×1440 Mirroring，必須換原生高清。Voice 尚為模式設定，應補正常真實對話字幕主圖。

| 繁中功能 | 原圖尺寸 | 實際版本 | 狀態 |
| --- | --- | --- | --- |
| text | 1290×2796 | 2.1.4+202610292240 | 已核對真實內容 |
| helper | 1290×2796 | 2.1.4+202610292237 | 可用；系統返回標記可再重拍 |
| widget | 664×1440 | 2.1.4+202610292237 | App 指南；原生高清待換 |
| voice | 1290×2796 | 2.1.4+202610292240 | 模式設定；真實字幕主圖待補 |
| chat | 1290×2796 | 2.1.4+202610292240 | 可用；示範重複內容可再整理構圖 |
| menu | 1290×2796 | 2.1.4+202610292243 | 已核對真實內容 |
| document | 1290×2796 | 2.1.4+202610292243 | 已核對真實內容 |

- Menu：正常 Provider 掃描結果、加料選項、原文點單三張真圖。燕麥奶 +0.40、2 份、5.80 合計與公開菜單相符。含 noisette 錯譯的舊候選退出 active index，原始 QA 證據保留，沒有後製修字。
- Document：正常掃描公開 NPS 文件的段落主圖，另有表格、原圖、點日期表頭看完整原文三張 Gallery。15 個時間與原圖一致。表格結果的長日期結尾被 App 截斷，因此以段落作主圖，對照圖展示正常核對方式，沒有假裝表頭完整。
- Text／Chat／Helper：已實讀畫面，未見私人資訊、錯誤／loading 或可確認的語意錯誤。Voice 設定圖與 Widget 指南不代表聲學或主畫面互動驗收。

## 真實與解析度

使用正常 App 操作與 Provider 結果，再由 XCTest 擷取完整 iPhone 螢幕。原始 PNG 保留不變；不用 AI 圖、seed／golden／replay，不重繪文字、拼接或遮蓋私人內容。Photos 不借用 Document，缺圖版位收合，不回退其他語系或舊圖。

公開圖採 VP8L lossless WebP。1290×2796 原圖保留原尺寸，decoded RGB 與原始 PNG 完全一致；不放大。768px responsive 版只有真的節省 bytes 才發布。CSS 貼合手機顯示邊緣收乾淨四角，完整原圖未裁切功能內容；Mac 沒有桌面實拍，不用手機 UI 冒充。

App 功能文案基準為 main `ebd48f61aa29dda378ac8db689d1abd2d9ed7fc5`；截圖逐張另記 2237／2240／2243 的真實安裝來源。2243 source 為 `e5c2c2d49758a7fca0885da669148e60668d8832` 的 Development 產物，沒有互相改標。

## 驗證與清理

- Menu 圖組與 Document 圖組均以 Codex 原生 IAB 檢查 1440／1024／768／390／320px，無橫向溢出或破圖。手機淺色、桌面深色已目視檢查清晰度與四角。
- Menu 在 1440×900 以 340px 圖寬完整顯示於 y88–889；Document 三張圖於桌面三欄、平板與手機單欄，避免孤排或過小圖框。
- 圖片 gate 按最新授權要求繁中 10 張主圖全部齊備、無低解析度待換；Gallery 不補缺項。其他 18 locale 明示 deferred，不宣稱整個 190 張完成，也不代用英文。
- 已移除本次未引用的 9 個 public 舊 set、55 張衍生圖，釋放 15,689,278 bytes。只保留 active set＋manifest，約 4.34 MiB。316 筆 ignored 原始／QA 檔共 176,797,539 bytes 完全保留，active index／manifest 未因清理改動。
- 清理證據：`output/native-captures/fresh/final-local-review-cleanup.safe.json`。處理程序：`native-capture-input-20261114.md`。

## 裝置後續

依使用者「手機最後再用，先釋放建置鎖」的要求，r9 runner 與 USB proxy 均已停止（exit 130），目前不占本任務建置鎖。其他工作已接手；等其他工作用完後才續拍。沒有重編譯／安裝 App、清歷史、改後端／Production、帳號、配對或安全設定。公開素材正常存入相簿時，曾接受該流程所需的 add-only Photos 提示。

最後已確認手機畫面為照片「即時」模式、英文→繁中，未選圖、未送新 Provider；沒有錄音／TTS／廣播。續接在 ignored `output/native-captures/continuation-20261114-1635.md`。

本地預覽維持 <http://127.0.0.1:5178/?lang=zh-tw>。圖片仍未完整，不宣稱完整 build 通過。
