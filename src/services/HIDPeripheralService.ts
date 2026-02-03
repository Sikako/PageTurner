import { NativeModules, Alert, Platform } from 'react-native';
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LogService from './LogService';

const { HidPeripheralModule, ForegroundServiceModule } = NativeModules;

class HIDPeripheralService {
  private isAdvertising = false;

  // Start advertising as a HID device
  async startAdvertising(): Promise<void> {
    if (this.isAdvertising) {
      console.log('Already advertising.');
      return;
    }
    try {
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const permissions = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        ]);
        const allGranted = Object.values(permissions).every(
          status => status === RESULTS.GRANTED
        );
        if (!allGranted) {
          LogService.error('權限', '藍牙廣播和連線權限未授予');
          Alert.alert('權限不足', '需要藍牙廣播和連線權限才能作為遙控器使用。');
          return;
        }
      }

      await HidPeripheralModule.start();
      this.isAdvertising = true;
      
      // Start foreground service to keep app running in background
      if (Platform.OS === 'android' && ForegroundServiceModule) {
        ForegroundServiceModule.startService();
        LogService.info('服務', '前台服務已啟動，應用可在背景運行');
      }
      
      console.log('Started advertising as a HID device.');
    } catch (error) {
      console.error('Failed to start advertising:', error);
      LogService.error('系統', '啟動 HID 廣播失敗');
      Alert.alert('Error', 'Failed to start advertising.');
    }
  }

  // Stop advertising
  async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) return;
    try {
      HidPeripheralModule.stop();
      this.isAdvertising = false;
      
      // Stop foreground service
      if (Platform.OS === 'android' && ForegroundServiceModule) {
        ForegroundServiceModule.stopService();
        LogService.info('服務', '前台服務已停止');
      }
      
      console.log('Stopped advertising.');
    } catch (error) {
      console.error('Failed to stop advertising:', error);
      LogService.error('系統', '停止 HID 廣播失敗');
    }
  }

  async setTargetDevice(address: string): Promise<void> {
    try {
      await HidPeripheralModule.setTargetDevice(address);
    } catch (error) {
      console.error('Failed to set target device:', error);
      throw error; // Re-throw to be caught in the UI layer
    }
  }

  // Send a key press notification
  async sendKeyPress(keyCode: number): Promise<void> {
    if (!this.isAdvertising) {
      // In a real app, you might want to check for a connected state
      console.warn('Not advertising, cannot send key press.');
      return;
    }
    try {
      await HidPeripheralModule.sendKeyPress(keyCode);
    } catch (error) {
      console.error('Failed to send key press:', error);
      LogService.error('翻頁', `發送按鍵失敗: ${error}`);
    }
  }
}

export default new HIDPeripheralService();