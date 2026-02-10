import { useState, useCallback } from 'react';
import { ScrollView, Platform, Alert, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
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
  Input,
  InputField,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';

import { useAuth } from '@/context/AuthContext';
import { useToyRotator } from '@/context/ToyRotatorContext';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import { useAnalytics, useScreenTracking } from '@/hooks/useAnalytics';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import { ChildProfile } from '@my-app/types';

export default function ProfileScreen() {
  const { user, userProfile, profileLoading, refreshProfile, logout } = useAuth();
  const {
    children,
    childrenLoading,
    refreshChildren,
    addChild,
    removeChild,
    household,
    householdLoading,
    refreshHousehold,
  } = useToyRotator();
  const { updateUserProfile, scheduleAccountDeletion, inviteCaregiver } = useFirebaseFunctions();
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  useScreenTracking('Profile');

  // Edit name state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add child state
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [addingChild, setAddingChild] = useState(false);

  // Invite caregiver state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isLoading = profileLoading || childrenLoading || householdLoading;

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshProfile(), refreshChildren(), refreshHousehold()]);
  }, [refreshProfile, refreshChildren, refreshHousehold]);

  // ---- Name editing ----
  const handleEditPress = () => {
    setEditedName(userProfile?.displayName || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) return;
    setIsSaving(true);
    try {
      await updateUserProfile({ displayName: editedName.trim(), status: 'active' });
      await refreshProfile();
      setIsEditing(false);
    } catch (err: any) {
      const msg = err.message || 'Failed to update';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Add child ----
  const handleAddChild = async () => {
    if (!childName.trim()) {
      const msg = 'Please enter a name';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Required', msg);
      return;
    }
    // Simple date validation: YYYY-MM-DD
    if (childDob && !/^\d{4}-\d{2}-\d{2}$/.test(childDob)) {
      const msg = 'Date format: YYYY-MM-DD';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Invalid Date', msg);
      return;
    }

    setAddingChild(true);
    try {
      await addChild({
        name: childName.trim(),
        dateOfBirth: childDob || new Date().toISOString().split('T')[0],
      });
      setChildName('');
      setChildDob('');
      setShowAddChild(false);
    } catch (err: any) {
      const msg = err.message || 'Failed to add child';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setAddingChild(false);
    }
  };

  const handleRemoveChild = (child: ChildProfile) => {
    const doRemove = async () => {
      try {
        await removeChild(child.id);
      } catch (err: any) {
        const msg = err.message || 'Failed to remove';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${child.name}? This can't be undone.`)) doRemove();
    } else {
      Alert.alert('Remove Child?', `Remove ${child.name}? This can't be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: doRemove },
      ]);
    }
  };

  // ---- Invite caregiver ----
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await inviteCaregiver({ email: inviteEmail.trim() });
      const msg = `Invitation sent to ${inviteEmail.trim()}`;
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Sent!', msg);
      setInviteEmail('');
      setShowInvite(false);
      await refreshHousehold();
    } catch (err: any) {
      const msg = err.message || 'Failed to invite';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setInviting(false);
    }
  };

  // ---- Delete account ----
  const handleDeleteAccount = async () => {
    try {
      await scheduleAccountDeletion();
      const msg = 'Account deletion scheduled. You have 30 days to cancel by signing in again.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Scheduled', msg);
      await refreshProfile();
    } catch (error: any) {
      throw error;
    }
  };

  // ---- Logout ----
  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await logout();
      } catch {
        const msg = 'Failed to logout';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) doLogout();
    } else {
      Alert.alert('Logout', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <Box p="$5" pb="$10">
        <VStack space="lg" maxWidth={500} mx="auto" width="$full">
          <Heading size="2xl" color="$textLight900" $dark-color="$textDark50">
            Profile
          </Heading>

          {/* ===== User Info ===== */}
          <Box
            bg="$backgroundLight50"
            $dark-bg="$backgroundDark800"
            borderRadius="$xl"
            borderWidth={1}
            borderColor="$borderLight200"
            $dark-borderColor="$borderDark700"
            p="$4"
          >
            <VStack space="md">
              {/* Name */}
              {!isEditing ? (
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text size="xs" color="$textLight500" $dark-color="$textDark400">Name</Text>
                    <Text size="lg" fontWeight="$bold" color="$textLight900" $dark-color="$textDark50">
                      {profileLoading ? 'Loading...' : userProfile?.displayName || 'Not set'}
                    </Text>
                  </VStack>
                  <Pressable onPress={handleEditPress} p="$2">
                    <FontAwesome name="pencil" size={16} color="#64748b" />
                  </Pressable>
                </HStack>
              ) : (
                <VStack space="sm">
                  <Text size="xs" color="$textLight500">Edit Name</Text>
                  <Input>
                    <InputField
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Your name"
                      autoFocus
                      editable={!isSaving}
                    />
                  </Input>
                  <HStack space="sm">
                    <Button
                      flex={1}
                      variant="outline"
                      onPress={() => setIsEditing(false)}
                      isDisabled={isSaving}
                    >
                      <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button
                      flex={1}
                      bg="$primary500"
                      onPress={handleSaveProfile}
                      isDisabled={isSaving || !editedName.trim()}
                    >
                      <ButtonText>{isSaving ? 'Saving...' : 'Save'}</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              )}

              <Divider />

              {/* Email */}
              <VStack>
                <Text size="xs" color="$textLight500" $dark-color="$textDark400">Email</Text>
                <Text size="md" color="$textLight900" $dark-color="$textDark50">
                  {user?.email}
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* ===== Children ===== */}
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md" color="$textLight900" $dark-color="$textDark50">
                Children
              </Heading>
              <Pressable onPress={() => setShowAddChild(!showAddChild)} p="$1">
                <HStack space="xs" alignItems="center">
                  <FontAwesome name={showAddChild ? 'times' : 'plus'} size={14} color="#3b82f6" />
                  <Text size="sm" color="$primary500" fontWeight="$semibold">
                    {showAddChild ? 'Cancel' : 'Add'}
                  </Text>
                </HStack>
              </Pressable>
            </HStack>

            {/* Add child form */}
            {showAddChild && (
              <Box
                bg="$backgroundLight50"
                $dark-bg="$backgroundDark800"
                borderRadius="$xl"
                borderWidth={1}
                borderColor="$primary200"
                $dark-borderColor="$primary700"
                p="$4"
              >
                <VStack space="md">
                  <Input>
                    <InputField
                      placeholder="Child's name"
                      value={childName}
                      onChangeText={setChildName}
                      autoFocus
                      editable={!addingChild}
                    />
                  </Input>
                  <Input>
                    <InputField
                      placeholder="Date of birth (YYYY-MM-DD)"
                      value={childDob}
                      onChangeText={setChildDob}
                      editable={!addingChild}
                      keyboardType="numbers-and-punctuation"
                    />
                  </Input>
                  <Button
                    bg="$primary500"
                    onPress={handleAddChild}
                    isDisabled={addingChild || !childName.trim()}
                  >
                    <ButtonText>{addingChild ? 'Adding...' : 'Add Child'}</ButtonText>
                  </Button>
                </VStack>
              </Box>
            )}

            {/* Children list */}
            {children.length === 0 && !childrenLoading && (
              <Box
                bg="$backgroundLight100"
                $dark-bg="$backgroundDark800"
                p="$5"
                borderRadius="$xl"
                alignItems="center"
              >
                <VStack space="sm" alignItems="center">
                  <FontAwesome name="child" size={32} color="#94a3b8" />
                  <Text size="sm" color="$textLight500" textAlign="center">
                    No children added yet. Add one to get started!
                  </Text>
                </VStack>
              </Box>
            )}

            {children.map((child) => {
              const age = getAge(child.dateOfBirth);
              return (
                <Box
                  key={child.id}
                  bg="$backgroundLight50"
                  $dark-bg="$backgroundDark800"
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight200"
                  $dark-borderColor="$borderDark700"
                  p="$4"
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="md" alignItems="center">
                      <Box
                        width={40}
                        height={40}
                        borderRadius={20}
                        bg="$primary100"
                        $dark-bg="$primary800"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <FontAwesome name="child" size={18} color="#3b82f6" />
                      </Box>
                      <VStack>
                        <Text
                          size="md"
                          fontWeight="$bold"
                          color="$textLight900"
                          $dark-color="$textDark50"
                        >
                          {child.name}
                        </Text>
                        <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                          {age}
                        </Text>
                      </VStack>
                    </HStack>
                    <Pressable onPress={() => handleRemoveChild(child)} p="$2">
                      <FontAwesome name="trash-o" size={16} color="#ef4444" />
                    </Pressable>
                  </HStack>
                </Box>
              );
            })}
          </VStack>

          {/* ===== Household / Caregivers ===== */}
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md" color="$textLight900" $dark-color="$textDark50">
                Caregivers
              </Heading>
              <Pressable onPress={() => setShowInvite(!showInvite)} p="$1">
                <HStack space="xs" alignItems="center">
                  <FontAwesome name={showInvite ? 'times' : 'user-plus'} size={14} color="#3b82f6" />
                  <Text size="sm" color="$primary500" fontWeight="$semibold">
                    {showInvite ? 'Cancel' : 'Invite'}
                  </Text>
                </HStack>
              </Pressable>
            </HStack>

            {showInvite && (
              <Box
                bg="$backgroundLight50"
                $dark-bg="$backgroundDark800"
                borderRadius="$xl"
                borderWidth={1}
                borderColor="$primary200"
                $dark-borderColor="$primary700"
                p="$4"
              >
                <VStack space="md">
                  <Text size="sm" color="$textLight600" $dark-color="$textDark400">
                    Invite a caregiver to share your toy library
                  </Text>
                  <Input>
                    <InputField
                      placeholder="Caregiver's email"
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                      autoFocus
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!inviting}
                    />
                  </Input>
                  <Button
                    bg="$primary500"
                    onPress={handleInvite}
                    isDisabled={inviting || !inviteEmail.trim()}
                  >
                    <ButtonText>{inviting ? 'Sending...' : 'Send Invite'}</ButtonText>
                  </Button>
                </VStack>
              </Box>
            )}

            {/* Members list */}
            {household?.members && household.members.length > 0 ? (
              household.members.map((member) => (
                <Box
                  key={member.uid}
                  bg="$backgroundLight50"
                  $dark-bg="$backgroundDark800"
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight200"
                  $dark-borderColor="$borderDark700"
                  p="$4"
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="md" alignItems="center">
                      <Box
                        width={36}
                        height={36}
                        borderRadius={18}
                        bg="$backgroundLight200"
                        $dark-bg="$backgroundDark700"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <FontAwesome name="user" size={14} color="#64748b" />
                      </Box>
                      <VStack>
                        <Text size="sm" fontWeight="$medium" color="$textLight900" $dark-color="$textDark50">
                          {member.displayName || member.email}
                        </Text>
                        <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                          {member.role === 'owner' ? 'Owner' : 'Caregiver'}
                        </Text>
                      </VStack>
                    </HStack>
                    {member.inviteStatus === 'pending' && (
                      <Badge bg="$warning100" borderRadius="$full" px="$2" py="$0.5">
                        <BadgeText color="$warning700" size="2xs">Pending</BadgeText>
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ))
            ) : (
              <Box
                bg="$backgroundLight100"
                $dark-bg="$backgroundDark800"
                p="$4"
                borderRadius="$xl"
                alignItems="center"
              >
                <Text size="sm" color="$textLight500" textAlign="center">
                  No other caregivers yet. Invite someone to share!
                </Text>
              </Box>
            )}
          </VStack>

          <Divider />

          {/* ===== Account Management ===== */}
          <VStack space="sm">
            <Heading size="md" color="$textLight900" $dark-color="$textDark50">
              Settings
            </Heading>

            <SettingsItem
              icon="shield"
              label="Privacy Policy"
              onPress={() => {
                if (Platform.OS === 'web') window.open('/privacy', '_blank');
                else router.push('/privacy');
              }}
            />
            <SettingsItem
              icon="file-text"
              label="Terms of Service"
              onPress={() => {
                if (Platform.OS === 'web') window.open('/terms', '_blank');
                else router.push('/terms');
              }}
            />
            <SettingsItem
              icon="question-circle"
              label="Support & Help"
              onPress={() => router.push('/support' as any)}
            />

            {/* Logout */}
            <Button
              size="lg"
              bg="$error600"
              onPress={handleLogout}
              mt="$2"
            >
              <HStack space="sm" alignItems="center">
                <FontAwesome name="sign-out" size={16} color="#fff" />
                <ButtonText>Logout</ButtonText>
              </HStack>
            </Button>

            {/* Delete Account */}
            <Button
              size="sm"
              variant="link"
              onPress={() => setShowDeleteModal(true)}
              mt="$2"
            >
              <ButtonText color="$error400" size="sm">Delete Account</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        userEmail={user?.email || ''}
      />
    </ScrollView>
  );
}

function SettingsItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Box
        bg="$backgroundLight50"
        $dark-bg="$backgroundDark800"
        borderRadius="$xl"
        borderWidth={1}
        borderColor="$borderLight200"
        $dark-borderColor="$borderDark700"
        px="$4"
        py="$3.5"
      >
        <HStack space="md" alignItems="center">
          <FontAwesome name={icon} size={16} color="#64748b" />
          <Text flex={1} size="md" color="$textLight700" $dark-color="$textDark300">
            {label}
          </Text>
          <FontAwesome name="chevron-right" size={12} color="#94a3b8" />
        </HStack>
      </Box>
    </Pressable>
  );
}

/** Compute human-readable age from ISO date string */
function getAge(dob: string): string {
  try {
    const birth = new Date(dob);
    const now = new Date();
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} old`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return `${years} year${years !== 1 ? 's' : ''} old`;
    return `${years}y ${rem}m old`;
  } catch {
    return '';
  }
}
