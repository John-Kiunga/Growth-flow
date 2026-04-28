import { db, auth } from '../lib/firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function saveLinkedInToken(token: string) {
  if (!auth.currentUser) return;

  const path = `user_settings/${auth.currentUser.uid}`;
  try {
    const userSettingsRef = doc(db, 'user_settings', auth.currentUser.uid);
    await setDoc(userSettingsRef, {
      linkedin_connected: true,
      linkedin_token: token,
      linkedin_updated_at: new Date().toISOString()
    }, { merge: true });
    
    toast.success('LinkedIn account linked successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error('Error saving LinkedIn token:', error);
    toast.error('Failed to link LinkedIn account');
  }
}

export function setupLinkedInListener(onSuccess?: () => void) {
  const handleMessage = (event: MessageEvent) => {
    // Basic origin check
    if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
      return;
    }

    if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
      saveLinkedInToken(event.data.accessToken).then(() => {
        if (onSuccess) onSuccess();
      });
    }

    if (event.data?.type === 'LINKEDIN_AUTH_ERROR') {
      toast.error(`LinkedIn connection failed: ${event.data.error}`);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}

export async function isLinkedInConnected(): Promise<boolean> {
  if (!auth.currentUser) return false;
  
  const path = `user_settings/${auth.currentUser.uid}`;
  try {
    const userSettingsRef = doc(db, 'user_settings', auth.currentUser.uid);
    const docSnap = await getDoc(userSettingsRef);
    return docSnap.exists() && docSnap.data().linkedin_connected === true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return false;
  }
}
