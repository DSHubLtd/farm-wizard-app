import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Modal, View } from "react-native";

const ConfirmModal = ({ visible, onConfirm, onCancel }: any) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Confirm</Text>
        <Text style={styles.message}>Are you sure you want to proceed?</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <Text style={styles.confirmText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: 300,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  message: {
    marginVertical: 15,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    marginLeft: 15,
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
  },
  confirmText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default ConfirmModal;
export const showConfirmDialog = () => {
  Alert.alert(
    "Confirm",
    "Are you sure you want to proceed?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("Cancelled"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => console.log("Confirmed"),
      },
    ],
    { cancelable: false }
  );
};
