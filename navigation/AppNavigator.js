// navigation/AppNavigator.js
import React, { useContext } from 'react';
import { View } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';

import { AuthContext } from '../components/AuthContext';
import { useAppTheme } from '../components/ThemeContext';

import OverviewScreen       from '../screens/OverviewScreen';
import TransactionsScreen   from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import BudgetScreen         from '../screens/BudgetScreen';
import PotsScreen           from '../screens/PotsScreen';
import BillsScreen          from '../screens/BillsScreen';
import AnalyticsScreen      from '../screens/AnalyticsScreen';

import ChatStackNavigator   from './ChatStackNavigator';
import PaymentScreen        from '../screens/PaymentScreen';

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  const { signOut }               = useContext(AuthContext);
  const { mode, theme, toggleMode } = useAppTheme();
  const { bg, surface, text, border } = theme.colors;

  const commonOpts = {
    headerStyle:         { backgroundColor: bg },
    headerTintColor:     text,
    sceneContainerStyle: { backgroundColor: bg },
    drawerStyle:         { backgroundColor: bg },
  };

  return (
    <Drawer.Navigator
      initialRouteName="Overview"
      screenOptions={commonOpts}
      drawerContent={props => (
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flex:1, backgroundColor:bg, paddingTop:0 }}
        >
          <View style={{ flex:1 }}>
            <DrawerItem
              label="Home"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('Overview')}
            />
            <DrawerItem
              label="Transactions"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('Transactions')}
            />
            <DrawerItem
              label="Add Transaction"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('AddTransaction')}
            />
            <DrawerItem
              label="Budget"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('Budget')}
            />
            <DrawerItem
              label="Pots"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('Pots')}
            />
            <DrawerItem
              label="Bills"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('Bills')}
            />
            <DrawerItem
              label="Analytics"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('Analytics')}
            />

            {/* *** Chat lives inside its own stack under a single drawer entry *** */}
            <DrawerItem
              label="Chat"
              labelStyle={{ color: text }}
              onPress={() =>
                props.navigation.navigate('Chat', { screen: 'ChatList' })
              }
            />

            <DrawerItem
              label="Split & Pay"
              labelStyle={{ color: text }}
              onPress={() => props.navigation.navigate('Payment')}
            />

            <View style={{ height:1, backgroundColor:border, marginVertical:12 }} />

            <DrawerItem
              label={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              labelStyle={{ color: text }}
              onPress={toggleMode}
            />
            <DrawerItem
              label="Sign Out"
              labelStyle={{ color: text }}
              onPress={signOut}
            />
          </View>
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen   name="Overview"       component={OverviewScreen} />
      <Drawer.Screen   name="Transactions"   component={TransactionsScreen} />
      <Drawer.Screen   name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
      <Drawer.Screen   name="Budget"         component={BudgetScreen} />
      <Drawer.Screen   name="Pots"           component={PotsScreen} />
      <Drawer.Screen   name="Bills"          component={BillsScreen} />
      <Drawer.Screen   name="Analytics"      component={AnalyticsScreen} />

      {/* Only one entry for Chat */}
      <Drawer.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{ title: 'Chat' }}
      />

      <Drawer.Screen   name="Payment"        component={PaymentScreen} />
    </Drawer.Navigator>
  );
}
