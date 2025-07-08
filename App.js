// App.js
import React, { useContext } from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavLight,
  DarkTheme    as NavDark,
} from '@react-navigation/native';

import { AuthProvider, AuthContext } from './components/AuthContext';
import { AppThemeProvider, useAppTheme } from './components/ThemeContext';
import AuthStack    from './navigation/StackNavigator';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/SplashScreen';

export default function App() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <Root />
      </AppThemeProvider>
    </AuthProvider>
  );
}

function Root() {
  const { user, loading } = useContext(AuthContext);
  const { mode, theme }   = useAppTheme();
  // theme.colors now contains bg, surface, text, border, primary

  const baseNav = mode === 'light' ? NavLight : NavDark;
  const navTheme = {
    ...baseNav,
    colors: {
      ...baseNav.colors,
      background: theme.colors.bg,
      card:       theme.colors.surface,
      text:       theme.colors.text,
      primary:    theme.colors.primary,
    },
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}