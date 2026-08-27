import Indicator from "@/components/common/Indicator";
import CustomTextInput from "@/components/common/CustomTextInput";
import { bodyPartImages } from "@/constants/bodyPartImages";
import * as bodyPartService from "@/service/bodyPartService";
import * as trainingService from "@/service/trainingService";
import theme from "@/styles/theme";
import { BodyPart } from "@/types/dto/bodyPartDto";
import { RecentExercise } from "@/types/dto/trainingDto";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// トレーニング追加画面（種目選択）
export default function TrainingAddScreen() {
  const { date: initialDate, partsId: initialPartsId } = useLocalSearchParams<{
    date?: string;
    partsId?: string;
  }>();

  // 日付
  const [date, setDate] = useState(
    initialDate ? parseISO(initialDate) : new Date()
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // 部位・種目データ
  const [isLoading, setLoading] = useState(true);
  const [bodyPartData, setBodyPartData] = useState<BodyPart[]>([]);
  const [selectedPartsId, setSelectedPartsId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [recentExercises, setRecentExercises] = useState<RecentExercise[]>([]);

  // 部位・種目データ取得
  useEffect(() => {
    const init = async () => {
      try {
        const data = await bodyPartService.getBodyPartsWithExercises();
        setBodyPartData(data);
        if (data.length > 0) {
          const preselected = initialPartsId
            ? data.find((part) => part.partsId === Number(initialPartsId))
            : undefined;
          setSelectedPartsId(preselected ? preselected.partsId : data[0].partsId);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 選択中の部位が変わったら、最近使った種目を取得
  useEffect(() => {
    if (selectedPartsId === null) return;

    const fetchRecent = async () => {
      try {
        const recent = await trainingService.getRecentExercisesByPartsId(
          selectedPartsId,
          3
        );
        setRecentExercises(recent);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRecent();
  }, [selectedPartsId]);

  const selectedBodyPart = bodyPartData.find(
    (part) => part.partsId === selectedPartsId
  );

  const filteredExercises =
    selectedBodyPart?.exercises.filter((exercise) =>
      exercise.exerciseName.includes(searchText)
    ) ?? [];

  // 日付選択送信
  const handleDatePickerConfirm = (selected: Date) => {
    setDate(selected);
    setDatePickerVisibility(false);
  };

  // 種目選択（セット入力画面へ遷移）
  const onSelectExercise = (
    exerciseId: string,
    exerciseName: string,
    fromRecent: boolean
  ) => {
    router.push({
      pathname: "/(main)/(add)/training/record",
      params: {
        date: format(date, "yyyy-MM-dd"),
        partsId: String(selectedPartsId),
        partName: selectedBodyPart?.partName ?? "",
        exerciseId,
        exerciseName,
        fromRecent: String(fromRecent),
      },
    });
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          <TouchableOpacity
            style={styles.dateCard}
            onPress={() => setDatePickerVisibility(true)}
          >
            <View style={styles.dateCardLeft}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={theme.colors.font.gray}
              />
              <Text style={styles.dateText}>
                {format(date, "yyyy年M月d日（E）", { locale: ja })}
              </Text>
            </View>
            <Text style={styles.dateChange}>変更</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            date={date}
            isVisible={isDatePickerVisible}
            mode="date"
            locale="ja"
            onConfirm={handleDatePickerConfirm}
            onCancel={() => setDatePickerVisibility(false)}
            pickerStyleIOS={{ alignSelf: "center" }}
            confirmTextIOS="完了"
            cancelTextIOS="キャンセル"
          />

          <Text style={styles.sectionLabel}>部位を選択</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.partsRow}
          >
            {bodyPartData.map((part) => {
              const isSelected = part.partsId === selectedPartsId;
              return (
                <TouchableOpacity
                  key={part.partsId}
                  style={styles.partItem}
                  onPress={() => setSelectedPartsId(part.partsId)}
                >
                  <View
                    style={[
                      styles.partIconCircle,
                      isSelected && styles.partIconCircleSelected,
                    ]}
                  >
                    <Image
                      source={bodyPartImages[part.partsId]}
                      style={styles.partIconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.partLabel,
                      isSelected && styles.partLabelSelected,
                    ]}
                  >
                    {part.partName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>
            種目を選択
          </Text>
          <CustomTextInput
            placeholder="種目名で検索"
            value={searchText}
            onChangeText={setSearchText}
          />

          {recentExercises.length > 0 && (
            <>
              <Text style={styles.subSectionLabel}>最近使った種目</Text>
              {recentExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.exerciseId}
                  style={styles.exerciseRow}
                  onPress={() =>
                    onSelectExercise(
                      exercise.exerciseId,
                      exercise.exerciseName,
                      true
                    )
                  }
                >
                  <Text
                    style={styles.exerciseName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {exercise.exerciseName}
                  </Text>
                  <View style={styles.exerciseRowRight}>
                    <Text style={styles.exerciseLastRecord}>
                      前回 {exercise.weight}kg × {exercise.reps}回
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.font.gray}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <Text style={styles.subSectionLabel}>
            {selectedBodyPart?.partName ?? ""}の種目一覧
          </Text>
          {filteredExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.exerciseId}
              style={styles.exerciseRow}
              onPress={() =>
                onSelectExercise(
                  exercise.exerciseId,
                  exercise.exerciseName,
                  false
                )
              }
            >
              <Text
                style={styles.exerciseName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {exercise.exerciseName}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.font.gray}
              />
            </TouchableOpacity>
          ))}

        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[6],
  },

  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  subtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[1],
    marginBottom: theme.spacing[4],
  },

  // 日付カード
  dateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  dateCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  dateText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.dark,
  },
  dateChange: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },

  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[3],
  },
  subSectionLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },

  // 部位選択
  partsRow: {
    flexDirection: "row",
    paddingBottom: theme.spacing[5],
    gap: theme.spacing[2],
  },
  partItem: {
    width: 56,
    alignItems: "center",
  },
  partIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.background.light,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  partIconCircleSelected: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  partIconImage: {
    width: 48,
    height: 48,
  },
  partLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[1],
  },
  partLabelSelected: {
    color: theme.colors.dark,
    fontWeight: "bold",
  },

  // 種目行
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[1],
  },
  exerciseName: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.dark,
    marginRight: theme.spacing[2],
  },
  exerciseRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    flexShrink: 0,
  },
  exerciseLastRecord: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
});
