import React from 'react';
import {Box, HStack, VStack, Heading, Text, Avatar, Image} from 'native-base';
import {Linking, TouchableOpacity} from 'react-native';
import {color} from '../service/utils';
import defaultUserPhoto from '../assets/icons/user.png'; // Ensure you have the correct path to your default image

const UserList = ({t}) => {
  const handlePhonePress = mobile => {
    Linking.openURL(`sms:${mobile}`);
  };

  const handleEmailPress = email => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <Box key={t.id} borderBottomColor={'gray.400'} borderBottomWidth={1}>
      <HStack m={1}>
        <Avatar
          m={2}
          alt="Julkarnine Rokey"
          bg={color.background}
          source={
            t.image
              ? {uri: t.image_location + t.image}
              : t.chobi
              ? {uri: t.chobi}
              : defaultUserPhoto
          }>
          {t.emp_name}
        </Avatar>
        <VStack m={2} w={'75%'}>
          <Heading size={'sm'} color={color.primary}>
            {t.emp_name || t.name_en}
          </Heading>
          <Text color={color.secondary}>{t.designation || t.hall_name} </Text>
          <HStack alignSelf={'flex-end'} mt={'-5'}>
            {t.mobile && (
              <TouchableOpacity onPress={() => handlePhonePress(t.mobile)}>
                <Image
                  alt="Julkarnine Rokey"
                  source={require('../assets/icons/sms.png')}
                  style={{width: 20, height: 20}}
                />
              </TouchableOpacity>
            )}

            {t.email && (
              <TouchableOpacity onPress={() => handleEmailPress(t.email)}>
                <Image
                  alt="Julkarnine Rokey"
                  source={require('../assets/icons/email.png')}
                  style={{width: 20, height: 20}}
                />
              </TouchableOpacity>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};

export default UserList;
