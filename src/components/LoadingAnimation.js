import React from 'react';
import {HStack, VStack, Skeleton} from 'native-base';
import {color} from '../service/utils'; // Make sure to import utils from the correct path

const IconListLoading = () => {
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
      <Skeleton
        borderRadius={100}
        size="10"
        startColor="gray.300"
        endColor="gray.500"
      />
      <VStack flex={1} space={2}>
        <Skeleton.Text lines={1} startColor="gray.300" endColor="gray.500" />
        <Skeleton.Text
          lines={1}
          startColor="gray.300"
          endColor="gray.500"
          width="60%"
        />
      </VStack>
    </HStack>
  );
};

const AnotherLoadingAnimation = () => {
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
      <Skeleton
        borderRadius={100}
        size="10"
        startColor="gray.300"
        endColor="gray.500"
      />
      <VStack flex={1} space={2}>
        <Skeleton.Text lines={1} startColor="gray.300" endColor="gray.500" />
        <Skeleton.Text
          lines={1}
          startColor="gray.300"
          endColor="gray.500"
          width="60%"
        />
      </VStack>
    </HStack>
  );
};

export {IconListLoading, AnotherLoadingAnimation};
