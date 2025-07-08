// screens/BudgetScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient }      from 'expo-linear-gradient';
import styled, { useTheme }    from 'styled-components/native';
import AsyncStorage            from '@react-native-async-storage/async-storage';
import Icon                    from 'react-native-vector-icons/MaterialCommunityIcons';
import uuid                    from 'react-native-uuid';

const { width }   = Dimensions.get('window');
const CARD_MARGIN = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH  = (width - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const GRADIENTS = [
  ['#6EE7B7','#3B82F6'],
  ['#FDE68A','#F59E0B'],
  ['#C084FC','#8B5CF6'],
  ['#86EFAC','#22C55E'],
  ['#FCA5A5','#EF4444'],
  ['#93C5FD','#3B82F6'],
];

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${p => p.theme.bg};
`;

const Header = styled(View)`
  height: 60px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: ${p => p.theme.surface};
  elevation: 4;
`;

const HeaderButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const HeaderTitle = styled(Text)`
  font-size: 22px;
  font-weight: 700;
  color: ${p => p.theme.text};
`;

const SectionTitle = styled(Text)`
  margin: 16px 16px 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${p => p.theme.text};
`;

const Card = styled(Animated.View)`
  width: ${CARD_WIDTH}px;
  margin: ${CARD_MARGIN / 2}px;
  border-radius: 16px;
  overflow: hidden;
  elevation: 6;
`;

const CardContent = styled(View)`
  padding: 16px;
  background-color: rgba(255,255,255,0.85);
`;

const Label = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${p => p.theme.text};
  margin: 8px 0;
`;

const ProgressBar = styled(View)`
  width: 100%;
  height: 6px;
  background-color: ${p => p.theme.border};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled(View)`
  width: ${p => `${p.pct}%`};
  height: 100%;
  background-color: #fff;
`;

const Saved = styled(Text)`
  font-size: 12px;
  color: ${p => p.theme.text};
  text-align: center;
  margin-bottom: 12px;
`;

const BtnRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const Btn = styled(TouchableOpacity)`
  flex: 0.48;
  height: 36px;
  background-color: ${p => p.bg};
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const BtnText = styled(Text)`
  color: #fff;
  margin-left: 6px;
  font-size: 14px;
`;

const ModalContent = styled(View)`
  background-color: ${p => p.theme.surface};
  border-radius: 12px;
  padding: 20px;
  elevation: 6;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 16px;
  text-align: center;
`;

const InputField = styled(TextInput)`
  height: 48px;
  border-width: 1px;
  border-color: ${p => p.theme.border};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: ${p => p.theme.text};
`;

const SaveButton = styled(TouchableOpacity)`
  background-color: ${p => p.theme.primary};
  padding: 14px;
  border-radius: 8px;
  align-items: center;
`;

const SaveButtonText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

export default function BudgetScreen({ navigation }) {
  const theme = useTheme();

  const [pots, setPots]               = useState([]);
  const [refreshing, setRefreshing]   = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isNew, setIsNew]             = useState(true);
  const [current, setCurrent]         = useState(null);
  const [name, setName]               = useState('');
  const [target, setTarget]           = useState('');
  const [amount, setAmount]           = useState('');
  const [mode, setModeAction]         = useState('add');

  useEffect(() => { load(); }, []);

  async function load() {
    const raw = await AsyncStorage.getItem('pots');
    const arr = raw ? JSON.parse(raw) : [];
    const up = arr.map((p,i) => ({
      ...p,
      grad: p.grad || GRADIENTS[i % GRADIENTS.length]
    }));
    setPots(up);
    await AsyncStorage.setItem('pots', JSON.stringify(up));
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openNew = () => {
    setIsNew(true);
    setName('');
    setTarget('');
    setModalVisible(true);
  };

  const openAction = (pot, action) => {
    setIsNew(false);
    setCurrent(pot);
    setModeAction(action);
    setAmount('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (isNew) {
      if (!name.trim() || isNaN(+target) || +target <= 0) {
        return Alert.alert('Oops','Enter a name & positive target');
      }
      const np = {
        id: uuid.v4(),
        name: name.trim(),
        target: +target,
        saved: 0,
        grad: GRADIENTS[pots.length % GRADIENTS.length]
      };
      await save([np, ...pots]);
    } else {
      const v = parseFloat(amount);
      if (isNaN(v) || v <= 0) {
        return Alert.alert('Oops','Enter a positive amount');
      }
      const upd = pots.map(p =>
        p.id === current.id
          ? {
              ...p,
              saved: mode === 'add' ? p.saved + v : Math.max(0, p.saved - v),
              grad: p.grad
            }
          : p
      );
      await save(upd);
    }
    setModalVisible(false);
  };

  async function save(next) {
    const up = next.map((p,i) => ({
      ...p,
      grad: p.grad || GRADIENTS[i % GRADIENTS.length]
    }));
    setPots(up);
    await AsyncStorage.setItem('pots', JSON.stringify(up));
  }

  return (
    <Container>
      <Header>
        <HeaderButton onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={theme.text} />
        </HeaderButton>
        <HeaderTitle>Saving Goals</HeaderTitle>
        <HeaderButton onPress={openNew}>
          <Icon name="plus" size={28} color={theme.text} />
        </HeaderButton>
      </Header>

      <SectionTitle>My Pots</SectionTitle>
      <FlatList
        data={pots}
        keyExtractor={p => p.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ padding: CARD_MARGIN / 2 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index }) => {
          const pct = item.target > 0
            ? Math.min(100, (item.saved / item.target) * 100)
            : 0;
          return (
            <Card entering={FadeInUp.delay(index * 80)}>
              <LinearGradient
                colors={item.grad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              >
                <CardContent>
                  <Icon name="piggy-bank-outline" size={24} color="#fff" />
                  <Label numberOfLines={1}>{item.name}</Label>
                  <ProgressBar>
                    <ProgressFill pct={pct} />
                  </ProgressBar>
                  <Saved>{pct.toFixed(0)}% — ₹{item.saved.toFixed(0)}</Saved>
                  <BtnRow>
                    <Btn bg="#4ade80" onPress={() => openAction(item, 'add')}>
                      <Icon name="plus" color="#fff" />
                      <BtnText>Add</BtnText>
                    </Btn>
                    <Btn bg="#f87171" onPress={() => openAction(item, 'withdraw')}>
                      <Icon name="minus" color="#fff" />
                      <BtnText>Take</BtnText>
                    </Btn>
                  </BtnRow>
                </CardContent>
              </LinearGradient>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', marginTop: 60 }}>
            <Icon name="emoticon-sad-outline" size={48} color={theme.border} />
            <Text style={{ marginTop: 12, color: theme.border }}>
              No pots yet – tap + to create one!
            </Text>
          </View>
        }
      />

      <Modal transparent visible={modalVisible} animationType="fade">
        {/* backdrop: dismiss on tap */}
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        </TouchableWithoutFeedback>

        {/* modal box */}
        <View style={{ position:'absolute', top:0, left:0, right:0, bottom:0, justifyContent:'center', padding:20 }}>
          <ModalContent>
            <ModalTitle>
              {isNew ? 'New Pot' : mode === 'add' ? 'Add Money' : 'Withdraw Money'}
            </ModalTitle>

            {isNew ? (
              <>
                <InputField
                  placeholder="Name"
                  placeholderTextColor={theme.border}
                  value={name}
                  onChangeText={setName}
                />
                <InputField
                  placeholder="Target ₹"
                  placeholderTextColor={theme.border}
                  keyboardType="numeric"
                  value={target}
                  onChangeText={setTarget}
                />
              </>
            ) : (
              <InputField
                placeholder="Amount ₹"
                placeholderTextColor={theme.border}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            )}

            <SaveButton onPress={handleSave}>
              <SaveButtonText>Save</SaveButtonText>
            </SaveButton>
          </ModalContent>
        </View>
      </Modal>
    </Container>
  );
}
