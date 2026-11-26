# 帳號站色調 A／B 驗收

A 已放入 `src/pages/SharedAccountPage.css` 檔尾。B 可直接替換同一區塊，兩版的 CSS 選擇器與 declarations 結構一致。適用於 `/account` 登入前後、付款返回及 App claim。共用配色由 `src/marketing.css` 繼續提供，覆寫限於帳號內容、帳號標題載入骨架及下述 portal。

## 色值

| Token 或有效配色 | Light 現況 → A → B | Dark 現況 → A → B |
|---|---|---|
| `--mk-muted` 次要文字 | `#686865` → `#5e5e5b` → `#555552` | `#b0b0ab` → `#b5b5b0` → `#bbbbb6` |
| `--mk-line` 分隔線與邊框 | `#e8e7e4` → `#dddbd7` → `#d3d1cd` | `#393938` → `#454544` → `#4e4e4c` |
| `--mk-surface` 卡片與提示底 | `#f6f5f2` → `#f0efec` → `#ebeae6` | `#252527` → `#212123` → `#1d1d1f` |
| `--mk-mint` 薄荷底 | `#edf3ed` → `#e7ede7` → `#e2e8e2` | `#252e29` → `#202924` → `#1c2520` |
| `--mk-sand` 沙色底 | `#f4f1e9` → `#eeebe3` → `#e9e6dc` | `#2c2a25` → `#272520` → `#23211c` |
| `--mk-account-surface-ink` 局部文字與圖示 | `#202020` → `#111111` → `#090909` | `#f1f1ed` → `#f1f1ed` → `#f1f1ed` |
| `--mk-account-disabled-ink` 停用文字 | 依按鈕前景與底色做 50% 混色 → `#646460` → `#5e5e5a` | 依按鈕前景與底色做 50% 混色 → `#ababa6` → `#b1b1ac` |
| `--mk-account-disabled-bg` 停用按鈕底 | 依按鈕背景與底色做 50% 混色 → `#eeede9` → `#e8e7e3` | 依按鈕背景與底色做 50% 混色 → `#2d2d2f` → `#29292b` |
| `--mk-account-dialog-bg` 取消框底，Light 取 `--mk-surface` | `#fff` → `#f0efec` → `#ebeae6` | `hsl(240 4% 10%)` → `#141416` → `#101012` |
| `--primary-foreground` 取消框確認鍵文字 | `hsl(0 0% 100%)` → `hsl(240 4% 10%)` → `hsl(240 4% 10%)` | `hsl(240 4% 10%)` → `hsl(240 4% 10%)` → `hsl(240 4% 10%)` |
| `--mk-language-ink` App claim 語言選單文字 | `#202020` → `#111111` → `#090909` | `#f1f1ed` → `#f1f1ed` → `#f1f1ed` |
| `--mk-language-hover` App claim 語言選單反白底，Light 取 `--mk-surface`，Dark 取 `--mk-account-menu-hover` | `#f6f5f2` → `#f0efec` → `#ebeae6` | `#353537` → `#303032` → `#2c2c2e` |

Light 壓深卡片、分隔線和次要文字。卡片上的一般文字也隨底色局部壓深，以維持原對比。Dark 壓深卡片、薄荷色與浮層底，提高次要文字和分隔線的亮度。停用按鈕採實色配對，已選的停用方案分頁仍以底色標示。`--mk-sand` 依派工提供色值，這三頁目前沒有使用該色的元件。

## Portal

- 取消訂閱 `AlertDialog` 沿用專用的 `.mk-subscription-dialog`，套用卡片底色、邊框及次要文字，藍色確認鍵使用深字以達 AA。原本元件、觸發及確認行為照舊。
- App claim 的語言選單同樣透過 portal。以 `body:has(.mk-account-page .mk-language-trigger)` 定位，只有帳號內容內的語言按鈕會觸發配色；行銷頁及帳號頁外的共用頁首選單繼續沿用既有樣式。

## WCAG 對比度

數值以 `:1` 表示，使用 sRGB 相對亮度，並以未四捨五入的數值做斷言。既有停用狀態計算原 `opacity: 0.5` 與其底色的合成值。明暗每組各有 22 個文字色對，兩版均達 4.5:1，且各色對至少維持現況。分隔線另列兩組數值。

