import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';

const drinkCount = require('@/assets/images/drinkCount.png');

export default function questionPage() {

    const [value, setValue] = useState(0); // Slider
    const [selectedButton, setSelectedButton] = useState<string | null>(null); // MarkedSelectedButton

    const router = useRouter();
    const handleConfirmedBet = () => {
        if (!selectedButton) return;

        router.push({
            pathname: '/chooseWinner',
            params: {
                guess: selectedButton,
                amount: value,
                p1: person1,
                p2: person2,
            }
        });
    }
    // PASSABLE VALUES // 
    const maxDrinkCount = 20;
    const drinkCountLabel = maxDrinkCount - value;
    const person1 = "Mads";
    const person2 = "Trym";
    const challengeTextLabel = "Hvem kan chugge raskest av " + person1 + " og " + person2 + " ?";


    return (
        <BackgroundWrapper>
            
            {/* DrinkCount */}
            <View style={styles.drinkCountContainer}>
                <Text style={[styles.baseText, styles.drinkCountText]}>{drinkCountLabel}</Text>
                <Image source={drinkCount} style={styles.drinkCountPic} />
            </View>

            {/* Challenge */}
            <View style={styles.challengeContainer}>
                <Text style={[styles.baseText, styles.challengeText]}>{challengeTextLabel}</Text>
            </View>

            {/* Buttons / Choose Person */}
            <View style={styles.buttonContainer}>
                <Button textStyle={[styles.baseText, styles.buttonText]} style={[styles.buttonBase, styles.button1]} label={person1}
                        onPress= {() => setSelectedButton(person1)} stayPressed={selectedButton === person1} />
                <Button textStyle={[styles.baseText, styles.buttonText]} style={[styles.buttonBase, styles.button2]} label={person2}
                        onPress={() => setSelectedButton(person2)} stayPressed={selectedButton === person2} />
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
            

        </BackgroundWrapper>
    )
}

const styles = StyleSheet.create({
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