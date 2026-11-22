# 繁中官網精簡與購買價值文案

更新：2026-11-17T07:41:26.781779+00:00。僅本地網站，未commit、push或部署；其他18語系及法律原文保留。

使用者要求：精簡、有吸引力、列出所有重點，刪除使用者不需要的工程資訊。沿用現有Typeless方向、版型、字體、主題與導覽，依taste-skill及landing-page-design的文案準則審核，沒有另造視覺系統。

37頁預渲染main內容字元總量：42079 → 23289，減少44.7%。此計數包含導覽以外的主內容、FAQ與相關卡片的跨頁重複，排除footer/script/style/SVG；不是去重詞數。超過100字的p段落：94 → 0，最長段落78字元。原始before、after逐頁計數與build receipts保存在ignored output/copy-shortening-20261117/。

- 11項功能改成價值主句與3個核心重點；菜單／文件／表格各自保留用途。首頁保留5組10場景，每張短說明與一個差異重點。
- AI助手列看圖、語音口譯、場景與目標、自訂學習、回饋與複習。螢幕翻譯分清影片字幕與畫面文字。六種語氣、俄德校對與Helper自訂指示仍在。
- Blog不再重印整份feature.sections；保留簡介、核心能力、實用指南與功能連結。刪除Provider、main分支、no-export等非購買決策內容，必要平台與付費條件只放相應位置。
- Pro比較表新增Widget自選內容／主題／難度，掃描列明列菜單・文件・表格及10張／批，AI文字／照片與語音分鐘分列。免費欄簡寫免費體驗，取消各卡片重複價格提醒。週／月／年計費、分鐘額度及1／5組Helper等數值沒有改。
- 下載CTA明示免費下載iOS版，Pro為前往App升級；Mac下載與相容資訊保留。沒有虛構價格、用戶數、準確率、推薦語或新功能。98.3%仍保留開發者自述及口徑未補的簡短歸因。

檢查：TypeScript、check:marketing（37頁SSR、真App來源／方案／功能重點）、git diff --check通過。Vite打包、633頁預渲染、SEO及品牌來源檢查通過；整體npm run build仍exit1，僅因4個新版App功能主圖未完成，不能宣稱完整圖片驗收通過。最新active仍7／11主圖、13張真圖，未修改照片來源或bytes。

Codex原生IAB已核對6代表頁 ×1440/390 ×明暗，共24組，無橫向溢出或文字越界；另實操週／月／年切換，確認標準版150/10週、600/30月，語音版600/45週、2400/135月，年繳額度按月。三方案各8項能力、手機比較表邊界正常。來源是main61bd/v98固定快照，不是正式價格或實機購買驗收。

官方taste headless Browser Gate因使用者原生瀏覽器限制未執行，不宣稱GATE PASS。本輪只讀Simulator盤點顯示：Simulator可以原生截圖；當時開啟的是舊App，未找到可驗證61bd Simulator包，記憶體pressure2且其他工作持鎖。Photo/Voice真請求仍受隔離Simulator provisioning限制；Screen的真ReplayKit/PiP尚待實機，Widget可用Simulator真圖庫但需新版可追溯App。未boot/build/install任何Simulator或操作手機。盤點證據為artifact目錄simulator-readonly-capability-20261117.safe.json；這是07:00 UTC快照，非持續資源監控。

保留原Vite5178及交付IAB分頁供使用者查看；本輪子代理與檢查程序均已結束，沒有新增常駐服務。

最終購買版補驗：移除定價卡內重複的Apple價格提醒，免費方案各列簡寫免費體驗，實際額度仍由方案說明引導App查看。sales-verification.safe.json的TypeScript與marketing通過；最新打包、633頁與SEO通過，圖片門檻仍7/11。37頁最終main內容42079→23289字元，減44.7%，超過100字p段落仍0，最長78。首頁10場景未減少。最終首頁桌機／手機淺色畫面為main-preview-20261116/sales-home-desktop-light.jpg與sales-home-mobile-light.jpg。
