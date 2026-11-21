# 任何 App 翻譯：main 功能與繁中官網文案核對

審查來源固定為 App `main d64f37eee635ab71f697b4f1157fba87b78abcf0`，舊官網功能基準為 `ebd48f61aa29dda378ac8db689d1abd2d9ed7fc5`。本文先查讀該 commit，另於下方追蹤 `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487` 的新增改動；沒有建置、裝置操作、真實 Provider 測試或發布。兩個 commit 之間，`lib/screen_translate/`、`ios/Runner/ScreenTranslate/`、`ios/ScreenBroadcast/` 與對應翻譯字串均為新增。

## 結論

正式繁中名稱為 **「任何 App 翻譯」**，內部名稱為 Screen Translation。它是 iPhone／iPad 上，透過 iOS 螢幕直播與子母畫面，翻譯其他 App 的 **播放音訊** 或 **可見畫面文字**。兩模式分別為「影片字幕」與「畫面文字」，不是原先 Audio 的現場對話翻譯，也不是 macOS 全域翻譯工具。

名稱出處：`lib/locales/screen_translate_translations.dart:5`（繁中值在該 key 的 `zh_TW` 項）。`docs/screen-translate.md:3` 亦明確記錄 2026-11-15 更名。

官網應新增獨立功能頁與一篇使用指南，首頁／功能總覽、閱讀與學習使用案例、FAQ 和額度介紹都要納入。必須以兩種模式的**實際結果圖**說明用途，不能只擺功能設定頁，或把現有文字翻譯／語音翻譯截圖當成本功能。

## 原碼事實與文案界線

下列行號均對應初次固定來源 `d64f37eee…`，非 dirty working tree；新版差異見下一節。

