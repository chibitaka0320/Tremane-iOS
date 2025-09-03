import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FriendScreen from "./timeline";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, Modal } from "react-native";
import RankingScreen from "./ranking";
import FriendAddScreen from "./add";

const TopTab = createMaterialTopTabNavigator();

export default function FriendTabs() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const addUser = () => {
    setModalVisible(true);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity
            onPress={addUser}
            style={{ marginRight: 16, marginBottom: 8 }}
          >
            <Feather name="user-plus" size={26} />
          </TouchableOpacity>
        );
      },
    });
  }, []);

  return (
    <>
      <TopTab.Navigator>
        <TopTab.Screen name="タイムライン" component={FriendScreen} />
        <TopTab.Screen name="ランキング" component={RankingScreen} />
      </TopTab.Navigator>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <FriendAddScreen onClose={() => setModalVisible(false)} />
      </Modal>
    </>
  );
}
