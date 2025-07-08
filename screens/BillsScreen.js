// screens/BillsScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, RefreshControl, Alert } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../components/AuthContext';
import { db }          from '../firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const Container = styled.View`
  flex: 1;
  background-color: ${p => p.theme.bg};
  padding: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${p => p.theme.text};
`;

const AddButton = styled.TouchableOpacity`
  padding: 8px;
`;

const BillCard = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${p => p.theme.surface};
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  elevation: 2;
`;

const BillInfo = styled.View`
  flex: 1;
`;

const BillName = styled.Text`
  color: ${p => p.theme.text};
  font-size: 16px;
  margin-bottom: 4px;
`;

const BillDue = styled.Text`
  color: ${p => p.theme.border};
  font-size: 14px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 8px;
`;

export default function BillsScreen() {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Firestore collection for this user's bills
  const billsCol = collection(db, 'users', user.uid, 'bills');

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = onSnapshot(billsCol, snapshot => {
      setBills(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      console.error(err);
      Alert.alert('Error', 'Could not load bills.');
    });
    return unsub;
  }, [user.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    // data is live-updated; just wait a moment
    setTimeout(() => setRefreshing(false), 500);
  };

  const addBill = async () => {
    try {
      // Prompting minimal data; you could replace with a modal if desired
      const defaultName = 'New Bill';
      const defaultDue  = new Date().toISOString().split('T')[0];
      await addDoc(billsCol, {
        name:    defaultName,
        dueDate: defaultDue,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not add a new bill.');
    }
  };

  const deleteBill = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'bills', id));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not delete that bill.');
    }
  };

  return (
    <Container>
      <Header>
        <Title>Recurring Bills</Title>
        <AddButton onPress={addBill}>
          <Icon name="plus-circle-outline" size={28} color={p => p.theme.primary} />
        </AddButton>
      </Header>

      <FlatList
        data={bills}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <BillCard>
            <BillInfo>
              <BillName numberOfLines={1}>{item.name}</BillName>
              <BillDue>Due: {item.dueDate}</BillDue>
            </BillInfo>
            <ActionButton onPress={() => deleteBill(item.id)}>
              <Icon name="trash-can-outline" size={24} color="#888" />
            </ActionButton>
          </BillCard>
        )}
        ListEmptyComponent={
          <BillInfo>
            <BillName style={{ color: p => p.theme.border, textAlign: 'center', marginTop: 40 }}>
              No bills yet. Tap + to create one!
            </BillName>
          </BillInfo>
        }
      />
    </Container>
  );
}
