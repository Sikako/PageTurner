import { Alert } from 'react-native';
import BluetoothService from '../services/BluetoothService';
import VolumeKeyService from '../services/VolumeKeyService';

/**
 * 測試工具類
 * 用於驗證應用的核心功能
 */
export class TestUtils {
  /**
   * 測試藍牙服務初始化
   */
  static async testBluetoothInitialization(): Promise<boolean> {
    try {
      console.log('開始測試藍牙初始化...');
      const result = await BluetoothService.initialize();
      console.log('藍牙初始化結果:', result);
      return result;
    } catch (error) {
      console.error('藍牙初始化測試失敗:', error);
      return false;
    }
  }

  /**
   * 測試音量鍵服務
   */
  static testVolumeKeyService(): boolean {
    try {
      console.log('開始測試音量鍵服務...');
      
      // 添加測試監聽器
      const testListener = {
        onVolumeKeyPress: (action: any) => {
          console.log('音量鍵測試 - 接收到動作:', action);
        }
      };
      
      VolumeKeyService.addListener(testListener);
      
      // 測試啟動和停止監聽
      VolumeKeyService.startListening();
      console.log('音量鍵監聽已啟動');
      
      setTimeout(() => {
        VolumeKeyService.stopListening();
        VolumeKeyService.removeListener(testListener);
        console.log('音量鍵監聽已停止');
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('音量鍵服務測試失敗:', error);
      return false;
    }
  }

  /**
   * 測試藍牙掃描功能
   */
  static async testBluetoothScan(): Promise<boolean> {
    try {
      console.log('開始測試藍牙掃描...');
      
      let deviceCount = 0;
      await BluetoothService.scanForDevices(
        (device) => {
          deviceCount++;
          console.log(`發現裝置 ${deviceCount}:`, device.name, device.id);
        },
        5000 // 掃描5秒
      );
      
      console.log(`掃描完成，共發現 ${deviceCount} 個裝置`);
      return true;
    } catch (error) {
      console.error('藍牙掃描測試失敗:', error);
      return false;
    }
  }

  /**
   * 執行完整的功能測試
   */
  static async runFullTest(): Promise<void> {
    console.log('=== PageTurner 功能測試開始 ===');
    
    // 測試藍牙初始化
    const bluetoothOk = await this.testBluetoothInitialization();
    
    if (bluetoothOk) {
      // 測試藍牙掃描
      await this.testBluetoothScan();
    }
    
    // 測試音量鍵服務
    this.testVolumeKeyService();
    
    console.log('=== PageTurner 功能測試完成 ===');
    
    Alert.alert(
      '測試完成',
      `藍牙初始化: ${bluetoothOk ? '成功' : '失敗'}\n音量鍵服務: 請查看控制台輸出`,
      [{ text: '確定' }]
    );
  }

  /**
   * 模擬翻頁測試
   */
  static async simulatePageTurn(direction: 'left' | 'right'): Promise<boolean> {
    try {
      console.log(`模擬翻頁: ${direction}`);
      
      if (!BluetoothService.isConnected()) {
        console.warn('未連接到裝置，無法測試翻頁');
        Alert.alert('測試失敗', '請先連接到電子書閱讀器');
        return false;
      }
      
      const result = await BluetoothService.sendKeySignal(direction);
      console.log('翻頁測試結果:', result);
      
      return result;
    } catch (error) {
      console.error('翻頁測試失敗:', error);
      return false;
    }
  }
}

export default TestUtils;
