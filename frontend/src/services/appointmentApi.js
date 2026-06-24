import { api } from './api';

export const appointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: (params) => ({
        url: '/appointments',
        method: 'GET',
        params
      }),
      providesTags: ['Appointment']
    }),
    getAppointmentById: builder.query({
      query: (id) => `/appointments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Appointment', id }]
    }),
    bookAppointment: builder.mutation({
      query: (bookingData) => ({
        url: '/appointments',
        method: 'POST',
        body: bookingData
      }),
      invalidatesTags: ['Appointment', 'AdminStats']
    }),
    updateAppointmentStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/appointments/${id}/status`,
        method: 'PUT',
        body: { status, reason }
      }),
      invalidatesTags: ['Appointment', 'AdminStats']
    }),
    updateConsultationNotes: builder.mutation({
      query: ({ id, consultationNotes }) => ({
        url: `/appointments/${id}/notes`,
        method: 'PUT',
        body: { consultationNotes }
      }),
      invalidatesTags: ['Appointment']
    }),
    rescheduleAppointment: builder.mutation({
      query: ({ id, appointmentDate, timeSlot }) => ({
        url: `/appointments/${id}/reschedule`,
        method: 'PUT',
        body: { appointmentDate, timeSlot }
      }),
      invalidatesTags: ['Appointment']
    })
  })
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useBookAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useUpdateConsultationNotesMutation,
  useRescheduleAppointmentMutation
} = appointmentApi;
