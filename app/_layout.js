import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { Text, View } from "react-native";

// 🔹 Polyfill (required)
if (typeof global.window === "undefined") {
  global.window = global;
}

if (typeof global.CustomEvent === "undefined") {
  global.CustomEvent = function (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    this.type = event;
    this.bubbles = params.bubbles;
    this.cancelable = params.cancelable;
    this.detail = params.detail;
  };
  global.CustomEvent.prototype = Object.create(Object.prototype);
}

// ✅ TOKEN CACHE
const tokenCache = {
  async getToken(key) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key, value) {
    return SecureStore.setItemAsync(key, value);
  },
};

// ✅ SET GLOBAL DEFAULT TEXT FONT
if (Text.defaultProps == null) {
  Text.defaultProps = {};
}
Text.defaultProps.style = {
  fontFamily: "SpaceMono-Regular",
};

export default function RootLayout() {
  const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // ✅ LOAD ONLY WHAT EXISTS (SpaceMono)
  const [fontsLoaded] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <AuthGate />
    </ClerkProvider>
  );
}

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/screen/home");
    } else {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/google-auth" />
      <Stack.Screen name="screen/home" />
      <Stack.Screen name="screen/category" />
      <Stack.Screen name="screen/search" />
      <Stack.Screen name="screen/popularCourses" />
      <Stack.Screen name="screen/courseDetails" />
      <Stack.Screen name="screen/Topmentor" />
      <Stack.Screen name="screen/notication" />
      <Stack.Screen name="screen/myCourses" />
      <Stack.Screen name="screen/videoPlayer" />
      <Stack.Screen name="screen/transactions" />
      <Stack.Screen name="screen/profile" />
      <Stack.Screen name="screen/RequestCertificate" />
      <Stack.Screen name="screen/onlineCourse" />
      <Stack.Screen name="screen/filterSearch" />
      <Stack.Screen name="screen/MyBookMark" />
      <Stack.Screen name="screen/mentorDetails" />
      <Stack.Screen name="screen/payment" />
      <Stack.Screen name="screen/courseprogress" />
      <Stack.Screen name="screen/certificate" />
      <Stack.Screen name="screen/inbox" />
      <Stack.Screen name="screen/Erecept" />
      <Stack.Screen name="screen/EditProfile" />
      <Stack.Screen name="screen/Notifications" />
      <Stack.Screen name="screen/paymentOption" />
      <Stack.Screen name="screen/Addnewcard" />
      <Stack.Screen name="screen/Security" />
      <Stack.Screen name="screen/Language" />
      <Stack.Screen name="screen/Term" />
      <Stack.Screen name="screen/InviteFriends" />
      <Stack.Screen name="screen/categoryCourse" />
    </Stack>
  );
}
