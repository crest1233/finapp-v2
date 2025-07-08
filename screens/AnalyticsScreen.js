// screens/AnalyticsScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ScrollView, View, Text } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { AuthContext }      from '../components/AuthContext';
import { db }               from '../firebaseConfig';
import {
  collection,
  query,
  onSnapshot
} from 'firebase/firestore';
import {
  LineChart,
  PieChart
} from 'react-native-chart-kit';

const Container = styled(ScrollView)`
  flex: 1;
  background-color: ${p => p.theme.bg};
`;

const Section = styled(View)`
  margin: 16px 0;
  padding: 0 16px;
`;

const Title = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: ${p => p.theme.text};
  margin-bottom: 8px;
`;

export default function AnalyticsScreen() {
  const { user }   = useContext(AuthContext);
  const theme      = useTheme();
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users', user.uid, 'transactions'));
    const unsub = onSnapshot(q, snap =>
      setTxs(snap.docs.map(d => d.data()))
    );
    return unsub;
  }, [user.uid]);

  // Prepare line chart: daily expenses
  const dailyMap = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    const d = t.createdAt?.toDate().toISOString().slice(0,10) || '';
    dailyMap[d] = (dailyMap[d]||0) + t.amount;
  });
  const dates = Object.keys(dailyMap).sort();
  const lineLabels = dates.map(d => d.slice(5));
  const lineData   = dates.map(d => dailyMap[d]);

  // Prepare pie chart: by category
  const catMap = {};
  txs.forEach(t => {
    const c = t.category || 'Other';
    catMap[c] = (catMap[c]||0) + t.amount;
  });
  const pieData = Object.entries(catMap).map(([name, amt], i) => ({
    name,
    population: amt,
    color: ['#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6'][i % 5],
    legendFontColor: theme.text,
    legendFontSize: 12
  }));

  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <Container>
      <Section>
        <Title>Daily Expenses</Title>
        {lineData.length > 0 ? (
          <LineChart
            data={{ labels: lineLabels, datasets: [{ data: lineData }] }}
            width={screenWidth}
            height={220}
            yAxisLabel="₹"
            chartConfig={{
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo:   theme.surface,
              decimalPlaces: 0,
              color: () => theme.primary,
              labelColor: () => theme.text,
              propsForDots: { r: '4', fill: theme.primary }
            }}
            style={{ borderRadius: 12 }}
            bezier
          />
        ) : (
          <Text style={{ color: theme.text, textAlign:'center', marginTop:20 }}>
            No expense data to display.
          </Text>
        )}
      </Section>

      <Section>
        <Title>Expenses by Category</Title>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth}
            height={220}
            chartConfig={{ color: () => theme.text }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={{ color: theme.text, textAlign:'center', marginTop:20 }}>
            No transactions yet.
          </Text>
        )}
      </Section>
    </Container>
  );
}
