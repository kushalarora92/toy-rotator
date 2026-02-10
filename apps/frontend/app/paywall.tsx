import React, { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
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
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSubscription } from '@/context/SubscriptionContext';
import { PurchasesPackage } from 'react-native-purchases';

const FEATURES = [
  {
    icon: 'magic' as const,
    title: 'AI Toy Recognition',
    description: 'Scan toys with your camera and auto-add them to your library',
  },
  {
    icon: 'lightbulb-o' as const,
    title: 'Smart Rotation Suggestions',
    description: 'AI-powered rotation ideas based on your child\'s preferences',
  },
  {
    icon: 'home' as const,
    title: 'Space Analysis',
    description: 'Analyze your play space for organization tips and capacity',
  },
  {
    icon: 'child' as const,
    title: 'Unlimited Children',
    description: 'Add and manage profiles for all your kids',
  },
  {
    icon: 'cubes' as const,
    title: 'Unlimited Toys',
    description: 'No limits on your toy library size',
  },
  {
    icon: 'users' as const,
    title: 'Caregiver Collaboration',
    description: 'Invite partners, grandparents, or nannies to your household',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { currentOffering, purchasePackage, restorePurchases, isLoading } = useSubscription();
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select the first package
  React.useEffect(() => {
    if (currentOffering?.availablePackages?.length && !selectedPackage) {
      // Prefer annual, fall back to first
      const annual = currentOffering.availablePackages.find(
        (p) => p.packageType === 'ANNUAL'
      );
      setSelectedPackage(annual || currentOffering.availablePackages[0]);
    }
  }, [currentOffering, selectedPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsPurchasing(true);
    setError(null);

    try {
      const success = await purchasePackage(selectedPackage);
      if (success) {
        router.back();
      }
    } catch (err: any) {
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    setError(null);

    try {
      const success = await restorePurchases();
      if (success) {
        router.back();
      } else {
        setError('No previous purchases found.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not restore purchases.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <Box flex={1} bg="$backgroundDark950" justifyContent="center" alignItems="center" p="$6">
        <VStack space="md" alignItems="center">
          <FontAwesome name="star" size={48} color="#FFD700" />
          <Heading size="xl" color="$textLight0" textAlign="center">
            Premium Available on Mobile
          </Heading>
          <Text color="$textLight400" textAlign="center">
            Download ToyRotator on iOS or Android to subscribe to Premium.
          </Text>
          <Button mt="$4" onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundDark950">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack p="$5" space="lg">
          {/* Header */}
          <VStack alignItems="center" space="sm" pt="$4">
            <Box
              bg="$amber500"
              p="$4"
              borderRadius="$full"
              mb="$2"
            >
              <FontAwesome name="star" size={32} color="#fff" />
            </Box>
            <Heading size="2xl" color="$textLight0" textAlign="center">
              Unlock Premium
            </Heading>
            <Text color="$textLight400" textAlign="center" fontSize="$md">
              Get the most out of ToyRotator with AI-powered features
            </Text>
          </VStack>

          {/* Features */}
          <VStack space="md" mt="$2">
            {FEATURES.map((feature, index) => (
              <HStack key={index} space="md" alignItems="flex-start">
                <Box
                  bg="$primary600"
                  p="$2"
                  borderRadius="$lg"
                  w={40}
                  h={40}
                  alignItems="center"
                  justifyContent="center"
                >
                  <FontAwesome name={feature.icon} size={18} color="#fff" />
                </Box>
                <VStack flex={1}>
                  <Text color="$textLight0" fontWeight="$bold" fontSize="$sm">
                    {feature.title}
                  </Text>
                  <Text color="$textLight400" fontSize="$xs">
                    {feature.description}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>

          <Divider my="$2" bg="$borderDark700" />

          {/* Package Selection */}
          {isLoading ? (
            <Box py="$8" alignItems="center">
              <Spinner size="large" color="$primary500" />
              <Text color="$textLight400" mt="$2">Loading plans...</Text>
            </Box>
          ) : currentOffering?.availablePackages?.length ? (
            <VStack space="sm">
              <Heading size="sm" color="$textLight0" textAlign="center" mb="$1">
                Choose Your Plan
              </Heading>
              {currentOffering.availablePackages.map((pkg) => {
                const isSelected = selectedPackage?.identifier === pkg.identifier;
                const isAnnual = pkg.packageType === 'ANNUAL';

                return (
                  <Pressable
                    key={pkg.identifier}
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    <Box
                      borderWidth={2}
                      borderColor={isSelected ? '$primary500' : '$borderDark700'}
                      borderRadius="$xl"
                      p="$4"
                      bg={isSelected ? '$primary950' : '$backgroundDark900'}
                      position="relative"
                    >
                      {isAnnual && (
                        <Box
                          position="absolute"
                          top={-10}
                          right={16}
                          bg="$amber500"
                          px="$2"
                          py="$0.5"
                          borderRadius="$full"
                        >
                          <Text fontSize="$2xs" fontWeight="$bold" color="$white">
                            BEST VALUE
                          </Text>
                        </Box>
                      )}
                      <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                          <Text
                            color="$textLight0"
                            fontWeight="$bold"
                            fontSize="$md"
                          >
                            {pkg.product.title}
                          </Text>
                          <Text color="$textLight400" fontSize="$xs">
                            {pkg.product.description}
                          </Text>
                        </VStack>
                        <VStack alignItems="flex-end">
                          <Text
                            color={isSelected ? '$primary400' : '$textLight0'}
                            fontWeight="$bold"
                            fontSize="$lg"
                          >
                            {pkg.product.priceString}
                          </Text>
                          <Text color="$textLight500" fontSize="$2xs">
                            {isAnnual ? '/year' : '/month'}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </Pressable>
                );
              })}
            </VStack>
          ) : (
            <Box py="$4" alignItems="center">
              <Text color="$textLight400" textAlign="center">
                Plans are not available right now. Please try again later.
              </Text>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Box bg="$error100" p="$3" borderRadius="$lg">
              <Text color="$error700" textAlign="center" fontSize="$sm">
                {error}
              </Text>
            </Box>
          )}

          {/* Purchase Button */}
          <Button
            size="xl"
            bg="$primary500"
            borderRadius="$xl"
            onPress={handlePurchase}
            isDisabled={!selectedPackage || isPurchasing}
            opacity={!selectedPackage || isPurchasing ? 0.6 : 1}
          >
            {isPurchasing ? (
              <Spinner size="small" color="$white" />
            ) : (
              <ButtonText fontWeight="$bold" fontSize="$md">
                Subscribe Now
              </ButtonText>
            )}
          </Button>

          {/* Restore */}
          <Button variant="link" onPress={handleRestore} isDisabled={isPurchasing}>
            <ButtonText color="$textLight400" fontSize="$sm">
              Restore Purchases
            </ButtonText>
          </Button>

          {/* Terms */}
          <Text color="$textLight600" fontSize="$2xs" textAlign="center" px="$4">
            Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account.
            Subscription auto-renews unless canceled at least 24 hours before the end of the current period.
            Manage subscriptions in your device settings.
          </Text>

          {/* Close */}
          <Button
            variant="outline"
            borderColor="$borderDark700"
            borderRadius="$xl"
            onPress={() => router.back()}
          >
            <ButtonText color="$textLight400">Maybe Later</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
}
