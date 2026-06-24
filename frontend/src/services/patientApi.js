import { api } from './api';

export const patientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: (params) => ({
        url: '/patients',
        method: 'GET',
        params
      }),
      providesTags: ['Patient']
    }),
    getPatientById: builder.query({
      query: (id) => `/patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }]
    }),
    getPatientProfile: builder.query({
      query: () => '/patients/profile',
      providesTags: ['Patient']
    }),
    updatePatientProfile: builder.mutation({
      query: ({ id, ...body }) => ({
        url: id ? `/patients/${id}` : '/patients/profile',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Patient', 'AdminStats']
    }),
    deletePatient: builder.mutation({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Patient', 'AdminStats']
    }),
    togglePatientStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/patients/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Patient']
    })
  })
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
  useDeletePatientMutation,
  useTogglePatientStatusMutation
} = patientApi;
