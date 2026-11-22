# main Chat 功能審查與繁中官網更新依據

基礎功能審查固定來源：`53bdfc0f43ebe67047c7e575d3754f7ff3cc0487`。此版本取代本文件先前的 `d64f37eee635ab71f697b4f1157fba87b78abcf0` 審查；舊官網 App 基準仍為 `ebd48f61aa29dda378ac8db689d1abd2d9ed7fc5`。以下只以固定 Git object 為準，不把工作區未提交改動當功能證據。

本輪只讀原碼、公開設定與合約，沒有建置、操作裝置、呼叫 Provider 或部署。**main 已實作、特定安裝已具有該 UI、目標環境已開放，必須分別證明。** 官網先完整介紹使用者指定的 main 功能；本文件不代表正式環境驗收。

## 最新來源凍結：61bd

本輪拍攝／匯入最新目標為 `61bdbe4024f709e29109b321130023909f89411b`。已窄查 `e9..61bd` 變更檔案：僅 RevenueCat、gateway／恢復錯誤、原生解析與相關測試／文件，未改 Chat UI、公開設定或其他行銷功能。以下 v98 Chat 事實與 e9 行號保留；沒有藉這次目標更新改標任何舊圖片的來源、日期或驗收狀態。

## 最新差異補查：8727 → e9／公開設定 v98

本節 Chat 差異固定來源：`e9ff93c272e5b45933720ad97441c3ceea075609`，只查 `8727cc50d0265c9a312b23e4fabb057670e67639..e9`。以下 53b／358 的原證據與行號保留作歷史追溯，本節優先解釋最新 Chat；本子審查沒有建置、裝置操作、Provider 呼叫或部署，主代理的安裝／拍攝證據另行記錄。

- **新 intro**：繁中開頭為「嗨！我是你的 AI 語言助手，可以用說的，也可以打字跟我聊。跟語言有關的事都能找我：」。`ChatIntroLearn` 的「也可以用這兩種方式學語言：」仍在兩個學習按鈕上方。來源：e9 `lib/locales/chat_guide_translations.dart:23`–`30`。
- **四個一般初始建議**：語音對話（`voice`）、陪我用{language}聊天（`send`）、幫我即時口譯（`send`）、拍照讓 AI 看懂（`camera`）。聊天建議直接送出帶入語言的 label；口譯建議送出介面語言與所選語言間互譯的需求。舊 `translateTo` 填草稿建議已移除。有可接續課程時，可另外出現「繼續」；語音仍受旗標與支援語言限制。來源：public JSON `uiInformation.chatChips.normal` 與 `docs/chat-lessons-contract.md:1210`–`1251`。
- **語言名稱取值**：先用目前／已保存的練習語言，沒有時才用翻譯歷史常用目標；非英文介面預設英文，英文介面後備為西班牙文。不把網站示例的「英文」說成所有使用者固定值。來源：e9 `translation_chat_screen.dart:542`–`557`、`:691`–`696`。
- **看圖理解**：加入照片後，AI 依畫面與重要文字說明重點、價格、提醒、期限、訊息語氣及可能的下一步；不是只逐字翻完文字。明顯紅框文字是模型優先關注的內容，沒有新增 App 內畫紅框的操作承諾。價格、期限、人物與建議都仍需核對。來源：contract v98 photo behavior，以及 `docs/chat-prompt-correction-scope-20261116.md:147`–`206`；沒有讀取／輸出 private prompt 全文。
- **語音回接**：一般 Chat 點 send 建議時，原本 active 的語音會在訊息送出後依服務狀態接回；原本關閉的語音不會自動打開。語音模型也有接續聊天／口譯脈絡的規則，但既有 v98 證據明記 Qwen 真實語音未測。來源：e9 `translation_chat_screen.dart:727`、`:775`–`805`。
- **學習兩入口未變**：場景訓練／目標學習仍在 intro 內，從一般 chip 列排除；仍是一階段選語言／內容、下一階段選難度的對話內 picker，自訂需求仍可說／打字。來源：e9 `translation_chat_screen.dart:664`–`675`、`:739`–`742`、`:900`–`1055`。v98 沒有恢復五模式 sheet、獨立語句、自由練習或「我的句子」入口。

