import React from "react";
import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
export default function Calendar() {
  return (
    <CalendarProvider date={new Date().toISOString()} showTodayButton>
      <ExpandableCalendar />
    </CalendarProvider>
  );
}
