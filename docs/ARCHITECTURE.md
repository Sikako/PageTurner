# PageTurner 技術架構文件

## 系統概述

PageTurner 是一個分散式的電子書遠程控制系統，由多個組件協同工作：

```
┌─────────────────────────────────────────────────────────┐
│                    整體系統架構                          │
└─────────────────────────────────────────────────────────┘

                 ┌──────────────────┐
                 │  Garmin Watch    │
                 │  Connect IQ App  │
                 │  (開發中)         │
                 └────────┬─────────┘
                          │
                          │ Bluetooth LE
                          │ (App Communication)
                          │
        ┌─────────────────▼──────────────────┐
        │     Android Application            │
        │      (PageTurner)                  │
        │                                    │
        │  ┌──────────────────────────────┐ │
        │  │  React Native Layer          │ │
        │  │  ├─ MainScreen               │ │
        │  │  ├─ LogScreen                │ │
        │  │  ├─ ConnectionStatusBar      │ │
        │  │  └─ ControlPanel             │ │
        │  └──────────────┬───────────────┘ │
        │                 │                  │
        │  ┌──────────────▼───────────────┐ │
        │  │  Service Layer               │ │
        │  │  ├─ HIDPeripheralService     │ │
        │  │  └─ LogService               │ │
        │  └──────────────┬───────────────┘ │
        │                 │                  │
        │  ┌──────────────▼───────────────┐ │
        │  │  Native Modules (Kotlin)     │ │
        │  │  ├─ HidPeripheralModule      │ │
        │  │  └─ ForegroundServiceModule  │ │
        │  └──────────────┬───────────────┘ │
        │                 │                  │
        │  ┌──────────────▼───────────────┐ │
        │  │  Android Services            │ │
        │  │  └─ ForegroundService        │ │
        │  └──────────────────────────────┘ │
        └────────────┬───────────────────────┘
                     │
                     │ Bluetooth LE
                     │ (HID over GATT)
                     │
        ┌────────────▼───────────────────┐
        │     E-Reader Device            │
        │     (bigme b751c)              │
        │                                │
        │  - HID over GATT Client        │
        │  - Keyboard Input Processing   │
        └────────────────────────────────┘
```

## 核心組件

### 1. React Native 層

#### MainScreen
**職責**: 主控制介面，管理裝置連接和控制邏輯

**主要功能**:
- 顯示已連接裝置列表
- 選擇目標控制裝置
- 啟用/停用音量鍵控制
- 手動翻頁測試

**狀態管理**:
```typescript
interface MainScreenState {
  connectedDevices: ConnectedDevice[];  // 所有已連接裝置
  targetDevice: ConnectedDevice | null; // 當前控制目標
  isVolumeKeyListening: boolean;        // 音量鍵監聽狀態
  garminConnected: boolean;             // Garmin 連接狀態（預留）
}
```

**事件處理**:
- `onHidConnectionStateChanged`: 處理 HID 連接狀態變化
- `onVolumeKeyPress`: 處理音量鍵事件

#### LogScreen
**職責**: 系統日誌顯示與管理

**主要功能**:
- 即時顯示日誌條目
- 按等級篩選日誌
- 匯出日誌功能
- 清除日誌功能

#### ConnectionStatusBar
**職責**: 顯示連接狀態摘要

**顯示資訊**:
- 電子書閱讀器連接狀態
- Garmin 手錶連接狀態（預留）

### 2. 服務層

#### HIDPeripheralService
**職責**: 封裝 HID 藍牙外設功能

**核心方法**:
```typescript
class HIDPeripheralService {
  // 開始 HID 廣播
  async startAdvertising(): Promise<void>
  
  // 停止 HID 廣播
  async stopAdvertising(): Promise<void>
  
  // 設定目標裝置
  async setTargetDevice(address: string): Promise<void>
  
  // 發送按鍵
  async sendKeyPress(keyCode: number): Promise<void>
}
```

