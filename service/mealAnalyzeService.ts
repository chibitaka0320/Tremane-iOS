import * as mealAnalyzeApi from "@/api/mealAnalyzeApi";
import { ApiError } from "@/lib/error";
import { PickedMealPhoto, toAnalysisImage } from "@/lib/mealPhoto";
import { MealAnalyzeResponse, MealAnalyzeUsageResponse } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";

export const OFFLINE_MESSAGE =
  "ネットワークに接続されていません。接続を確認してください。";

export const PRIVACY_POLICY_URL =
  "https://chibitaka0320.github.io/tremane-privacy-policy/";

// 写真を外部AI（Anthropic）へ送信することへの同意（ユーザーごとに端末へ保存）
const CONSENT_KEY_PREFIX = "meal_photo_analysis_consent:";

/** 写真解析（外部AIへの送信）に同意済みかどうか */
export async function hasAnalysisConsent(userId: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CONSENT_KEY_PREFIX + userId)) === "true";
  } catch {
    return false;
  }
}

/** 写真解析（外部AIへの送信）への同意を保存する */
export async function saveAnalysisConsent(userId: string): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY_PREFIX + userId, "true");
}

// サーバーが返す日本語メッセージをそのまま表示するステータス
const SERVER_MESSAGE_STATUSES = [400, 422, 429, 502, 503, 504];

/** オンラインかどうか（判定できない場合はオンライン扱いとし、通信時のエラーに任せる） */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    return true;
  }
}

/** 食事写真を解析し、料理・食品とPFCの推定結果を返す */
export async function analyzeMealPhoto(
  photo: PickedMealPhoto
): Promise<MealAnalyzeResponse> {
  const image = await toAnalysisImage(photo);
  const result = await mealAnalyzeApi.analyzeMealPhoto({
    image,
    mediaType: "image/jpeg",
  });
  if (!result) {
    throw new Error("解析結果が空です");
  }
  return result;
}

/** 本日の残り解析回数を取得する（オフライン・取得失敗時はnull） */
export async function getAnalyzeUsage(): Promise<MealAnalyzeUsageResponse | null> {
  try {
    return await mealAnalyzeApi.getAnalyzeUsage();
  } catch (error) {
    console.error("食事写真解析の利用状況取得失敗：" + error);
    return null;
  }
}

/** 解析時のエラーを画面表示用のメッセージに変換する */
export function toAnalyzeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (SERVER_MESSAGE_STATUSES.includes(error.status) && error.message) {
      return error.message;
    }
    return "写真の解析に失敗しました。時間をおいて再度お試しください。";
  }
  // fetch自体の失敗（通信断・タイムアウト）はTypeErrorになる
  if (error instanceof TypeError) {
    return "通信に失敗しました。接続を確認してください。";
  }
  return "写真の解析に失敗しました。時間をおいて再度お試しください。";
}
