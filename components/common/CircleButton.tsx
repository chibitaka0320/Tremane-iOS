import theme from "@/styles/theme";
import { TouchableOpacity, StyleSheet, type ViewStyle } from "react-native";

interface Props {
  children: JSX.Element;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CircleButton = (props: Props) => {
  const { children, onPress, style } = props;
  return (
    <TouchableOpacity style={[styles.circleButton, style]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleButton: {
    height: 60,
    width: 60,
    backgroundColor: theme.colors.primary,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});
