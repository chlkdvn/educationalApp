import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { decode } from 'html-entities';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height } = Dimensions.get('window');
const BACKEND_URL = 'https://educations.onrender.com';

const CourseVideoPlayer = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { courseId } = route.params || {};

    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const videoRef = useRef(null);

    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState({ lectureCompleted: [] });
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [openChapters, setOpenChapters] = useState({});
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [videoStatus, setVideoStatus] = useState({});
    const [userRating, setUserRating] = useState(0);
    const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [isVideoBuffering, setIsVideoBuffering] = useState(false);

    // Fetch enrolled courses + rating
    const fetchEnrolledCourses = useCallback(async () => {
        if (!isLoaded || !user) return;

        try {
            const token = await getToken();
            const res = await fetch(`${BACKEND_URL}/api/user/enrolled-courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (data.success && data.enrolledCourses) {
                const currentCourse = data.enrolledCourses.find(c => c._id === courseId);
                if (currentCourse) {
                    setCourse(currentCourse);

                    const existingRating = currentCourse.courseRatings?.find(
                        r => r.userId === user?.id
                    );
                    if (existingRating) {
                        setUserRating(existingRating.rating);
                        setIsRatingSubmitted(true);
                    }
                } else {
                    Alert.alert('Error', 'Course not found in your enrolled courses');
                    navigation.goBack();
                }
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to load course');
        } finally {
            setLoading(false);
        }
    }, [courseId, getToken, isLoaded, user, navigation]);

    // Fetch progress
    const fetchProgress = useCallback(async () => {
        if (!courseId || !user || !isLoaded) return;

        try {
            const token = await getToken();
            const res = await fetch(`${BACKEND_URL}/api/user/get-course-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId }),
            });

            const data = await res.json();
            if (data.success) {
                setProgress(data.progressData || { lectureCompleted: [] });
            }
        } catch (err) {
            console.error(err);
        }
    }, [courseId, getToken, isLoaded, user]);

    useFocusEffect(
        useCallback(() => {
            fetchEnrolledCourses();
            fetchProgress();
        }, [fetchEnrolledCourses, fetchProgress])
    );

    // Video loading
    useEffect(() => {
        const loadVideo = async () => {
            if (!videoRef.current || !selectedLecture?.lectureUrl) return;

            setVideoError(null);
            setIsVideoBuffering(true);

            try {
                await videoRef.current.unloadAsync();
                await videoRef.current.loadAsync(
                    { uri: selectedLecture.lectureUrl },
                    { shouldPlay: false, positionMillis: 0 },
                    true
                );
            } catch (error) {
                console.error('Video load failed:', error);
                setVideoError('Failed to load video. Please check your connection.');
                setIsVideoBuffering(false);
            }
        };

        loadVideo();
    }, [selectedLecture?.lectureUrl]);

    // Auto-mark complete
    useEffect(() => {
        if (videoStatus.didJustFinish && selectedLecture && !isCompleted(selectedLecture.lectureId)) {
            markComplete(selectedLecture.lectureId);
        }
    }, [videoStatus.didJustFinish]);

    // Buffering state
    useEffect(() => {
        if (videoStatus.isLoaded !== undefined) {
            setIsVideoBuffering(videoStatus.isBuffering === true);
        }
    }, [videoStatus.isBuffering, videoStatus.isLoaded]);

    // Fullscreen toggle
    const toggleFullscreen = async () => {
        try {
            if (isFullscreen) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                setIsFullscreen(false);
            } else {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
                setIsFullscreen(true);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    const markComplete = async (lectureId) => {
        if (!lectureId || !user) return;

        try {
            const token = await getToken();
            const res = await fetch(`${BACKEND_URL}/api/user/update-course-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId, lectureId }),
            });

            const data = await res.json();
            if (data.success) {
                setProgress(prev => ({
                    ...prev,
                    lectureCompleted: [...(prev.lectureCompleted || []), lectureId],
                }));
                Alert.alert('Success', 'Lecture marked as complete!');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to save progress');
        }
    };

    // Improved rating with safe JSON handling
    const submitRating = async (rating) => {
        if (!user || !courseId || isRatingSubmitted) return;

        try {
            const token = await getToken();
            const res = await fetch(`${BACKEND_URL}/api/user/add-rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId, rating }),
            });

            let data;
            try {
                data = await res.json();
            } catch (parseErr) {
                const text = await res.text();
                console.warn('Invalid JSON response:', text);
                Alert.alert('Server Error', 'Received invalid response from server.');
                return;
            }

            if (data.success) {
                setUserRating(rating);
                setIsRatingSubmitted(true);
                Alert.alert('Thank You!', `You rated this course ${rating} star${rating > 1 ? 's' : ''}`);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit rating');
            }
        } catch (err) {
            console.error('Rating error:', err);
            Alert.alert('Error', 'Network error. Please try again.');
        }
    };

    const toggleChapter = (index) => {
        setOpenChapters(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const selectLecture = (lecture, chIdx, lecIdx) => {
        setSelectedLecture({
            ...lecture,
            chapter: chIdx + 1,
            lecture: lecIdx + 1,
        });
    };

    const isCompleted = (lectureId) => progress.lectureCompleted?.includes(lectureId);

    const calculateProgress = () => {
        if (!course || !course.courseContent) return 0;
        const total = course.courseContent.reduce((acc, ch) => acc + (ch.chapterContent?.length || 0), 0);
        const completed = progress.lectureCompleted?.length || 0;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '0m';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
    };

    const StarRating = ({ rating, onRate }) => (
        <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => onRate(star)}
                    disabled={isRatingSubmitted}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color="#FFD700"
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#00A67E" style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    if (!course) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Course not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar hidden={isFullscreen} />

            {!isFullscreen && (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {course.courseTitle}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            )}

            {/* Video Player */}
            <View style={isFullscreen ? styles.fullscreenVideo : styles.videoSection}>
                {selectedLecture ? (
                    <>
                        <Video
                            ref={videoRef}
                            source={{ uri: selectedLecture.lectureUrl }}
                            style={styles.video}
                            resizeMode={ResizeMode.CONTAIN}
                            useNativeControls={true}
                            isLooping={false}
                            volume={1.0}
                            onPlaybackStatusUpdate={setVideoStatus}
                            onError={(e) => {
                                setVideoError('Failed to play video.');
                                setIsVideoBuffering(false);
                            }}
                        />

                        {isVideoBuffering && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#00A67E" />
                                <Text style={styles.loadingText}>Buffering...</Text>
                            </View>
                        )}

                        {videoError && (
                            <View style={styles.loadingOverlay}>
                                <Text style={styles.errorOverlayText}>{videoError}</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => {
                                        setVideoError(null);
                                        selectLecture(selectedLecture, selectedLecture.chapter - 1, selectedLecture.lecture - 1);
                                    }}
                                >
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!videoStatus.isPlaying && !isVideoBuffering && !videoError && (
                            <TouchableOpacity
                                style={styles.playButtonOverlay}
                                onPress={async () => await videoRef.current?.playAsync()}
                            >
                                <Ionicons name="play-circle" size={90} color="rgba(255,255,255,0.9)" />
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="play-circle-outline" size={80} color="#ccc" />
                        <Text style={styles.placeholderText}>Tap a lecture to start watching</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.fullscreenBtn} onPress={toggleFullscreen}>
                    <Ionicons name={isFullscreen ? 'contract' : 'expand'} size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Content Section - Clean White & Perfectly Aligned */}
            {!isFullscreen && (
                <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                    {selectedLecture && (
                        <View style={styles.lectureInfo}>
                            <Text style={styles.lectureTitle}>{decode(selectedLecture.lectureTitle)}</Text>
                            <Text style={styles.lectureMeta}>
                                Chapter {selectedLecture.chapter} • Lecture {selectedLecture.lecture} • {formatDuration(selectedLecture.lectureDuration)}
                            </Text>

                            <TouchableOpacity
                                style={[styles.completeBtn, isCompleted(selectedLecture.lectureId) && styles.completedBtn]}
                                onPress={() => markComplete(selectedLecture.lectureId)}
                                disabled={isCompleted(selectedLecture.lectureId)}
                            >
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.completeText}>
                                    {isCompleted(selectedLecture.lectureId) ? 'Completed' : 'Mark as Complete'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Course Progress</Text>
                            <Text style={styles.progressPercent}>{calculateProgress()}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${calculateProgress()}%` }]} />
                        </View>
                    </View>

                    <View style={styles.ratingSection}>
                        <Text style={styles.sectionTitle}>Rate this Course</Text>
                        <Text style={styles.ratingSubtitle}>Your feedback helps us improve</Text>
                        <StarRating rating={userRating} onRate={submitRating} />
                        {isRatingSubmitted && (
                            <Text style={styles.thankYouText}>
                                ✓ Thank you for your rating!
                            </Text>
                        )}
                    </View>

                    <View style={styles.chaptersSection}>
                        <Text style={styles.sectionTitle}>Course Content</Text>
                        {course.courseContent?.map((chapter, chIdx) => (
                            <View key={chapter.chapterId || chIdx} style={styles.chapterCard}>
                                <TouchableOpacity style={styles.chapterHeader} onPress={() => toggleChapter(chIdx)}>
                                    <Ionicons
                                        name={openChapters[chIdx] ? 'chevron-down' : 'chevron-forward'}
                                        size={24}
                                        color="#333"
                                    />
                                    <View style={styles.chapterInfo}>
                                        <Text style={styles.chapterTitle}>{chapter.chapterTitle}</Text>
                                        <Text style={styles.chapterMeta}>
                                            {chapter.chapterContent?.length || 0} lectures •{' '}
                                            {formatDuration(chapter.chapterContent?.reduce((a, l) => a + (l.lectureDuration || 0), 0) || 0)}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={20} color="#aaa" style={{ transform: [{ rotate: openChapters[chIdx] ? '180deg' : '0deg' }] }} />
                                </TouchableOpacity>

                                {openChapters[chIdx] && (
                                    <View style={styles.lecturesList}>
                                        {chapter.chapterContent?.map((lecture, lecIdx) => (
                                            <TouchableOpacity
                                                key={lecture.lectureId}
                                                style={[
                                                    styles.lectureItem,
                                                    selectedLecture?.lectureId === lecture.lectureId && styles.selectedLecture
                                                ]}
                                                onPress={() => selectLecture(lecture, chIdx, lecIdx)}
                                            >
                                                <Ionicons
                                                    name={
                                                        isCompleted(lecture.lectureId)
                                                            ? 'checkmark-circle'
                                                            : selectedLecture?.lectureId === lecture.lectureId
                                                                ? 'play-circle'
                                                                : 'play-circle-outline'
                                                    }
                                                    size={28}
                                                    color={
                                                        isCompleted(lecture.lectureId)
                                                            ? '#00A67E'
                                                            : selectedLecture?.lectureId === lecture.lectureId
                                                                ? '#007AFF'
                                                                : '#888'
                                                    }
                                                />
                                                <View style={styles.lectureDetails}>
                                                    <Text style={styles.lectureTitleItem} numberOfLines={2}>
                                                        {decode(lecture.lectureTitle)}
                                                    </Text>
                                                    <Text style={styles.lectureDuration}>
                                                        {formatDuration(lecture.lectureDuration)}
                                                    </Text>
                                                </View>
                                                {isCompleted(lecture.lectureId) && (
                                                    <Text style={styles.rewatchText}>Completed</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: { padding: 8 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600', flex: 1, marginLeft: 8 },
    videoSection: { height: height * 0.35 },
    fullscreenVideo: { flex: 1, backgroundColor: '#000' },
    video: { width: '100%', height: '100%' },
    fullscreenBtn: { position: 'absolute', bottom: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 14, borderRadius: 30 },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    placeholderText: { color: '#aaa', marginTop: 16, fontSize: 16 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 12, fontSize: 16 },
    errorOverlayText: { color: '#fff', textAlign: 'center', paddingHorizontal: 40, fontSize: 16, marginBottom: 20 },
    retryButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#007AFF', borderRadius: 8 },
    retryText: { color: '#fff', fontWeight: 'bold' },
    playButtonOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

    contentScroll: { flex: 1, backgroundColor: '#fff' },

    // Current Lecture Info
    lectureInfo: { padding: 20, backgroundColor: '#f8f9fa' },
    lectureTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
    lectureMeta: { fontSize: 14, color: '#666', marginBottom: 20 },
    completeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 10,
        alignSelf: 'flex-start',
    },
    completedBtn: { backgroundColor: '#00A67E' },
    completeText: { color: '#fff', fontWeight: '600', fontSize: 16 },

    // Progress
    progressSection: { paddingHorizontal: 20, paddingVertical: 20 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    progressLabel: { fontSize: 16, color: '#333', fontWeight: '600' },
    progressPercent: { fontSize: 16, color: '#00A67E', fontWeight: '700' },
    progressBar: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#00A67E', borderRadius: 5 },

    // Rating
    ratingSection: { padding: 24, alignItems: 'center', backgroundColor: '#f8f9fa' },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
    ratingSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
    starContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    starButton: { padding: 8 },
    thankYouText: { marginTop: 12, color: '#00A67E', fontWeight: '600', fontSize: 15 },

    // Chapters
    chaptersSection: { paddingHorizontal: 20, paddingBottom: 30 },
    chapterCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
    chapterHeader: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: '#f9f9f9' },
    chapterInfo: { flex: 1, marginLeft: 12 },
    chapterTitle: { fontSize: 17, fontWeight: '600', color: '#222' },
    chapterMeta: { fontSize: 13, color: '#666', marginTop: 4 },
    lecturesList: { backgroundColor: '#fff' },
    lectureItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
    selectedLecture: { backgroundColor: '#f0f7ff' },
    lectureDetails: { flex: 1, marginLeft: 16 },
    lectureTitleItem: { fontSize: 15, color: '#333', lineHeight: 20 },
    lectureDuration: { fontSize: 13, color: '#888', marginTop: 4 },
    rewatchText: { fontSize: 12, color: '#00A67E', fontWeight: '500' },

    errorText: { color: '#fff', textAlign: 'center', marginTop: 50, fontSize: 18 },
});

export default CourseVideoPlayer;