import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ExerciseScreen from "./exercise";
import { useEffect, useState } from "react";
import { getBodyPartsWithExercises } from "@/localDb/service/bodyPartService";
import { BodypartWithExercise } from "@/types/bodyPart";
import { ActivityIndicator, View } from "react-native";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
  const [dataList, setDataList] = useState<BodypartWithExercise[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBodyPartsWithExercises();
      setDataList(res ?? []);
    };
    fetchData();
  }, []);

  // ローディング中はダミーのスクリーンを返す
  if (!dataList) {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Loading">
          {() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  // データが空なら1つだけダミータブを返す
  if (dataList.length === 0) {
    return (
      <Tab.Navigator>
        <Tab.Screen name="No Data">
          {() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="small" />
            </View>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  // データがある場合はタブを動的に生成
  return (
    <Tab.Navigator>
      {dataList.map((data) => (
        <Tab.Screen key={data.name} name={data.name}>
          {() => <ExerciseScreen data={data} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}
