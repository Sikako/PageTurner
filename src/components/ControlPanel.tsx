import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BluetoothDevice } from '../types';

interface ControlPanelProps {
  connectedDevice?: BluetoothDevice;
  isVolumeKeyListening: boolean;
  onToggleVolumeKeyListening: () => void;
  onDisconnect: () => void;
  onTestPageTurn: (direction: 'left' | 'right') => void;
  onDiagnose?: () => void; // 添加診斷功能
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  connectedDevice,
  isVolumeKeyListening,
  onToggleVolumeKeyListening,
  onDisconnect,
  onTestPageTurn,
  onDiagnose,
}) => {
  if (!connectedDevice) {
    return (
      <View style={styles.container}>
        <View style={styles.disconnectedState}>
          <Icon name="bluetooth-disabled" size={64} color="#BDBDBD" />
          <Text style={styles.disconnectedText}>未連接裝置</Text>
          <Text style={styles.disconnectedSubText}>
            請先選擇並連接到您的電子書閱讀器
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 連接狀態 */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Icon name="bluetooth-connected" size={24} color="#4CAF50" />
          <Text style={styles.statusTitle}>已連接</Text>
        </View>
        <Text style={styles.deviceName}>{connectedDevice.name}</Text>
        <Text style={styles.deviceId}>{connectedDevice.id}</Text>
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={onDisconnect}
        >
          <Icon name="bluetooth-disabled" size={16} color="#fff" />
          <Text style={styles.disconnectButtonText}>斷開連接</Text>
        </TouchableOpacity>
      </View>

      {/* 音量鍵控制 */}
      <View style={styles.controlCard}>
        <Text style={styles.cardTitle}>音量鍵控制</Text>
        <Text style={styles.cardDescription}>
          開啟後，音量鍵將用於控制電子書翻頁
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isVolumeKeyListening && styles.toggleButtonActive,
          ]}
          onPress={onToggleVolumeKeyListening}
        >
          <Icon 
            name={isVolumeKeyListening ? 'volume-up' : 'volume-off'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.toggleButtonText}>
            {isVolumeKeyListening ? '停用音量鍵控制' : '啟用音量鍵控制'}
          </Text>
        </TouchableOpacity>
        
        {isVolumeKeyListening && (
          <View style={styles.instructionBox}>
            <Icon name="info" size={16} color="#2196F3" />
            <Text style={styles.instructionText}>
              音量加: 下一頁 | 音量減: 上一頁
            </Text>
          </View>
        )}
      </View>

      {/* 測試按鈕 */}
      <View style={styles.controlCard}>
        <Text style={styles.cardTitle}>手動測試</Text>
        <Text style={styles.cardDescription}>
          測試翻頁功能是否正常
        </Text>
        <View style={styles.testButtons}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => onTestPageTurn('left')}
          >
            <Icon name="keyboard-arrow-left" size={24} color="#fff" />
            <Text style={styles.testButtonText}>上一頁</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => onTestPageTurn('right')}
          >
            <Icon name="keyboard-arrow-right" size={24} color="#fff" />
            <Text style={styles.testButtonText}>下一頁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 診斷按鈕 */}
      {onDiagnose && (
        <View style={styles.controlCard}>
          <Text style={styles.cardTitle}>診斷工具</Text>
          <Text style={styles.cardDescription}>
            使用內建診斷工具檢查裝置連接問題
          </Text>
          <TouchableOpacity
            style={styles.diagnoseButton}
            onPress={onDiagnose}
          >
            <Icon name="build" size={20} color="#fff" />
            <Text style={styles.diagnoseButtonText}>執行診斷</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  disconnectedState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  disconnectedText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
    textAlign: 'center',
  },
  disconnectedSubText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 16,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  controlCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9E9E9E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  instructionText: {
    color: '#2196F3',
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
  },
  testButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  diagnoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#673AB7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  diagnoseButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default ControlPanel;
