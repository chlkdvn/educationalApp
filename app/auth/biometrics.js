import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function FingerprintScreen() {
  const [showModal, setShowModal] = useState(false);

  const handleContinue = () => {
    setShowModal(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowModal(false);
      // Navigate to homepage if needed
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Set Your Fingerprint</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Center Content */}
      <View style={styles.centerContent}>
        <Text style={styles.subText}>
          Add a Fingerprint to make your account more secure
        </Text>

        <Image
          source={require("../../assets/images/fingerprint.png")}
          style={styles.fingerprint}
          resizeMode="contain"
        />

        <Text style={styles.instruction}>
          Please put your finger on the fingerprint scanner to get started.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>

          <View style={styles.arrowContainer}>
            <ArrowRight size={18} color="#0066FF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Image
              source={require("../../assets/images/profile.png")}
              style={styles.modalImage}
              resizeMode="contain"
            />

            <Text style={styles.modalTitle}>Congratulations</Text>

            <Text style={styles.modalMessage}>
              Your Account is Ready to Use. You will be redirected to the Home
              Page in a Few Seconds.
            </Text>

            <ActivityIndicator size="small" color="#000" style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: width * 0.06,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: height * 0.015,
  },

  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: "600",
    color: "#000",
  },

  backBtn: {
    padding: width * 0.02,
    justifyContent: "center",
    alignItems: "center",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },

  subText: {
    fontSize: width * 0.038,
    textAlign: "center",
    color: "#444",
    marginBottom: height * 0.04,
  },

  fingerprint: {
    width: width * 0.45,
    height: width * 0.45,
  },

  instruction: {
    marginTop: height * 0.03,
    fontSize: width * 0.035,
    color: "#777",
    textAlign: "center",
  },

  bottom: {
    flexDirection: "row",
    justifyContent: "center",
    gap: width * 0.04,
    marginBottom: height * 0.03,
  },

  skipBtn: {
    width: width * 0.34,
    paddingVertical: height * 0.01,
    backgroundColor: "#E6ECF5",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  skipText: {
    color: "#333",
    fontSize: width * 0.038,
    fontWeight: "500",
  },

  continueBtn: {
    width: width * 0.40,
    paddingVertical: height * 0.01,
    backgroundColor: "#0066FF",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width * 0.018,
  },

  continueText: {
    color: "#fff",
    fontSize: width * 0.038,
    fontWeight: "600",
  },

  arrowContainer: {
    width: width * 0.09,
    height: width * 0.09,
    backgroundColor: "#fff",
    borderRadius: width,
    justifyContent: "center",
    alignItems: "center",
  },

  /** MODAL **/
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: width * 0.8,
    backgroundColor: "#fff",
    paddingVertical: height * 0.035,
    paddingHorizontal: width * 0.05,
    borderRadius: 20,
    alignItems: "center",
  },

  modalImage: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: height * 0.02,
  },

  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#000",
    marginBottom: height * 0.015,
  },

  modalMessage: {
    fontSize: width * 0.035,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: height * 0.01,
  },
});
