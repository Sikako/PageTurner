import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LogService, { LogEntry, LogLevel } from '../services/LogService';

const LogScreen: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');

  useEffect(() => {
    // Initial load
    setLogs(LogService.getLogs());

    // Subscribe to updates
    const unsubscribe = LogService.subscribe(setLogs);

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const handleClearLogs = () => {
    Alert.alert(
      '清除日誌',
      '確定要清除所有日誌嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => LogService.clear(),
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const text = LogService.exportAsText();
      await Share.share({
        message: text,
        title: 'PageTurner 日誌',
      });
    } catch (error) {
      Alert.alert('錯誤', '無法分享日誌');
    }
  };

  const getLogColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.SUCCESS:
        return '#4CAF50';
      case LogLevel.WARNING:
        return '#FF9800';
      case LogLevel.ERROR:
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getLogIcon = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.SUCCESS:
        return 'check-circle';
      case LogLevel.WARNING:
        return 'warning';
      case LogLevel.ERROR:
        return 'error';
      default:
        return 'info';
    }
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => {
    const color = getLogColor(item.level);
    const icon = getLogIcon(item.level);
    const time = item.timestamp.toLocaleTimeString('zh-TW');

    return (
      <View style={styles.logItem}>
        <View style={styles.logHeader}>
          <Icon name={icon} size={16} color={color} />
          <Text style={[styles.logLevel, { color }]}>{item.level}</Text>
          <Text style={styles.logTime}>{time}</Text>
        </View>
        <Text style={styles.logCategory}>[{item.category}]</Text>
        <Text style={styles.logMessage}>{item.message}</Text>
      </View>
    );
  };

  const FilterButton: React.FC<{ level: LogLevel | 'ALL', label: string }> = ({ level, label }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === level && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(level)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === level && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>系統日誌</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleExportLogs}
          >
            <Icon name="share" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearLogs}
          >
            <Icon name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <FilterButton level="ALL" label="全部" />
        <FilterButton level={LogLevel.INFO} label="資訊" />
        <FilterButton level={LogLevel.SUCCESS} label="成功" />
        <FilterButton level={LogLevel.WARNING} label="警告" />
        <FilterButton level={LogLevel.ERROR} label="錯誤" />
      </View>

      {/* Log Count */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          共 {filteredLogs.length} 筆記錄
        </Text>
      </View>

      {/* Log List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={item => item.id}
        style={styles.logList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="article" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>暫無日誌記錄</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  countBar: {
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  logList: {
    flex: 1,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  logTime: {
    fontSize: 11,
    color: '#999',
    marginLeft: 'auto',
  },
  logCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  logMessage: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default LogScreen;
