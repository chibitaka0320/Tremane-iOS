import { getTrainingPartsDao } from "@/localDb/dao/trainingDao";
import { partsColors } from "@/styles/partsColor";
import theme from "@/styles/theme";
import { MarkedDates } from "react-native-calendars/src/types";

export const getMarkedDate = async (
  selectedDate: string
): Promise<MarkedDates> => {
  const marked: MarkedDates = {};
  try {
    const res: { date: string; parts_id: number; name: string }[] =
      await getTrainingPartsDao();

    res.forEach((item: { date: string; parts_id: number; name: string }) => {
      const id = item.parts_id;
      if (!marked[item.date]) {
        marked[item.date] = {
          dots: [],
          selectedColor: theme.colors.primary,
        };
      }
      const color = partsColors[item.parts_id];
      marked[item.date].dots?.push({
        key: String(item.parts_id),
        color,
      });
    });

    marked[selectedDate] = {
      dots: [],
      selectedColor: theme.colors.primary,
    };
  } catch (e) {
    console.error(e);
  }
  return marked;
};
