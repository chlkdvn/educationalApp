import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const EReceipt = () => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>E-Receipt</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Feather name="more-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Menu Popup */}
      {showMenu && (
        <>
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={styles.menuPopup}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Share</Text>
              <Feather name="send" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Download</Text>
              <Feather name="download" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Print</Text>
              <Feather name="printer" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <View style={styles.buildingIcon}>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>
            <View style={styles.checkmarkCircle}>
              <Feather name="check" size={16} color="#FFF" />
            </View>
          </View>
          <View style={styles.rupeeIcon}>
            <Text style={styles.rupeeText}>₹</Text>
          </View>
        </View>

        {/* Barcode */}
        <View style={styles.barcodeContainer}>
          <View style={styles.barcode}>
            {[...Array(40)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.barcodeLine,
                  i % 3 === 0 && styles.barcodeLineThick
                ]} 
              />
            ))}
          </View>
          <View style={styles.barcodeNumbers}>
            <Text style={styles.barcodeNumber}>25234697</Text>
            <Text style={styles.barcodeNumber}>28846345</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>Alex</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email ID</Text>
            <Text style={styles.detailValue}>alexvoxel@gmail.com</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Course</Text>
            <Text style={styles.detailValue}>3d Character Design Ce...</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>Web Development</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>TransactionID</Text>
            <View style={styles.transactionRow}>
              <Text style={styles.detailValue}>SK2456S0976</Text>
              <TouchableOpacity>
                <Feather name="copy" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>759/-</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>Nov 20, 2023 / 15:45</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Paid</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop:40,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buildingIcon: {
    width: 36,
    height: 42,
    backgroundColor: '#10B981',
    borderRadius: 4,
    padding: 4,
    justifyContent: 'space-around',
  },
  windowRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  window: {
    width: 8,
    height: 8,
    backgroundColor: '#FFF',
    borderRadius: 1,
  },
  checkmarkCircle: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F9FAFB',
  },
  rupeeIcon: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -40,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F9FAFB',
  },
  rupeeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  barcodeContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  barcode: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    marginBottom: 12,
  },
  barcodeLine: {
    width: 2,
    height: 50,
    backgroundColor: '#000',
  },
  barcodeLineThick: {
    width: 3,
    height: 60,
  },
  barcodeNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  barcodeNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginBottom: 24,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  menuPopup: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 8,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
});

export default EReceipt;