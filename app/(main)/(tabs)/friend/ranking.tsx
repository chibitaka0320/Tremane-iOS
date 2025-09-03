import theme from "@/styles/theme";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function RankingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>今月のトレーニング日数</Text>
      </View>
      <ScrollView>
        <View style={styles.listItem}>
          <View style={styles.itemLeft}>
            <Text style={styles.rank}>1</Text>
            <Text style={styles.name}>ちびたか</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.count}>3</Text>
            <Text style={styles.unit}>days</Text>
          </View>
        </View>
        <View style={styles.listItem}>
          <View style={styles.itemLeft}>
            <Text style={styles.rank}>2</Text>
            <Text style={styles.name}>ちびたか</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.count}>3</Text>
            <Text style={styles.unit}>days</Text>
          </View>
        </View>
        <View style={styles.listItem}>
          <View style={styles.itemLeft}>
            <Text style={styles.rank}>3</Text>
            <Text style={styles.name}>ちびたか</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.count}>3</Text>
            <Text style={styles.unit}>days</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 60,
    backgroundColor: theme.colors.background.light,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  headerTitle: {
    fontSize: theme.fontSizes.medium,
  },

  listItem: {
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[4],
    height: 60,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rank: {
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
    marginRight: theme.spacing[3],
  },
  name: {
    fontSize: theme.fontSizes.medium + 2,
  },

  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  count: {
    fontSize: theme.fontSizes.medium + 2,
    marginRight: theme.spacing[2],
  },
  unit: {
    fontSize: theme.fontSizes.medium,
  },
});
