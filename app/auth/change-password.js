import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
  Alert,
} from "react-native";
import { ArrowLeft, ArrowRight, Lock, Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function CreatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const handleContinue = () => {
    // Debug: confirm handler runs
    console.log("handleContinue called", { password, confirmPassword });

    if (password.length > 0 && password === confirmPassword) {
      // Dismiss keyboard so the modal isn't visually obstructed
      Keyboard.dismiss();

      // show modal
      setSuccessModal(true);

      // keep the navigation but comment out for easier testing if modal not visible
      setTimeout(() => {
        setSuccessModal(false);
        // Uncomment when you confirm the modal shows reliably
        router.push("auth/login");
      }, 3000);
    } else {
      // clearer message for empty vs mismatch
      if (!password || !confirmPassword) {
        Alert.alert("Error", "Please fill out both password fields");
      } else {
        Alert.alert("Error", "Passwords do not match!");
      }
    }
  };

  // safe image require - if your image path is wrong this prevents a crash
  let successImage;
  try {
    successImage = require("../../assets/images/success.png");
  } catch (e) {
    console.warn("Success image not found at ../../assets/images/success.png — using placeholder");
    successImage = null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.innerWrap}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <ArrowLeft size={26} color="#000" />
            <Text style={styles.headerText}>Create New Password</Text>
          </View>

          <Text style={styles.subText}>Please create your new password</Text>

          {/* Password Input */}
          <View style={styles.inputBox}>
            <Lock size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputBox}>
            <Lock size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showConfirm}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.verifyBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.verifyText}>Continue</Text>
            <View style={styles.circle}>
              <ArrowRight size={20} color="#000" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS MODAL */}
      <Modal
        visible={successModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        hardwareAccelerated={true}
        onRequestClose={() => setSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {successImage ? (
              <Image source={successImage} style={styles.modalImage} resizeMode="contain" />
            ) : (
              // fallback simple checkmark view if image missing
              <View style={[styles.modalImage, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ fontSize: 36 }}>✓</Text>
              </View>
            )}

            <Text style={styles.modalTitle}>Congratulations</Text>

            <Text style={styles.modalMessage}>
              Your account is ready to use. You will be redirected shortly.
            </Text>

            <ActivityIndicator size="small" color="#000" style={{ marginTop: 12 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF4FF" },
  innerWrap: {
    flexGrow: 1,
    width: "92%",
    alignSelf: "center",
    paddingTop: height * 0.04,
    alignItems: "center",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  headerText: { fontSize: 20, fontWeight: "600" },
  subText: { textAlign: "center", color: "#555", marginBottom: 30, fontSize: 16 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.018,
    marginBottom: 20,
    width: "100%",
    elevation: 2,
  },
  input: { flex: 1, fontSize: width * 0.04, marginLeft: 10, color: "#000" },
  verifyBtn: {
    backgroundColor: "#3A75FF",
    width: "100%",
    height: height * 0.065,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  verifyText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  circle: {
    position: "absolute",
    right: 15,
    width: 35,
    height: 35,
    backgroundColor: "#fff",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    position: "absolute", // <- stronger guarantee it covers everything
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    width: width * 0.78,
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  modalImage: { width: width * 0.45, height: height * 0.18 },
  modalTitle: { fontSize: width * 0.055, fontWeight: "700", marginTop: 10 },
  modalMessage: { textAlign: "center", marginTop: 10, color: "#444", fontSize: width * 0.035 },
});
