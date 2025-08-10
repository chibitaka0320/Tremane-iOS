import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import theme from "@/styles/theme";

export default function AnalysisScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 分析</Text>
        <Text style={styles.description}>
          トレーニングと食事の記録を分析して、あなたの進歩を確認しましょう
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💪 トレーニング分析</Text>
        <Text style={styles.cardText}>• 週間・月間のトレーニング頻度</Text>
        <Text style={styles.cardText}>• 部位別のトレーニング回数</Text>
        <Text style={styles.cardText}>• 重量・回数の推移</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍽️ 食事分析</Text>
        <Text style={styles.cardText}>• カロリー摂取量の推移</Text>
        <Text style={styles.cardText}>• PFCバランスの分析</Text>
        <Text style={styles.cardText}>• 目標達成率</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 総合分析</Text>
        <Text style={styles.cardText}>• 体重・体脂肪率の変化</Text>
        <Text style={styles.cardText}>• トレーニングと食事の相関</Text>
        <Text style={styles.cardText}>• 改善提案</Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>分析機能は開発中です</Text>
        <Text style={styles.placeholderSubText}>
          今後、詳細な分析機能を追加予定です
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    padding: theme.spacing[3],
  },
  section: {
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.font.black,
    marginBottom: theme.spacing[2],
  },
  description: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.font.gray,
    lineHeight: 24,
  },
  card: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 12,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.font.black,
    marginBottom: theme.spacing[2],
  },
  cardText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  placeholder: {
    alignItems: "center",
    paddingVertical: theme.spacing[8],
  },
  placeholderText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[2],
  },
  placeholderSubText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    textAlign: "center",
  },
});
