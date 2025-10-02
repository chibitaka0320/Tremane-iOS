import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { CalendarProvider, Agenda } from "react-native-calendars";

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
import { RecordMenu } from "@/components/menu/RecordMenu";
import { MarkedDates } from "react-native-calendars/src/types";
import * as trainingService from "@/service/trainingService";
import { useCalendar } from "@/context/CalendarContext";

const TopTab = createMaterialTopTabNavigator();

// トップタブナビゲーター（トレーニングと食事）
function TopTabNavigator() {
  return (
    <TopTab.Navigator>
      <TopTab.Screen name="トレーニング">
        {() => <TrainingScreen />}
      </TopTab.Screen>
      <TopTab.Screen name="食事">{() => <EatingScreen />}</TopTab.Screen>
    </TopTab.Navigator>
  );
}

export default function MainScreen() {
  const { selectedDate, setSelectedDate } = useCalendar();

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
        <Agenda
          selected={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          items={{}}
          renderItem={() => null}
          markingType={"multi-dot"}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: theme.colors.primary,
            todayTextColor: theme.colors.primary,
            agendaDayTextColor: theme.colors.font.black,
            agendaDayNumColor: theme.colors.font.black,
            agendaTodayColor: theme.colors.primary,
          }}
          renderEmptyData={() => <TopTabNavigator />}
        />

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
      </BottomSheetModalProvider>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
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
