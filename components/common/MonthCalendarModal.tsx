import theme from "@/styles/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";

type Props = {
  selected: string;
  markedDates: MarkedDates;
  onConfirm: (date: string) => void;
};

// ヘッダー・曜日行・6週分のマス目がちょうど収まる固定の高さ
const SNAP_POINTS = [420];

const MonthCalendarModal = forwardRef<BottomSheetModal, Props>(
  function MonthCalendarModal({ selected, markedDates, onConfirm }, ref) {
    // 選択日にドットが付いていても選択中の丸表示を優先する
    const combinedMarkedDates: MarkedDates = useMemo(
      () => ({
        ...markedDates,
        [selected]: {
          ...markedDates[selected],
          selected: true,
          selectedColor: theme.colors.primary,
        },
      }),
      [markedDates, selected]
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
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
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        snapPoints={SNAP_POINTS}
      >
        <BottomSheetView style={styles.content}>
          <Calendar
            current={selected}
            onDayPress={(day: DateData) => onConfirm(day.dateString)}
            markedDates={combinedMarkedDates}
            markingType="multi-dot"
            theme={{
              calendarBackground: theme.colors.background.light,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.white,
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.font.black,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.font.black,
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default MonthCalendarModal;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[6],
  },
});
