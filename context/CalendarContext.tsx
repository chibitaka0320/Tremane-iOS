import { format } from "date-fns";
import { createContext, useContext, useState } from "react";

// Contextの型
type CalendarContextType = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

// Contextを作成
export const CalendarContext = createContext<CalendarContextType>({
  selectedDate: "",
  setSelectedDate: () => {},
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

  return (
    <CalendarContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </CalendarContext.Provider>
  );
};

// useContextのカスタムフック
export const useCalendar = () => useContext(CalendarContext);
