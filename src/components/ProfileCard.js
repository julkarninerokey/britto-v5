import React, {useEffect, useState} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {Box, HStack, Text, VStack, Image} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileCard = () => {
  const [studentName, setStudentName] = useState('মুক্তা দত্ত');
  const [session, setSession] = useState('২০১৫-১৬');
  const [hallName, setHallName] = useState('রোকেয়া হল');
  const [photo, setPhoto] = useState(
    'https://v2.result.du.ac.bd/assets/student.png',
  );

  const checkLoginStatus = async () => {
    const name = await AsyncStorage.getItem('name');
    const session = await AsyncStorage.getItem('session');
    const hall = await AsyncStorage.getItem('hall');
    const photo = await AsyncStorage.getItem('photo');

    setStudentName(name ? name : 'Julkarnine Rokey');
    setSession(session ? session : '2017-18');
    setHallName(hall ? hall : 'রোকেয়া হল');
    setPhoto(photo || 'https://v2.result.du.ac.bd/assets/student.png');
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <Box position="relative" w="100%" h={150}>
      <ImageBackground
        source={require('../assets/App-Card-Bg.png')}
        style={styles.imageBackground}>
        <HStack
          style={styles.fullBox}
          flex={1}
          alignItems="center"
          justifyContent="space-evenly">
          <VStack space={2}>
            <Image
              source={{uri: photo}}
              style={styles.photo}
              alt="Profile Photo"
              size="md"
              borderRadius={100}
            />
          </VStack>
          <VStack space={2}>
            <Text numberOfLines={1} style={styles.textStyle}>
              {studentName}
            </Text>
            <Text numberOfLines={1} style={styles.textStyle}>
              Session: {session}
            </Text>
            <Text numberOfLines={1} style={styles.textStyle}>
              {hallName}
            </Text>
          </VStack>
        </HStack>
      </ImageBackground>
    </Box>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  photo: {
    top: 0,
  },
  textStyle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    maxWidth: 250,
  },
  fullBox: {
    backgroundColor: 'rgba(1.9, 1.9, 1.9, 0.7)',
    flex: 1,
    width: '90%',
    alignSelf: 'center',
  },
});

export default ProfileCard;
