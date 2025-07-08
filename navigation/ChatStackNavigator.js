// navigation/ChatStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen     from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="ChatList">
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Friends' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.otherDisplayName
        })}
      />
    </Stack.Navigator>
  );
}
