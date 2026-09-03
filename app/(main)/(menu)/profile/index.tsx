import Indicator from "@/components/common/Indicator";
import NumberPickerModal from "@/components/common/NumberPickerModal";
import SelectModal from "@/components/common/SelectModal";
import TextInputModal from "@/components/common/TextInputModal";
import { activeOptions } from "@/constants/activeOptions";
import { genderOptions } from "@/constants/genderOptions";
import { auth } from "@/lib/firebaseConfig";
import { calcAge, calcBmr, calcTotalCalorie } from "@/lib/calc";
import { validateNickname } from "@/lib/validators";
import * as userProfileService from "@/service/userProfileService";
import * as userService from "@/service/userService";
import theme from "@/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { router, useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type ModalKey =
  | "nickname"
  | "height"
  | "weight"
  | "gender"
  | "activeLevel"
  | null;

const DEFAULT_BIRTHDAY = new Date("2000-01-01");

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [nickname, setNickname] = useState("");
  const [handle, setHandle] = useState<string | null>(null);
  const [height, setHeight] = useState("160");
  const [weight, setWeight] = useState("60");
  const [birthday, setBirthday] = useState<Date>(DEFAULT_BIRTHDAY);
  const [gender, setGender] = useState("0");
  const [activeLevel, setActiveLevel] = useState("0");
  const [bmr, setBmr] = useState("");
  const [totalCalorie, setTotalCalorie] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerTitle: "プロフィール" });
  }, [navigation]);

  // 初回マウント時のみフルスクリーンローディングを表示する（以降のフォーカス復帰時はサイレントに再取得し、画面のちらつきを防ぐ）
  const isFirstLoad = useRef(true);

  useFocusEffect(
    useCallback(() => {
      const showLoading = isFirstLoad.current;
      if (showLoading) setLoading(true);
      const fetchApi = async () => {
        try {
          setNickname(auth.currentUser?.displayName ?? "");

          const user = await userService.getUser();
          setHandle(user?.handle ?? null);

          const res = await userProfileService.getUserProfile();
          if (res) {
            if (res.height != null) setHeight(String(res.height));
            if (res.weight != null) setWeight(String(res.weight));
            if (res.birthday != null) setBirthday(new Date(res.birthday));
            if (res.gender != null) setGender(String(res.gender));
            if (res.activeLevel != null)
              setActiveLevel(String(res.activeLevel));
          }
        } finally {
          if (showLoading) setLoading(false);
          isFirstLoad.current = false;
        }
      };
      fetchApi();
    }, []),
  );

  // 基礎代謝・総消費カロリーの再計算（身長・体重・生年月日・性別・活動レベルのいずれかが変わるたびに再計算）
  useEffect(() => {
    const age = calcAge(format(birthday, "yyyy-MM-dd"));
    const nextBmr = calcBmr(
      parseInt(gender),
      parseFloat(height),
      parseFloat(weight),
      age,
    );
    setBmr(String(nextBmr));
    setTotalCalorie(String(calcTotalCalorie(nextBmr, parseInt(activeLevel))));
  }, [height, weight, birthday, gender, activeLevel]);

  // 身長・体重・性別・活動レベル・生年月日の更新（全項目まとめて送信するAPI仕様のため、変更分だけ差し替えて送信する）
  const saveProfile = async (overrides: {
    height?: string;
    weight?: string;
    birthday?: Date;
    gender?: string;
    activeLevel?: string;
  }) => {
    const user = auth.currentUser;
    if (user == null) return;

    const nextHeight = overrides.height ?? height;
    const nextWeight = overrides.weight ?? weight;
    const nextBirthday = overrides.birthday ?? birthday;
    const nextGender = overrides.gender ?? gender;
    const nextActiveLevel = overrides.activeLevel ?? activeLevel;

    try {
      await userProfileService.upsertUserProfile(
        user.uid,
        parseFloat(nextHeight),
        parseFloat(nextWeight),
        nextBirthday,
        parseInt(nextGender),
        parseInt(nextActiveLevel),
      );
      setHeight(nextHeight);
      setWeight(nextWeight);
      setBirthday(nextBirthday);
      setGender(nextGender);
      setActiveLevel(nextActiveLevel);
    } catch (error) {
      console.error("プロフィール更新失敗：" + error);
      Alert.alert("プロフィールの更新に失敗しました");
    }
  };

  const onConfirmNickname = (value: string) => {
    if (!validateNickname(value)) {
      Alert.alert("ニックネームを入力してください（20文字以内）");
      return;
    }
    const user = auth.currentUser;
    if (user == null) return;

    // 保存の完了を待たずに即座に閉じ、保存はバックグラウンドで行う（失敗時のみAlertで通知）
    setActiveModal(null);
    setNickname(value);
    userService.updateUser(user, value).catch((error) => {
      console.error("ニックネーム更新失敗：" + error);
      Alert.alert("ニックネームの更新に失敗しました");
    });
  };

  const onConfirmHeight = (value: number) => {
    setActiveModal(null);
    saveProfile({ height: String(value) });
  };

  const onConfirmWeight = (value: number) => {
    setActiveModal(null);
    saveProfile({ weight: String(value) });
  };

  const onConfirmGender = (value: string) => {
    setActiveModal(null);
    saveProfile({ gender: value });
  };

  const onConfirmActiveLevel = (value: string) => {
    setActiveModal(null);
    saveProfile({ activeLevel: value });
  };

  const onConfirmBirthday = (date: Date) => {
    setDatePickerVisibility(false);
    saveProfile({ birthday: date });
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <BottomSheetModalProvider>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <SectionTitle icon="person" label="アカウント" />
        <View>
          <Row
            label="ニックネーム"
            value={nickname || "未設定"}
            onPress={() => setActiveModal("nickname")}
          />
          {handle ? (
            <Row
              label="ID"
              value={handle}
              onPress={() => router.push("/(main)/(menu)/profile/handle")}
            />
          ) : (
            <Row
              label="ID"
              warning="要登録"
              onPress={() => router.push("/(main)/(menu)/profile/handle")}
            />
          )}
        </View>

        <SectionTitle icon="fitness" label="身体情報" />
        <View>
          <Row
            label="身長"
            value={`${height} cm`}
            onPress={() => setActiveModal("height")}
          />
          <Row
            label="体重"
            value={`${weight} kg`}
            onPress={() => setActiveModal("weight")}
          />
          <Row
            label="活動レベル"
            value={
              activeOptions.find((o) => o.value === activeLevel)?.label ??
              "未設定"
            }
            onPress={() => setActiveModal("activeLevel")}
          />
          <Row
            label="性別"
            value={
              genderOptions.find((o) => o.value === gender)?.label ?? "未設定"
            }
            onPress={() => setActiveModal("gender")}
          />
          <Row
            label="生年月日"
            value={format(birthday, "yyyy年M月d日")}
            onPress={() => setDatePickerVisibility(true)}
          />
        </View>

        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <Ionicons name="flame" size={18} color={theme.colors.primary} />
            <Text style={styles.calorieTitle}>1日のカロリー目安</Text>
          </View>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>基礎代謝</Text>
            <Text style={styles.calorieValue}>
              {bmr ? Number(bmr).toLocaleString() : "-"}
              <Text style={styles.calorieUnit}>  kcal</Text>
            </Text>
          </View>
          <View style={styles.calorieDivider} />
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>1日の消費カロリー</Text>
            <Text style={styles.calorieValue}>
              {totalCalorie ? Number(totalCalorie).toLocaleString() : "-"}
              <Text style={styles.calorieUnit}>  kcal</Text>
            </Text>
          </View>
          <Text style={styles.calorieCaption}>
            身体情報・活動レベルから算出しています
          </Text>
        </View>

        <TextInputModal
          visible={activeModal === "nickname"}
          title="ニックネームを入力してください"
          value={nickname}
          onCancel={() => setActiveModal(null)}
          onConfirm={onConfirmNickname}
        />
        <NumberPickerModal
          visible={activeModal === "height"}
          title="身長を選択してください"
          value={parseInt(height, 10)}
          min={50}
          max={250}
          unit="cm"
          onCancel={() => setActiveModal(null)}
          onConfirm={onConfirmHeight}
        />
        <NumberPickerModal
          visible={activeModal === "weight"}
          title="体重を選択してください"
          value={parseInt(weight, 10)}
          min={1}
          max={300}
          unit="kg"
          onCancel={() => setActiveModal(null)}
          onConfirm={onConfirmWeight}
        />
        <SelectModal
          visible={activeModal === "gender"}
          title="性別を教えてください"
          value={gender}
          options={genderOptions}
          onCancel={() => setActiveModal(null)}
          onConfirm={onConfirmGender}
        />
        <SelectModal
          visible={activeModal === "activeLevel"}
          title="活動レベルを教えてください"
          value={activeLevel}
          options={activeOptions}
          onCancel={() => setActiveModal(null)}
          onConfirm={onConfirmActiveLevel}
        />
        <DateTimePickerModal
          date={birthday}
          isVisible={isDatePickerVisible}
          mode="date"
          locale="ja"
          onConfirm={onConfirmBirthday}
          onCancel={() => setDatePickerVisibility(false)}
          pickerStyleIOS={{ alignSelf: "center" }}
          confirmTextIOS="完了"
          cancelTextIOS="キャンセル"
        />
      </ScrollView>
    </BottomSheetModalProvider>
  );
}

