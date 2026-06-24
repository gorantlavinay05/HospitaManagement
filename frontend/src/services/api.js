import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logOut, setCredentials } from '../redux/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new access token using refresh token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: {} // refresh token is sent via httpOnly cookies
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const user = api.getState().auth.user;
      const accessToken = refreshResult.data.data.accessToken;
      
      // Store new access token
      api.dispatch(setCredentials({ user, accessToken }));

      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Doctor', 'Patient', 'Appointment', 'Department', 'Notification', 'AdminStats'],
  endpoints: () => ({})
});
