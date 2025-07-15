import { Challenge } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
};

export default function OneVsOne({ challenge }: Props) {
  const { title, description, category, type, odds } = challenge;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Kategori: {category}</Text>
        <Text style={styles.detailText}>Type: {type}</Text>
        <Text style={styles.detailText}>Odds: {odds}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    color: '#555',
    lineHeight: 22,
  },
  detailsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});