type RowProps = {
  label: string;
  value?: string;
  warning?: string;
  onPress?: () => void;
};

function Row({ label, value, warning, onPress }: RowProps) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {warning ? (
          <>
            <Ionicons
              name="alert-circle"
              size={16}
              color={theme.colors.error}
            />
            <Text style={styles.rowWarningValue}>{warning}</Text>
          </>
        ) : (
          <Text style={styles.rowValue}>{value}</Text>
        )}
        <MaterialIcons
          name="arrow-forward-ios"
          size={14}
          color={theme.colors.font.gray}
        />
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

type SectionTitleProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
};

function SectionTitle({ icon, label }: SectionTitleProps) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={16} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
  },
  content: {
    paddingBottom: theme.spacing[6],
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[5],
    marginBottom: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  rowLabel: {
    color: theme.colors.font.black,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  rowValue: {
    color: theme.colors.font.gray,
  },
  rowWarningValue: {
    color: theme.colors.error,
    fontWeight: "600",
  },
  calorieCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[5],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[3],
  },
  calorieHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  calorieTitle: {
    fontWeight: "500",
    color: theme.colors.font.black,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[2],
  },
  calorieLabel: {
    color: theme.colors.font.black,
  },
  calorieValue: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.font.black,
  },
  calorieUnit: {
    fontSize: theme.fontSizes.small,
    fontWeight: "400",
    color: theme.colors.font.gray,
  },
  calorieDivider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  calorieCaption: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[2],
  },
});
