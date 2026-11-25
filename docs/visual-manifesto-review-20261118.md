# 繁中官網：宣言、抽象背景與推薦模塊

本地工作目錄：`/Users/luyi/.codex/worktrees/website-taste-20261114/translator/website`。維持本地預覽，不部署、不 commit、不 push。

## 已完成的公開內容

- 首頁主標改為「世界很大。別讓語言擋路。」；分類小標仍說明是 AI 翻譯與語言學習 App。
- 新增 `/manifesto?lang=zh-tw`，主標「語言不同，人生不該變小。」。導覽、手機選單、頁尾、關於頁、路由、canonical、sitemap 與本地靜態輸出已接好。這是繁中限定路由，其他語系暫不新增。
- 宣言從超市買錯、櫃台不敢追問、課堂收回問題、租屋與學校文件寫起，再接到菜單、照片、文件、表格、語音、語氣與 AI 助手。以品牌使命描述小語種與在地表達，不編造創辦人經歷或全語言精度保證。
- 新增 4 則 Apple 官方 RSS 的真實台灣 App Store 評價。原文、暱稱、個別分數與來源保留；沒有假頭像與假推薦人。
- 首頁及定價頁加入柔和背景、淡色品牌大字與詢問 ChatGPT／Claude／Perplexity 的外連。問題中只有公開產品網址與中立評估需求；未實際送出 AI 對話，外部站是否預填仍未驗證。
- 自然 AI 語音、語調、跟讀與口音熟悉的繁中文案涵蓋首頁、文字、語音、Widget、AI 助手與文章。實際 source/model 與 fallback 邊界見 `voice-copy-evidence-20261118.md`。沒有宣稱原生 fallback 已全面移除，也沒有新增假音檔播放按鈕。
- 語氣文案以 App 2.2.0 的 `f4ce7f6b7` 為準：自動、禮貌、幽默、書信、朋友、精簡，共六項。較早的實機截圖仍依原始來源 `7716d40b` 記錄。
- 移除 98.3% 公開區塊及頁尾素材出處字。含需署名素材的舊 Chat／影片畫面不再公開採用，改用既有真實場景／設定截圖；原圖與來源紀錄保持不動。

## 背景生成與自行比對

使用 built-in `image_gen`，沒有 CLI／API fallback。最終採用：

`public/app-preview/backgrounds/abstract-mist-v3.webp`（1536 × 1024，31,322 bytes）。原 PNG、精確來源及 hash、最後 prompt 均保存在 `output/abstract-background-20261118/`。

1. 首輪實景攝影不符合使用者後續澄清，已移出 public，未再採用。
2. v1 水彩／紙張層次不符合參考，已撤下。
3. v2 灰藍與珊瑚色方向接近，但亮白細絲、大 S 及玻璃／水光感太強，未採用。
4. 先實看使用者的 Typeless 右側色彩參考，再由主代理與獨立審核代理實看 v2、v3。v3 改成灰藍、集中暖橘、霧面與不規則羽化邊緣；比參考稍平滑，適合作為真實 App 截圖底色，不聲稱完全相同。文件／表格另用同圖灰階呈現。

背景生成與 App UI 處理分開：實拍原圖保持不動；Widget 與鍵盤另有經逐張比對的繁中 UI 衍生圖，替換指定介面標籤；Widget 另依使用者要求拉正中央卡片。來源、生成尺寸、hash 與限制另存於本地 `output/imagegen-localization-220/`；網站以 `gpt-image-ui-edit` 標示來源，未將衍生圖當作原生實拍證據。

## 繁中圖片與底部白邊