公開設定是 v98，`chatChips.version` 仍為 8，bundled `voiceChatEnabled`／`chatLessonsEnabled` 仍為 false；remote flags、實際安裝與服務開放仍須分別核實。這個窄 delta 沒有改 usage runtime 或 request／lesson shape；方案逐值核對沿用主代理的 pinned snapshot 檢查。

最新 `chat-entry` 必拍：新 AI 語言助手 intro、`ChatIntroLearn` 導引句、兩個學習按鈕與真實四個初始建議（語言名稱以實際設定為準）。`chat-photo` 要拍正常加入公開圖片後的重點／下一步解答；`chat-live-translation` 要有真正點口譯建議及接續翻譯的結果。不得以舊 v97 畫面或 prompt-regression synthetic PNG 的測試輸出冒充新版實機證明。

v98 原有文字模型紀錄為 final 19 outputs 全 pass，但只覆蓋指定案例；voice、fallback、一般真實照片／多圖與大量既有案例仍未全部驗證。這是引用原碼內既有證據，不是本輪重跑、正式部署或新版圖片已拍好的宣告。

## 歷史差異補查：53b → 358

當時目標來源：`358dc9b905ae93cf97b7725c461610d1f0ba07ca`。只比對 `53b..358` 的單一 commit：Chat 在兩個練習按鈕上方加入 `ChatIntroLearn` 導引句，繁中為 **「也可以用這兩種方式學語言：」**。功能入口、對話內選項流程、計費、方案與公開設定 v97 均不變；以下完整功能證據與行號仍保留 53b 來源，不改標成 358 行號。

新增程式證據取自 358：`lib/screens/translation_chat_screen.dart:2008`–`2016` 與 `lib/locales/chat_guide_translations.dart:30`。當時 `chat-entry` 實拍必須同時包含單一 intro、新導引句與場景／目標兩個按鈕。這次只查原碼差異，沒有建置、執行新增 i18n test 或取得新版截圖；原圖來源與拍攝時間不變。

## 1. 最新 main 的關鍵變化

`5e95328f8` 已移除模式 sheet、上方模式 tag、首次設定流程，以及獨立語句訓練、自由練習、「我的句子」入口。`bd941f396` 的公開設定升至 v97，將「場景訓練」「目標學習」改為介紹訊息下的兩個對話內按鈕；`chatChips.version` 仍是 8。

**不能因公開目錄仍有五個 mode、12 個 sentence topics，或原碼保留相容分支，就把它們宣傳成目前可選的五種模式。** 語句單元仍會在目標計畫內運作；回顧也仍能重練語句。一般聊天可直接用外語練習，不需要先切自由練習模式。

主要證據：

- `docs/chat-lessons-contract.md:1116`–`1208`，v97 覆蓋舊章節的入口與互動說明。
- `lib/screens/translation_chat_screen.dart:663`–`677`：`_entryChips` 只取 normal set 的 scenario／goal lesson chips。
- `lib/screens/translation_chat_screen.dart:821`–`832`：接續練習傳 `mine: false`，明記 My sentences 不再提供。
- `lib/screens/translation_chat_screen.dart:1796`、`1988`–`2032`：單一 `ChatIntro` 與其下的兩個入口。
- `lib/locales/chat_guide_translations.dart:21`–`28`：繁中 intro 與場景、目標、難度、練習語言等實際文案。

## 2. 資訊架構與進入方式

主 App 第四個底部入口直接開全螢幕 `TranslationChatScreen`，舊 Voice Agent 主殼層頁已退役。

| 入口 | 固定 main 的行為 | 證據 |
|---|---|---|
| 底部 Chat | 直接一般對話；可打字、加照片、開麥克風 | `lib/main.dart:1424`–`1434`、`1614`–`1620`；`translation_chat_screen.dart:2265` 以下 composer |
| Tools | 鍵盤、學習 Widget、任何 App 翻譯；沒有 Chat 列 | `lib/main.dart:1503`–`1545` |
| 歷史／收藏的 Chat 圖示 | 把譯文帶入 Chat 草稿，使用者再送出 | `lib/screens/histories_screen.dart:238`–`246`；`translation_archive_screen.dart:207`–`217`；`main.dart:1137`–`1143` |
| 翻譯 bottom sheet | 特定結果 sheet 仍有 Chat 圖示 | `lib/screens/translation_text_bottom_sheet.dart:328`–`343` |
| 主 Text 結果區 | 舊的譯文旁 Chat 按鈕已移除，不能泛稱所有譯文旁都有入口 | 對照 main Text 頁與上列仍存在的特定入口 |

