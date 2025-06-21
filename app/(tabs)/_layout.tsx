import { useEffect, useState } from "react";
import { Text } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";

import BodyScreen from "./body";
import TrainingScreen from "./training";
import EatingScreen from "./eating";
import { router, useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import theme from "@/styles/theme";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const navigation = useNavigation();

  const onMenu = () => {
    router.push("/function/menu");
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
    <CalendarProvider
      date={selectedDate}
      showTodayButton
      onDateChanged={(day) => {
        setSelectedDate(day.toString());
      }}
    >
      <WeekCalendar onDayPress={(day) => setSelectedDate(day.dateString)} />
      <Tab.Navigator>
        <Tab.Screen name="トレーニング">
          {() => <TrainingScreen selectedDate={selectedDate} />}
        </Tab.Screen>
        <Tab.Screen name="食事" component={EatingScreen} />
        <Tab.Screen name="ボディ" component={BodyScreen} />
      </Tab.Navigator>
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 40,
          bottom: 60,
          borderRadius: "50%",
          backgroundColor: theme.colors.primary,
          height: 60,
          width: 60,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Entypo name="plus" size={40} color={theme.colors.white} />
      </TouchableOpacity>
    </CalendarProvider>
  );
}
