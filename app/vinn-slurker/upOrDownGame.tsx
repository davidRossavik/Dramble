import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const backgroundImage = require('../../assets/images/background.png');
const cardBack = require('../../assets/images/card.png');
const upImage = require('../../assets/images/up.png');
const downImage = require('../../assets/images/down.png');

const screenWidth = Dimensions.get('window').width;

const cardImages: { [key: number]: any } = {
  1: require('../../assets/images/cards/Playing_card_heart_1.png'),
  2: require('../../assets/images/cards/Playing_card_heart_2.png'),
  3: require('../../assets/images/cards/Playing_card_heart_3.png'),
  4: require('../../assets/images/cards/Playing_card_heart_4.png'),
  5: require('../../assets/images/cards/Playing_card_heart_5.png'),
  6: require('../../assets/images/cards/Playing_card_heart_6.png'),
  7: require('../../assets/images/cards/Playing_card_heart_7.png'),
  8: require('../../assets/images/cards/Playing_card_heart_8.png'),
  9: require('../../assets/images/cards/Playing_card_heart_9.png'),
  10: require('../../assets/images/cards/Playing_card_heart_10.png'),
  11: require('../../assets/images/cards/Playing_card_heart_11.png'),
  12: require('../../assets/images/cards/Playing_card_heart_12.png'),
  13: require('../../assets/images/cards/Playing_card_heart_13.png'),
};

export default function UpOrDownGame() {
  const [leftCards, setLeftCards] = useState<number[]>([]);
  const [rightCards, setRightCards] = useState<number[]>([]);
  const [revealedLeft, setRevealedLeft] = useState<boolean[]>([true, true, true, true]);

  const [revealedRight, setRevealedRight] = useState<boolean[]>([false, false, false, false]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

 useEffect(() => {
  const all = Array.from({ length: 13 }, (_, i) => i + 1);
  
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  setLeftCards(all.slice(0, 4));
  setRightCards(all.slice(4, 8));
}, []);


  const handleGuess = (direction: 'up' | 'down', index: number) => {
    if (index !== activeIndex) return;

    const left = leftCards[index];
    const right = rightCards[index];

    const correct =
      (direction === 'up' && right >= left) ||
      (direction === 'down' && right < left);

    const newRevealedLeft = [...revealedLeft];
    const newRevealedRight = [...revealedRight];

    newRevealedLeft[index] = true;
    newRevealedRight[index] = true;

    setRevealedLeft(newRevealedLeft);
    setRevealedRight(newRevealedRight);

    if (correct) {
      if (index === 3) {
        Alert.alert('Gratulerer!', 'Du klarte alle kortene 🎉');
      } else {
        setActiveIndex(index + 1);
      }
    } else {
      Alert.alert('Feil!', 'Du tapte 😢');
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Up or Down</Text>

        <View style={styles.cardColumn}>
          {leftCards.map((leftVal, index) => (
            <View key={index} style={styles.cardRow}>
              <Image
                source={revealedLeft[index] ? cardImages[leftVal] : cardBack}
                style={styles.card}
              />

              <View style={styles.pileContainer}>
                <Pressable onPress={() => handleGuess('up', index)}>
                  <Image source={upImage} style={styles.pil} />
                </Pressable>
                <Pressable onPress={() => handleGuess('down', index)}>
                  <Image source={downImage} style={styles.pil} />
                </Pressable>
              </View>

              <Image
                source={
                  revealedRight[index]
                    ? cardImages[rightCards[index]]
                    : cardBack
                }
                style={styles.card}
              />
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    fontFamily: 'serif',
  },
  cardColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  card: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.35,
    resizeMode: 'contain',
    marginHorizontal: 5,
  },
  pileContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pil: {
    width: 35,
    height: 35,
    marginHorizontal: 6,
    resizeMode: 'contain',
  },
});
