import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [showKey, setShowKey] = useState(true);

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (key: string) => {
    const nextIndex = otp.findIndex((v) => v === "");
    if (nextIndex !== -1) {
      const newOtp = [...otp];
      newOtp[nextIndex] = key;
      setOtp(newOtp);
    }
  };

  const clearLast = () => {
    const lastIndex = otp
      .map((v, i) => (v !== "" ? i : null))
      .filter((x) => x !== null)
      .pop();

    if (lastIndex !== undefined) {
      const newOtp = [...otp];
      newOtp[lastIndex] = "";
      setOtp(newOtp);
    }
  };

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "del"];

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerWrap}>

        {/* Header */}
        <View style={styles.headerRow}>
          <ArrowLeft size={26} color="#000" />
          <Text style={styles.headerText}>Forgot Password</Text>
        </View>

        {/* Message */}
        <Text style={styles.subText}>
          Code has been sent to (+1) ***-***-5229
        </Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {otp.map((v, i) => (
            <View key={i} style={styles.otpBox}>
              <Text style={styles.otpText}>{v ? v : "*"}</Text>
            </View>
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timerText}>
          Resend Code in <Text style={{ color: "#3A75FF" }}>{timer}s</Text>
        </Text>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={() => router.push("auth/change-password")}
          style={styles.verifyBtn}
        >
          <Text style={styles.verifyText}>Verify</Text>

          <View style={styles.circle}>
            <ArrowRight size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Keypad */}
        <View style={styles.keypad}>
          {keypad.map((k, i) => (
            <TouchableOpacity
              key={i}
              style={styles.key}
              onPress={() => {
                if (k === "del") return clearLast();
                handleKeyPress(k);
              }}
            >
              {k === "del" ? (
                showKey ? (
                  <EyeOff size={26} color="#000" />
                ) : (
                  <Eye size={26} color="#000" />
                )
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },

  innerWrap: {
    flex: 1,
    width: "92%",              // ⬅️ keeps ALL content away from edges
    alignSelf: "center",       // ⬅️ perfect centering
    paddingTop: height * 0.02,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerText: {
    fontSize: 20,
    fontWeight: "600",
  },

  subText: {
    marginTop: height * 0.03,
    textAlign: "center",
    color: "#555",
    paddingHorizontal: 10,
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: height * 0.04,
  },

  otpBox: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  otpText: {
    fontSize: 28,
    fontWeight: "bold",
  },

  timerText: {
    marginTop: height * 0.02,
    textAlign: "center",
    color: "#555",
  },

  verifyBtn: {
    marginTop: height * 0.04,
    backgroundColor: "#3A75FF",
    width: "100%",
    height: height * 0.065,
    alignSelf: "center",
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 20,
  },

  verifyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  circle: {
    position: "absolute",
    right: 15,
    width: 35,
    height: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  keypad: {
    marginTop: height * 0.05,
    width: "90%",              // ⬅️ keypad now respects margins
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  key: {
    width: "30%",              // ⬅️ spacing fixed
    height: width * 0.18,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },

  keyText: {
    fontSize: 24,
    fontWeight: "500",
  },
});
