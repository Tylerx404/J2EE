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
import {
  hasPendingGuestImport,
  importGuestDataToBackend,
  keepGuestImportSeparate,
  postponeGuestImport,
} from './src/data/guest/import';
import { seedGuestDataIfNeeded } from './src/data/guest/seed';
import { getSessionMode, SESSION_MODES, startGuestSession } from './src/services/sessionService';

const Tab = createBottomTabNavigator();

export default function App() {
  const [sessionMode, setSessionMode] = useState(SESSION_MODES.LOGGED_OUT);
  const [authView, setAuthView] = useState(null);
  const [isEnteringGuest, setIsEnteringGuest] = useState(false);
  const [financeDataVersion, setFinanceDataVersion] = useState(0);
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
        Alert.alert('Lỗi', 'Không khởi tạo được bộ nhớ local cho guest mode.');
        setSessionMode(SESSION_MODES.LOGGED_OUT);
      }
    };

    prepareGuestStorage();
  }, [isGuest]);

  const handleGuestEntry = async () => {
    if (isEnteringGuest) {
      return;
    }

    try {
      setIsEnteringGuest(true);
      await startGuestSession();
      await initGuestDb();
      await seedGuestDataIfNeeded();
      setAuthView(null);
      setSessionMode(SESSION_MODES.GUEST);
    } catch (error) {
      console.error('Guest entry error:', error);
      setSessionMode(SESSION_MODES.LOGGED_OUT);
      Alert.alert(
        'Không vào được guest mode',
        `Không thể khởi tạo dữ liệu local trên môi trường này. ${error.message || ''}`.trim()
      );
    } finally {
      setIsEnteringGuest(false);
    }
  };

  const handleAuthenticatedEntry = async () => {
    setSessionMode(SESSION_MODES.AUTHENTICATED);
    setAuthView(null);

    const shouldPromptImport = await hasPendingGuestImport();
    if (!shouldPromptImport) {
      return;
    }

    Alert.alert(
      'Dữ liệu guest local',
      'Đã tìm thấy dữ liệu local chưa import. Bạn muốn xử lý thế nào?',
      [
        {
          text: 'Import dữ liệu local',
          onPress: async () => {
            try {
              const { payload, response } = await importGuestDataToBackend();
              setFinanceDataVersion((value) => value + 1);
              const importedCounts = response?.importedCounts || {};
              Alert.alert(
                'Import thành công',
                `Wallet ${payload.wallets.length}: tạo ${importedCounts.walletsCreated || 0}, dùng lại ${importedCounts.walletsReused || 0}.\nCategory ${payload.categories.length}: tạo ${importedCounts.categoriesCreated || 0}, dùng lại ${importedCounts.categoriesReused || 0}.\nTransaction ${payload.transactions.length}: tạo ${importedCounts.transactionsCreated || 0}, dùng lại ${importedCounts.transactionsReused || 0}.`
              );
            } catch (error) {
              Alert.alert('Import thất bại', error.message || 'Không import được dữ liệu local.');
            }
          },
        },
        {
          text: 'Giữ riêng',
          onPress: async () => {
            await keepGuestImportSeparate();
          },
        },
        {
          text: 'Để sau',
          style: 'cancel',
          onPress: async () => {
            await postponeGuestImport();
          },
        },
      ]
    );
  };

  if (!isAuthenticated && !isGuest) {
    if (authView === 'register') {
      return (
        <RegisterScreen
          onRegisterSuccess={handleAuthenticatedEntry}
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <LoginScreen
        onLoginSuccess={handleAuthenticatedEntry}
        onContinueAsGuest={handleGuestEntry}
        onGoToRegister={() => setAuthView('register')}
        isGuestEntryLoading={isEnteringGuest}
      />
    );
  }

  if (isGuest && authView === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleAuthenticatedEntry}
        onGoToRegister={() => setAuthView('register')}
        onBack={() => setAuthView(null)}
        showGuestEntry={false}
      />
    );
  }

  if (isGuest && authView === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={handleAuthenticatedEntry}
        onBackToLogin={() => setAuthView('login')}
        onBack={() => setAuthView(null)}
      />
    );
  }

  return (
    <NavigationContainer key={`nav-${sessionMode}-${financeDataVersion}`}>
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
          options={{
            tabBarLabel: 'Tổng quan',
            tabBarIcon: ({ color }) => <LucideLayoutDashboard color={color} size={24} />,
          }}
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
          options={{
            tabBarLabel: 'Lịch sử',
            tabBarIcon: ({ color }) => <LucideHistory color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Reports"
          options={{
            tabBarLabel: 'Báo cáo',
            tabBarIcon: ({ color }) => <LucidePieChart color={color} size={24} />,
          }}
        >
          {(props) => <ReportScreen {...props} sessionMode={sessionMode} />}
        </Tab.Screen>
        <Tab.Screen
          name="Category"
          component={CategoryScreen}
          options={{
            tabBarLabel: 'Hạng mục',
            tabBarIcon: ({ color }) => <LucideTags color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Wallets"
          component={WalletScreen}
          options={{
            tabBarLabel: 'Ví',
            tabBarIcon: ({ color }) => <LucideWallet color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          options={{
            tabBarLabel: 'Hồ sơ',
            tabBarIcon: ({ color }) => <LucideUser color={color} size={24} />,
          }}
        >
          {(props) => (
            <ProfileScreen
              {...props}
              sessionMode={sessionMode}
              onGoToLogin={() => setAuthView('login')}
              onGoToRegister={() => setAuthView('register')}
              onContinueLocal={() => setAuthView(null)}
              onLogout={() => setSessionMode(SESSION_MODES.LOGGED_OUT)}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
