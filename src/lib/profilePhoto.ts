import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const PROFILE_PHOTO_KEY = "hypa_profile_photo_v1";

type ProfilePhotoState = {
  clearProfilePhoto: () => Promise<void>;
  error: string | null;
  isSaving: boolean;
  pickProfilePhoto: () => Promise<void>;
  profilePhotoUri: string | null;
};

export function useProfilePhoto(): ProfilePhotoState {
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const storedUri = await SecureStore.getItemAsync(PROFILE_PHOTO_KEY);
        setProfilePhotoUri(storedUri);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load your profile photo.",
        );
      }
    })();
  }, []);

  const pickProfilePhoto = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const ImagePicker = await import("expo-image-picker");
      const FileSystem = await import("expo-file-system/legacy");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        throw new Error("Photo library access is needed to set a profile photo.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const documentDirectory = FileSystem.documentDirectory;

      if (!documentDirectory) {
        throw new Error("Device storage is unavailable for profile photos.");
      }

      const rawExtension = asset.uri.split(".").pop()?.split("?")[0]?.toLowerCase();
      const extension = rawExtension && rawExtension.length <= 5 ? rawExtension : "jpg";
      const nextUri = `${documentDirectory}hypa-profile-photo.${extension}`;

      if (profilePhotoUri && profilePhotoUri !== nextUri) {
        await FileSystem.deleteAsync(profilePhotoUri, { idempotent: true }).catch(() => undefined);
      }

      if (asset.uri !== nextUri) {
        await FileSystem.deleteAsync(nextUri, { idempotent: true }).catch(() => undefined);
        await FileSystem.copyAsync({ from: asset.uri, to: nextUri });
      }

      await SecureStore.setItemAsync(PROFILE_PHOTO_KEY, nextUri);
      setProfilePhotoUri(nextUri);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update your profile photo.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [profilePhotoUri]);

  const clearProfilePhoto = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const FileSystem = await import("expo-file-system/legacy");
      if (profilePhotoUri) {
        await FileSystem.deleteAsync(profilePhotoUri, { idempotent: true }).catch(() => undefined);
      }

      await SecureStore.deleteItemAsync(PROFILE_PHOTO_KEY);
      setProfilePhotoUri(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to remove your profile photo.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [profilePhotoUri]);

  return {
    clearProfilePhoto,
    error,
    isSaving,
    pickProfilePhoto,
    profilePhotoUri,
  };
}
