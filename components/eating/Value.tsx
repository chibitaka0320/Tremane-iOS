import theme from "@/styles/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  intake?: number;
  goal?: number;
};

export default function Value({ intake, goal }: Props) {
  return (
    <View style={styles.container}>
      <Text>{intake ? intake : 0}</Text>
      <Text style={styles.slash}>/</Text>
      <Text>{goal !== null ? goal : "未設定"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing[2],
  },
  slash: {
    paddingHorizontal: theme.spacing[2],
  },
});
