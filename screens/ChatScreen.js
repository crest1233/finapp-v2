import React, { useState, useEffect, useContext } from 'react';
import {
  FlatList,
  View,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../components/AuthContext';

const InputRow = styled.View`
  flex-direction: row;
  padding: 8px;
  border-top-width: 1px;
  border-color: ${p => p.theme.colors.border};
  background-color: ${p => p.theme.colors.bg};
`;

const MsgInput = styled.TextInput`
  flex: 1;
  border-width: 1px;
  border-color: ${p => p.theme.colors.border};
  border-radius: 20px;
  padding-horizontal: 12px;
  color: ${p => p.theme.colors.text};
  background-color: ${p => p.theme.colors.surface};
`;

const SendBtn = styled.TouchableOpacity`
  margin-left: 8px;
  justify-content: center;
`;

const SendText = styled.Text`
  color: ${p => p.theme.colors.primary};
  font-weight: 600;
`;

export default function ChatScreen({ route }) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { otherUserId, otherDisplayName } = route.params;
  const threadId = [user.uid, otherUserId].sort().join('_');

  const [msg, setMsg] = useState('');
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'messages', threadId, 'msgs'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap =>
      setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [threadId]);

  const send = async () => {
    if (!msg.trim()) return;
    await addDoc(collection(db, 'messages', threadId, 'msgs'), {
      text:      msg.trim(),
      senderId:  user.uid,
      createdAt: serverTimestamp()
    });
    setMsg('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <FlatList
        data={threads}
        keyExtractor={i => i.id}
        renderItem={({ item }) => {
          const isMe = item.senderId === user.uid;
          return (
            <View
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe
                  ? theme.colors.primary
                  : theme.colors.surface,
                margin: 8,
                padding: 8,
                borderRadius: 8,
                maxWidth: '75%'
              }}
            >
              <Text style={{ color: isMe ? '#fff' : theme.colors.text }}>
                {item.text}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: isMe ? '#eee' : '#888',
                  marginTop: 4
                }}
              >
                {isMe ? 'You' : otherDisplayName}
              </Text>
            </View>
          );
        }}
      />

      <InputRow>
        <MsgInput
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.border}
          value={msg}
          onChangeText={setMsg}
        />
        <SendBtn onPress={send}>
          <SendText>Send</SendText>
        </SendBtn>
      </InputRow>
    </View>
  );
}
