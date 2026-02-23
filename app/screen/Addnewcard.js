import { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Addnewcard = () => {
  const [cardName, setCardName] = useState('alexis');
  const [cardNumber, setCardNumber] = useState('**** **65 8785 3456');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('***');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Card</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Card Preview */}
        <View style={styles.card}>
          {/* Chip */}
          <View style={styles.cardChip} />

          {/* Card Number */}
          <Text style={styles.cardNumber}>1234 5678 8765 0876</Text>

          {/* Valid Thru and CVV */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardInfoText}>Valid Thru: 12/28</Text>
            <Text style={styles.cardInfoText}>CVV: ***</Text>
          </View>

          {/* Card Name */}
          <Text style={styles.cardName}>ALEX</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Card Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Card Name<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={cardName}
              onChangeText={setCardName}
              placeholder="Enter card name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Card Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Card Number<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="Enter card number"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Expiry Date and CVV Row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>
                Expiry Date<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>
                CVV<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="***"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </View>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Card</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#2B7EFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    height: 200,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 40,
    height: 28,
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 10,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardInfoText: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.8,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#FF0000',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
  },
  addButton: {
    backgroundColor: '#2B7EFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});


export default Addnewcard