import { useState } from 'react';
import { Platform, Alert, ScrollView, Linking } from 'react-native';
import { router, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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
  HStack,
  Divider,
} from '@gluestack-ui/themed';
import { useAuth } from '@/context/AuthContext';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { AuthBranding } from '@/components/AuthBranding';

export default function ProfileSetupScreen() {
  const { refreshProfile, user } = useAuth();
  const { updateUserProfile, addChildProfile } = useFirebaseFunctions();

  // Step 1: name + privacy
  const [displayName, setDisplayName] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Step 2: first child (optional)
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  useScreenTracking('Profile Setup');

  const handleStep1 = () => {
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!agreedToPrivacy) {
      const msg = 'Please agree to the Terms of Service and Privacy Policy';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Required', msg);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Save profile
      await updateUserProfile({
        displayName: displayName.trim(),
        status: 'active',
      });

      // Add first child if provided
      if (childName.trim()) {
        const dob = childDob || new Date().toISOString().split('T')[0];
        if (childDob && !/^\d{4}-\d{2}-\d{2}$/.test(childDob)) {
          setError('Date format should be YYYY-MM-DD');
          setLoading(false);
          return;
        }
        try {
          await addChildProfile({
            name: childName.trim(),
            dateOfBirth: dob,
          });
        } catch (childErr: any) {
          console.warn('Failed to add child during setup:', childErr);
          // Don't block profile completion
        }
      }

      await refreshProfile();

      if (Platform.OS === 'web') alert('Profile setup complete!');
      else Alert.alert('Success', 'Profile setup complete!');

      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update profile';
      setError(errorMsg);
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Error', errorMsg);
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
            <AuthBranding />

            {step === 1 && (
              <>
                <VStack space="sm">
                  <Heading size="xl" color="$textLight900" $dark-color="$textDark50">
                    Welcome to ToyRotator
                  </Heading>
                  <Text size="md" color="$textLight600" $dark-color="$textDark400">
                    Let's get you set up
                  </Text>
                </VStack>

                {/* Signed in as */}
                <Box bg="$backgroundLight100" $dark-bg="$backgroundDark800" p="$3" borderRadius="$md">
                  <Text size="sm" color="$textLight500" $dark-color="$textDark500">Signed in as:</Text>
                  <Text size="md" color="$textLight900" $dark-color="$textDark50" bold>{user?.email}</Text>
                </Box>

                {/* Name */}
                <FormControl isInvalid={!!error} isRequired>
                  <FormControlLabel>
                    <FormControlLabelText>Your Name</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      placeholder="Enter your full name"
                      value={displayName}
                      onChangeText={(t: string) => { setDisplayName(t); setError(''); }}
                      autoFocus
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </Input>
                  {error ? (
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>{error}</FormControlErrorText>
                    </FormControlError>
                  ) : null}
                </FormControl>

                {/* Privacy */}
                <VStack 
                  space="md" 
                  bg="$backgroundLight100" $dark-bg="$backgroundDark800"
                  p="$4" borderRadius="$lg" 
                  borderWidth={1} borderColor="$borderLight200" $dark-borderColor="$borderDark700"
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
                        I agree to the{' '}
                        <Text 
                          color="$primary500" fontWeight="$bold"
                          onPress={() => {
                            if (Platform.OS === 'web') window.open('/terms', '_blank');
                            else router.push('/terms' as any);
                          }}
                          style={{ textDecorationLine: 'underline' }}
                        >Terms of Service</Text>
                        {' and '}
                        <Text 
                          color="$primary500" fontWeight="$bold"
                          onPress={() => {
                            if (Platform.OS === 'web') window.open('/privacy', '_blank');
                            else router.push('/privacy' as any);
                          }}
                          style={{ textDecorationLine: 'underline' }}
                        >Privacy Policy</Text>.
                      </Text>
                    </CheckboxLabel>
                  </Checkbox>
                </VStack>

                <Button
                  size="lg"
                  onPress={handleStep1}
                  isDisabled={!displayName.trim() || !agreedToPrivacy}
                  bg="$primary500" $dark-bg="$primary600"
                >
                  <ButtonText>Next</ButtonText>
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <VStack space="sm">
                  <Heading size="xl" color="$textLight900" $dark-color="$textDark50">
                    Add Your First Child
                  </Heading>
                  <Text size="md" color="$textLight600" $dark-color="$textDark400">
                    Optional — you can add children later in Profile
                  </Text>
                </VStack>

                <VStack space="lg">
                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText>Child's Name</FormControlLabelText>
                    </FormControlLabel>
                    <Input>
                      <InputField
                        placeholder="e.g. Emma"
                        value={childName}
                        onChangeText={setChildName}
                        autoFocus
                        autoCapitalize="words"
                        editable={!loading}
                      />
                    </Input>
                  </FormControl>

                  <FormControl isInvalid={!!error && error.includes('Date')}>
                    <FormControlLabel>
                      <FormControlLabelText>Date of Birth</FormControlLabelText>
                    </FormControlLabel>
                    <Input>
                      <InputField
                        placeholder="YYYY-MM-DD"
                        value={childDob}
                        onChangeText={setChildDob}
                        keyboardType="numbers-and-punctuation"
                        editable={!loading}
                      />
                    </Input>
                    {error && error.includes('Date') ? (
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>{error}</FormControlErrorText>
                      </FormControlError>
                    ) : null}
                  </FormControl>
                </VStack>

                <HStack space="md">
                  <Button flex={1} variant="outline" onPress={() => setStep(1)} isDisabled={loading}>
                    <ButtonText>Back</ButtonText>
                  </Button>
                  <Button
                    flex={1}
                    size="lg"
                    onPress={handleComplete}
                    isDisabled={loading}
                    bg="$primary500" $dark-bg="$primary600"
                  >
                    <ButtonText>
                      {loading ? 'Setting up...' : childName.trim() ? 'Complete' : 'Skip & Finish'}
                    </ButtonText>
                  </Button>
                </HStack>

                <Text size="xs" color="$textLight500" $dark-color="$textDark500" textAlign="center">
                  You can always add more children later
                </Text>
              </>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
}
