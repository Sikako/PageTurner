import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, StatusBar, Text, FlatList, TouchableOpacity, NativeEventEmitter, NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ControlPanel from '../components/ControlPanel';
import HIDPeripheralService from '../services/HIDPeripheralService';

interface ConnectedDevice {
  name: string;
  address: string;
}

const MainScreen: React.FC = () => {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [targetDevice, setTargetDevice] = useState<ConnectedDevice | null>(null);
  const [isVolumeKeyListening, setVolumeKeyListening] = useState(false);

  const initialize = useCallback(async () => {
    try {
      await HIDPeripheralService.startAdvertising();
    } catch (error) {
      Alert.alert('Error', 'Failed to start advertising.');
    }
  }, []);

  useEffect(() => {
    initialize();

    const eventEmitter = new NativeEventEmitter(NativeModules.HidPeripheralModule);
    const connectionListener = eventEmitter.addListener(
      'onHidConnectionStateChanged',
      (event: { status: string; name: string; address: string }) => {
        console.log('Connection state changed:', event);
        if (event.status === 'connected') {
          setConnectedDevices(prev => [...prev.filter(d => d.address !== event.address), { name: event.name, address: event.address }]);
        } else {
          setConnectedDevices(prev => prev.filter(d => d.address !== event.address));
          if (targetDevice?.address === event.address) {
            setTargetDevice(null);
            Alert.alert('目標裝置已斷線', event.name);
          }
        }
      }
    );

    return () => {
      connectionListener.remove();
      HIDPeripheralService.stopAdvertising();
    };
  }, [initialize, targetDevice?.address]);

  const handleSetTargetDevice = useCallback(async (device: ConnectedDevice) => {
    try {
      await HIDPeripheralService.setTargetDevice(device.address);
      setTargetDevice(device);
      Alert.alert('目標已設定', `現在將控制 ${device.name}`);
    } catch (error) {
      Alert.alert('設定失敗', '無法將此裝置設定為目標');
    }
  }, []);

  const handlePageTurn = useCallback(async (direction: 'left' | 'right') => {
    if (!targetDevice) {
      Alert.alert('未選擇目標', '請先從已連線列表中選擇一個裝置來啟用控制。');
      return;
    }
    const keyCode = direction === 'left' ? 0x50 : 0x4F;
    await HIDPeripheralService.sendKeyPress(keyCode);
  }, [targetDevice]);

  const handleToggleVolumeKeyListening = useCallback(() => {
    if (!targetDevice) {
      Alert.alert('未選擇目標', '請先選擇一個裝置來啟用音量鍵控制。');
      return;
    }
    const newState = !isVolumeKeyListening;
    setVolumeKeyListening(newState);
    Alert.alert('音量鍵控制', newState ? '已啟用' : '已停用');
  }, [isVolumeKeyListening, targetDevice]);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter();
    const volumeListener = eventEmitter.addListener(
      'onVolumeKeyPress',
      (event: { action: 'volumeUp' | 'volumeDown' }) => {
        if (isVolumeKeyListening) {
          const direction = event.action === 'volumeUp' ? 'right' : 'left';
          handlePageTurn(direction);
        }
      }
    );
    return () => volumeListener.remove();
  }, [isVolumeKeyListening, handlePageTurn]);

  const renderDeviceItem = ({ item }: { item: ConnectedDevice }) => (
    <View style={styles.deviceItem}>
      <View style={styles.deviceInfo}>
        <Icon name="bluetooth-connected" size={24} color={targetDevice?.address === item.address ? '#4CAF50' : '#666'} />
        <Text style={styles.deviceName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, targetDevice?.address === item.address ? styles.activeButton : styles.inactiveButton]}
        onPress={() => handleSetTargetDevice(item)}
      >
        <Text style={styles.buttonText}>{targetDevice?.address === item.address ? '已啟用' : '啟用控制'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <Text style={styles.headerText}>廣播中...</Text>
        <Text style={styles.subHeaderText}>請在閱讀器上尋找並連接您的手機</Text>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={connectedDevices}
          renderItem={renderDeviceItem}
          keyExtractor={(item) => item.address}
          ListHeaderComponent={<Text style={styles.listHeader}>已連線的裝置</Text>}
          ListEmptyComponent={<Text style={styles.emptyText}>尚未有任何裝置連線...</Text>}
        />
      </View>
      <ControlPanel
        connectedDevice={targetDevice ? { id: targetDevice.address, name: targetDevice.name } : undefined}
        isVolumeKeyListening={isVolumeKeyListening}
        onToggleVolumeKeyListening={handleToggleVolumeKeyListening}
        onDisconnect={() => {
          if (targetDevice) {
            // This is now a logical disconnect from the target, not a BLE disconnect
            setTargetDevice(null);
            Alert.alert('已停用', `已取消對 ${targetDevice.name} 的控制。`);
          }
        }}
        onTestPageTurn={handlePageTurn}
        onDiagnose={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subHeaderText: { fontSize: 16, textAlign: 'center', color: '#666', marginTop: 5 },
  listHeader: { fontSize: 18, fontWeight: 'bold', padding: 15, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  deviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  deviceInfo: { flexDirection: 'row', alignItems: 'center' },
  deviceName: { fontSize: 16, marginLeft: 10 },
  button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  activeButton: { backgroundColor: '#4CAF50' },
  inactiveButton: { backgroundColor: '#2196F3' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});

export default MainScreen;
