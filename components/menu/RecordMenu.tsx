import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CircleButton } from "@/components/common/CircleButton";
import theme from "@/styles/theme";
import { router } from "expo-router";
import { RefObject, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface Props {
  bottomSheetRef: RefObject<BottomSheetModal | null>;
}

export const RecordMenu = ({ bottomSheetRef }: Props) => {
  // "root": トレーニング・食事・種目リストの初期メニュー
  // "eating": 「食事」タップ後の食事を記録・食品を記録メニュー
  const [menuPage, setMenuPage] = useState<"root" | "eating">("root");

  const onTraining = () => {
    bottomSheetRef.current?.dismiss();
    router.push("/(main)/(add)/training/add");
  };
  const onEating = () => {
    bottomSheetRef.current?.dismiss();
    router.push("/(main)/(add)/eating/add");
  };
  const onMeal = () => {
    bottomSheetRef.current?.dismiss();
    router.push("/(main)/(add)/meal/add");
  };
  const onBody = () => {};
  const onEventList = () => {
    bottomSheetRef.current?.dismiss();
    router.push("/(main)/(add)/exercise");
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        {menuPage === "root" ? (
          <>
            <View style={styles.item}>
              <Text style={styles.menuTitle}>トレーニング</Text>
              <CircleButton style={styles.circleButton} onPress={onTraining}>
                <FontAwesome5
                  name="dumbbell"
                  size={30}
                  color={theme.colors.white}
                />
              </CircleButton>
            </View>
            <View style={styles.item}>
              <Text style={styles.menuTitle}>食事</Text>
              <CircleButton
                style={styles.circleButton}
                onPress={() => setMenuPage("eating")}
              >
                <Ionicons
                  name="restaurant"
                  size={30}
                  color={theme.colors.white}
                />
              </CircleButton>
            </View>
            {/* <View style={styles.item}>
              <Text style={styles.menuTitle}>ボディ</Text>
              <CircleButton style={styles.circleButton} onPress={onBody}>
                <FontAwesome5 name="camera" size={30} color={theme.colors.white} />
              </CircleButton>
            </View> */}
            <View style={styles.item}>
              <Text style={styles.menuTitle}>種目リスト</Text>
              <CircleButton style={styles.circleButton} onPress={onEventList}>
                <MaterialIcons
                  name="list-alt"
                  size={30}
                  color={theme.colors.white}
                />
              </CircleButton>
            </View>
          </>
        ) : (
          <>
            <View style={styles.item}>
              <Text style={styles.menuTitle}>戻る</Text>
              <CircleButton
                style={styles.circleButton}
                onPress={() => setMenuPage("root")}
              >
                <Ionicons
                  name="arrow-back"
                  size={30}
                  color={theme.colors.white}
                />
              </CircleButton>
            </View>
            <View style={styles.item}>
              <Text style={styles.menuTitle}>食事を記録</Text>
              <CircleButton style={styles.circleButton} onPress={onMeal}>
                <Ionicons
                  name="restaurant"
                  size={30}
                  color={theme.colors.white}
                />
              </CircleButton>
            </View>
            <View style={styles.item}>
              <Text style={styles.menuTitle}>食品を記録</Text>
              <CircleButton style={styles.circleButton} onPress={onEating}>
                <MaterialIcons
                  name="set-meal"
                  size={30}
                  color={theme.colors.white}
                />
              </CircleButton>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    width: "50%",
    alignItems: "center",
    paddingBottom: 60,
  },
  menuTitle: {
    fontSize: theme.fontSizes.medium,
    marginBottom: 10,
  },
  circleButton: {
    width: 80,
    height: 80,
  },
});
