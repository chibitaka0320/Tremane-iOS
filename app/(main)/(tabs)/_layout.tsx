import { StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import theme from "@/styles/theme";

import AnalysisScreen from "./analysis";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import MainScreen from "./(home)/main";

const BottomTab = createBottomTabNavigator();

export default function Layout() {
  const navigation = useNavigation();

  const onMenu = () => {
    router.push("/(main)/(menu)/menu");
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={onMenu}>
            <Feather name="menu" size={25} />
          </TouchableOpacity>
        );
      },
    });
  }, []);

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
        headerShown: false,
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
    </BottomTab.Navigator>
  );
}
