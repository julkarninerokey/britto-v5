import React from 'react';
import {StyleSheet, Image} from 'react-native';
import {Box, HStack, Heading} from 'native-base';
import {color} from '../service/utils';

const AppBar = ({ title }) => {
  return (
    <Box w={'100%'} bg={color.primary}>
      <HStack justifyContent="space-between" alignItems="center" p={3}>
        <Heading color="white" size="lg">
          {title}
        </Heading>
        <Image source={require('../assets/BrittoW.png')} style={styles.logo} />
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  logo: {width: 90, height: 30},
});

export default AppBar;
