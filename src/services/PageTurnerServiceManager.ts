import BluetoothService from './BluetoothService';
import VolumeKeyService from './VolumeKeyService';

export interface PageTurnerService {
  initialize(): Promise<boolean>;
  destroy(): void;
}

class PageTurnerServiceManager implements PageTurnerService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      // 初始化藍牙服務
      const bluetoothReady = await BluetoothService.initialize();
      if (!bluetoothReady) {
        console.warn('藍牙服務初始化失敗');
        return false;
      }

      // 音量鍵服務已在構造時自動初始化
      this.isInitialized = true;
      console.log('PageTurner 服務管理器初始化成功');
      return true;
    } catch (error) {
      console.error('PageTurner 服務管理器初始化失敗:', error);
      return false;
    }
  }

  destroy(): void {
    if (this.isInitialized) {
      BluetoothService.destroy();
      VolumeKeyService.destroy();
      this.isInitialized = false;
      console.log('PageTurner 服務管理器已清理');
    }
  }

  getBluetoothService() {
    return BluetoothService;
  }

  getVolumeKeyService() {
    return VolumeKeyService;
  }

  isServiceReady(): boolean {
    return this.isInitialized;
  }
}

export default new PageTurnerServiceManager();
