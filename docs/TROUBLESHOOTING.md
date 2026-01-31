# PageTurner 故障排除指南

## 目錄

1. [連接問題](#連接問題)
2. [翻頁功能問題](#翻頁功能問題)
3. [背景運行問題](#背景運行問題)
4. [權限問題](#權限問題)
5. [效能問題](#效能問題)
6. [其他常見問題](#其他常見問題)

## 連接問題

### 問題：閱讀器找不到手機

**可能原因**：
- 藍牙未開啟
- HID 服務未啟動
- 權限未授予

**解決步驟**：

1. **檢查藍牙狀態**
   ```bash
   # 使用 adb 檢查
   adb shell settings get global bluetooth_on
   # 應該回傳 1
   ```

2. **檢查應用權限**
   ```bash
   adb shell dumpsys package com.pageturner | grep permission
   ```
   
   確認以下權限已授予：
   - `android.permission.BLUETOOTH_ADVERTISE`
   - `android.permission.BLUETOOTH_CONNECT`

3. **重新啟動 HID 服務**
   - 完全關閉應用（從最近使用清單中移除）
   - 重新開啟應用
   - 檢查日誌頁面是否顯示「HID 廣播服務已啟動」

4. **檢查 logcat**
   ```bash
   adb logcat | grep HidPeripheralModule
   ```
   
   查找以下訊息：
   - "GATT server opened"
   - "HID service added"
   - "Advertising started"

**如果問題持續**：
- 重新啟動手機藍牙
- 清除藍牙快取：設定 → 應用程式 → 藍牙 → 儲存空間 → 清除快取
- 重新安裝應用

### 問題：連接後立即斷線

**可能原因**：
- 藍牙訊號干擾
- 距離過遠
- 配對問題

**解決步驟**：

1. **檢查距離**
   - 確保手機和閱讀器在 5 米內
   - 避免有牆壁或金屬物體阻擋

2. **檢查配對狀態**
   ```bash
   adb shell dumpsys bluetooth_manager | grep -A 10 "bonded"
   ```

3. **清除配對並重新配對**
   - 在閱讀器上忘記手機
   - 在手機藍牙設定中忘記閱讀器
   - 重新連接

4. **檢查日誌**
   - 切換到日誌頁面
   - 查找 "裝置已斷線" 訊息
   - 注意斷線時間和模式

### 問題：多個裝置連接，但無法選擇目標

**可能原因**：
- UI 狀態未更新
- 目標裝置設定失敗

**解決步驟**：

1. **確認裝置出現在列表**
   - 檢查「已連線的裝置」列表
   - 確認閱讀器名稱正確顯示

2. **嘗試設定目標**
   - 點擊「啟用控制」按鈕
   - 檢查是否顯示「目標已設定」提示

3. **檢查日誌**
   ```
   查找：
   - "目標裝置已設定為: [裝置名稱]"
   - 如果出現錯誤，查看錯誤訊息
   ```

4. **檢查 logcat**
   ```bash
   adb logcat | grep setTargetDevice
   ```

## 翻頁功能問題

### 問題：連接成功但無法翻頁

**可能原因**：
- 未設定目標裝置
- CCCD 未啟用
- HID 報告格式不相容
- 閱讀器不支援 HID

**解決步驟**：

1. **確認目標裝置**
   - 檢查狀態列是否顯示閱讀器已連接
   - 確認裝置旁邊顯示「已啟用」

2. **測試手動翻頁**
   - 使用控制面板的「上一頁」和「下一頁」按鈕
   - 如果手動翻頁有效，問題可能在音量鍵控制

3. **檢查 CCCD 狀態**
   ```bash
   adb logcat | grep "subscribed to notifications"
   ```
   
   應該看到：
   - "Device [name] subscribed to notifications"

4. **檢查 HID 報告發送**
   ```bash
   adb logcat -v time | grep sendKeyPress
   ```
   
   每次翻頁應該看到：
   - Key press 事件
   - 50ms 後的 key release 事件

5. **測試閱讀器 HID 相容性**
   - 使用其他 HID 裝置（如藍牙鍵盤）測試閱讀器
   - 確認閱讀器支援箭頭鍵控制

**進階除錯**：

1. **檢查報告格式**
   在 `HidPeripheralModule.kt` 中加入日誌：
   ```kotlin
   fun sendKeyPress(keyCode: Int, promise: Promise) {
       val report = ByteArray(8) { 0 }
       report[2] = keyCode.toByte()
       Log.d("HidPeripheralModule", "Sending report: ${report.joinToString()}")
       // ...
   }
   ```

2. **嘗試不同的按鍵碼**
   ```
   左箭頭: 0x50
   右箭頭: 0x4F
   Page Up: 0x4B
   Page Down: 0x4E
   ```

### 問題：音量鍵無法控制翻頁

**可能原因**：
- 音量鍵監聽未啟用
- 音量鍵事件被系統攔截
- 權限不足

**解決步驟**：

1. **確認音量鍵控制已啟用**
   - 檢查控制面板是否顯示「停用音量鍵控制」
   - 圖示應為綠色音量圖示

2. **檢查日誌**
   - 按下音量鍵時查看日誌頁面
   - 應該看到「偵測到音量鍵: 上一頁/下一頁」

3. **檢查系統音量**
   - 某些系統在音量達到最大/最小時會阻止事件
   - 將音量調整到中間值

4. **檢查耳機**
   - 如果連接了耳機，耳機按鍵可能干擾
   - 斷開耳機再測試

**注意**：音量鍵控制功能目前需要額外實作，如果未實作，此功能將無法使用。

### 問題：翻頁延遲很大

**可能原因**：
- 藍牙連接品質差
- 閱讀器處理慢
- 報告發送間隔不當

**解決步驟**：

1. **改善連接品質**
   - 縮短距離
   - 減少干擾源（WiFi 路由器、微波爐等）

2. **調整按鍵釋放延遲**
   在 `HidPeripheralModule.kt` 中：
   ```kotlin
   Handler(Looper.getMainLooper()).postDelayed({
       // 從 50ms 調整為 100ms
   }, 100)
   ```

3. **檢查閱讀器效能**
   - 某些閱讀器處理輸入較慢
   - 考慮增加延遲以確保可靠性

## 背景運行問題

### 問題：應用切到背景後停止工作

**可能原因**：
- 前台服務未啟動
- 系統電池優化
- OEM 系統限制
- 應用被清理器終止

**解決步驟**：

1. **檢查前台服務**
   - 下拉通知欄
   - 確認看到「PageTurner 正在運行」通知

2. **檢查服務狀態**
   ```bash
   adb shell dumpsys activity services | grep ForegroundService
   ```

3. **關閉電池優化**
   
   **小米/紅米**：
   - 設定 → 電池與效能 → 省電優化 → PageTurner → 無限制
   - 設定 → 電池與效能 → 應用程式電池節省模式 → PageTurner → 無限制
   - 安全中心 → 權限 → 自啟動管理 → PageTurner → 允許
   
   **華為**：
   - 設定 → 電池 → 應用程式耗電管理 → PageTurner → 允許
   - 設定 → 應用程式 → 應用程式啟動管理 → PageTurner → 手動管理 → 全部允許
   
   **OPPO/Realme**：
   - 設定 → 電池 → 省電模式 → PageTurner → 允許背景執行
   
   **Vivo**：
   - 設定 → 電池 → 高耗電應用 → PageTurner → 允許背景執行
   
   **三星**：
   - 設定 → 裝置維護 → 電池 → 應用程式電源管理 → PageTurner → 關閉優化
   
   **原生 Android**：
   - 設定 → 應用程式 → PageTurner → 電池 → 電池優化 → 不優化

4. **防止被清理器終止**
   - 將 PageTurner 加入安全清單
   - 最近使用中鎖定應用

5. **檢查日誌**
   ```bash
   adb logcat | grep "ForegroundService"
   ```
   
   查找：
   - "onCreate" - 服務建立
   - "onStartCommand" - 服務啟動
   - "onDestroy" - 服務終止（不應該看到）

### 問題：螢幕關閉後藍牙斷線

**可能原因**：
- 系統省電模式
- 藍牙掃描被停止

**解決步驟**：

1. **檢查省電模式**
   - 關閉省電模式或將 PageTurner 加入白名單

2. **使用 Wake Lock（待實作）**
   - 在 `ForegroundService.kt` 中加入 Wake Lock
   ```kotlin
   private fun acquireWakeLock() {
       val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
       wakeLock = powerManager.newWakeLock(
           PowerManager.PARTIAL_WAKE_LOCK,
           "PageTurner::ServiceLock"
       )
       wakeLock?.acquire(10*60*1000L)
   }
   ```

3. **檢查藍牙設定**
   - 設定 → 藍牙 → 進階 → 確保沒有省電選項開啟

## 權限問題

### 問題：Android 12+ 權限請求失敗

**可能原因**：
- 權限聲明不正確
- 用戶拒絕權限
- 系統限制

**解決步驟**：

1. **手動授予權限**
   - 設定 → 應用程式 → PageTurner → 權限
   - 授予所有藍牙相關權限

2. **檢查 manifest**
   確認包含：
   ```xml
   <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
   <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
   ```

3. **檢查權限狀態**
   ```bash
   adb shell dumpsys package com.pageturner | grep -A 5 "granted=true"
   ```

4. **重新安裝應用**
   ```bash
   adb uninstall com.pageturner
   npm run android
   ```

### 問題：位置權限被拒絕（Android 11-）

**解決步驟**：

1. **說明為何需要**
   - 向用戶解釋 BLE 掃描需要位置權限
   - 應用不會實際使用位置資料

2. **手動授予**
   - 設定 → 應用程式 → PageTurner → 權限 → 位置 → 允許

3. **注意**：Android 12+ 不需要位置權限（使用 neverForLocation 標記）

## 效能問題

### 問題：應用卡頓或ANR

**可能原因**：
- UI 執行緒阻塞
- 記憶體洩漏
- 日誌過多

**解決步驟**：

1. **清除日誌**
   - 切換到日誌頁面
   - 點擊刪除圖示清除所有日誌

2. **檢查記憶體使用**
   ```bash
   adb shell dumpsys meminfo com.pageturner
   ```

3. **檢查 CPU 使用**
   ```bash
   adb shell top | grep pageturner
   ```

4. **檢查是否有 ANR**
   ```bash
   adb shell ls /data/anr/
   adb pull /data/anr/traces.txt
   ```

### 問題：電池消耗過快

**可能原因**：
- 前台服務持續運行
- 藍牙廣播功率過高
- 頻繁的日誌寫入

**解決步驟**：

1. **檢查電池統計**
   - 設定 → 電池 → 查看 PageTurner 使用量

2. **優化建議**
   - 不使用時停用音量鍵控制
   - 減少日誌記錄等級
   - 考慮降低廣播功率（修改 `AdvertiseSettings`）

3. **監控電池消耗**
   ```bash
   adb shell dumpsys batterystats | grep com.pageturner
   ```

## 其他常見問題

### 問題：日誌無法匯出

**解決步驟**：

1. **檢查儲存權限**
   - Android 13+ 不需要儲存權限
   - Android 12- 可能需要授予儲存權限

2. **使用分享功能**
   - 點擊分享圖示
   - 選擇分享到其他應用（如 Gmail、Telegram 等）

3. **手動複製**
   - 在日誌頁面截圖
   - 或使用 adb logcat 擷取

### 問題：應用閃退

**解決步驟**：

1. **查看 crash log**
   ```bash
   adb logcat | grep -E "(AndroidRuntime|FATAL)"
   ```

2. **檢查常見錯誤**
   - NullPointerException
   - SecurityException (權限問題)
   - IllegalStateException

3. **重新安裝**
   ```bash
   adb uninstall com.pageturner
   npm run android
   ```

4. **回報問題**
   - 到 GitHub Issues 回報
   - 附上 crash log 和重現步驟

### 問題：Garmin 手錶無法連接（開發中功能）

目前 Garmin 整合功能尚在開發中，請參考 `docs/GARMIN_DEVELOPMENT.md` 了解開發進度。

## 取得協助

### 收集除錯資訊

當需要回報問題時，請收集以下資訊：

1. **裝置資訊**
   ```bash
   adb shell getprop | grep -E "(model|version)"
   ```

2. **應用日誌**
   - 從日誌頁面匯出
   - 或使用：
   ```bash
   adb logcat -d > pageturner-log.txt
   ```

3. **系統日誌**
   ```bash
   adb logcat -b all -d > system-log.txt
   ```

4. **藍牙狀態**
   ```bash
   adb shell dumpsys bluetooth_manager > bluetooth-state.txt
   ```

### 提交 Issue

在 GitHub 上提交 Issue 時，請包含：

1. 問題描述
2. 重現步驟
3. 預期行為
4. 實際行為
5. 裝置資訊
6. 相關日誌

範本：
```markdown
**問題描述**
簡短描述問題

**重現步驟**
1. 開啟應用
2. 點擊...
3. 看到錯誤...

**預期行為**
應該要...

**實際行為**
但實際上...

**環境**
- 裝置型號: 
- Android 版本: 
- PageTurner 版本: 
- 閱讀器型號: 

**日誌**
```附上相關日誌```
```

### 聯絡方式

- GitHub Issues: https://github.com/Sikako/PageTurner/issues
- 討論區: https://github.com/Sikako/PageTurner/discussions

## 常用除錯指令

```bash
# 檢查應用是否運行
adb shell ps | grep pageturner

# 檢查服務狀態
adb shell dumpsys activity services com.pageturner

# 檢查藍牙狀態
adb shell dumpsys bluetooth_manager

# 即時查看日誌
adb logcat -v time | grep -E "HidPeripheral|ForegroundService|PageTurner"

# 清除應用資料
adb shell pm clear com.pageturner

# 重新安裝應用
adb uninstall com.pageturner && npm run android

# 截圖
adb shell screencap /sdcard/screen.png && adb pull /sdcard/screen.png

# 錄影（用於展示問題）
adb shell screenrecord /sdcard/demo.mp4
# 按 Ctrl+C 停止
adb pull /sdcard/demo.mp4
```

## 預防性維護

### 定期檢查

1. **每週**
   - 清除日誌（如果使用頻繁）
   - 檢查應用更新

2. **每月**
   - 檢查藍牙配對列表，移除不需要的裝置
   - 檢查電池使用情況

3. **重大更新後**
   - 檢查權限是否正確
   - 測試所有功能
   - 查看 CHANGELOG

### 最佳實踐

1. **連接管理**
   - 不使用時取消目標裝置
   - 避免同時連接太多裝置

2. **電池管理**
   - 不使用時停用音量鍵控制
   - 閱讀完成後可關閉應用

3. **日誌管理**
   - 定期清除日誌
   - 僅在需要除錯時查看

4. **更新維護**
   - 保持應用程式最新版本
   - 關注 GitHub Releases

## 總結

大多數問題都可以透過以下步驟解決：

1. 檢查權限
2. 檢查連接狀態
3. 查看日誌
4. 重新啟動服務
5. 清除快取/重新安裝

如果問題依然存在，請收集詳細資訊並在 GitHub 上回報。
