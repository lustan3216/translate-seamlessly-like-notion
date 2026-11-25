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

## 文字翻譯語氣

App 2.2.0 建置來源 `f4ce7f6b79cd749355150472dbbc0f59d33f79a3` 已包含語氣移除變更 `aeb642556`。`anytranslator-api/config/default-prompt.public.json:101` 列出 `polite`、`humor`、`letter`、`oral`、`concise` 的各語系標籤，`lib/components/buttons/button_tone_choose.dart:37-41` 另從 App 翻譯加入第一項「自動」。官網以這六項為準。

較早的實機 IPA 來源 `7716d40bbe7361f4cbd0956ff0a1e88ccdb4390c` 也有六項，繁中為自動、禮貌、幽默、書信、朋友、精簡。原有的截圖證據沿用各自的建置來源。
