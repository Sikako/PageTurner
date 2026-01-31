# PageTurner - 電子書閱讀器與 Garmin 手錶藍牙遠程控制系統

PageTurner 是一個跨平台遠程控制系統，可以讓您透過 Android 手機和 Garmin 手錶來控制電子書閱讀器（特別是 bigme b751c）的翻頁功能。

## 系統架構

```
┌─────────────────┐
│  Garmin Watch   │
│  (G2 Descent)   │
└────────┬────────┘
         │ Bluetooth
         │
┌────────▼────────┐      ┌──────────────────┐
│  Android App    │◄────►│   E-Reader       │
│  (PageTurner)   │ HID  │  (bigme b751c)   │
└─────────────────┘      └──────────────────┘
```

本系統由三個主要組件組成：
1. **Android App** - 核心控制應用，作為 HID 設備模擬鍵盤
2. **Garmin Watch App** - 手錶端控制介面（待開發）
3. **E-Reader** - 目標閱讀設備

## 功能特色

### Android App
- 🔍 **HID 藍牙廣播**: 模擬 HID 鍵盤設備，接受閱讀器連接
- 📱 **裝置連接管理**: 
  - 顯示所有已連接的設備清單
  - 選擇目標閱讀器進行控制
  - 即時顯示連接狀態
- 🎚️ **音量鍵控制**: 將音量鍵轉換為翻頁指令
  - 音量加：下一頁（右箭頭）
  - 音量減：上一頁（左箭頭）
- 📊 **系統日誌**: 
  - 即時記錄所有操作
  - 支援按等級篩選（資訊、成功、警告、錯誤）
  - 可匯出日誌供除錯使用
- 🔄 **背景運行**: 
  - 前台服務保持藍牙連接
  - 螢幕關閉時仍可正常運作
  - 低功耗模式運行
- 🧪 **手動測試**: 提供手動翻頁測試功能
- 📡 **狀態監控**: 
  - 電子書閱讀器連接狀態
  - Garmin 手錶連接狀態（預留）

### Garmin Watch App（規劃中）
- ⌚ **實體按鍵控制**: 使用手錶按鍵控制翻頁
- 📲 **觸控螢幕介面**: 螢幕上/下按鈕
- 🔗 **與手機通訊**: 透過藍牙與 Android App 通訊

## 技術棧

### Android App
- **框架**: React Native 0.80.0 with TypeScript
- **藍牙**: 
  - 原生 Android Bluetooth API (HID over GATT)
  - react-native-permissions for 權限管理
- **導航**: React Navigation 7 (Bottom Tabs)
- **圖標**: react-native-vector-icons
- **原生模組**:
  - HidPeripheralModule (Kotlin) - HID 設備模擬
  - ForegroundServiceModule (Kotlin) - 背景服務管理

### Garmin Watch App（待開發）
- **SDK**: Garmin Connect IQ SDK
- **語言**: Monkey C
- **通訊協議**: Garmin Connect Mobile App Communication

## 安裝與設置

### 前置要求

