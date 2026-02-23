import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onGooglePress = useCallback(async () => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({ useProxy: true }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/screen/home");
      }
    } catch (err) {
      console.log("Google Login Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Decorative Element */}
        <View style={styles.headerDecoration} />

        <View style={styles.main}>
          {/* Brand Section */}
          <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
  <View style={styles.logoCircle}>
    <Image
      source={require("../../assets/images/onboarding-logo.png")} // change path
      style={styles.logoImage}
      resizeMode="contain"
    />
  </View>
</View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Log in to your account to continue where you left off.
            </Text>
          </View>

          {/* Login Section */}
          <View style={styles.loginSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Authenticating...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={onGooglePress}
                activeOpacity={0.7}
              >
                <Image
                  source={require("../../assets/images/google.png")}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{"\n"}
            <Text
    style={styles.footerLink}
    onPress={() => router.push("screen/Term")}
  >
    Terms of Service
  </Text>
  <Text> and </Text>

            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Ultra-light slate blue/gray
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerDecoration: {
    height: 4,
    width: 60,
    backgroundColor: "#2563eb",
    borderRadius: 2,
    marginTop: 20,
    alignSelf: "center",
    opacity: 0.2,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
    // Soft outer glow for the logo
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 24, // Modern "squircle" look
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoImage: {
  width: 100,
  height: 100,
},
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A", // Slate 900
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B", // Slate 500
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginSection: {
    width: "100%",
    maxWidth: 400,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    // Clean shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155", // Slate 700
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  footer: {
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  footerLink: {
    color: "#475569",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
