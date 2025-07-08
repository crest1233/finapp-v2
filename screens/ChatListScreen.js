// screens/ChatListScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { AuthContext } from '../components/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Container = styled.View`
  flex: 1;
  background-color: ${p => p.theme.colors.bg};
`;

const Row = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-color: ${p => p.theme.colors.border};
`;

const Avatar = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${p => p.theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const AvatarText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 18px;
`;

const TextContainer = styled.View`
  flex: 1;
`;

const Name = styled.Text`
  color: ${p => p.theme.colors.text};
  font-size: 16px;
  font-weight: 600;
`;

const Email = styled.Text`
  color: ${p => p.theme.colors.border};
  font-size: 14px;
  margin-top: 4px;
`;

const EmptyText = styled.Text`
  color: ${p => p.theme.colors.border};
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
`;

export default function ChatListScreen({ navigation }) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      snap => {
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id !== user.uid);
        setUsers(list);
        setLoading(false);
      },
      err => {
        console.error('ChatList snapshot error', err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user.uid]);

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Container>
    );
  }

  if (users.length === 0) {
    return (
      <Container>
        <EmptyText>No other users found.</EmptyText>
      </Container>
    );
  }

  const renderItem = ({ item }) => {
    const displayName = item.displayName || item.email || 'Unknown';
    const email       = item.email || '';
    const initial     = displayName.charAt(0).toUpperCase();

    return (
      <Row
        onPress={() =>
          navigation.navigate('Chat', {
            otherUserId: item.id,
            otherDisplayName: displayName
          })
        }
      >
        <Avatar>
          <AvatarText>{initial}</AvatarText>
        </Avatar>

        <TextContainer>
          <Name>{displayName}</Name>
          {!!email && <Email numberOfLines={1}>{email}</Email>}
        </TextContainer>
      </Row>
    );
  };

  return (
    <Container>
      <FlatList
        data={users}
        keyExtractor={u => u.id}
        renderItem={renderItem}
      />
    </Container>
  );
}
