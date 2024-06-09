import React, {useState} from 'react';
import {
  Accordion,
  VStack,
  HStack,
  Image,
  Heading,
  Text,
  Badge,
} from 'native-base';
import {color} from '../service/utils';

const AccordionComponent = ({data, iconUrl}) => {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <Accordion
      allowMultiple={false}
      onChange={newActiveSection => setActiveSection(newActiveSection)}
      m={1}
      borderColor={'white'}>
      <Accordion.Item key={1} borderRadius={1} bg={color.background}>
        <Accordion.Summary
          _expanded={{
            bg: color.background,
            borderLeftWidth: 4,
            borderColor: color.primary,
          }}>
          <HStack alignItems="center" w={'100%'} space={3}>
            <Image
              source={{uri: iconUrl}}
              size="xs"
              borderRadius={100}
              alt="Julkarnine Rokey"
            />
            <VStack>
              <Heading
                size="sm"
                color={color.primary}
                maxW={'93%'}
                numberOfLines={1}
                ellipsizeMode="tail">
                {data.title}
              </Heading>
              <Text
                color={color.secondary}
                numberOfLines={1}
                maxW={'95%'}
                ellipsizeMode="tail">
                {data.content}
              </Text>
              <HStack space={1}>
                {data.badges &&
                  data.badges.map((badge, badgeIndex) => (
                    <Badge key={badgeIndex} variant="solid" colorScheme="info">
                      {badge}
                    </Badge>
                  ))}
              </HStack>
            </VStack>
          </HStack>
        </Accordion.Summary>
        <Accordion.Details
          _expanded={{
            bg: color.background,
            p: 3,
            borderLeftWidth: 4,
            borderColor: color.primary,
          }}
          bg={'white'}
          borderLeftColor={color.primary}
          borderLeftWidth={4}>
          <Text>{data.content}</Text>
        </Accordion.Details>
      </Accordion.Item>
    </Accordion>
  );
};

export default AccordionComponent;
