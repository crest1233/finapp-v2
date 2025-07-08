// screens/PotsScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { Alert, FlatList, RefreshControl, View, Text } from 'react-native';
import styled from 'styled-components/native';
import { AuthContext } from '../components/AuthContext';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Container = styled.View`
  flex: 1;
  background-color: ${p => p.theme.bg};
  padding: 20px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${p => p.theme.text};
`;

const AddButton = styled.TouchableOpacity`
  padding: 8px;
`;

const PotCard = styled.View`
  background: ${p => p.theme.surface};
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  elevation: 2;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PotInfo = styled.View`
  flex: 1;
`;

const PotName = styled.Text`
  color: ${p => p.theme.text};
  font-size: 16px;
  margin-bottom: 4px;
`;

const PotProgress = styled.View`
  height: 6px;
  background: ${p => p.theme.border};
  border-radius: 3px;
  overflow: hidden;
`;

const PotFill = styled.View`
  width: ${p => p.pct}%;
  height: 100%;
  background: ${p => p.theme.primary};
`;

const Actions = styled.View`
  flex-direction: row;
  margin-left: 12px;
`;

const ActionBtn = styled.TouchableOpacity`
  margin-left: 8px;
`;

export default function PotsScreen() {
  const { user } = useContext(AuthContext);
  const [pots, setPots]           = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const potsCol = collection(db, 'users', user.uid, 'pots');

  useEffect(() => {
    const unsub = onSnapshot(potsCol, qs => {
      const arr = qs.docs.map(d => ({ id: d.id, ...d.data() }));
      setPots(arr);
    });
    return unsub;
  }, [user.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    // real-time listener; just delay clear
    setTimeout(() => setRefreshing(false), 500);
  };

  const addPot = async () => {
    try {
      const name = `Pot ${pots.length + 1}`;
      await addDoc(potsCol, { name, goal: 0, current: 0 });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not create pot.');
    }
  };

  const updatePot = async (id, delta) => {
    try {
      const ref = doc(db, 'users', user.uid, 'pots', id);
      const pot = pots.find(p => p.id === id);
      if (!pot) return;
      const newAmt = Math.max(0, (pot.current || 0) + delta);
      await updateDoc(ref, { current: newAmt });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not update pot.');
    }
  };

  const removePot = async id => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'pots', id));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not delete pot.');
    }
  };

  return (
    <Container
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <HeaderRow>
        <Title>Your Pots</Title>
        <AddButton onPress={addPot}>
          <Icon name="plus-circle-outline" size={28} color={p => p.theme.primary} />
        </AddButton>
      </HeaderRow>

      <FlatList
        data={pots}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const pct = item.goal > 0
            ? Math.min(100, (item.current / item.goal) * 100)
            : 0;
          return (
            <PotCard>
              <PotInfo>
                <PotName numberOfLines={1}>{item.name}</PotName>
                <PotProgress>
                  <PotFill pct={pct} />
                </PotProgress>
                <Text style={{ color: p => p.theme.text, marginTop: 4 }}>
                  ₹{item.current || 0} / ₹{item.goal || 0}
                </Text>
              </PotInfo>
              <Actions>
                <ActionBtn onPress={() => updatePot(item.id, +100)}>
                  <Icon name="plus" size={20} color={p => p.theme.primary} />
                </ActionBtn>
                <ActionBtn onPress={() => updatePot(item.id, -100)}>
                  <Icon name="minus" size={20} color="#f87171" />
                </ActionBtn>
                <ActionBtn onPress={() => removePot(item.id)}>
                  <Icon name="trash-can-outline" size={20} color="#888" />
                </ActionBtn>
              </Actions>
            </PotCard>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: p => p.theme.border, marginTop: 20 }}>
            No pots found. Tap + to create one.
          </Text>
        }
      />
    </Container>
  );
}
