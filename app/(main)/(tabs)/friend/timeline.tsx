import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { partsColors } from "@/styles/partsColor";
import theme from "@/styles/theme";
import { TimelineTrainingResponse } from "@/types/api";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function FriendScreen() {
  const [timelineList, setTimelineList] =
    useState<TimelineTrainingResponse[]>();

  const [isLoading, setLoading] = useState(false);

  const getTimeline = async () => {
    setLoading(true);

    try {
      const res = await apiRequestWithRefresh(`/friends/timeline`);

      if (res?.ok) {
        const data: TimelineTrainingResponse[] = await res.json();
        setTimelineList(data);
      } else {
        console.error(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTimeline();
  }, []);

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <ScrollView style={styles.container}>
      {timelineList?.map((training, index) => (
        <View style={styles.recordContainer} key={index}>
          <Text style={styles.userName}>{training.userId}</Text>
          <Text style={styles.recordDatetime}>{training.date.toString()}</Text>
          <View style={styles.bodyPartsItem}>
            {training.bodyParts.map((parts, index) => (
              <Text
                style={[
                  styles.item,
                  { backgroundColor: partsColors[Number(parts.partsId)] },
                ]}
                key={index}
              >
                {parts.bodyPartsName}
              </Text>
            ))}
          </View>
        </View>
      ))}
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
    color: theme.colors.white,
    fontWeight: "bold",
    width: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    textAlign: "center",
    marginHorizontal: theme.spacing[2],
    marginVertical: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
});
