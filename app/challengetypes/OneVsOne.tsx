import { Challenge } from '@/utils/types';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';

type Props = {
  challenge: Challenge;
  gameId: string;
};

export default function OneVsOne({ challenge, gameId }: Props) {
  const { title, description, category, type, odds } = challenge;

  const [value, setValue] = useState(0); // Slider
  const [selectedButton, setSelectedButton] = useState<string | null>(null); // MarkedSelectedButton

  // Hente spillere //
  const [player1, player2] = challenge.participants ?? ['?', '?'];

  return (
    <BackgroundWrapper>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Kategori: {category}</Text>
        <Text style={styles.detailText}>{player1} VS {player2}</Text>
        <Text style={styles.detailText}>Type: {type}</Text>
        <Text style={styles.detailText}>Odds: {odds}</Text>
      </View>
    </BackgroundWrapper>
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