import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BACKEND_URL = 'https://educations.onrender.com';

const RequestCertificate = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { courseId } = route.params || {};

    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(0);
    const [formData, setFormData] = useState({ phone: '', email: '' });
    const [loading, setLoading] = useState({ page: true, submit: false });
    const [error, setError] = useState(null);

    // Fetch course and progress
    useEffect(() => {
        const fetchData = async () => {
            if (!isLoaded || !user || !courseId) return;

            try {
                const token = await getToken();

                // Fetch enrolled courses to find current course
                const enrolledRes = await fetch(`${BACKEND_URL}/api/user/enrolled-courses`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const enrolledJson = await enrolledRes.json();
                if (!enrolledJson.success) throw new Error('Failed to load courses');

                const foundCourse = enrolledJson.enrolledCourses.find(c => c._id === courseId);
                if (!foundCourse) {
                    Alert.alert('Error', 'Course not found in your enrollments');
                    navigation.goBack();
                    return;
                }
                setCourse(foundCourse);
                setFormData(prev => ({ ...prev, email: user.emailAddresses[0]?.emailAddress || '' }));

                // Fetch progress
                const progressRes = await fetch(`${BACKEND_URL}/api/user/get-course-progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ courseId }),
                });
                const progressJson = await progressRes.json();

                if (progressJson.success) {
                    const completed = progressJson.progressData?.lectureCompleted?.length || 0;
                    const total = foundCourse.totalLectures || 1;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                    setProgress(percentage);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load course data');
            } finally {
                setLoading(prev => ({ ...prev, page: false }));
            }
        };

        fetchData();
    }, [isLoaded, user, courseId, getToken, navigation]);

    const handleSubmit = async () => {
        if (progress < 100) {
            Alert.alert('Incomplete', 'You must complete the course before requesting a certificate.');
            return;
        }

        if (!formData.email.trim() || !formData.phone.trim()) {
            Alert.alert('Missing Info', 'Please fill in email and phone number.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
            return;
        }

        setLoading(prev => ({ ...prev, submit: true }));

        try {
            const token = await getToken();
            const res = await fetch(`${BACKEND_URL}/api/user/request-certificate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    courseId,
                    phone: formData.phone.trim(),
                    email: formData.email.trim(),
                }),
            });

            const json = await res.json();
            if (json.success) {
                Alert.alert(
                    'Success!',
                    "Certificate request submitted! You'll receive a test email soon.",
                    [{ text: 'OK', onPress: () => navigation.navigate('screen/videoPlayer', { courseId }) }]
                );
            } else {
                Alert.alert('Error', json.message || 'Request failed.');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const isCompleted = progress >= 100;

    if (loading.page) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#00A67E" style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    if (error || !course) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{error || 'Course not found'}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Request Certificate</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <Text style={styles.courseTitle}>{course.courseTitle}</Text>

                    {/* Course Image */}
                    <Image
                        source={{ uri: course.courseThumbnail }}
                        style={styles.courseImage}
                        resizeMode="cover"
                    />

                    {/* Progress Card */}
                    <View style={[styles.progressCard, isCompleted ? styles.completedCard : styles.incompleteCard]}>
                        <Text style={[styles.progressStatus, isCompleted ? styles.completedText : styles.incompleteText]}>
                            {isCompleted ? '✓ Course Completed!' : '! Course Incomplete'}
                        </Text>
                        <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressHint}>
                            {isCompleted
                                ? "Congratulations! You're eligible for a certificate."
                                : `Complete ${100 - progress.toFixed(0)}% more to request your certificate.`}
                        </Text>
                    </View>

                    {/* Important Notice */}
                    <View style={styles.noticeCard}>
                        <Text style={styles.noticeEmoji}>⚠️</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.noticeTitle}>Important Notice</Text>
                            <Text style={styles.noticeText}>
                                After submitting, <Text style={{ fontWeight: 'bold' }}>you'll receive a final test</Text> to verify your knowledge. Only those who pass will get the official certificate. Test link will be sent to your email within 24 hours.
                            </Text>
                        </View>
                    </View>

                    {/* Form or Incomplete Message */}
                    {isCompleted ? (
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Submit Your Details</Text>

                            {/* Name (read-only) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.readOnlyInput}>
                                    <Text style={styles.readOnlyText}>
                                        {user?.fullName || 'Not available'}
                                    </Text>
                                </View>
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Email Address <Text style={{ color: 'red' }}>*</Text>
                                    <Text style={styles.hint}> (Gmail recommended)</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.email}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                        placeholder="your.email@gmail.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Phone */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Phone Number <Text style={{ color: 'red' }}>*</Text>
                                    <Text style={styles.hint}> (with country code)</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                        placeholder="+1 234 567 8900"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <Text style={styles.inputNote}>
                                    We'll use this to contact you about your certificate
                                </Text>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, loading.submit && styles.disabledBtn]}
                                onPress={handleSubmit}
                                disabled={loading.submit}
                            >
                                {loading.submit ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitText}>Request Certificate Now</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.disclaimer}>
                                By submitting, you agree to receive a test email within 24 hours
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.incompleteCardBig}>
                            <Text style={styles.incompleteEmoji}>📚</Text>
                            <Text style={styles.incompleteTitle}>Complete the Course First</Text>
                            <Text style={styles.incompleteDesc}>
                                You need to finish all lectures before requesting your certificate. You're almost there!
                            </Text>
                            <TouchableOpacity
                                style={styles.continueBtn}
                                onPress={() => navigation.navigate('screen/videoPlayer', { courseId })}
                            >
                                <Text style={styles.continueText}>Continue Learning</Text>
                            </TouchableOpacity>
                            <Text style={styles.incompleteNote}>
                                Return here after completing all lectures
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    courseTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginHorizontal: 16, marginBottom: 16, color: '#1A1A1A' },
    courseImage: { width: width - 32, height: 200, borderRadius: 20, marginHorizontal: 16, marginBottom: 20 },
    progressCard: { marginHorizontal: 16, padding: 20, borderRadius: 20, alignItems: 'center' },
    completedCard: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B981' },
    incompleteCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444' },
    progressStatus: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    completedText: { color: '#059669' },
    incompleteText: { color: '#DC2626' },
    progressPercent: { fontSize: 36, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
    progressBar: { width: '80%', height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
    progressFill: { height: '100%', backgroundColor: '#00A67E', borderRadius: 5 },
    progressHint: { textAlign: 'center', color: '#666', fontSize: 14, paddingHorizontal: 20 },
    noticeCard: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 20, padding: 20, backgroundColor: '#FFFBEB', borderRadius: 20, borderWidth: 1, borderColor: '#FBBF24' },
    noticeEmoji: { fontSize: 32, marginRight: 16 },
    noticeTitle: { fontSize: 18, fontWeight: 'bold', color: '#92400E', marginBottom: 8 },
    noticeText: { fontSize: 15, color: '#92400E', lineHeight: 22 },
    formCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
    formTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#1A1A1A' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 8 },
    hint: { fontSize: 13, color: '#3B82F6' },
    readOnlyInput: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12 },
    readOnlyText: { fontSize: 16, color: '#6B7280' },
    inputContainer: { position: 'relative' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 16, fontSize: 16, paddingLeft: 48 },
    inputNote: { fontSize: 13, color: '#6B7280', marginTop: 8 },
    submitBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
    disabledBtn: { opacity: 0.7 },
    submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    disclaimer: { textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 16 },
    incompleteCardBig: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, padding: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
    incompleteEmoji: { fontSize: 60, marginBottom: 20 },
    incompleteTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
    incompleteDesc: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
    continueBtn: { backgroundColor: '#2563EB', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
    continueText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    incompleteNote: { fontSize: 14, color: '#9CA3AF', marginTop: 20 },
    errorText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#DC2626' },
});

export default RequestCertificate;