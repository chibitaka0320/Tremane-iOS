import { useState } from "react";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";

import BodyScreen from "./body";
import TrainingScreen from "./training";
import EatingScreen from "./eating";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString());

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
