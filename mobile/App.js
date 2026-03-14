import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LucideLayoutDashboard, LucideHistory, LucidePieChart, LucideTags } from 'lucide-react-native';

// 1. Import ĐẦY ĐỦ 4 màn hình của bạn
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportScreen from './src/screens/ReportScreen';
import CategoryScreen from './src/screens/CategoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
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
          component={HomeScreen}
          options={{ tabBarIcon: ({ color }) => <LucideLayoutDashboard color={color} size={24} /> }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ tabBarIcon: ({ color }) => <LucideHistory color={color} size={24} /> }}
        />
        {/* 2. Sửa lại component thành ReportScreen thật */}
        <Tab.Screen
          name="Reports"
          component={ReportScreen}
          options={{ tabBarIcon: ({ color }) => <LucidePieChart color={color} size={24} /> }}
        />
        {/* 3. Thêm tab Hạng mục (Category) vào App */}
        <Tab.Screen
          name="Category"
          component={CategoryScreen}
          options={{ tabBarIcon: ({ color }) => <LucideTags color={color} size={24} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}