| 項目 | 已實作事實 | 來源 |
|---|---|---|
| 入口與導覽 | Tools 第三列「任何 App 翻譯」，進行中時有 badge；開啟主殼層 page 8，保有 AppBar／底部導覽。Tools 另外兩列為鍵盤、學習小工具，沒有 Chat。 | `lib/main.dart:1503`、`:1531`、`:1432` |
| 平台 | 原生 ScreenBroadcast extension 的 Debug／Profile／Release deployment target 均為 iOS 16.0、device family `1,2`。iOS App on Mac 隱藏此入口。未見 Android 對應 capture／PiP 實作。 | `ios/Runner.xcodeproj/project.pbxproj:1490`、`:1550`、`:1610`；`lib/main.dart:1504`、`:1531` |
| PiP 條件 | 原生會檢查平台是否支援 PiP；不支援時不建立 controller。不能承諾所有裝置都可用。 | `ios/Runner/ScreenTranslate/ScreenTranslateService.swift:542` |
| 模式 | 設定頁可選「影片字幕」「畫面文字」；字幕另有「顯示原文」。 | `lib/screen_translate/screen_translate_sheet.dart:13`、`:196`、`:267` |
| 語言 | 兩種模式皆自動偵測來源，只選擇目標語言；開始等待／執行中不可改語言或模式。字幕使用 Audio 語言清單，畫面文字使用一般語言清單，因此不能寫成兩者支援完全相同的語言數。 | `lib/screen_translate/screen_translate_controller.dart:297`、`:332`、`:403` |
| 開始 | 選擇模式與目標語言後按「開始」，App 檢查該模式額度，打開 iOS 系統螢幕直播視窗，使用者在系統視窗確認。最後一次模式／語言會記住。 | `lib/screen_translate/screen_translate_controller.dart:297`、`:443`；`ios/Runner/ScreenTranslate/ScreenTranslateService.swift:383` |
| 影片字幕的來源 | ReplayKit 只在字幕模式處理 `.audioApp`；`.audioMic` 不處理。系統 picker 隱藏麥克風按鈕。字幕取自其他 App 播放的 App 音訊，不是開麥克風錄外放的 Audio 翻譯入口。 | `ios/ScreenBroadcast/SampleHandler.swift:238`；`ios/Runner/ScreenTranslate/ScreenTranslateService.swift:383` |
| 字幕顯示 | Soniox 使用外部音訊、單向翻到所選語言；只將已定稿字詞送至 PiP，原文可於開始前選擇顯示。字幕有處理／定稿延遲，不宜承諾零延遲或與聲音完全同步。 | `lib/screen_translate/screen_translate_controller.dart:703`、`:861`；`docs/screen-translate.md:177` |
| 畫面文字範圍 | 系統擷取畫面，原生辨識可見文字。PiP 顯示靠近其上方或下方的一塊 4:3 內容區，文字以翻譯卡覆蓋於該區；拖動 PiP、捲動原頁可改變閱讀區域。不是一次翻完整頁、整份背景文件或讓譯文直接寫進第三方 App。 | `docs/screen-translate.md:202`、`:214`；`lib/locales/screen_translate_translations.dart:3301`；`ios/Runner/ScreenTranslate/ScreenTranslateService.swift:1185` |
| 逐步顯示 | main 已將畫面文字的 Provider 部分結果傳給 PiP，完成後取代該卡；只有完成結果進入快取／歷史。可說「譯文逐步顯示」，不能把 Mac replay 證據說成實機已證實不卡頓／零閃爍。 | `lib/screen_translate/screen_translate_controller.dart:1145`、`:1191`；`08572c8de` commit body；`docs/screen-translate.md:1259` |
| 跨 App／背景 | 使用者離開 AnyTranslator 後，PiP 才在其他 App 上顯示；回到 AnyTranslator 會隱藏 PiP，工作階段保留，頁內顯示本次文字紀錄。再次離開可恢復 PiP。這不等於可鎖屏長時間翻譯或一直常駐背景。 | `ios/Runner/ScreenTranslate/ScreenTranslateService.swift:475`、`:488`；`lib/screen_translate/screen_translate_sheet.dart:115`；`docs/screen-translate.md:754` |
| 手動停止 | 螢幕上方紅色指示可開啟 iOS 停止錄製；App 的「停止」也開啟系統 broadcast picker，由系統停止直播。關閉 PiP 的原生 handler 亦會結束擷取／翻譯；單純返回 App 隱藏 PiP 不算關閉。 | `lib/screen_translate/screen_translate_controller.dart:497`；`ios/Runner/ScreenTranslate/ScreenTranslateService.swift:377`、`:767`；`lib/locales/screen_translate_translations.dart:3379` |
| 自動停止 | main 設定 120 秒沒有新的翻譯後結束。鎖屏停止依 iOS protected-data 訊號／檔案保護而定；短暫鎖屏、未設定密碼或延後要求密碼可能不立即觸發。網站不宜寫「一鎖屏就立刻停止且完全不計費」。 | `lib/screen_translate/screen_translate_controller.dart:46`；`ios/ScreenBroadcast/SampleHandler.swift:138`；`docs/screen-translate.md:568` |
| 額度 | 影片字幕共用 Audio 的語音分鐘額度；畫面文字走翻譯／照片計數路徑，程式以新畫面 batch 的 usage id 計數，而非另給無限免費畫面翻譯。使用中剩餘字幕分鐘是估計，後續由服務端結算。 | `lib/screen_translate/screen_translate_controller.dart:111`、`:424`、`:443`、`:1147`；`docs/screen-translate.md:662` |
| 歷史 | 本地 Drift 儲存每次工作階段已完成的原文／譯文、模式、目標語言、開始時間，沒有譯文則不存。頁面 AppBar 時鐘入口可重開，最新在前；詳情顯示原文和譯文，可選取文字。支援刪單筆／清全部，但沒有搜尋、匯出、跨裝置同步或完整影片回放。 | `lib/screen_translate/screen_translate_controller.dart:1052`；`lib/screen_translate/screen_translate_history_screen.dart:47`、`:118`、`:190`、`:263`；`docs/screen-translate.md:709` |
| 網路與內容限制 | 字幕與文字翻譯皆需網路與既有 AI／語音服務。受保護畫面、對方 App 不提供音訊、沒有可辨識文字、沒有人聲、網路或額度問題都已有狀態回饋。黑畫面保護偵測是啟發式，不是所有 DRM 的相容性證明。 | `lib/screen_translate/screen_translate_controller.dart:42`、`:703`、`:1181`；`ios/Runner/ScreenTranslate/ScreenTranslateService.swift:1193` |

