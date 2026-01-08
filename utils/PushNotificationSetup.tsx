import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationManager() {
  const [expoPushToken, setExpoPushToken] = useState('');

  // ⚙️ CHANGE this to your local backend URL or production one
  const base =
    process.env.NODE_ENV === 'development'
      ? 'https://trader-sr5j-0k7o.onrender.com'
      : 'https://trader-sr5j-0k7o.onrender.com';

  useEffect(() => {
    const setupNotifications = async () => {
      console.log('🟢 Setting up notifications...');

      const userId = await loadUserId();
      if (!userId) {
        console.log('⚠️ No userId found in storage');
        return;
      }

      console.log('👤 User ID:', userId);

      const token = await registerForPushNotificationsAsync();
      if (!token) {
        console.log('❌ No Expo token was retrieved');
        return;
      }

      console.log('✅ Got Expo Push Token:', token);
      setExpoPushToken(token);

      try {
        console.log(`📡 Registering token with backend → ${base}/register-token`);
        const res = await fetch(`${base}/register-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, token }),
        });
        const data = await res.json();
        console.log('📬 Token registration response from backend:', data);
      } catch (err) {
        console.error('❌ Token registration failed:', err);
      }

      // Listen for notifications when app is in foreground
      const subscription = Notifications.addNotificationReceivedListener((notification) => {
        console.log('📩 Notification received in foreground:', notification);
      });

      return () => {
        console.log('🧹 Cleaning up notification listener');
        subscription.remove();
      };
    };

    setupNotifications();
  }, []);

  return null;
}

/**
 * Load userId from AsyncStorage
 */
async function loadUserId() {
  try {
    const userId = await AsyncStorage.getItem('userId');
    console.log('🗄️ Retrieved userId from AsyncStorage:', userId);
    return userId;
  } catch (err) {
    console.error('❌ Failed to load userId from AsyncStorage:', err);
    return null;
  }
}

/**
 * Ask permission and get Expo Push Token
 */
async function registerForPushNotificationsAsync() {
  let token;

  console.log('🔔 Requesting notification permissions...');
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    console.log('🧾 Notification permission status:', finalStatus);

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return null;
    }

    try {
      const response = await Notifications.getExpoPushTokenAsync({
        projectId: 'b50d025b-7da3-4340-b39d-83db7eddd8e3',
      });
      token = response.data;
      console.log('🎯 Expo Push Token Retrieved:', token);
    } catch (error) {
      console.error('❌ Error while getting Expo push token:', error);
      return null;
    }
  } else {
    console.warn('⚠️ Must use a physical device for push notifications');
    return null;
  }

  if (Platform.OS === 'android') {
    console.log('🤖 Setting Android notification channel...');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
