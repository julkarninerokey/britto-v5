import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {VStack, Text, HStack, View, Skeleton} from 'native-base';
import {color} from '../../service/utils';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FlatGrid} from 'react-native-super-grid';

const Dashboard = ({navigation}) => {
  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    const checkForButtons = async () => {
      const storedToken = await AsyncStorage.getItem('dashboard');
      if (storedToken) {
        setButtons(JSON.parse(storedToken));
      }
    };

    checkForButtons();
  }, []);

  const windowWidth = useWindowDimensions().width;
  const columnCount = Math.floor(windowWidth / 120);
  const itemDimension = windowWidth / columnCount - 10;

  // eslint-disable-next-line react/no-unstable-nested-components
  const Item = ({item}) => (
    <TouchableOpacity onPress={() => navigation.navigate(item.screen)}>
      <VStack
        background={'white'}
        padding={3}
        borderRadius={10}
        alignItems="flex-end">
        <HStack justifyContent="flex-end" width="45%">
          <VStack width={7} height={7}>
            <Image
              source={{uri: item.icon}}
              alt={item.icon}
              style={{width: '100%', height: '100%'}}
              onError={error => console.log('Image Error:', error)}
            />
          </VStack>
        </HStack>

        {/* Text */}
        <HStack justifyContent="flex-start" width="100%">
          <Text fontSize="md" color={color.primary} bold>
            {item.title}
          </Text>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const ItemSkeleton = () => (
    <VStack
      background={'white'}
      padding={3}
      borderRadius={10}
      alignItems="flex-end">
      <HStack justifyContent="flex-end" width="45%">
        <Skeleton width={7} height={7} borderRadius="full" />
      </HStack>
      <HStack justifyContent="flex-start" width="100%">
        <Skeleton.Text lines={1} width="70%" />
      </HStack>
    </VStack>
  );

  return (
    <View h={'70%'}>
      <AppBar title="Dashboard" />
      <VStack w={'100%'}>
        <ProfileCard />
        {buttons && buttons.length > 0 ? (
          <ScrollView>
            <FlatGrid
              itemDimension={itemDimension}
              data={buttons}
              renderItem={({item}) => <Item item={item} />}
            />
          </ScrollView>
        ) : (
          <FlatGrid
            itemDimension={itemDimension}
            data={[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}
            renderItem={({item}) => <ItemSkeleton item={item} />}
          />
        )}
      </VStack>
    </View>
  );
};

export default Dashboard;
