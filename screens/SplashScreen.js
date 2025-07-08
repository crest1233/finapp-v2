// screens/SplashScreen.js
import React, { useContext, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { AuthContext }      from '../components/AuthContext';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${p => p.theme.bg};
`;

const Logo = styled.Text`
  font-size: 48px;
  font-weight: 900;
  color: ${p => p.theme.primary};
  margin-bottom: 24px;
`;

export default function SplashScreen({ navigation }) {
  const { user, loading } = useContext(AuthContext);
  const theme = useTheme();

  // Once loading is done, navigate
  useEffect(() => {
    if (!loading) {
      navigation.replace(user ? 'App' : 'Auth');
    }
  }, [loading, user, navigation]);

  return (
    <Container>
      <Logo>finance</Logo>
      <ActivityIndicator size="large" color={theme.primary} />
    </Container>
  );
}
