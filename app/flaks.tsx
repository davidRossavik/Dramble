import Slider from '@react-native-community/slider';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Card = {
  id: number;
  type: 'champis' | 'whiskey';
  flipped: boolean;
};

const backgroundImage = require('../assets/images/background.png');
const cardBackImage = require('../assets/images/card.png');
const champisImage = require('../assets/images/champis.png');
const whiskeyImage = require('../assets/images/whiskey.png');
const heartImage = require('../assets/images/heart.png');

const NUM_CARDS = 12;




export default function Flaks() {
  const screenWidth = Dimensions.get('window').width;
  const [cards, setCards] = useState<Card[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [lockedIn, setLockedIn] = useState(false);
  const [lives, setLives] = useState(3);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const allCardsRef = useRef<Card[]>([]);
const [gameOver, setGameOver] = useState(false);

  const generateCards = () => {
    const types = [...Array(8).fill('champis'), ...Array(4).fill('whiskey')];
    const shuffled = types.sort(() => Math.random() - 0.5);
    const newCards = shuffled.map((type, index) => ({
      id: index,
      type,
      flipped: false,
    }));

    allCardsRef.current = newCards;
    setCards(newCards);
    setSelectedCards([]);
  };

  const resetGame = () => {
    setLockedIn(false);
    setSliderValue(0);
    setLives(3);
    setGameOver(false);
    generateCards();
  };

  useEffect(() => {
    generateCards();
  }, []);

  const handleFlip = (id: number) => {
    if (!lockedIn || gameOver) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || selectedCards.includes(id)) return;

    const updatedCards = cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c
    );
    setCards(updatedCards);

    if (card.type === 'whiskey') {
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        Alert.alert('Du tapte!', `Du mister ${sliderValue} slurker.`, [
          { text: 'Prøv igjen', onPress: resetGame },
        ]);
        return;
      }

      setTimeout(() => {
        Alert.alert('Uff!', 'Whiskey! Du mister et liv.');
        generateCards();
      }, 500);

      return;
    }

    const updatedSelected = [...selectedCards, id];
    setSelectedCards(updatedSelected);

    if (updatedSelected.length === 3) {
         const flippedCards = updatedCards.filter((card) =>
    updatedSelected.includes(card.id)
  );

  const allChampis = flippedCards.every((card) => card.type === 'champis');

  if (allChampis) {
    setGameOver(true);
    Alert.alert('Gratulerer!', `Du vant ${sliderValue * 2} slurker!`, [
      { text: 'Spill igjen', onPress: resetGame },
    ]);
  }
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.heartsContainer}>
        {Array.from({ length: lives }).map((_, i) => (
          <Image key={i} source={heartImage} style={styles.heart} />
        ))}
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Velg 3 kort</Text>

        <FlatList
          data={cards}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cardGrid}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleFlip(item.id)}>
              <Image
                source={
                  item.flipped
                    ? item.type === 'champis'
                      ? champisImage
                      : whiskeyImage
                    : cardBackImage
                }
                style={[styles.card, { width: screenWidth / 4 }]}
                resizeMode="contain"
              />
            </Pressable>
          )}
        />

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={20}
            step={1}
            value={sliderValue}
            onValueChange={setSliderValue}
            disabled={lockedIn}
            minimumTrackTintColor="#81AF24"
            maximumTrackTintColor="#00471E"
            thumbTintColor="#FF4500"
          />
          <Text style={styles.sliderValue}>{sliderValue}</Text>
        </View>

        {/* ✅ Knapper her inne i container, men etter slider */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.yellowButton}
            onPress={() => setLockedIn(true)}
            disabled={lockedIn || sliderValue === 0}
          >
            <Text style={styles.buttonText}>Lås inn</Text>
          </Pressable>

          <Pressable
            style={[
    styles.yellowButton,
    styles.skipButton,
    lockedIn && styles.disabledButton
  ]}
  onPress={resetGame}
  disabled={lockedIn}
          >
            <Text style={styles.buttonText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  heartsContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  heart: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardGrid: {
    alignItems: 'center',
  },
  card: {
    height: 100,
    margin: 10,
  },
  sliderContainer: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 20,
  },
  slider: {
    width: '100%',
  },
  sliderValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  yellowButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 100,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#EEB90E', // Grå farge for skip
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  disabledButton: {
  backgroundColor: '#999', // grå
  opacity: 0.6,             // gjør det mer tydelig at den er deaktivert
},
});