### 不應出現在官網的推論

- 「所有 App 都支援」「Netflix／任何串流服務都能翻」：App 的 logo wall 是介面列示，不能作為逐一相容性測試或合作背書；受保護內容與音訊擷取限制仍存在。見 `lib/screen_translate/screen_translate_logo_wall.dart:16`、`:35`。
- 「翻譯電話／擷取對方麥克風／幫你錄通話」：目前處理的是 ReplayKit App 音訊，不應延伸宣傳成通話錄音功能。
- 「Mac 全域字幕」「Windows／Android 任意 App 翻譯」：目前查到的原生實作僅 iOS，且 Mac 入口明確隱藏。
- 「鎖屏繼續聽」「常駐一整天」「關閉後絕不再產生任何費用」：前者不符此模式的設計，後者無法以停止 handler 保證已送出的服務端工作立即撤回。
- 「自動產生影片課程」「一鍵把整個網頁匯入 Chat」「輸出字幕檔／影片」：目前沒有相應入口或資料合約。可手動選取／複製文字後再去 Chat，不能寫成既有自動整合。
- 「所有原文與譯文永久完整保存」：是本地文字紀錄，背景 App 被 iOS 終止時，最後尚未存入的數秒可能遺失。

## 2026-11-16 後續 main 差異

已另外查讀 `53bdfc0f43ebe67047c7e575d3754f7ff3cc0487`，其中 `7bde2a9f2` 改為**兩模式共用目標語言**。`ScreenTranslateController.setTargetLanguage()` 會同時更新支援該語言的字幕與畫面文字模式；若另一模式沒有這個語言，它保留原值。字幕的支援清單仍比畫面文字少，不能宣傳成所有語言都兩模式通用。

對應繁中 JSON 已更新限制段落與本文件 FAQ；其餘主要功能、額度與歷史敘述不變。後續 `b737e8c5f`、`4490f4956`、`21508253c`、`7e35d8886` 改良文字 PiP 的渲染成本、完成時卡片長大與淡出切換。這些是原碼／Mac replay 證據，仍不能宣稱手機已實測零延遲或完全無閃爍；重拍要使用新版真實安裝來源。

## 可直接採用的繁中文案

以下是本地繁中 review 用的文字建議，不代表功能已經發布至商店，也不代表實機驗收通過。

### 功能總覽／首頁卡片

**名稱：** 任何 App 翻譯

**摘要：** 在其他 App 看影片、讀網頁，也能用子母畫面閱讀翻譯。把播放的語音翻成字幕，或翻譯畫面上的可見文字。

**短版：** 影片語音變字幕，網頁文字變譯文；在子母畫面繼續閱讀。

**CTA：** 查看任何 App 翻譯

### 功能頁

**H1：** 其他 App 的字幕與畫面文字翻譯

**開場：** 看外文影片，選「影片字幕」；讀網頁、聊天、遊戲或文件，選「畫面文字」。在 iPhone 或 iPad 啟動螢幕直播，翻譯會顯示在子母畫面，不必反覆截圖、複製貼上。

**影片字幕：** 把其他 App 播放的語音翻成字幕，依需要同時顯示原文。來源語言會自動偵測，你只要選擇要翻成的語言。字幕會在辨識結果確認後陸續出現。

**畫面文字：** 在網頁、聊天畫面或文件停留，閱讀子母畫面中的譯文。把子母畫面拖到內容上方或下方，或捲動原頁，換到下一段文字。

**歷史紀錄：** 回到 App 可閱讀本次已完成的原文與譯文；之後也能從歷史紀錄重新開啟。

**限制說明：** 需 iOS／iPadOS 16 或更新版本、支援子母畫面的裝置及網路連線。是否能讀取畫面或播放音訊，依對方 App 與內容保護限制而定。影片字幕使用語音分鐘額度，畫面文字使用翻譯額度；實際可用量請在 App 查看。這個功能用於螢幕開啟時觀看其他 App，結束後請停止螢幕直播。

### 操作步驟

