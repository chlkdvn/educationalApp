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
import { Mail, Lock, Eye, EyeOff, Check } from "lucide-react-native";
import { useRouter } from "expo-router";


const { width, height } = Dimensions.get("window");

export default function SignInScreen() {
    const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
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

        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.subheading}>Sign In to continue</Text>


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

  {/* Forgot Password Link */}
  <TouchableOpacity
    style={styles.forgotPasswordContainer}
    onPress={() => router.push("auth/forgot-password")}
  >
    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
  </TouchableOpacity>



        <TouchableOpacity
          style={styles.checkContainer}
          onPress={() => setRemember(!remember)}
        >
          {remember ? (
            <Check size={20} color="#fff" style={styles.checkedBox}/>
          ) : (
            <View style={styles.checkbox}/>
          )}
          <Text style={styles.checkboxText}>Remember Me</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => router.push("auth/signin")} style={styles.signupBtn}>
          <Text style={styles.signupText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("auth/signup")}>
          <Text style={styles.loginText}>
            Don't have an Account? <Text style={styles.signin}>SIGN UP</Text>
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
  forgotPasswordContainer: {
  width: "100%",
  alignItems: "flex-end",
  marginBottom: height * 0.03,
},
forgotPasswordText: {
  color: "#0057ff",
  fontWeight: "600",
  fontSize: width * 0.036,
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
    backgroundColor: "#0057ff",
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
  loginText: {
    fontSize: width * 0.035,
    marginBottom: height * 0.05,
  },
  signin: {
    color: "#0057ff",
    fontWeight: "700",
  },
});
