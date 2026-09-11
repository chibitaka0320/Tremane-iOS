import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebaseConfig";

const ICON_SIZE = 512;

export type PickedIconImage = { uri: string };

/** 写真ライブラリから正方形にトリミングして画像を選択する（キャンセル時はnull） */
export async function pickIconFromLibrary(): Promise<PickedIconImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("写真ライブラリへのアクセスが許可されていません");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }
  return { uri: result.assets[0].uri };
}

/** カメラで撮影し正方形にトリミングして画像を取得する（キャンセル時はnull） */
export async function pickIconFromCamera(): Promise<PickedIconImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error("カメラへのアクセスが許可されていません");
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }
  return { uri: result.assets[0].uri };
}

/** アイコン表示用に正方形512x512へリサイズ・圧縮する */
export async function resizeIconImage(uri: string): Promise<string> {
  const imageRef = await ImageManipulator.manipulate(uri)
    .resize({ width: ICON_SIZE, height: ICON_SIZE })
    .renderAsync();
  const result = await imageRef.saveAsync({
    compress: 0.8,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

/** Firebase Storageへアップロードし、ダウンロードURLを返す */
export async function uploadIconImage(
  userId: string,
  uri: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const iconRef = ref(storage, `avatars/${userId}.jpg`);
  await uploadBytes(iconRef, blob);
  return getDownloadURL(iconRef);
}
