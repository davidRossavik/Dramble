import { Image, ImageSourcePropType, ImageStyle, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

type Props = {
    imageSource?: ImageSourcePropType;
    imageStyle?: ImageStyle | ImageStyle[];
    onPress?: () => void;
    label?: string;
    textStyle?: TextStyle;
    style?: ViewStyle | ViewStyle[];
};

export default function Button({imageSource, onPress, imageStyle, label, textStyle, style}: Props) {
    return (
        <Pressable
        onPress={onPress}
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed, style]}>
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
});