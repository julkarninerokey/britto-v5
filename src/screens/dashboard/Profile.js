import React, {useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';
import {VStack, Text, HStack, Box, Skeleton, ScrollView, Button, Divider} from 'native-base';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {profileData} from '../../service/api';
import {TabView, SceneMap, TabBar, TabBarItem} from 'react-native-tab-view';
import 'react-native-pager-view';
import {color, formatDate, getFullAddress, toast} from '../../service/utils';
import { getUser } from '../../service/auth';

const InfoRow = ({label, value}) => (
  <HStack alignItems="center" py={1}>
    <Text fontSize="md" w="40%" flexWrap="wrap" flexShrink={1} color={color.text} fontWeight="500">
      {label}
    </Text>
    <Text paddingX={4} color={color.secondary}>:</Text>
    <Text fontSize="md" flexWrap="wrap" w="50%" flexShrink={1} color={color.text}>
      {value}
    </Text>
  </HStack>
);

const FirstRoute = ({data}) => (
  <ScrollView>
    <Box flex={1} p={4} bg={color.background}>
      <VStack space={3}>
        <InfoRow label="Student Name" value={data?.name || ''} />
        <InfoRow label="Student Name (Bn)" value={data?.banglaName || ''} />
        <InfoRow label="Father's Name" value={data?.fathersName || ''} />
        <InfoRow label="Mother's Name" value={data?.mothersName || ''} />
        <InfoRow label="Guardian Name" value={data?.guardianName || ''} />
        <InfoRow label="Gender" value={data?.gender || ''} />
        <InfoRow
          label="Date of Birth"
          value={data?.dateOfBirth ? formatDate(data.dateOfBirth) : ''}
        />
        <InfoRow label="Blood Group" value={data?.bloodGroup || ''} />
        <InfoRow label="Religion" value={data?.religion || ''} />
        <InfoRow label="Caste/Sect" value={data?.casteSect || ''} />
        <InfoRow label="Nationality" value={data?.nationality || ''} />
        <InfoRow label="Phone" value={data?.contact || ''} />
        <InfoRow label="Email" value={data?.email || ''} />
        <InfoRow label="Email Verified" value={data?.emailVerified === '1' ? 'Yes' : 'No'} />
      </VStack>
    </Box>
  </ScrollView>
);

const SecondRoute = ({data}) => (
  <ScrollView>
    <Box flex={1} p={4} bg={color.background}>
      <VStack space={3}>
        <InfoRow label="Present Address" value={data?.presentAddress || ''} />
        <InfoRow label="Present House No" value={data?.presentHouseNo || ''} />
        <InfoRow label="Present House/Road" value={data?.presentHouseRoad || ''} />
        <InfoRow label="Present Police Station" value={data?.presentPoliceStation || ''} />
        <InfoRow label="Present Upazilla" value={data?.presentUpaZilla || ''} />
        <InfoRow label="Permanent Address" value={data?.permanentAddress || ''} />
        <InfoRow label="Permanent Upazilla" value={data?.permanentUpaZilla || ''} />
        <InfoRow label="Permanent Post Code" value={data?.permanentPostCode || ''} />
      </VStack>
    </Box>
  </ScrollView>
);

const ThirdRoute = ({data}) => (
  <ScrollView>
    <Box flex={1} p={4} bg={color.background}>
      <VStack space={3}>
        <InfoRow label="Department (En)" value={data?.department || ''} />
        <InfoRow label="Department (Bn)" value={data?.departmentBangla || ''} />
        <InfoRow label="Hall (En)" value={data?.hall || ''} />
        <InfoRow label="Hall (Bn)" value={data?.hallBangla || ''} />
        <InfoRow label="Registration Number" value={data?.regNo || ''} />
        <InfoRow label="Session" value={data?.session || ''} />
        <InfoRow label="Current Degree" value={data?.degree || ''} />
        <InfoRow label="Student Status" value={data?.admittedStudentStatus === '1' ? 'Active' : 'Inactive'} />
        <InfoRow label="Punishment Status" value={data?.punishmentStatus || 'None'} />
      </VStack>
    </Box>
  </ScrollView>
);

const FourthRoute = ({data}) => (
  <ScrollView>
    <Box flex={1} p={4} bg={color.background}>
      {data?.completedDegrees && data.completedDegrees.length > 0 ? (
        <VStack space={4}>
          {data.completedDegrees.map((degree, index) => (
            <Box 
              key={degree.id} 
              p={4} 
            >
              <Text 
                fontSize="lg" 
                fontWeight="bold" 
                color={color.primary} 
                mb={2} 
                textAlign="center"
              >
                {degree.programsName || `Degree #${index + 1}`}
              </Text>
              <Divider bg={color.primary} thickness={1} mb={3} />
              <VStack space={2}>
                <InfoRow label="Degree Name" value={degree.degreeName || ''} />
                <InfoRow label="Program" value={degree.programsName || ''} />
                <InfoRow label="Department" value={degree.subjectsTitle || ''} />
                <InfoRow label="Status" value={degree.degreeStatus || ''} />
                <InfoRow label="Exam Roll" value={degree.examRoll || ''} />
                <InfoRow label="Exam Year" value={degree.examYear || ''} />
                <InfoRow label="Final Result" value={degree.finalResult || ''} />
                <InfoRow 
                  label="Result Publication" 
                  value={degree.resultPublicationDate ? formatDate(degree.resultPublicationDate) : ''} 
                />
                <InfoRow label="Result Verified" value={degree.resultVerified || ''} />
                <InfoRow 
                  label="Verified At" 
                  value={degree.resultVerifiedAt ? formatDate(degree.resultVerifiedAt) : ''} 
                />
                <InfoRow label="All Results Available" value={degree.allResultAvailable || ''} />
                
                {/* Clearance Status */}
                <Text 
                  fontSize="md" 
                  fontWeight="semibold" 
                  mt={3} 
                  mb={2}
                  color={color.primary}
                  textAlign="center"
                >
                  Clearance Status
                </Text>
                <Divider bg={color.secondary} thickness={1} mb={2} />
                <InfoRow label="Certificate Delivered" value={degree.certificateDelivered || 'Pending'} />
                <InfoRow label="Marksheet Delivered" value={degree.marksheetDelivered || 'Pending'} />
                <InfoRow label="Transcript Delivered" value={degree.transcriptDelivered || 'Pending'} />
                <InfoRow label="Accounts Clearance" value={degree.accountsClearance || 'Pending'} />
                <InfoRow label="Hall Clearance" value={degree.hallClearance || 'Pending'} />
                <InfoRow label="Library Clearance" value={degree.libraryClearance || 'Pending'} />
              </VStack>
            </Box>
          ))}
        </VStack>
      ) : (
        <Box flex={1} justifyContent="center" alignItems="center" py={10}>
          <Text fontSize="md" color={color.secondary} textAlign="center">
            No completed degrees found
          </Text>
        </Box>
      )}
    </Box>
  </ScrollView>
);

const Profile = ({navigation}) => {
  const [data, setData] = useState(null); // Change to null initially
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const checkForProfileData = async () => {
      try {
        // Get user data from the auth service (which gets it from AsyncStorage)
        const userData = await getUser();
        if (userData) {
          setData(userData);
        } else {
          // Fallback to old method if new data not available
          const reg = await AsyncStorage.getItem('reg');
          if (reg) {
            const profile = await profileData(reg);
            setData(profile.data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        // Try fallback method
        try {
          const reg = await AsyncStorage.getItem('reg');
          if (reg) {
            const profile = await profileData(reg);
            setData(profile.data[0]);
          }
        } catch (fallbackError) {
          console.error('Fallback profile loading failed:', fallbackError);
        }
      }
    };

    checkForProfileData();
  }, []);

  const initialLayout = {
    width: Dimensions.get('window').width,
  };

  const renderScene = SceneMap({
    first: () => (data ? <FirstRoute data={data} /> : null),
    second: () => (data ? <SecondRoute data={data} /> : null),
    third: () => (data ? <ThirdRoute data={data} /> : null),
    fourth: () => (data ? <FourthRoute data={data} /> : null),
  });

  const [routes] = useState([
    {key: 'first', title: 'Personal'},
    {key: 'second', title: 'Address'},
    {key: 'third', title: 'Academic'},
    {key: 'fourth', title: 'Degrees'},
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      renderTabBarItem={({key, ...tabItemProps}) => (
        <TabBarItem key={key} {...tabItemProps} />
      )}
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
    <Box flex={1} p={4} bg={color.background}>
      <VStack space={3}>
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
    <View style={{flex: 1, backgroundColor: color.secondaryBackground}}>
      <AppBar title="Profile" />
      <VStack w={'100%'} flex={1} bg={color.secondaryBackground}>
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
