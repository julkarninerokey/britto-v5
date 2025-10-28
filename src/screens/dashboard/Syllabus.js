import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {VStack, Text, Box} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSyllabus} from '../../service/api';
import IconList from '../../components/IconList';
import {IconListLoading} from '../../components/LoadingAnimation';
import { dashboardButtons } from '../../service/utils';

const Syllabus = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [noDataMsg, setNoDataMsg] = useState('');

  useEffect(() => {
    const checkForData = async () => {
      setLoading(true);
      setNoDataMsg('');
      


const syllabusIcon = dashboardButtons.find(
          item => item.screen === 'Syllabus',
        )?.icon;
        setIconUrl(syllabusIcon);

      try {
        const reg = await AsyncStorage.getItem('reg');

        if (!reg) {
          setData([]);
          setNoDataMsg('No syllabus found for your account.');
          setLoading(false);
          return;
        }
        
        const response = await getSyllabus('2017417693');
        
        if (response.status === 201) {
          setData([]);
          setNoDataMsg(response.message || 'No syllabus found.');
        } else if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          setData(response.data);
        } else {
          setData([]);
          setNoDataMsg('🎓 No syllabus is available for you at the moment. Please check back later or contact your department for updates.');
        }
      } catch (err) {
        console.error('Syllabus fetch error:', err);
        setData([]);
        setNoDataMsg('Failed to load syllabus. Please try again later.');
      }
      setLoading(false);
    };

    
    checkForData();
  }, []);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Syllabus" />
      <VStack w="100%" flex={1}>
        {loading ? (
          <ScrollView>
            {[...Array(3)].map((_, index) => (
              <IconListLoading key={index} />
            ))}
          </ScrollView>
        ) : data && data.length > 0 ? (
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
          <Box flex={1} p={6} alignItems="center" justifyContent="center">
            <Text color="gray.500" fontSize="md" textAlign="center">
              {noDataMsg}
            </Text>
          </Box>
        )}
      </VStack>
    </View>
  );
};

export default Syllabus;