1. 已完成 [React Native 開發環境設置](https://reactnative.dev/docs/set-up-your-environment)
2. Android Studio（用於 Android 開發）
3. Node.js >= 18
4. JDK 17

### 步驟 1: 安裝依賴

```bash
npm install
```

### 步驟 2: Android 設置

確保您的 Android 設備：
- Android 8.0 或更高版本
- 支援 Bluetooth 5.0 和 BLE
- 支援 HID over GATT 協議

### 步驟 3: 啟動 Metro

```bash
npm start
```

### 步驟 4: 運行應用

在 Metro 運行的情況下，打開新的終端窗口：

#### Android

```bash
npm run android
```

或使用 Android Studio 打開 `android` 資料夾並運行。

## 使用說明

### 首次設置

#### 1. 啟動應用並授予權限
首次啟動時，應用會請求以下權限：
- 藍牙廣播權限（Android 12+）
- 藍牙連接權限（Android 12+）
- 位置權限（藍牙掃描需要，Android 11-）

#### 2. 連接電子書閱讀器
1. 確保您的電子書閱讀器（bigme b751c）已開啟藍牙
2. 在閱讀器上搜尋藍牙設備
3. 找到您的 Android 手機名稱並連接
4. 連接成功後，閱讀器會出現在 App 的「已連線的裝置」列表中

#### 3. 設定目標裝置
1. 在裝置列表中，點擊您的閱讀器旁邊的「啟用控制」按鈕
2. 頂部狀態列會顯示閱讀器已連接
3. 現在可以開始控制翻頁

### 日常使用

#### 音量鍵控制
1. 在控制面板中點擊「啟用音量鍵控制」
2. 使用音量鍵進行翻頁：
   - **音量加鍵**：下一頁
   - **音量減鍵**：上一頁
3. 所有操作會記錄在日誌頁面

#### 手動測試
在控制面板中使用「上一頁」和「下一頁」按鈕來手動測試翻頁功能。

#### 查看日誌
1. 切換到「日誌」標籤
2. 可以按等級篩選日誌（全部、資訊、成功、警告、錯誤）
3. 點擊分享圖標可匯出日誌
4. 點擊刪除圖標可清除所有日誌

#### 背景運行
- 應用啟動後會自動建立前台服務
- 您可以按下 Home 鍵將應用放到背景
- 即使螢幕關閉，藍牙連接和音量鍵控制仍然有效
- 通知欄會顯示「PageTurner 正在運行」

### Garmin 手錶整合（開發中）
目前 Garmin 手錶連接功能尚在開發中。完成後將支援：
1. 在手錶上安裝 PageTurner Connect IQ App
2. 透過手錶與手機配對
3. 使用手錶按鍵或觸控螢幕控制翻頁

## 權限要求

### Android
| 權限 | 用途 | 必要性 |
|------|------|--------|
| BLUETOOTH | 基本藍牙功能 | 必須 |
| BLUETOOTH_ADMIN | 藍牙管理 | 必須 |
| BLUETOOTH_ADVERTISE | HID 設備廣播 (Android 12+) | 必須 |
| BLUETOOTH_CONNECT | 藍牙連接 (Android 12+) | 必須 |
| BLUETOOTH_SCAN | 藍牙掃描 (Android 12+) | 可選 |
| ACCESS_FINE_LOCATION | 藍牙掃描需要 (Android 11-) | Android 11- 必須 |
| FOREGROUND_SERVICE | 背景運行 | 必須 |
| WAKE_LOCK | 保持藍牙連接 | 建議 |
| MODIFY_AUDIO_SETTINGS | 音量鍵控制 | 可選 |

## 技術細節

### HID over GATT 協議
PageTurner 使用標準的 HID over GATT (HOGP) 協議：

```
服務 UUID: 00001812-0000-1000-8000-00805f9b34fb (HID Service)
特徵值:
  - Report Map: 00002a4b-0000-1000-8000-00805f9b34fb
  - Report:     00002a4d-0000-1000-8000-00805f9b34fb
  - CCCD:       00002902-0000-1000-8000-00805f9b34fb
```

### 鍵盤報告格式
```
報告格式 (8 bytes):
[0] 修飾鍵 (Modifier Keys)
[1] 保留
[2-7] 按鍵碼 (Key Codes)

翻頁鍵碼:
- 左箭頭 (上一頁): 0x50
- 右箭頭 (下一頁): 0x4F
```

### 報告映射 (Report Map)
應用使用標準 USB HID 鍵盤報告描述符，支援：
- 8個修飾鍵 (Ctrl, Shift, Alt, GUI)
- 6個同時按鍵
- 5個 LED 輸出（大寫鎖定等）

詳見 `HidPeripheralModule.kt` 中的 `REPORT_MAP` 定義。

### 背景服務架構
```kotlin
ForegroundService
├── 建立通知通道
├── 顯示前台通知
└── START_STICKY 模式（系統資源許可時自動重啟）
```

### 日誌系統
```typescript
LogService
├── 最多保留 500 條記錄
├── 支援 4 個等級 (INFO, SUCCESS, WARNING, ERROR)
├── 即時通知訂閱者
└── 可匯出為文字格式
```

## 專案結構

```
PageTurner/
├── android/
│   └── app/
│       └── src/main/java/com/pageturner/
│           ├── hid/                    # HID 相關模組
│           │   ├── HidPeripheralModule.kt
│           │   └── HidPeripheralPackage.kt
│           ├── service/                # 服務模組
│           │   ├── ForegroundService.kt
│           │   ├── ForegroundServiceModule.kt
│           │   └── ForegroundServicePackage.kt
│           ├── MainActivity.kt
│           └── MainApplication.kt
├── src/
│   ├── components/                 # UI 組件
│   │   ├── ControlPanel.tsx       # 控制面板
│   │   └── ConnectionStatusBar.tsx # 連接狀態列
│   ├── screens/                    # 頁面
│   │   ├── MainScreen.tsx         # 主畫面
│   │   └── LogScreen.tsx          # 日誌頁面
│   ├── services/                   # 服務層
│   │   ├── HIDPeripheralService.ts # HID 服務封裝
│   │   └── LogService.ts          # 日誌服務
│   └── types/                      # TypeScript 類型定義
└── App.tsx                         # 應用入口
```

## 故障排除

### 常見問題

#### 1. 無法連接到閱讀器
**症狀**: 閱讀器找不到手機或無法連接

**解決方案**:
- 確保藍牙已開啟
- 檢查所有權限是否已授予
- 嘗試重新啟動應用
- 在 Android 設置中清除藍牙快取
- 確保手機和閱讀器距離在 10 米內

#### 2. 連接成功但無法翻頁
**症狀**: 裝置已連接但按鍵無反應

**解決方案**:
- 確保已從列表中「啟用控制」該裝置
- 檢查日誌頁面是否有錯誤訊息
- 使用手動測試按鈕確認功能
- 確認閱讀器支援 HID over GATT
- 確認閱讀器已訂閱通知（檢查 logcat）

#### 3. 音量鍵無法控制翻頁
**症狀**: 音量鍵仍然控制音量

**解決方案**:
- 確保已點擊「啟用音量鍵控制」
- 確保已選擇目標裝置
- 檢查音量修改權限是否授予
- 重新啟動應用

#### 4. 背景運行失效
**症狀**: 應用切到背景後停止工作

**解決方案**:
- 檢查前台服務通知是否顯示
- 在系統設置中關閉電池優化
- 將應用加入白名單
- 確保未被系統清理器終止

#### 5. Android 12+ 權限問題
**症狀**: 無法取得藍牙權限

**解決方案**:
- 手動到設置 → 應用 → PageTurner → 權限
- 授予所有藍牙相關權限
- 位置權限可以拒絕（使用 neverForLocation 標記）

### 除錯工具

#### 查看日誌
1. 使用應用內建的日誌頁面
2. 使用 Android Logcat:
```bash
adb logcat | grep -E "HidPeripheralModule|ForegroundService|PageTurner"
```

#### 檢查藍牙狀態
```bash
adb shell dumpsys bluetooth_manager
```

#### 測試 HID 連接
1. 使用手動測試按鈕
2. 觀察日誌中的按鍵發送記錄
3. 檢查閱讀器是否接收到按鍵

## 已知限制

1. **閱讀器相容性**: 
   - 主要針對 bigme b751c 開發
   - 其他閱讀器可能需要調整 HID 報告格式

2. **音量鍵控制**:
   - 部分 Android 系統可能限制音量鍵攔截
   - 某些耳機可能干擾音量鍵事件

3. **iOS 支援**:
   - 目前僅支援 Android
   - iOS 對 HID 外設模式支援有限

4. **Garmin 整合**:
   - Garmin 手錶整合功能尚在開發中
   - 需要額外的 Connect IQ 應用開發

5. **電池消耗**:
   - 前台服務會持續消耗電力
   - 建議在不使用時停用音量鍵控制

## 未來規劃

- [ ] 開發 Garmin Connect IQ App
- [ ] 實作手錶與手機通訊
- [ ] 支援更多閱讀器型號
- [ ] 新增設定頁面（自訂按鍵映射、通知樣式等）
- [ ] 改善電池優化
- [ ] 新增統計資料（翻頁次數、使用時長等）
- [ ] 支援手勢控制
- [ ] 雲端同步設定

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

### 開發指南
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 聯絡資訊

如有問題或建議，請創建 GitHub Issue。

## 致謝

- React Native 社群
- Garmin Connect IQ 開發者
- bigme 電子書使用者社群
