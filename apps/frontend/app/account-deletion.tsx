import React from 'react';
import { ScrollView } from 'react-native';
import { Box, VStack, Text, Heading } from '@gluestack-ui/themed';
import DeletionScheduledBanner from '@/components/DeletionScheduledBanner';
import { useAuth } from '@/context/AuthContext';
import WebContainer from '@/components/WebContainer';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AccountDeletionScreen() {
  const { userProfile } = useAuth();

  return (
    <WebContainer>
      <ScrollView style={{ flex: 1 }}>
        <Box flex={1} bg="$background" px="$5" py="$6">
          <VStack space="lg" maxWidth={600} alignSelf="center" width="100%">
            {/* Header */}
            <VStack space="sm">
              <Box alignItems="center" mb="$2">
                <Box
                  bg="$error100"
                  $dark-bg="$error900"
                  p="$4"
                  borderRadius="$full"
                >
                  <FontAwesome name="exclamation-triangle" size={32} color="#ef4444" />
                </Box>
              </Box>
              <Heading size="xl" textAlign="center">
                Account Scheduled for Deletion
              </Heading>
              <Text
                size="md"
                color="$textLight600"
                $dark-color="$textDark400"
                textAlign="center"
              >
                Your account is scheduled to be permanently deleted.
                You can cancel this request below.
              </Text>
            </VStack>

            {userProfile?.deletionExecutionDate && (
              <DeletionScheduledBanner deletionDate={userProfile.deletionExecutionDate} />
            )}

            {/* What happens next */}
            <Box
              bg="$backgroundLight100"
              $dark-bg="$backgroundDark800"
              p="$4"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderLight200"
              $dark-borderColor="$borderDark700"
            >
              <VStack space="md">
                <Heading size="md">What happens next?</Heading>
                <VStack space="sm">
                  <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                    • Your account will be deleted on the scheduled date
                  </Text>
                  <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                    • All your data — toys, rotations, children, and household — will be permanently removed
                  </Text>
                  <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                    • You can cancel anytime before the deletion date
                  </Text>
                  <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                    • After cancellation, you'll regain full access to your account
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </ScrollView>
    </WebContainer>
  );
}
