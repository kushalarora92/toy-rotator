import { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, Platform, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
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
import { EngagementLevel, Toy, Feedback } from '@my-app/types';

const ENGAGEMENT_OPTIONS: {
  value: EngagementLevel;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}[] = [
  { value: 'liked', label: 'Liked', icon: 'thumbs-up', color: '#22c55e' },
  { value: 'neutral', label: 'Neutral', icon: 'minus-circle', color: '#eab308' },
  { value: 'ignored', label: 'Ignored', icon: 'thumbs-down', color: '#ef4444' },
];

export default function RotationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    rotations,
    toys,
    selectedChild,
    submitFeedback,
  } = useToyRotator();
  const { getFeedback } = useFirebaseFunctions();
  const router = useRouter();

  useScreenTracking('RotationDetail');

  const rotation = useMemo(
    () => rotations.find((r) => r.id === id),
    [id, rotations]
  );

  const rotationToys = useMemo(() => {
    if (!rotation) return [];
    return rotation.toyIds
      .map((tid) => toys.find((t) => t.id === tid))
      .filter(Boolean) as Toy[];
  }, [rotation, toys]);

  // Feedback state
  const [feedbackMap, setFeedbackMap] = useState<Record<string, EngagementLevel>>({});
  const [existingFeedback, setExistingFeedback] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Load existing feedback
  useEffect(() => {
    if (!rotation || !selectedChild) return;
    (async () => {
      setFeedbackLoading(true);
      try {
        const result = await getFeedback({ rotationId: rotation.id });
        const data = result.data || [];
        setExistingFeedback(data);
        const map: Record<string, EngagementLevel> = {};
        data.forEach((f: Feedback) => {
          map[f.toyId] = f.engagement;
        });
        setFeedbackMap(map);
      } catch {
        // ignore
      } finally {
        setFeedbackLoading(false);
      }
    })();
  }, [rotation?.id, selectedChild?.id]);

  const handleFeedback = useCallback(
    async (toyId: string, engagement: EngagementLevel) => {
      if (!rotation || !selectedChild) return;
      setSubmitting(toyId);
      setFeedbackMap((prev) => ({ ...prev, [toyId]: engagement }));
      try {
        await submitFeedback({
          toyId,
          rotationId: rotation.id,
          childId: selectedChild.id,
          engagement,
        });
      } catch (err: any) {
        // revert on failure
        setFeedbackMap((prev) => {
          const updated = { ...prev };
          delete updated[toyId];
          return updated;
        });
        const msg = err.message || 'Failed to save feedback';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Error', msg);
      } finally {
        setSubmitting(null);
      }
    },
    [rotation, selectedChild, submitFeedback]
  );

  if (!rotation) {
    return (
      <>
        <Stack.Screen options={{ title: 'Rotation', headerShown: true }} />
        <Box flex={1} justifyContent="center" alignItems="center" p="$6">
          <VStack space="md" alignItems="center">
            <FontAwesome name="question-circle" size={48} color="#94a3b8" />
            <Heading size="lg">Rotation Not Found</Heading>
            <Button onPress={() => router.back()} bg="$primary500">
              <ButtonText>Go Back</ButtonText>
            </Button>
          </VStack>
        </Box>
      </>
    );
  }

  const startDate = new Date(rotation.startDate);
  const endDate = new Date(rotation.endDate);
  const now = new Date();
  const daysLeft = rotation.isActive
    ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Rotation Detail',
          headerShown: true,
          presentation: 'card',
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <Box px="$5" py="$6">
          <VStack space="lg" maxWidth={500} mx="auto" width="$full">
            {/* Status Header */}
            <Box
              bg={rotation.isActive ? '$primary50' : '$backgroundLight100'}
              $dark-bg={rotation.isActive ? '$primary900' : '$backgroundDark800'}
              borderRadius="$xl"
              p="$5"
            >
              <VStack space="sm" alignItems="center">
                <HStack space="sm" alignItems="center">
                  <FontAwesome
                    name={rotation.source === 'ai' ? 'magic' : 'hand-paper-o'}
                    size={16}
                    color={rotation.source === 'ai' ? '#8b5cf6' : '#3b82f6'}
                  />
                  <Text size="sm" color="$textLight500" $dark-color="$textDark400">
                    {rotation.source === 'ai' ? 'AI Curated' : 'Manual'}
                  </Text>
                </HStack>

                {rotation.isActive ? (
                  <>
                    <Heading size="3xl" color="$primary500">
                      {daysLeft}
                    </Heading>
                    <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                      {daysLeft === 0 ? 'Ends today' : daysLeft === 1 ? 'day remaining' : 'days remaining'}
                    </Text>
                  </>
                ) : (
                  <Badge bg="$backgroundLight200" $dark-bg="$backgroundDark700" borderRadius="$full" px="$3" py="$1">
                    <BadgeText color="$textLight500">Ended</BadgeText>
                  </Badge>
                )}

                <Text size="xs" color="$textLight400" $dark-color="$textDark500">
                  {formatDate(startDate)} — {formatDate(endDate)}
                </Text>
              </VStack>
            </Box>

            {/* Insight */}
            {rotation.insightSummary && (
              <HStack
                space="sm"
                bg="$warning50"
                $dark-bg="$backgroundDark800"
                p="$4"
                borderRadius="$lg"
                alignItems="flex-start"
              >
                <FontAwesome name="lightbulb-o" size={16} color="#f59e0b" />
                <Text size="sm" color="$textLight700" $dark-color="$textDark300" flex={1}>
                  {rotation.insightSummary}
                </Text>
              </HStack>
            )}

            <Divider />

            {/* Toys List with Feedback */}
            <VStack space="sm">
              <Heading size="md" color="$textLight900" $dark-color="$textDark50">
                Toys in this Rotation ({rotationToys.length})
              </Heading>

              {rotation.isActive && (
                <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                  Tap an emoji to log how your child engaged with each toy
                </Text>
              )}

              {rotationToys.map((toy) => (
                <Box
                  key={toy.id}
                  bg="$backgroundLight50"
                  $dark-bg="$backgroundDark800"
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight200"
                  $dark-borderColor="$borderDark700"
                  p="$4"
                >
                  <VStack space="sm">
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack flex={1}>
                        <Text
                          size="md"
                          fontWeight="$bold"
                          color="$textLight900"
                          $dark-color="$textDark50"
                        >
                          {toy.name}
                        </Text>
                        <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                          {toy.category}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Feedback buttons */}
                    {rotation.isActive && (
                      <HStack space="sm" mt="$1">
                        {ENGAGEMENT_OPTIONS.map((opt) => {
                          const isSelected = feedbackMap[toy.id] === opt.value;
                          const isLoading = submitting === toy.id;
                          return (
                            <Pressable
                              key={opt.value}
                              onPress={() => handleFeedback(toy.id, opt.value)}
                              disabled={isLoading}
                              flex={1}
                            >
                              <Box
                                py="$2"
                                borderRadius="$lg"
                                borderWidth={1}
                                borderColor={isSelected ? opt.color : '$borderLight200'}
                                $dark-borderColor={isSelected ? opt.color : '$borderDark700'}
                                bg={isSelected ? `${opt.color}15` : 'transparent'}
                                alignItems="center"
                                opacity={isLoading ? 0.5 : 1}
                              >
                                <FontAwesome
                                  name={opt.icon}
                                  size={16}
                                  color={isSelected ? opt.color : '#94a3b8'}
                                />
                                <Text
                                  size="2xs"
                                  mt="$1"
                                  color={isSelected ? (opt.color as any) : '$textLight500'}
                                >
                                  {opt.label}
                                </Text>
                              </Box>
                            </Pressable>
                          );
                        })}
                      </HStack>
                    )}

                    {/* Show existing feedback for past rotations */}
                    {!rotation.isActive && feedbackMap[toy.id] && (
                      <HStack space="xs" alignItems="center" mt="$1">
                        {(() => {
                          const opt = ENGAGEMENT_OPTIONS.find((o) => o.value === feedbackMap[toy.id]);
                          if (!opt) return null;
                          return (
                            <>
                              <FontAwesome name={opt.icon} size={12} color={opt.color} />
                              <Text size="xs" color={opt.color as any}>
                                {opt.label}
                              </Text>
                            </>
                          );
                        })()}
                      </HStack>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
}
