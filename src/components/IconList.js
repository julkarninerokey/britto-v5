import React from 'react';
import {HStack, VStack, Heading, Text, Image} from 'native-base';
import {Linking, TouchableOpacity} from 'react-native';
import {color} from '../service/utils';

const IconList = ({icon, heading, subHeading, rootLink}) => {
  const handleRootPress = rootLink => {
    Linking.openURL(rootLink);
  };

  return (
    <HStack
      alignItems="center"
      bg={color.background}
      w={'100%'}
      p={4}
      borderRadius={5}
      borderBottomWidth={1}
      mb={1}
      borderBottomColor="gray.200"
      space={3}>
      <Image
        source={{uri: icon}}
        size="xs"
        color="primary.500"
        alt="Icon"
        borderRadius={100}
      />
      <VStack>
        <TouchableOpacity onPress={() => handleRootPress(rootLink)}>
          <Heading size="sm" color={color.primary}>
            {heading}
          </Heading>
        </TouchableOpacity>
        <Text color={color.secondary}>{subHeading}</Text>
      </VStack>
    </HStack>
  );
};

export default IconList;
