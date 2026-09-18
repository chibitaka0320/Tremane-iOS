import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  canDelete: boolean;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
  onSelectDelete: () => void;
};

export type IconActionSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

const IconActionSheet = forwardRef<IconActionSheetHandle, Props>(
  function IconActionSheet(
    { canDelete, onSelectCamera, onSelectLibrary, onSelectDelete },
    ref
  ) {
    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
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
        enableDynamicSizing
      >
        <BottomSheetView style={styles.content}>
          <ActionRow
            icon="camera"
            label="カメラで撮影"
            onPress={onSelectCamera}
          />
          <ActionRow
            icon="images"
            label="ライブラリから選択"
            onPress={onSelectLibrary}
          />
          {canDelete && (
            <ActionRow
              icon="trash"
              label="アイコンを削除"
              destructive
              onPress={onSelectDelete}
            />
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => sheetRef.current?.dismiss()}
          >
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default IconActionSheet;

type ActionRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function ActionRow({ icon, label, destructive, onPress }: ActionRowProps) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? theme.colors.error : theme.colors.font.black}
      />
      <Text
        style={[
          styles.actionLabel,
          destructive && styles.actionLabelDestructive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing[5],
    paddingBottom: theme.spacing[6],
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  actionLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.font.black,
  },
  actionLabelDestructive: {
    color: theme.colors.error,
  },
  cancelButton: {
    marginTop: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: theme.colors.background.lightGray,
  },
  cancelText: {
    color: theme.colors.secondary,
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
  },
});
