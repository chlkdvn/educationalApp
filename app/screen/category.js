import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';


const { width, height } = Dimensions.get("window");

const AllCategory = () => {
    const router = useRouter();
    const navigation = useNavigation();

    const [selectedTab, setSelectedTab] = useState('Categories');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const images = {
        '3d design': 'https://cdn-icons-png.flaticon.com/512/4322/4322993.png', // 3D modeling cube illustration
        'arts & humanities': 'https://cdn-icons-png.flaticon.com/512/5452/5452545.png', // Painting palette & books (arts/humanities)
        'graphic design': 'https://cdn-icons-png.flaticon.com/512/1050/1050283.png', // Graphic tools flat illustration
        'web development': 'https://cdn-icons-png.flaticon.com/512/10535/10535997.png', // Web dev code & browser
        'marketing': 'https://cdn-icons-png.flaticon.com/512/4190/4190335.png', // Digital marketing megaphone & chart
        'app development': 'https://cdn-icons-png.flaticon.com/512/2906/2906388.png', // Mobile app coding illustration
        'frontend development': 'https://cdn-icons-png.flaticon.com/512/11951/11951448.png', // Frontend UI layers
        'backend engineering': 'https://cdn-icons-png.flaticon.com/512/10866/10866466.png', // Server & database backend
        'data science': 'https://cdn-icons-png.flaticon.com/512/11947/11947406.png', // Data analysis charts & AI
        'ai & machine learning': 'https://cdn-icons-png.flaticon.com/512/10594/10594282.png', // Neural network brain illustration
        'cybersecurity': 'https://cdn-icons-png.flaticon.com/512/10071/10071326.png', // Shield & lock security
        'cloud computing': 'https://cdn-icons-png.flaticon.com/512/4213/4213470.png', // Cloud server network
        'mobile development': 'https://cdn-icons-png.flaticon.com/512/2906/2906388.png', // Same as app dev (very similar)
        'ui/ux design': 'https://cdn-icons-png.flaticon.com/512/12125/12125666.png', // Wireframe & prototype UI/UX
        'software engineering': 'https://cdn-icons-png.flaticon.com/512/10535/10535997.png', // Code gears & engineering (similar to web dev but fits)

        'basic': 'https://www.shutterstock.com/image-vector/hand-drawn-flat-set-illustrations-260nw-2176845407.jpg',
        'premium': 'https://www.shutterstock.com/image-vector/certificate-badge-icon-premium-quality-260nw-2599336603.jpg',
        'beginner': 'https://thumbs.dreamstime.com/b/learning-progress-levels-beginner-to-expert-diagram-vector-design-generative-ai-clear-illustration-depicting-path-393177999.jpg',
        'intermediate': 'https://img-c.udemycdn.com/course/750x422/628786_dbd9.jpg',
        'advanced': 'https://www.shutterstock.com/image-vector/advanced-computer-skills-abstract-concept-260nw-2291781289.jpg',
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('https://2c29-102-90-81-15.ngrok-free.app/api/course/all');
                const data = await response.json();
                if (data.success && Array.isArray(data.courses)) {
                    setCourses(data.courses);
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const categoryData = useMemo(() => {
        const catMap = {};
        courses.forEach(course => {
            const cat = course.category?.toLowerCase();
            if (cat && images[cat]) {
                if (!catMap[cat]) catMap[cat] = { name: cat, ids: [], image: images[cat] };
                catMap[cat].ids.push(course._id);
            }
        });
        return Object.values(catMap);
    }, [courses]);

    const typeData = useMemo(() => {
        const typeMap = {};
        courses.forEach(course => {
            const type = course.courseType?.toLowerCase();
            if (type && images[type]) {
                if (!typeMap[type]) typeMap[type] = { name: type, ids: [], image: images[type] };
                typeMap[type].ids.push(course._id);
            }
        });
        return Object.values(typeMap);
    }, [courses]);

    const difficultyData = useMemo(() => {
        const diffMap = {};
        courses.forEach(course => {
            const diff = course.difficulty?.toLowerCase();
            if (diff && images[diff]) {
                if (!diffMap[diff]) diffMap[diff] = { name: diff, ids: [], image: images[diff] };
                diffMap[diff].ids.push(course._id);
            }
        });
        return Object.values(diffMap);
    }, [courses]);

    let list = [];
    if (selectedTab === 'Categories') list = categoryData;
    else if (selectedTab === 'Course Types') list = typeData;
    else if (selectedTab === 'Difficulties') list = difficultyData;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Categories</Text>
                </View>

                {/* Search Bar */}
                <TouchableOpacity
                    style={styles.searchContainer}
                    onPress={() => navigation.navigate('screen/search')}
                    activeOpacity={0.7}
                >
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for categories..."
                        placeholderTextColor="#C7C7CC"
                        editable={false}
                        pointerEvents="none"
                    />
                    <View style={styles.searchButton}>
                        <Ionicons name="search" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Categories' && styles.activeTab]}
                        onPress={() => setSelectedTab('Categories')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'Categories' && styles.activeTabText]}>Categories</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Course Types' && styles.activeTab]}
                        onPress={() => setSelectedTab('Course Types')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'Course Types' && styles.activeTabText]}>Course Types</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Difficulties' && styles.activeTab]}
                        onPress={() => setSelectedTab('Difficulties')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'Difficulties' && styles.activeTabText]}>Difficulties</Text>
                    </TouchableOpacity>
                </View>

                {/* Categories Grid */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.categoriesGrid}>
                        {list.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={styles.categoryCard}
                                onPress={() => navigation.navigate('screen/categoryCourse', {
                                    ids: JSON.stringify(item.ids),
                                    title: item.name.charAt(0).toUpperCase() + item.name.slice(1)
                                })}
                            >
                                <View style={styles.categoryImageContainer}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.categoryImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={styles.categoryName}>
                                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {list.length === 0 && (
                            <Text style={styles.noItemsText}>No {selectedTab.toLowerCase()} available yet.</Text>
                        )}
                    </View>
                </ScrollView>
            </View>
            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={22} color="#1E88FF" />
                    <Text style={[styles.navLabel, { color: '#1E88FF' }]}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/myCourses')}>
                    <Ionicons name="book-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>MY COURSES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/inbox')}>
                    <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>INBOX</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/transactions')}>
                    <Ionicons name="wallet-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>HISTORY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/profile')}>
                    <Ionicons name="person-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>PROFILE</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.02,      // was 0.05
        paddingBottom: height * 0.025,

    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: width * 0.055,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: width * 0.05,
        paddingLeft: 20,
        paddingRight: 8,
        marginBottom: height * 0.02,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        padding: 16,
        fontSize: width * 0.04,
        color: '#1A1A1A',
    },
    searchButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.02,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    activeTab: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    activeTabText: {
        color: '#FFF',
    },
    scrollView: {
        flex: 1,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
    navLabel: { fontSize: 11, marginTop: 4, color: '#8E8E93', fontWeight: '500' },
    scrollContent: {
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.03,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - (width * 0.1) - 16) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        minHeight: height * 0.22,
    },
    categoryImageContainer: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
        lineHeight: 22,
    },
    noItemsText: {
        fontSize: width * 0.04,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        width: '100%',
    },
});

export default AllCategory;
