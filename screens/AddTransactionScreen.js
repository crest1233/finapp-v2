// screens/AddTransactionScreen.js
import React, { useState, useContext } from 'react';
import { Alert, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { AuthContext } from '../components/AuthContext';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const Container = styled(ScrollView)`
  flex: 1;
  background-color: ${p => p.theme.bg};
  padding: 20px;
`;

const Label = styled.Text`
  color: ${p => p.theme.text};
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.TextInput`
  background: ${p => p.theme.surface};
  color: ${p => p.theme.text};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: ${p => p.theme.border};
`;

const Button = styled.TouchableOpacity`
  background: ${p => p.theme.primary};
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;

export default function AddTransactionScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [category, setCategory]       = useState('');
  const [type, setType]               = useState('expense');

  const handleSave = async () => {
    if (!description.trim() || !amount) {
      Alert.alert('Validation', 'Please enter description and amount.');
      return;
    }
    try {
      await addDoc(
        collection(db, 'users', user.uid, 'transactions'),
        {
          description: description.trim(),
          amount: parseFloat(amount),
          category: category.trim() || 'General',
          type,
          createdAt: serverTimestamp()
        }
      );
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save transaction.');
    }
  };

  return (
    <Container>
      <Label>Description</Label>
      <Input
        placeholder="e.g. Grocery"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
      />

      <Label>Amount (₹)</Label>
      <Input
        placeholder="0.00"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Label>Category</Label>
      <Input
        placeholder="e.g. Food"
        placeholderTextColor="#888"
        value={category}
        onChangeText={setCategory}
      />

      <Label>Type</Label>
      <TypeRow>
        <TypeButton
          active={type === 'expense'}
          onPress={() => setType('expense')}
        >
          <TypeText active={type === 'expense'}>Expense</TypeText>
        </TypeButton>
        <TypeButton
          active={type === 'income'}
          onPress={() => setType('income')}
        >
          <TypeText active={type === 'income'}>Income</TypeText>
        </TypeButton>
      </TypeRow>

      <Button onPress={handleSave}>
        <ButtonText>Save Transaction</ButtonText>
      </Button>
    </Container>
  );
}

// below styled for type toggles:

const TypeRow = styled.View`
  flex-direction: row;
  margin-bottom: 24px;
`;

const TypeButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  background: ${p => (p.active ? p.theme.primary : p.theme.surface)};
  border-radius: 8px;
  align-items: center;
  margin-right: ${p => (p.active ? '0px' : '8px')};
  ${p => p.active && `opacity: 0.8;`}
`;

const TypeText = styled.Text`
  color: ${p => (p.active ? '#fff' : p.theme.text)};
  font-weight: 600;
`;
