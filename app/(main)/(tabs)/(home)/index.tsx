import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  CalendarList,
  CalendarProvider,
  WeekCalendar,
} from "react-native-calendars";

import TrainingScreen from "./training";
import EatingScreen from "./eating";
import { Entypo, Ionicons } from "@expo/vector-icons";
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
  const [isCalendarExpanded, setCalendarExpanded] = useState(false);

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
        {isCalendarExpanded ? (
          <CalendarList
            current={selectedDate}
            horizontal
            pagingEnabled
            hideExtraDays
            firstDay={1}
            calendarHeight={320}
            style={styles.calendarList}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markingType={"multi-dot"}
            markedDates={markedDates}
            // CalendarListは選択日のハイライトをcontext.selectedDate経由で判定するため明示的に渡す
            context={{ selectedDate } as any}
            theme={{
              selectedDayBackgroundColor: theme.colors.primary,
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.font.black,
            }}
          />
        ) : (
          <View style={styles.weekCalendarWrapper}>
            <WeekCalendar
              firstDay={1}
              allowShadow={false}
              calendarHeight={40}
              onDayPress={(day: { dateString: string }) =>
                setSelectedDate(day.dateString)
              }
              markingType={"multi-dot"}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: theme.colors.primary,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.font.black,
              }}
            />
          </View>
        )}
        <TouchableOpacity
          style={styles.knobButton}
          onPress={() => setCalendarExpanded((prev) => !prev)}
        >
          <Ionicons
            name={isCalendarExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.font.gray}
          />
        </TouchableOpacity>
        <TopTabNavigator />

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
  calendarList: {
    height: 320,
  },
  weekCalendarWrapper: {
    backgroundColor: theme.colors.white,
  },
  knobButton: {
    alignItems: "center",
    paddingTop: 1,
    paddingBottom: 4,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.lightGray,
  },
});