**生命週期**:
1. 檢查並請求藍牙權限
2. 啟動原生 HID 模組
3. 開始藍牙廣播
4. 等待裝置連接
5. 接收並處理連接事件

#### LogService
**職責**: 集中式日誌管理

**核心方法**:
```typescript
class LogService {
  // 記錄日誌
  log(level: LogLevel, category: string, message: string): void
  
  // 便捷方法
  info(category: string, message: string): void
  success(category: string, message: string): void
  warning(category: string, message: string): void
  error(category: string, message: string): void
  
  // 訂閱日誌更新
  subscribe(listener: (logs: LogEntry[]) => void): () => void
  
  // 匯出日誌
  exportAsText(): string
}
```

**資料結構**:
```typescript
interface LogEntry {
  id: string;          // 唯一識別碼
  timestamp: Date;     // 時間戳記
  level: LogLevel;     // 等級
  category: string;    // 分類
  message: string;     // 訊息
}

enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
```

### 3. 原生模組層（Kotlin）

#### HidPeripheralModule
**職責**: 實作 HID over GATT 伺服器

**核心功能**:
```kotlin
class HidPeripheralModule {
  // 啟動 HID 服務
  @ReactMethod
  fun start(promise: Promise)
  
  // 停止 HID 服務
  @ReactMethod
  fun stop()
  
  // 設定目標裝置
  @ReactMethod
  fun setTargetDevice(address: String, promise: Promise)
  
  // 發送按鍵
  @ReactMethod
  fun sendKeyPress(keyCode: Int, promise: Promise)
}
```

**HID 服務結構**:
```
HID Service (UUID: 0x1812)
├─ Report Map Characteristic (UUID: 0x2A4B)
│  └─ 鍵盤報告描述符
├─ Report Characteristic (UUID: 0x2A4D)
│  ├─ READ 屬性
│  ├─ NOTIFY 屬性
│  └─ CCCD Descriptor (UUID: 0x2902)
└─ 其他 HID 特徵值（依需求）
```

**GATT 伺服器回調**:
```kotlin
private val gattServerCallback = object : BluetoothGattServerCallback() {
  override fun onConnectionStateChange(device, status, newState)
  override fun onDescriptorWriteRequest(device, requestId, descriptor, ...)
  override fun onCharacteristicReadRequest(device, requestId, ...)
}
```

#### ForegroundServiceModule
**職責**: 橋接 React Native 與前台服務

**核心功能**:
```kotlin
class ForegroundServiceModule {
  @ReactMethod
  fun startService()
  
  @ReactMethod
  fun stopService()
}
```

### 4. Android 服務層

#### ForegroundService
**職責**: 保持應用在背景運行

**功能實作**:
```kotlin
class ForegroundService : Service() {
  override fun onCreate() {
    createNotificationChannel()
  }
  
  override fun onStartCommand(intent, flags, startId): Int {
    startForeground(NOTIFICATION_ID, createNotification())
    return START_STICKY
  }
}
```

**通知設定**:
- 通知通道 ID: "PageTurnerChannel"
- 重要性: IMPORTANCE_LOW（靜音通知）
- 持續顯示: `setOngoing(true)`
- 點擊動作: 開啟 MainActivity

**生命週期管理**:
- `START_STICKY`: 服務被系統終止後會自動重啟
- 通知必須在 5 秒內顯示（Android 8.0+）

## 資料流程

### 1. 啟動流程

```
User launches app
       │
       ▼
App.tsx initializes
       │
       ▼
MainScreen mounts
       │
       ▼
initialize() called
       │
       ├─► LogService.info("系統", "正在啟動...")
       │
       ▼
HIDPeripheralService.startAdvertising()
       │
       ├─► Check Android version & permissions
       │
       ├─► HidPeripheralModule.start()
       │   │
       │   ├─► Open GATT server
       │   ├─► Add HID service
       │   ├─► Start BLE advertising
       │   └─► Return success
       │
       ├─► ForegroundServiceModule.startService()
       │   │
       │   └─► Start foreground service with notification
       │
       └─► LogService.success("系統", "啟動成功")
```

