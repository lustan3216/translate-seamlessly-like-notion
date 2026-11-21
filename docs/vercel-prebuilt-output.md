# Vercel prebuilt 發布包

先由發布 owner 完成最新來源的完整 strict build，再執行：

```sh
node scripts/prepare-vercel-output.mjs
```

腳本只在本機讀取 `dist`、目前兩個圖片 registry、`public` 與 `vercel.json`，建立 `output/vercel-release/.vercel/output/static`。`config.json` 僅包含 `{ version: 3, routes: vercel.json.routes }`，保留現有語言路由、redirect、filesystem 與 404 行為。正常 HTML、JS、CSS、SEO JSON、圖片及其他靜態檔沿用 dist 原始位元組。

`app-preview/native/` 僅保留 `src/data/native-product-screens.json` 的實際 `src`、`srcSet` 與 gallery 圖片。`app-preview/localized-ui/` 僅保留 active `src/data/localized-ui-screens.json` 圖片，並要求它們對應到仍選用的 native source。原 withheld `chat.webp`、`screen-translation.webp` 及其 responsive 檔不可成為 active native 選用。其餘兩目錄的歷史圖、未 adopted 圖及 manifest 不進發布包。

未再使用的 `app-preview/product/`、`app-preview/screens/`、`app-preview/social/` 三個舊圖目錄整體排除，保留目前 `app-preview/social-v2/`。封裝前先掃描 dist 的 HTML／JS／CSS（包含跳脫斜線寫法）；任何內容仍引用三個舊目錄時立即停止，保留先前 artifact，不會盲目移除仍使用的圖。

發布包亦排除建置／圖片 provenance metadata（`manifest.json`、`prerender-manifest.json`、`captures.json`、proof／review／adoptable／safe JSON）、raw／proof／private 目錄、`.env`、`.secrets` 與 source maps。這些檔案仍保留在原 public、dist 及私人存檔；腳本只會替換自己的 `.vercel/output`。不會產生 project ID、token、登入、上傳或連接 production。

封裝會驗證所有 active 圖片在 dist 存在，且和目前 public 的 SHA-256 相同；缺圖或舊 build 會失敗。每份複製檔都再比對 dist 與輸出 SHA-256，最後檢查輸出檔案集合、圖片 allowlist、私有檔排除與 routes 完全一致。拒絕路徑外逃和來源／輸出路徑中的 symlink。

定價 API 封裝為 Node.js Function `/api/asc-prices`。不帶地區參數時，回傳 Vercel 偵測的訪客國家；帶 `?region=TW` 時，回傳該 App Store 地區的週、月、年價格、資料時間及來源。沒有 ASC 憑證或 Apple 暫時不可用時，使用 `src/data/asc-prices.json`，以 `node scripts/sync-asc-prices.mjs` 更新這份公開快照並重新建置。

快照可包含已在 ASC 回讀確認的 `scheduled` 新價格。API 與前端在生效時間前繼續顯示舊價格，之後按地區套用排程中的方案價格。同步腳本會等所有排程時間過後才允許重抓快照，因為 Apple 在調價排程建立時就會將舊價標為保留，過早重抓會漏掉這些週費。

2026-11-22 ASC 排程已回讀 175 地區的兩個週繳方案。349 筆調價均保留既有訂戶價格，智利標準週費已是最接近月費一半的級距。四個月繳及年繳方案的 ASC 價格與排程逐筆比對一致。官網使用 Apple 官方計算器的 174 地區生效時刻。奈及利亞未列在表內，官網安排在表中最晚的 04:00 UTC 更新。 [Apple 官方地區生效時間](https://developer.apple.com/help/app-store-connect/reference/pricing-and-availability/app-store-pricing-and-availability-start-times-by-country-or-region)

已驗證 175 地區 API 在生效時刻前後的回應，並在待上線站以模擬時間檢查台灣週價顯示。正式部署 `dpl_Fh9jehCu6mPZdaKRMHu6nQE9xSC7` 已掛上官網。正式頁和 API 在生效前仍回報台灣目前的 NT$120 與 NT$220。Apple 實際付款畫面待排程生效後才能驗證。

自動查價使用 Vercel 伺服器環境變數 `ASC_PRICE_KEY_ID`、`ASC_PRICE_PRIVATE_KEY`。Team Key 另需 `ASC_PRICE_ISSUER_ID`，Individual Key 則留空。啟用前以僅授權 AnyTranslator 的金鑰驗證訂閱價格讀取權限，再從已部署的 API 確認 `source: "app-store-connect"`。正式網站的 ASC 回應以五分鐘快取服務訪客。

不依賴目前 dist 的小型自檢：

```sh
node scripts/prepare-vercel-output.mjs --self-test
```

自檢建立並清除專用暫存 fixture，涵蓋 active native／responsive／gallery／localized 與 social-v2 保留、三個舊目錄及歷史／withheld 圖排除、HTML／JS／CSS 舊圖引用拒絕且保留先前 artifact、私有 metadata 排除、原始檔保留、hash 不符、路徑外逃及 symlink 拒絕。自檢通過只證明封裝邏輯，不代表最新官網完成 build、視覺驗收或部署。

Vercel 官方規格：[Build Output API configuration](https://vercel.com/docs/build-output-api/configuration) 與 [static files](https://vercel.com/docs/build-output-api/primitives#static-files)。`routes` 與原 `vercel.json` 採相同語法；發布操作由 owner 另外執行。
