# Garmin ConnectIQ App 開發指南

## 概述

本文件說明如何為 PageTurner 系統開發 Garmin 手錶端應用程式。

## 系統需求

### 硬體需求
- Garmin 手錶（建議：Garmin Descent G2 或其他支援 Connect IQ 的型號）
- 支援藍牙連接的 Android 手機
- 開發用電腦（Windows/Mac/Linux）

### 軟體需求
- Connect IQ SDK 4.0 或更高版本
- Visual Studio Code 或其他支援 Monkey C 的 IDE
- Connect IQ Extension for VS Code
- Garmin Connect Mobile App（測試用）

## 開發環境設置

### 1. 安裝 Connect IQ SDK

```bash
# 下載 SDK
# 訪問：https://developer.garmin.com/connect-iq/sdk/

# 解壓縮到適當位置
# 例如：~/connectiq-sdk-4.0

# 設定環境變數
export CIQ_HOME=~/connectiq-sdk-4.0
export PATH=$PATH:$CIQ_HOME/bin
```

### 2. 安裝 VS Code Extension

1. 在 VS Code 中搜尋 "Monkey C"
2. 安裝 "Monkey C" 擴充功能
3. 重新啟動 VS Code

### 3. 建立專案

```bash
# 使用 Connect IQ CLI 建立專案
monkeyc --create-project PageTurnerWatch
cd PageTurnerWatch
```

## 專案結構

```
PageTurnerWatch/
├── manifest.xml              # 應用程式清單
├── resources/
│   ├── drawables/           # 圖示和圖像
│   ├── layouts/             # UI 佈局
│   ├── menus/               # 選單定義
│   └── strings/             # 字串資源
├── source/
│   ├── PageTurnerApp.mc     # 主應用程式類別
│   ├── PageTurnerView.mc    # 主視圖
│   ├── PageTurnerDelegate.mc # 輸入處理
│   └── Communication.mc      # 藍牙通訊模組
└── monkey.jungle            # 專案配置
```

## 核心功能實作

### 1. 應用程式主類別

```java
// PageTurnerApp.mc
using Toybox.Application as App;
using Toybox.Communications as Comm;

class PageTurnerApp extends App.AppBase {
    
    var view;
    var phoneConnected = false;

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
        // 啟動藍牙連接
        setupCommunication();
    }

    function onStop(state) {
        // 清理連接
        closeCommunication();
    }

    function getInitialView() {
        view = new PageTurnerView();
        return [view, new PageTurnerDelegate()];
    }
    
    function setupCommunication() {
        // 註冊手機連接監聽器
        Comm.registerForPhoneAppMessages(method(:onPhoneMessage));
    }
    
    function onPhoneMessage(msg) {
        // 處理來自手機的訊息
        if (msg.data != null) {
            if (msg.data["status"] != null) {
                phoneConnected = msg.data["status"];
                view.updateConnectionStatus(phoneConnected);
            }
        }
    }
    
    function closeCommunication() {
        // 清理通訊
    }
}
```

### 2. 視圖層

