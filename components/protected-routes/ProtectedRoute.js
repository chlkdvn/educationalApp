// ProtectedRoute.js
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          router.replace("/"); // redirect to login if not authenticated
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4E61D3" />
      </View>
    );
  }

  return children;
};

export default ProtectedRoute;
