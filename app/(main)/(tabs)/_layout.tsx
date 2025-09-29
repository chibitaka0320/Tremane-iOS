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
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import MainScreen from "./(home)/main";
import FriendTabs from "./friend";
import { useForegroundNotificationHandler } from "@/hooks/useForegroundNotificationHandler";
import * as notificationService from "@/service/notificationService";
import { ApiError } from "@/lib/error";

const BottomTab = createBottomTabNavigator();

export default function TabsLayout() {
  const navigation = useNavigation();
  const [count, setCount] = useState(0);

  // 未読件数取得
  const getNonNotificationCount = async () => {
    try {
      const count = await notificationService.getNoreadCount();
      setCount(count);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(
          `APIエラー（未読件数取得）：[${error.status}]${error.message}`
        );
      } else {
        console.error(`未読件数の取得に失敗しました：${error}`);
      }
    }
  };

  // 通知を既読化
  const markReadAll = async () => {
    try {
      await notificationService.markReadAll();
      setCount(0);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(
          `APIエラー（通知を既読化）：[${error.status}]${error.message}`
        );
      } else {
        console.error(`通知の既読化処理に失敗しました：${error}`);
      }
    }
  };

  // 未読件数取得（初期表示時）
  useFocusEffect(
    useCallback(() => {
      getNonNotificationCount();
    }, [])
  );

  useForegroundNotificationHandler(() => {
    getNonNotificationCount();
  });

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
