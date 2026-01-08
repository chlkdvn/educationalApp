import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Eye, EyeOff, ChevronLeft, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";


export default function CreatePinScreen() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
const router = useRouter();


  const handleKeyPress = (value) => {
    let updated = [...pin];

    // Add digit
    const emptyIndex = updated.findIndex((i) => i === "");
    if (value !== "delete") {
      if (emptyIndex !== -1) {
        updated[emptyIndex] = value;
      }
    }

    // Delete digit
    if (value === "delete") {
      const lastFilled = updated.map((v, i) => (v !== "" ? i : -1)).filter((i) => i !== -1).pop();
      if (lastFilled !== undefined) {
        updated[lastFilled] = "";
      }
    }

    setPin(updated);
  };

  const keypadNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.headerRow}>
          <ChevronLeft size={26} color="#000" />
          <Text style={styles.headerText}>Create New Pin</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Add a Pin Number to Make Your Account{'\n'}
          more Secure
        </Text>

        {/* PIN Boxes */}
        <View style={styles.pinRow}>
          {pin.map((digit, index) => (
            <View key={index} style={styles.pinBox}>
              <Text style={styles.pinText}>
                {digit === "" ? "" : showPin ? digit : "*"}
              </Text>
            </View>
          ))}
        </View>

        {/* Toggle Show/Hide PIN */}
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPin(!showPin)}
        >
          {showPin ? <EyeOff size={22} /> : <Eye size={22} />}
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity onPress={() => router.push("auth/biometrics")} style={styles.continueBtn}>
          <Text style={styles.continueText}>Continue</Text>
          <ArrowRight size={22} color="#fff" />
        </TouchableOpacity>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {keypadNumbers.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.key}
              onPress={() => item && handleKeyPress(item)}
            >
              {item === "delete" ? (
                <EyeOff size={26} color="#000" />
              ) : (
                <Text style={styles.keyText}>{item}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    paddingTop: 80,  // ⬅️ pushes entire UI downward
    backgroundColor: "#F5F9FF",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "flex-start",
  },

  headerRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 30,
    alignItems: "center",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "#7A7F85",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },

  pinRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 25,
  },

  pinBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  pinText: {
    fontSize: 28,
    fontWeight: "600",
  },

  eyeButton: {
    marginBottom: 35,
  },

  continueBtn: {
    flexDirection: "row",
    backgroundColor: "#2979FF",
    width: "100%",
    height: 55,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
  },

  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  keypad: {
    width: "80%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 25,
  },

  key: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },

  keyText: {
    fontSize: 26,
    fontWeight: "bold",
  },
});