因此官網用一個 Chat 模組介紹文字、照片、語音與練習；繁中 `/features/agent` 導向 Chat，不把舊獨立任務準備、雙方語言、代為交談、審閱後轉述流程當成另一個現行模組。

## 3. 現行操作流程

### 一般對話

打開 Chat 後即可提問。intro 說明語言、翻譯、改寫、照片、即時口譯與練習等用途，並非通用軟體開發或任意任務代理。

- 每則訊息最多 3 張照片。這與 Smart Scan 的免費 1 張／Pro 10 張是不同限制。
- 空白輸入欄的動作位置可開啟麥克風，語音字幕與完成回合保存在同一份 Chat。
- 聚焦輸入欄或開相機會暫停語音；需要時再開麥克風接續。真正離開／進背景會停止語音。
- 一般外語聊天中，AI 可對明確的學習語言錯誤補一個簡短修正；不是每句挑風格，也不是發音評分。明確要求處理的翻譯、查字或解釋材料不當作使用者練習句糾正。

證據：`lib/api/chat.dart:17`；`lib/screens/translation_chat_screen.dart:1618` 以下相機、`2265` 以下 composer；`lib/chat/chat_voice_controller.dart:204` 以下事件與 `294` 語音使用者回合；`docs/chat-lessons-contract.md:1179`–`1195`。

### 場景與目標

1. 點 intro 下方的「場景訓練」或「目標學習」。對話尾端出現一張 AI 側選項卡，保留 composer，卡片開啟時隱藏一般 chip 列。
2. 第一階段可選練習語言與預設內容。場景列出角色／任務情境；目標可帶目前進度。沒有已選練習語言時，先用既有語言選擇器處理。
3. 點預設內容後，第二階段選「自動、初級、中級、進階」；選好即開始，沒有舊 sheet 的最後「開始對話」按鈕。
4. 第一階段卡片仍開著時，也可直接打字或說出自己的場景／目標需求，按已保存的難度準備後開始。不是在一般 Chat 隨意說一句需求就一定建立課程，也沒有另一個自訂表單或自訂語句入口。
5. 一次只出現一張選項卡。開始、取消、清空或離開時收起；課程結束後回一般 Chat，回顧中的下一個目標可再開目標選項卡。

證據：`translation_chat_screen.dart:465`–`469`、`895`–`1050`；自訂攔截 `:958`–`996`、`:1671`–`1684`；`chat_voice_controller.dart:294`；`docs/chat-lessons-contract.md:1154`–`1164`。

## 4. 內容、練習與保存能力

| 能力 | 目前可介紹的行為 | 主要證據 |
|---|---|---|
| 13 個場景 | 機場、飯店入住、餐廳、購物、診所、交通購票、問路、自我介紹、團隊會議、工作面試、找老師討論、看房租屋、聚會聊天；每場景有角色與任務 | 固定 public JSON `uiInformation.chatLessonCatalog.scenarios`；picker `translation_chat_screen.dart:1023`–`1047` |
| 8 個目標 | 旅遊、日常生活、工作、出差、求職面試、留學、海外生活、交朋友；以語句與場景單元交替練習 | public JSON `chatLessonCatalog.goals`；`translation_chat_screen.dart:835`–`880` |
| 自訂場景 | 在場景第一階段用說／打字描述需求，準備角色、情境與 3 個任務 | `translation_chat_screen.dart:958`–`996`、`1104` 以下；`lib/api/chat.dart` custom lesson API |
| 自訂目標 | 3 個階段，每階段 5 句與 1 個含 3 任務的場景，共 6 單元；同需求、語言、介面語言與難度可重用 | `translation_chat_screen.dart:1104`–`1181`；`lib/chat/chat_lesson.dart` custom goal schema；public contract v8 |
| 自訂保存限制 | 目前僅保存最新一份自訂目標；新目標會取代原計畫與進度，不是無限自訂課程庫 | `translation_chat_screen.dart:1104`–`1181` |
| 難度 | 預設場景／目標選取後才選難度；自訂需求使用已保存的難度 | `translation_chat_screen.dart:934`–`950`、`:1003`–`1021` |
| 開口優先 | 語句卡顯示句子、意思、位置與語音狀態，按實際回答取得回饋；語音不可用或失敗可回文字 | `translation_chat_screen.dart:2107` 以下、`2262`–`2368`；`chat_lesson_widgets.dart:571` 以下 |
| 手動前進 | 取得實際回答的回饋後，由使用者重說或下一句，最後進回顧 | `chat_lesson_widgets.dart:571` 以下 `ChatLessonDrillCard`；screen 的 sentence 前進處理 |
| 修正與收藏 | 對照原句、較自然說法與原因，聽示範，將實用句收藏；是語句用法回饋，不是音素或發音分數 | `chat_lesson_widgets.dart:261`–`435`；`translation_chat_screen.dart:1525` 以下、`:2068`–`2078` |
| 回顧與再練 | 語句回顧依實際 typed／voice 作答；場景回顧顯示任務與改善句，可收藏、聆聽、再練或接下一組 | `translation_chat_screen.dart:1382`–`1498`、`:1962`–`1982`；`chat_lesson_widgets.dart:951`–`1195` |
| 本地進度 | 保存目標、單元與接續位置；獨立「我的句子」入口已移除，不再宣傳收藏／近期翻譯一鍵匯入 drill | `translation_chat_screen.dart:821`–`880`、`1090` 以下；`lib/chat/chat_lesson.dart` 本地保存 |
| Chat 歷史 | 清空目前對話會收入本地唯讀歷史，可重看文字、照片、課程與回顧卡；永久刪除是另外的流程 | `lib/chat/chat_history.dart:38`–`42`；`lib/screens/chat_history_screen.dart:391`–`496`；screen clear/archive 流程 |