### 2. 裝置連接流程

```
E-Reader scans for BLE devices
       │
       ▼
E-Reader discovers phone
       │
       ▼
E-Reader initiates connection
       │
       ▼
BluetoothGattServerCallback.onConnectionStateChange()
       │
       ├─► Add device to connectedDevices map
       │
       └─► Send event to React Native
              │
              ▼
       MainScreen receives "onHidConnectionStateChanged"
              │
              ├─► Update connectedDevices state
              │
              └─► LogService.success("藍牙", "裝置已連接")
```

### 3. 翻頁流程

#### 手動翻頁
```
User presses 「下一頁」 button
       │
       ▼
handlePageTurn('right') called
       │
       ├─► Check targetDevice !== null
       │
       ├─► keyCode = 0x4F (右箭頭)
       │
       ├─► LogService.info("翻頁", "發送翻頁指令: 下一頁")
       │
       ▼
HIDPeripheralService.sendKeyPress(0x4F)
       │
       ▼
HidPeripheralModule.sendKeyPress(0x4F)
       │
       ├─► Create HID report: [0, 0, 0x4F, 0, 0, 0, 0, 0]
       │
       ├─► Set characteristic value
       │
       ├─► notifyCharacteristicChanged(targetDevice, ...)
       │   │
       │   └─► E-Reader receives notification
       │       │
       │       └─► Process as keyboard input → Turn page
       │
       └─► After 50ms: Send key release
           │
           └─► Report: [0, 0, 0, 0, 0, 0, 0, 0]
```

#### 音量鍵翻頁
```
User presses Volume Up key
       │
       ▼
System captures volume key event
       │
       ▼
(需要額外實作) Volume key listener
       │
       ▼
Emit "onVolumeKeyPress" event
       │
       ▼
MainScreen volume listener
       │
       ├─► Check isVolumeKeyListening === true
       │
       ├─► direction = 'right' (volume up)
       │
       ├─► LogService.info("音量鍵", "偵測到音量鍵: 下一頁")
       │
       └─► handlePageTurn('right')
           │
           └─► (Same as manual page turn flow)
```

### 4. 日誌流程

```
Any component calls LogService method
       │
       ▼
LogService.log(level, category, message)
       │
       ├─► Create LogEntry
       │   │
       │   └─► id = timestamp + random
       │       timestamp = new Date()
       │       level, category, message
       │
       ├─► Add to logs array (beginning)
       │
       ├─► Trim if > 500 entries
       │
       ├─► Notify all subscribers
       │   │
       │   └─► LogScreen updates display
       │
       └─► Console.log/warn/error
```

## HID 協議詳解

### Report Map 結構

```c
// USB HID Report Descriptor
0x05, 0x01,        // Usage Page (Generic Desktop)
0x09, 0x06,        // Usage (Keyboard)
0xA1, 0x01,        // Collection (Application)

// Modifier Keys (1 byte)
0x05, 0x07,        //   Usage Page (Key Codes)
0x19, 0xE0,        //   Usage Minimum (224) - Left Control
0x29, 0xE7,        //   Usage Maximum (231) - Right GUI
0x15, 0x00,        //   Logical Minimum (0)
0x25, 0x01,        //   Logical Maximum (1)
0x75, 0x01,        //   Report Size (1 bit)
0x95, 0x08,        //   Report Count (8)
0x81, 0x02,        //   Input (Data, Variable, Absolute)

// Reserved byte
0x95, 0x01,        //   Report Count (1)
0x75, 0x08,        //   Report Size (8 bits)
0x81, 0x01,        //   Input (Constant)

// LEDs (Caps Lock, etc.)
0x95, 0x05,        //   Report Count (5)
0x75, 0x01,        //   Report Size (1 bit)
0x05, 0x08,        //   Usage Page (LEDs)
0x19, 0x01,        //   Usage Minimum (1)
0x29, 0x05,        //   Usage Maximum (5)
0x91, 0x02,        //   Output (Data, Variable, Absolute)

// LED padding
0x95, 0x01,        //   Report Count (1)
0x75, 0x03,        //   Report Size (3 bits)
0x91, 0x01,        //   Output (Constant)

// Key array (6 bytes)
0x95, 0x06,        //   Report Count (6)
0x75, 0x08,        //   Report Size (8 bits)
0x15, 0x00,        //   Logical Minimum (0)
0x25, 0x65,        //   Logical Maximum (101)
0x05, 0x07,        //   Usage Page (Key Codes)
0x19, 0x00,        //   Usage Minimum (0)
0x29, 0x65,        //   Usage Maximum (101)
0x81, 0x00,        //   Input (Data, Array)

0xC0               // End Collection
```

