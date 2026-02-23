import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CourseFilterSidebar = () => {
    const [selectedCategories, setSelectedCategories] = useState(['UI Design', 'Web Development', 'SEO & Marketing']);
    const [selectedLevels, setSelectedLevels] = useState(['All Levels', 'Beginners']);
    const [selectedPrice, setSelectedPrice] = useState(['Paid']);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedRating, setSelectedRating] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState([]);

    const toggleItem = (item, list, setList) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const clearAll = () => {
        setSelectedCategories([]);
        setSelectedLevels([]);
        setSelectedPrice([]);
        setSelectedFeatures([]);
        setSelectedRating([]);
        setSelectedDuration([]);
    };

    const handleBack = () => {
        router.back()
    };

    const handleApply = () => {
        const filters = {
            categories: selectedCategories,
            levels: selectedLevels,
            price: selectedPrice,
            features: selectedFeatures,
            rating: selectedRating,
            duration: selectedDuration
        };

        Alert.alert('Filters Applied', JSON.stringify(filters, null, 2));
        // In real app: Apply filters and navigate back
    };

    const categories = [
        'UI Design',
        'Web Development',
        'SEO & Marketing',
        'Graphic Design',
        'UX & Architecture',
        'Arts & Humanities'
    ];

    const levels = ['All Levels', 'Beginners', 'Intermediate', 'Expert'];
    const prices = ['Paid', 'Free'];
    const features = ['All Content', 'Subtitles', 'Coding Exercise', 'Practice Tests'];
    const ratings = ['4.5 & Up Above', '4.0 & Up Above', '3.5 & Up Above', '3.0 & Up Above'];
    const durations = ['0-2 Hours', '3-6 Hours', '7-16 Hours', '17+ Hours'];

    const CheckboxItem = ({ label, isSelected, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={styles.checkboxItem}
            activeOpacity={0.7}
        >
            <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected
            ]}>
                {isSelected && <Check size={16} color="#ffffff" />}
            </View>
            <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                        <ArrowLeft size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Filter</Text>
                </View>
                <TouchableOpacity onPress={clearAll} activeOpacity={0.7}>
                    <Text style={styles.clearButton}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Sub-Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sub-Categories:</Text>
                    {categories.map(category => (
                        <CheckboxItem
                            key={category}
                            label={category}
                            isSelected={selectedCategories.includes(category)}
                            onPress={() => toggleItem(category, selectedCategories, setSelectedCategories)}
                        />
                    ))}
                </View>

                {/* Levels */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Levels:</Text>
                    {levels.map(level => (
                        <CheckboxItem
                            key={level}
                            label={level}
                            isSelected={selectedLevels.includes(level)}
                            onPress={() => toggleItem(level, selectedLevels, setSelectedLevels)}
                        />
                    ))}
                </View>

                {/* Price */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price:</Text>
                    {prices.map(price => (
                        <CheckboxItem
                            key={price}
                            label={price}
                            isSelected={selectedPrice.includes(price)}
                            onPress={() => toggleItem(price, selectedPrice, setSelectedPrice)}
                        />
                    ))}
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Features:</Text>
                    {features.map(feature => (
                        <CheckboxItem
                            key={feature}
                            label={feature}
                            isSelected={selectedFeatures.includes(feature)}
                            onPress={() => toggleItem(feature, selectedFeatures, setSelectedFeatures)}
                        />
                    ))}
                </View>

                {/* Rating */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rating:</Text>
                    {ratings.map(rating => (
                        <CheckboxItem
                            key={rating}
                            label={rating}
                            isSelected={selectedRating.includes(rating)}
                            onPress={() => toggleItem(rating, selectedRating, setSelectedRating)}
                        />
                    ))}
                </View>

                {/* Video Duration */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Video Duration:</Text>
                    {durations.map(duration => (
                        <CheckboxItem
                            key={duration}
                            label={duration}
                            isSelected={selectedDuration.includes(duration)}
                            onPress={() => toggleItem(duration, selectedDuration, setSelectedDuration)}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Apply Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.applyButton}
                    activeOpacity={0.8}
                    onPress={handleApply}
                >
                    <Text style={styles.applyButtonText}>Apply</Text>
                    <ArrowRight size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    clearButton: {
        fontSize: 14,
        color: '#6b7280',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 4,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxSelected: {
        backgroundColor: '#14b8a6',
        borderColor: '#14b8a6',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    applyButton: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 9999,
    },
    applyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
});

export default CourseFilterSidebar;