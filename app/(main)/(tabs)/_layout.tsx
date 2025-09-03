import { StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import theme from "@/styles/theme";

import AnalysisScreen from "./analysis";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import MainScreen from "./(home)/main";
import FriendTabs from "./friend";

const BottomTab = createBottomTabNavigator();

export default function TabsLayout() {
  const navigation = useNavigation();

  const onMenu = () => {
    router.push("/(main)/(menu)/menu");
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
            <TouchableOpacity onPress={onMenu} style={{ marginRight: 16 }}>
              <Feather name="menu" size={25} />
            </TouchableOpacity>
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
