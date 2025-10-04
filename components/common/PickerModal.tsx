import theme from "@/styles/theme";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ピッカー（選択肢）ラベル型
export type SelectLabel = {
  label: string;
  value: string;
};

// 引数型
type Props = {
  visible: boolean;
  onClose: () => void;
  selectedValue: string;
  onChange: (value: string) => void;
  options: SelectLabel[];
  title?: string;
};

// ピッカーコンポーネント
export default function PickerModal({
  visible,
  onClose,
  selectedValue,
  onChange,
  options,
  title = "選択してください",
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.container} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>完了</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(value) => onChange(value)}
          >
            <Picker.Item label={title} value="" enabled={false} />
            {options.map(({ label, value }) => (
              <Picker.Item key={value} label={label} value={value} />
            ))}
          </Picker>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background.dark,
    borderTopColor: theme.colors.border.light,
    borderTopWidth: 1,
    paddingBottom: theme.spacing[5],
  },
  header: {
    backgroundColor: theme.colors.background.light,
    borderBottomColor: theme.colors.border.light,
    padding: theme.spacing[3],
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  doneButton: {
    paddingHorizontal: theme.spacing[2],
  },
  doneText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.secondary,
  },
});
