import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { Mail, Lock, Eye, EyeOff, Check, Apple, Circle } from "lucide-react-native";
import { useRouter } from "expo-router";


const { width, height } = Dimensions.get("window");

export default function SignUpScreen() {
    const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.heading}>Getting Started.!</Text>
        <Text style={styles.subheading}>Create an Account to Continue your eCourse</Text>


        <View style={styles.inputWrapper}>
          <Mail size={22} color="#6c7480" style={styles.iconLeft}/>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>


        <View style={styles.inputWrapper}>
          <Lock size={22} color="#6c7480" style={styles.iconLeft}/>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={22} color="#6c7480"/>
            ) : (
              <Eye size={22} color="#6c7480"/>
            )}
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          style={styles.checkContainer}
          onPress={() => setAgree(!agree)}
        >
          {agree ? (
            <Check size={20} color="#fff" style={styles.checkedBox}/>
          ) : (
            <View style={styles.checkbox}/>
          )}
          <Text style={styles.checkboxText}>Agree to Terms & Conditions</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => router.push("auth/fill-details")} style={styles.signupBtn}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or Continue With</Text>


        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Image
              source={require("../../assets/images/google.png")}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={require("../../assets/images/apple.png")}
            style={{ width: 20, height: 20 }}
          />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("auth/signin")}>
          <Text style={styles.loginText}>
            Already have an Account? <Text style={styles.signin}>SIGN IN</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8ff",
  },
  scrollContainer: {
    padding: width * 0.06,
    alignItems: "center",
  },
  logoContainer: {
    marginTop: height * 0.03,
    alignItems: "center",
  },
  logo: {
    width: width * 0.35,
    height: width * 0.25,
  },
  heading: {
    fontSize: width * 0.065,
    fontWeight: "700",
    marginTop: height * 0.02,
    color: "#0c1025",
  },
  subheading: {
    fontSize: width * 0.038,
    color: "#555",
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  inputWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    borderWidth: 1,
    borderColor: "#e2e5ea",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.018,
  },
  iconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: width * 0.04,
    color: "#000",
  },
  checkContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: height * 0.03,
  },
  checkbox: {
    width: width * 0.045,
    height: width * 0.045,
    borderColor: "#999",
    borderWidth: 1.8,
    borderRadius: 3,
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: "#1dd75a",
    borderRadius: 3,
    padding: 4,
    marginRight: 10,
  },
  checkboxText: {
    fontSize: width * 0.038,
    color: "#444",
  },
  signupBtn: {
    width: "100%",
    backgroundColor: "#0057ff",
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: height * 0.03,
  },
  signupText: {
    fontSize: width * 0.045,
    color: "#fff",
    fontWeight: "600",
  },
  orText: {
    fontSize: width * 0.038,
    color: "#666",
    marginBottom: height * 0.015,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: height * 0.03,
  },
  socialBtn: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: width * 0.02,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: width * 0.035,
    marginBottom: height * 0.05,
  },
  signin: {
    color: "#0057ff",
    fontWeight: "700",
  },
});