1. 在 Tools 開啟「任何 App 翻譯」，選「影片字幕」或「畫面文字」，再選要翻成的語言。字幕模式可先選擇是否顯示原文。
2. 按「開始」，在 iOS 系統視窗確認「開始直播」。
3. 切換到要看的 App。影片播放時閱讀字幕；文字模式可拖動子母畫面或捲動原頁，讀取其他段落。
4. 結束時點上方紅色指示停止錄製，或回到 App 按「停止」並在系統視窗結束直播。已完成的文字可從歷史紀錄重看。

App 自己的設定頁教學以四步呈現，來源 `lib/screen_translate/screen_translate_tutorial.dart:22`。官網不要退回舊的三步通用「輸入／聆聽／提問」敘事。

本地實作文字另存 `src/translations/marketing/main-screen-zh-tw.json`，依官網既有三步元件將「選模式／目標語言」、「確認直播／切到來源 App」、「停止／重看紀錄」分為三步；沒有省略系統確認或停止，也沒有加入聆聽現場聲音的錯誤流程。該 JSON 另提供功能細節段落、media 案例三步與 screen 指南 intro／tip／limit，供 root 合併，其他語系未修改。

### FAQ 建議

**「任何 App 翻譯」和語音翻譯有什麼不同？**

語音翻譯用於眼前的對話；任何 App 翻譯用於手機上正在觀看的其他 App。前者以麥克風接收現場說話，後者透過系統螢幕直播，處理 App 播放的音訊或可見畫面文字。

**每個 App 都能使用嗎？**

是否能取得畫面或音訊，取決於對方 App 與內容的保護限制。遇到受保護畫面、沒有聲音或網路問題時，子母畫面會顯示目前狀態；不能把功能名稱當成所有 App 都保證相容。

**需要先選原文語言嗎？**

來源會自動偵測，只需要選擇翻譯成的語言。選好目標語言後，切換模式會沿用；若另一模式不支援該語言，會保留原本的選擇。

## 使用案例與 Blog 擴充

| 放置位置 | 可用情境 | 避免的擴張 |
|---|---|---|
| 閱讀 | 閱讀外文網頁、公告、電子文件的可見段落；拖動 PiP／捲頁換區域。 | 不寫成 PDF／Word 匯入、編輯或整份自動翻譯。 |
| 學習 | 觀看外文教學影片或直播，閱讀原文／譯文字幕，之後從本地紀錄重讀。 | 不說自動把影片變成 Chat 課程、字幕逐字零延遲。 |
| 旅行 | 在手機上看外文景點介紹、交通資訊、住宿說明；以文字模式閱讀目前畫面。 | 不宣稱會代訂票、付款或完成表單。 |
| 聊天／工作 | 讀取聊天或工作 App 上可見的外文文字，再自行準備回覆。 | 不宣稱自動發送回覆、錄通話或取得他人麥克風。 |

**新增 Blog：** 〈看影片、讀網頁：用任何 App 翻譯閱讀其他 App〉

建議順序：

1. 先用兩個情境區分模式：影片裡有人說話，與畫面上需要閱讀的字。
2. 在 Tools 選模式、目標語言；說明來源自動偵測。
3. 展示真實 iOS 開始直播視窗，再展示實際跨 App 的 PiP 結果。
4. 字幕模式說明可選原文，以及只取 App 播放音訊；畫面文字說明拖動 PiP／捲頁換區域。
5. 回到 App 看本次文字，結束直播；之後開歷史重讀。需要 Chat 解釋時，手動選取／複製文字再提問，不包裝成一鍵整合。
6. 收尾說明網路、內容保護、語音／翻譯額度與螢幕開啟使用情境，不給沒有證據的效能或相容性保證。

**Blog 開場建議：** 外文影片的聲音，和網頁上的文字，需要不同的讀法。「任何 App 翻譯」提供影片字幕與畫面文字兩種模式。選好要翻成的語言，完成 iOS 螢幕直播確認後，就能在原本的 App 上用子母畫面閱讀。

