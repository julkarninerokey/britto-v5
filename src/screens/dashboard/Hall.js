import React, {useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';
import {
  VStack,
  Text,
  Box,
  Skeleton,
  Center,
  ScrollView,
  Spacer,
} from 'native-base';
import ProfileCard from '../../components/ProfileCard';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {hallData} from '../../service/api';
import {TabView, SceneMap, TabBar, TabBarItem} from 'react-native-tab-view';
import 'react-native-pager-view';
import {color} from '../../service/utils';
import UserList from '../../components/UserList';

const FirstRoute = ({data}) => (
  <Center m="4">
    <ScrollView>
      <VStack>
        <Text textAlign={'justify'}>
          {data?.history.replace(/<[^>]+>/g, '')}{' '}
        </Text>
      </VStack>
      <Spacer m={2} />
      <VStack>
        <Text>{data?.mission_vision.replace(/<[^>]+>/g, '')} </Text>
      </VStack>
    </ScrollView>
  </Center>
);

const SecondRoute = ({data}) => (
  <Center m="4">
    <ScrollView minW={'100%'}>
      {data.length > 0 ? (
        data.map(t => <UserList t={t} />)
      ) : (
        <Center>
          <Text textAlign={'justify'}>No Teacher Found on the Server</Text>
        </Center>
      )}
    </ScrollView>
  </Center>
);

const ThirdRoute = ({data}) => (
  <Center m="4">
    <ScrollView minW={'100%'}>
      {data.length > 0 ? (
        data.map(t => <UserList t={t} />)
      ) : (
        <Center>
          <Text>No Staff Found on the Server</Text>
        </Center>
      )}
    </ScrollView>
  </Center>
);

const FourthRoute = ({data}) => (
  <Center m="4">
    <ScrollView minW={'100%'}>
      {data.length > 0 ? (
        data.map(t => <UserList t={t} />)
      ) : (
        <Center>
          <Text>No Staff Found on the Server</Text>
        </Center>
      )}
    </ScrollView>
  </Center>
);

const Hall = ({navigation}) => {
  const [teacher, setteacher] = useState([]);
  const [staff, setstaff] = useState([]);
  const [student, setstudent] = useState([]);
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const checkForData = async () => {
      const reg = await AsyncStorage.getItem('reg');

      console.log("🚀 -----------------------------------------🚀")
      console.log("🚀 ~ Hall.js:90 ~ checkForData ~ reg:", reg)
      console.log("🚀 -----------------------------------------🚀")

      const response = await hallData(2017417693);

      console.log("🚀 ---------------------------------------------------🚀")
      console.log("🚀 ~ Hall.js:91 ~ checkForData ~ response:", response)
      console.log("🚀 ---------------------------------------------------🚀")

      setData(response.data);
      const emp = response?.staff;
      if (emp.length > 0) {
        setteacher(emp.filter(x => x.EmpType === 'T'));
        setstaff(emp.filter(x => x.EmpType === 'O'));
      }
      setstudent(response?.student);
    };

    checkForData();
  }, []);

  const initialLayout = {
    width: Dimensions.get('window').width,
  };

  const renderScene = SceneMap({
    first: () => <FirstRoute data={data} />,
    second: () => <SecondRoute data={student} />,
    third: () => <ThirdRoute data={teacher} />,
    fourth: () => <FourthRoute data={staff} />,
  });

  const [routes] = useState([
    {key: 'first', title: 'Intro'},
    {key: 'second', title: 'Students'},
    {key: 'third', title: 'Faculties'},
    {key: 'fourth', title: 'Staffs'},
  ]);

  const renderTabBar = props => (
    <ScrollView
      horizontal
      style={{
        maxHeight: 50,
        backgroundColor: color.background,
      }}>
      <TabBar
        {...props}
        renderTabBarItem={({key, ...tabItemProps}) => (
          <TabBarItem key={key} {...tabItemProps} />
        )}
        indicatorStyle={{
          backgroundColor: color.primary,
        }}
        style={{
          backgroundColor: color.background,
        }}
        tabStyle={{width: 'auto'}}
        labelStyle={{color: color.primary}}
        scrollEnabled={true} // Enable scrolling
      />
    </ScrollView>
  );

  const ParagraphSkeleton = () => {
    return (
      <Box p={4}>
        <VStack space={2}>
          <Skeleton.Text
            lines={10}
            startColor="coolGray.100"
            endColor="coolGray.200"
          />
        </VStack>
      </Box>
    );
  };

  return (
    <View style={{flex: 1}}>
      <AppBar title="Hall" />
      <VStack w={'100%'} flex={1}>
        <ProfileCard
          name={data && data?.name}
          // year={data && data?.estyr}
        />
        {data?.name ? (
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
            initialLayout={initialLayout}
          />
        ) : (
          <Box>
            <ParagraphSkeleton />
            <ParagraphSkeleton />
          </Box>
        )}
      </VStack>
    </View>
  );
};

export default Hall;
