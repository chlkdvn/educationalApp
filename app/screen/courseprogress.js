import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';

const backendUrl = 'https://2c29-102-90-81-15.ngrok-free.app';

const CourseProgress = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const router = useRouter();
    const { course } = route.params || {};

    // Auth state - replaced Clerk with local state
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const [completedLessons, setCompletedLessons] = useState([]);
    const [totalLectures, setTotalLectures] = useState(0);
    const [showCongrats, setShowCongrats] = useState(false);
    const [previousCompletedCount, setPreviousCompletedCount] = useState(0);

    const calculateTotalLectures = (courseData) => {
        if (!courseData?.courseContent) return 0;
        return courseData.courseContent.reduce((acc, section) => {
            return acc + (section.chapterContent?.length || 0);
        }, 0);
    };

    // Check auth status
    const checkAuthStatus = async () => {
        try {
            setIsLoadingAuth(true);
            const storedUser = await AsyncStorage.getItem('user');

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                try {
                    const { data } = await axios.get(`${backendUrl}/api/user/me`, {
                        withCredentials: true
                    });
                    if (data.success && data.data) {
                        setUser(data.data);
                        await AsyncStorage.setItem('user', JSON.stringify(data.data));
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Auth fetch error:', error);
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            setIsLoadingAuth(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const getCourseProgress = useCallback(async () => {
        if (!user || !course?._id) return;
        
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/get-course-progress`,
                { courseId: course._id },
                { withCredentials: true }
            );
            if (data.success) {
                const newCompleted = data.progressData?.lectureCompleted || [];
                setPreviousCompletedCount(completedLessons.length);
                setCompletedLessons(newCompleted);

                const total = calculateTotalLectures(course);
                if (newCompleted.length === total && previousCompletedCount < total) {
                    setShowCongrats(true);
                }
            }
        } catch (err) {
            console.error("Progress fetch error:", err);
            Alert.alert('Error', 'Failed to load progress');
        }
    }, [course, user, completedLessons.length, previousCompletedCount]);

    const markLectureAsCompleted = async (lectureId) => {
        if (!user) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/update-course-progress`,
                { courseId: course._id, lectureId },
                { withCredentials: true }
            );
            if (data.success) {
                getCourseProgress(); // Refresh to get updated progress
            }
        } catch (err) {
            console.error("Failed to save progress", err);
            Alert.alert('Error', 'Failed to save progress');
        }
    };

    useEffect(() => {
        if (user && course?._id) {
            const total = calculateTotalLectures(course);
            setTotalLectures(total);
            getCourseProgress();
        }
    }, [course, user, getCourseProgress]);

    // Navigate to video player with ONLY courseId (no lecture selection needed)
    const goToVideoPlayer = () => {
        const firstLecture = course.courseContent?.[0]?.chapterContent?.[0];

        router.push({
            pathname: "/screen/videoPlayer",
            params: {
                courseId: course._id,
                lectureId: firstLecture?._id,
                courseData: JSON.stringify(course)
            }
        });
    };

    const toggleLesson = (lectureId) => {
        if (!completedLessons.includes(lectureId)) {
            markLectureAsCompleted(lectureId);
        }
    };

    // Show loading while checking auth
    if (isLoadingAuth) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

    // Show login prompt if not authenticated
    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="log-in-outline" size={60} color="#999" />
                <Text style={{ fontSize: 16, color: '#666', marginTop: 20 }}>Please sign in to view course progress</Text>
                <TouchableOpacity 
                    style={{ backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 20 }}
                    onPress={() => navigation.navigate('screen/home')}
                >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Go to Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!course) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No course data</Text>
            </View>
        );
    }

    const isCourseCompleted = completedLessons.length === totalLectures && totalLectures > 0;

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
                <Text style={styles.headerTitle}>My Courses</Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Course Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {course.courseContent?.map((section, sectionIndex) => {
                    const sectionDuration = section.chapterContent.reduce((acc, lec) => acc + (lec.lectureDuration || 0), 0);
                    return (
                        <View key={sectionIndex} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Text style={styles.sectionLabel}>Section 0{sectionIndex + 1} - </Text>
                                    <Text style={styles.sectionTitle}>{section.chapterTitle}</Text>
                                </View>
                                <Text style={styles.sectionDuration}>{sectionDuration} Mins</Text>
                            </View>

                            <View style={styles.lessonList}>
                                {section.chapterContent.map((lecture, idx) => {
                                    const isCompleted = completedLessons.includes(lecture._id);
                                    return (
                                        <View key={idx} style={styles.lessonItem}>
                                            <Text style={styles.lessonNumber}>0{idx + 1}</Text>

                                            <TouchableOpacity
                                                style={styles.lessonCard}
                                            >
                                                <Text style={styles.lessonTitle} numberOfLines={1}>
                                                    {lecture.lectureTitle}
                                                </Text>
                                                <Text style={styles.lessonDuration}>{lecture.lectureDuration} Mins</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkButton}
                                                onPress={() => toggleLesson(lecture._id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[
                                                    styles.checkCircle,
                                                    isCompleted && styles.checkCircleComplete
                                                ]}>
                                                    {isCompleted && (
                                                        <Ionicons name="checkmark" size={14} color="white" />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerButtons}>
                    <TouchableOpacity style={styles.chatButton}>
                        <Ionicons name="chatbubble" size={22} color="#14B8A6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.startButton} onPress={goToVideoPlayer}>
                        <Text style={styles.startButtonText}>Start Course</Text>
                        <Ionicons name="arrow-forward" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Congratulations Modal */}
            <Modal
                visible={showCongrats}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCongrats(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.congratsCard}>
                        <View style={styles.trophyContainer}>
                            <Text style={styles.trophyEmoji}>🏆</Text>
                        </View>
                        <Text style={styles.congratsTitle}>Congratulations! 🎉</Text>
                        <Text style={styles.congratsMessage}>
                            You've successfully completed the course
                        </Text>
                        <Text style={styles.courseName}>{course.courseTitle}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowCongrats(false)}
                        >
                            <Text style={styles.closeButtonText}>Continue Learning</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    section: {
        paddingHorizontal: 20,
        paddingTop: 20
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000'
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563EB'
    },
    sectionDuration: {
        fontSize: 13,
        color: '#2563EB',
        fontWeight: '500'
    },
    lessonList: {
        gap: 16
    },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    lessonNumber: {
        width: 24,
        fontSize: 13,
        fontWeight: '500',
        color: '#9CA3AF'
    },
    lessonCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    lessonTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 6
    },
    lessonDuration: {
        fontSize: 12,
        color: '#6B7280'
    },
    checkButton: {
        padding: 4
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2563EB',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkCircleComplete: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB'
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
    footerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    chatButton: {
        width: 56,
        height: 56,
        backgroundColor: '#CCFBF1',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    startButton: {
        flex: 1,
        backgroundColor: '#2563EB',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    startButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    congratsCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15
    },
    trophyContainer: {
        marginBottom: 20
    },
    trophyEmoji: {
        fontSize: 80
    },
    congratsTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12
    },
    congratsMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8
    },
    courseName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2563EB',
        textAlign: 'center',
        marginBottom: 30
    },
    closeButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default CourseProgress;