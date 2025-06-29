import { NativeModules, Alert, Platform } from 'react-native';
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { HidPeripheralModule } = NativeModules;

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
          Alert.alert('權限不足', '需要藍牙廣播和連線權限才能作為遙控器使用。');
          return;
        }
      }

      await HidPeripheralModule.start();
      this.isAdvertising = true;
      console.log('Started advertising as a HID device.');
    } catch (error) {
      console.error('Failed to start advertising:', error);
      Alert.alert('Error', 'Failed to start advertising.');
    }
  }

  // Stop advertising
  async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) return;
    try {
      HidPeripheralModule.stop();
      this.isAdvertising = false;
      console.log('Stopped advertising.');
    } catch (error) {
      console.error('Failed to stop advertising:', error);
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
    }
  }
}

export default new HIDPeripheralService();