```java
// PageTurnerView.mc
using Toybox.WatchUi as Ui;
using Toybox.Graphics as Gfx;

class PageTurnerView extends Ui.View {

    var phoneConnected = false;
    var eReaderConnected = false;

    function initialize() {
        View.initialize();
    }

    function onLayout(dc) {
        setLayout(Rez.Layouts.MainLayout(dc));
    }

    function onShow() {
    }

    function onUpdate(dc) {
        View.onUpdate(dc);
        
        // 繪製連接狀態
        drawConnectionStatus(dc);
        
        // 繪製按鈕提示
        drawButtonHints(dc);
    }
    
    function drawConnectionStatus(dc) {
        var width = dc.getWidth();
        var height = dc.getHeight();
        
        // 手機連接狀態
        dc.setColor(phoneConnected ? Gfx.COLOR_GREEN : Gfx.COLOR_RED, Gfx.COLOR_TRANSPARENT);
        dc.drawText(width / 2, height / 4, Gfx.FONT_SMALL, 
            phoneConnected ? "手機已連接" : "手機未連接", 
            Gfx.TEXT_JUSTIFY_CENTER);
        
        // 閱讀器連接狀態
        dc.setColor(eReaderConnected ? Gfx.COLOR_GREEN : Gfx.COLOR_RED, Gfx.COLOR_TRANSPARENT);
        dc.drawText(width / 2, height / 4 + 30, Gfx.FONT_SMALL, 
            eReaderConnected ? "閱讀器已連接" : "閱讀器未連接", 
            Gfx.TEXT_JUSTIFY_CENTER);
    }
    
    function drawButtonHints(dc) {
        var width = dc.getWidth();
        var height = dc.getHeight();
        
        // 顯示按鈕功能提示
        dc.setColor(Gfx.COLOR_WHITE, Gfx.COLOR_TRANSPARENT);
        dc.drawText(width / 2, height * 2 / 3, Gfx.FONT_TINY, 
            "UP: 上一頁", 
            Gfx.TEXT_JUSTIFY_CENTER);
        dc.drawText(width / 2, height * 2 / 3 + 20, Gfx.FONT_TINY, 
            "DOWN: 下一頁", 
            Gfx.TEXT_JUSTIFY_CENTER);
    }
    
    function updateConnectionStatus(phoneStatus) {
        phoneConnected = phoneStatus;
        Ui.requestUpdate();
    }
    
    function updateEReaderStatus(readerStatus) {
        eReaderConnected = readerStatus;
        Ui.requestUpdate();
    }
}
```

### 3. 輸入處理

```java
// PageTurnerDelegate.mc
using Toybox.WatchUi as Ui;
using Toybox.Communications as Comm;

class PageTurnerDelegate extends Ui.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }

    function onKey(keyEvent) {
        var key = keyEvent.getKey();
        
        if (key == Ui.KEY_UP) {
            // 上一頁
            sendPageTurnCommand("previous");
            return true;
        } else if (key == Ui.KEY_DOWN) {
            // 下一頁
            sendPageTurnCommand("next");
            return true;
        } else if (key == Ui.KEY_ENTER) {
            // 觸控螢幕點擊
            return onTap(null);
        }
        
        return false;
    }
    
    function onTap(clickEvent) {
        // 處理觸控螢幕點擊
        // 可以實作螢幕上/下區域的翻頁功能
        return true;
    }
    
    function sendPageTurnCommand(direction) {
        // 發送翻頁指令到手機
        var message = {
            "command" => "pageTurn",
            "direction" => direction,
            "timestamp" => Time.now().value()
        };
        
        Comm.transmit(message, null, new CommListener());
    }
}

class CommListener extends Comm.ConnectionListener {
    function initialize() {
        ConnectionListener.initialize();
    }
    
    function onComplete() {
        // 傳送成功
        System.println("Command sent successfully");
    }
    
    function onError() {
        // 傳送失敗
        System.println("Failed to send command");
    }
}
```

### 4. 通訊模組

```java
// Communication.mc
using Toybox.Communications as Comm;

module Communication {

    // 訊息類型定義
    enum {
        MSG_PAGE_TURN,
        MSG_STATUS_REQUEST,
        MSG_STATUS_RESPONSE
    }

    // 發送翻頁指令
    function sendPageTurn(direction) {
        var params = {
            "type" => MSG_PAGE_TURN,
            "direction" => direction
        };
        
        Comm.transmit(params, null, new MessageListener());
    }
    
    // 請求狀態更新
    function requestStatus() {
        var params = {
            "type" => MSG_STATUS_REQUEST
        };
        
        Comm.transmit(params, null, new MessageListener());
    }
    
    class MessageListener extends Comm.ConnectionListener {
        function onComplete() {
            // 成功
        }
        
        function onError() {
            // 失敗
        }
    }
}
```

## Android App 整合

### 在 Android App 中接收 Garmin 訊息

需要在 Android App 中實作 Garmin Connect IQ Phone SDK：

