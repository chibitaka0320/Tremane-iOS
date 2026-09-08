import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";

import TrainingScreen from "./training";
import EatingScreen from "./eating";
import { Entypo } from "@expo/vector-icons";
import theme from "@/styles/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { CircleButton } from "@/components/common/CircleButton";
import MonthCalendarModal from "@/components/common/MonthCalendarModal";
import { RecordMenu } from "@/components/menu/RecordMenu";
import { MarkedDates } from "react-native-calendars/src/types";
import * as trainingService from "@/service/trainingService";
import { useCalendar } from "@/context/CalendarContext";

const TopTab = createMaterialTopTabNavigator();

// トップタブナビゲーター（トレーニングと食事）
function TopTabNavigator() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.colors.background.light },
        sceneStyle: { backgroundColor: theme.colors.background.light },
      }}
    >
      <TopTab.Screen name="トレーニング">
        {() => <TrainingScreen />}
      </TopTab.Screen>
      <TopTab.Screen name="食事">{() => <EatingScreen />}</TopTab.Screen>
    </TopTab.Navigator>
  );
}

export default function MainScreen() {
  const { selectedDate, setSelectedDate, monthCalendarRef } = useCalendar();

  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await trainingService.getMarkedDate(selectedDate);
        setMarkedDates(res);
      } catch (error) {
        console.error(`カレンダーマーク情報の取得に失敗：${error}`);
      }
    };
    fetch();
  }, [selectedDate]);

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const onPlusButton = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props: JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <CalendarProvider
      date={selectedDate}
      showTodayButton
      onDateChanged={(day) => {
        setSelectedDate(day.toString());
      }}
    >
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <WeekCalendar
            current={selectedDate}
            firstDay={0}
            allowShadow={false}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markingType="multi-dot"
            markedDates={markedDates}
            theme={{
              calendarBackground: theme.colors.background.light,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.white,
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.font.black,
            }}
          />
          <View style={styles.content}>
            <TopTabNavigator />
          </View>
        </View>

        <CircleButton onPress={onPlusButton} style={styles.button}>
          <Entypo name="plus" size={40} color={theme.colors.white} />
        </CircleButton>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView style={styles.menu}>
            <RecordMenu bottomSheetRef={bottomSheetModalRef} />
          </BottomSheetView>
        </BottomSheetModal>

        <MonthCalendarModal
          ref={monthCalendarRef}
          selected={selectedDate}
          markedDates={markedDates}
          onConfirm={(date) => {
            setSelectedDate(date);
            monthCalendarRef.current?.dismiss();
          }}
        />
      </BottomSheetModalProvider>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  button: {
    position: "absolute",
    right: 40,
    bottom: 20,
  },
  menu: {
    paddingHorizontal: theme.spacing[3],
    paddingTop: theme.spacing[5],
  },
});
