import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, Image, TouchableOpacity, useWindowDimensions} from 'react-native';
import {VStack, Text, HStack, View, Skeleton, Button, Box} from 'native-base';
import {color, toast, dashboardButtons} from '../../service/utils';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import {logout} from '../../service/auth';

const Dashboard = ({navigation}) => {
  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    const all = dashboardButtons || [];
    const sortedButtons = all.sort((a, b) => (a?.priority ?? 0) - (b?.priority ?? 0));
    setButtons(sortedButtons);
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
  const gridSpacing = 2;
  const minItemWidth = 160;
  const effectiveWidth = windowWidth > 0 ? windowWidth : 320;

  const numColumns = useMemo(() => {
    const availableWidth = Math.max(effectiveWidth - gridSpacing * 2, minItemWidth);
    const tentativeColumns = Math.max(
      2,
      Math.floor((availableWidth + gridSpacing) / (minItemWidth + gridSpacing)),
    );

    return Math.min(tentativeColumns, 4); // Prevent overly wide rows on large screens
  }, [effectiveWidth, gridSpacing]);

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
        alignItems="flex-end"
        width="100%">
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
        return (
          <Box flex={1} mb={gridSpacing}>
            {renderSkeletonItem()}
          </Box>
        );
      }

      const isEnabled = item?.status ? true : false;
      const handlePress = () => {
        if (!item?.screen) {
          toast('warning', 'Screen not available', 'Please try again later.');
          return;
        }
        if (!isEnabled) {
          toast('info', 'Coming soon', 'This feature will be available soon.');
          return;
        }
        navigation.navigate(item.screen);
      };

      return (
        <Box flex={1} margin={gridSpacing}>
          <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={{flex: 1, opacity: isEnabled ? 1 : 0.5}}>
            <VStack
              background="white"
              padding={3}
              borderRadius={10}
            >
              <HStack>
                <VStack width={7} height={7} style={{marginLeft: 'auto'}}>
                  <Image
                    source={{uri: item.icon}}
                    alt={item.icon}
                    style={{width: '100%', height: '100%', tintColor: isEnabled ? color.primary : color.muted}}
                  />
                </VStack>
              </HStack>

              <HStack justifyContent="flex-start" width="100%">
                <Text fontSize="md" color={isEnabled ? color.primary : color.muted} bold>
                  {item.title}
                </Text>
              </HStack>
            </VStack>
          </TouchableOpacity>
        </Box>
      );
    },
    [gridSpacing, hasButtons, navigation, renderSkeletonItem],
  );

  return (
    <View flex={1}>
      <AppBar title="Dashboard" />
      <VStack flex={1}>
        <ProfileCard />
        <Box flex={1}>
          <FlatList
            data={gridData}
            numColumns={numColumns}
            renderItem={renderGridItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={numColumns > 1 ? {columnGap: gridSpacing} : undefined}
            ListFooterComponent={
              hasButtons ? (
                <Box w="100%" alignItems="center">
                  <Box
                    shadow={2}
                    borderRadius="md"
                    px={1}
                    py={1}
                    bg={color.background}>
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
              paddingHorizontal: gridSpacing,
              paddingVertical: gridSpacing,
            }}
          />
        </Box>
      </VStack>
    </View>
  );
};

export default Dashboard;
