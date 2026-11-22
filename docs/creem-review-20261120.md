# AnyTranslator 官網 Creem 審核查核

2026-11-20 查核。網站公開資訊已逐頁盤點。Creem 商家資料、結帳及 App 權益交付仍需實際驗證，現階段無法確認通過審核。

## 官網公開資訊

- 已逐一掃描本次建置與發布包的 760 個本地化 HTML（40 條路由 × 19 語系）。每頁可被索引，頁尾都有可點擊的 `support@anytranslator.app`，以及正確語系的定價、支援、聯絡、隱私權政策及服務條款入口。信件收發及處理時間仍需實測。
- 已在正式站逐一開啟 19 個定價頁，確認兩種付費方案都有數字及幣別。台灣瀏覽器偵測到台灣商店，預覽另實測台灣、日本與美國商店和週、月、年切換。正式站繁中客服、聯絡、隱私與條款頁皆可開啟。 [瀏覽器檢查紀錄](pricing-qa-20261120.json)
- 聯盟頁邀請創作者洽談，文案沒有承諾佣金或加入資格。推薦模塊的評論來源可追至 App Store，翻譯版本有標示。
- 定價頁的 App Store Connect 價格屬於 Apple 各商店的方案。現有條款與隱私政策描述的是 Apple 付款。開通 Creem 時需核對其方案與結帳金額，並在公開條款及隱私政策正確說明 Creem 付款、個資用途與訂閱管理。
- 正式站使用 2026-11-20 從 ASC 取得的 175 地區價格。已用本機 ASC 認證驗證台灣、美國與日本的 18 筆價格。Vercel 尚無專用 ASC 金鑰，正式 API 回報 `source: "snapshot"`。

## AI 產品審核範圍

