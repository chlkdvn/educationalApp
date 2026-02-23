import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const Certificate = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { course } = route.params || {};

  const courseTitle = course?.courseTitle || "3D Design Illustration";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{courseTitle}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder={courseTitle}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Certificate Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Certificate Card */}
        <View style={styles.certificateCard}>
          {/* Blue Wave Top */}
          <View style={styles.waveTop}>
            <View style={styles.waveBlue} />
          </View>

          {/* Certificate Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="ribbon" size={32} color="#2563EB" />
            </View>
          </View>

          {/* Certificate Title */}
          <Text style={styles.certificateTitle}>Certificate of Completions</Text>
          <Text style={styles.certificateSubtitle}>This Certifies that</Text>

          {/* Student Name */}
          <Text style={styles.studentName}>Alex</Text>

          {/* Certificate Description */}
          <Text style={styles.description}>
            Has Successfully Completed the Wellness Training Program, Entitled.
          </Text>

          {/* Course Name */}
          <Text style={styles.courseName}>{courseTitle} Course</Text>
          <Text style={styles.issueDate}>Issued on December 24, 2022</Text>

          {/* Certificate ID */}
          <Text style={styles.certificateId}>ID: 5KX5680686</Text>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <Text style={styles.signature}>Calvin E. McJames</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>Director of Wellness</Text>
            <Text style={styles.signatureName}>Virginia M. Patterson</Text>
            <Text style={styles.signatureDate}>Issued on November 24, 2022</Text>
          </View>

          {/* Orange Wave Bottom */}
          <View style={styles.waveBottom}>
            <View style={styles.waveOrange} />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download Certificate</Text>
          <View style={styles.downloadIconContainer}>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center'
  },
  searchInput: {
    fontSize: 14,
    color: '#6B7280',
    padding: 0
  },
  searchButton: {
    backgroundColor: '#2563EB',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  certificateCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative'
  },
  waveTop: {
    height: 80,
    backgroundColor: '#2563EB',
    position: 'relative'
  },
  waveBlue: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 20
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white'
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8
  },
  certificateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
    lineHeight: 20
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8
  },
  issueDate: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16
  },
  certificateId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24
  },
  signatureSection: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'center'
  },
  signature: {
    fontSize: 22,
    fontFamily: 'cursive',
    fontStyle: 'italic',
    color: '#000',
    marginBottom: 8
  },
  signatureLine: {
    width: 180,
    height: 1,
    backgroundColor: '#D1D5DB',
    marginBottom: 8
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4
  },
  signatureName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4
  },
  signatureDate: {
    fontSize: 11,
    color: '#6B7280'
  },
  waveBottom: {
    height: 60,
    backgroundColor: '#F59E0B',
    position: 'relative',
    marginTop: 20
  },
  waveOrange: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'white',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5
  },
  downloadButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  },
  downloadIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Certificate;