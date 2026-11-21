# 跨 App 翻譯官網實拍

2026-11-21 以 iPhone 實拍。完整畫面同時顯示 Safari 網址列、西班牙文文章標題與段落，以及 AnyTranslator 實際產生的繁體中文子母畫面。19 個官網語系共用此實拍範例，各自顯示本地化標示及替代文字。[網頁原文](https://www.anytranslator.app/blog/read-a-menu?lang=es)

| 檔案 | 尺寸 | 大小 | SHA-256 |
| --- | --- | ---: | --- |
| `output/native-captures/safari-context-20261121/safari-full.png` | 1290 × 2796 | 1,082,574 bytes | `1f321dd7e64dac7baccf68d63718b7617901bc68a76b4dc1c7fe29de83cba209` |
| `public/app-preview/examples/screen-translation-safari.webp` | 1290 × 2796 | 526,220 bytes | `008c80f9b44359534d199f40f7026a4db39ec4fe735b14d2b07c3c52004ab475` |
| `public/app-preview/examples/screen-translation-safari-768.webp` | 768 × 1665 | 371,582 bytes | `e766b72d6f44c415da2d68bea8ae37a3bd6f8a206cd8f13cbd21e44f4d2710b5` |

完整尺寸 WebP 解碼後逐像素與原始 PNG 的 RGB 一致。另一版按比例縮小，兩版都保留所有畫面內容。範例保留 App 實際輸出，內文的介面名稱 `Carta` 在子母畫面譯為「文件」。

TypeScript、行銷頁、視覺素材、Vite 打包、760 頁預渲染與 SEO 檢查通過。19 個 `/features` 靜態頁均含正確圖檔、尺寸、響應式來源與本地化說明。

正式網站部署 `dpl_9SqdwaFfi8tTN5Ta2SdeYPeYuzqx` 已回讀。內建瀏覽器檢查了繁中深色桌面版、主題切換與 390px 德文行動版。Safari 卡保留全畫面比例，相鄰圖片背景延伸到卡片底部。正式包的定價 API 與路由設定經位元組比對一致。Taste 外部瀏覽器檢查因本案使用內建瀏覽器而未執行。 [正式功能頁](https://www.anytranslator.app/features?lang=zh-tw) [桌面驗收](screen-translation-safari-live-20261121.jpg)
