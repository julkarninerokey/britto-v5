import React, {useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';
import {VStack, Text, HStack, Box, Skeleton, ScrollView, Button} from 'native-base';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {profileData} from '../../service/api';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import 'react-native-pager-view';
import {color, formatDate, getFullAddress, toast} from '../../service/utils';

const InfoRow = ({label, value}) => (
  <HStack alignItems="center">
    <Text fontSize="md" w="40%" flexWrap="wrap" flexShrink={1}>
      {label}
    </Text>
    <Text paddingX={4}>:</Text>
    <Text fontSize="md" flexWrap="wrap" w="50%" flexShrink={1}>
      {value}
    </Text>
  </HStack>
);

const FirstRoute = ({data}) => (
  <ScrollView>
    <Box flex={1} p={4} bg="white">
      <VStack space={2}>
        <InfoRow label="Student Name" value={data.ADMITTED_STUDENT_NAME} />
        <InfoRow label="Student Name (Bn)" value={data.STUDENT_BANGLA_NAME} />
        <InfoRow label="Father's Name" value={data.ADMITTED_STUDENT_FATHERS_N} />
        <InfoRow label="Mother's Name" value={data.ADMITTED_STUDENT_MOTHERS_N} />
        <InfoRow
          label="Date of Birth"
          value={formatDate(data.ADMITTED_STUDENT_DOB)}
        />
        <InfoRow label="Present Address" value={getFullAddress(data, 'present')} />
        <InfoRow label="Permanent Address" value={getFullAddress(data, 'permanent')} />
        <InfoRow label="Phone" value={data.ADMITTED_STUDENT_CONTACT_NO} />
        <InfoRow label="Email" value={data.ADMITTED_STUDENT_EMAIL} />
        <InfoRow label="Blood Group" value={data.blood_group} />
        <InfoRow label="Religion" value={data.RELIGION} />
        <InfoRow label="Nationality" value={data.NATIONALITY} />
      </VStack>
    </Box>
  </ScrollView>
);

const SecondRoute = ({data}) => (
  <Box flex={1} p={4} bg="white">
    <VStack space={2}>
      <InfoRow label="Department (En)" value={data.SUBJECTS_TITLE_EN} />
      <InfoRow label="Department (Bn)" value={data.SUBJECTS_TITLE} />
      <InfoRow label="Hall (En)" value={data.hall_title_en} />
      <InfoRow label="Hall (Bn)" value={data.hall_title} />
      <InfoRow label="Registration Number" value={data.ADMITTED_STUDENT_REG_NO} />
      <InfoRow
        label="Session"
        value={data.SESSION_NAME}
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

  // eslint-disable-next-line react/no-unstable-nested-components
  const InfoRowSkeleton = () => (
    <HStack alignItems="center" py={1} flexWrap="wrap">
      <Skeleton.Text lines={1} width="40%" />
      <Text paddingX={4}>:</Text>
      <Skeleton.Text lines={1} flex={1} />
    </HStack>
  );

  const FirstRouteSkeleton = () => (
    <Box flex={1} p={4} bg="white">
      <VStack space={2}>
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
        <InfoRowSkeleton />
      </VStack>
    </Box>
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
          <FirstRouteSkeleton />
        )}
        
      </VStack>
    </View>
  );
};

export default Profile;
