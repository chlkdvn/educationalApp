import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

const Term = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Section 1: Condition & Attending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condition & Attending</Text>
          <Text style={styles.paragraph}>
            At enim hic etiam dolore. Dulce omnium, lave optatum, probo longe, stoic natura nostrae retorunt. At offre gravius. Nullus set qitur cuiusquam dine valuist. Potam, qui equem rationet fere nostra imperes. Ut vero sed invectoc?
          </Text>
          <Text style={styles.paragraph}>
            Quisre hac odendum est, prosilere nobis hoc notis philosophorum duris.
          </Text>
          <Text style={styles.paragraph}>
            Sed fruge non sakem catidis eium, qui oloquti dignide faciat, verum ettom proopetiotem, ut M. Est causam officanis, quod In facium est, ut etus ope aluot, quam ut invenri.
          </Text>
        </View>

        {/* Section 2: Terms & Use */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Use</Text>
          <Text style={styles.paragraph}>
            Ut proverbsis non nulla vortions sint quem vestrg dugingito. Timent selemantur u propuisto, te, ne ab hac porro qusedam in his rebus omnia sed olucut. Omnes semp tunturdum matum, qua sensus hibernoc. Cum id frubutur, te exptem defundent, quasi Perpateici, vortus. Qulibusnam proestentes? Perfecthe facec esse dect, quidem hentanus. Si id optinebit, quos seis praeclars traduntur vel numquam probelicis, igtur neque erisfutarum opinarum beatae neque supplendum non beatua, est.
          </Text>
          <Text style={styles.paragraph}>
            Dicam, inquam, et quidem discandit causa magis, quam que te aut Epicurum reprehendum vedin. Dolor srgis, id est summem malum, metuator semper volumus nostur.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 12,
    textAlign: 'left',
  },
});

 export default Term;