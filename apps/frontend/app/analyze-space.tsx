import { useState } from 'react';
import { ScrollView, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Pressable,
  Divider,
  Spinner,
} from '@gluestack-ui/themed';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import { useToyRotator } from '@/context/ToyRotatorContext';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { AiSpaceAnalysisResponse } from '@my-app/types';
import { Image } from 'react-native';
import { PremiumBanner } from '@/components/PremiumBanner';

export default function AnalyzeSpaceScreen() {
  const { analyzeSpace } = useFirebaseFunctions();
  const { isPaidUser } = useToyRotator();
  const router = useRouter();

  useScreenTracking('AnalyzeSpace');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AiSpaceAnalysisResponse | null>(null);
  const [error, setError] = useState('');

  const pickImage = async () => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        const msg = 'Camera roll access is required to select a photo';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Permission Required', msg);
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
        allowsMultipleSelection: false,
      });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 || null);
        setResult(null);
        setError('');
      }
    } catch (err: any) {
      console.error('Image picker error:', err);
    }
  };

  const takePhoto = async () => {
    try {
      const permResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permResult.granted) {
        const msg = 'Camera access is required to take a photo';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Permission Required', msg);
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 || null);
        setResult(null);
        setError('');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Please select or take a photo first');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const response = await analyzeSpace(imageBase64);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message || 'Analysis failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to analyze space';
      setError(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Space Analysis',
          headerShown: true,
          presentation: 'card',
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <Box px="$5" py="$6">
          <VStack space="xl" maxWidth={500} mx="auto" width="$full">
            {/* Header */}
            <VStack space="sm" alignItems="center">
              <Box
                width={80}
                height={80}
                borderRadius={40}
                bg="$info100"
                $dark-bg="$info900"
                justifyContent="center"
                alignItems="center"
              >
                <FontAwesome name="camera" size={36} color="#3b82f6" />
              </Box>
              <Heading size="lg" textAlign="center" color="$textLight900" $dark-color="$textDark50">
                Analyze Your Play Space
              </Heading>
              <Text size="sm" color="$textLight500" $dark-color="$textDark400" textAlign="center">
                Take a photo of your child's play area and get personalized suggestions
                for toy display and organization.
              </Text>
            </VStack>

            {/* Photo Source Buttons */}
            <HStack space="md">
              <Pressable onPress={takePhoto} flex={1} disabled={analyzing}>
                <Box
                  bg="$backgroundLight100"
                  $dark-bg="$backgroundDark800"
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight200"
                  $dark-borderColor="$borderDark700"
                  p="$4"
                  alignItems="center"
                >
                  <VStack space="sm" alignItems="center">
                    <FontAwesome name="camera" size={24} color="#3b82f6" />
                    <Text size="sm" fontWeight="$bold" color="$textLight700" $dark-color="$textDark300">
                      Take Photo
                    </Text>
                  </VStack>
                </Box>
              </Pressable>
              <Pressable onPress={pickImage} flex={1} disabled={analyzing}>
                <Box
                  bg="$backgroundLight100"
                  $dark-bg="$backgroundDark800"
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight200"
                  $dark-borderColor="$borderDark700"
                  p="$4"
                  alignItems="center"
                >
                  <VStack space="sm" alignItems="center">
                    <FontAwesome name="picture-o" size={24} color="#8b5cf6" />
                    <Text size="sm" fontWeight="$bold" color="$textLight700" $dark-color="$textDark300">
                      Choose Photo
                    </Text>
                  </VStack>
                </Box>
              </Pressable>
            </HStack>

            {/* Image Preview */}
            {imageUri && (
              <Box borderRadius="$xl" overflow="hidden" borderWidth={1} borderColor="$borderLight200" $dark-borderColor="$borderDark700">
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: 250 }}
                  resizeMode="cover"
                />
              </Box>
            )}

            {/* Analyze Button */}
            {imageBase64 && !result && (
              <Button
                size="lg"
                onPress={handleAnalyze}
                isDisabled={analyzing}
                bg="$primary500"
                $dark-bg="$primary600"
                borderRadius="$xl"
              >
                {analyzing ? (
                  <HStack space="sm" alignItems="center">
                    <Spinner size="small" color="$white" />
                    <ButtonText>Analyzing...</ButtonText>
                  </HStack>
                ) : (
                  <HStack space="sm" alignItems="center">
                    <FontAwesome name="magic" size={16} color="#fff" />
                    <ButtonText>Analyze Space</ButtonText>
                  </HStack>
                )}
              </Button>
            )}

            {/* Error */}
            {error && (
              <Box bg="$error50" $dark-bg="$error900" p="$4" borderRadius="$lg">
                <HStack space="sm" alignItems="center">
                  <FontAwesome name="exclamation-circle" size={16} color="#ef4444" />
                  <Text size="sm" color="$error700" $dark-color="$error300" flex={1}>
                    {error}
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Results */}
            {result && (
              <VStack space="lg">
                <Divider />

                <VStack space="sm">
                  <HStack space="sm" alignItems="center">
                    <FontAwesome name="lightbulb-o" size={18} color="#f59e0b" />
                    <Heading size="md" color="$textLight900" $dark-color="$textDark50">
                      Observations
                    </Heading>
                  </HStack>
                  {result.observations.map((obs, i) => (
                    <HStack key={i} space="sm" alignItems="flex-start">
                      <Box mt="$1">
                        <FontAwesome name="check-circle" size={14} color="#22c55e" />
                      </Box>
                      <Text size="sm" color="$textLight700" $dark-color="$textDark300" flex={1}>
                        {obs}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                {result.insights && (
                  <Box
                    bg="$info50"
                    $dark-bg="$backgroundDark800"
                    p="$4"
                    borderRadius="$lg"
                    borderWidth={1}
                    borderColor="$info200"
                    $dark-borderColor="$info800"
                  >
                    <VStack space="sm">
                      <Text size="xs" fontWeight="$bold" color="$info700" $dark-color="$info300">
                        AI Insights
                      </Text>
                      <Text size="sm" color="$textLight700" $dark-color="$textDark300" lineHeight={22}>
                        {result.insights}
                      </Text>
                    </VStack>
                  </Box>
                )}

                {result.displayCapacitySuggestion && (
                  <Box
                    bg="$success50"
                    $dark-bg="$backgroundDark800"
                    p="$4"
                    borderRadius="$lg"
                    borderWidth={1}
                    borderColor="$success200"
                    $dark-borderColor="$success800"
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        width={48}
                        height={48}
                        borderRadius={24}
                        bg="$success100"
                        $dark-bg="$success800"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text size="xl" fontWeight="$bold" color="$success700">
                          {result.displayCapacitySuggestion}
                        </Text>
                      </Box>
                      <VStack flex={1}>
                        <Text size="sm" fontWeight="$bold" color="$success700" $dark-color="$success300">
                          Suggested Display Count
                        </Text>
                        <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                          Based on your space, we recommend displaying about {result.displayCapacitySuggestion} toys at a time
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {!isPaidUser && (
                  <PremiumBanner
                    title="Get Deeper Insights"
                    description="Upgrade for AI-powered recommendations tailored to your specific play space"
                    buttonLabel="Upgrade"
                  />
                )}

                {/* Analyze Again */}
                <Button
                  size="md"
                  variant="outline"
                  onPress={() => {
                    setResult(null);
                    setImageUri(null);
                    setImageBase64(null);
                  }}
                >
                  <HStack space="sm" alignItems="center">
                    <FontAwesome name="refresh" size={14} color="#3b82f6" />
                    <ButtonText>Analyze Another Space</ButtonText>
                  </HStack>
                </Button>
              </VStack>
            )}

            {/* Tips */}
            {!result && (
              <Box
                bg="$backgroundLight100"
                $dark-bg="$backgroundDark800"
                p="$4"
                borderRadius="$xl"
              >
                <VStack space="sm">
                  <Text size="sm" fontWeight="$bold" color="$textLight700" $dark-color="$textDark300">
                    Tips for best results:
                  </Text>
                  <HStack space="sm" alignItems="flex-start">
                    <FontAwesome name="check" size={12} color="#22c55e" />
                    <Text size="xs" color="$textLight500" $dark-color="$textDark400" flex={1}>
                      Capture the full play area in one shot
                    </Text>
                  </HStack>
                  <HStack space="sm" alignItems="flex-start">
                    <FontAwesome name="check" size={12} color="#22c55e" />
                    <Text size="xs" color="$textLight500" $dark-color="$textDark400" flex={1}>
                      Include shelves, bins, and display surfaces
                    </Text>
                  </HStack>
                  <HStack space="sm" alignItems="flex-start">
                    <FontAwesome name="check" size={12} color="#22c55e" />
                    <Text size="xs" color="$textLight500" $dark-color="$textDark400" flex={1}>
                      Good lighting helps get better analysis
                    </Text>
                  </HStack>
                  <HStack space="sm" alignItems="flex-start">
                    <FontAwesome name="check" size={12} color="#22c55e" />
                    <Text size="xs" color="$textLight500" $dark-color="$textDark400" flex={1}>
                      Show the space as it normally looks (no need to tidy up!)
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
}