收藏實用句、回顧內再練，以及 Widget／Helper 的獨立使用仍可介紹；不將它們拼成不存在的「我的句子入口 → 自動匯入任意歷史 → 跨裝置同步」流程。

## 5. 即時口譯與語言助理範圍

一般 Chat 現在可點 v98 的「幫我即時口譯」初始建議，或直接要求「接下來請把我說的英文翻成日文」。口譯建議是送出需求的 Chat chip，後續依上下文翻譯，直到使用者要求停止、聊天、練習或解釋；與場景／目標 picker 是不同用途。

`docs/chat-lessons-contract.md:1166`–`1177` 說明文字及語音的規則；`:1179`–`1195` 說明一般聊天的主動修正、語言助理範圍與 identity 規則。開發、詐騙、冒用、騷擾等生成要求不屬對外宣傳能力，收到可疑訊息後翻譯／理解是不同情境。

既有 `docs/chat-prompt-correction-scope-20261116.md` 的 v97 區段記錄文字模型 final 42 outputs 中 40 pass／2 fail；最新 v98 的文字／圖片指定案例結果見上方新差異節，voice、fallback、真實照片與正式服務仍有未驗證項目。這是引用既有證據，**本輪沒有重跑模型測試**，也不把自然語言口譯描述成零錯誤、固定 SLA 或無需核對的保證。

## 6. 啟用、平台與額度

- 53b 基礎審查的 bundled public config 為 v97；最新 e9 為 v98，`chatChips.version: 8`，`voiceChatEnabled`／`chatLessonsEnabled` 仍為 false。Worker remote Settings 依服務及課程旗標動態提供；App 進階能力只接受 remote Settings。新 App 搭舊 v96 Worker 時沒有兩個新入口，需依既有 rollout 順序，不是官網寫上就已開放。
- 語音依支援語言、麥克風權限、網路、服務與可用分鐘。文字支援語言清單不等於語音輸出清單；未做 Android、iPad、iOS App on Mac 等平台的實機等價驗收。
- 一般 Chat 打字／照片及自訂生成使用翻譯次數：`anytranslator-api/shared/usage.mjs:26`–`34`、`292`–`309`。Chat 在同 installation 的有效 voice live lease 期間，以 `provider-handler.mjs:1627`–`1644` 驗證後改按語音計量，不另扣該 Chat 次數。
- Chat 語音使用 AI 助手分鐘：App 從 `lib/api/realtime_voice.dart:128`–`132` 取得 session；後端 `shared/usage.mjs:158`–`159`、`186`–`187` 讀 `voiceAgentMinutes`，`shared/voice-agent-usage.mjs:36`–`49` 使用 `voiceAgentLimitSeconds`。不再引用已刪除的 usage card 計費說明作 runtime 證據。
- 語音翻譯／影片字幕的分鐘池與 Chat AI 助手分鐘不同。免費額度政策與既有訂閱可能不同，應看 App 用量卡，不為所有免費使用者硬寫每日／每週重置。
- Chat 歷史、目前的 AI 上下文與本地進度是不同資料。AI 有摘要與 token budget，不能承諾永久完整記憶或跨裝置同步。

