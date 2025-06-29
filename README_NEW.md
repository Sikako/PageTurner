# PageTurner - 電子書閱讀器藍牙遠程控制App

PageTurner 是一個跨平台手機應用程序，可以通過藍牙連接到電子書閱讀器（特別是 bigme b751c），並使用手機音量鍵來控制電子書翻頁。

## 功能特色

- 🔍 **藍牙裝置掃描**: 自動掃描並顯示可用的藍牙裝置
- 📱 **裝置連接管理**: 輕鬆連接和斷開電子書閱讀器
- 🎚️ **音量鍵控制**: 將音量鍵轉換為翻頁指令
  - 音量加：下一頁
  - 音量減：上一頁
- 🧪 **手動測試**: 提供手動翻頁測試功能
- 🔄 **跨平台支援**: 支援 iOS 和 Android

## 技術棧

- **框架**: React Native 0.80.0 with TypeScript
- **藍牙**: react-native-ble-plx
- **導航**: React Navigation 6
- **音量控制**: react-native-system-setting
- **圖標**: react-native-vector-icons

## 安裝與設置

### 前置要求

確保已完成 [React Native 開發環境設置](https://reactnative.dev/docs/set-up-your-environment)。

### 步驟 1: 安裝依賴

```bash
npm install
```

### 步驟 2: iOS 設置 (僅限 iOS)

```bash
cd ios && pod install && cd ..
```

### 步驟 3: 啟動 Metro

```bash
npm start
```

### 步驟 4: 運行應用

在 Metro 運行的情況下，打開新的終端窗口，使用以下命令之一來構建和運行應用：

#### Android

```bash
npm run android
```

#### iOS

```bash
npm run ios
```

## 使用說明

### 1. 藍牙連接
1. 確保您的電子書閱讀器（bigme b751c）已開啟並設為可發現模式
2. 在 App 的「裝置」標籤中點擊「掃描裝置」
3. 從列表中選擇您的電子書閱讀器
4. 等待連接成功提示

### 2. 音量鍵控制
1. 連接成功後，切換到「控制」標籤
2. 點擊「啟用音量鍵控制」
3. 現在可以使用音量鍵進行翻頁：
   - 音量加鍵：下一頁
   - 音量減鍵：上一頁

### 3. 手動測試
在控制面板中，您也可以使用「上一頁」和「下一頁」按鈕來手動測試翻頁功能。

## 權限要求

### Android
- 藍牙掃描和連接權限
- 位置權限（藍牙掃描需要）
- 音量修改權限

### iOS
- 藍牙使用權限
- 音量控制權限

## 故障排除

### 常見問題

1. **無法掃描到裝置**
   - 確保藍牙已開啟
   - 確保電子書閱讀器處於可發現模式
   - 檢查應用權限是否已授予

2. **連接失敗**
   - 嘗試重新啟動藍牙
   - 確保裝置距離不超過10米
   - 重新啟動應用

3. **音量鍵無法控制翻頁**
   - 確保已啟用音量鍵控制
   - 檢查藍牙連接是否正常
   - 嘗試手動測試功能

## 開發

本專案使用 TypeScript 開發，主要結構如下：

```
src/
├── components/     # UI 組件
├── screens/        # 屏幕頁面
├── services/       # 服務層（藍牙、音量控制）
└── types/          # TypeScript 類型定義
```

## 技術細節

- **藍牙協議**: 使用 HID (Human Interface Device) 協議發送鍵盤信號
- **音量監聽**: 攔截系統音量變化事件並轉換為翻頁指令
- **跨平台兼容**: 處理 iOS 和 Android 的差異

## 已知限制

- bigme b751c 的具體 HID 協議可能需要根據實際裝置進行調整
- iOS 的音量控制 API 限制可能影響功能
- 需要設備支援 HID over GATT 協議

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 聯絡資訊

如有問題或建議，請創建 GitHub Issue。
