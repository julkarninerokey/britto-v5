import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {VStack, ScrollView, Text, HStack, Button, Box} from 'native-base';
import AppBar from '../../components/AppBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getExam} from '../../service/api';
import 'react-native-pager-view';
import {IconListLoading} from '../../components/LoadingAnimation';
import AccordionComponent from '../../components/AccordionComponent';
import { formatDate, toast } from '../../service/utils';

const Examination = ({navigation}) => {
  const [data, setData] = useState([]);
  const [iconUrl, setIconUrl] = useState();
  const [loading, setLoading] = useState(true);
  const [noDataMsg, setNoDataMsg] = useState('');

  const handleEdit = (student) => {
   toast('info', 'Edit Examination', 'This feature is under development. Please check back later.');
  };

  useEffect(() => {
    const checkForData = async () => {
      setLoading(true);
      setNoDataMsg('');
      try {
        const reg = await AsyncStorage.getItem('reg');
        const dashboard = await AsyncStorage.getItem('dashboard');
        let syllabusIcon = undefined;
        try {
          syllabusIcon = JSON.parse(dashboard)?.find(
            item => item.screen === 'Examination',
          )?.icon;
        } catch (err) {
          console.error('Dashboard JSON parse error:', err);
        }
        setIconUrl(syllabusIcon);
        const response = await getExam(reg);

        if (response.status === 201) {
          setData([]);
          setNoDataMsg(response.message || 'No examination data found.');
        } else if (
          response.status === 200 &&
          Array.isArray(response.result) &&
          response.result.length > 0
        ) {
          const accordionData = response.result.map(item => ({
            title: `${item.EXAM_NAME} ${item.REGISTERED_EXAM_YEAR}`,
            content: `Exam Start: ${formatDate(item.EXAM_START_DATE)},  Hall Verification: ${
              item.HALL_VERIFY === 1 ? 'Verified' : 'Pending'
            }, Course Language: ${item.question_language || 'English'}`,
            details: (
              <VStack space={2}>
                <Text>Last Date: {formatDate(item.LAST_DATE)}</Text>
                <Text>Exam Start: {formatDate(item.EXAM_START_DATE)}</Text>
                <Text>Course Language: {item.question_language || 'English'}</Text>
                {Array.isArray(item.students) && item.students.length > 0 ? (
                  item.students.map((student, sidx) => (
                    <VStack key={sidx} mt={2} p={2} >
                      <Text>Roll: {student.REGISTERED_STUDENTS_EXAM_ROLL}</Text>
                      <Text>Class Roll: {student.CLASS_ROLL}</Text>
                      <Text>Type: {student.REGISTERED_STUDENTS_TYPE === 1 ? 'Regular' : 'Improvement'}</Text>
                      <Text>Department Verification: {student.REGISTERED_STUDENTS_COLLEGE_VERIFY ? 'Verified' : 'Not Verified'}</Text>
                      <Text>Hall Verification: {student.HALL_VERIFY === 1 ? 'Verified' : 'Not Verified'}</Text>
                      <Text>Payment Status: {student.PAYMENT_STATUS === 1 ? 'Paid' : 'Pending'}</Text>
                      {Array.isArray(student.courses) && student.courses.length > 0 ? (
                        <VStack mt={2} borderWidth={1} borderColor="gray.300" p={2} borderRadius={5}>
                          <Text bold> Selected Courses:</Text>
                          <HStack justifyContent="space-between" mb={1} >
                            <Text style={{width: 60, fontWeight: 'bold'}}>Code</Text>
                            <Text style={{flex: 1, fontWeight: 'bold'}}>Title</Text>
                            <Text style={{width: 50, fontWeight: 'bold'}}>Credit</Text>
                          </HStack>
                          {student.courses.map((course, cidx) => (
                            <HStack key={cidx} justifyContent="space-between" mb={1}>
                              <Text style={{width: 60}}>{course.COURSE_CODE_TITLE_CODE}</Text>
                              <Text style={{flex: 1}}>{course.COURSE_CODE_TITLE}</Text>
                              <Text style={{width: 50}}>{course.COURSE_CODE_TITLE_CREDIT}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      ) : (
                        <Button mt={2} size="sm" onPress={() => handleEdit(student)} variant={'outline'}>
                          Enroll in Examination
                        </Button>
                      )}
                      <Button mt={2} size="sm" onPress={() => handleEdit(student)} variant={'outline'}>
                        Download Admit Card
                      </Button>
                    </VStack>
                  ))
                ) : (
                  <Button mt={2} size="sm" onPress={() => handleEdit()}>
                    Start Enrollment
                  </Button>
                )}
              </VStack>
            ),
            icon: 'ios-arrow-down',
            badges: [
              `${item.ADMIT_CARD_ISSUE === 1 ? 'Download Admit Card' : 'Admit Pending'}`,
              `${
                item.REGISTERED_STUDENTS_EXAM_ROLL
                  ? 'Roll: ' + item.REGISTERED_STUDENTS_EXAM_ROLL
                  : 'Running'
              }`,
            ],
          }));
          setData(accordionData);
        } else {
          setData([]);
          setNoDataMsg('📝 No examination data is available for you at the moment. Please check back later or contact your department for updates.');
        }
      } catch (error) {
        console.error('Error loading examination data:', error);
        setData([]);
        setNoDataMsg('Failed to load examination data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    checkForData();
  }, []);

  return (
    <View style={{flex: 1}}>
      <AppBar title="Examination" />
      <VStack w={'100%'} flex={1}>
        {loading ? (
          <ScrollView>
            {[...Array(3)].map((_, index) => (
              <IconListLoading key={index} />
            ))}
          </ScrollView>
        ) : data && data.length > 0 ? (
          <ScrollView>
            <VStack w="100%" alignItems="flex-start" p={1}>
              {data.map((item, index) => (
                <AccordionComponent key={index} data={item} iconUrl={iconUrl} />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center" p={6}>
            <Text color="gray.500" fontSize="md" textAlign="center">
              {noDataMsg}
            </Text>
          </Box>
        )}
      </VStack>
    </View>
  );
};

export default Examination;
