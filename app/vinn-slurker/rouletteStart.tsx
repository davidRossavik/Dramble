import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const backgroundImage = require('../../assets/images/background.png');
const rouletteImage = require('../../assets/images/roulette.png');
const chipImage = require('../../assets/images/pokerChip.png');



const { width } = Dimensions.get('window');

export default function RouletteStartScreen() {
  const [selected, setSelected] = useState<string | null>(null);
const [chips, setChips] = useState<string[]>([]);
const [chipCount, setChipCount] = useState<number>(0);

  const handleSelect = (value: string) => {
  setSelected(value);
  setChips((prev) => [...prev, value]);
  setChipCount((prev) => prev + 1);
};

const handleRemoveLastChip = () => {
  setChips((prev) => prev.slice(0, -1));
  setChipCount((prev) => (prev > 0 ? prev - 1 : 0));
};

type ButtonDef = {
  label: string;
  top: number;
  left: number;
  type?: 'wide' | 'small'; // Valgfritt felt, enten 'wide' eller 'small'
};

  // Liste over alle knapper med posisjon (du kan justere disse om nødvendig)
  const buttons: ButtonDef[] = [
    { label: '0', top: 23, left: 158 },
    { label: '00', top: 23, left: 235 },
    // 1–36 i grid
    ...Array.from({ length: 36 }, (_, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      return {
        label: `${i + 1}`,
        top: 60 + row * 36,
        left: 145 + col * 50,
      };
    }),
     { label: '2 to 1 (col1)', top: 491, left: 145 },
  { label: '2 to 1 (col2)', top: 491, left: 195 },
  { label: '2 to 1 (col3)', top: 491, left: 247 },

// 1st, 2nd, 3rd 12
{ label: '1st 12', top: 65, left: 103, type: 'wide' },
{ label: '2nd 12', top: 207, left: 103, type: 'wide' },
{ label: '3rd 12', top: 349, left: 103, type: 'wide' },

// Nederste rad
{ label: '1 to 18', top: 65, left: 64, type: 'small' },
{ label: 'EVEN', top: 139, left: 64, type: 'small' },
{ label: 'RED', top: 210, left: 64, type: 'small' },
{ label: 'BLACK', top: 282, left: 64, type: 'small' },
{ label: 'ODD', top: 353, left: 64, type: 'small' },
{ label: '19 to 36', top: 425, left: 64, type: 'small' },

  ];

return (
  <ImageBackground source={backgroundImage} style={styles.background}>
    <View style={styles.container}>
      <Text style={styles.title}>Roulette</Text>
      <Text style={styles.slurkCount}>Plasserte slurker: {chipCount}</Text>


      {/* {selected && (
        <Text style={styles.selectedText}>Valgt: {selected}</Text>
      )} */}

      <View style={styles.boardContainer}>
        <Image source={rouletteImage} style={styles.boardImage} />

        {buttons.map((btn, index) => (
  <Pressable
    key={index}
    onPress={() => handleSelect(btn.label)}
    style={[
      styles.betButton,
      btn.type === 'wide' && styles.wideButton,
      btn.type === 'small' && styles.smallButton,
      { top: btn.top, left: btn.left },
    ]}
  >
    {/* Chip vises hvis valgt */}
    {chips.includes(btn.label) && (
      <Image source={chipImage} style={styles.chip} />
    )}
    <Text style={styles.buttonText}>{btn.label}</Text>
  </Pressable>
))}

      </View>

      <View style={styles.actionRow}>
  <Pressable style={styles.placeBetButton}>
    <Text style={styles.placeBetText}>Plasser bets</Text>
  </Pressable>

  <Pressable style={styles.clearBetButton} onPress={handleRemoveLastChip}>
    <Text style={styles.clearBetText}>Slett bet</Text>
  </Pressable>

  <Pressable style={styles.skipButton}>
    <Text style={styles.skipText}>Skip</Text>
  </Pressable>
</View>

    </View>
  </ImageBackground>
);
}

const styles = StyleSheet.create({
    actionRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 1, // Avstand mellom knappene
  marginBottom: 20,
},
slurkCount: {
  fontSize: 18,
  color: 'white',
  marginBottom: 10,
  fontWeight: 'bold',
},

  background: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'serif',
  },
  selectedText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  boardContainer: {
    width: width * 0.9,
    height: width * 1.4,
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  boardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  betButton: {
  position: 'absolute',
  width: 42,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'transparent', // ingen visuell bakgrunn
  justifyContent: 'center',
  alignItems: 'center',
},

  buttonText: {
  fontSize: 10,
  color: 'white', // eller 'black' hvis bakgrunnen gjør det mulig
  fontWeight: 'bold',
  opacity: 0, // 👈 gjør kun teksten usynlig, men knappen virker
},

  placeBetButton: {
    backgroundColor: '#f9c80e',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 100,
  },
  placeBetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 100,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  wideButton: {
  width: 34,
  height: 130,
  borderRadius: 8,
},

smallButton: {
  width: 34,
  height: 53,
  borderRadius: 8,
},

chip: {
  width: 24,
  height: 24,
  resizeMode: 'contain',
  position: 'absolute',
  top: 4,
  left: 4,
  zIndex: 2,
},
clearBetButton: {
  backgroundColor: '#457b9d',
  paddingHorizontal: 25,
  paddingVertical: 12,
  borderRadius: 100,
  marginHorizontal: 8,
},
clearBetText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: 'white',
},

});
