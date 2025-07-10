import { Image, ImageSourcePropType, ImageStyle, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

type Props = {
    imageSource?: ImageSourcePropType;
    imageStyle?: ImageStyle | ImageStyle[];
    onPress?: () => void;
    label?: string;
    textStyle?: TextStyle | TextStyle[];
    style?: ViewStyle | ViewStyle[];
    stayPressed?: boolean;
    disabled?: boolean;
};

export default function Button({imageSource, onPress, imageStyle, label, textStyle, style, stayPressed, disabled}: Props) {
    return (
        <Pressable
        onPress={onPress}
        style={({pressed}) => [styles.button, style, (pressed || stayPressed) && styles.buttonPressed, stayPressed && styles.buttonActiveBorder, disabled && styles.buttonDisabled]}>
            {imageSource && <Image source={imageSource} style={imageStyle} />}
            {label && <Text style={[styles.label, textStyle]}>{label}</Text>}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 0,
        overflow: 'visible',
        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    buttonPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.9,
    },
    label: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonActiveBorder: {
        borderWidth: 3,
        borderColor: 'yellow',
        borderRadius: 10,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});