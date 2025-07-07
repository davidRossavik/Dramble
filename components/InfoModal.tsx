import React, { useRef } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    visible: boolean,
    onClose: () => void;
};

export default function InfoModal({ visible, onClose }: Props) {
    const infoText = `Velkommen til kveldens drikkelek! 🍻\n
        Dette er et spill for lag - fullt av utfordringer, betting og slurker.
        Hver runde får ett eller flere lag en utfordring, enten alene eller mot hverandre. 
        Resten av spillerne må Bette (satse slurker) på hvilket lag de tror vinner.
        \n
        Gjetter du riktig? Slurker i banken.\n
        Tar du feil? Bare å drikke i vei.\n
        \n
        Trykk "Start spill" for å komme i gang, eller "Bli med i spill" for å koble deg til et eksisterende spill.`
    
    const confettiRef = useRef<any>(null);
    const { width, height } = Dimensions.get('window');

    return (
        <Modal
         visible={visible}
         transparent
         animationType="slide"
         onRequestClose={onClose}
         onShow={() => confettiRef.current?.start()}
        >
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.text}>{infoText}</Text>

                    <Pressable onPress={onClose} style={styles.button}>
                        <Text style={styles.buttonText}>Lukk</Text>
                    </Pressable>
                </View> 
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        backgroundColor: '#073510',
        // backgroundColor: '#2E8B57',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 5,

        borderWidth: 5,
        borderColor: '#FFD700',
    },
    text: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#fff',
    },
    button: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20, 
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
})