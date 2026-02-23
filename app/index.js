import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Online Learning",
    subtitle: "We Provide Classes Online Classes and Pre Recorded Lectures!",
  },
  {
    id: "2",
    title: "Learn from Anytime",
    subtitle: "Booked or Store the Lectures for Future",
  },
  {
    id: "3",
    title: "Get Online Certificate",
    subtitle: "Analyze your scores and Track your results",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      sliderRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Always navigate to auth screen (signup/login toggle)
      router.replace("/auth/signup");
    }
  };

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Skip */}
      <TouchableOpacity
        style={styles.skipContainer}
        onPress={() => router.replace("/auth/signup")}
      >
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        data={slides}
        ref={sliderRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const fadeIn = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });

          const slideUp = scrollX.interpolate({
            inputRange,
            outputRange: [30, 0, 30],
            extrapolate: "clamp",
          });

          return (
            <View style={styles.slide}>
              <Animated.Text
                style={[
                  styles.title,
                  { opacity: fadeIn, transform: [{ translateY: slideUp }] },
                ]}
              >
                {item.title}
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.subtitle,
                  {
                    opacity: fadeIn,
                    transform: [{ translateY: slideUp }],
                  },
                ]}
              >
                {item.subtitle}
              </Animated.Text>
            </View>
          );
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: currentIndex === i ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>

      {/* Next / Get Started Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        {currentIndex === slides.length - 1 && (
          <Text style={styles.nextText}>Get Started</Text>
        )}
        <ArrowRight size={width * 0.065} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------ STYLES ------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
    alignItems: "center",
  },

  skipContainer: {
    position: "absolute",
    top: height * 0.05,
    right: width * 0.05,
    zIndex: 10,
    elevation: 10,
  },

  skip: {
    fontSize: width * 0.045,
    color: "#333",
  },

  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.1,
  },

  title: {
    fontSize: width * 0.065,
    fontWeight: "700",
    color: "#1F2630",
    marginBottom: height * 0.01,
  },

  subtitle: {
    fontSize: width * 0.04,
    textAlign: "center",
    color: "#6F7A8A",
    width: width * 0.75,
  },

  dotsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: height * 0.13,
    alignSelf: "center",
  },

  dot: {
    height: 8,
    width: 8,
    backgroundColor: "#1E88FF",
    marginHorizontal: 4,
    borderRadius: 50,
  },

  nextButton: {
    position: "absolute",
    bottom: height * 0.05,
    right: width * 0.07,
    backgroundColor: "#1E88FF",
    borderRadius: 30,
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.08,
    flexDirection: "row",
    alignItems: "center",
  },

  nextText: {
    color: "#fff",
    fontSize: width * 0.045,
    marginRight: width * 0.02,
  },
});