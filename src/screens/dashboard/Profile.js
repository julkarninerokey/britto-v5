import React, {useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';
import {VStack, Text, HStack, Box} from 'native-base';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {profileData} from '../../service/api';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import 'react-native-pager-view';
import {color} from '../../service/utils';

const InfoRow = ({label, value}) => (
  <HStack alignItems="center" flexWrap="wrap">
    <Text
      bold
      fontSize="md"
      w="30%"
      flexWrap="wrap"
      color={color.primary}
      flexShrink={1}>
      {label}
    </Text>
    <Text paddingX={4}>:</Text>
    <Text
      fontSize="md"
      flexWrap="wrap"
      color={color.primary}
      bold
      w="60%"
      flexShrink={1}>
      {value}
    </Text>
  </HStack>
);

const FirstRoute = ({data, address}) => (
  <Box flex={1} p={4} bg="white">
    <VStack space={2}>
      <InfoRow label="Student Name" value={data.name_en} />
      <InfoRow label="Student Name (Bn)" value={data.name_bn} />
      <InfoRow label="Father's Name" value={data.father_name} />
      <InfoRow label="Mother's Name" value={data.mother_name} />
      <InfoRow
        label="Date of Birth"
        value={`${data.dobD}-${data.dobM}-${data.dobY}`}
      />
      <InfoRow label="Address" value={address} />
      <InfoRow label="Phone" value={data.phone} />
      <InfoRow label="Email" value={data.email} />
      <InfoRow label="Blood Group" value={data.blood_group} />
      <InfoRow label="Religion" value={data.dhormo} />
    </VStack>
  </Box>
);

const SecondRoute = ({data}) => (
  <Box flex={1} p={4} bg="white">
    <VStack space={2}>
      <InfoRow label="Department" value={data.dept_name} />
      <InfoRow label="Hall" value={data.hall_name} />
      <InfoRow label="Registration Number" value={data.reg_num} />
      <InfoRow
        label="Session"
        value={`${data.session}-${parseInt(data.session) + 1}`}
      />
    </VStack>
  </Box>
);

const Profile = ({navigation}) => {
  const [data, setData] = useState(null); // Change to null initially
  const [index, setIndex] = useState(0);
  const [address, setAddress] = useState();

  useEffect(() => {
    const checkForProfileData = async () => {
      const reg = await AsyncStorage.getItem('reg');
      const profile = await profileData(reg);
      setData(profile.data[0]);
      setAddress(profile.address);
    };

    checkForProfileData();
  }, []);

  const initialLayout = {
    width: Dimensions.get('window').width,
  };

  const renderScene = SceneMap({
    first: () => (data ? <FirstRoute data={data} address={address} /> : null),
    second: () => (data ? <SecondRoute data={data} /> : null),
  });

  const [routes] = useState([
    {key: 'first', title: 'Personal'},
    {key: 'second', title: 'Academic'},
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: color.primary,
        color: 'white',
      }}
      style={{backgroundColor: color.background}}
      labelStyle={{color: color.primary}}
    />
  );

  return (
    <View style={{flex: 1}}>
      <AppBar title="Profile" />
      <VStack w={'100%'} flex={1}>
        <ProfileCard />
        {data ? (
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
            initialLayout={initialLayout}
          />
        ) : (
          <Text>Data Not Found</Text>
        )}
      </VStack>
    </View>
  );
};

export default Profile;
