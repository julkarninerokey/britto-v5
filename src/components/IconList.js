import React from 'react';
import {HStack, VStack, Heading, Text, Image} from 'native-base';
import {Linking, TouchableOpacity, View} from 'react-native';
import {color} from '../service/utils';

const IconList = ({
  icon,
  heading,
  subHeading,
  rootLink,
  onPress,
  onLongPress,
  isFavorite,
  onToggleFavorite,
}) => {
  const handleRootPress = rootLink => {
    if (!rootLink || typeof rootLink !== 'string') return;
    try { Linking.openURL(rootLink); } catch (_) {}
  };

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      bg={color.background}
      w={'100%'}
      p={4}
      borderRadius={5}
      borderBottomWidth={1}
      mb={1}
      borderBottomColor="gray.200"
      space={3}
    >
      <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} onPress={onPress} onLongPress={onLongPress}>
        <Image
          source={{uri: icon}}
          size="xs"
          color="primary.500"
          alt="Icon"
          borderRadius={100}
        />
        <VStack flex={1} ml={3}>
          {rootLink ? (
            <TouchableOpacity onPress={() => handleRootPress(rootLink)}>
              <Heading size="sm" color={color.primary} numberOfLines={1} ellipsizeMode="tail">
                {heading}
              </Heading>
            </TouchableOpacity>
          ) : (
            <Heading size="sm" color={color.primary} numberOfLines={1} ellipsizeMode="tail">
              {heading}
            </Heading>
          )}
          <Text color={color.secondary} fontSize="xs" numberOfLines={2} ellipsizeMode="tail">
            {subHeading}
          </Text>
        </VStack>
      </TouchableOpacity>
      {onToggleFavorite ? (
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Text style={{fontSize:18, color: isFavorite ? color.accent : color.secondary}}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </HStack>
  );
};

export default IconList;
