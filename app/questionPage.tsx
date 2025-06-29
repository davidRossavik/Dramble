import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';


export default function questionPage() {

    const [value, setValue] = useState(0);

    return (
        <BackgroundWrapper>
            <View style={styles.text}>
                <Text style={styles.challengetext}> Hvem kan chugge raskest av Mads og Trym?</Text>
            </View>
            <View style={styles.box}>
                <Button textStyle={styles.textStyle} style={styles.button1} label="Mads" />
                <Button textStyle={styles.textStyle} style={styles.button2} label="Trym" />
            </View>

            <View style={{width: '100%', height: 70}}>
                <Slider style={styles.slider} 
                minimumValue={0} maximumValue={20} step={1} value={value}
                onValueChange={(val) => setValue(val)}
                minimumTrackTintColor="#81AF24"
                maximumTrackTintColor="#00471E"
                thumbTintColor='#FF4500'
                />
                <Text style={styles.label}>{value.toFixed(0)}</Text> 
            </View>
            
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button style={styles.button3} label={"Lås inn"} textStyle={styles.textStyle}/>
            </View>
            

        </BackgroundWrapper>
    )
}

const styles = StyleSheet.create({
    text: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    challengetext: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FAF0DE',
        textAlign: 'center',
    },
    button1: {
        width: 170,
        height: 100,
        backgroundColor: '#EEB90E',
        borderRadius: 5,
    },
    button2: {
        width: 170,
        height: 100,
        backgroundColor: '#D41E1D',
        borderRadius: 5,
    },
    button3: {
        width: 280,
        height: 80,
        backgroundColor: '#EEB90E',
        borderRadius: 5,
    },
    box: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        marginBottom: 50,
    },
    textStyle: {
        color: '#FAF0DE',
        fontSize: 20,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slider: {
        width: '80%',
        height: 40,
        alignSelf: 'center',
    },
    label: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#FAF0DE',
        textAlign: 'center',
        marginBottom: 20,
    },
});