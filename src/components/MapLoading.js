// components/MapLoading.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { VStack, HStack, Text, Spinner } from 'native-base';

const BRAND = '#191970';

export default function MapLoading() {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('.');

  // Pulse (radar) animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  // Spin (compass) animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [rotate]);

  // Animated ellipsis
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length === 3 ? '.' : d + '.')), 450);
    return () => clearInterval(t);
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const fade  = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });
  const spin  = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <VStack
      alignItems="center"
      justifyContent="center"
      space={4}
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.96)'
      }}
    >
      {/* Radar stack */}
      <View style={styles.radarWrap} accessible accessibilityLabel="Locating map">
        {/* Outer fading ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale }],
              opacity: fade,
              borderColor: BRAND,
            },
          ]}
        />
        {/* Mid ring */}
        <View style={[styles.ring, { transform: [{ scale: 1.25 }], opacity: 0.12, borderColor: BRAND }]} />
        {/* Inner ring */}
        <View style={[styles.ring, { opacity: 0.18, borderColor: BRAND }]} />
        {/* Center dot */}
        <View style={[styles.centerDot, { backgroundColor: BRAND }]} />
        {/* Spinning compass (emoji = no dependency) */}
        <Animated.Text style={[styles.compass, { transform: [{ rotate: spin }] }]}>🧭</Animated.Text>
      </View>

      {/* Copy / status */}
      <VStack alignItems="center" space={1}>
        <Text fontSize="md" fontWeight="700" color="coolGray.800">
          Finding campus details{dots}
        </Text>
        <Text fontSize="xs" color="coolGray.500">
          Locking position • Loading tiles • Applying labels
        </Text>
      </VStack>

      {/* Subtle progress feel */}
      <HStack space={2} alignItems="center">
        <Spinner color={BRAND} size="sm" />
        <Text fontSize="xs" color="coolGray.500">This may take a moment</Text>
      </HStack>
    </VStack>
  );
}

const SIZE = 140;

const styles = StyleSheet.create({
  radarWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
  },
  compass: {
    position: 'absolute',
    fontSize: 28,
  },
});
