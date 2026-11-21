# 繁中 AI 語音介紹核對

來源：實讀 `/Users/luyi/Github/MyProjects/translator` 的 main `c7b1c5aa8487705b5c876a4089cdeedef4d39a18`。此次只改本地官網繁中文案，不改 App、Provider、語音模型或其他語系。

## 可介紹的能力

- `anytranslator-api/shared/qwen-speech.mjs:6-31`：十一種主語言由 Qwen Audio 3.1 TTS Flash 生成，保留四種說話者／聽者角色；粵語轉交其他路徑。音色不是美式／英式／澳式口音選單。
- `anytranslator-api/shared/gemini-speech.mjs:6-37`：其他受支援語言使用 Gemini 3.8 Flash-Lite TTS／Flash TTS。
- `anytranslator-api/shared/pronunciation-speech.mjs:9-28`：依語言選雲端模型，支援 `enableTone`。
- `anytranslator-api/shared/speech-style.mjs:1-5` 與 `lib/screens/translation_audio_screen.dart:1102-1108`：語音翻譯開啟依文本帶細微情緒的自然對話表達。
- `ios/LearningWidget/LearningWidget.swift:246-249`：學習 Widget 支援雲端發音。
- `anytranslator-api/config/default-prompt.private.js:924`：現行 Gemini Chat 語音指示支援慢速示範、邀請跟讀；明確禁止發音評分。文案以聽示範、熟悉口音與節奏、開口對話為主。

## 文案界線

`lib/components/buttons/button_speaker_native.dart:161-215`、`ios/LearningWidget/LearningWidget.swift:273-291` 仍保留原生語音。未支援語言、雲端不可用或逾時可以回退，故不寫「所有語言全面 AI」「完全沒有 iOS 語音」。未聲稱口音選擇、發音評分、口音辨識或改善百分比；未把文字翻譯語氣當成 TTS 音色。

公開主文案強調「新一代 AI 語音」「自然語調與節奏」「慢速示範、跟讀、場景對話」，不向使用者列舉內部路由。

首頁可用的新 keys：`marketing.voice.eyebrow/title/body/action`。既有 Hero、首頁 statement、語音／文字／Widget／AI 助手功能頁、語音與學習文章的已渲染文案亦已更新。

## 檢查

- `npm run check:marketing` 通過（37 條繁中 routes 的 SSR 內容與既有資料檢查；App 功能檢查仍以既有官網固定來源 `25040c5` 為基線，上述 TTS 能力另以目前 main 實讀核對）。
- 本次未生成音檔、未做模型實際發音或裝置聲學測試；自然語音與口音練習為功能介紹，非品質量測結果。
- 瀏覽器 Light／Dark 與窄螢幕視覺驗收由主代理整合後完成。

## 2026-11-18 語氣標籤窄跟進

已實讀實機 IPA 固定來源 `7716d40bbe7361f4cbd0956ff0a1e88ccdb4390c`：選項為自動、禮貌、幽默、書信、朋友、精簡，`oral` 繁中標籤由「輕鬆」改成「朋友」。該實機來源沒有「撩人」，截圖來源保持原樣。

後續最新 main 的 `431f3c2d88785cfb46b6c66d37d29aa9d6d51a49` 已完整加入 `flirty`／「撩人」：public config 選項、private `toneFlirty`／temperature 與 Worker `provider-tasks.mjs` 路由均已入 Git。App `lib/api/settings.dart:304-342,595-612` 與 `button_tone_choose.dart`、Keyboard `KeyboardViewController.swift:28-49` 皆從設定讀語氣，不需新增固定選項 UI。官網依使用者最新 main 要求同步為七項，補俏皮、親暱的跨國交友口吻介紹；未宣稱已部署或實機已選用此新項。

檢查器完整保留 `25040c5` 的定價／config hash／原始語氣基線檢查，另讀固定 `431f3c2d` Git 物件確認七項標籤、prompt、temperature 與路由；移除新增的 flirty 選項並還原 `oral.titles` 後，整份 public config 必須與原基線完全相同。所有繁中實際語氣 count caller 為 `main-common-zh-tw.json`、`ProductStoryPanels.tsx` 及 `check-main-content.mjs`；`home-scenarios.ts` 沒有寫死六項或舊「輕鬆」選項名，無須改動。一般「輕鬆」形容詞不改。
