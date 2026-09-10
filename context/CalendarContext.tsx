import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { createContext, RefObject, useContext, useRef, useState } from "react";

// Contextの型
type CalendarContextType = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  // 月カレンダーのボトムシート参照（ヘッダーのボタンから直接開閉するため）
  monthCalendarRef: RefObject<BottomSheetModal | null>;
};

// Contextを作成
export const CalendarContext = createContext<CalendarContextType>({
  selectedDate: "",
  setSelectedDate: () => {},
  monthCalendarRef: { current: null },
});

// Providerコンポーネント
export const CalendarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const monthCalendarRef = useRef<BottomSheetModal>(null);

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        monthCalendarRef,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

// useContextのカスタムフック
export const useCalendar = () => useContext(CalendarContext);