```kotlin
// GarminCommunicationService.kt
import com.garmin.android.connectiq.ConnectIQ
import com.garmin.android.connectiq.IQApp
import com.garmin.android.connectiq.IQDevice

class GarminCommunicationService(private val context: Context) {
    
    private var connectIQ: ConnectIQ? = null
    private var device: IQDevice? = null
    private var app: IQApp? = null
    
    fun initialize() {
        connectIQ = ConnectIQ.getInstance(context, ConnectIQ.IQConnectType.WIRELESS)
        
        connectIQ?.initialize(context, false, object : ConnectIQ.ConnectIQListener {
            override fun onSdkReady() {
                // SDK 準備就緒，開始搜尋裝置
                findDevices()
            }
            
            override fun onInitializeError(status: ConnectIQ.IQSdkErrorStatus) {
                // 初始化失敗
                LogService.error("Garmin", "SDK 初始化失敗: $status")
            }
            
            override fun onSdkShutDown() {
                // SDK 關閉
            }
        })
    }
    
    private fun findDevices() {
        try {
            val devices = connectIQ?.knownDevices ?: emptyList()
            if (devices.isNotEmpty()) {
                device = devices[0]
                registerApp()
            }
        } catch (e: Exception) {
            LogService.error("Garmin", "搜尋裝置失敗: ${e.message}")
        }
    }
    
    private fun registerApp() {
        // PageTurner Watch App 的 UUID（在 manifest.xml 中定義）
        val appId = "YOUR-APP-UUID-HERE"
        
        try {
            app = IQApp(appId)
            
            connectIQ?.registerForAppEvents(device, app, 
                object : ConnectIQ.IQApplicationEventListener {
                    override fun onMessageReceived(
                        device: IQDevice,
                        app: IQApp,
                        message: List<Any>,
                        status: ConnectIQ.IQMessageStatus
                    ) {
                        // 處理來自手錶的訊息
                        handleWatchMessage(message)
                    }
                })
        } catch (e: Exception) {
            LogService.error("Garmin", "註冊應用失敗: ${e.message}")
        }
    }
    
    private fun handleWatchMessage(message: List<Any>) {
        // 解析訊息
        val map = message[0] as? Map<String, Any> ?: return
        
        when (map["type"]) {
            "pageTurn" -> {
                val direction = map["direction"] as? String
                if (direction == "next") {
                    // 發送下一頁指令
                    HIDPeripheralService.sendKeyPress(0x4F)
                } else if (direction == "previous") {
                    // 發送上一頁指令
                    HIDPeripheralService.sendKeyPress(0x50)
                }
                LogService.info("Garmin", "收到翻頁指令: $direction")
            }
            "statusRequest" -> {
                // 發送狀態更新
                sendStatusToWatch()
            }
        }
    }
    
    fun sendStatusToWatch() {
        if (device == null || app == null) return
        
        val status = mapOf(
            "phoneConnected" to true,
            "eReaderConnected" to (targetDevice != null),
            "eReaderName" to (targetDevice?.name ?: "")
        )
        
        try {
            connectIQ?.sendMessage(device, app, status, 
                object : ConnectIQ.IQSendMessageListener {
                    override fun onMessageStatus(
                        device: IQDevice,
                        app: IQApp,
                        status: ConnectIQ.IQMessageStatus
                    ) {
                        if (status == ConnectIQ.IQMessageStatus.SUCCESS) {
                            LogService.success("Garmin", "狀態已發送到手錶")
                        }
                    }
                })
        } catch (e: Exception) {
            LogService.error("Garmin", "發送狀態失敗: ${e.message}")
        }
    }
    
    fun shutdown() {
        try {
            connectIQ?.unregisterForApplicationEvents(device, app)
            connectIQ?.shutdown(context)
        } catch (e: Exception) {
            // Ignore
        }
    }
}
```

### 整合到 MainScreen

```typescript
// 在 MainScreen.tsx 中
import { NativeModules } from 'react-native';
const { GarminCommunicationModule } = NativeModules;

// 在 useEffect 中初始化
useEffect(() => {
  if (Platform.OS === 'android') {
    GarminCommunicationModule?.initialize();
    
    const garminListener = eventEmitter.addListener(
      'onGarminConnectionChanged',
      (event: { connected: boolean }) => {
        setGarminConnected(event.connected);
        LogService.info('Garmin', 
          event.connected ? '手錶已連接' : '手錶已斷線');
      }
    );
    
    return () => {
      garminListener.remove();
      GarminCommunicationModule?.shutdown();
    };
  }
}, []);
```

