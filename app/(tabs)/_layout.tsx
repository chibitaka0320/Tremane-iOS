import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { CalendarProvider, Agenda } from "react-native-calendars";

import TrainingScreen from "./training";
import EatingScreen from "./eating";
import { router, useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import { format } from "date-fns";
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
import { getMarkedDate } from "@/lib/getMarkedDate";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetch = async () => {
      const res = await getMarkedDate(selectedDate);
      setMarkedDates(res);
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
          renderEmptyData={() => (
            <Tab.Navigator>
              <Tab.Screen name="トレーニング">
                {() => <TrainingScreen selectedDate={selectedDate} />}
              </Tab.Screen>
              <Tab.Screen name="食事">
                {() => <EatingScreen selectedDate={selectedDate} />}
              </Tab.Screen>
            </Tab.Navigator>
          )}
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
    bottom: 60,
  },
  menu: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[5],
  },
});
