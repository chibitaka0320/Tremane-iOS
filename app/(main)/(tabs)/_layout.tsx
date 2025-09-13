import { StyleSheet, TouchableOpacity, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import theme from "@/styles/theme";

import AnalysisScreen from "./analysis";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import MainScreen from "./(home)/main";
import FriendTabs from "./friend";
import { apiRequestWithRefresh } from "@/lib/apiClient";

const BottomTab = createBottomTabNavigator();

export default function TabsLayout() {
  const navigation = useNavigation();
  const [count, setCount] = useState(0);

  // 未読件数取得
  const getNonNotificationCount = async () => {
    try {
      const response = await apiRequestWithRefresh(
        "/notifications/noread",
        "GET"
      );
      if (response?.ok) {
        const countStr = await response.text();
        setCount(Number(countStr));
      } else {
        console.error("APIレスポンスエラー" + response?.status);
      }
    } catch (error) {
      console.error("API取得エラー：" + error);
    }
  };

  // 通知を既読化
  const markReadAll = async () => {
    try {
      const response = await apiRequestWithRefresh(
        "/notifications/read",
        "PUT"
      );
      if (response?.ok) {
        setCount(0);
      } else {
        console.error("APIレスポンスエラー" + response?.status);
      }
    } catch (error) {
      console.error("API取得エラー：" + error);
    }
  };

  // 未読件数取得（初期表示時）
  useEffect(() => {
    getNonNotificationCount();
  }, []);

  const onMenu = () => {
    router.push("/(main)/(menu)/menu");
  };

  // 通知画面遷移
  const onNotification = () => {
    router.push("/notification");
    markReadAll();
  };

  return (
    <BottomTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.font.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.background.light,
          borderTopColor: theme.colors.lightGray,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: true,
        headerTitle: "",
        headerRight: () => {
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={onNotification}
                style={{ marginRight: 24 }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color="black"
                />
                {count > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      right: 1,
                      top: 1,
                      backgroundColor: "red",
                      borderRadius: "50%",
                      width: 10,
                      height: 10,
                    }}
                  ></View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={onMenu} style={{ marginRight: 16 }}>
                <Feather name="menu" size={25} />
              </TouchableOpacity>
            </View>
          );
        },
      }}
    >
      <BottomTab.Screen
        name="メイン"
        component={MainScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="分析"
        component={AnalysisScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="友達"
        component={FriendTabs}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="user-group" size={size - 6} color={color} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}
