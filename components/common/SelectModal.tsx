import theme from "@/styles/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { Picker } from "@react-native-picker/picker";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  title: string;
  value: string;
  options: SelectOption[];
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

// タイトル・ピッカー・ボタン列がちょうど収まる固定の高さ（動的サイジングだとピッカーのスクロールごとに
// onLayoutが発火してシートが毎回再アニメーションし、画面がガタつくため固定値にしている）
const SNAP_POINTS = [480];

export default function SelectModal({
  visible,
  title,
  value,
  options,
  onCancel,
  onConfirm,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

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
      // ピッカーの内部スクロールジェスチャーとシートのドラッグジェスチャーが競合し、
      // スクロール中にシート位置が動いて見える問題を避けるため、コンテンツ領域のドラッグは無効化する
      // （閉じる操作はハンドルのドラッグ・背景タップ・キャンセル/確認ボタンから可能）
      enableContentPanningGesture={false}
      enableDynamicSizing={false}
      snapPoints={SNAP_POINTS}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <SelectPickerBody
          visible={visible}
          initialValue={value}
          options={options}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

type BodyProps = {
  visible: boolean;
  initialValue: string;
  options: SelectOption[];
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

// ピッカー操作中の一時的な選択値をここに閉じ込める。
// memo化することで、選択値が変わってもBottomSheetModal本体（親）は再レンダリングされない。
const SelectPickerBody = memo(function SelectPickerBody({
  visible,
  initialValue,
  options,
  onCancel,
  onConfirm,
}: BodyProps) {
  const [selected, setSelected] = useState(initialValue);

  // シートが開かれるたびに、保存済みの値（または前回値）を選択位置の初期値として反映する
  useEffect(() => {
    if (visible) {
      setSelected(initialValue);
    }
  }, [visible, initialValue]);

  return (
    <>
      <Picker selectedValue={selected} onValueChange={setSelected}>
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={() => onConfirm(selected)}
        >
          <Text style={styles.confirmText}>確認</Text>
        </TouchableOpacity>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing[5],
    paddingBottom: theme.spacing[6] + theme.spacing[4],
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
    marginTop: theme.spacing[5],
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
