import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { submitBet } from '@/utils/bets';
import { Challenge, Team } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const drinkCount = require('@/assets/images/drinkCount.png');

type Props = {
  challenge: Challenge;
  gameId: string;
  challengeIndex: number;
  teams: Team[];
};

export default function OneVsOne({ challenge, gameId, challengeIndex, teams }: Props) {
  const [value, setValue] = useState(0);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  const person1 = teams?.[0]?.teamName ?? 'lag1';
  const person2 = teams?.[1]?.teamName ?? 'lag2';
  const maxDrinkCount = 20;
  const drinkCountLabel = maxDrinkCount - value;
    
  const challengeTitle = `${challenge.title}: ${person1} vs ${person2}`;
  const challengeDescription = challenge.description;


  const handleConfirmedBet = async () => {
    if (!selectedButton || !teamId) return;
    await submitBet(gameId, teamId, challengeIndex, value, selectedButton);
    alert('Du har låst inn ditt bet!');
  };

  // Hent teamId fra AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('teamName').then((id) => {
      if (id) setTeamId(id);
    });
  });

  return (
    <BackgroundWrapper>
      <View style={styles.drinkCountContainer}>
        <Text style={[styles.baseText, styles.drinkCountText]}>{drinkCountLabel}</Text>
        <Image source={drinkCount} style={styles.drinkCountPic} />
      </View>

      <View style={styles.challengeContainer}>
        <Text style={[styles.baseText, styles.challengeText]}>{challengeTitle}</Text>
        <Text style={[styles.baseText, styles.buttonText]}>{challengeDescription}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          textStyle={[styles.baseText, styles.buttonText]}
          style={[styles.buttonBase, styles.button1]}
          label={person1}
          onPress={() => setSelectedButton(person1)}
          stayPressed={selectedButton === person1}
        />
        <Button
          textStyle={[styles.baseText, styles.buttonText]}
          style={[styles.buttonBase, styles.button2]}
          label={person2}
          onPress={() => setSelectedButton(person2)}
          stayPressed={selectedButton === person2}
        />
      </View>

      <View style={{ width: '100%', height: 70 }}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={maxDrinkCount}
          step={1}
          value={value}
          onValueChange={(val) => setValue(val)}
          minimumTrackTintColor="#81AF24"
          maximumTrackTintColor="#00471E"
          thumbTintColor="#FF4500"
        />
        <Text style={[styles.baseText, styles.sliderText]}>{value.toFixed(0)}</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button
          style={[styles.buttonBase, styles.exitButton]}
          label={"Lås inn"}
          textStyle={[styles.baseText, styles.buttonText]}
          disabled={selectedButton === null}
          onPress={handleConfirmedBet}
        />
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
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
  drinkCountContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drinkCountPic: {
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
  slider: {
    width: '80%',
    height: 40,
    alignSelf: 'center',
  },
});
