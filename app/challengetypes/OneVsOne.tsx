import { Challenge } from '@/utils/types';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';

type Props = {
  challenge: Challenge;
  gameId: string;
  isHost?: boolean;
  onNextPhaseRequest?: () => void;
};

// Bilder //
const drinkCount = require('@/assets/images/drinkCount.png');
// Bilder //


export default function OneVsOne({ challenge, gameId }: Props) {
  const { title, description, category, type, odds } = challenge;

  const [value, setValue] = useState(0); // Slider
  const [selectedButton, setSelectedButton] = useState<string | null>(null); // MarkedSelectedButton

  // INPASSABLE VALUES (SKAL ENDRES) //
  const maxDrinkCount = 20;
  const drinkCountLabel = maxDrinkCount - value;
  // INPASSABLE VALUES (SKAL ENDRES //

  // Hente spillere //
  const [player1, player2] = challenge.participants ?? ['?', '?'];

  // Tar seg av confirmed-bets //
  const handleConfirmedBet = () => {console.log('Bet bekreftet')};

  return (
    <BackgroundWrapper>

      {/* DrinkCount */}
      <View style={styles.drinkCountContainer}>
        <Text style={[styles.baseText, styles.drinkCountText]}>{drinkCountLabel}</Text>
        <Image source={drinkCount} style={styles.drinkCountPic} />
      </View>

      {/* Challenge */}
      <View style={styles.challengeContainer}>
        <Text style={[styles.baseText, styles.challengeText]}>{title}</Text>
        <Text style={[styles.baseText, styles.buttonText]}>{player1} VS {player2}</Text>
        <Text style={[styles.baseText, styles.buttonText]}>{description}</Text>
      </View>

      {/* Buttons / Choose Person */}
      <View style={styles.buttonContainer}>
          <Button textStyle={[styles.baseText, styles.buttonText]} style={[styles.buttonBase, styles.button1]} label={player1}
                  onPress= {() => setSelectedButton(player1)} stayPressed={selectedButton === player1} />
          <Button textStyle={[styles.baseText, styles.buttonText]} style={[styles.buttonBase, styles.button2]} label={player2}
                  onPress={() => setSelectedButton(player2)} stayPressed={selectedButton === player2} />
      </View>

      {/* Slider */}
      <View style={{width: '100%', height: 70}}>
          <Slider style={styles.slider} 
          minimumValue={0} maximumValue={maxDrinkCount} step={1} value={value}
          onValueChange={(val) => setValue(val)}
          minimumTrackTintColor="#81AF24"
          maximumTrackTintColor="#00471E"
          thumbTintColor='#FF4500'
          />
          <Text style={[styles.baseText, styles.sliderText]}>{value.toFixed(0)}</Text> 
      </View>

      {/* Continue-Button */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button style={[styles.buttonBase, styles.exitButton]} label={"Lås inn"} textStyle={[styles.baseText, styles.buttonText]}
                  disabled={selectedButton === null} onPress={handleConfirmedBet} />
      </View>

      {/* Kategori og typer på challenge */}
      {/* <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Kategori: {category}</Text>
        <Text style={styles.detailText}>{player1} VS {player2}</Text>
        <Text style={styles.detailText}>Type: {type}</Text>
        <Text style={styles.detailText}>Odds: {odds}</Text>
      </View> */}
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

  // TEXT //
    baseText: {
        fontWeight: 'bold',
        color: '#FAF0DE',
        textAlign: 'center',
    },
    drinkCountText: {
        fontSize: 25,
    },
    challengeText: {
        fontSize: 30,
    },
    buttonText: {
        fontSize: 20,
    },
    sliderText: {
        fontSize: 25,
        marginBottom: 20,
    },

    // BUTTONS //
    buttonBase: {
        width: 170,
        height: 100,
        borderRadius: 5,
    },
    button1: {
        backgroundColor: '#EEB90E',
    },
    button2: {
        backgroundColor: '#D41E1D',
    },
    exitButton: {
        width: 280,
        height: 80,
        backgroundColor: '#EEB90E',
    },


    // VIEWSTYLES // 
    drinkCountContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    drinkCountPic: { // drink-Image
        width: 80,
        height: 80,
    },
    challengeContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
        gap: 40,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        marginBottom: 50,
    },
    slider: { // Slider
        width: '80%',
        height: 40,
        alignSelf: 'center',
    },
});