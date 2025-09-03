import theme from "@/styles/theme";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function FriendScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.recordContainer}>
        <Text style={styles.userName}>ちびたか</Text>
        <Text style={styles.recordDatetime}>2025/09/03</Text>
        <View style={styles.bodyPartsItem}>
          <Text style={[styles.item]}>胸</Text>
          <Text style={[styles.item]}>背中</Text>
        </View>
      </View>
      <View style={styles.recordContainer}>
        <Text style={styles.userName}>ちびたか</Text>
        <Text style={styles.recordDatetime}>2025/09/03</Text>
        <View style={styles.bodyPartsItem}>
          <Text style={[styles.item]}>胸</Text>
          <Text style={[styles.item]}>背中</Text>
        </View>
      </View>
      <View style={styles.recordContainer}>
        <Text style={styles.userName}>ちびたか</Text>
        <Text style={styles.recordDatetime}>2025/09/03</Text>
        <View style={styles.bodyPartsItem}>
          <Text style={[styles.item]}>胸</Text>
          <Text style={[styles.item]}>背中</Text>
        </View>
      </View>
      <View style={styles.recordContainer}>
        <Text style={styles.userName}>ちびたか</Text>
        <Text style={styles.recordDatetime}>2025/09/03</Text>
        <View style={styles.bodyPartsItem}>
          <Text style={[styles.item]}>胸</Text>
          <Text style={[styles.item]}>背中</Text>
        </View>
      </View>
      <View style={styles.recordContainer}>
        <Text style={styles.userName}>ちびたか</Text>
        <Text style={styles.recordDatetime}>2025/09/03</Text>
        <View style={styles.bodyPartsItem}>
          <Text style={[styles.item]}>胸</Text>
          <Text style={[styles.item]}>背中</Text>
        </View>
      </View>
      <View style={styles.recordContainer}>
        <Text style={styles.userName}>ちびたか</Text>
        <Text style={styles.recordDatetime}>2025/09/03</Text>
        <View style={styles.bodyPartsItem}>
          <Text style={[styles.item]}>胸</Text>
          <Text style={[styles.item]}>背中</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
  },
  recordContainer: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 4,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  userName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    marginBottom: theme.spacing[1],
  },
  recordDatetime: {
    color: theme.colors.font.gray,
  },
  bodyPartsItem: {
    marginTop: theme.spacing[2],
    flexDirection: "row",
  },
  item: {
    width: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    textAlign: "center",
    marginHorizontal: theme.spacing[2],
    marginVertical: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
});
