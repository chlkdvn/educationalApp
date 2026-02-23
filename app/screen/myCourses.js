import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
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
    View,
    Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');
const backendUrl ="https://2c29-102-90-81-15.ngrok-free.app";

const MyCourses = () => {
    const navigation = useNavigation();
    
    // Auth state
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const [selectedTab, setSelectedTab] = useState('All');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [progressMap, setProgressMap] = useState({});
    const [certificateStatus, setCertificateStatus] = useState({});
    const [courseFullData, setCourseFullData] = useState({});
    const [courseResources, setCourseResources] = useState({});
    const [loadingResources, setLoadingResources] = useState({});
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth status when screen is focused
    useFocusEffect(
        useCallback(() => {
            checkAuthStatus();
        }, [])
    );

    const checkAuthStatus = async () => {
        try {
            setIsLoadingAuth(true);
            // Try to get user data from AsyncStorage first
            const storedUser = await AsyncStorage.getItem('user');
            
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // If we have stored courses, use them
                if (parsedUser.enrolledCourses) {
                    setEnrolledCourses(parsedUser.enrolledCourses);
                }
            } else {
                // Try to fetch current user from your API
                try {
                    const { data } = await axios.get(`${backendUrl}/api/user/me`, {
                        withCredentials: true
                    });
                    // API returns { success: true, data: { ...userData } }
                    if (data.success && data.data) {
                        const userData = data.data;
                        setUser(userData);
                        // Set enrolled courses from the user data
                        setEnrolledCourses(userData.enrolledCourses || []);
                        await AsyncStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        setUser(null);
                        setEnrolledCourses([]);
                    }
                } catch (error) {
                    console.error('API fetch error:', error);
                    setUser(null);
                    setEnrolledCourses([]);
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setEnrolledCourses([]);
        } finally {
            setIsLoadingAuth(false);
            setLoading(false);
        }
    };

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
            const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
                withCredentials: true
            });
            if (data.success) {
                // Handle both response formats: { enrolledCourses: [] } or { data: { enrolledCourses: [] } }
                const courses = data.enrolledCourses || data.data?.enrolledCourses || [];
                setEnrolledCourses(courses);
            }
        } catch (err) {
            console.error('Failed to load courses:', err);
            Alert.alert('Error', 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const getCourseProgress = async () => {
        try {
            const newProgressMap = {};

            await Promise.all(
                enrolledCourses.map(async (course) => {
                    try {
                        const { data } = await axios.post(
                            `${backendUrl}/api/user/get-course-progress`,
                            { courseId: course._id },
                            { withCredentials: true }
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
                            { withCredentials: true }
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
            const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                withCredentials: true
            });
            if (data.success) {
                const courseData = data.courseData || data.data;
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
        if (!isLoadingAuth && user && enrolledCourses.length === 0) {
            // Only fetch if we don't already have courses from the user object
            fetchUserEnrolledCourses();
        } else if (!isLoadingAuth && user) {
            // If we have courses from user object, just stop loading
            setLoading(false);
        }
    }, [isLoadingAuth, user]);

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

    // Show loading while checking auth status
    if (isLoadingAuth) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1E88FF" />
            </SafeAreaView>
        );
    }

    // Show sign in message if not authenticated
    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.signedOut}>
                    <Ionicons name="log-in-outline" size={60} color="#999" />
                    <Text style={styles.signedOutText}>Please sign in to view your courses</Text>
                    <TouchableOpacity 
                        style={styles.signInBtn}
                        onPress={() => navigation.navigate('screen/home')}
                    >
                        <Text style={styles.signInBtnText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
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
                    filteredCourses.map((course, index) => {
                        const uniqueKey = course._id ? `course-${course._id}-${index}` : `course-fallback-${index}`;
                        const progress = progressMap[course._id] || { lectureCompletedCount: 0, totalLectures: 0, percentage: '0' };
                        const isCompleted = isCourseCompleted(course._id);
                        const hasCertificate = course.courseType === 'premium' && course.premiumFeatures?.hasCertificate;
                        const alreadyRequested = certificateStatus[course._id] || false;
                        const isExpanded = expandedCourseId === course._id;
                        const fullData = courseFullData[course._id] || course;
                        const resources = courseResources[course._id] || [];

                        return (
                            <View key={uniqueKey} style={styles.courseContainer}>
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
                                            {isCompleted && (
                                                <View style={styles.badgeCompletedContainer}>
                                                    <Text style={styles.badgeCompletedText}>✓ Completed</Text>
                                                </View>
                                            )}
                                            {hasCertificate && (
                                                <View style={styles.badgeCertContainer}>
                                                    <Text style={styles.badgeCertText}>Certificate</Text>
                                                </View>
                                            )}
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

                                <TouchableOpacity
                                    style={styles.expandBtn}
                                    onPress={() => toggleExpand(course._id)}
                                >
                                    <Text style={styles.expandText}>
                                        {isExpanded ? 'Hide Details' : 'View Details & Resources'}
                                    </Text>
                                    <Ionicons
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color="#6B7280"
                                    />
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
                    <Text style={styles.navLabel}>HISTORY</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: width * 0.05, paddingBottom: height * 0.02, backgroundColor: '#fff', paddingTop: height * 0.015, },
    title: { fontSize: 20, fontWeight: 'bold', color: '#111' },
    
    tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', gap: 10 },
    tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 30, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    activeTab: { backgroundColor: '#1E88FF', borderColor: '#1E88FF' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#444' },
    activeTabText: { color: '#fff' },
    scroll: { flex: 1 },
    
    // REDUCED: Smaller card dimensions
    courseContainer: {
        marginHorizontal: 12,        // Reduced from 16
        marginTop: 12,               // Reduced from 16
        backgroundColor: '#fff',
        borderRadius: 12,            // Reduced from 16
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,             // Reduced from 10
        elevation: 4                 // Reduced from 6
    },
    mainCard: {
        flexDirection: 'column',
    },
    
    // REDUCED: Smaller thumbnail
    thumbnail: {
        width: '100%',
        height: 140,                 // Reduced from 180
    },
    
    // REDUCED: Smaller padding in info section
    infoSection: {
        padding: 12,                 // Reduced from 16
        justifyContent: 'space-between'
    },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },  // Reduced gaps
    
    // ✅ FIXED: Difficulty badge with proper rounded corners
    badge: { 
        fontSize: 11, 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 20, 
        fontWeight: '600',
        overflow: 'hidden'
    },
    difficultyBadge: (diff) => ({
        backgroundColor: diff === 'beginner' ? '#DCFCE7' : diff === 'intermediate' ? '#FEF3C7' : diff === 'advanced' ? '#FEE2E2' : '#E9D5FF',
        color: diff === 'beginner' ? '#166534' : diff === 'intermediate' ? '#92400E' : diff === 'advanced' ? '#991B1B' : '#6B21A8'
    }),
    
    // ✅ FIXED: Completed badge - now rounded pill shape
    badgeCompletedContainer: { 
        backgroundColor: '#DCFCE7', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#86EFAC'
    },
    badgeCompletedText: { 
        color: '#166534', 
        fontSize: 11, 
        fontWeight: '600' 
    },
    
    // ✅ FIXED: Certificate badge - now rounded pill shape
    badgeCertContainer: { 
        backgroundColor: '#FFEDD5', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FDBA74'
    },
    badgeCertText: { 
        color: '#C2410C', 
        fontSize: 11, 
        fontWeight: '600' 
    },
    
    // REDUCED: Smaller course title
    courseTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 6 },  // Reduced from 18/8
    detailsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },  // Reduced gap
    detailText: { fontSize: 12, color: '#666' },  // Reduced from 13
    
    // REDUCED: Smaller progress section
    progressSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },  // Reduced gaps
    circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },  // Reduced from 50/25
    circleText: { fontSize: 13, fontWeight: 'bold' },  // Reduced from 14
    progressBar: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },  // Reduced height
    progressFill: { height: '100%', borderRadius: 3 },
    
    // REDUCED: Smaller action buttons
    actionButtons: { flexDirection: 'row', gap: 8, marginTop: 6 },  // Reduced gap
    playBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#1E88FF', padding: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 6 },  // Reduced padding/gap
    playBtnCompleted: { backgroundColor: '#10B981' },
    playText: { color: '#fff', fontWeight: '600', fontSize: 13 },  // Added smaller font size
    certBtn: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FDBA74', padding: 10, borderRadius: 10, justifyContent: 'center' },  // Reduced padding
    certBtnText: { color: '#F97316', fontWeight: '600', fontSize: 13 },  // Added smaller font size
    certRequested: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 10, justifyContent: 'center' },  // Reduced padding
    certText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },  // Added smaller font size
    
    // REDUCED: Smaller expand button
    expandBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,         // Reduced from 12
        marginHorizontal: 12,        // Reduced from 16
        marginBottom: 12,            // Reduced from 16
        marginTop: 6,                // Reduced from 8
        backgroundColor: '#F3F4F6',
        borderRadius: 10,            // Reduced from 12
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 6,                      // Reduced from 8
    },
    expandText: {
        fontSize: 13,                // Reduced from 14
        color: '#4B5563',
        fontWeight: '600',
    },
    
    // REDUCED: Smaller expanded content padding
    expandedContent: { padding: 12, backgroundColor: '#F9FAFB' },  // Reduced from 16
    sectionTitle: { fontSize: 15, fontWeight: 'bold', marginVertical: 10, color: '#111' },  // Reduced from 16/12
    resourceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 8 },  // Reduced padding/margin
    resourceIcon: { fontSize: 24, marginRight: 10 },  // Reduced from 28/12
    resourceName: { fontSize: 13, fontWeight: '600' },  // Reduced from 14
    resourceInfo: { fontSize: 11, color: '#888', marginTop: 2 },  // Reduced from 12/4
    noData: { fontSize: 13, color: '#888', textAlign: 'center', padding: 16 },  // Reduced from 14/20
    description: { fontSize: 13, color: '#555', lineHeight: 20 },  // Reduced from 14/22
    
    empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, color: '#333' },
    emptyText: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8 },
    signedOut: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    signedOutText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
    signInBtn: { backgroundColor: '#1E88FF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    signInBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    bottomNav: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, borderTopWidth: 1, borderColor: '#EEE' },
    navItem: { flex: 1, alignItems: 'center' },
    navLabel: { fontSize: 11, marginTop: 4, color: '#8E8E93', fontWeight: '500' },
});

export default MyCourses;