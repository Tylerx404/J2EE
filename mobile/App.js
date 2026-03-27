import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LucideHistory,
  LucideLayoutDashboard,
  LucidePieChart,
  LucideTags,
  LucideUser,
  LucideWallet,
} from 'lucide-react-native';

import CategoryScreen from './src/screens/CategoryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ReportScreen from './src/screens/ReportScreen';
import WalletScreen from './src/screens/WalletScreen';
import { initGuestDb } from './src/data/guest/guestDb';
import { seedGuestDataIfNeeded } from './src/data/guest/seed';
import { getSessionMode, SESSION_MODES, startGuestSession } from './src/services/sessionService';

const Tab = createBottomTabNavigator();

export default function App() {
  const [sessionMode, setSessionMode] = useState(SESSION_MODES.LOGGED_OUT);
  const [showRegister, setShowRegister] = useState(false);
  const isGuest = sessionMode === SESSION_MODES.GUEST;
  const isAuthenticated = sessionMode === SESSION_MODES.AUTHENTICATED;

  useEffect(() => {
    const hydrateSession = async () => {
      const storedMode = await getSessionMode();
      const token = await AsyncStorage.getItem('jwt_token');

      if (storedMode === SESSION_MODES.GUEST) {
        setSessionMode(SESSION_MODES.GUEST);
        return;
      }

      if (storedMode === SESSION_MODES.AUTHENTICATED && token) {
        setSessionMode(SESSION_MODES.AUTHENTICATED);
        return;
      }

      if (token) {
        setSessionMode(SESSION_MODES.AUTHENTICATED);
        return;
      }

      setSessionMode(SESSION_MODES.LOGGED_OUT);
    };

    hydrateSession();
  }, []);

  useEffect(() => {
    if (!isGuest) return;

    const prepareGuestStorage = async () => {
      try {
        await initGuestDb();
        await seedGuestDataIfNeeded();
      } catch (error) {
        console.error('Guest DB init error:', error);
        Alert.alert('Loi', 'Khong khoi tao duoc bo nho local cho guest mode.');
        setSessionMode(SESSION_MODES.LOGGED_OUT);
      }
    };

    prepareGuestStorage();
  }, [isGuest]);

  if (!isAuthenticated && !isGuest) {
    if (showRegister) {
      return (
        <RegisterScreen
          onRegisterSuccess={() => setSessionMode(SESSION_MODES.AUTHENTICATED)}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginScreen
        onLoginSuccess={() => setSessionMode(SESSION_MODES.AUTHENTICATED)}
        onContinueAsGuest={async () => {
          await startGuestSession();
          setSessionMode(SESSION_MODES.GUEST);
        }}
        onGoToRegister={() => setShowRegister(true)}
      />
    );
  }

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
          {(props) => (
            <HomeScreen
              {...props}
              sessionMode={sessionMode}
              onLogout={() => setSessionMode(SESSION_MODES.LOGGED_OUT)}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ tabBarIcon: ({ color }) => <LucideHistory color={color} size={24} /> }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportScreen}
          options={{ tabBarIcon: ({ color }) => <LucidePieChart color={color} size={24} /> }}
        />
        <Tab.Screen
          name="Category"
          component={CategoryScreen}
          options={{ tabBarIcon: ({ color }) => <LucideTags color={color} size={24} /> }}
        />
        <Tab.Screen
          name="Wallets"
          component={WalletScreen}
          options={{ tabBarIcon: ({ color }) => <LucideWallet color={color} size={24} /> }}
        />
        {!isGuest ? (
          <Tab.Screen
            name="Profile"
            options={{ tabBarIcon: ({ color }) => <LucideUser color={color} size={24} /> }}
          >
            {(props) => (
              <ProfileScreen
                {...props}
                onLogout={() => setSessionMode(SESSION_MODES.LOGGED_OUT)}
              />
            )}
          </Tab.Screen>
        ) : null}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
