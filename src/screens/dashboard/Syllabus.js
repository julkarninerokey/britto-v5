import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {VStack} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSyllabus} from '../../service/api';
import IconList from '../../components/IconList';
import {IconListLoading} from '../../components/LoadingAnimation';

const Syllabus = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState('');

  useEffect(() => {
    const checkForData = async () => {
      const reg = await AsyncStorage.getItem('reg');
      const dashboard = await AsyncStorage.getItem('dashboard');
      const syllabusIcon = JSON.parse(dashboard).find(
        item => item.screen === 'Syllabus',
      ).icon;
      setIconUrl(syllabusIcon);
      const response = await getSyllabus(reg);
      setData(response.data || []);
    };

    checkForData();
  }, []);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Syllabus" />
      <VStack w="100%" flex={1}>
        {data && data.length > 0 ? ( 
          <ScrollView>
            <VStack w="100%" alignItems="flex-start" p={2}>
              {data.map((item, index) => (
                <IconList
                  key={index}
                  icon={iconUrl}
                  heading={item.title}
                  subHeading={`Year: ${item.year}`}
                  rootLink={item.link}
                />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <ScrollView>
            {[...Array(3)].map((_, index) => (
              <IconListLoading key={index} />
            ))}
          </ScrollView>
        )}
      </VStack>
    </View>
  );
};

export default Syllabus;
