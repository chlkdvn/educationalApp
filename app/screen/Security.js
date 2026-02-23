import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';

 const SecurityScreen = () => {
  const [rememberMe, setRememberMe] = useState(true);
  const [biometricId, setBiometricId] = useState(true);
  const [faceId, setFaceId] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Remember Me */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Remember Me</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: '#E5E5E5', true: '#2B7EFF' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5E5"
          />
        </View>

        {/* Biometric ID */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Biometric ID</Text>
          <Switch
            value={biometricId}
            onValueChange={setBiometricId}
            trackColor={{ false: '#E5E5E5', true: '#2B7EFF' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5E5"
          />
        </View>

        {/* Face ID */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Face ID</Text>
          <Switch
            value={faceId}
            onValueChange={setFaceId}
            trackColor={{ false: '#E5E5E5', true: '#2B7EFF' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5E5"
          />
        </View>

        {/* Google Authenticator */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Google Authenticator</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        {/* Change PIN Button */}
        <TouchableOpacity style={styles.changePinButton}>
          <Text style={styles.changePinText}>Change PIN</Text>
        </TouchableOpacity>

        {/* Change Password Button */}
        <TouchableOpacity style={styles.changePasswordButton}>
          <Text style={styles.changePasswordText}>Change Password</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  chevron: {
    fontSize: 24,
    color: '#000',
    fontWeight: '300',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  changePinButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  changePinText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  changePasswordButton: {
    backgroundColor: '#2B7EFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePasswordText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SecurityScreen;