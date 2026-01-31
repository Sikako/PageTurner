import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ConnectionStatusProps {
  eReaderConnected: boolean;
  eReaderName?: string;
  garminConnected: boolean;
  garminName?: string;
}

const ConnectionStatusBar: React.FC<ConnectionStatusProps> = ({
  eReaderConnected,
  eReaderName,
  garminConnected,
  garminName,
}) => {
  return (
    <View style={styles.container}>
      {/* E-Reader Status */}
      <View style={styles.statusItem}>
        <Icon
          name="book"
          size={16}
          color={eReaderConnected ? '#4CAF50' : '#BDBDBD'}
        />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusLabel}>閱讀器</Text>
          <Text
            style={[
              styles.statusValue,
              { color: eReaderConnected ? '#4CAF50' : '#999' },
            ]}
          >
            {eReaderConnected ? (eReaderName || '已連接') : '未連接'}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Garmin Watch Status */}
      <View style={styles.statusItem}>
        <Icon
          name="watch"
          size={16}
          color={garminConnected ? '#4CAF50' : '#BDBDBD'}
        />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusLabel}>手錶</Text>
          <Text
            style={[
              styles.statusValue,
              { color: garminConnected ? '#4CAF50' : '#999' },
            ]}
          >
            {garminConnected ? (garminName || '已連接') : '未連接'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusTextContainer: {
    marginLeft: 8,
  },
  statusLabel: {
    fontSize: 10,
    color: '#666',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
});

export default ConnectionStatusBar;
