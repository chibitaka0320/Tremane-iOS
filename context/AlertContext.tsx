import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

type AlertContextType = {
  setError: (message: string, onOk?: () => void) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [onOkCallback, setOnOkCallback] = useState<(() => void) | null>(null);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (errorMessage && !hasShown) {
      setHasShown(true);
      Alert.alert("エラー", errorMessage, [
        {
          text: "OK",
          onPress: () => {
            onOkCallback?.();
            setErrorMessage(null);
            setOnOkCallback(null);
            setHasShown(false);
          },
        },
      ]);
    }
  }, [errorMessage, hasShown]);

  const setError = (message: string, onOk?: () => void) => {
    if (!hasShown) {
      setErrorMessage(message);
      setOnOkCallback(() => onOk ?? null);
    }
  };

  return (
    <AlertContext.Provider value={{ setError }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("use Alert must be used within an AlertProvider");
  }
  return context;
};
