import React, {useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, Dimensions} from 'react-native';
import {
  Box, 
  Text, 
  VStack, 
  HStack, 
  Image, 
  Badge, 
  Divider,
  Spinner
} from 'native-base';
import { getUser } from '../service/auth';
import { getImageUrl } from '../service/fileService';

const ProfileCard = ({name, year, hall, chobi}) => {
  const [studentName, setStudentName] = useState(name);
  const [session, setSession] = useState(year);
  const [hallName, setHallName] = useState(hall);
  const [photo, setPhoto] = useState(chobi);
  const [regNo, setRegNo] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const userData = await getUser();
      
      if (userData) {
        setStudentName(userData.name || 'Student Name');
        setSession(userData.session || '');
        setHallName(userData.hall || '');
        setRegNo(userData.regNo || '');
        setDepartment(userData.department || '');
        
        // Handle profile photo
        if (userData.photo) {
          const imageUrl = getImageUrl(userData.photo);
          setPhoto(imageUrl);
        }
      } else {
        // Fallback data if no user data found
        setStudentName(name || 'Guest User');
        setSession(year || '');
        setHallName(hall || '');
        setPhoto(chobi || null);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      // Use props as fallback
      setStudentName(name || 'Student Name');
      setSession(year || '');
      setHallName(hall || '');
      setPhoto(chobi || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!name && !year) {
      loadStudentData();
    } else {
      setStudentName(name);
      setSession(year);
      setHallName(hall);
      setPhoto(chobi);
      setLoading(false);
    }
  }, [name, year, hall, chobi]);

  return (
    <Box 
      position="relative" 
      w="100%" 
      h={180} 
      mx={0} 
      my={0} 
      px={0} 
      py={0}
      alignItems="center"
      justifyContent="center"
      display="flex"
    >
      <Box
        w="100%"
        h="100%"
        bg={{
          linearGradient: {
            colors: ['#667eea', '#764ba2'],
            start: [0, 0],
            end: [1, 1],
          },
        }}
        alignItems="center"
        justifyContent="center"
      >
        <ImageBackground
          source={require('../assets/App-Card-Bg.png')}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 0 }}
        >
          <Box 
            style={styles.overlay}
            alignItems="center"
            justifyContent="center"
            flex={1}
          >
            {loading ? (
              <VStack space={3} alignItems="center" justifyContent="center" flex={1}>
                <Spinner size="lg" color="white" />
                <Text color="white" fontSize="md" fontWeight="600">
                  Loading profile...
                </Text>
              </VStack>
            ) : (
              <HStack 
                space={4} 
                alignItems="center" 
                justifyContent="center"
                w="100%"
                px={6}
              >
              {/* Profile Photo Section */}
              <VStack alignItems="center" space={2}>
                <Box
                  borderRadius={60}
                  borderWidth={0}
                  borderColor="white"
                  bg="white"
                  p={1}
                  shadow={6}
                >
                  {photo ? (
                    <Image
                      source={{uri: photo}}
                      style={styles.photo}
                      alt="Profile Photo"
                      borderRadius={55}
                      onError={error => {
                        console.log('Profile Photo Error:', error);
                        setPhoto(null);
                      }}
                    />
                  ) : (
                    <Box
                      w={110}
                      h={110}
                      borderRadius={55}
                      bg="gray.200"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="3xl" color="gray.500" fontWeight="bold">
                        {studentName ? studentName.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </Box>
                  )}
                </Box>
              </VStack>

              {/* Vertical Divider */}
              <Box 
                w={1} 
                h="70%" 
                bg="rgba(255,255,255,0.4)" 
                borderRadius={1}
                mx={1}
              />

              {/* Student Info Section */}
              <VStack 
                alignItems="flex-start"
                justifyContent="flex-start"
              >
                {studentName && (
                  <Text 
                    numberOfLines={2} 
                    style={styles.nameText}
                  >
                    {studentName}
                  </Text>
                )}

                <VStack space={1} alignItems="flex-start" mt={2}>
                  {year && (
                    <HStack alignItems="center" space={2} justifyContent="center">
                      <Box w={3} h={3} bg="emerald.300" borderRadius={2} />
                      <Text numberOfLines={1} style={styles.infoText}>
                        Est: {year}
                      </Text>
                    </HStack>
                  )}
                  
                  {department && (
                    <HStack alignItems="center" space={2} justifyContent="center">
                      <Text numberOfLines={1} style={styles.infoText}>
                        {department}
                      </Text>
                    </HStack>
                  )}
                  
                  {hallName && (
                    <HStack alignItems="center" space={2} justifyContent="center">
                      <Text numberOfLines={1} style={styles.infoText}>
                        {hallName}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </HStack>
            )}
          </Box>
        </ImageBackground>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
  },
  photo: {
    width: 90,
    height: 90,
  },
  nameText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  infoText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
    opacity: 0.95,
  },
});

export default ProfileCard;
