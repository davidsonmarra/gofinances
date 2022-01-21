import 'jest-fetch-mock';

import { renderHook, act } from '@testing-library/react-hooks';
import { mocked } from 'jest-mock';
import { startAsync } from 'expo-auth-session';
import fetchMock from 'jest-fetch-mock';
import { AuthProvider, useAuth } from './auth';

jest.mock('expo-auth-session');
fetchMock.enableMocks();

describe('Auth Hook', () => {
  it('should be able to sign in with Google account existing', async () => {
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'success',
      params: {
        access_token: 'any_token'
      }
    });
    fetchMock.mockResponseOnce(JSON.stringify({
      id: 'any_id',
      email: 'davidsonmarra@gmail.com',
      name: 'Davidson',
      photo: 'any_photo'
    }));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    await act(() => result.current.signInWithGoogle());
    expect(result.current.user.email).toBe('davidsonmarra@gmail.com');
  });
});