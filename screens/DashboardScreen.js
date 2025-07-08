import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const Container = styled(View)`flex:1; background-color:${p => p.theme.bg}; padding:20px;`;
const Title = styled(Text)`color:${p => p.theme.text}; font-size:24px; margin-bottom:20px;`;

export default function DashboardScreen({ toggleTheme }) {
  return (
    <Container>
      <Title>Welcome to FinanceApp!</Title>
      <TouchableOpacity onPress={toggleTheme} style={{ marginBottom: 12 }}>
        <Text style={{ color: p => p.theme.primary }}>Toggle Light/Dark Mode</Text>
      </TouchableOpacity>
      {/* TODO: Balance card, Pots preview, Analytics charts, Transactions list */}
    </Container>
  );
}