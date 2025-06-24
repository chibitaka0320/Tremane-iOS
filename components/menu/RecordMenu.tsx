import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { CircleButton } from "@/components/common/CircleButton";
import theme from "@/styles/theme";
import { router } from "expo-router";
import { RefObject } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface Props {
  bottomSheetRef: RefObject<BottomSheetModal>;
}

export const RecordMenu = ({ bottomSheetRef }: Props) => {
  const onTraining = () => {
    bottomSheetRef.current?.dismiss();
    router.push("/add/training");
  };
  const onEating = () => {};
  const onBody = () => {};
  const onEventList = () => {};

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
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
          <CircleButton style={styles.circleButton} onPress={onEating}>
            <MaterialIcons
              name="set-meal"
              size={30}
              color={theme.colors.white}
            />
          </CircleButton>
        </View>
        <View style={styles.item}>
          <Text style={styles.menuTitle}>ボディ</Text>
          <CircleButton style={styles.circleButton} onPress={onBody}>
            <FontAwesome5 name="camera" size={30} color={theme.colors.white} />
          </CircleButton>
        </View>
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
