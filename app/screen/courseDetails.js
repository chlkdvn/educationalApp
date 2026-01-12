import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import WebView from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const CourseDetail = () => {
    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();
    const { courseId } = useLocalSearchParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [showWebView, setShowWebView] = useState(false);
    const [activeTab, setActiveTab] = useState('About');

    const webViewRef = useRef(null);

    useEffect(() => {
        if (!courseId) {
            setError('No course ID provided');
            setLoading(false);
            return;
        }

        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();

                const response = await fetch(
                    `https://educations.onrender.com/api/course/${courseId}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.courseData) {
                    setCourse(data.courseData);
                } else {
                    throw new Error('Invalid course data');
                }
            } catch (err) {
                console.error('Fetch course error:', err);
                setError('Failed to load course details. Please try again.');
                Alert.alert('Error', 'Could not load course information.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handlePurchase = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to enroll in this course');
            return;
        }

        setPurchasing(true);

        try {
            const token = await getToken();

            const response = await fetch(
                'https://educations.onrender.com/api/user/initializeCoursePayment',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ courseId }),
                }
            );

            const data = await response.json();

            if (data.alreadyEnrolled) {
                Alert.alert('Already Enrolled', 'You are already enrolled in this course!');
                return;
            }

            if (data.success && data.authorization_url) {
                setPaymentUrl(data.authorization_url);
                setShowWebView(true);
                return;
            }

            Alert.alert('Payment Error', data.message || 'Unable to start payment.');
        } catch (err) {
            console.error('Payment error:', err);
            Alert.alert('Error', 'Payment initialization failed. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    const handleWebViewNavigationStateChange = (navState) => {
        const { url } = navState;

        if (url.includes('success') || url.includes('reference') || url.includes('completed')) {
            setShowWebView(false);
            Alert.alert('Payment Successful', 'You have been enrolled in the course!', [
                { text: 'OK', onPress: () => router.push('/screen/myCourses') },
            ]);
        } else if (url.includes('cancel') || url.includes('failed')) {
            setShowWebView(false);
            Alert.alert('Payment Cancelled', 'The payment was not completed.');
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return 'N/A';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88FF" />
                    <Text style={styles.loadingText}>Loading course...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !course) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'Course not found'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Safe to calculate price now
    const finalPrice =
        course.discount > 0
            ? Math.round(course.coursePrice * (100 - course.discount) / 100)
            : course.coursePrice;

    return (
        <SafeAreaView style={styles.container}>
            {/* Video/Thumbnail Header */}
            <View style={styles.videoSection}>
                <Image
                    source={{ uri: course.courseThumbnail }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                />
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton}>
                    <Ionicons name="play" size={32} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Course Info Header */}
                    <View style={styles.courseHeader}>
                        <View style={styles.courseHeaderLeft}>
                            <Text style={styles.courseCategory}>
                                {course.courseType?.charAt(0).toUpperCase() + course.courseType?.slice(1) || 'Course'}
                            </Text>
                            <Text style={styles.courseTitle}>{course.courseTitle}</Text>
                            <View style={styles.courseStats}>
                                <Ionicons name="people-outline" size={18} color="#666" />
                                <Text style={styles.statText}>{course.totalLectures || 0} Lectures</Text>
                                <Text style={styles.divider}> | </Text>
                                <Ionicons name="time-outline" size={18} color="#666" />
                                <Text style={styles.statText}>{formatDuration(course.totalDuration)}</Text>
                            </View>
                        </View>
                        <View style={styles.courseHeaderRight}>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color="#FFC107" />
                                <Text style={styles.ratingText}>
                                    {course.averageRating?.toFixed(1) || 'New'} ({course.totalReviews || 0})
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.coursePrice}>₦{finalPrice}</Text>
                                {course.discount > 0 && (
                                    <Text style={styles.originalPrice}>₦{course.coursePrice}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'About' && styles.activeTab]}
                            onPress={() => setActiveTab('About')}
                        >
                            <Text style={[styles.tabText, activeTab === 'About' && styles.activeTabText]}>
                                About
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Curriculum' && styles.activeTab]}
                            onPress={() => setActiveTab('Curriculum')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Curriculum' && styles.activeTabText]}>
                                Curriculum
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* About Tab */}
                    {activeTab === 'About' && (
                        <View style={styles.aboutSection}>
                            <RenderHtml
                                contentWidth={width - 40}
                                source={{ html: course.courseDescription || '<p>No description available.</p>' }}
                                baseStyle={{
                                    color: '#333',
                                    fontSize: 15,
                                    lineHeight: 24,
                                }}
                                tagsStyles={{
                                    h3: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginTop: 20, marginBottom: 12 },
                                    p: { marginBottom: 14 },
                                    strong: { fontWeight: '700' },
                                    em: { fontStyle: 'italic' },
                                }}
                            />

                            <View style={styles.benefitsSection}>
                                <Text style={styles.sectionTitle}>What You'll Get</Text>
                                <View style={styles.benefitsList}>
                                    <View style={styles.benefitItem}>
                                        <Ionicons name="document-text-outline" size={24} color="#666" />
                                        <Text style={styles.benefitText}>{course.totalLectures || 0} Lessons</Text>
                                    </View>
                                    <View style={styles.benefitItem}>
                                        <Ionicons name="phone-portrait-outline" size={24} color="#666" />
                                        <Text style={styles.benefitText}>Access on Mobile & Desktop</Text>
                                    </View>
                                    <View style={styles.benefitItem}>
                                        <Ionicons name="trending-up-outline" size={24} color="#666" />
                                        <Text style={styles.benefitText}>
                                            {course.difficulty?.charAt(0).toUpperCase() + course.difficulty?.slice(1) || 'Beginner'} Level
                                        </Text>
                                    </View>
                                    <View style={styles.benefitItem}>
                                        <Ionicons name="globe-outline" size={24} color="#666" />
                                        <Text style={styles.benefitText}>{course.language || 'English'}</Text>
                                    </View>
                                    <View style={styles.benefitItem}>
                                        <Ionicons name="infinite-outline" size={24} color="#666" />
                                        <Text style={styles.benefitText}>Lifetime Access</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.studentsSection}>
                                <Text style={styles.sectionTitle}>
                                    {course.enrolledStudents?.length || 0} Students Enrolled
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Curriculum Tab */}
                    {activeTab === 'Curriculum' && (
                        <View style={styles.curriculumSection}>
                            <Text style={styles.sectionTitle}>Course Content</Text>
                            {course.courseContent?.length > 0 ? (
                                course.courseContent.map((chapter, index) => (
                                    <View key={chapter.chapterId || index} style={styles.chapterCard}>
                                        <View style={styles.chapterHeader}>
                                            <Text style={styles.chapterTitle}>
                                                Chapter {chapter.chapterOrder || index + 1}: {chapter.chapterTitle}
                                            </Text>
                                            <Text style={styles.lectureCount}>
                                                {chapter.chapterContent?.length || 0} Lectures
                                            </Text>
                                        </View>
                                        {chapter.chapterContent?.map((lecture) => (
                                            <View key={lecture.lectureId} style={styles.lectureItem}>
                                                <Ionicons
                                                    name={lecture.isPreviewFree ? 'play-circle-outline' : 'lock-closed-outline'}
                                                    size={20}
                                                    color={lecture.isPreviewFree ? '#1E88FF' : '#666'}
                                                />
                                                <Text style={styles.lectureTitle}>{lecture.lectureTitle}</Text>
                                                <Text style={styles.lectureDuration}>
                                                    {formatDuration(lecture.lectureDuration)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No content available yet.</Text>
                            )}
                        </View>
                    )}

                    <View style={styles.bottomSpace} />
                </View>
            </ScrollView>

            {/* WebView Payment Modal */}
            <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={styles.webviewHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowWebView(false);
                                Alert.alert('Payment Cancelled', 'You closed the payment page.');
                            }}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.webviewTitle}>Complete Payment</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {paymentUrl && (
                        <WebView
                            ref={webViewRef}
                            source={{ uri: paymentUrl }}
                            style={{ flex: 1 }}
                            onNavigationStateChange={handleWebViewNavigationStateChange}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            renderLoading={() => (
                                <View style={styles.webviewLoading}>
                                    <ActivityIndicator size="large" color="#1E88FF" />
                                </View>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>

            {/* Enroll Button */}
            <View style={styles.enrollContainer}>
                <TouchableOpacity
                    style={[styles.enrollButton, purchasing && styles.enrollButtonDisabled]}
                    onPress={handlePurchase}
                    disabled={purchasing}
                >
                    {purchasing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.enrollButtonText}>Enroll Now - ₦{finalPrice}</Text>
                            <Ionicons name="arrow-forward" size={24} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    videoSection: { width: '100%', height: height * 0.35, position: 'relative' },
    videoThumbnail: { width: '100%', height: '100%' },
    backButton: { position: 'absolute', top: height * 0.06, left: width * 0.05, padding: 8, zIndex: 10 },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -35,
        marginTop: -35,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(30, 136, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    contentSection: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    content: { padding: width * 0.05 },
    courseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    courseHeaderLeft: { flex: 1 },
    courseCategory: { color: '#FF9500', fontSize: width * 0.036, fontWeight: '600', marginBottom: 8 },
    courseTitle: { fontSize: width * 0.055, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    courseStats: { flexDirection: 'row', alignItems: 'center' },
    statText: { fontSize: width * 0.035, color: '#666', marginLeft: 6 },
    divider: { color: '#C7C7CC' },
    courseHeaderRight: { alignItems: 'flex-end' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    ratingText: { fontSize: width * 0.038, fontWeight: '600', color: '#1A1A1A', marginLeft: 4 },
    coursePrice: { fontSize: width * 0.055, fontWeight: '700', color: '#1E88FF' },
    originalPrice: { fontSize: width * 0.035, color: '#8E8E93', textDecorationLine: 'line-through' },
    tabs: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 24 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#fff' },
    tabText: { fontSize: width * 0.038, color: '#8E8E93', fontWeight: '600' },
    activeTabText: { color: '#1A1A1A' },
    aboutSection: { marginBottom: 24 },
    sectionTitle: { fontSize: width * 0.048, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
    benefitsSection: { marginBottom: 24, marginTop: 24 },
    benefitsList: { gap: 16 },
    benefitItem: { flexDirection: 'row', alignItems: 'center' },
    benefitText: { fontSize: width * 0.04, color: '#1A1A1A', marginLeft: 16, fontWeight: '500' },
    studentsSection: { marginVertical: 24 },
    curriculumSection: { marginBottom: 24 },
    chapterCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 16 },
    chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    chapterTitle: { fontSize: width * 0.04, fontWeight: '600', color: '#1A1A1A', flex: 1 },
    lectureCount: { fontSize: width * 0.034, color: '#666' },
    lectureItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
    lectureTitle: { flex: 1, marginLeft: 12, fontSize: width * 0.038, color: '#1A1A1A' },
    lectureDuration: { fontSize: width * 0.034, color: '#666' },
    bottomSpace: { height: 100 },
    enrollContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: width * 0.05,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    enrollButton: {
        backgroundColor: '#1E88FF',
        borderRadius: 50,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    enrollButtonDisabled: { opacity: 0.6 },
    enrollButtonText: { color: '#fff', fontSize: width * 0.042, fontWeight: '700' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 20 },
    retryButton: { backgroundColor: '#1E88FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
    retryText: { color: '#fff', fontWeight: '600' },
    emptyText: { fontSize: 16, color: '#666', textAlign: 'center', padding: 20 },

    // WebView styles
    webviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    webviewTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
    },
    webviewLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CourseDetail;