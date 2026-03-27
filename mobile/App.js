// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LucideLayoutDashboard, LucideHistory, LucidePieChart, LucideTags, LucideWallet, LucideUser } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportScreen from './src/screens/ReportScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import WalletScreen from './src/screens/WalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('jwt_token');
      if (token) setIsLoggedIn(true);
    };
    checkToken();
  }, []);

  // LUỒNG AUTHENTICATION
  if (!isLoggedIn) {
    if (showRegister) {
      return <RegisterScreen
        onRegisterSuccess={() => setIsLoggedIn(true)}
        onBackToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen
      onLoginSuccess={() => setIsLoggedIn(true)}
      onGoToRegister={() => setShowRegister(true)} />;
  }

  // LUỒNG CHÍNH CỦA APP (TABS)
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: { height: 70, paddingBottom: 10 },
        }}
      >
        <Tab.Screen
          name="Budget"
          options={{ tabBarIcon: ({ color }) => <LucideLayoutDashboard color={color} size={24} /> }}
        >
          {/* Truyền prop onLogout để HomeScreen có thể gọi */}
          {(props) => <HomeScreen {...props} onLogout={() => setIsLoggedIn(false)} />}
        </Tab.Screen>

        <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: ({ color }) => <LucideHistory color={color} size={24} /> }} />
        <Tab.Screen name="Reports" component={ReportScreen} options={{ tabBarIcon: ({ color }) => <LucidePieChart color={color} size={24} /> }} />
        <Tab.Screen name="Category" component={CategoryScreen} options={{ tabBarIcon: ({ color }) => <LucideTags color={color} size={24} /> }} />
        <Tab.Screen name="Wallets" component={WalletScreen} options={{ tabBarIcon: ({ color }) => <LucideWallet color={color} size={24} /> }} />
        <Tab.Screen
          name="Profile"
          options={{ tabBarIcon: ({ color }) => <LucideUser color={color} size={24} /> }}
        >
          {(props) => <ProfileScreen {...props} onLogout={() => setIsLoggedIn(false)} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
