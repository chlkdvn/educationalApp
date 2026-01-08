import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const backendUrl = 'https://educations.onrender.com';

const MyCourses = () => {
    const navigation = useNavigation();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const [selectedTab, setSelectedTab] = useState('All');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [progressMap, setProgressMap] = useState({});
    const [certificateStatus, setCertificateStatus] = useState({});
    const [courseFullData, setCourseFullData] = useState({});
    const [courseResources, setCourseResources] = useState({});
    const [loadingResources, setLoadingResources] = useState({});
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [loading, setLoading] = useState(true);

    const calculateTotalLectures = (course) => {
        if (!course.courseContent) return 0;
        return course.courseContent.reduce((acc, section) => {
            return acc + (section.chapterContent?.length || 0);
        }, 0);
    };

    const CalculateCourseDuration = (course) => {
        if (!course.courseContent) return '0 min';
        let totalMin = course.courseContent.reduce((acc, sec) => {
            return acc + sec.chapterContent.reduce((lacc, lec) => lacc + (lec.lectureDuration || 0), 0);
        }, 0);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const fetchUserEnrolledCourses = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses || []);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const getCourseProgress = async () => {
        try {
            const token = await getToken();
            const newProgressMap = {};

            await Promise.all(
                enrolledCourses.map(async (course) => {
                    try {
                        const { data } = await axios.post(
                            `${backendUrl}/api/user/get-course-progress`,
                            { courseId: course._id },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        const completedLectures = data.progressData?.lectureCompleted || [];
                        const totalLectures = calculateTotalLectures(course);
                        const percentage = totalLectures > 0 ? (completedLectures.length / totalLectures) * 100 : 0;

                        newProgressMap[course._id] = {
                            lectureCompleted: completedLectures,
                            totalLectures,
                            lectureCompletedCount: completedLectures.length,
                            percentage: percentage.toFixed(0)
                        };
                    } catch (err) {
                        const totalLectures = calculateTotalLectures(course);
                        newProgressMap[course._id] = {
                            lectureCompleted: [],
                            totalLectures,
                            lectureCompletedCount: 0,
                            percentage: '0'
                        };
                    }
                })
            );

            setProgressMap(newProgressMap);
        } catch (error) {
            console.error("Progress load error", error);
        }
    };

    const checkCertificateRequests = async () => {
        try {
            const token = await getToken();
            const statusMap = {};

            for (const course of enrolledCourses) {
                const progress = progressMap[course._id];
                if (!progress) continue;

                const isCompleted = progress.lectureCompletedCount === progress.totalLectures && progress.totalLectures > 0;
                const hasCert = course.courseType === 'premium' && course.premiumFeatures?.hasCertificate;

                if (hasCert && isCompleted) {
                    try {
                        const { data } = await axios.post(
                            `${backendUrl}/api/user/check-certificate-requested`,
                            { courseId: course._id },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        statusMap[course._id] = data.alreadyRequested || false;
                    } catch { }
                }
            }
            setCertificateStatus(statusMap);
        } catch (error) { }
    };

    const fetchCourseFullData = async (courseId) => {
        if (courseFullData[courseId]) return;
        setLoadingResources(prev => ({ ...prev, [courseId]: true }));
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                const courseData = data.courseData;
                setCourseFullData(prev => ({ ...prev, [courseId]: courseData }));
                setCourseResources(prev => ({
                    ...prev,
                    [courseId]: courseData.premiumFeatures?.handouts || []
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load course details");
        } finally {
            setLoadingResources(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const shareResource = async (url, name) => {
        try {
            const fileUri = FileSystem.cacheDirectory + name;
            const { uri } = await FileSystem.downloadAsync(url, fileUri);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Sharing not available", "Your device doesn't support sharing.");
                return;
            }

            await Sharing.shareAsync(uri, {
                mimeType: 'application/octet-stream',
                dialogTitle: `Share ${name}`
            });
        } catch (error) {
            console.error("Share failed:", error);
            Alert.alert("Share Failed", "Could not share the file. Opening in browser...");
            Linking.openURL(url);
        }
    };

    const getFileEmoji = (type, url) => {
        const ext = url?.split('.').pop()?.toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return '🖼️';
        if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬';
        if (['mp3', 'wav'].includes(ext)) return '🎵';
        if (['pdf'].includes(ext)) return '📄';
        if (['zip', 'rar'].includes(ext)) return '🗜️';
        if (['doc', 'docx', 'txt'].includes(ext)) return '📝';
        return '📎';
    };

    useEffect(() => {
        if (isLoaded && user) fetchUserEnrolledCourses();
    }, [isLoaded, user]);

    useEffect(() => {
        if (enrolledCourses.length > 0) getCourseProgress();
    }, [enrolledCourses]);

    useEffect(() => {
        if (Object.keys(progressMap).length > 0) checkCertificateRequests();
    }, [progressMap]);

    const isCourseCompleted = (courseId) => {
        const progress = progressMap[courseId];
        if (!progress) return false;
        return progress.lectureCompletedCount === progress.totalLectures && progress.totalLectures > 0;
    };

    const filteredCourses = enrolledCourses.filter((course) => {
        const completed = isCourseCompleted(course._id);

        if (selectedTab === 'Ongoing') return !completed;
        if (selectedTab === 'Completed') return completed;
        return true;
    });

    const ongoingCount = enrolledCourses.filter(c => !isCourseCompleted(c._id)).length;
    const completedCount = enrolledCourses.filter(c => isCourseCompleted(c._id)).length;

    const toggleExpand = (courseId) => {
        if (expandedCourseId === courseId) {
            setExpandedCourseId(null);
        } else {
            setExpandedCourseId(courseId);
            fetchCourseFullData(courseId);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <SignedIn>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Learning</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'All' && styles.activeTab]}
                        onPress={() => setSelectedTab('All')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'All' && styles.activeTabText]}>
                            All ({enrolledCourses.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Ongoing' && styles.activeTab]}
                        onPress={() => setSelectedTab('Ongoing')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'Ongoing' && styles.activeTabText]}>
                            Ongoing ({ongoingCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Completed' && styles.activeTab]}
                        onPress={() => setSelectedTab('Completed')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'Completed' && styles.activeTabText]}>
                            Completed ({completedCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scroll}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#1E88FF" style={{ marginTop: 50 }} />
                    ) : filteredCourses.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="book-outline" size={60} color="#999" />
                            <Text style={styles.emptyTitle}>
                                {selectedTab === 'All' ? 'No courses yet' : `No ${selectedTab.toLowerCase()} courses`}
                            </Text>
                            <Text style={styles.emptyText}>Explore and enroll to start learning</Text>
                        </View>
                    ) : (
                        filteredCourses.map((course) => {
                            const progress = progressMap[course._id] || { lectureCompletedCount: 0, totalLectures: 0, percentage: '0' };
                            const isCompleted = isCourseCompleted(course._id);
                            const hasCertificate = course.courseType === 'premium' && course.premiumFeatures?.hasCertificate;
                            const alreadyRequested = certificateStatus[course._id] || false;
                            const isExpanded = expandedCourseId === course._id;
                            const fullData = courseFullData[course._id] || course;
                            const resources = courseResources[course._id] || [];

                            return (
                                <View key={course._id} style={styles.courseContainer}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('screen/courseprogress', { course })}
                                        style={styles.mainCard}
                                    >
                                        <Image source={{ uri: course.courseThumbnail }} style={styles.thumbnail} />

                                        <View style={styles.infoSection}>
                                            <View style={styles.badges}>
                                                <Text style={[styles.badge, styles.difficultyBadge(course.difficulty)]}>
                                                    {course.difficulty?.charAt(0).toUpperCase() + course.difficulty?.slice(1) || 'Beginner'}
                                                </Text>
                                                {isCompleted && <Text style={styles.badgeCompleted}>✓ Completed</Text>}
                                                {hasCertificate && <Text style={styles.badgeCert}>Certificate</Text>}
                                            </View>

                                            <Text style={styles.courseTitle}>{course.courseTitle}</Text>

                                            <View style={styles.detailsRow}>
                                                <Text style={styles.detailText}>{CalculateCourseDuration(course)}</Text>
                                                <Text style={styles.detailText}>
                                                    {progress.lectureCompletedCount}/{progress.totalLectures} lectures
                                                </Text>
                                            </View>

                                            <View style={styles.progressSection}>
                                                <View style={styles.circle}>
                                                    <Text style={styles.circleText}>{progress.percentage}%</Text>
                                                </View>
                                                <View style={styles.progressBar}>
                                                    <View
                                                        style={[
                                                            styles.progressFill,
                                                            { width: `${progress.percentage}%`, backgroundColor: isCompleted ? '#10B981' : '#1E88FF' }
                                                        ]}
                                                    />
                                                </View>
                                            </View>

                                            <View style={styles.actionButtons}>
                                                <TouchableOpacity
                                                    style={[styles.playBtn, isCompleted && styles.playBtnCompleted]}
                                                    onPress={() => navigation.navigate('screen/courseprogress', { course })}
                                                >
                                                    <Ionicons name="play" size={18} color="#fff" />
                                                    <Text style={styles.playText}>
                                                        {isCompleted ? 'Review' : 'Continue'}
                                                    </Text>
                                                </TouchableOpacity>

                                                {hasCertificate && isCompleted && (
                                                    alreadyRequested ? (
                                                        <View style={styles.certRequested}>
                                                            <Text style={styles.certText}>Requested</Text>
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity
                                                            style={styles.certBtn}
                                                            onPress={() => navigation.navigate('screen/RequestCertificate', { courseId: course._id })}
                                                        >
                                                            <Text style={styles.certBtnText}>Get Certificate</Text>
                                                        </TouchableOpacity>
                                                    )
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.expandBtn} onPress={() => toggleExpand(course._id)}>
                                        <Text style={styles.expandText}>{isExpanded ? 'Hide Details' : 'View Details & Resources'}</Text>
                                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color="#666" />
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.expandedContent}>
                                            {loadingResources[course._id] ? (
                                                <ActivityIndicator size="small" color="#1E88FF" />
                                            ) : (
                                                <>
                                                    <Text style={styles.sectionTitle}>Course Resources</Text>
                                                    {resources.length > 0 ? (
                                                        resources.map((res, i) => (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={styles.resourceItem}
                                                                onPress={() => shareResource(res.url, res.name)}
                                                            >
                                                                <Text style={styles.resourceIcon}>{getFileEmoji(res.type, res.url)}</Text>
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={styles.resourceName}>{res.name}</Text>
                                                                    <Text style={styles.resourceInfo}>{res.type.split('/')[1]?.toUpperCase()}</Text>
                                                                </View>
                                                                <Ionicons name="share-outline" size={22} color="#1E88FF" />
                                                            </TouchableOpacity>
                                                        ))
                                                    ) : (
                                                        <Text style={styles.noData}>No resources available</Text>
                                                    )}

                                                    <Text style={styles.sectionTitle}>About this course</Text>
                                                    <Text style={styles.description}>
                                                        {fullData.courseDescription?.replace(/<[^>]*>/g, '') || 'No description.'}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SignedIn>

            <SignedOut>
                <View style={styles.signedOut}>
                    <Text style={styles.signedOutText}>Please sign in to view your courses</Text>
                </View>
            </SignedOut>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/home')}>
                    <Ionicons name="home-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="book" size={22} color="#1E88FF" />
                    <Text style={[styles.navLabel, { color: '#1E88FF' }]}>MY COURSES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/inbox')}>
                    <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>INBOX</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/transactions')}>
                    <Ionicons name="wallet-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>TRANSACTION</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/profile')}>
                    <Ionicons name="person-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>PROFILE</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', paddingTop: 50 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#111' },
    tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', gap: 10 },
    tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 30, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    activeTab: { backgroundColor: '#1E88FF', borderColor: '#1E88FF' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#444' },
    activeTabText: { color: '#fff' },
    scroll: { flex: 1 },
    courseContainer: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 6 },
    mainCard: { flexDirection: 'row', padding: 16 },
    thumbnail: { width: 120, height: 120, borderRadius: 12 },
    infoSection: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    badge: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontWeight: '600' },
    difficultyBadge: (diff) => ({
        backgroundColor: diff === 'beginner' ? '#DCFCE7' : diff === 'intermediate' ? '#FEF3C7' : diff === 'advanced' ? '#FEE2E2' : '#E9D5FF',
        color: diff === 'beginner' ? '#166534' : diff === 'intermediate' ? '#92400E' : diff === 'advanced' ? '#991B1B' : '#6B21A8'
    }),
    badgeCompleted: { backgroundColor: '#DCFCE7', color: '#166534' },
    badgeCert: { backgroundColor: '#FFEDD5', color: '#C2410C' },
    courseTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 8 },
    detailsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
    detailText: { fontSize: 13, color: '#666' },
    progressSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 12 },
    circle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    circleText: { fontSize: 14, fontWeight: 'bold' },
    progressBar: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    actionButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
    playBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#1E88FF', padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    playBtnCompleted: { backgroundColor: '#10B981' },
    playText: { color: '#fff', fontWeight: '600' },
    certBtn: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FDBA74', padding: 12, borderRadius: 12, justifyContent: 'center' },
    certBtnText: { color: '#F97316', fontWeight: '600' },
    certRequested: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, justifyContent: 'center' },
    certText: { color: '#6B7280', fontWeight: '600' },
    expandBtn: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#F9FAFB', borderTopWidth: 1, borderColor: '#EEE' },
    expandText: { fontSize: 14, color: '#444', fontWeight: '500' },
    expandedContent: { padding: 16, backgroundColor: '#F9FAFB' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 12, color: '#111' },
    resourceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10 },
    resourceIcon: { fontSize: 28, marginRight: 12 },
    resourceName: { fontSize: 14, fontWeight: '600' },
    resourceInfo: { fontSize: 12, color: '#888', marginTop: 4 },
    noData: { fontSize: 14, color: '#888', textAlign: 'center', padding: 20 },
    description: { fontSize: 14, color: '#555', lineHeight: 22 },
    empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, color: '#333' },
    emptyText: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8 },
    signedOut: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    signedOutText: { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 40 },
    bottomNav: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, borderTopWidth: 1, borderColor: '#EEE' },
    navItem: { flex: 1, alignItems: 'center' },
    navLabel: { fontSize: 11, marginTop: 4, color: '#8E8E93', fontWeight: '500' },
});

export default MyCourses;