## 7. 繁中官網內容交付

已更新 `src/translations/marketing/main-chat-zh-tw.json`：

- 1 個 Chat feature、8 個具體介紹 sections、3 個 feature steps。
- study 的 3 個步驟、Chat／learning 的 6 段文章、7 個 marketing 字串。
- 移除五種模式 sheet、按開始才切課、自由練習獨立模式、獨立語句目錄與「我的句子」入口。
- 完整說明對話內兩入口、兩階段 picker、自訂需求打字／說話、目標內語句、回顧再練、一般聊天口譯與本地歷史。

只改繁中覆寫；18 個其他語言維持原資料並明確待後續確認，不要求它們在本輪同步新功能。正式公開前需同步相同 App／Worker baseline 與真實截圖。

## 8. 更新後的真實截圖清單

| 優先 | shot id | 要拍的真實畫面 | 驗收重點 |
|---|---|---|---|
| P0 | `chat-primary` | 公開語言問題與實際 AI 回答、composer／麥克風 | 不拍空白或載入代替回答；不要求已移除模式標籤 |
| P0 | `chat-entry` | 新 AI 語言助手 intro、導引句「也可以用這兩種方式學語言：」、場景／目標兩按鈕與 v98 真實四個初始建議 | 取代舊 `chat-modes`；不可重製五模式 sheet |
| P0 | `chat-goals` | 對話內目標選項卡，語言列與已有目標進度 | 選項位於 AI 側對話內，不是 bottom sheet |
| P0 | `chat-scenarios` | 對話內場景卡及選取後的難度卡 | 第二階段選難度即開始，沒有最後開始按鈕 |
| P0 | `chat-custom-goal` | 目標卡開著時，正常打字／說需求後的實際第一單元 | 公開例子如朋友婚禮；不造自訂表單或課程地圖 |
| P0 | `chat-sentence` | 目標計畫裡的語句卡、意思、位置與回答後狀態 | 必須從目標正常進入，不宣傳獨立語句模式 |
| P0 | `chat-scenario` | 實際角色、任務與正常作答的場景對話 | 與 picker 截圖分開；不塞測試 transcript |
| P0 | `chat-voice` | 真實麥克風回合與同一 Chat 文字泡泡 | 聲學／Provider 成功需另保留證據 |
| P1 | `chat-correction` | 原句、較自然說法、展開原因 | 不宣傳發音分數 |
| P1 | `chat-live-translation` | 點「幫我即時口譯」建議或正常要求後的多回合翻譯 | 真實 chip 與接續結果分開保留；核對原文 |
| P1 | `chat-recap` | 真實作答的回顧、收藏與下一單元 | chip 不算使用者作答，不以 fixture 冒充 |
| P1 | `chat-photo` | 公開照片與實際畫面重點、提醒／下一步回答 | 與 Smart Scan 張數／結果分開 |
| P1 | `chat-history` | 本任務公開對話的唯讀歷史 | 不為拍圖刪使用者資料，不宣稱恢復目前對話 |

取消 `chat-mine`，不再尋找已移除的「我的句子」入口。原始圖片須保留解析度、時間、build、source commit、環境、操作與 Provider 成功證據及 hash；網站裁切另保留 provenance，不能以舊圖改標最新 main。任何舊圖只能明確標為前版，無匹配 artifact 的圖保持待拍。

## 9. 設計參考與驗證限度

延續 App CeraRound、語意 Light／Dark、AppSpace／AppRadius、Hugeicons、`ConversationMessage`／`ConversationComposer` 與現行 `chatOptionButtons`／`ChatLessonPickerCard`。後兩者位於 `lib/chat/chat_lesson_widgets.dart:1199`、`:1249`；不引用已移除的 `ChatModesView` 當最新 UI 參考。

本輪沒有實際 Light／Dark、長文、RTL、觸控、SafeArea、鍵盤、返回、空白／錯誤／成功狀態或聲學驗證。上述清單是待執行項目，不是拍攝或驗收證明。沒有改 main App 或進行部署。