- Creem 的 Moderation API 與 Customer Credits 規則針對生成或編輯圖像／影片的功能。現查 App 的照片翻譯與螢幕翻譯是辨識文字、翻譯並呈現譯文，AI 助手可理解上傳圖片，語音功能處理音訊與文字。這些產品功能的審核說明可直接以實際流程和畫面為證。若未來新增生成式圖像或影片功能，應先向 Creem 確認分類。 [AI Wrapper Compliance](https://docs.creem.io/merchant-of-record/account-reviews/ai-wrapper-compliance) · [Gen AI Requirements](https://docs.creem.io/merchant-of-record/account-reviews/gen-ai-requirements)
- Creem 複審指南將缺少禁止 NSFW 與有害生成的使用規範列為可能需補正的項目。正式站條款第六節已補上 19 語系的禁止色情、露骨性內容與有害生成規範，並保留合法翻譯用途。AI 助手及自訂課程的拒絕行為仍需實測。 [Re-Review Guide](https://docs.creem.io/merchant-of-record/account-reviews/re-review-guide)

## Creem 商家與付款驗證

1. **商家資料與支援。** 核對 Creem 的商家名稱、產品及網站、稅籍、所有權或身分驗證要求。官網、商家設定、Creem 收據及使用者帳務介面的支援信箱應一致，並依商家後台實際要求確認回覆能力。 [Account Reviews](https://docs.creem.io/merchant-of-record/account-reviews/account-reviews)
2. **方案與結帳。** 核對實際 Creem 商品的金額、幣別、計費週期、續訂及稅費資訊。以 Test Mode 建立一筆免付費測試訂單，驗證網頁結帳、收據與 App 內實際取得 Pro。 [Test Mode](https://docs.creem.io/getting-started/test-mode) · [Buyer Terms](https://www.creem.io/buyer-terms)
3. **權益交付。** 目前 App／API 主線未查到 Creem 權益整合。需驗證付款與 App 權益身分的連結方式，以及 Webhook 驗簽、重送去重、不同事件順序、跨裝置辨識、續訂、逾期與錯誤復原。 [Webhooks](https://docs.creem.io/code/webhooks)
4. **取消與退款。** 確認 Creem 訂戶可從產品直達取消入口，並實測取消續訂、到期和退款後的權益狀態。回收 Creem 權益時需保留同一使用者仍有效的其他商店權益。退款流程與公開說明須符合 Creem 買家條款及適用規範。 [Customer Portal](https://docs.creem.io/features/customer-portal) · [Buyer Terms](https://www.creem.io/buyer-terms)

商家審核狀態於下方 2026-11-21 更新。`Changes requested` 可依實際通知補件，`Rejected` 依官方說明屬於該商店的最終決定。 [Re-Review Guide](https://docs.creem.io/merchant-of-record/account-reviews/re-review-guide) · [Rejected Accounts](https://docs.creem.io/merchant-of-record/account-reviews/rejected-accounts)

## 2026-11-21 付款與交付補查

正式官網已更新服務條款的最後更新日期。透過正式網域逐一確認 19 語系日期及 SEO metadata，以及 175 個地區的 App Store 價格與目前 ASC 快照一致。共用帳號與 Creem 付款仍留在隔離預覽。Vercel 部署 `dpl_6yn1zzQHwwhBY47SmAQ5WEoq2ZPb`。

- 商家資料和客服信箱已儲存。Creem 商家審核表單可開啟，尚未勾選聲明或提交。Test Mode 的 Standard 月方案為 US$9.99。一次性 100% 折扣的測試訂單回讀為已付款，訂閱由啟用轉為期末取消。另一筆由共用帳號建立的測試訂單也已在 Creem 回讀為已付款。
- 測試商品曾因後台模式標示誤建於未啟用的正式商品目錄。已查零成交並封存該商品。限該商品使用的一次性折扣未使用。未收取款項。
- 共用帳號、付款對帳與 Web 文字額度已實作在隔離分支。實際 Test Mode 購買回讀加本機合成簽章 webhook 已驗證 Web 權益、事件去重及產生測試客戶入口。350 項後端測試及 14 項 Flutter 介面語系測試通過。遷移 0007–0009 在本機 PostgreSQL 套用兩次，12 張新表、runtime 角色的讀寫與舊安裝的商店鏈保留均通過。隔離 HTTPS 預覽已用本機測試伺服器驗證同源轉送。Creem 平台的 webhook 投遞與 iPhone 開通尚未完成。
- Dev Hyperdrive `5e54dcbd404d48c98eff68457793ad8b` 接到共用 `byrupass-prod` RDS 執行個體內的獨立 `anytranslator_test`。經 owner 指定的 `pass` 主機確認管理連線與 TLS，只備份及遷移此 Dev 資料庫。備份 `anytranslator_test-before-creem-20261121T083323Z-sc0o_hso.dump` 可完整讀取。0007–0009 已在單一交易套用，回讀 12 張表、12 組外鍵、48 項表權限及 sequence 權限。
- 隔離 Worker Preview `345f2a88-22a1-4b5d-8bd4-fe9b6aeeee84` 已回讀。Dev 真實 PostgreSQL 通過軟體測試 passkey 註冊、登入狀態、刪除及工作階段失效，並取得實際英譯繁中結果和用量計數。調整最初 502 的上游請求後，Creem Test 結帳重試成功，重送回同一個託管連結。已從 Creem Test API 核對商品與結帳資料，此筆尚未付款。Shared Dev 與 Production Worker 版本逐一回讀。
- Creem Test 金鑰的 webhook 管理端點回 403，已直接從已登入的商家後台建立 12 個事件的 Test Mode webhook，並在 Preview `aa0e4f4a-534e-4f1b-9a78-8b4325aa46c3` 啟用 Creem 簽章驗證。實際 Test Mode 訂單付款後，Creem 的 checkout.completed 和 subscription.paid 投遞均成功，Web 自動開通後完成英譯繁中，付費日額度 100 已實際扣 1 次。 [投遞畫面](creem-webhook-delivery-20261121.jpg) [Creem Webhooks](https://docs.creem.io/code/webhooks)
- 買家從 AnyTranslator 的 Creem Customer Portal 實測立即取消，權益同步收回。另用一筆獨立的正金額 sandbox 訂單測試全額退款，Creem 交易變為 refunded，訂閱仍標為 active，AnyTranslator 正確移除付費權益。兩筆均未真實扣款。正式帳號入口、iPhone 開通、後續續訂及送審尚未驗證。
- 獨立 Vercel HTTPS 預覽 `dpl_G2UM5GScvzp6atCt2ZHYf9RbEeYz` 已受 Vercel 登入保護。Worker `23895a9b-13b3-418c-87db-cd108043d727` 已指向其帳號與測試付款返回頁。HTTPS session、正確 passkey RP 與返回頁已回讀。內建瀏覽器的系統 passkey 驗證逾時，實機仍需驗收。已啟動 Xcode Cloud Development Profile `671f67a0-37f1-4d42-bc34-327a914ca789`，來源 `a7e6c67ae`。 [帳號預覽畫面](creem-hosted-preview-20261121.jpg)
- 送審前需證明審核者能從自有網域取得實際販售的權益，並驗收真實 webhook、續訂、取消、退款、付費翻譯和實機的既有商店權益。當前測試權益涵蓋 Web 與 App 的文字翻譯。正式結帳前要顯示 Creem 方案、價格、續訂週期、收款身分及買家條款，同步更新公開帳號、個資與付款說明。 [Creem 審核](https://docs.creem.io/merchant-of-record/account-reviews/account-reviews) [商家條款](https://www.creem.io/terms)
- 正式 iOS 帳號登入須符合 Apple 的第一方登入指引，帳號刪除須能從 App 發起，並驗證有訂閱時的刪除選項。網站販售的同等功能須有 App 內購買選項，App 內導往外部購買依商店地區規則處理。 [Apple App Review](https://developer.apple.com/app-store/review/guidelines/) [Apple 帳號刪除](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion)

## 2026-11-21 網頁訂閱入口與實機查核

- 網頁定價預覽以 US$9.99 月繳展示目前可交付的文字翻譯測試商品，每日 100 次。訂閱按鈕保留所選方案，通行密鑰登入後可進入 Creem 託管結帳。週繳、年繳與語音方案標示暫未開放。首頁、功能、使用案例與 Blog 的導覽和收尾引導至定價。免費方案和下載入口可試用 App。
- 19 語系與三個計費週期均檢查過。內建瀏覽器實測選方案、切換週期、跳至帳號頁及 390px 版面。受 Vercel 保護的網頁訂閱預覽 `dpl_6EwBQ7LunaBfeYVW5MaYsEAkM5Qq` 同源代理與沙盒 Worker `0b4060b0-de6d-4330-bb21-df4b9ce2b73d` 回讀 200。以軟體通行密鑰註冊的 QA 帳號透過實際 Vercel API 重送結帳，取得同一個 Creem Test 連結。 [受保護的定價預覽](https://translate-seamlessly-like-notion-6feqfyylg-lustan3216s-projects.vercel.app/pricing?lang=zh-tw)
- Profile `2.2.0+202610292255` 以原地安裝方式裝上 Lu 15，34 組應交付 dSYM 全數成功上傳，Flutter 供應商符號有一組無法取得。回讀安裝和執行版本，原 Apple Voice Monthly 仍顯示。Account 首次載入失敗追到安裝 ID 的格式判斷，已調整 Preview 保留 Gateway 簽名時的原始 ID，並以大寫 ID 驗證登入前查詢、配對、查詢權益與解除連結。最新實機分支 Worker `279101e9-c49a-44aa-9af7-c81d715fbd34` 另限制尚未開始的訂閱權益。iPhone 自動點按在平躺姿勢終止，手機與鎖已交接給影片補錄，修正後實機配對仍待驗證。
- 新一筆真實沙盒卡結帳返回既有 HTTPS 帳號頁，測試訂單開通後完成英譯繁中。正式收款、Creem 續訂及商家送審待完成。

## 2026-11-21 正式條款與 Live 候選

- 正式部署 `dpl_GKA8pq9oPgfnyi1svEdr8QzDHK5r` 已更新 19 語系的服務條款及隱私政策，各 19 頁在正式網域逐一回讀。繁中候選與正式德文 390px 版面檢查通過。發布包差異是 38 個法律頁及其前端資產，ASC API、路由與圖檔比對一致。 [服務條款](https://www.anytranslator.app/terms-of-service?lang=zh-tw#web-subscriptions) [隱私政策](https://www.anytranslator.app/privacy-policy?lang=zh-tw#web-subscription-data)
- 正式候選有兩份獨立網站發布包。行銷站在開啟 `VITE_SHARED_ACCOUNT_LIVE=1` 時只轉送公開報價，照 Creem 商品顯示金額、幣別、週期、含稅方式與額度。沒有可用報價時沿用 Apple 定價。專用帳號站以 `node scripts/prepare-vercel-account-preview.mjs --live <marketing-build-output>` 打包，採同源 Session、Passkey、結帳和客戶入口，隔離行銷站的第三方腳本。兩份候選均已本機打包，代理測試驗證 Host、方法、來源、cookie、Live/Test 金鑰及 API 入口隔離。
- Live Worker 支援以實際 Creem 商品重驗報價，獨立驗簽與收取 Live webhook，對帳付款、續訂、取消及退款。Live 新購開關可獨立停用，讓已購使用者繼續管理帳務。新遷移 0010 與既有 0007–0009 應依正式遷移流程審核、備份與查驗狀態。模擬 Creem 及本機資料庫驗證不代表正式交易。
- 全套後端檢查 1,416 通過、5 略過，最後 77 項相關回歸全數通過。新版已上傳到隔離 Test Worker `cfc080ef-1190-4466-8ecd-0e5ced2a2ded`，回讀原沙盒訂閱、管理入口與實際英譯繁中結果。正式 Worker 仍回讀 `1f57cd73-cbaa-4c73-aee2-04ff70e5a705`，公開 API 無 Creem 報價。
- Live 候選範圍為月繳網頁文字翻譯。iPhone 配對、付款後開通與 Apple 既有訂閱相容性仍需實機確認。

## 2026-11-21 正式站部署與驗收

- 正式行銷站 `dpl_58W84EzHaeNjrLGxS3bW35fN9iM8`、帳號站 `dpl_GoMJ9WSacziwKHcwKfTvtSAUcBPG` 均從 Vercel 回讀為 Ready。`account.anytranslator.app` 已完成 DNS 委派並可用 HTTPS 連線。正式 HTTPS 註冊、登出、登入、查詢帳務、刪除與撤銷工作階段皆以測試帳號驗證。 [帳號站](https://account.anytranslator.app/) [定價](https://www.anytranslator.app/pricing?lang=zh-tw)
- 正式資料庫完成備份與還原檔讀取查驗，已套用 0007、0009、0010。新增的 Live Worker `anytranslator-creem-account` 版本 `ac494ada-d8ae-4a3e-90de-53070d8fa558` 處理帳號與 Creem webhook。既有 App Worker 的 Cloudflare 與 AWS 入口皆回讀 HTTP 200、版本 `1f57cd73-cbaa-4c73-aee2-04ff70e5a705`。
- Creem Live 月繳商品 `prod_3TzHEiapJH9Wy1o5zltuft` 為 US$9.99、每日 100 次網頁文字翻譯，結帳時計稅。Live webhook `wh_55Ae5ZEPy9Uj2BL1VG986s` 已設定 12 類事件。未簽名請求回 401。Creem 後台產生且簽名的測試事件回 HTTP 200，正式權益未發放。
- 此次查驗時，Live 商品讀取由 Creem 拒絕為 HTTP 401 `Invalid API Key`，正式網頁翻譯仍待專用服務憑證。Live 結帳與翻譯開關保持關閉。行銷站與帳號站各自的報價 API 均回 200 `offer:null`，跨來源結帳請求回 403。真實收款、付費翻譯與 App 開通待驗證。Creem 申請待命，尚未送出。
- 已將正式 App Store 報價 API 的 175 個地區逐一與 ASC 快照對照，全部相符。造訪地區偵測為 TW，另確認 JP、US、DE 的六個週／月／年價格與幣別。正式繁中頁預設台灣並顯示 TWD，實際切換到德國和週／年繳後顯示 EUR 及對應價格。Vercel 正式環境目前無專用 ASC 查價憑證，API 回報 `source:snapshot`。ASC 已排程 175 個地區、兩種週繳方案的調價，生效時間分布在 2026-11-21 15:00 至 11-22 04:00 UTC，新週價是月繳的 49.44–50.31%。 [台灣商店報價](https://www.anytranslator.app/api/asc-prices?region=TW)
- 本機 ASC 讀取發現調價時 Apple 可能先將舊週價標記為保留，並在新價格日期到達前暫無公開週價。候選 API 已驗證此時沿用完整快照，六項齊全才切換至 Live 來源。候選更新尚未發布。
- Creem 後台的商品描述草稿已儲存並回讀。草稿與現有 Live 商品同為 US$9.99 月繳、每日 100 次網頁文字翻譯，列明正式帳號網域、交付方式、取消入口與客服。後台仍要求商家資料與身分驗證，申請未送出。 [Creem 商家審核](https://docs.creem.io/merchant-of-record/account-reviews/account-reviews)
- App 和主 Worker 已備妥共用帳號的本機候選，正式功能開關預設關閉。Flutter 11 項測試覆蓋正式關閉、明確啟用、環境隔離與已簽章路徑。後端相關測試 144 項通過，涵蓋配對、Live／Test 權益隔離、額度與原商店擁有權。候選僅涵蓋原生文字翻譯，尚未部署或以正式 App 實機驗收。現有 Live 商品維持網頁文字翻譯範圍。

## 2026-11-21 官網直購與下載後配對

- 定價頁候選已將網頁訂閱放在 App Store 方案比較上方。Creem 回傳有效報價時，入口導向同一網頁帳號及 Creem 結帳。暫無報價時顯示結帳尚未開放，保留帳號入口。App Store 比較卡保留免費下載及各地區價格，付費卡不再引導 Apple 付款。
- 已實測 1280px 桌面、390px 淺色與深色版，以及切換德國週繳。地區選單箭頭與右緣距離 16px，文字保留 44px 內距，沒有水平溢出。19 語系、760 份頁面與圖片驗證通過。比對 762 份輸出 HTML，排除打包檔名後，只有 19 份定價 HTML 不同。ASC 查價 API 與既有公開圖片的內容保持原正式版。
- 定價預建發布包保存在 `output/creem-direct-subscribe-20261121/.vercel/output`。Vercel 原始上傳與官方壓縮上傳均遇到 `api-upload-free` 每日上傳額度，行銷站仍使用 `dpl_58W84EzHaeNjrLGxS3bW35fN9iM8`。
- 帳號站已升級到 `dpl_6jck6vRoVGfGYzhxXLp9KuqsU1Li`。已回讀繁中付款返回頁、登入工作階段和空報價，跨來源結帳持續拒絕。新返回頁等候 webhook 確認已付款權益。正式 App 下載與配對說明待相容 App、伺服器配對能力及合格方案三項皆就緒才顯示。Live 結帳及 App 配對仍未公開啟用，Creem 申請維持草稿。
- RevenueCat 可透過 REST v2 授予與撤銷獨立 Creem 權益。此同步方式會留下授予權益紀錄，Creem 仍保管收款與續訂資料。現行 App 依既有商店訂閱判定 Pro，同步到 RevenueCat 本身不會開通舊版。 [RevenueCat 支付整合](https://www.revenuecat.com/docs/web/payment-integrations) · [權益 API](https://www.revenuecat.com/docs/api-v2/customer)

## 2026-11-21 正式定價入口

- 已將驗證過的定價發布包 `dpl_4Fpb7wF7qVK5cG4cUy5avCgBALQ8` 掛到 `www.anytranslator.app` 與主網域。19 個語系的發布包皆有網頁訂閱區。正式繁中頁已用內建瀏覽器核對，標準版與語音版保留比較和地區價格，免費版保留 App Store 下載。台灣、美國和德國的六個 ASC 價格與上一個發布版本相同。
- 正式定價可進入帳號頁並顯示通行密鑰登入。行銷站和帳號站的 Creem 報價目前均為空，定價頁顯示「暫未開放網頁結帳」。Creem 收款開關和申請狀態維持既定邊界。 [正式定價](https://www.anytranslator.app/pricing?lang=zh-tw) · [帳號頁](https://account.anytranslator.app/account?lang=zh-tw)
