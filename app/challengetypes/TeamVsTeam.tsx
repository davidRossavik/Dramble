import { Challenge } from '@/utils/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
};

export default function TeamVsTeam({ challenge }: Props) {
  const { title, description, category, type, odds } = challenge;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>Type: {type} (Team vs Team)</Text>
        <Text style={styles.metaText}>Kategori: {category}</Text>
        <Text style={styles.metaText}>Odds: {odds}</Text>
      </View>

      {/* Team-spesifikk info */}
      <View style={styles.teamInfo}>
        <Text style={styles.teamText}>Lag A vs Lag B</Text>
        <Text style={styles.teamHint}>Velg vinner i spillfasen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    color: '#555',
  },
  metaContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  teamInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  teamText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  teamHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
  },
});
