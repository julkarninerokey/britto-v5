import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  VStack,
  ScrollView,
  Text,
  HStack,
  Button,
  Box,
  Badge,
  Divider,
  Skeleton,
  Pressable,
  Collapse,
} from 'native-base';
import AppBar from '../../components/AppBar';
import { getAllResults } from '../../service/resultService';
import { formatDate, toast, color } from '../../service/utils';

// Helper function to get result status and icon
const getResultStatus = (result) => {
  const hasGPA = result.gpa && parseFloat(result.gpa) > 0;
  const hasCGPA = result.cgpa && parseFloat(result.cgpa) > 0;
  
  if (hasGPA && hasCGPA) {
    return {
      status: 'Result Published',
      icon: '🎓',
      color: '#191970',
      bgColor: '#1e293b'
    };
  } else if (hasGPA && !hasCGPA) {
    return {
      status: 'Partial Result',
      icon: '📊',
      color: '#191970',
      bgColor: '#1e293b'
    };
  } else {
    return {
      status: 'Result Pending',
      icon: '⏳',
      color: '#191970',
      bgColor: '#3e4857ff'
    };
  }
};

const ResultCard = ({ result, isExpanded, onToggle }) => {
  const statusInfo = getResultStatus(result);
  
  return (
  <Box
    bg={color.background}
    borderRadius={8}
    borderWidth={1}
    borderColor={color.light}
    mb={2}
    mx={3}
    shadow={1}
  >
    {/* Card Header - Always Visible */}
    <Pressable onPress={onToggle}>
      {({ isPressed }) => (
        <Box
          bg={isPressed ? color.light : 'transparent'}
          p={4}
          borderTopRadius={8}
          borderBottomRadius={isExpanded ? 0 : 8}
        >
          <VStack space={3}>
            {/* Title and Toggle */}
            <HStack justifyContent="space-between" alignItems="center">
              <HStack flex={1} space={3} alignItems="center">
                {/* Status Icon */}
                <Box
                  bg={statusInfo.bgColor}
                  p={2}
                  borderRadius="full"
                  w={10}
                  h={10}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="lg">{statusInfo.icon}</Text>
                </Box>
                
                <VStack flex={1} space={1}>
                  <Text
                    fontSize="md"
                    fontWeight="600"
                    color={color.text}
                    numberOfLines={2}
                  >
                    {result.examName} ({result.examYear})
                  </Text>
                  
                  {/* Unified Status */}
                  <Text fontSize="xs" fontWeight="500" color={statusInfo.color}>
                    {statusInfo.status}
                  </Text>
                  
                  {/* GPA/CGPA Preview */}
                  <HStack space={3}>
                    {result.gpa && parseFloat(result.gpa) > 0 && (
                      <Text fontSize="xs" color={color.secondary} fontWeight="500">
                        GPA: {result.gpa}
                      </Text>
                    )}
                    {result.cgpa && parseFloat(result.cgpa) > 0 && (
                      <Text fontSize="xs" color={color.primary} fontWeight="500">
                        CGPA: {result.cgpa}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <Text fontSize="lg" color={color.muted}>
                {isExpanded ? '⌄' : '›'}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </Pressable>

    {/* Expandable Details */}
    <Collapse isOpen={isExpanded}>
      <VStack space={3} p={4} pt={0}>
        <Divider />
        
        {/* Detailed Information */}
        <VStack space={4}>
          
          {/* Exam Details */}
          <VStack space={2}>
            <Text fontSize="sm" fontWeight="600" color={color.primary}>
              📅 Examination Information
            </Text>
            <VStack space={1} pl={4}>
              <DetailRow label="Exam Name" value={result.examName} />
              <DetailRow label="Exam Year" value={result.examYear} />
              <DetailRow label="Subject" value={result.subject} />
              <DetailRow label="Student Type" value={result.registeredStudentsType} />
              <DetailRow label="Enrollment Date" value={formatDate(result.enrollmentDateTime)} />
              
              {/* GPA & CGPA */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" color={color.text}>GPA</Text>
                <Text fontSize="xs" fontWeight="600" color={color.secondary}>
                  {result.gpa || 'N/A'}
                </Text>
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" color={color.text}>CGPA</Text>
                <Text fontSize="xs" fontWeight="600" color={color.primary}>
                  {result.cgpa || 'N/A'}
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Courses */}
          {result.courses && result.courses.length > 0 && (
            <VStack space={2}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" fontWeight="600" color={color.primary}>
                  📚 Course Results
                </Text>
                <HStack space={2} alignItems="center">
                  <Badge
                    bg={color.secondary}
                    borderRadius={10}
                    px={2}
                    py={1}
                    _text={{ color: 'white', fontSize: '2xs' }}
                  >
                    {result.courses.length}
                  </Badge>
                </HStack>
              </HStack>
              
              {/* Course Table */}
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <Box minWidth="100%">
                  {/* Table Header */}
                  <HStack bg={color.light} p={2} borderRadius={4}>
                    <Text bold w={16} textAlign="center" fontSize="2xs">Code</Text>
                    <Text bold w={32} textAlign="center" fontSize="2xs">Title</Text>
                    <Text bold w={12} textAlign="center" fontSize="2xs">Credit</Text>
                    <Text bold w={12} textAlign="center" fontSize="2xs">Grade</Text>
                    <Text bold w={12} textAlign="center" fontSize="2xs">Point</Text>
                  </HStack>
                  
                  {/* Table Rows */}
                  <VStack>
                    {result.courses.map((course, index) => (
                      <CourseResultRow key={index} course={course} isEven={index % 2 === 0} />
                    ))}
                  </VStack>
                </Box>
              </ScrollView>
            </VStack>
          )}

          {/* Action Buttons */}
          <VStack space={2}>
            <Button
              size="sm"
              bg={color.info}
              borderRadius={8}
              _pressed={{ bg: color.light }}
              onPress={() => {
                toast('info', 'Download Result', 'This feature will be available soon.');
              }}
            >
              <Text color="white" fontSize="xs" fontWeight="600">
                📥 Download Result
              </Text>
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </Collapse>
  </Box>
  );
};

// Helper components
const DetailRow = ({ label, value, bold }) => (
  <HStack justifyContent="space-between" alignItems="center">
    <Text fontSize="xs" color={color.text}>
      {label || 'N/A'}
    </Text>
    <Text 
      fontSize="xs" 
      fontWeight={bold ? "600" : "400"} 
      color={bold ? color.primary : color.text}
    >
      {value || 'N/A'}
    </Text>
  </HStack>
);

const CourseResultRow = ({ course, isEven }) => (
  <HStack 
    bg={isEven ? color.secondaryBackground : 'transparent'} 
    p={2} 
    borderBottomWidth={1} 
    borderColor={color.light}
  >
    <Text w={16} textAlign="center" fontSize="2xs" fontWeight="500">
      {course.courseCode}
    </Text>
    <Text w={32} fontSize="2xs" numberOfLines={2}>
      {course.courseTitle}
    </Text>
    <Text w={12} textAlign="center" fontSize="2xs">
      {course.courseCredit}
    </Text>
    <Text w={12} textAlign="center" fontSize="2xs" fontWeight="500" color={
      course.letterGrade === 'F' ? color.error : color.success
    }>
      {course.letterGrade || 'N/A'}
    </Text>
    <Text w={12} textAlign="center" fontSize="2xs" fontWeight="500">
      {course.gradePoint || '0'}
    </Text>
  </HStack>
);

const LoadingSkeleton = () => (
  <VStack space={2} p={3}>
    {[...Array(3)].map((_, index) => (
      <Box key={index} bg={color.background} p={4} borderRadius={8} borderWidth={1} borderColor={color.light}>
        <VStack space={3}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1} space={1}>
              <Skeleton.Text lines={1} w="80%" />
              <Skeleton.Text lines={1} w="30%" />
            </VStack>
            <Skeleton w={4} h={4} borderRadius={2} />
          </HStack>
          <HStack space={2}>
            <Skeleton w={12} h={4} borderRadius={8} />
            <Skeleton w={16} h={4} borderRadius={8} />
          </HStack>
          <HStack justifyContent="space-between">
            <VStack space={1}>
              <Skeleton.Text lines={1} w={12} />
              <Skeleton.Text lines={1} w={16} />
            </VStack>
            <VStack space={1} alignItems="flex-end">
              <Skeleton.Text lines={1} w={8} />
              <Skeleton.Text lines={1} w={12} />
            </VStack>
          </HStack>
        </VStack>
      </Box>
    ))}
  </VStack>
);

const Result = ({navigation}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const toggleCard = (index) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await getAllResults();
      
      if (response.success && response.data) {
        setResults(response.data);
        if (response.data.length === 0) {
          setErrorMessage('📊 No result data available at the moment.');
        }
      } else {
        setErrorMessage(response.message || 'Failed to load result data.');
        setResults([]);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      setErrorMessage('An unexpected error occurred.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: color.secondaryBackground}}>
      <AppBar title="Result" />
      <VStack w={'100%'} flex={1} bg={color.secondaryBackground}>
        {loading ? (
          <LoadingSkeleton />
        ) : results && results.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={1} py={3}>
              {results.map((result, index) => (
                <ResultCard
                  key={result.id || index}
                  result={result}
                  isExpanded={expandedCards.has(index)}
                  onToggle={() => toggleCard(index)}
                />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center" p={6}>
            <Text 
              color={color.secondary} 
              fontSize="sm" 
              textAlign="center" 
              lineHeight={20}
            >
              {errorMessage}
            </Text>
            <Button
              mt={4}
              size="sm"
              variant="outline"
              borderColor={color.primary}
              _text={{ color: color.primary }}
              onPress={() => {
                loadResults();
              }}
            >
              🔄 Try Again
            </Button>
          </Box>
        )}
      </VStack>
    </View>
  );
};

export default Result;
