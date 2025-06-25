import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView, Text, Box, HStack, Divider, Button} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getResult} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';
import { formatDate } from '../../service/utils';

const Result = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState();
  const [noDataMessage, setNoDataMessage] = useState('No result data found');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkForData = async () => {
      setLoading(true);
      try {
        const reg = await AsyncStorage.getItem('reg');
        const dashboard = await AsyncStorage.getItem('dashboard');
        let syllabusIcon = undefined;
        try {
          syllabusIcon = JSON.parse(dashboard)?.find(
            item => item.screen === 'Result',
          )?.icon;
        } catch (err) {
          console.error('Dashboard JSON parse error:', err);
        }
        setIconUrl(syllabusIcon);
        const response = await getResult(reg);

        if (response?.status === 201) {
          setNoDataMessage(response?.message || 'No result data found');
          setData([]);
        } else if (response?.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          const accordionData = response.data.map(item => ({
            title: `${item.exam_title}`,
            content: `Published: ${formatDate(item.result_pub_date)}`,
            details: renderResultDetails(item),
            icon: 'ios-arrow-down',
            badges: [
              `${item.result || 'Improvement'}`
            ],
          }));
          setData(accordionData);
        } else {
          setNoDataMessage('No result data found');
          setData([]);
        }
      } catch (error) {
        console.error('Error loading result data:', error);
        setNoDataMessage('No result data found');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    checkForData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderResultDetails = (item) => (
    <Box>
      <HStack>
        <Text bold flex={2}>Examination Title</Text>
        <Text flex={2}>{item.exam_title}</Text>
      </HStack>
      <HStack>
        <Text bold flex={2}>Examination Held In</Text>
        <Text flex={2}>{item.exam_held_in}</Text>
      </HStack>
      <HStack>
        <Text bold flex={2}>Result Memo</Text>
        <Text flex={2}>{item.result_memo}</Text>
      </HStack>
      <HStack>
        <Text bold flex={2}>Result Publication Date</Text>
        <Text flex={2}>{formatDate(item.result_pub_date)}</Text>
      </HStack>
      {item.sup_date ? (
        <HStack>
          <Text bold flex={2}>Supplementary Result Publication Date</Text>
          <Text flex={2}>{formatDate(item.sup_date)}</Text>
        </HStack>
      ) : null}
      {item.stream ? (
        <HStack>
          <Text bold flex={2}>Stream</Text>
          <Text flex={2}>{item.stream}</Text>
        </HStack>
      ) : null}
      {item.groups ? (
        <HStack>
          <Text bold flex={2}>Group</Text>
          <Text flex={2}>{item.groups}</Text>
        </HStack>
      ) : null}
      {item.focal_area ? (
        <HStack>
          <Text bold flex={2}>Focal Area</Text>
          <Text flex={2}>{item.focal_area}</Text>
        </HStack>
      ) : null}
      {/* GPA fields */}
      {[
        ["8th", "eight_gpa"],
        ["7th", "seven_gpa"],
        ["6th", "six_gpa"],
        ["5th", "five_gpa"],
        ["4th", "four_gpa"],
        ["3rd", "three_gpa"],
        ["2nd", "second_gpa"],
        ["1st", "first_gpa"],
      ].map(([label, key]) =>
        item[key] ? (
          <HStack key={key}>
            <Text bold flex={2}>{label} GPA</Text>
            <Text flex={2}>{item[key]}</Text>
          </HStack>
        ) : null
      )}
      {item.final_cgpa ? (
        <HStack>
          <Text bold flex={2}>CGPA</Text>
          <Text flex={2}>{item.final_cgpa}</Text>
        </HStack>
      ) : null}
      <HStack>
        <Text bold flex={2}>Result</Text>
        <Text flex={2}>{item.result}</Text>
      </HStack>
      <HStack>
        <Text bold flex={2}>Remarks</Text>
        <Text flex={2}>{item.remarks}</Text>
      </HStack>
      <Divider my={2} />
      {/* Marks Table */}
      <Text bold mb={1} textAlign={"center"}>Course Wise Result</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <Box minWidth={'100%'}>
          <HStack width={'100%'}>
              <Text bold w={50} textAlign="center" >Course Code</Text>
            <Text bold w={145} textAlign="center" >Course Title</Text>
              <Text bold w={50} textAlign="center" >Letter Grade</Text>
              <Text bold w={50} textAlign="center" >Grade Point</Text>
              <Text bold w={50} textAlign="center" >Credit</Text>
            </HStack>
            <Divider />
            {item.courses && item.courses.length > 0 ? item.courses.map((mark, idx) => (
              <HStack key={idx} width={'100%'} borderBottomWidth={1} borderColor="gray.200" py={1}>
                <Text w={50} textAlign="center" >{mark.course_code}</Text>
                <Text w={145} >{mark.course_title?.trim()}</Text>
                <Text w={50} textAlign="center" >{mark.letter_grade}</Text>
                <Text w={50} textAlign="center" >{mark.grade_point}</Text>
                <Text w={50} textAlign="center" >{mark.course_credit}</Text>
              </HStack>
            )) : (
              <Text fontSize="sm">No marks available</Text>
            )}
          </Box>
      </ScrollView>
      <Divider />
      <Button marginTop={2} variant={'outline'}>Download Result</Button>
    </Box>
  );

  return (
    <View style={{flex: 1}}>
      <AppBar title="Result" />
      <VStack w={'100%'} flex={1}>
        {loading ? (
          <ScrollView>
            {[...Array(3)].map((_, index) => (
              <IconListLoading key={index} />
            ))}
          </ScrollView>
        ) : !data || data.length === 0 ? (
            <Box flex={1} w="100%" justifyContent={'center'} alignItems="center" p={4}>
              <Text>{noDataMessage}</Text>
            </Box>
        ) : (
          <ScrollView>
            <VStack w="100%" alignItems="flex-start" p={1}>
              {data.map((item, index) => (
                <AccordionComponent key={index} data={item} iconUrl={iconUrl} />
              ))}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </View>
  );
};

export default Result;
