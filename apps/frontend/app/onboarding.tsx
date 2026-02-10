import { useState, useRef } from 'react';
import { Dimensions, Platform, FlatList, ViewToken } from 'react-native';
import { router, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Pressable,
} from '@gluestack-ui/themed';
import { useAuth } from '@/context/AuthContext';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import { useScreenTracking } from '@/hooks/useAnalytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  iconColor: string;
  title: string;
  description: string;
  bgAccent: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'puzzle-piece',
    iconColor: '#f59e0b',
    title: 'Too Many Toys?',
    description:
      'Kids get overwhelmed when all toys are out at once. Research shows fewer choices leads to deeper, more creative play.',
    bgAccent: '$warning100',
  },
  {
    id: '2',
    icon: 'refresh',
    iconColor: '#3b82f6',
    title: 'Rotate, Don\'t Toss',
    description:
      'Toy rotation keeps a small set of toys out while the rest "rest." When rotated back, old toys feel brand new again!',
    bgAccent: '$info100',
  },
  {
    id: '3',
    icon: 'child',
    iconColor: '#10b981',
    title: 'Tailored to Your Kids',
    description:
      'Add your children\'s ages and interests. ToyRotator suggests the perfect mix of toys for their developmental stage.',
    bgAccent: '$success100',
  },
  {
    id: '4',
    icon: 'magic',
    iconColor: '#8b5cf6',
    title: 'AI-Powered Suggestions',
    description:
      'Let our AI pick the next rotation based on age, interests, and past engagement. Or go manual — you\'re in control!',
    bgAccent: '$violet200',
  },
  {
    id: '5',
    icon: 'rocket',
    iconColor: '#ec4899',
    title: 'Ready to Start?',
    description:
      'Add your first child, catalog your toys, and create your first rotation. Less clutter, more play!',
    bgAccent: '$rose100',
  },
];

export default function OnboardingScreen() {
  const { refreshProfile } = useAuth();
  const { updateUserProfile } = useFirebaseFunctions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useScreenTracking('Onboarding');

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await updateUserProfile({ onboardingCompleted: true });
      await refreshProfile();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still navigate even if save fails
      router.replace('/(tabs)');
    } finally {
      setCompleting(false);
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <Box width={SCREEN_WIDTH > 500 ? 500 : SCREEN_WIDTH} px="$6" justifyContent="center" alignItems="center">
      <VStack space="xl" alignItems="center" maxWidth={400}>
        {/* Icon circle */}
        <Box
          width={120}
          height={120}
          borderRadius={60}
          bg="$backgroundLight100"
          $dark-bg="$backgroundDark800"
          justifyContent="center"
          alignItems="center"
          mb="$4"
        >
          <FontAwesome name={item.icon} size={56} color={item.iconColor} />
        </Box>

        <Heading size="2xl" textAlign="center" color="$textLight900" $dark-color="$textDark50">
          {item.title}
        </Heading>

        <Text
          size="lg"
          textAlign="center"
          color="$textLight600"
          $dark-color="$textDark400"
          lineHeight={28}
        >
          {item.description}
        </Text>
      </VStack>
    </Box>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box flex={1} bg="$background" pt={Platform.OS === 'ios' ? '$16' : '$8'} pb="$4">
        {/* Skip button */}
        {!isLastSlide && (
          <Box position="absolute" top={Platform.OS === 'ios' ? 60 : 20} right={20} zIndex={10}>
            <Pressable onPress={handleSkip} p="$2">
              <Text size="md" color="$primary500" fontWeight="$semibold">
                Skip
              </Text>
            </Pressable>
          </Box>
        )}

        {/* Slides */}
        <Box flex={1} justifyContent="center" alignItems="center">
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            contentContainerStyle={{
              alignItems: 'center',
            }}
            snapToInterval={SCREEN_WIDTH > 500 ? 500 : SCREEN_WIDTH}
            decelerationRate="fast"
          />
        </Box>

        {/* Bottom controls */}
        <VStack space="lg" px="$6" pb="$4">
          {/* Dot indicators */}
          <HStack space="sm" justifyContent="center" alignItems="center">
            {SLIDES.map((_, index) => (
              <Box
                key={index}
                width={currentIndex === index ? 24 : 8}
                height={8}
                borderRadius={4}
                bg={currentIndex === index ? '$primary500' : '$backgroundLight300'}
                $dark-bg={currentIndex === index ? '$primary400' : '$backgroundDark600'}
              />
            ))}
          </HStack>

          {/* Action button */}
          <Button
            size="xl"
            onPress={handleNext}
            isDisabled={completing}
            bg="$primary500"
            $dark-bg="$primary600"
            borderRadius="$xl"
          >
            <ButtonText size="lg" fontWeight="$bold">
              {completing
                ? 'Getting started...'
                : isLastSlide
                ? "Let's Go!"
                : 'Next'}
            </ButtonText>
            {!isLastSlide && !completing && (
              <Box ml="$2">
                <FontAwesome name="arrow-right" size={16} color="#fff" />
              </Box>
            )}
          </Button>
        </VStack>
      </Box>
    </>
  );
}
