import { useState } from 'react';
import { ScrollView, Platform, Alert, Image } from 'react-native';
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
import { AiToyRecognitionResponse, CreateToyData } from '@my-app/types';
import { PremiumBanner } from '@/components/PremiumBanner';

export default function ScanToyScreen() {
  const { recognizeToyFromPhoto } = useFirebaseFunctions();
  const { addNewToy, isPaidUser } = useToyRotator();
  const router = useRouter();

  useScreenTracking('ScanToy');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AiToyRecognitionResponse | null>(null);
  const [saving, setSaving] = useState(false);
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

  const handleScan = async () => {
    if (!imageBase64) {
      setError('Please select or take a photo first');
      return;
    }

    setScanning(true);
    setError('');
    setResult(null);

    try {
      const response = await recognizeToyFromPhoto(imageBase64);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message || 'Recognition failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to recognize toy';
      setError(errorMsg);
    } finally {
      setScanning(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const toyData: CreateToyData = {
        name: result.name,
        category: result.category,
        skillTags: result.skillTags || [],
        ageRange: result.ageRange,
        source: 'ai',
      };
      await addNewToy(toyData);

      const msg = `"${result.name}" added to your toy library!`;
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Toy Added!', msg);
      }
      router.back();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add toy';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const confidenceLabel = (c: number) => {
    if (c >= 0.8) return { text: 'High confidence', color: '#22c55e' };
    if (c >= 0.5) return { text: 'Medium confidence', color: '#eab308' };
    return { text: 'Low confidence', color: '#ef4444' };
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan Toy',
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
                bg="$violet100"
                $dark-bg="$violet900"
                justifyContent="center"
                alignItems="center"
              >
                <FontAwesome name="magic" size={36} color="#8b5cf6" />
              </Box>
              <Heading size="lg" textAlign="center" color="$textLight900" $dark-color="$textDark50">
                Scan a Toy
              </Heading>
              <Text size="sm" color="$textLight500" $dark-color="$textDark400" textAlign="center">
                Take a photo of a toy and our AI will identify it, suggest a category,
                and recommend skill tags.
              </Text>
            </VStack>

            {/* Photo Source Buttons */}
            <HStack space="md">
              <Pressable onPress={takePhoto} flex={1} disabled={scanning || saving}>
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
              <Pressable onPress={pickImage} flex={1} disabled={scanning || saving}>
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

            {/* Scan Button */}
            {imageBase64 && !result && (
              <Button
                size="lg"
                onPress={handleScan}
                isDisabled={scanning}
                bg="$violet500"
                $dark-bg="$violet600"
                borderRadius="$xl"
              >
                {scanning ? (
                  <HStack space="sm" alignItems="center">
                    <Spinner size="small" color="$white" />
                    <ButtonText>Identifying Toy...</ButtonText>
                  </HStack>
                ) : (
                  <HStack space="sm" alignItems="center">
                    <FontAwesome name="search" size={16} color="#fff" />
                    <ButtonText>Identify Toy</ButtonText>
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

            {/* Result */}
            {result && (
              <VStack space="lg">
                <Divider />

                {/* Recognition Card */}
                <Box
                  bg="$backgroundLight50"
                  $dark-bg="$backgroundDark800"
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight200"
                  $dark-borderColor="$borderDark700"
                  p="$5"
                >
                  <VStack space="md">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Heading size="lg" color="$textLight900" $dark-color="$textDark50">
                        {result.name}
                      </Heading>
                      <Box
                        px="$2"
                        py="$0.5"
                        borderRadius="$full"
                        bg={`${confidenceLabel(result.confidence).color}20` as any}
                      >
                        <Text
                          size="2xs"
                          fontWeight="$bold"
                          color={confidenceLabel(result.confidence).color as any}
                        >
                          {confidenceLabel(result.confidence).text}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Category */}
                    <HStack space="sm" alignItems="center">
                      <FontAwesome name="tag" size={14} color="#3b82f6" />
                      <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                        {result.category}
                      </Text>
                    </HStack>

                    {/* Skill Tags */}
                    {result.skillTags && result.skillTags.length > 0 && (
                      <VStack space="xs">
                        <Text size="xs" fontWeight="$bold" color="$textLight500" $dark-color="$textDark500">
                          Skill Tags
                        </Text>
                        <HStack flexWrap="wrap" space="xs">
                          {result.skillTags.map((tag) => (
                            <Box
                              key={tag}
                              bg="$primary50"
                              $dark-bg="$primary900"
                              px="$2"
                              py="$0.5"
                              borderRadius="$full"
                              mb="$1"
                            >
                              <Text size="2xs" color="$primary600" $dark-color="$primary300">
                                {tag}
                              </Text>
                            </Box>
                          ))}
                        </HStack>
                      </VStack>
                    )}

                    {/* Age Range */}
                    {result.ageRange && (
                      <HStack space="sm" alignItems="center">
                        <FontAwesome name="child" size={14} color="#10b981" />
                        <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                          Age: {Math.floor(result.ageRange.minMonths / 12)}
                          {result.ageRange.minMonths % 12 > 0 ? `+` : ''}
                          {' - '}
                          {Math.floor(result.ageRange.maxMonths / 12)}
                          {result.ageRange.maxMonths % 12 > 0 ? `+` : ''} years
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                {/* Action Buttons */}
                <Button
                  size="lg"
                  onPress={handleAddToLibrary}
                  isDisabled={saving}
                  bg="$primary500"
                  $dark-bg="$primary600"
                  borderRadius="$xl"
                >
                  <ButtonText>
                    {saving ? 'Adding...' : 'Add to Toy Library'}
                  </ButtonText>
                </Button>

                <HStack space="md">
                  <Button
                    size="md"
                    variant="outline"
                    flex={1}
                    onPress={() => {
                      // Go to add-toy with pre-filled data
                      router.push(`/add-toy?name=${encodeURIComponent(result.name)}&category=${encodeURIComponent(result.category)}` as any);
                    }}
                    isDisabled={saving}
                  >
                    <ButtonText>Edit & Add</ButtonText>
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    flex={1}
                    onPress={() => {
                      setResult(null);
                      setImageUri(null);
                      setImageBase64(null);
                    }}
                    isDisabled={saving}
                  >
                    <ButtonText>Scan Another</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Subscription Note */}
            {!isPaidUser && (
              <PremiumBanner
                title="Want More Scans?"
                description="Free tier has limited scans per month. Upgrade for unlimited AI features!"
                buttonLabel="Upgrade"
              />
            )}
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
}
