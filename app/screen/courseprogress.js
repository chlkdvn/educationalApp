import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const backendUrl = 'https://educations.onrender.com';

const CourseProgress = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const router = useRouter();
    const { course } = route.params || {};
    const { getToken } = useAuth();

    const [completedLessons, setCompletedLessons] = useState([]);
    const [totalLectures, setTotalLectures] = useState(0);
    const [showCongrats, setShowCongrats] = useState(false);
    const [previousCompletedCount, setPreviousCompletedCount] = useState(0);

    const calculateTotalLectures = (courseData) => {
        if (!courseData?.courseContent) return 0;
        return courseData.courseContent.reduce((acc, section) => {
            return acc + section.chapterContent.length;
        }, 0);
    };

    const getCourseProgress = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.post(
                `${backendUrl}/api/user/get-course-progress`,
                { courseId: course._id },
                { headers: { Authorization: `Bearer ${token}` } }
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
    };

    const markLectureAsCompleted = async (lectureId) => {
        try {
            const token = await getToken();
            const { data } = await axios.post(
                `${backendUrl}/api/user/update-course-progress`,
                { courseId: course._id, lectureId },
                { headers: { Authorization: `Bearer ${token}` } }
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
        if (course?._id) {
            const total = calculateTotalLectures(course);
            setTotalLectures(total);
            getCourseProgress();
        }
    }, [course]);

    // Navigate to video player with ONLY courseId (no lecture selection needed)
    const goToVideoPlayer = () => {
        router.push({
            pathname: "/screen/videoPlayer",
            params: { courseId: course._id }
        });
    };

    // Individual lesson press - still works the same
    const handleLessonPress = (lecture) => {
        router.push({
            pathname: "/screen/videoPlayer",
            params: {
                courseId: course._id,
                lectureId: lecture._id,
                lectureTitle: lecture.lectureTitle,
                lectureDuration: lecture.lectureDuration,
                lectureUrl: lecture.lectureUrl
            }
        });
    };

    const toggleLesson = (lectureId) => {
        if (!completedLessons.includes(lectureId)) {
            markLectureAsCompleted(lectureId);
        }
    };

    if (!course) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No course data</Text>
        </View>;
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

            {/* Search Bar - Used as Title */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <TextInput
                        value={course.courseTitle}
                        style={styles.searchInput}
                        editable={false}
                    />
                </View>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search" size={20} color="white" />
                </TouchableOpacity>
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
                                                onPress={() => handleLessonPress(lecture)}
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
                    {/* Updated: Only passes courseId to video player */}
                    <TouchableOpacity style={styles.startButton} onPress={goToVideoPlayer}>
                        <Text style={styles.startButtonText}>Start Course Again</Text>
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