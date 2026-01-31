/**
 * PageTurner - Bluetooth E-Reader Remote Control App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen from './src/screens/MainScreen';
import LogScreen from './src/screens/LogScreen';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: '#999',
          }}
        >
          <Tab.Screen
            name="Control"
            component={MainScreen}
            options={{
              tabBarLabel: '控制',
              tabBarIcon: ({ color, size }) => (
                <Icon name="bluetooth" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Logs"
            component={LogScreen}
            options={{
              tabBarLabel: '日誌',
              tabBarIcon: ({ color, size }) => (
                <Icon name="article" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
