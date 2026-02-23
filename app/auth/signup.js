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
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Mail, Lock, Eye, EyeOff, Check, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";

const { width, height } = Dimensions.get("window");

// ✅ FIXED: Removed trailing space
const BACKEND_URL = "https://2c29-102-90-81-15.ngrok-free.app";

export default function AuthScreen() {
  const router = useRouter();
  
  // Toggle between login and signup
  const [isLoginMode, setIsLoginMode] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI states
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }
    if (!isLoginMode && !name) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!isLoginMode && !agree) {
      Alert.alert("Error", "Please agree to Terms & Conditions");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/user/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        Alert.alert("Success", "Login successful!");
        // ✅ Ensure navigation happens after alert
        setTimeout(() => {
          router.replace("/screen/home");
        }, 100);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const signupFormData = new FormData();
      signupFormData.append('name', name);
      signupFormData.append('email', email);
      signupFormData.append('password', password);
      
      if (previewImage) {
        const filename = previewImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        signupFormData.append('image', {
          uri: previewImage,
          name: filename,
          type,
        });
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/user/signUp`,
        signupFormData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Account created successfully!");
        // ✅ Ensure navigation happens after alert
        setTimeout(() => {
          router.replace("/screen/home");
        }, 100);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Signup failed";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (isLoginMode) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const switchMode = (loginMode) => {
    setIsLoginMode(loginMode);
    // Reset form when switching
    setName("");
    setEmail("");
    setPassword("");
    setAgree(false);
    setPreviewImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            {isLoginMode ? "Welcome Back.!" : "Getting Started.!"}
          </Text>
          <Text style={styles.subheading}>
            {isLoginMode 
              ? "Login to Continue your eCourse" 
              : "Create an Account to Continue your eCourse"}
          </Text>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLoginMode && styles.activeTab]}
              onPress={() => switchMode(true)}
            >
              <Text style={[styles.tabText, isLoginMode && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLoginMode && styles.activeTab]}
              onPress={() => switchMode(false)}
            >
              <Text style={[styles.tabText, !isLoginMode && styles.activeTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Image Upload (Signup only) */}
          {!isLoginMode && (
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {previewImage ? (
                <Image source={{ uri: previewImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <User size={32} color="#6c7480" />
                  <Text style={styles.imageUploadText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Name Input (Signup only) */}
          {!isLoginMode && (
            <View style={styles.inputWrapper}>
              <User size={22} color="#6c7480" style={styles.iconLeft} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#777"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Mail size={22} color="#6c7480" style={styles.iconLeft} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Lock size={22} color="#6c7480" style={styles.iconLeft} />
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
                <EyeOff size={22} color="#6c7480" />
              ) : (
                <Eye size={22} color="#6c7480" />
              )}
            </TouchableOpacity>
          </View>

          {/* Terms Checkbox (Signup only) */}
          {!isLoginMode && (
            <TouchableOpacity
              style={styles.checkContainer}
              onPress={() => setAgree(!agree)}
            >
              {agree ? (
                <View style={styles.checkedBox}>
                  <Check size={16} color="#fff" />
                </View>
              ) : (
                <View style={styles.checkbox} />
              )}
              <Text style={styles.checkboxText}>Agree to Terms & Conditions</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={styles.signupBtn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupText}>
                {isLoginMode ? "Sign In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch Mode Link */}
          <TouchableOpacity onPress={() => switchMode(!isLoginMode)}>
            <Text style={styles.loginText}>
              {isLoginMode 
                ? "Don't have an Account? " 
                : "Already have an Account? "}
              <Text style={styles.signin}>
                {isLoginMode ? "SIGN UP" : "SIGN IN"}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
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
  // Tab styles
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: height * 0.025,
    backgroundColor: "#e8ecf4",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: height * 0.012,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: width * 0.04,
    color: "#6c7480",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#0057ff",
  },
  // Image upload styles
  imageUpload: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e2e5ea",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.02,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imageUploadText: {
    fontSize: width * 0.03,
    color: "#6c7480",
    marginTop: 4,
  },
  // Input styles
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
  // Checkbox styles
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
    width: width * 0.045,
    height: width * 0.045,
    backgroundColor: "#1dd75a",
    borderRadius: 3,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxText: {
    fontSize: width * 0.038,
    color: "#444",
  },
  // Button styles
  signupBtn: {
    width: "100%",
    backgroundColor: "#0057ff",
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: height * 0.05,
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