### Report 格式

```
Byte 0: Modifier Keys
  Bit 0: Left Control
  Bit 1: Left Shift
  Bit 2: Left Alt
  Bit 3: Left GUI (Windows/Command)
  Bit 4: Right Control
  Bit 5: Right Shift
  Bit 6: Right Alt
  Bit 7: Right GUI

Byte 1: Reserved (always 0)

Bytes 2-7: Key codes (up to 6 simultaneous keys)
  0x00 = No key
  0x04-0x27 = Letters (a-z)
  0x1E-0x27 = Numbers (1-9, 0)
  0x4F = Right Arrow
  0x50 = Left Arrow
  0x51 = Down Arrow
  0x52 = Up Arrow
  ...
```

### 按鍵發送序列

1. **按下按鍵** (Key Press)
   ```
   [0x00, 0x00, 0x4F, 0x00, 0x00, 0x00, 0x00, 0x00]
   ```
   - Byte 2 = 0x4F (右箭頭)

2. **延遲 50ms**
   - 確保閱讀器有時間處理按鍵

3. **釋放按鍵** (Key Release)
   ```
   [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
   ```
   - 所有 bytes 歸零

## 權限管理

### Android 權限矩陣

| 權限 | SDK 版本 | 用途 | 請求時機 |
|------|---------|------|---------|
| BLUETOOTH | < 31 | 基本藍牙 | 安裝時 |
| BLUETOOTH_ADMIN | < 31 | 藍牙管理 | 安裝時 |
| BLUETOOTH_ADVERTISE | >= 31 | BLE 廣播 | 執行時 |
| BLUETOOTH_CONNECT | >= 31 | BLE 連接 | 執行時 |
| BLUETOOTH_SCAN | >= 31 | BLE 掃描 | 執行時（可選） |
| ACCESS_FINE_LOCATION | < 31 | BLE 掃描 | 執行時 |
| FOREGROUND_SERVICE | >= 28 | 前台服務 | 安裝時 |
| WAKE_LOCK | All | 保持喚醒 | 安裝時 |

### 權限請求流程

```typescript
// In HIDPeripheralService.startAdvertising()
if (Platform.OS === 'android' && Platform.Version >= 31) {
  const permissions = await requestMultiple([
    PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  ]);
  
  const allGranted = Object.values(permissions).every(
    status => status === RESULTS.GRANTED
  );
  
  if (!allGranted) {
    // Show error and return
  }
}
```

## 背景運行機制

### 前台服務策略

1. **通知要求**
   - Android 8.0+ 必須顯示前台通知
   - 通知必須在服務啟動後 5 秒內顯示
   - 通知無法被用戶關閉（setOngoing(true)）

2. **服務生命週期**
   ```
   App starts
      │
      ▼
   Start ForegroundService
      │
      ├─► onCreate()
      │   └─► createNotificationChannel()
      │
      ▼
   onStartCommand()
      │
      ├─► createNotification()
      └─► startForeground(NOTIFICATION_ID, notification)
   
   Service runs until stopped or system kills it
   
   If killed and resources available:
      │
      └─► START_STICKY causes restart
   ```

3. **電池優化處理**
   - 用戶需要手動將應用加入電池優化白名單
   - 部分 OEM 系統（小米、華為等）需要額外設定
   - 通知會提醒用戶進行設定

