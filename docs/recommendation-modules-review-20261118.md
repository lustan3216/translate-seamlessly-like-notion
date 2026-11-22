# 推薦與 AI 詢問區塊

本地繁中草稿；未部署、未 commit。

## 真實評價來源

- Apple 官方台灣 App Store RSS：<https://itunes.apple.com/tw/rss/customerreviews/page=1/id=6738693321/sortby=mostrecent/json>
- App ID：6738693321。2026-11-18 讀取，完整回應保存在 `output/recommendation-module-20261118/app-store-tw-reviews.json`。
- 展示資料：`src/data/customer-reviews.json`。四則皆逐字保留原評語、公開暱稱與實際個別評分；沒有虛構照片、角色、姓名或整體評分。
- 評論 ID：14792569759、14689800454、14634594658、14634322888。日期範圍 2026-10-06 至 2026-11-14，App 版本 2.0.11 至 2.1.4；評論是使用者當時的經驗，未改寫成新版 2.2 功能驗證。
- 排除舊版「完全免費」及其他與現有付費模式不符的評論。未將個別感受改寫為全體準確率、保證或客觀效能。

## 元件與設計

- `CustomerRecommendations`：四張靜態卡，桌機四欄、中寬兩欄、手機一欄；每卡短評、真實暱稱、個別 5/5 評分及 App Store 來源連結。無自動輪播、無假頭像。
- `AskAiPanel`：使用者授權的大圓角柔和攝影背景、三個白色膠囊連結、底部淡化大字品牌。背景預定為主代理提供的 `/app-preview/backgrounds/shore.webp`。
- 共用既有字體、`--mk-*` 色彩、Hugeicons、44px 觸控區、可見 focus 與 reduced-motion 規則。兩個元件僅繁中渲染，符合其他語言延後要求。
- AI 連結預填同一中立評估問題，要求先詢問情境、比較適用與不適用處、標明無法確認資料及來源；不宣稱 ChatGPT、Claude 或 Perplexity 推薦本產品。外連含 `noopener noreferrer`。
- 為避免未核實的品牌圖示，AI 連結使用現有 Hugeicon，沒有畫仿品牌商標。

## 驗證

- `npx tsc --noEmit -p tsconfig.app.json`：通過。
- 四則 quote/name/date/rating 逐一與已保存 Apple RSS 做 assertion：通過。
- 元件繁中 guard、外連 safeguards、無隨機假資料及定時輪播：靜態 assertion 通過。
- 本代理沒有修改 `MarketingPages.tsx`；由主代理匯入並選擇插入首頁及其他適用位置。
- 待主代理整合後以 Codex 原生瀏覽器確認桌機／手機、深淺模式、背景裁切，以及三家 AI 的外部登入／預填行為。這裡沒有宣稱外部服務預填已實際驗收。
