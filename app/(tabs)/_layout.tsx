import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";

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
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { CircleButton } from "@/components/common/CircleButton";
import { RecordMenu } from "@/components/menu/RecordMenu";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const navigation = useNavigation();

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
        <WeekCalendar onDayPress={(day) => setSelectedDate(day.dateString)} />
        <Tab.Navigator>
          <Tab.Screen name="トレーニング">
            {() => <TrainingScreen selectedDate={selectedDate} />}
          </Tab.Screen>
          <Tab.Screen name="食事" component={EatingScreen} />
          <Tab.Screen name="ボディ" component={BodyScreen} />
        </Tab.Navigator>

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
