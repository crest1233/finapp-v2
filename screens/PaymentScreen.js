// screens/PaymentScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
  StyleSheet
} from 'react-native';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../components/AuthContext';

export default function PaymentScreen() {
  const { user } = useContext(AuthContext);
  const [friends, setFriends]   = useState([]);
  const [selected, setSelected] = useState({});
  const [total, setTotal]       = useState('');

  // 1) load all users (except yourself) from Firestore
  useEffect(() => {
    (async () => {
      try {
        const qs = await getDocs(collection(db, 'users'));
        const list = qs.docs
          .map(d => ({ uid: d.id, ...d.data() }))
          .filter(u => u.uid !== user.uid && u.vpa); // only those with a VPA
        setFriends(list);
      } catch (e) {
        console.error(e);
        Alert.alert('Error','Could not load friends.');
      }
    })();
  }, [user.uid]);

  const toggle = uid =>
    setSelected(s => ({ ...s, [uid]: !s[uid] }));

  // 2) build and open UPI deep-link for each selected friend
  const splitAndPay = async () => {
    const amt = parseFloat(total);
    const ids = Object.keys(selected).filter(id => selected[id]);
    if (!ids.length || isNaN(amt) || amt <= 0) {
      return Alert.alert('Oops','Select at least one friend and enter a valid amount.');
    }
    const share = (amt / ids.length).toFixed(2);

    for (let fid of ids) {
      const friend = friends.find(f => f.uid === fid);
      if (!friend) continue;

      // unique transaction reference
      const txRef = Date.now().toString();

      // compose standard UPI URI
      const upiUrl = [
        'upi://pay',
        `?pa=${encodeURIComponent(friend.vpa)}`,
        `&pn=${encodeURIComponent(friend.name)}`,
        `&am=${share}`,
        '&cu=INR',
        `&tr=${txRef}`
      ].join('');

      try {
        const canOpen = await Linking.canOpenURL(upiUrl);
        if (!canOpen) {
          Alert.alert(
            'UPI App not found',
            `No UPI app installed to pay ${friend.name} (${friend.vpa}).`
          );
          continue;
        }

        // open the UPI app
        await Linking.openURL(upiUrl);

        // record it in Firestore
        await addDoc(collection(db, 'payments'), {
          from:      user.uid,
          to:        fid,
          amount:    parseFloat(share),
          threadId:  [user.uid, fid].sort().join('_'),
          createdAt: serverTimestamp(),
          txRef
        });
      } catch (err) {
        console.error('Payment error', err);
        Alert.alert('Payment failed', `Could not pay ${friend.name}.`);
      }
    }

    // reset
    setTotal('');
    setSelected({});
    Alert.alert('Done','Split & pay requests sent via your UPI apps.');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Total amount"
        keyboardType="numeric"
        value={total}
        onChangeText={setTotal}
      />

      <FlatList
        data={friends}
        keyExtractor={f => f.uid}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No friends found.</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggle(item.uid)}
            style={[
              styles.friendRow,
              selected[item.uid] && styles.friendRowSelected
            ]}
          >
            <Text style={styles.friendText}>
              {item.name} ({item.vpa})
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.payBtn} onPress={splitAndPay}>
        <Text style={styles.payBtnText}>Split & Pay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  friendRow: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  friendRowSelected: {
    backgroundColor: '#e0e7ff'
  },
  friendText: {
    fontSize: 16
  },
  payBtn: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  payBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20
  }
});
