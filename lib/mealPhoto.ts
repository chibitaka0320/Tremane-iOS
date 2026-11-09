import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

// 解析用画像の長辺サイズ・圧縮率（通信量とAI解析コストを抑えるため縮小する）
const MAX_EDGE = 1024;
const COMPRESS = 0.7;

export type PickedMealPhoto = { uri: string; width: number; height: number };

/** カメラで食事写真を撮影する（キャンセル時はnull） */
export async function pickMealPhotoFromCamera(): Promise<PickedMealPhoto | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error("カメラへのアクセスが許可されていません");
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  if (result.canceled) return null;
  const { uri, width, height } = result.assets[0];
  return { uri, width, height };
}

/** 写真ライブラリから食事写真を選択する（キャンセル時はnull） */
export async function pickMealPhotoFromLibrary(): Promise<PickedMealPhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("写真ライブラリへのアクセスが許可されていません");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  if (result.canceled) return null;
  const { uri, width, height } = result.assets[0];
  return { uri, width, height };
}

/**
 * 解析用に長辺1024pxのJPEGへ縮小し、Base64で返す
 * 画像は端末内の一時ファイルとしてのみ扱い、保存・アップロードはしない
 */
export async function toAnalysisImage(photo: PickedMealPhoto): Promise<string> {
  let context = ImageManipulator.manipulate(photo.uri);
  if (Math.max(photo.width, photo.height) > MAX_EDGE) {
    context =
      photo.width >= photo.height
        ? context.resize({ width: MAX_EDGE })
        : context.resize({ height: MAX_EDGE });
  }
  const imageRef = await context.renderAsync();
  const result = await imageRef.saveAsync({
    compress: COMPRESS,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!result.base64) {
    throw new Error("画像の変換に失敗しました");
  }
  return result.base64;
}
