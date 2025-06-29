export interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi?: number;
  isKnown?: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  device?: BluetoothDevice;
  error?: string;
}

export type VolumeKeyAction = 'volumeUp' | 'volumeDown';

export interface AppState {
  isBluetoothEnabled: boolean;
  isScanning: boolean;
  connectionStatus: ConnectionStatus;
  isVolumeKeyListening: boolean;
  availableDevices: BluetoothDevice[];
  connectingDeviceId: string | null;
}

export interface KeySignal {
  key: 'left' | 'right';
  timestamp: number;
}