### 喚醒鎖定（待實作）

```kotlin
private var wakeLock: PowerManager.WakeLock? = null

fun acquireWakeLock() {
  val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
  wakeLock = powerManager.newWakeLock(
    PowerManager.PARTIAL_WAKE_LOCK,
    "PageTurner::BluetoothLock"
  )
  wakeLock?.acquire(10*60*1000L) // 10 minutes
}
```

## 效能考量

### 記憶體管理

1. **日誌限制**
   - 最多保留 500 筆記錄
   - 使用 unshift + slice 維護固定大小
   - 避免無限增長

2. **事件監聽器**
   - 組件卸載時移除監聽器
   - 使用 useEffect cleanup

3. **藍牙連接**
   - 維護連接裝置映射表
   - 斷線時清理引用

### 電池消耗

1. **藍牙廣播**
   - 使用 LOW_LATENCY 模式以確保回應
   - 考慮新增省電模式

2. **前台服務**
   - PRIORITY_LOW 通知
   - 不使用時建議停用音量鍵監聽

## 安全性

### 藍牙安全

1. **配對要求**
   - HID over GATT 預設需要配對
   - 使用系統藍牙配對機制

2. **資料加密**
   - BLE 連接自動加密
   - 使用標準 HID 協議

### 權限最小化

1. **位置權限**
   - Android 12+ 使用 neverForLocation 標記
   - 不需要實際位置資料

2. **藍牙掃描**
   - 僅需要 ADVERTISE 和 CONNECT
   - SCAN 權限標記為可選

## 除錯指南

### 啟用詳細日誌

```bash
# Android Logcat
adb logcat -v time | grep -E "HidPeripheralModule|ForegroundService|ReactNative"

# 篩選藍牙
adb logcat -v time | grep -i bluetooth

# 查看系統藍牙狀態
adb shell dumpsys bluetooth_manager
```

### 常見問題檢查清單

1. **連接問題**
   - [ ] 權限已授予
   - [ ] 藍牙已開啟
   - [ ] HID 服務已啟動
   - [ ] GATT 伺服器正在運行
   - [ ] 廣播已開始

2. **翻頁問題**
   - [ ] 目標裝置已設定
   - [ ] CCCD 已啟用
   - [ ] 報告正確發送
   - [ ] 閱讀器支援 HID

3. **背景問題**
   - [ ] 前台服務正在運行
   - [ ] 通知顯示中
   - [ ] 電池優化已關閉
   - [ ] 應用未被清理器終止

## 未來擴展

### Garmin 整合架構

```
┌──────────────────────┐
│   Garmin Watch       │
│   Connect IQ App     │
│                      │
│  ┌────────────────┐  │
│  │ UI Layer       │  │
│  │ - Button View  │  │
│  │ - Status View  │  │
│  └────────┬───────┘  │
│           │          │
│  ┌────────▼───────┐  │
│  │ Communication  │  │
│  │ Module         │  │
│  └────────┬───────┘  │
└───────────┼──────────┘
            │
            │ BLE Communication
            │ (Connect IQ Phone API)
            │
┌───────────▼──────────┐
│  Android App         │
│  Communication       │
│  Receiver            │
└──────────────────────┘
```

### 多裝置支援

未來可支援同時控制多個閱讀器：

```kotlin
private val targetDevices = mutableMapOf<String, BluetoothDevice>()

fun sendKeyPressToAll(keyCode: Int) {
  targetDevices.values.forEach { device ->
    notifyCharacteristicChanged(device, characteristic, false)
  }
}
```

### 自訂按鍵映射

```typescript
interface KeyMapping {
  volumeUp: KeyCode;
  volumeDown: KeyCode;
  // Future: Add more customizable keys
}

enum KeyCode {
  LEFT_ARROW = 0x50,
  RIGHT_ARROW = 0x4F,
  UP_ARROW = 0x52,
  DOWN_ARROW = 0x51,
  PAGE_UP = 0x4B,
  PAGE_DOWN = 0x4E,
  // ... more keys
}
```
