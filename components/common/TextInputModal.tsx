import theme from "@/styles/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// iOSはキーボードが閉じ始めるタイミングでkeyboardWillHideが発火するため、
// それに合わせてシートを閉じることでキーボードとシートが同時に動くようにする。
// Androidはwill系イベントが存在しないためkeyboardDidHideを使う。
const KEYBOARD_HIDE_EVENT = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

type Props = {
  visible: boolean;
  title: string;
  value: string;
  suffix?: string;
  keyboardType?: "default" | "numeric";
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

export default function TextInputModal({
  visible,
  title,
  value,
  suffix,
  keyboardType = "default",
  onCancel,
  onConfirm,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  // 日本語IMEの未確定文字（濁点・半濁点・小文字変換など）を壊さないよう、
  // 入力中の値はReactのstate（＝TextInputのvalueプロパティ）ではなくrefで保持する。
  // valueを毎レンダーTextInputへ書き戻すと、ネイティブ側の未確定状態がリセットされてしまうため。
  const textRef = useRef(value);
  // シートを開くたびに変え、TextInputをその時点のvalueで作り直すためのkey。
  // setNativePropsはFabric（newArchEnabled）下でTextInputに対して正しく機能しないため使わない。
  // タイピング中はこのkeyを変更しないので、入力中に再マウントされることはない。
  const [openToken, setOpenToken] = useState(0);

  useEffect(() => {
    if (visible) {
      textRef.current = value;
      setOpenToken((prev) => prev + 1);
      sheetRef.current?.present();
      return;
    }

    // キーボードが表示されていなければ即座に閉じるだけでよい
    if (!Keyboard.isVisible()) {
      sheetRef.current?.dismiss();
      return;
    }

    // キーボードが閉じ始めるイベントに合わせてシートを閉じることで、
    // 「シートが先に閉じてキーボードだけ残る」ズレをなくす
    let dismissed = false;
    const dismissSheet = () => {
      if (dismissed) return;
      dismissed = true;
      sheetRef.current?.dismiss();
    };
    const subscription = Keyboard.addListener(
      KEYBOARD_HIDE_EVENT,
      dismissSheet
    );
    // イベントが発火しない環境向けの保険（通常はイベントの方が先に発火する）
    const fallbackTimer = setTimeout(dismissSheet, 300);

    Keyboard.dismiss();

    return () => {
      subscription.remove();
      clearTimeout(fallbackTimer);
    };
  }, [visible, value]);

  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={renderBackdrop}
      onDismiss={onCancel}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="none"
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.inputRow}>
          <BottomSheetTextInput
            key={openToken}
            style={styles.input}
            defaultValue={value}
            onChangeText={(t) => {
              textRef.current = t;
            }}
            keyboardType={keyboardType}
            autoFocus
          />
          {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={() => onConfirm(textRef.current)}
          >
            <Text style={styles.confirmText}>確認</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing[5],
    paddingBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    paddingVertical: theme.spacing[3],
  },
  suffix: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.font.gray,
    marginLeft: theme.spacing[2],
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.background.light,
  },
  cancelText: {
    color: theme.colors.secondary,
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  confirmText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
  },
});
