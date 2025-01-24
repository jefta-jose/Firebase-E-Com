import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';

type user = {
    _id: string;
    name: string;
    [key: string]: any; // Add extra fields if necessary
};

export const usersApiSlice = createApi({
    reducerPath: 'usersApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['users'],
    endpoints: (builder) => ({
        // Fetch Products
        getUsers: builder.query<user[], void>({
            async queryFn() {
                try {
                    const usersCollection = collection(db, 'users');
                    const querySnapshot = await getDocs(usersCollection);
                    const users = querySnapshot.docs.map((doc) => ({
                        _id: doc.id,
                        ...doc.data(),
                    })) as user[];

                    return { data: users };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({ type: 'users' as const, id: _id })),
                          { type: 'users', id: 'LIST' },
                      ]
                    : [{ type: 'users', id: 'LIST' }],
        }),

        //get user by id
        getUserById: builder.query<user, string>({
            async queryFn(id) {
            try {
                const userDoc = doc(db, "users", id); // Ensure the `id` is correctly passed
                const userSnapshot = await getDoc(userDoc);
        
                if (userSnapshot.exists()) {
                const singleUser = { _id: userSnapshot.id, ...userSnapshot.data() } as user;
                return { data: singleUser };
                } else {
                return { error: { message: "user not found" } };
                }
            } catch (error) {
                return { error: { message: (error as Error).message } };
            }
            },
            providesTags: (result, error, id) => 
            result
                ? [{ type: "users", id }, { type: "users", id: "LIST" }]
                : [{ type: "users", id: "LIST" }],
        }),
        // Add user
        addUser: builder.mutation<user, Partial<user>>({
            async queryFn(newUser) {
                try {
                    const usersCollection = collection(db, 'users');
                    const docRef = await addDoc(usersCollection, newUser);
                    return { data: { _id: docRef.id, ...newUser } as user };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: [{ type: 'users', id: 'LIST' }],
        }),

        // Delete a user
        deleteUser: builder.mutation<string, string>({
            async queryFn(userId) {
                try {
                    const userDoc = doc(db, 'users', userId);
                    await deleteDoc(userDoc);
                    return { data: userId };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: (userId) => [
                { type: 'users', id: userId },
                { type: 'users', id: 'LIST' },
            ],
        }),

        // Update user
        updateUser: builder.mutation<user, { id: string; user: Partial<user> }>({
            async queryFn({ id, user }) {
                try {
                    const userDoc = doc(db, 'users', id);
                    await updateDoc(userDoc, user);
                    return { data: { _id: id, ...user } as user };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: ({ id }) => [
                { type: 'users', id },
                { type: 'users', id: 'LIST' },
            ],
        }),
    }),
});

// Export hooks
export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useAddUserMutation,
    useDeleteUserMutation,
    useUpdateUserMutation,
  } = usersApiSlice;
  