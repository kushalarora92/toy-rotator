import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { useFirebaseFunctions } from '@/hooks/useFirebaseFunctions';
import { useAnalytics, useScreenTracking } from '@/hooks/useAnalytics';
import DeleteAccountModal from '@/components/DeleteAccountModal';

export default function ProfileScreen() {
  const { user, userProfile, profileLoading, refreshProfile, logout } = useAuth();
  const { updateUserProfile, scheduleAccountDeletion } = useFirebaseFunctions();
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Track screen view
  useScreenTracking('Profile');

  // Helper function for consistent tracking
  const trackProfileAction = (action: string, params?: Record<string, any>) => {
    trackEvent('profile_action', {
      action,
      screen: 'Profile',
      ...params,
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await scheduleAccountDeletion();
      trackProfileAction('delete_account_confirmed', {
        deletion_date: result.data?.deletionDate,
      });

      const successMessage = `Account deletion scheduled for ${result.data?.deletionDate}. You have 30 days to cancel by signing in again.`;
      if (Platform.OS === 'web') {
        alert(successMessage);
      } else {
        Alert.alert('Account Deletion Scheduled', successMessage);
      }

      // Refresh profile to pick up deletion status
      await refreshProfile();
    } catch (error: any) {
      trackProfileAction('delete_account_error', {
        error: error.message,
      });
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleEditPress = () => {
    setEditedName(userProfile?.displayName || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      const message = 'Please enter a valid name';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: editedName.trim(),
        status: 'active', // Keep status active
      });

      await refreshProfile();

      const successMessage = 'Profile updated successfully!';
      if (Platform.OS === 'web') {
        alert(successMessage);
      } else {
        Alert.alert('Success', successMessage);
      }

      setIsEditing(false);
      setEditedName('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Profile</Text>
        
        {/* Display Name Section */}
        {!isEditing ? (
          <View style={styles.infoBox}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Name</Text>
              <TouchableOpacity
                onPress={handleEditPress}
                disabled={profileLoading}
                style={styles.editIcon}
              >
                <FontAwesome name="pencil" size={14} color="#666" style={styles.pencilIcon} />
              </TouchableOpacity>
            </View>
            <Text style={styles.value}>
              {profileLoading ? 'Loading...' : (userProfile?.displayName || 'Not set')}
            </Text>
          </View>
        ) : (
          <View style={styles.editSection}>
            <Text style={styles.label}>Edit Name</Text>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              autoFocus
              editable={!isSaving}
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Email Section */}
        <View style={styles.infoBox}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        {/* Account Management Section */}
        <View style={styles.accountManagementSection}>
          <Text style={styles.accountManagementTitle}>Account Management</Text>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={styles.accountManagementItem}
            onPress={() => {
              trackProfileAction('legal_link_click', { page: 'privacy' });
              if (Platform.OS === 'web') {
                window.open('/privacy', '_blank');
              } else {
                router.push('/privacy');
              }
            }}
          >
            <FontAwesome name="shield" size={18} color="#64748b" />
            <Text style={styles.accountManagementLabel}>Privacy Policy</Text>
            <FontAwesome name="chevron-right" size={14} color="#94a3b8" />
          </TouchableOpacity>

          {/* Terms of Service */}
          <TouchableOpacity
            style={styles.accountManagementItem}
            onPress={() => {
              trackProfileAction('legal_link_click', { page: 'terms' });
              if (Platform.OS === 'web') {
                window.open('/terms', '_blank');
              } else {
                router.push('/terms');
              }
            }}
          >
            <FontAwesome name="file-text" size={18} color="#64748b" />
            <Text style={styles.accountManagementLabel}>Terms of Service</Text>
            <FontAwesome name="chevron-right" size={14} color="#94a3b8" />
          </TouchableOpacity>

          {/* Support & Help */}
          <TouchableOpacity
            style={[styles.accountManagementItem, styles.accountManagementItemLast]}
            onPress={() => {
              trackProfileAction('legal_link_click', { page: 'support' });
              router.push('/support' as any);
            }}
          >
            <FontAwesome name="question-circle" size={18} color="#64748b" />
            <Text style={styles.accountManagementLabel}>Support & Help</Text>
            <FontAwesome name="chevron-right" size={14} color="#94a3b8" />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              trackProfileAction('logout_button_click');
              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout().catch(() => {
                    alert('Failed to logout');
                  });
                }
              } else {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await logout();
                        } catch (error) {
                          Alert.alert('Error', 'Failed to logout');
                        }
                      }
                    },
                  ]
                );
              }
            }}
          >
            <FontAwesome name="sign-out" size={18} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={() => {
              trackProfileAction('delete_account_button_click');
              setShowDeleteModal(true);
            }}
          >
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        userEmail={user?.email || ''}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  editIcon: {
    marginLeft: 8,
    padding: 4,
  },
  pencilIcon: {
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
  },
  editSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '90%',
    alignSelf: 'center',
  },
  accountManagementSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  accountManagementTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1e293b',
  },
  accountManagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  accountManagementItemLast: {
    borderBottomWidth: 0,
  },
  accountManagementLabel: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  deleteAccountButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});
