import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

// Contexts
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RecordingScreen from './src/screens/RecordingScreen';
import AdminScreen from './src/screens/AdminScreen';
import UploadScreen from './src/screens/UploadScreen';
import ManualSyncScreen from './src/screens/ManualSyncScreen';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { COLORS } from './src/theme/colors';

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'https://manuelubianvillarreal-lab.github.io/SingSoulStar-App'],
  config: {
    screens: {
      Login: '',
      Register: 'register',
      MainTabs: {
        screens: {
          Moments: '',
          Party: 'party',
          Sing: 'sing',
          Message: 'message',
          Me: 'me',
        },
      },
      Recording: 'recording',
      Upload: 'upload',
      ManualSync: 'manual-sync',
      RoomDetail: 'room/:id',
      Groups: 'groups',
      AdminDashboard: 'admin',
    },
  },
};

const Stack = createNativeStackNavigator();

// Simple Error Boundary Implementation
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'red' }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Algo salió mal 😢</Text>
          <Text style={{ color: 'white', marginTop: 10 }}>{this.state.error && this.state.error.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} fallback={<ActivityIndicator color={COLORS.primary} />}>
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          {user.role === 'admin' ? (
            <Stack.Screen name="AdminDashboard" component={AdminScreen} />
          ) : (
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          )}

          <Stack.Screen
            name="Recording"
            component={RecordingScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="ManualSync" component={ManualSyncScreen} />
          <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
          <Stack.Screen name="Groups" component={GroupsScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <AppContent />
          </View>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
