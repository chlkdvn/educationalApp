import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  ChevronLeft,
  Calendar,
  ChevronDown,
  ArrowRight,
  User,
  Pencil,
} from "lucide-react-native";
import CountryPicker from "react-native-country-picker-modal";
import { useRouter } from "expo-router";



export default function ProfileScreen() {
    const router = useRouter();
  const [countryCode, setCountryCode] = useState("US");
  const [phone, setPhone] = useState("");
  const [genderModal, setGenderModal] = useState(false);
  const [gender, setGender] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <ChevronLeft size={26} color="#000" />
          <Text style={styles.headerText}>Fill Your Profile</Text>
        </View>

        {/* Profile Icon Instead of Image */}
        <View style={styles.profileWrapper}>
          <View style={styles.avatarCircle}>
            <User size={52} color="#6c7480" />
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Pencil size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#A0A4AB"
          style={styles.input}
        />

        {/* Nick Name */}
        <TextInput
          placeholder="Nick Name"
          placeholderTextColor="#A0A4AB"
          style={styles.input}
        />

        {/* DOB */}
        <View style={styles.inputIcon}>
          <Calendar size={20} color="#A0A4AB" />
          <TextInput
            placeholder="Date of Birth"
            placeholderTextColor="#A0A4AB"
            style={styles.inputWithIcon}
          />
        </View>

        {/* Email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#A0A4AB"
          style={styles.input}
          keyboardType="email-address"
        />

        {/* Phone */}
        <View style={styles.phoneRow}>
          <CountryPicker
            countryCode={countryCode}
            withFilter
            withFlag
            withCountryNameButton={false}
            withCallingCode
            onSelect={(country) => {
              setCountryCode(country.cca2);
            }}
            containerButtonStyle={styles.flagButton}
          />

          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#A0A4AB"
            style={styles.phoneInput}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Gender */}
        <TouchableOpacity
    style={styles.dropdown}
    onPress={() => setGenderModal(true)}
  >
    <Text style={{ color: gender ? "#000" : "#A0A4AB" }}>
      {gender || "Gender"}
    </Text>
    <ChevronDown size={20} color="#A0A4AB" />
  </TouchableOpacity>


        {/* Continue */}
        <TouchableOpacity onPress={() => router.push("/auth/create-pin")} style={styles.continueBtn}>
          <Text style={styles.continueText}>Continue</Text>
          <ArrowRight size={22} color="#fff" />
        </TouchableOpacity>
        {/* Gender Select Modal */}
        {/* Gender Select Modal */}
        {genderModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.genderSheet}>
              <Text style={styles.genderTitle}>Select Gender</Text>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => {
                  setGender("Male");
                  setGenderModal(false);
                }}
              >
                <Text style={styles.genderLabel}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => {
                  setGender("Female");
                  setGenderModal(false);
                }}
              >
                <Text style={styles.genderLabel}>Female</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderCancel}
                onPress={() => setGenderModal(false)}
              >
                <Text style={styles.genderCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 60,          // ⬅⬅ pushes everything downward
    paddingBottom: 40,
    alignItems: "center",
    backgroundColor: "#F3F7FF",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
  profileWrapper: {
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
  },

  avatarCircle: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "#E6ECF5",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#27C080",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,     // ⬅ perfect alignment
    bottom: 0,    // ⬅ sits at bottom right
  },
  input: {
    width: "100%",
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 15,
  },
  inputIcon: {
    width: "100%",
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputWithIcon: {
    marginLeft: 10,
    flex: 1,
  },
  phoneRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  flagButton: {
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
  },
  dropdown: {
    width: "100%",
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  continueBtn: {
    width: "100%",
    height: 55,
    backgroundColor: "#2979FF",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  continueText: {
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
  modalOverlay: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.35)",
  justifyContent: "flex-end",
  paddingHorizontal: 0,
},

genderSheet: {
  backgroundColor: "#fff",
  paddingTop: 20,
  paddingBottom: 30,
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  width: "100%",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 6,
},

genderTitle: {
  fontSize: 17,
  fontWeight: "600",
  marginBottom: 15,
  color: "#000",
},

genderOption: {
  width: "90%",
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
  alignItems: "center",
},

genderLabel: {
  fontSize: 16,
  color: "#000",
},

genderCancel: {
  marginTop: 10,
  width: "90%",
  paddingVertical: 14,
  alignItems: "center",
},

genderCancelText: {
  color: "red",
  fontSize: 16,
  fontWeight: "500",
},

});
