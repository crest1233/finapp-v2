// screens/SignUpScreen.js
import React, { useState, useContext, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Text,
  TouchableOpacity
} from 'react-native';
import styled from 'styled-components/native';
import { AuthContext } from '../components/AuthContext';

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${p => p.theme.bg};
  justify-content: center;
  padding: 24px;
`;

const Input = styled(TextInput)`
  height: 50px;
  border-width: 1px;
  border-color: ${p => p.theme.border};
  background-color: ${p => p.theme.surface};
  color: ${p => p.theme.text};
  border-radius: 12px;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const Button = styled(TouchableOpacity)`
  height: 50px;
  background-color: ${p => p.theme.primary};
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  opacity: ${p => (p.disabled ? 0.6 : 1)};
`;

const BtnText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

export default function SignUpScreen() {
  const { signUp } = useContext(AuthContext);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const pwRef = useRef(null);

  const trySignUp = async () => {
    if (!email || !password) {
      return Alert.alert('Missing fields', 'Please enter both email and password.');
    }
    setLoading(true);
    const ok = await signUp({ email, password });
    setLoading(false);
    if (!ok) {
      return Alert.alert('Sign up failed', 'Please try again.');
    }
    // on success, user is auto-logged in
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Input
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => pwRef.current?.focus()}
        value={email}
        onChangeText={setEmail}
      />
      <Input
        ref={pwRef}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={trySignUp}
        value={password}
        onChangeText={setPassword}
      />
      <Button onPress={trySignUp} disabled={loading || !email || !password}>
        <BtnText>{loading ? 'Signing up…' : 'Sign Up'}</BtnText>
      </Button>
    </Container>
  );
}
