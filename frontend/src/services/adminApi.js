import { api } from './api';

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats']
    }),
    getActivityLogs: builder.query({
      query: () => '/admin/logs',
      providesTags: ['AdminStats']
    })
  })
});

export const {
  useGetAdminStatsQuery,
  useGetActivityLogsQuery
} = adminApi;
