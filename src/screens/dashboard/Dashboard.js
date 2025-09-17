import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {VStack, Text, HStack, View, Skeleton, Button, Box} from 'native-base';
import {color, dashboardButtons} from '../../service/utils';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FlatGrid} from 'react-native-super-grid';
import {logout} from '../../service/auth';

const Dashboard = ({navigation}) => {
  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    const checkForButtons = async () => {
      const storedToken = dashboardButtons;
      if (storedToken) {
        setButtons(storedToken);
      }
    };

    checkForButtons();
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      } else {
        toast('danger', result.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast('danger', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

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
              onError={error => console.log('Dashboard Icon Error:')}
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
            <Box w="80%" margin="auto" bg="white" shadow={2}>
              <Button
                bg={color.danger || 'red.500'}
                onPress={handleLogout}
                isLoading={isLoggingOut}
                isLoadingText="Logging out..."
                _pressed={{bg: 'red.600'}}>
                Logout
              </Button>
            </Box>
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
