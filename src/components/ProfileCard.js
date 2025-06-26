import React, {useEffect, useState} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {Box, HStack, Text, VStack, Image} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileCard = ({name, year, hall, chobi}) => {
  const [studentName, setStudentName] = useState(name);
  const [session, setSession] = useState(year);
  const [hallName, setHallName] = useState(hall);
  const [photo, setPhoto] = useState(chobi);

  const checkLoginStatus = async () => {
    const name = await AsyncStorage.getItem('name');
    const session = await AsyncStorage.getItem('session');
    const hall = await AsyncStorage.getItem('hall');
    const photo = await AsyncStorage.getItem('photo');

    setStudentName(name ? name : 'Julkarnine Rokey');
    setSession(session ? session : '2017-18');
    setHallName(hall ? hall : 'রোকেয়া হল');
    setPhoto(photo || '../assets/icons/user.png');
  };

  useEffect(() => {
    if (!name && !year) {
      checkLoginStatus();
    } else {
      setStudentName(name);
      setSession(null);
      setHallName(null);
      setPhoto(null);
    }
  }, [name, year]);

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
          {photo && (
            <VStack space={2}>
              <Image
                source={{uri: photo}}
                style={styles.photo}
                alt="Profile Photo"
                size="md"
                onError={error => {console.log('Profile Photo Error:', error)}}
                borderRadius={100}
                onLoad={() => console.log('Profile Photo Loaded from URL- ', photo)}
              />
            </VStack>
          )}
          <VStack space={2}>
            {studentName && (
              <Text numberOfLines={1} style={styles.textStyle}>
                {studentName}
              </Text>
            )}
            {session && (
              <Text numberOfLines={1} style={styles.textStyle}>
                Session: {session}
              </Text>
            )}
            {year && (
              <Text numberOfLines={1} style={styles.textStyle}>
                Established: {year}
              </Text>
            )}
            {hallName && (
              <Text numberOfLines={1} style={styles.textStyle}>
                {hallName}
              </Text>
            )}
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