- 鍵盤生成圖實際是 759 × 2072，底部新增了 422px 白畫布。網站依實看確認的完整內容界線，顯示上方 759 × 1650；保留灰色鍵盤面、地球、麥克風與圓角。原生成圖與原生 PNG 均未改寫。
- 以 Codex 原生 IAB 在 1440 × 900、390 × 844 檢查鍵盤功能頁底部，並檢查首頁鍵盤展示；下方白邊已消失，沒有切傷底列或四角。
- Widget 為 852 × 1846，桌機／手機功能頁與首頁展示均實看確認，沒有多餘底部畫布或溢出。兩張衍生圖在最高 360 CSS px 展示時都有超過 2x 的原生像素寬度；細字仍帶少量生成軟化，不宣稱與原圖像素一致。
- 使用者指出 Widget 斜面令文字變形後，另用 built-in GPT Image 生成拉正 v3：中央卡片上下邊、文字、分隔線和按鈕列水平，左右邊平行。主代理與獨立代理比對中文字、拼音、英文例句、完整用法段和操作後採用 `widget-straight.webp`，852 × 1846、lossless、不放大、crop 0。既有實拍與前一版生成檔保留。1024、1440、390 原生 IAB 確認圖片載入、清晰度、四角與手機無溢出；證據為 `widget-straight-*.jpg`，本地頁已開給使用者，未部署。
- `tsc`、`check-localized-ui-images.mjs` 與 `check-visual-refresh.mjs` 通過；原生實拍 gate 仍獨立檢查。
- 證據：`docs/main-preview-20261118/keyboard-localized-bottom-desktop.jpg`、`keyboard-localized-bottom-mobile.jpg`、`widget-localized-desktop.jpg`、`widget-localized-bottom-mobile.jpg`，以及 `home-*-localized-*.jpg`。
- Screen setup 的第一張本地化候選仍有英文殘字及多餘畫布，未採用。另以 built-in GPT Image 定點修正一次，實看發現兩項問題仍在，該候選同樣拒絕，沒有接入網站；原生 setup 圖持續保留。

## 驗證與證據

- `tsc --noEmit -p tsconfig.app.json` 通過。
- `npm run check:marketing` 通過，包含 38 條繁中 route SSR 及其餘語系既有 baseline。
- 完整 build 的編譯、634 頁 prerender、SEO／hreflang／canonical／sitemap／404 與品牌來源檢查通過；當時整體 exit 1，原因是最後 `screen-text` 實拍缺失。不能稱整體 build 已通過。後續只改裝飾背景，最後實拍完成後須再跑完整 gate。
- Taste 官方 `copy-lint` 對宣言靜態 HTML：0 FAIL、0 WARN。
- Codex 原生 IAB 逐頁捲動檢查 37 個既有繁中頁面，沒有破圖、懶載失敗或橫向溢出；新宣言另外在 1440、390、320 檢查全文、圖片與 overflow，結果同樣通過。
- 390：首頁、定價、功能總覽、Blog、菜單、文件、AI 助手、語音；768／1024：首頁；320：首頁與定價均捲到底檢查。主題切換、新區塊深淺模式、320 語言選單、6 個首頁切圖控制已實際驗證。
- 實際截圖與 JSON evidence：`docs/main-preview-20261118/`。最新背景的截圖使用 `mist-v3` 檔名，舊攝影／水彩版證據不能當成最終稿。
- Taste 以現有設計系統、實際圖片比對、程式檢查與原生 IAB 人工審核執行；因使用者要求只用 Codex 原生瀏覽器，官方 headless Browser Gate 未執行，不宣稱 `GATE: PASS`。

## 仍在進行

最後一張跨 App 畫面文字實拍：使用者已接回 USB；手機後續曾由其他工作保留資料更新。現在先驗證實際 7716d40b 產物與新的 container/source guard，原 18 張仍保持真正的 25040 來源，不能重標。由 native owner 管 runner/proxy/lock，主代理唯一操作 UI，capture import agent 管唯一新圖的來源政策與匯入。不得為補圖降版、重裝或降低 19 身分門檻。

後續實況：7716 IPA／四個 bundle、簽章、環境、安裝鏈與限定的設定差異已重新核實；來源政策、主圖採 `screen-text`／gallery 留 `setup` 的必要變更僅備在 ignored candidate patch，尚未套用。等待 Claude 的共用分析／測試鎖自然結束時，USB 再次消失，所以沒有啟動 r11、沒有成功 fresh guard、沒有控制手機或新 PNG。Maestro 只接受 PORT 且固定 bind 127.0.0.1；現有 CoreDevice/remotectl/iproxy 網路清單也沒有可用的該 loopback 轉送。已停止擴充研究並請使用者改用資料線／Mac 直連孔；沒有佔鎖空等。

最新狀態（2026-11-18）：其他工作把手機更新為 `bf358e6e`、FBB container；已另核真正 IPA／設定及相同 Screen surface，沒有重標舊圖。r13 曾 ready，之後 RemoteXPC 連線於 06:19:39 UTC 中斷；主代理接手前已離線，沒有執行本輪手勢或拍出新圖。自有 runner／proxy 均已停止、22088 無 listener、共用鎖 idle；歷史成功 guard 不代表目前可用。來源候選將保持 fresh guard 為 null，最後 screen-text 實拍與 19 張門檻仍 pending，不會以舊圖或生成圖補過。

本地使用者預覽伺服器是本任務 PID 96855，`127.0.0.1:5178`；使用者仍需瀏覽，保留此程序與原分頁。沒有正式服務、手機資料或其他工作的建置程序被停止。
