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
  allTeams: Team[];
};

export default function TeamVsTeamBettingScreen({
  challenge,
  gameId,
  challengeIndex,
  teams,
  allTeams,
}: Props) {
  const [value, setValue] = useState(0);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  const maxDrinkCount = 20;
  const drinkCountLabel = maxDrinkCount - value;

  // Unngå crash hvis teams mangler
  if (!teams || teams.length < 2) {
    return (
      <BackgroundWrapper>
        <Text style={{ color: 'white', fontSize: 20 }}>Venter på lagdata...</Text>
      </BackgroundWrapper>
    );
  }

  const team1 = teams[0].teamName;
  const team2 = teams[1].teamName;
  const challengeTitle = `${challenge.title}: ${team1} vs ${team2}`;
  const challengeDescription = challenge.description;

  // Hent teamName fra lagret data
  useEffect(() => {
    AsyncStorage.getItem('teamName').then((name) => {
      if (name) setTeamName(name);
    });
  }, []);

  const handleConfirmedBet = async () => {
    if (!selectedButton || !teamName) return;
    await submitBet(gameId, teamName, challengeIndex, value, selectedButton);
    alert('Du har låst inn ditt bet!');
  };

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
          label={team1}
          onPress={() => setSelectedButton(team1)}
          stayPressed={selectedButton === team1}
        />
        <Button
          textStyle={[styles.baseText, styles.buttonText]}
          style={[styles.buttonBase, styles.button2]}
          label={team2}
          onPress={() => setSelectedButton(team2)}
          stayPressed={selectedButton === team2}
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
          label={'Lås inn'}
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
    backgroundColor: '#16A085',
  },
  button2: {
    backgroundColor: '#8E44AD',
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
