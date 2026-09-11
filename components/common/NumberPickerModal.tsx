import theme from "@/styles/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { Picker } from "@react-native-picker/picker";
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onConfirm: (value: number) => void;
};

export type NumberPickerModalHandle = {
  present: () => void;
  dismiss: () => void;
};

// タイトル・ピッカー・ボタン列がちょうど収まる固定の高さ（動的サイジングだとピッカーのスクロールごとに
// onLayoutが発火してシートが毎回再アニメーションし、画面がガタつくため固定値にしている）
const SNAP_POINTS = [480];

const NumberPickerModal = forwardRef<NumberPickerModalHandle, Props>(
  function NumberPickerModal({ title, value, min, max, unit, onConfirm }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    // シートを開くたびに変え、NumberPickerBodyをその時点のvalueで作り直すためのkey。
    const [openToken, setOpenToken] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setOpenToken((prev) => prev + 1);
          sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      []
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
          <NumberPickerBody
            key={openToken}
            initialValue={value}
            min={min}
            max={max}
            unit={unit}
            onCancel={() => sheetRef.current?.dismiss()}
            onConfirm={onConfirm}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default NumberPickerModal;

type BodyProps = {
  initialValue: number;
  min: number;
  max: number;
  unit: string;
  onCancel: () => void;
  onConfirm: (value: number) => void;
};

// ピッカー操作中の一時的な選択値をここに閉じ込める。
// memo化することで、選択値が変わってもBottomSheetModal本体（親）は再レンダリングされない。
const NumberPickerBody = memo(function NumberPickerBody({
  initialValue,
  min,
  max,
  unit,
  onCancel,
  onConfirm,
}: BodyProps) {
  const [selected, setSelected] = useState(initialValue);

  const options = useMemo(() => {
    const result: number[] = [];
    for (let n = min; n <= max; n++) {
      result.push(n);
    }
    return result;
  }, [min, max]);

  return (
    <>
      <Picker selectedValue={selected} onValueChange={setSelected}>
        {options.map((n) => (
          <Picker.Item key={n} label={`${n} ${unit}`} value={n} />
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
