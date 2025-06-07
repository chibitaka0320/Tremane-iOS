import { useEffect, useState } from "react";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";

import BodyScreen from "./body";
import TrainingScreen from "./training";
import EatingScreen from "./eating";
import { router, useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString());
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
      onDateChanged={(date) => setSelectedDate(date)}
      showTodayButton
    >
      <WeekCalendar onDayPress={(day) => setSelectedDate(day.dateString)} />
      <Tab.Navigator>
        <Tab.Screen name="トレーニング">
          {() => <TrainingScreen selectedDate={selectedDate} />}
        </Tab.Screen>
        <Tab.Screen name="食事" component={EatingScreen} />
        <Tab.Screen name="ボディ" component={BodyScreen} />
      </Tab.Navigator>
    </CalendarProvider>
  );
}
