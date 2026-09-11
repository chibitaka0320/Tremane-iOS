import theme from "@/styles/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value: string;
  onConfirm: (value: string) => void;
};

export type TextInputModalHandle = {
  present: () => void;
  dismiss: () => void;
};

const TextInputModal = forwardRef<TextInputModalHandle, Props>(
  function TextInputModal({ label, value, onConfirm }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    // 日本語IMEの未確定文字（濁点・半濁点・小文字変換など）を壊さないよう、
    // 入力中の値はReactのstate（＝TextInputのvalueプロパティ）ではなくrefで保持する。
    // valueを毎レンダーTextInputへ書き戻すと、ネイティブ側の未確定状態がリセットされてしまうため。
    const textRef = useRef(value);
    // シートを開くたびに変え、TextInputをその時点のvalueで作り直すためのkey。
    const [openToken, setOpenToken] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          textRef.current = value;
          setOpenToken((prev) => prev + 1);
          sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [value]
    );

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
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>{label}</Text>
          <View style={styles.inputRow}>
            <BottomSheetTextInput
              key={openToken}
              style={styles.input}
              defaultValue={value}
              onChangeText={(t) => {
                textRef.current = t;
              }}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => sheetRef.current?.dismiss()}
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
);

export default TextInputModal;

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
