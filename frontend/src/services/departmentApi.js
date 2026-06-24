import { api } from './api';

export const departmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => '/departments',
      providesTags: ['Department']
    }),
    getDepartmentById: builder.query({
      query: (id) => `/departments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Department', id }]
    }),
    createDepartment: builder.mutation({
      query: (deptData) => ({
        url: '/departments',
        method: 'POST',
        body: deptData
      }),
      invalidatesTags: ['Department']
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Department']
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Department']
    })
  })
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation
} = departmentApi;
