import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Image, TouchableOpacity, useWindowDimensions} from 'react-native';
import {VStack, Text, HStack, View, Skeleton, Button, Box} from 'native-base';
import {color, dashboardButtons, toast} from '../../service/utils';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import {FlatGrid} from 'react-native-super-grid';
import {logout} from '../../service/auth';

const Dashboard = ({navigation}) => {
  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    const availableButtons = dashboardButtons
      .filter(button => button?.status)
      .sort((a, b) => (a?.priority ?? 0) - (b?.priority ?? 0));

    setButtons(availableButtons);
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

  const windowWidth = useWindowDimensions().width || 0;
  const gridSpacing = 16;
  const effectiveWidth = windowWidth > 0 ? windowWidth : 320;
  const itemDimension = (effectiveWidth - gridSpacing * 3) / 2;
  const gridWidth = itemDimension * 2 + gridSpacing * 3;

  const skeletonPlaceholders = useMemo(
    () =>
      Array.from({length: 12}, (_, index) => ({
        id: `skeleton-${index}`,
      })),
    [],
  );

  const hasButtons = buttons.length > 0;
  const gridData = hasButtons ? buttons : skeletonPlaceholders;

  const keyExtractor = useCallback(
    (item, index) =>
      item?.id ? item.id.toString() : `dashboard-item-${index}`,
    [],
  );

  const renderSkeletonItem = useCallback(
    () => (
      <VStack
        background="white"
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
    ),
    [],
  );

  const renderGridItem = useCallback(
    ({item}) => {
      if (!hasButtons) {
        return renderSkeletonItem();
      }

      const handlePress = () => {
        if (!item?.screen) {
          toast('warning', 'Screen not available', 'Please try again later.');
          return;
        }

        navigation.navigate(item.screen);
      };

      return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <VStack
            background="white"
            padding={3}
            borderRadius={10}
            >
            <HStack>
              <VStack width={7} height={7}>
                <Image
                  source={{uri: item.icon}}
                  alt={item.icon}
                  style={{width: '100%', height: '100%'}}
                />
              </VStack>
            </HStack>

            <HStack justifyContent="flex-start" width="100%">
              <Text fontSize="md" color={color.primary} bold>
                {item.title}
              </Text>
            </HStack>
          </VStack>
        </TouchableOpacity>
      );
    },
    [hasButtons, navigation, renderSkeletonItem],
  );

  return (
    <View flex={1}>
      <AppBar title="Dashboard" />
      <VStack flex={1}>
        <ProfileCard />
        <Box flex={1}>
          <FlatGrid
            data={gridData}
            spacing={gridSpacing}
            itemDimension={itemDimension}
            staticDimension={gridWidth}
            renderItem={renderGridItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              hasButtons ? (
                <Box w="100%" alignItems="center">
                  <Box
                    shadow={2}
                    borderRadius="md"
                    px={1}
                    py={1}>
                    <Button
                      bg={color.danger || 'red.500'}
                      onPress={handleLogout}
                      isLoading={isLoggingOut}
                      isLoadingText="Logging out..."
                      _pressed={{bg: 'red.600'}}>
                      Logout
                    </Button>
                  </Box>
                </Box>
              ) : null
            }
            contentContainerStyle={{
              paddingVertical: gridSpacing,
            }}
          />
        </Box>
      </VStack>
    </View>
  );
};

export default Dashboard;