## manifest.xml 配置

```xml
<iq:manifest xmlns:iq="http://www.garmin.com/xml/connectiq" version="3">
    <iq:application 
        entry="PageTurnerApp" 
        id="YOUR-UNIQUE-APP-ID-HERE"
        launcherIcon="@Drawables.LauncherIcon"
        minApiLevel="3.0.0"
        name="@Strings.AppName"
        type="watch-app"
        version="1.0.0">
        
        <iq:products>
            <iq:product id="descentmk2"/>
            <!-- 加入其他支援的裝置型號 -->
        </iq:products>
        
        <iq:permissions>
            <iq:uses-permission id="Communications"/>
        </iq:permissions>
        
        <iq:languages>
            <iq:language>eng</iq:language>
            <iq:language>zho</iq:language>
        </iq:languages>
    </iq:application>
</iq:manifest>
```

## 測試與除錯

### 模擬器測試

```bash
# 啟動模擬器
monkeyc -d descentmk2 -f monkey.jungle

# 或使用 VS Code
# 按 F5 啟動除錯
```

### 實機測試

1. 在手錶上啟用開發者模式
2. 連接手錶到電腦
3. 使用 Connect IQ 上傳應用

```bash
monkeyc -d YOUR_DEVICE_ID -y developer_key -f monkey.jungle -o PageTurner.prg
```

### 除錯訊息

```java
// 在程式碼中加入除錯訊息
System.println("Debug: Button pressed");

// 在 VS Code 中查看輸出
// 或使用：
monkeyc --view-output
```

## 發布流程

### 1. 準備發布

- 更新版本號
- 完整測試所有功能
- 準備應用程式圖示（各種尺寸）
- 準備螢幕截圖
- 撰寫應用程式說明

### 2. 上傳到 Connect IQ Store

1. 登入 [Connect IQ Store Manager](https://apps.garmin.com/developer)
2. 建立新應用程式
3. 上傳 .iq 檔案
4. 填寫應用程式資訊
5. 提交審核

### 3. 審核通過後

- 應用程式將出現在 Connect IQ Store
- 用戶可以透過 Garmin Connect Mobile App 安裝

## 最佳實踐

### 1. 電池優化

```java
// 使用低功耗模式
function onEnterSleep() {
    // 降低更新頻率
    Comm.cancelAllRequests();
}

function onExitSleep() {
    // 恢復正常運作
    requestStatus();
}
```

### 2. 錯誤處理

```java
function sendCommand(command) {
    try {
        Comm.transmit(command, null, new CommListener());
    } catch (e) {
        System.println("Error: " + e.getErrorMessage());
        // 顯示錯誤訊息給用戶
        showError("通訊失敗");
    }
}
```

### 3. 用戶體驗

- 提供清楚的視覺回饋
- 按鈕按下時顯示動畫
- 連接狀態即時更新
- 錯誤訊息清楚明瞭

## 參考資源

- [Connect IQ 官方文件](https://developer.garmin.com/connect-iq/overview/)
- [Connect IQ API 參考](https://developer.garmin.com/connect-iq/api-docs/)
- [Connect IQ 範例程式](https://github.com/garmin/connectiq-samples)
- [Connect IQ 論壇](https://forums.garmin.com/developer/connect-iq/)

## 常見問題

### Q: 支援哪些 Garmin 裝置？

A: 所有支援 Connect IQ 3.0 或更高版本的裝置都可以使用。推薦：
- Descent Mk2 系列
- Fenix 6/7 系列
- Forerunner 系列
- Venu 系列

### Q: 如何取得 App UUID？

A: 在 manifest.xml 中定義，可以使用線上 UUID 生成器。

### Q: 通訊延遲如何？

A: 通常 < 1 秒，取決於藍牙連接品質。

### Q: 可以同時連接多個手錶嗎？

A: Connect IQ SDK 支援，但需要額外的邏輯處理。

## 結論

開發 Garmin Connect IQ 應用需要：
1. 熟悉 Monkey C 語言
2. 了解 Connect IQ SDK
3. 測試實機運作
4. 優化電池使用

完成後，用戶就可以直接用手錶控制電子書翻頁，帶來極佳的閱讀體驗！
