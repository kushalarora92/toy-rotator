import { useState } from 'react';
import { Platform, Alert, ScrollView, Linking } from 'react-native';
import { router, Stack } from 'expo-router';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  ButtonText,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  AlertCircleIcon,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckIcon,
} from '@gluestack-ui/themed';
import { useAuth } from '@/context/AuthContext';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { AuthBranding } from '@/components/AuthBranding';

export default function ProfileSetupScreen() {
  const { refreshProfile, user } = useAuth();
  const { updateUserProfile } = useFirebaseFunctions();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Track screen view
  useScreenTracking('Profile Setup');

  const handleSubmit = async () => {
    // Validate input
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!agreedToPrivacy) {
      const message = 'Please agree to the Terms of Service and Privacy Policy to continue';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Required', message);
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update profile with active status
      await updateUserProfile({
        displayName: displayName.trim(),
        status: 'active',
      });

      // Refresh profile to update AuthContext
      await refreshProfile();

      // Show success message
      if (Platform.OS === 'web') {
        alert('Profile setup complete! Welcome aboard!');
      } else {
        Alert.alert('Success', 'Profile setup complete! Welcome aboard!');
      }

      // Navigation will happen automatically via root layout checking needsProfileSetup
      router.replace('/(tabs)');
      
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMessage = err.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Complete Your Profile',
          headerBackVisible: false,
        }} 
      />
      <ScrollView style={{ flex: 1 }}>
        <Box flex={1} px="$6" py="$8" justifyContent="center">
          <VStack space="xl" maxWidth={400} width="$full" mx="auto">
            {/* Branding */}
            <AuthBranding />

            {/* Header */}
            <VStack space="sm">
              <Heading size="xl" color="$textLight900" $dark-color="$textDark50">
                Complete Your Profile
              </Heading>
              <Text size="md" color="$textLight600" $dark-color="$textDark400">
                We need a bit more information to get you started
              </Text>
            </VStack>

            {/* User Email Display */}
            <Box 
              bg="$backgroundLight100" 
              $dark-bg="$backgroundDark800" 
              p="$3" 
              borderRadius="$md"
            >
              <Text size="sm" color="$textLight500" $dark-color="$textDark500">
                Signed in as:
              </Text>
              <Text size="md" color="$textLight900" $dark-color="$textDark50" bold>
                {user?.email}
              </Text>
            </Box>

            {/* Form */}
            <VStack space="lg">
              <FormControl isInvalid={!!error} isRequired>
                <FormControlLabel>
                  <FormControlLabelText>Display Name</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    placeholder="Enter your full name"
                    value={displayName}
                    onChangeText={(text: string) => {
                      setDisplayName(text);
                      setError(''); // Clear error on input
                    }}
                    autoFocus
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </Input>
                {error && (
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>{error}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Privacy Policy Agreement */}
              <VStack 
                space="md" 
                bg="$backgroundLight100" 
                $dark-bg="$backgroundDark800"
                p="$4" 
                borderRadius="$lg" 
                borderWidth={1} 
                borderColor="$borderLight200"
                $dark-borderColor="$borderDark700"
              >
                <Checkbox 
                  value="agreed" 
                  isChecked={agreedToPrivacy}
                  onChange={setAgreedToPrivacy}
                  size="md"
                >
                  <CheckboxIndicator mr="$2">
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel flex={1}>
                    <Text size="sm">
                      I have read and agree to the{' '}
                      <Text 
                        color="$primary500" 
                        fontWeight="$bold"
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            window.open('/terms', '_blank');
                          } else {
                            router.push('/terms' as any);
                          }
                        }}
                        style={{ textDecorationLine: 'underline' }}
                      >
                        Terms of Service
                      </Text>
                      {' and '}
                      <Text 
                        color="$primary500" 
                        fontWeight="$bold"
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            window.open('/privacy', '_blank');
                          } else {
                            router.push('/privacy' as any);
                          }
                        }}
                        style={{ textDecorationLine: 'underline' }}
                      >
                        Privacy Policy
                      </Text>
                      .
                    </Text>
                  </CheckboxLabel>
                </Checkbox>
              </VStack>

              <Button
                size="lg"
                onPress={handleSubmit}
                isDisabled={loading || !displayName.trim() || !agreedToPrivacy}
                bg="$primary500"
                $dark-bg="$primary600"
                opacity={!agreedToPrivacy ? 0.5 : 1}
              >
                <ButtonText>
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </ButtonText>
              </Button>
            </VStack>

            {/* Help Text */}
            <Text 
              size="xs" 
              color="$textLight500" 
              $dark-color="$textDark500"
              textAlign="center"
            >
              You can update this information later in your profile settings
            </Text>
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
}
