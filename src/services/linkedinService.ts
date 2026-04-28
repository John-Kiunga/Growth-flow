import { db, auth } from '../lib/firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export async function saveLinkedInToken(token: string) {
  if (!auth.currentUser) return;

  try {
    const userSettingsRef = doc(db, 'user_settings', auth.currentUser.uid);
    await setDoc(userSettingsRef, {
      linkedin_connected: true,
      linkedin_token: token,
      linkedin_updated_at: new Date().toISOString()
    }, { merge: true });
    
    toast.success('LinkedIn account linked successfully!');
  } catch (error) {
    console.error('Error saving LinkedIn token:', error);
    toast.error('Failed to link LinkedIn account');
  }
}

export function setupLinkedInListener() {
  const handleMessage = (event: MessageEvent) => {
    // Basic origin check
    if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
      return;
    }

    if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
      saveLinkedInToken(event.data.accessToken);
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
  
  try {
    const userSettingsRef = doc(db, 'user_settings', auth.currentUser.uid);
    const docSnap = await getDoc(userSettingsRef);
    return docSnap.exists() && docSnap.data().linkedin_connected === true;
  } catch (error) {
    return false;
  }
}
