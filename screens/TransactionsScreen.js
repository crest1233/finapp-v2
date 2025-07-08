// screens/TransactionsScreen.js
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { SectionList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import { AuthContext } from '../components/AuthContext';
import { db }          from '../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Styled components
const Container = styled.View`
  flex: 1;
  background-color: ${p => p.theme.bg};
`;

const SectionHeader = styled.Text`
  background-color: ${p => p.theme.bg};
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  color: ${p => p.theme.text};
`;

const TxRow = styled.View`
  flex-direction: row;
  align-items: center;
  background: ${p => p.theme.surface};
  margin: 4px 16px;
  padding: 12px;
  border-radius: 8px;
  elevation: 1;
`;

const TxDetails = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const TxDesc = styled.Text`
  color: ${p => p.theme.text};
`;

const TxAmt = styled.Text`
  color: ${props => (props.type === 'income' ? '#4ade80' : '#f87171')};
  font-weight: bold;
`;

// Helper to group transactions by date string
function groupByDate(items) {
  return items.reduce((acc, tx) => {
    const date = tx.createdAt?.toDate().toDateString() || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});
}

export default function TransactionsScreen() {
  const { user } = useContext(AuthContext);
  const [sections, setSections]   = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    setRefreshing(true);
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const grouped = groupByDate(txs);
      const secs = Object.keys(grouped).map(date => ({
        title: date,
        data: grouped[date]
      }));
      setSections(secs);
      setRefreshing(false);
    });
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    const unsub = fetchData();
    return unsub;
  }, [fetchData]);

  return (
    <Container>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#888" />
        }
        renderSectionHeader={({ section }) => (
          <SectionHeader>{section.title}</SectionHeader>
        )}
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
        ListEmptyComponent={<SectionHeader>No transactions yet.</SectionHeader>}
      />
    </Container>
  );
}
