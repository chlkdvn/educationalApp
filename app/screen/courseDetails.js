import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, Dimensions, Image, SafeAreaView, ScrollView,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const backendUrl ="https://2c29-102-90-81-15.ngrok-free.app";

const CourseDetails = () => {
    const router = useRouter();
    const { courseId } = useLocalSearchParams();

    // Auth state - replaced Clerk with custom auth
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    const [activeTab, setActiveTab] = useState('About');

    const videoRef = useRef(null);

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

    /* ---------- fetch course ---------- */
    useEffect(() => {
        if (!courseId) {
            setError('No course ID provided');
            setLoading(false);
            return;
        }
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${backendUrl}/api/course/${courseId}`,
                    { withCredentials: true }
                );
                if (res.data.success && res.data.courseData) {
                    setCourse(res.data.courseData);
                } else {
                    throw new Error('Invalid course data');
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Could not load course information.');
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    /* ---------- purchase ---------- */
    const handlePurchase = async () => {
        if (!user) {
            return Alert.alert('Login Required', 'Please login to enroll');
        }
        setPurchasing(true);
        try {
            const res = await axios.post(
                `${backendUrl}/api/user/initializeCoursePayment`,
                { courseId },
                { withCredentials: true }
            );
            const data = res.data;
            if (data.alreadyEnrolled) {
                return Alert.alert('Already Enrolled', 'You are already enrolled!');
            }
            if (data.success && data.authorization_url) {
                // Open payment in external browser
                await WebBrowser.openBrowserAsync(data.authorization_url);
                
                // After browser closes, show confirmation
                Alert.alert(
                    'Payment Status',
                    'If you completed the payment, please check your email or My Courses section.',
                    [
                        { text: 'Check My Courses', onPress: () => router.push('/screen/myCourses') },
                        { text: 'OK', style: 'cancel' }
                    ]
                );
                return;
            }
            Alert.alert('Payment Error', data.message || 'Unable to start payment.');
        } catch (err) {
            console.error('Purchase error:', err);
            Alert.alert('Error', 'Payment initialization failed.');
        } finally {
            setPurchasing(false);
        }
    };

    /* ---------- helpers ---------- */
    const formatDuration = (min) => {
        if (!min) return 'N/A';
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h > 0 ? `${h}h ` : ''}${m}m`;
    };

    if (isLoadingAuth || loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1E88FF" />
                    <Text style={{ marginTop: 12, color: '#666' }}>
                        {isLoadingAuth ? 'Checking authentication...' : 'Loading course...'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !course) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text style={{ color: 'red', marginBottom: 20 }}>{error || 'Course not found'}</Text>
                    <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
                        <Text style={styles.btnTxt}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    /* ---------- price ---------- */
    const finalPrice = course.discount > 0
        ? Math.round(course.coursePrice * (100 - course.discount) / 100)
        : course.coursePrice;

    /* ---------- header with promo video ---------- */
    const Header = () => (
        <View style={styles.header}>
            {course.promoUrl ? (
                <Video
                    ref={videoRef}
                    source={{ uri: course.promoUrl }}
                    style={styles.video}
                    useNativeControls
                    resizeMode="cover"
                    isLooping={false}
                />
            ) : (
                <Image source={{ uri: course.courseThumbnail }} style={styles.video} resizeMode="cover" />
            )}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    /* ---------- educator info ---------- */
    const EducatorCard = () => {
        const edu = course.educatorInfo || course.FindEductor;
        if (!edu) return null;
        return (
            <View style={styles.eduCard}>
                <Image source={{ uri: edu.imageUrl }} style={styles.eduAvatar} />
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.eduName}>{edu.name}</Text>
                    <Text style={styles.eduEmail}>{edu.email}</Text>
                </View>
            </View>
        );
    };

    /* ---------- about tab ---------- */
    const AboutTab = () => (
        <View style={{ paddingBottom: 20 }}>
            <EducatorCard />
            <RenderHtml
                contentWidth={width}
                source={{ html: course.courseDescription || '<p>No description</p>' }}
                baseStyle={{ color: '#333', fontSize: 15, lineHeight: 24 }}
            />
            <Text style={styles.sectionTitle}>What You'll Get</Text>
            <View style={styles.benefits}>
                <Row icon="document-text-outline" text={`${course.totalLectures || 0} Lessons`} />
                <Row icon="phone-portrait-outline" text="Access on Mobile & Desktop" />
                <Row icon="trending-up-outline" text={`${course.difficulty} Level`} />
                <Row icon="globe-outline" text={course.language || 'English'} />
                <Row icon="infinite-outline" text="Lifetime Access" />
            </View>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{course.enrolledStudents?.length || 0} Students Enrolled</Text>
        </View>
    );

    /* ---------- curriculum tab ---------- */
    const CurriculumTab = () => (
        <View style={{ paddingBottom: 20 }}>
            <Text style={styles.sectionTitle}>Course Content</Text>
            {course.courseContent?.map((ch, i) => (
                <View key={ch.chapterId || i} style={styles.chapterCard}>
                    <View style={styles.chapHead}>
                        <Text style={styles.chapTitle}>Chapter {i + 1}: {ch.chapterTitle}</Text>
                        <Text style={styles.chapCount}>{ch.chapterContent?.length || 0} Lectures</Text>
                    </View>
                    {ch.chapterContent?.map((lec) => (
                        <View key={lec.lectureId} style={styles.lectureRow}>
                            <Ionicons
                                name={lec.isPreviewFree ? 'play-circle-outline' : 'lock-closed-outline'}
                                size={20}
                                color={lec.isPreviewFree ? '#1E88FF' : '#666'}
                            />
                            <Text style={styles.lectureTitle}>{lec.lectureTitle}</Text>
                            <Text style={styles.lectureDur}>{formatDuration(lec.lectureDuration)}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );

    /* ---------- small helper ---------- */
    const Row = ({ icon, text }) => (
        <View style={styles.row}>
            <Ionicons name={icon} size={24} color="#666" />
            <Text style={styles.rowTxt}>{text}</Text>
        </View>
    );

    /* ---------- main return ---------- */
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.meta}>
                        <Text style={styles.cat}>{course.courseType?.charAt(0).toUpperCase() + course.courseType?.slice(1)}</Text>
                        <Text style={styles.title}>{course.courseTitle}</Text>
                        <View style={styles.stats}>
                            <Ionicons name="people-outline" size={18} color="#666" />
                            <Text style={styles.stat}>{course.totalLectures || 0} Lectures</Text>
                            <Text style={styles.divider}> | </Text>
                            <Ionicons name="time-outline" size={18} color="#666" />
                            <Text style={styles.stat}>{formatDuration(course.totalDuration)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Ionicons name="star" size={16} color="#FFC107" />
                            <Text style={styles.rating}>{course.averageRating?.toFixed(1) || 'New'} ({course.totalReviews || 0})</Text>
                        </View>
                    </View>

                    <View style={styles.tabs}>
                        <TouchableOpacity style={[styles.tab, activeTab === 'About' && styles.activeTab]} onPress={() => setActiveTab('About')}>
                            <Text style={[styles.tabTxt, activeTab === 'About' && styles.activeTxt]}>About</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, activeTab === 'Curriculum' && styles.activeTab]} onPress={() => setActiveTab('Curriculum')}>
                            <Text style={[styles.tabTxt, activeTab === 'Curriculum' && styles.activeTxt]}>Curriculum</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'About' ? <AboutTab /> : <CurriculumTab />}
                </View>
            </ScrollView>

            <View style={styles.enrollBar}>
                <View>
                    <Text style={styles.price}>₦{finalPrice}</Text>
                    {course.discount > 0 && <Text style={styles.oldPrice}>₦{course.coursePrice}</Text>}
                </View>
                <TouchableOpacity
                    style={[styles.enrollBtn, purchasing && { opacity: 0.6 }]}
                    onPress={handlePurchase}
                    disabled={purchasing}
                >
                    {purchasing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.enrollTxt}>Enroll Now</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { width: '100%', height: height * 0.3, position: 'relative' },
    video: { width: '100%', height: '100%' },
    backBtn: { position: 'absolute', top: 50, left: 20, padding: 8, zIndex: 10 },
    content: { padding: 20 },
    meta: { marginBottom: 20 },
    cat: { color: '#FF9500', fontSize: 14, fontWeight: '600', marginBottom: 4 },
    title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
    stats: { flexDirection: 'row', alignItems: 'center' },
    stat: { marginLeft: 6, fontSize: 14, color: '#666' },
    divider: { marginHorizontal: 6, color: '#C7C7CC' },
    rating: { marginLeft: 6, fontSize: 14, fontWeight: '600' },
    eduCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    eduAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
    eduName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
    eduEmail: { fontSize: 14, color: '#666' },
    tabs: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#fff' },
    tabTxt: { fontSize: 15, color: '#8E8E93', fontWeight: '600' },
    activeTxt: { color: '#1A1A1A' },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    benefits: { gap: 12 },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowTxt: { fontSize: 15, color: '#1A1A1A', marginLeft: 12, fontWeight: '500' },
    chapterCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 16 },
    chapHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    chapTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', flex: 1 },
    chapCount: { fontSize: 13, color: '#666' },
    lectureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
    lectureTitle: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1A1A1A' },
    lectureDur: { fontSize: 13, color: '#666' },
    enrollBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
    oldPrice: { fontSize: 14, color: '#8E8E93', textDecorationLine: 'line-through' },
    enrollBtn: {
        backgroundColor: '#1E88FF',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    enrollTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
    btn: { backgroundColor: '#1E88FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
    btnTxt: { color: '#fff', fontWeight: '600' }
});

export default CourseDetails;