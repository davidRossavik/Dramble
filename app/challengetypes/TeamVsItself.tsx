import { Challenge } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
};

export default function TeamVsItself({ challenge }: Props) {
  // Destrukturer for bedre lesbarhet
  const { title, description, category, type, odds } = challenge;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {/* Metadata seksjon */}
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>Type: {type} (Team-vs-Itself)</Text>
        <Text style={styles.metaText}>Kategori: {category}</Text>
        <Text style={styles.metaText}>Odds: {odds}</Text>
      </View>
    </View>
  );
}

// Grunnleggende styling
const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22, // Bedre lesbarhet for lengre tekst
  },
  metaContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee', // Lys grå linje for separasjon
  },
  metaText: {
    fontSize: 14,
    color: '#666', // Mørk grå for mindre viktig tekst
    marginBottom: 4,
  },
});