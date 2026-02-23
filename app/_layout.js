import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import axios from 'axios';

// Backend URL - removed trailing space
const BACKEND_URL = "https://2c29-102-90-81-15.ngrok-free.app";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user/me`, {
          withCredentials: true
        });
        console.log("response", response);
        // Fixed: Check response.data.success instead of response.success
        if (response.data && response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthGate user={user} />
  );
}

function AuthGate({ user }) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const currentPath = segments.join('/');
    
    // If logged in and on index page, go to home
    if (user && currentPath === '') {
      router.replace('/screen/home');
    }
    
    // If logged in and on auth pages, go to home
    if (user && currentPath.startsWith('auth/')) {
      router.replace('/screen/home');
    }
  }, [user, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Index/Landing Page - shown when not logged in */}
      <Stack.Screen name="index" />
      
      {/* Auth Screens */}
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="auth/biometrics" />
      <Stack.Screen name="auth/change-password" />
      <Stack.Screen name="auth/create-pin" />
      <Stack.Screen name="auth/fill-details" />
      <Stack.Screen name="auth/forgot-password" />
      <Stack.Screen name="auth/google-auth" />
      <Stack.Screen name="auth/signin" />
      <Stack.Screen name="auth/verification-code" />
      
      {/* Main App Screens */}
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
      <Stack.Screen name="screen/allcategory" />
    </Stack>
  );
}