// screens/SplitBillScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { 
  Alert, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Text 
} from 'react-native';
import styled from 'styled-components/native';
import { AuthContext } from '../components/AuthContext';
import { db }          from '../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Container = styled.View`
  flex: 1;
  background-color: ${p => p.theme.bg};
  padding: 20px;
`;

const Input = styled.TextInput`
  background: ${p => p.theme.surface};
  color: ${p => p.theme.text};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.border};
  font-size: 16px;
  margin-bottom: 16px;
`;

const UserRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background: ${p => (p.selected ? p.theme.primary : p.theme.surface)};
  margin-bottom: 8px;
  border-radius: 8px;
`;

const UserText = styled.Text`
  color: ${p => (p.selected ? '#fff' : p.theme.text)};
  margin-left: 12px;
  font-size: 16px;
`;

const Button = styled.TouchableOpacity`
  background: ${p => p.theme.primary};
  padding: 14px;
  border-radius: 8px;
  align-items: center;
  margin-top: 16px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;

export default function SplitBillScreen() {
  const { user } = useContext(AuthContext);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // load all users
    const q = query(collection(db, 'users'));
    return onSnapshot(q, snap =>
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const toggle = id => {
    setSelectedMap(m => ({ ...m, [id]: !m[id] }));
  };

  const handleSplit = async () => {
    const ids = Object.keys(selectedMap).filter(id => selectedMap[id]);
    const amt = parseFloat(amount);
    if (!ids.length || isNaN(amt) || amt <= 0) {
      Alert.alert('Validation', 'Select friends and enter a positive amount.');
      return;
    }
    const share = amt / ids.length;
    const batch = writeBatch(db);
    ids.forEach(fid => {
      const ref = collection(db, 'users', fid, 'ioUs').doc();
      batch.set(ref, {
        from: user.uid,
        amount: share,
        createdAt: serverTimestamp()
      });
    });
    try {
      await batch.commit();
      Alert.alert('Success', `Split ₹${amt.toFixed(2)} among ${ids.length} friends.`);
      setAmount('');
      setSelectedMap({});
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not split bill.');
    }
  };

  return (
    <Container>
      <Input
        placeholder="Total Amount"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <FlatList
        data={allUsers.filter(u => u.id !== user.uid)}
        keyExtractor={u => u.id}
        renderItem={({ item }) => (
          <UserRow
            selected={!!selectedMap[item.id]}
            onPress={() => toggle(item.id)}
          >
            <Icon
              name={selectedMap[item.id] ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={selectedMap[item.id] ? '#fff' : item.id === user.uid ? '#888' : '#444'}
            />
            <UserText selected={!!selectedMap[item.id]}>
              {item.email}
            </UserText>
          </UserRow>
        )}
      />

      <Button onPress={handleSplit}>
        <ButtonText>Split Bill</ButtonText>
      </Button>
    </Container>
  );
}
