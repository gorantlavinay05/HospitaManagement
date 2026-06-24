import { api } from './api';

export const doctorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query({
      query: (params) => ({
        url: '/doctors',
        method: 'GET',
        params
      }),
      providesTags: ['Doctor']
    }),
    getDoctorById: builder.query({
      query: (id) => `/doctors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Doctor', id }]
    }),
    getDoctorProfile: builder.query({
      query: () => '/doctors/profile',
      providesTags: ['Doctor']
    }),
    createDoctor: builder.mutation({
      query: (doctorData) => ({
        url: '/doctors',
        method: 'POST',
        body: doctorData
      }),
      invalidatesTags: ['Doctor', 'AdminStats']
    }),
    updateDoctorProfile: builder.mutation({
      query: ({ id, ...body }) => ({
        url: id ? `/doctors/${id}` : '/doctors/profile',
        method: 'PUT',
        body
      }),
      invalidatesTags: (result, error, { id }) => ['Doctor', 'AdminStats']
    }),
    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Doctor', 'AdminStats']
    }),
    toggleDoctorStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/doctors/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Doctor']
    })
  })
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useGetDoctorProfileQuery,
  useCreateDoctorMutation,
  useUpdateDoctorProfileMutation,
  useDeleteDoctorMutation,
  useToggleDoctorStatusMutation
} = doctorApi;
