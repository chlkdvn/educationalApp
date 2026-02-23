import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { decode } from 'html-entities';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Linking
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BACKEND_URL = 'https://2c29-102-90-81-15.ngrok-free.app';

const THEME = {
    background: '#FFFFFF',
    card: '#F1F5F9',
    accent: '#1E88FF',
    textMain: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    star: '#FFD700'
};

const CourseVideoPlayer = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Auth state - replaced Clerk with local state
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const [progress, setProgress] = useState({ lectureCompleted: [] });
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [openChapters, setOpenChapters] = useState({ 0: true });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('About');
    const { courseId, courseData, lectureId: initialLectureId } = route.params || {};
    const [isVideoLoading, setIsVideoLoading] = useState(true);

    const [course, setCourse] = useState(courseData ? JSON.parse(courseData) : null);

    // Video Player Logic
    const player = useVideoPlayer(selectedLecture?.lectureUrl || '', (p) => {
        p.loop = false;
        if (selectedLecture?.lectureUrl) {
            p.play();
        }
    });

    useEffect(() => {
        const subscription = player.addListener('playToEnd', async () => {
            if (selectedLecture) {
                await markComplete(selectedLecture.lectureId);

                const totalLecturesCount = getTotalLectures();
                const currentlyCompleted = new Set(progress.lectureCompleted || []).size;
                const isThisTheLastLecture = !isCompleted(selectedLecture.lectureId)
                    ? (currentlyCompleted + 1) === totalLecturesCount
                    : currentlyCompleted === totalLecturesCount;

                if (isThisTheLastLecture) {
                    handleAutoCourseCompletion();
                }
            }
        });
        return () => subscription.remove();
    }, [player, selectedLecture, progress, course]);

    const handleAutoCourseCompletion = () => {
        setTimeout(() => {
            Alert.alert(
                "Course Completed! 🎉",
                "Congratulations! You've finished all lessons in this course.",
                [{ text: "Awesome!", onPress: () => console.log("Course Finished") }]
            );
        }, 500);
    };

    const getTotalLectures = () => {
        let count = 0;
        course?.courseContent?.forEach(chapter => {
            count += chapter.chapterContent?.length || 0;
        });
        return count;
    };

    /* ---------- AUTH CHECK ---------- */
    const checkAuthStatus = async () => {
        try {
            setIsLoadingAuth(true);
            const storedUser = await AsyncStorage.getItem('user');

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                try {
                    const { data } = await axios.get(`${BACKEND_URL}/api/user/me`, {
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

    /* ---------- API FUNCTIONS ---------- */
    const fetchData = useCallback(async () => {
        if (!user || !courseId) return;
        try {
            // 1. Fetch Course & My Rating
            const { data: courseDataRes } = await axios.get(`${BACKEND_URL}/api/user/enrolled-courses`, {
                withCredentials: true
            });

            if (courseDataRes.success) {
                const current = courseDataRes.enrolledCourses.find(c => c._id === courseId);
                if (current) {
                    setCourse(current);
                    const myRating = current.courseRatings?.find(r => r.userId === user._id);
                    setUserRating(myRating?.rating || 0);
                }
            }

            // 2. Fetch Progress
            const { data: progData } = await axios.post(`${BACKEND_URL}/api/user/get-course-progress`, 
                { courseId },
                { withCredentials: true }
            );
            if (progData.success) setProgress(progData.progressData || { lectureCompleted: [] });

        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [courseId, user]);

    useFocusEffect(useCallback(() => { 
        if (user) fetchData(); 
    }, [fetchData, user]));

    const areAllLecturesCompleted = () => {
        if (!course) return false;
        const allLectureIds = course.courseContent.flatMap(chapter =>
            chapter.chapterContent.map(lecture => lecture._id)
        );
        return allLectureIds.every(id => progress.lectureCompleted.includes(id));
    };

    /* ---------- Fix for Stuck Loading Spinner ---------- */
    useEffect(() => {
        if (!selectedLecture) return;
        setIsVideoLoading(player.status === 'loading');
        const statusSub = player.addListener('statusChange', (newStatus) => {
            setIsVideoLoading(newStatus === 'loading');
        });
        return () => statusSub.remove();
    }, [player, selectedLecture]);

    const markComplete = async (lectureId) => {
        if (isCompleted(lectureId)) return;

        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/user/update-course-progress`, 
                { courseId, lectureId },
                { withCredentials: true }
            );

            if (data.success) {
                setProgress(prev => {
                    const currentCompleted = prev.lectureCompleted || [];
                    if (currentCompleted.includes(lectureId)) return prev;
                    return {
                        ...prev,
                        lectureCompleted: [...currentCompleted, lectureId],
                    };
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const submitRating = async (rating) => {
        if (!courseId || !user || ratingLoading) return;

        const previousRating = userRating;
        setUserRating(rating);

        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.15, duration: 60, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        setRatingLoading(true);

        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/user/add-rating`, 
                {
                    courseId,
                    rating,
                    userId: user._id,
                },
                { withCredentials: true }
            );

            if (!data.success) {
                setUserRating(previousRating);
                Alert.alert('Save Failed', data.message || 'Please try again.');
            }
        } catch (err) {
            setUserRating(previousRating);
            Alert.alert('Offline', 'Check your internet connection.');
        } finally {
            setRatingLoading(false);
        }
    };

    const toggleFullscreen = async () => {
        if (isFullscreen) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            setIsFullscreen(false);
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
            setIsFullscreen(true);
        }
    };

    const isCompleted = (id) => progress.lectureCompleted?.includes(id);

    useEffect(() => {
        if (!course) return;

        if (initialLectureId) {
            let foundLecture = null;
            course.courseContent?.forEach(chapter => {
                const lecture = chapter.chapterContent?.find(l => l._id === initialLectureId);
                if (lecture) {
                    foundLecture = {
                        ...lecture,
                        lectureId: lecture._id
                    };
                }
            });

            if (foundLecture) {
                setSelectedLecture(foundLecture);
                return;
            }
        }

        if (!selectedLecture) {
            const firstSection = course.courseContent?.[0];
            const firstLecture = firstSection?.chapterContent?.[0];

            if (firstLecture) {
                setSelectedLecture({
                    ...firstLecture,
                    lectureId: firstLecture._id
                });
            }
        }
    }, [course, initialLectureId]);

    const handleDownload = async (url) => {
        if (!url) {
            Alert.alert('Error', 'No download URL available');
            return;
        }
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open this URL');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while trying to download');
        }
    };

    if (isLoadingAuth || loading) return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={THEME.accent} />
        </View>
    );

    if (!user) return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="log-in-outline" size={60} color="#999" />
            <Text style={{ fontSize: 16, color: '#666', marginTop: 20 }}>Please sign in to view this course</Text>
            <TouchableOpacity 
                style={{ backgroundColor: '#1E88FF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 20 }}
                onPress={() => navigation.navigate('screen/home')}
            >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Go to Login</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" hidden={isFullscreen} />

            {/* Video Section */}
            <View style={isFullscreen ? styles.fullscreenVideo : styles.videoWrapper}>
                {!isFullscreen && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                )}

                {selectedLecture ? (
                    <View style={{ flex: 1 }}>
                        <VideoView
                            player={player}
                            style={styles.video}
                            allowsFullscreen
                            nativeControls={true}
                            allowsPictureInPicture
                        />

                        {isVideoLoading && (
                            <View style={styles.videoLoadingOverlay}>
                                <ActivityIndicator size="large" color={THEME.accent} />
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Image
                            source={{ uri: course?.courseThumbnail }}
                            style={styles.placeholderImage}
                            blurRadius={10}
                        />
                        <Text style={styles.placeholderText}>Select a lecture to begin</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.fullscreenBtn} onPress={toggleFullscreen}>
                    <Ionicons name={isFullscreen ? 'contract' : 'expand'} size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {!isFullscreen && (
                <>
                    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>

                        {selectedLecture && isCompleted(selectedLecture.lectureId) && (
                            <View style={styles.actionContainer}>
                                <View style={styles.completedBtn}>
                                    <Ionicons
                                        name="checkmark-done-circle"
                                        size={22}
                                        color="#4ADE80"
                                    />
                                    <Text style={styles.completedText}>Completed</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.progressSection}>
                            <View style={styles.progressBarBackground}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${(new Set(progress.lectureCompleted || []).size / (getTotalLectures() || 1)) * 100}%`
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {Math.round((new Set(progress.lectureCompleted || []).size / (getTotalLectures() || 1)) * 100)}% Course Complete
                            </Text>
                        </View>

                        {/* Course Header */}
                        <View style={styles.mainInfo}>
                            <View style={styles.titleRow}>
                                <Text style={styles.courseTitle}>{course?.courseTitle}</Text>
                            </View>

                            <View style={styles.instructorRow}>
                                <Image
                                    source={{ uri: course?.educatorInfo?.profileImage || 'https://i.pravatar.cc/150?u=mentor' }}
                                    style={styles.miniAvatar}
                                />
                                <Text style={styles.instructorName}>
                                    {course?.educatorInfo?.name || 'Expert Educator'}
                                </Text>
                                <View style={styles.langBadge}>
                                    <Text style={styles.langText}>English</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Ionicons name="star" size={20} color={THEME.accent} />
                                <View>
                                    <Text style={styles.statLabel}>Rating</Text>
                                    <Text style={styles.statValue}>{course?.averageRating || '4.8'}/5.0</Text>
                                </View>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="play-circle" size={20} color={THEME.accent} />
                                <View>
                                    <Text style={styles.statLabel}>Progress</Text>
                                    <Text style={styles.statValue}>
                                        {new Set(progress.lectureCompleted || []).size} Lessons
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tabsContainer}>
                            {['About', 'Curriculum', 'Handouts', 'Review'].map((tab) => (
                                <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => setActiveTab(tab)}>
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                                    {activeTab === tab && <View style={styles.activeIndicator} />}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {activeTab === 'About' && (
                            <View style={styles.tabSection}>
                                <Text style={styles.sectionTitle}>Description</Text>
                                <Text style={styles.descriptionText}>{course?.courseDescription}</Text>

                                {course?.courseType === 'premium' && course?.premiumFeatures && (
                                    <View style={{ marginTop: 25 }}>
                                        <Text style={styles.sectionTitle}>Premium Mentorship</Text>

                                        <View style={styles.premiumGrid}>
                                            {course.premiumFeatures.hasInstructorAssistance && (
                                                <View style={styles.premiumItem}>
                                                    <Ionicons name="person-add" size={20} color={THEME.accent} />
                                                    <Text style={styles.premiumText}>{course.premiumFeatures.assistanceHours}h Personal Support</Text>
                                                </View>
                                            )}
                                            {course.premiumFeatures.hasLiveSessions && (
                                                <View style={styles.premiumItem}>
                                                    <Ionicons name="videocam" size={20} color={THEME.accent} />
                                                    <Text style={styles.premiumText}>Live Sessions</Text>
                                                </View>
                                            )}
                                            {course.premiumFeatures.hasCareerSupport && (
                                                <View style={styles.premiumItem}>
                                                    <Ionicons name="briefcase" size={20} color={THEME.accent} />
                                                    <Text style={styles.premiumText}>Career Support</Text>
                                                </View>
                                            )}
                                        </View>

                                        <Text style={[styles.sectionTitle, { marginTop: 15, fontSize: 16 }]}>Connect with Mentor</Text>
                                        <View style={styles.socialRow}>
                                            {course.premiumFeatures.socialLinks?.whatsapp && (
                                                <TouchableOpacity
                                                    style={[styles.socialBtn, { backgroundColor: '#25D366' }]}
                                                    onPress={() => Linking.openURL(`https://wa.me/${course.premiumFeatures.socialLinks.whatsapp}`)}
                                                >
                                                    <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                                                </TouchableOpacity>
                                            )}
                                            {course.premiumFeatures.socialLinks?.discord && (
                                                <TouchableOpacity
                                                    style={[styles.socialBtn, { backgroundColor: '#5865F2' }]}
                                                    onPress={() => Linking.openURL(course.premiumFeatures.socialLinks.discord)}
                                                >
                                                    <Ionicons name="logo-discord" size={20} color="#fff" />
                                                </TouchableOpacity>
                                            )}
                                            {course.premiumFeatures.socialLinks?.telegram && (
                                                <TouchableOpacity
                                                    style={[styles.socialBtn, { backgroundColor: '#0088cc' }]}
                                                    onPress={() => Linking.openURL(course.premiumFeatures.socialLinks.telegram)}
                                                >
                                                    <Ionicons name="paper-plane" size={20} color="#fff" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'Curriculum' && (
                            <View style={styles.tabSection}>
                                {course?.courseContent?.map((chapter, chIdx) => (
                                    <View key={chIdx} style={styles.chapterBox}>
                                        <TouchableOpacity
                                            style={styles.chapterHeader}
                                            onPress={() => setOpenChapters(prev => ({ ...prev, [chIdx]: !prev[chIdx] }))}
                                        >
                                            <Text style={styles.chapterTitle}>{chapter.chapterTitle}</Text>
                                            <Ionicons name={openChapters[chIdx] ? "chevron-down" : "chevron-forward"} size={18} color={THEME.textSecondary} />
                                        </TouchableOpacity>

                                        {openChapters[chIdx] && chapter.chapterContent?.map((lecture) => {
                                            const currentId = lecture.lectureId || lecture._id;
                                            const isActive = selectedLecture?.lectureId === currentId;

                                            return (
                                                <TouchableOpacity
                                                    key={currentId}
                                                    style={[styles.lectureItem, isActive && styles.activeLecture]}
                                                    onPress={() => setSelectedLecture({ ...lecture, lectureId: currentId })}
                                                >
                                                    <Ionicons
                                                        name={isCompleted(currentId) ? "checkmark-circle" : "play-circle"}
                                                        size={22}
                                                        color={isActive ? "#fff" : (isCompleted(currentId) ? "#4ADE80" : THEME.textSecondary)}
                                                    />
                                                    <Text style={[styles.lectureName, isActive && styles.activeLectureText]}>
                                                        {decode(lecture.lectureTitle)}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        )}

                        {activeTab === 'Handouts' && (
                            <View style={styles.tabSection}>
                                <Text style={styles.sectionTitle}>Resources & Handouts</Text>

                                {course?.premiumFeatures?.handouts && course.premiumFeatures.handouts.length > 0 ? (
                                    course.premiumFeatures.handouts.map((item, index) => (
                                        <View key={index} style={styles.handoutCard}>
                                            <View style={styles.handoutInfo}>
                                                <View style={styles.handoutIconBg}>
                                                    <Ionicons
                                                        name={item.type?.includes('pdf') ? "file-pdf" : "document-text"}
                                                        size={20}
                                                        color={THEME.accent}
                                                    />
                                                </View>
                                                <View>
                                                    <Text style={styles.handoutTitle} numberOfLines={1}>
                                                        {item.name || `Handout ${index + 1}`}
                                                    </Text>
                                                    <Text style={styles.handoutSize}>
                                                        {(item.size / 1024 / 1024).toFixed(2)} MB • {item.type.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.downloadBtn}
                                                onPress={() => handleDownload(item.url)}
                                            >
                                                <Ionicons name="download-outline" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="file-tray-outline" size={48} color={THEME.border} />
                                        <Text style={styles.descriptionText}>No handouts available for this course.</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'Review' && (
                            <View style={styles.tabSection}>
                                <Text style={styles.sectionTitle}>Your Rating</Text>
                                <View style={styles.ratingRow}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <TouchableOpacity key={s} onPress={() => !ratingLoading && submitRating(s)}>
                                            <Ionicons
                                                name={s <= userRating ? "star" : "star-outline"}
                                                size={32}
                                                color={THEME.star}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.descriptionText}>Rate this course to help other students.</Text>
                            </View>
                        )}
                    </ScrollView>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background },
    videoWrapper: { height: height * 0.28, backgroundColor: '#000' },
    fullscreenVideo: { flex: 1, backgroundColor: '#000' },
    video: { width: '100%', height: '100%' },
    headerBack: { position: 'absolute', top: 20, left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    fullscreenBtn: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 10 },
    placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderImage: { width: '100%', height: '100%', opacity: 0.4 },
    placeholderText: { color: '#fff', position: 'absolute', fontWeight: '600' },
    content: { flex: 1, paddingHorizontal: 20 },
    mainInfo: { marginTop: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    courseTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.textMain, flex: 1 },
    bookmarkIcon: { backgroundColor: THEME.card, padding: 10, borderRadius: 12 },
    instructorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    miniAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
    instructorName: { color: THEME.textSecondary, fontSize: 14, marginRight: 10 },
    langBadge: { backgroundColor: THEME.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    langText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    statCard: { width: '48%', backgroundColor: THEME.card, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
    statLabel: { color: THEME.textSecondary, fontSize: 11 },
    statValue: { color: THEME.textMain, fontSize: 13, fontWeight: 'bold' },
    tabsContainer: { flexDirection: 'row', marginTop: 25, borderBottomWidth: 1, borderBottomColor: THEME.border },
    tabItem: { marginRight: 25, paddingBottom: 10 },
    tabText: { color: THEME.textSecondary, fontSize: 15 },
    activeTabText: { color: THEME.accent, fontWeight: 'bold' },
    activeIndicator: { position: 'absolute', bottom: 0, width: '100%', height: 2, backgroundColor: THEME.accent },
    tabSection: { marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.textMain, marginBottom: 10 },
    descriptionText: { color: THEME.textSecondary, lineHeight: 22, fontSize: 14 },
    chapterBox: { marginBottom: 12, backgroundColor: THEME.card, borderRadius: 12, overflow: 'hidden' },
    chapterHeader: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    chapterTitle: { color: THEME.textMain, fontWeight: '600', fontSize: 15 },
    lectureItem: { padding: 14, paddingLeft: 20, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: THEME.border },
    activeLecture: { backgroundColor: THEME.accent },
    lectureName: { color: THEME.textSecondary, fontSize: 14, flex: 1 },
    activeLectureText: { color: '#FFFFFF', fontWeight: '600' },
    ratingRow: { flexDirection: 'row', gap: 10, marginVertical: 15 },
    mentorCard: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: THEME.card, padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 10, borderWidth: 1, borderColor: THEME.border },
    mentorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mentorAvatar: { width: 45, height: 45, borderRadius: 12 },
    mentorName: { color: THEME.textMain, fontWeight: 'bold' },
    mentorLabel: { color: THEME.textSecondary, fontSize: 12 },
    mentorActions: { flexDirection: 'row', gap: 8 },
    iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2D3748', justifyContent: 'center', alignItems: 'center' },
    actionContainer: { marginTop: 15, marginBottom: 5, alignItems: 'flex-start' },
    markCompleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.accent, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 6 },
    completedBtn: { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderWidth: 1, borderColor: '#4ADE80' },
    markCompleteText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    completedText: { color: '#4ADE80' },
    handoutCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.card, padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: THEME.border },
    handoutInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    handoutIconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    handoutTitle: { fontSize: 14, fontWeight: '600', color: THEME.textMain, width: width * 0.5 },
    handoutSize: { fontSize: 12, color: THEME.textSecondary, marginTop: 2 },
    downloadBtn: { backgroundColor: THEME.accent, padding: 8, borderRadius: 10 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 10 },
    premiumGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    premiumItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, gap: 8 },
    premiumText: { fontSize: 12, color: THEME.textMain, fontWeight: '600' },
    socialRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
    socialBtn: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    videoLoadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
    progressSection: { marginTop: 20, marginBottom: 10 },
    progressBarBackground: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', width: '100%' },
    progressBarFill: { height: '100%', backgroundColor: '#4ADE80' },
    progressText: { marginTop: 6, fontSize: 12, fontWeight: '700', color: THEME.textSecondary },
});

export default CourseVideoPlayer;