| 色對 | Light 現況 | A | B | Dark 現況 | A | B |
|---|---:|---:|---:|---:|---:|---:|
| 一般文字／頁底（含表單、錯誤與成功訊息） | 16.29 | 16.29 | 16.29 | 15.50 | 15.50 | 15.50 |
| 次要文字／頁底 | 5.59 | 6.51 | 7.48 | 8.06 | 8.53 | 9.11 |
| 次要文字／卡片與未選分頁 | 5.13 | 5.66 | 6.21 | 7.03 | 7.81 | 8.73 |
| 一般文字與次要按鈕 hover／卡片及提示底 | 14.94 | 16.42 | 16.54 | 13.51 | 14.19 | 14.86 |
| 徽章文字或圖示／薄荷底 | 14.47 | 15.88 | 16.00 | 12.35 | 13.21 | 13.89 |
| 主按鈕／一般 | 16.29 | 16.29 | 16.29 | 15.50 | 15.50 | 15.50 |
| 主按鈕／hover | 11.06 | 11.06 | 11.06 | 11.33 | 11.33 | 11.33 |
| 停用主按鈕／一般 | 3.21 | 5.07 | 5.26 | 4.75 | 5.96 | 6.74 |
| 停用主按鈕／hover | 2.70 | 5.07 | 5.26 | 3.78 | 5.96 | 6.74 |
| 停用次要按鈕／一般 | 3.21 | 5.07 | 5.26 | 4.75 | 5.96 | 6.74 |
| 停用次要按鈕／hover | 3.08 | 5.07 | 5.26 | 4.45 | 5.96 | 6.74 |
| 停用次要按鈕／卡片內 | 3.15 | 5.07 | 5.26 | 4.49 | 5.96 | 6.74 |
| 停用分頁／已選 | 3.29 | 5.94 | 6.51 | 4.83 | 7.61 | 8.15 |
| 停用分頁／未選 | 2.03 | 5.17 | 5.41 | 2.85 | 6.97 | 7.82 |
| 取消框／標題 | 16.29 | 16.42 | 16.54 | 15.58 | 16.25 | 16.78 |
| 取消框／說明 | 5.36 | 5.66 | 6.21 | 3.29 | 8.94 | 9.86 |
| 取消框／返回 | 16.29 | 18.88 | 19.91 | 15.58 | 15.58 | 15.58 |
| 取消框／返回 hover | 14.70 | 14.70 | 14.70 | 14.70 | 14.70 | 14.70 |
| 取消框／確認 | 3.16 | 5.59 | 5.59 | 5.59 | 5.59 | 5.59 |
| 取消框／確認 hover | 3.79 | 4.66 | 4.66 | 4.66 | 4.66 | 4.66 |
| App claim 語言選單／一般 | 16.29 | 18.88 | 19.91 | 13.51 | 14.19 | 14.86 |
| App claim 語言選單／反白 | 14.94 | 16.42 | 16.54 | 10.81 | 11.63 | 12.31 |
| 分隔線／頁底（非文字） | 1.24 | 1.38 | 1.52 | 1.52 | 1.83 | 2.11 |
| 分隔線／卡片（非文字） | 1.13 | 1.20 | 1.27 | 1.32 | 1.67 | 2.02 |

## 測試

| 指令 | 實際輸出 |
|---|---|
| `node --test scripts/*.test.mjs` | Node v24.6.0，`tests 18`、`pass 18`、`fail 0`、`skipped 0`，exit 0。 |
| `npx --no-install tsc -p tsconfig.app.json --noEmit` | 無錯誤輸出，exit 0。 |
| `node scripts/check-theme.mjs` | `Theme self-check passed: SSR prepaint, six system/persisted restore cases, shared portal roles, CSS syntax and unchanged official moon bytes. Browser interactions are verified separately.` `package.json` 未註冊 `check:theme`，直接執行既有腳本。 |
| `node <scratchpad>/account-tone-contrast.mjs` | A 與 B 選擇器和宣告比對通過，輸出上表，exit 0。從網站工作樹執行，沿用專案的 `postcss`。 |
| `git diff --check` | 無空白錯誤，exit 0。 |

## 未驗證

Codex 內建瀏覽器回傳 `The browser access host is unavailable`。實際明暗畫面、手機 WebView、長字串與 RTL、觸控、焦點／鍵盤與返回處理、各頁的載入／空白／錯誤／成功／停用呈現及 portal 互動均未做瀏覽器驗證。上表為從當前 CSS 計算的色對。正式環境未連線。

## 交付檔

- `account-tone-a.diff` 可核對 A 修改。
- `account-tone-b.css` 是 B 可替換的完整區塊。
- `account-tone-contrast.mjs` 讀取現況及兩組候選 CSS，重算本報告的表格。

驗收後已移除本次測試建立的 `node_modules` 連結，其指向的共用依賴仍可用於後續截圖。未建立瀏覽器分頁或本機服務。Git HEAD 為 `1af926a`，工作樹僅有 `src/pages/SharedAccountPage.css` 的未提交變更。
