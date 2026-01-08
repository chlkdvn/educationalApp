import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState("email");

  return (
    <SafeAreaView style={styles.container}>
      {/* inner wrapper guarantees consistent horizontal inset on all devices */}
      <View style={styles.inner}>
        {/* HEADER ALWAYS AT THE TOP */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn}>
            <ArrowLeft size={26} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Forgot Password</Text>

          {/* filler for alignment */}
          <View style={{ width: 26 }} />
        </View>

        {/* LARGE EMPTY SPACE FOR IMAGE / ILLUSTRATION */}
        <View style={styles.imageSpace} />

        {/* BOTTOM CONTENT SECTION */}
        <View style={styles.bottomSection}>
          <Text style={styles.instruction}>
            Select which contact details should we use to reset your password
          </Text>

          {/* Email Option */}
          <TouchableOpacity
            style={[
              styles.optionBox,
              selected === "email" && styles.selectedBox,
            ]}
            onPress={() => setSelected("email")}
            activeOpacity={0.8}
          >
            <Image
              source={require("../../assets/images/email_icon.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Via Email</Text>
              <Text style={styles.optionValue}>
                pricilla.frank20@gmail.com
              </Text>
            </View>
          </TouchableOpacity>

          {/* SMS Option */}
          <TouchableOpacity
            style={[
              styles.optionBox,
              selected === "sms" && styles.selectedBox,
            ]}
            onPress={() => setSelected("sms")}
            activeOpacity={0.8}
          >
            <Image
              source={require("../../assets/images/email_icon.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Via SMS</Text>
              <Text style={styles.optionValue}>+91 868-824-5529</Text>
            </View>
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={() => router.push("auth/verification-code")}
            style={styles.continueBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
            <View style={styles.arrowCircle}>
              <ArrowRight size={20} color="#0066FF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    // only top safe-area padding here; horizontal handled by inner wrapper
    paddingTop: Platform.OS === "android" ? height * 0.04 : height * 0.03,
  },

  // INNER wrapper: this guarantees everything is inset from screen edges
  inner: {
    flex: 1,
    paddingHorizontal: width * 0.06, // main horizontal inset (adjustable)
    paddingBottom: height * 0.03,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: height * 0.01,
    marginBottom: height * 0.02,
  },

  backBtn: {
    padding: width * 0.02,
  },

  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: "600",
    color: "#000",
  },

  imageSpace: {
    height: height * 0.25,
    width: "100%",
    marginVertical: height * 0.02,
  },

  bottomSection: {
    flex: 1,
    justifyContent: "flex-start",
    // no extra horizontal padding here — inner handles it
  },

  instruction: {
    textAlign: "center",
    fontSize: width * 0.038,
    color: "#777",
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.02,
  },

  optionBox: {
    alignSelf: "stretch", // stretch to inner wrapper's width
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05, // inner padding inside the white box
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: "transparent",
    // shadow for nicer separation (platform-safe)
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 1 },
    }),
  },

  selectedBox: {
    borderColor: "#0066FF",
    backgroundColor: "#EAF1FF",
  },

  icon: {
    width: width * 0.12,
    height: width * 0.12,
  },

  optionTextWrap: {
    marginLeft: width * 0.05, // spacing between icon and text
    flexShrink: 1,
  },

  optionTitle: {
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#000",
  },

  optionValue: {
    fontSize: width * 0.035,
    color: "#666",
    marginTop: 3,
  },

  continueBtn: {
    alignSelf: "stretch", // respect inner wrapper width
    marginTop: height * 0.04,
    paddingVertical: height * 0.018,
    backgroundColor: "#0066FF",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width * 0.04,
    paddingHorizontal: width * 0.06, // inner spacing for content
  },

  continueText: {
    color: "#fff",
    fontSize: width * 0.043,
    fontWeight: "600",
  },

  arrowCircle: {
    width: width * 0.095,
    height: width * 0.095,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    padding: width * 0.015,
    marginLeft: width * 0.03,
  },
});
