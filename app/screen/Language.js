import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

const Language = () => {
  const [selectedLanguages, setSelectedLanguages] = useState(['English (US)', 'English (US)']);

  const toggleLanguage = (language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const subCategories = ['English (US)', 'English (UK)'];
  
  const allLanguages = [
    'English (US)',
    'Arabic',
    'Hindi',
    'Bengali',
    'Deutsch',
    'Italian',
    'Korean',
    'Francais',
    'Russian',
    'Polish',
    'Spanish',
    'Mandarin',
  ];

  const CheckBox = ({ checked }) => (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* SubCategories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SubCategories:</Text>
          {subCategories.map((language) => (
            <TouchableOpacity
              key={language}
              style={styles.languageItem}
              onPress={() => toggleLanguage(language)}
            >
              <Text style={styles.languageText}>{language}</Text>
              <CheckBox checked={selectedLanguages.includes(language)} />
            </TouchableOpacity>
          ))}
        </View>

        {/* All Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Language</Text>
          {allLanguages.map((language) => (
            <TouchableOpacity
              key={language}
              style={styles.languageItem}
              onPress={() => toggleLanguage(language)}
            >
              <Text style={styles.languageText}>{language}</Text>
              <CheckBox checked={selectedLanguages.includes(language)} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  languageText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2B7EFF',
    borderColor: '#2B7EFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Language;