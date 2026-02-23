import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const Notification = () => {
  const [notifications, setNotifications] = useState({
    specialOffers: true,
    sound: true,
    vibrate: false,
    generalNotification: true,
    promoDiscount: false,
    paymentOptions: true,
    appUpdate: true,
    newServiceAvailable: false,
    newTipsAvailable: false,
  });

  const toggleSwitch = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationItems = [
    { key: 'specialOffers', label: 'Special Offers' },
    { key: 'sound', label: 'Sound' },
    { key: 'vibrate', label: 'Vibrate' },
    { key: 'generalNotification', label: 'General Notification' },
    { key: 'promoDiscount', label: 'Promo & Discount' },
    { key: 'paymentOptions', label: 'Payment Options' },
    { key: 'appUpdate', label: 'App Update' },
    { key: 'newServiceAvailable', label: 'New Service Available' },
    { key: 'newTipsAvailable', label: 'New Tips Available' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationList}>
          {notificationItems.map((item, index) => (
            <View 
              key={item.key} 
              style={[
                styles.notificationItem,
                index === notificationItems.length - 1 && styles.lastItem
              ]}
            >
              <Text style={styles.notificationLabel}>{item.label}</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={notifications[item.key] ? '#3B82F6' : '#F3F4F6'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSwitch(item.key)}
                value={notifications[item.key]}
                style={styles.switch}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop:40,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  notificationList: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  notificationLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});

export default Notification;