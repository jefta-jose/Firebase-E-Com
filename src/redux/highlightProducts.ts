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

type highlightProduct = {
    _id: string;
    name: string;
    [key: string]: any; // Add extra fields if necessary
};

export const highlightProductsApiSlice = createApi({
    reducerPath: 'highlightProductApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['highlightsProducts'],
    endpoints: (builder) => ({
        // Fetch highlight Products
        getHighlightProducts: builder.query<highlightProduct[], void>({
            async queryFn() {
                try {
                    const highlightProductCollection = collection(db, 'highlightsProducts');
                    const querySnapshot = await getDocs(highlightProductCollection);
                    const highlightsProducts = querySnapshot.docs.map((doc) => ({
                        _id: doc.id,
                        ...doc.data(),
                    })) as highlightProduct[];

                    return { data: highlightsProducts };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({ type: 'highlightsProducts' as const, id: _id })),
                          { type: 'highlightsProducts', id: 'LIST' },
                      ]
                    : [{ type: 'highlightsProducts', id: 'LIST' }],
        }),

        //get highlightProduct by id
        getHighlightProductById: builder.query<highlightProduct, string>({
            async queryFn(id) {
            try {
                const highlightProductDoc = doc(db, "highlightsProducts", id); // Ensure the `id` is correctly passed
                const productSnapshot = await getDoc(highlightProductDoc);
        
                if (productSnapshot.exists()) {
                const singleHighlightProduct = { _id: productSnapshot.id, ...productSnapshot.data() } as highlightProduct;
                return { data: singleHighlightProduct };
                } else {
                return { error: { message: "highlightProduct not found" } };
                }
            } catch (error) {
                return { error: { message: (error as Error).message } };
            }
            },
            providesTags: (result, error, id) => 
            result
                ? [{ type: "highlightsProducts", id }, { type: "highlightsProducts", id: "LIST" }]
                : [{ type: "highlightsProducts", id: "LIST" }],
        }),

        // Add highlightProduct
        addHighlightProduct: builder.mutation<highlightProduct, Partial<highlightProduct>>({
            async queryFn(newHighlightProduct) {
                try {
                    const highlightProductCollection = collection(db, 'highlightsProducts');
                    const docRef = await addDoc(highlightProductCollection, newHighlightProduct);
                    return { data: { _id: docRef.id, ...newHighlightProduct } as highlightProduct };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: [{ type: 'highlightsProducts', id: 'LIST' }],
        }),

        // Delete a highlightProduct
        deleteHighlightProduct: builder.mutation<string, string>({
            async queryFn(highlightProductId) {
                try {
                    const highlightProductDoc = doc(db, 'highlightsProducts', highlightProductId);
                    await deleteDoc(highlightProductDoc);
                    return { data: highlightProductId };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: (highlightProductId) => [
                { type: 'highlightsProducts', id: highlightProductId },
                { type: 'highlightsProducts', id: 'LIST' },
            ],
        }),

        // Update highlightProduct
        updateHighlightProduct: builder.mutation<highlightProduct, { id: string; highlightProduct: Partial<highlightProduct> }>({
            async queryFn({ id, highlightProduct }) {
                try {
                    const highlightProductDoc = doc(db, 'highlightsProducts', id);
                    await updateDoc(highlightProductDoc, highlightProduct);
                    return { data: { _id: id, ...highlightProduct } as highlightProduct };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: ({ id }) => [
                { type: 'highlightsProducts', id },
                { type: 'highlightsProducts', id: 'LIST' },
            ],
        }),
    }),
});

// Export hooks
export const {
    useAddHighlightProductMutation,
    useDeleteHighlightProductMutation,
    useGetHighlightProductByIdQuery,
    useGetHighlightProductsQuery,
    useUpdateHighlightProductMutation
} = highlightProductsApiSlice;