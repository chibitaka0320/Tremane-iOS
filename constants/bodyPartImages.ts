import { ImageSourcePropType } from "react-native";

// 部位ごとの画像
export const bodyPartImages: Record<number, ImageSourcePropType> = {
  1: require("@/images/parts/Chest.png"),
  2: require("@/images/parts/Back.png"),
  3: require("@/images/parts/Shoulder.png"),
  4: require("@/images/parts/Biceps.png"),
  5: require("@/images/parts/Tricep.png"),
  6: require("@/images/parts/Legs.png"),
  7: require("@/images/parts/Abs.png"),
};
