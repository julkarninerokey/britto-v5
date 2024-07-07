// OutOfServiceScreen.js

import React, {useEffect, useState} from 'react';
import {View, Image, Text, Center, Box, Heading, Button} from 'native-base';
import {statusCheck} from '../service/api';
import OpenURLButton from '../components/OpenURLButton';
import {color} from '../service/utils';

const OutOfServiceScreen = ({navigation}) => {
  const [status, setStatus] = useState();
  const handleRefresh = async () => {
    const res = await statusCheck();

if (res) {
  console.log("🚀 ~ OutOfServiceScreen ~ res:", res.status);
  console.log("🚀 ~ OutOfServiceScreen ~ res:typeof ", typeof res.status);

  if (res.status !== '1') {
    console.log("Navigating to OutOfService");
    setStatus(res)
  } else {
    console.log("🚀 ~ OutOfServiceScreen ~ res else:", res);
    navigation.navigate('Login');
  }
} else {
  console.error("res object is null or undefined");
}
  };

  useEffect(() => {
    handleRefresh();
  },[])

  return (
    <Center w="100%" flex={1} bg={color.secondaryBackground}>
      <Box
        safeArea
        m={10}
        bgColor={color.background}
        display="flex" // Make the box a flex container
        justifyContent="center" // Center content horizontally
        borderWidth={1}
        borderColor={'coolGray.700'}
        borderRadius={15}
        padding={3}>
        {status?.image ? (
          <Image
            source={{uri: status.image}}
            style={{
              width: 150,
              height: 200,
              marginBottom: 10,
              margin: 'auto',
            }}
            alt="Under Construction"
          />
        ) : (
          <Image
            source={require('../assets/logo.png')}
            style={{
              width: 100,
              height: 150,
              marginBottom: 10,
              margin: 'auto',
            }}
            alt="Under Construction"
          />
        )}

        <Heading
          size="lg"
          fontWeight="600"
          color={color.primary}
          textAlign={'center'}>
          {status?.heading || 'Upgrading Service Quatlity.'}
        </Heading>
        <Heading
          mt="1"
          color={color.secondary}
          fontWeight="medium"
          p={5}
          size="xs"
          textAlign="justify" // Add this line to justify the text
        >
          {status?.subheading ||
            'Our Team is Hard at Work to Make Your Britto App Faster and More Efficient. We will Be Back Soon!'}
        </Heading>
        {status?.link && status.link_text && (
          <OpenURLButton url={status?.link}>{status?.link_text}</OpenURLButton>
        )}
        <Button onPress={handleRefresh} mt={5} variant="solid" size="md">
          Refresh
        </Button>
      </Box>
    </Center>
  );
};

export default OutOfServiceScreen;