**Blog 結尾建議：** 看完後停止螢幕直播，再回到歷史紀錄重讀需要的原文與譯文。畫面或音訊能否取得，仍受對方 App 的內容保護限制；需要核對的日期、價格與其他細節，請回到原內容確認。

## 真實截圖 shot list

每張需記錄 App 版本、binary 對應來源 commit、裝置、語言、主題、擷取時間與原始 PNG hash。以真實主畫面截圖原解析度匯出，不放大、重畫 PiP、合成譯文、用 UI test fixture 冒充正常 Provider 結果。首次支援 iPhone／iPad 的平台描述是原碼能力，不能用單一 iPhone 截圖充當全裝置驗收。

| 優先級 | 畫面 | 內容與檢查 |
|---|---|---|
| 必要 1 | 其他 App＋影片字幕 PiP | 實際播放有授權的公開外文影片，經真正 ReplayKit 音訊與 Provider 產生繁中字幕；原文／譯文可同時清楚看到，不含私人通知、帳號或播放推薦。影片來源與授權留證。 |
| 必要 2 | 其他 App＋畫面文字 PiP | 真正可公開的外文網頁／文件，PiP 中有清楚、完成的繁中翻譯卡；同一張看得出原內容和 PiP，不用假的整頁譯文模擬覆蓋第三方 App。 |
| 補充 3 | 本功能設定頁 | 最新 main 的兩模式、目標語言、「顯示原文」、開始按鈕與中性灰主題；可供指南使用，不能取代兩種結果圖。 |
| 補充 4 | 進行中的 App 紀錄頁 | 本次公開測試的原文／譯文、狀態、停止入口；若顯示剩餘分鐘，不把測試帳號數字當作方案承諾。 |
| 補充 5 | 歷史／詳情 | 只使用本次公開內容；詳情可看到原文與譯文。不要把其他使用者歷史帶進官網，也不執行刪除來清畫面。 |
| 指南 6 | iOS 開始直播視窗 | 正常系統操作拍攝；不改畫面語言、不冒充 App 自製視窗。既有 `assets/screen_translate_tutorial/step-2.jpg` 是英文、Light 的舊系統截圖，不能當最新繁中功能結果。 |
| 可選錄影 | 文字逐步完成／拖動 PiP | 真正操作，保留串流和閱讀區域改變的過程；只有靜態圖時，不以動畫示意宣稱主機實測的速度與穩定性。 |

兩個必要結果圖未完成前，保持該位置缺圖狀態，不能用 Audio 頁、文字翻譯、舊 branch 截圖或 App 內 logo wall 代替。所有 UI 圖仍須按最新 main 重拍；App 已改成中性灰，舊紫藍選取狀態不代表此版本。

## 審核／交付界線

- 這次已完成的是固定原碼功能審查和繁中文案建議。未執行任何建置／裝置測試、未控制手機、未取得新的圖片，也未接觸 dirty main 檔案或 production。
- `docs/screen-translate.md:1259` 保留多項實機未驗證項目；同檔 `:1002` 有 PiP 關閉、App Review、位置定位等風險。部分舊紀錄已被後續原碼取代，不能把單一段落或 checked item 解讀為完整功能 E2E 通過。
- 2026-11-16 畫面文字串流與定格改動 `08572c8de` 的 commit body 說明通過 Mac replay／self-tests／部分 Flutter tests，但明示該次沒有裝置／真實 Provider 串流驗證；不能宣傳成測得的零閃爍、無延遲。
- `docs/app-theme-and-design-guidelines.md` §6.1 的 Agent／Tools Chat 入口敘述落後 main。實際 `lib/main.dart:1503` 目前為鍵盤／小工具／任何 App 翻譯三列，Chat 有主導覽入口；後續更新官網以原碼與真實畫面為準。
- 網站發布／商店版本是另一個 gate；main 已合併不代表目前公開 App Store binary 已有此功能。這個本地 review 不改變既有不部署、不推送、不安裝的範圍。
- 已參照官方 taste-skill 2.5.1 的實圖、分類優先和不捏造證明原則；未執行會另開 headless Chrome 的 skill browser gate，不能標示 `GATE: PASS`。這份文件也不把通用技能的視效／佔位圖帶入真實 App 畫面。
