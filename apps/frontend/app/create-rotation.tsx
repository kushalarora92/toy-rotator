import { useState, useMemo } from 'react';
import { ScrollView, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
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
  Divider,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { useToyRotator } from '@/context/ToyRotatorContext';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { Toy, ROTATION_DURATIONS, RotationDuration } from '@my-app/types';

export default function CreateRotationScreen() {
  const {
    selectedChild,
    toys,
    createNewRotation,
    isPaidUser,
  } = useToyRotator();
  const { getAiRotationSuggestion } = useFirebaseFunctions();
  const router = useRouter();

  useScreenTracking('CreateRotation');

  const [selectedToyIds, setSelectedToyIds] = useState<string[]>([]);
  const [duration, setDuration] = useState<RotationDuration>(
    (selectedChild?.rotationSettings?.durationDays as RotationDuration) || 7
  );
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  // Only non-retired toys
  const availableToys = useMemo(
    () => toys.filter((t) => t.status !== 'retired'),
    [toys]
  );

  // Max display count from child settings
  const maxDisplay = selectedChild?.rotationSettings?.displayCount || 10;

  const toggleToy = (toyId: string) => {
    setSelectedToyIds((prev) => {
      if (prev.includes(toyId)) {
        return prev.filter((id) => id !== toyId);
      }
      if (prev.length >= maxDisplay) {
        const msg = `Maximum ${maxDisplay} toys per rotation`;
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Limit Reached', msg);
        return prev;
      }
      return [...prev, toyId];
    });
  };

  const handleAiSuggest = async () => {
    if (!selectedChild) return;
    setAiLoading(true);
    try {
      const result = await getAiRotationSuggestion({
        childId: selectedChild.id,
      });
      const suggestion = result.data;
      if (suggestion?.toyIds) {
        setSelectedToyIds(suggestion.toyIds.slice(0, maxDisplay));
      }
      if (suggestion?.insightSummary) {
        setAiInsight(suggestion.insightSummary);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'AI suggestion failed';
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedChild) return;
    if (selectedToyIds.length === 0) {
      const msg = 'Please select at least one toy';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Required', msg);
      return;
    }

    setSaving(true);
    try {
      await createNewRotation({
        childId: selectedChild.id,
        toyIds: selectedToyIds,
        durationDays: duration,
        source: aiInsight ? 'ai' : 'manual',
        insightSummary: aiInsight || undefined,
      });

      const msg = 'Rotation created!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Success', msg);
      router.back();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create rotation';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedChild) {
    return (
      <>
        <Stack.Screen options={{ title: 'Create Rotation', headerShown: true }} />
        <Box flex={1} justifyContent="center" alignItems="center" p="$6">
          <VStack space="md" alignItems="center">
            <FontAwesome name="child" size={48} color="#94a3b8" />
            <Heading size="lg" textAlign="center">
              No Child Selected
            </Heading>
            <Text size="sm" color="$textLight500" textAlign="center">
              Go back and select a child from the Dashboard
            </Text>
            <Button onPress={() => router.back()} bg="$primary500" mt="$2">
              <ButtonText>Go Back</ButtonText>
            </Button>
          </VStack>
        </Box>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Rotation for ${selectedChild.name}`,
          headerShown: true,
          presentation: 'card',
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <Box px="$5" py="$6">
          <VStack space="xl" maxWidth={500} mx="auto" width="$full">
            {/* Duration Selector */}
            <VStack space="sm">
              <Text size="sm" fontWeight="$bold" color="$textLight700" $dark-color="$textDark300">
                Duration
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="sm">
                  {ROTATION_DURATIONS.map((d) => {
                    const isSelected = duration === d;
                    const label = d === 1 ? '1 day' : d < 7 ? `${d} days` : d === 7 ? '1 week' : d === 14 ? '2 weeks' : '1 month';
                    return (
                      <Pressable key={d} onPress={() => setDuration(d)}>
                        <Box
                          px="$4"
                          py="$2"
                          borderRadius="$lg"
                          bg={isSelected ? '$primary500' : '$backgroundLight200'}
                          $dark-bg={isSelected ? '$primary600' : '$backgroundDark700'}
                        >
                          <Text
                            size="sm"
                            fontWeight={isSelected ? '$bold' : '$normal'}
                            color={isSelected ? '$white' : '$textLight700'}
                            $dark-color={isSelected ? '$white' : '$textDark300'}
                          >
                            {label}
                          </Text>
                        </Box>
                      </Pressable>
                    );
                  })}
                </HStack>
              </ScrollView>
            </VStack>

            <Divider />

            {/* AI Suggestion Button */}
            <Pressable onPress={handleAiSuggest} disabled={aiLoading || saving}>
              <Box
                bg="$violet50"
                $dark-bg="$violet900"
                borderWidth={1}
                borderColor="$violet200"
                $dark-borderColor="$violet700"
                borderRadius="$xl"
                p="$4"
                opacity={aiLoading ? 0.6 : 1}
              >
                <HStack space="md" alignItems="center">
                  <Box
                    width={40}
                    height={40}
                    borderRadius={20}
                    bg="$violet100"
                    $dark-bg="$violet800"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <FontAwesome name="magic" size={18} color="#8b5cf6" />
                  </Box>
                  <VStack flex={1}>
                    <Text size="md" fontWeight="$bold" color="$violet700" $dark-color="$violet300">
                      {aiLoading ? 'Thinking...' : 'AI Suggest'}
                    </Text>
                    <Text size="xs" color="$violet500" $dark-color="$violet400">
                      {isPaidUser
                        ? 'Get an AI-curated rotation'
                        : 'Free: 1/day limit'}
                    </Text>
                  </VStack>
                  <FontAwesome name="arrow-right" size={14} color="#8b5cf6" />
                </HStack>
              </Box>
            </Pressable>

            {/* AI Insight */}
            {aiInsight && (
              <HStack
                space="sm"
                bg="$violet50"
                $dark-bg="$backgroundDark800"
                p="$3"
                borderRadius="$lg"
                alignItems="flex-start"
              >
                <FontAwesome name="lightbulb-o" size={14} color="#f59e0b" />
                <Text size="xs" color="$textLight600" $dark-color="$textDark400" flex={1}>
                  {aiInsight}
                </Text>
              </HStack>
            )}

            <Divider />

            {/* Toy Selection */}
            <VStack space="sm">
              <HStack justifyContent="space-between" alignItems="center">
                <Text size="sm" fontWeight="$bold" color="$textLight700" $dark-color="$textDark300">
                  Select Toys
                </Text>
                <Text size="xs" color="$textLight500">
                  {selectedToyIds.length}/{maxDisplay}
                </Text>
              </HStack>

              {availableToys.length === 0 && (
                <Box p="$4" alignItems="center">
                  <Text size="sm" color="$textLight500" textAlign="center">
                    No toys available. Add toys first!
                  </Text>
                </Box>
              )}

              {availableToys.map((toy) => {
                const isSelected = selectedToyIds.includes(toy.id);
                return (
                  <Pressable key={toy.id} onPress={() => toggleToy(toy.id)} disabled={saving}>
                    <Box
                      bg={isSelected ? '$primary50' : '$backgroundLight50'}
                      $dark-bg={isSelected ? '$primary900' : '$backgroundDark800'}
                      borderRadius="$lg"
                      borderWidth={1}
                      borderColor={isSelected ? '$primary400' : '$borderLight200'}
                      $dark-borderColor={isSelected ? '$primary600' : '$borderDark700'}
                      p="$3"
                    >
                      <HStack space="md" alignItems="center">
                        <Box
                          width={24}
                          height={24}
                          borderRadius={12}
                          borderWidth={2}
                          borderColor={isSelected ? '$primary500' : '$borderLight300'}
                          $dark-borderColor={isSelected ? '$primary400' : '$borderDark600'}
                          bg={isSelected ? '$primary500' : 'transparent'}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {isSelected && <FontAwesome name="check" size={12} color="#fff" />}
                        </Box>
                        <VStack flex={1}>
                          <Text
                            size="sm"
                            fontWeight="$medium"
                            color="$textLight900"
                            $dark-color="$textDark50"
                          >
                            {toy.name}
                          </Text>
                          <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                            {toy.category}
                            {toy.status === 'resting' ? ' (resting)' : ''}
                          </Text>
                        </VStack>
                        <StatusDot status={toy.status} />
                      </HStack>
                    </Box>
                  </Pressable>
                );
              })}
            </VStack>

            {/* Create Button */}
            <Button
              size="lg"
              onPress={handleCreate}
              isDisabled={saving || selectedToyIds.length === 0}
              bg="$primary500"
              $dark-bg="$primary600"
            >
              <ButtonText>
                {saving ? 'Creating...' : `Create Rotation (${selectedToyIds.length} toys)`}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active' ? '#22c55e' : status === 'resting' ? '#eab308' : '#94a3b8';
  return (
    <Box width={8} height={8} borderRadius={4} bg={color as any} />
  );
}
