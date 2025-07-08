// screens/OverviewScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { AuthContext } from '../components/AuthContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Container = styled.View`
  flex: 1;
  background-color: ${p => p.theme.colors.bg};
  padding: 20px;
`;
const Card = styled.View`
  background-color: ${p => p.theme.colors.surface};
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  elevation: 2;
`;
const CardTitle = styled.Text`
  font-size: 14px;
  color: ${p => p.theme.colors.text};
`;
const CardValue = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${p => p.theme.colors.primary};
  margin-top: 8px;
`;
const SectionHeader = styled.Text`
  font-size: 16px;
  color: ${p => p.theme.colors.text};
  margin: 16px 0 8px;
`;
const TxRow = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${p => p.theme.colors.surface};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  elevation: 1;
`;
const TxDetails = styled.View`
  flex: 1;
  margin-left: 12px;
`;
const TxDesc = styled.Text`
  color: ${p => p.theme.colors.text};
`;
const TxAmt = styled.Text`
  color: ${p => (p.type === 'income' ? '#4ade80' : '#f87171')};
  font-weight: bold;
`;
const ActionsRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-vertical: 16px;
`;

export default function OverviewScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const theme = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [pots, setPots]                 = useState([]);
  const [balance, setBalance]           = useState(0);
  const [income, setIncome]             = useState(0);
  const [expense, setExpense]           = useState(0);

  useEffect(() => {
    const txQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc')
    );
    const unsubTx = onSnapshot(txQuery, snap => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(txs);
      let inc = 0, exp = 0;
      txs.forEach(t => t.type === 'income' ? inc += t.amount : exp += t.amount);
      setIncome(inc);
      setExpense(exp);
      setBalance(inc - exp);
    });

    const potsCol = collection(db, 'users', user.uid, 'pots');
    const unsubPots = onSnapshot(potsCol, snap =>
      setPots(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubTx(); unsubPots(); };
  }, [user.uid]);

  return (
    <Container>
      <Card>
        <CardTitle>Your Balance</CardTitle>
        <CardValue>₹{balance.toFixed(2)}</CardValue>
      </Card>

      <SectionHeader>Quick Summary</SectionHeader>
      <Card>
        <CardTitle>Income</CardTitle>
        <CardValue>₹{income.toFixed(2)}</CardValue>
      </Card>
      <Card>
        <CardTitle>Expenses</CardTitle>
        <CardValue>₹{expense.toFixed(2)}</CardValue>
      </Card>

      <SectionHeader>Your Pots</SectionHeader>
      <FlatList
        data={pots}
        horizontal
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ width: 120, marginRight: 12 }}>
            <CardTitle>{item.name}</CardTitle>
            <CardValue>₹{item.current ?? item.saved ?? 0}</CardValue>
          </Card>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <SectionHeader>Quick Actions</SectionHeader>
      <ActionsRow>
        <TouchableOpacity
          onPress={() =>
            // ← Navigate into the Chat stack, then show ChatList
            navigation.navigate('Chat', { screen: 'ChatList' })
          }
          style={{ alignItems: 'center' }}
        >
          <Icon name="message-text-outline" size={32} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Payment')}
          style={{ alignItems: 'center' }}
        >
          <Icon name="currency-inr" size={32} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>Split & Pay</Text>
        </TouchableOpacity>
      </ActionsRow>

      <SectionHeader>Recent Transactions</SectionHeader>
      <FlatList
        data={transactions.slice(0, 5)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TxRow>
            <Icon
              name={item.type === 'income' ? 'arrow-up-bold' : 'arrow-down-bold'}
              size={24}
              color={item.type === 'income' ? '#4ade80' : '#f87171'}
            />
            <TxDetails>
              <TxDesc>{item.description || item.category}</TxDesc>
            </TxDetails>
            <TxAmt type={item.type}>
              {item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
            </TxAmt>
          </TxRow>
        )}
      />
    </Container>
  );
}
