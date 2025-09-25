import React from 'react';
import {StyleSheet, Image, StatusBar, Platform, View} from 'react-native';
import {Box, HStack, Heading, Pressable, Text} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {color} from '../service/utils';

const AppBar = ({title}) => {
  const navigation = useNavigation();
  const statusBarHeight =
    Platform.OS != 'android' ? StatusBar.currentHeight : 0;
  
  const showBackButton = title !== 'Dashboard';
  
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };
  
  return (
    <Box w={'100%'} bg={color.primary} pt={statusBarHeight}>
      <HStack justifyContent="space-between" alignItems="center" p={2}>
        <HStack alignItems="center" space={2}>
          {showBackButton && (
            <Pressable
              onPress={handleBackPress}
              _pressed={{ bg: 'rgba(255,255,255,0.1)' }}
              borderRadius="full"
              p={2}
            >
              <Text color="white" fontSize="xl" fontWeight="bold">
                ←
              </Text>
            </Pressable>
          )}
          <Heading color="white" size="lg">
            {title}
          </Heading>
        </HStack>
        <Image source={require('../assets/BrittoW.png')} style={styles.logo} />
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  logo: {width: 90, height: 30},
});

export default AppBar;
