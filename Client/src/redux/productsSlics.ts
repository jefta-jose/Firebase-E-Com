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
    query, 
    where
} from 'firebase/firestore';

type Product = {
    _id: string;
    name: string;
    [key: string]: any; // Add extra fields if necessary
};

export const productsApiSlice = createApi({
    reducerPath: 'productApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['products'],
    endpoints: (builder) => ({
        // Fetch Products
        getProducts: builder.query<Product[], void>({
            async queryFn() {
                try {
                    const productCollection = collection(db, 'products');
                    const querySnapshot = await getDocs(productCollection);
                    const products = querySnapshot.docs.map((doc) => ({
                        _id: doc.id,
                        ...doc.data(),
                    })) as Product[];

                    return { data: products };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({ type: 'products' as const, id: _id })),
                          { type: 'products', id: 'LIST' },
                      ]
                    : [{ type: 'products', id: 'LIST' }],
        }),

        //get product by id
        getProductById: builder.query<Product, string>({
            async queryFn(id) {
            try {
                const productDoc = doc(db, "products", id); // Ensure the `id` is correctly passed
                const productSnapshot = await getDoc(productDoc);
        
                if (productSnapshot.exists()) {
                const singleProduct = { _id: productSnapshot.id, ...productSnapshot.data() } as Product;
                return { data: singleProduct };
                } else {
                return { error: { message: "Product not found" } };
                }
            } catch (error) {
                return { error: { message: (error as Error).message } };
            }
            },
            providesTags: (result, error, id) => 
            result
                ? [{ type: "products", id }, { type: "products", id: "LIST" }]
                : [{ type: "products", id: "LIST" }],
        }),

        getProductsByBase: builder.query<Product[], string>({
            async queryFn(baseId) {
              try {
                // Query products collection to filter by `_base`
                const productsRef = collection(db, "products");
                const productsQuery = query(productsRef, where("_base", "==", baseId));
                const querySnapshot = await getDocs(productsQuery);
          
                if (!querySnapshot.empty) {
                  const products = querySnapshot.docs.map((doc) => ({
                    _id: doc.id,
                    ...doc.data(),
                  })) as Product[];
                  return { data: products };
                } else {
                  return { error: { message: "No products found for the specified base." } };
                }
              } catch (error) {
                return { error: { message: (error as Error).message } };
              }
            },
            providesTags: (result, error, baseId) =>
              result
                ? [
                    { type: "products", id: baseId },
                    ...result.map(({ _id }) => ({ type: "products", id: _id })),
                    { type: "products", id: "LIST" },
                  ]
                : [{ type: "products", id: "LIST" }],
          }),
          

        // Add Product
        addProduct: builder.mutation<Product, Partial<Product>>({
            async queryFn(newProduct) {
                try {
                    const productCollection = collection(db, 'products');
                    const docRef = await addDoc(productCollection, newProduct);
                    return { data: { _id: docRef.id, ...newProduct } as Product };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: [{ type: 'products', id: 'LIST' }],
        }),

        // Delete a Product
        deleteProduct: builder.mutation<string, string>({
            async queryFn(productId) {
                try {
                    const productDoc = doc(db, 'products', productId);
                    await deleteDoc(productDoc);
                    return { data: productId };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: (productId) => [
                { type: 'products', id: productId },
                { type: 'products', id: 'LIST' },
            ],
        }),

        // Update Product
        updateProduct: builder.mutation<Product, { id: string; product: Partial<Product> }>({
            async queryFn({ id, product }) {
                try {
                    const productDoc = doc(db, 'products', id);
                    await updateDoc(productDoc, product);
                    return { data: { _id: id, ...product } as Product };
                } catch (error) {
                    return { error: { message: (error as Error).message } };
                }
            },
            invalidatesTags: ({ id }) => [
                { type: 'products', id },
                { type: 'products', id: 'LIST' },
            ],
        }),
    }),
});

// Export hooks
export const {
    useAddProductMutation,
    useDeleteProductMutation,
    useGetProductsQuery,
    useUpdateProductMutation,
    useGetProductByIdQuery,
    useGetProductsByBaseQuery
} = productsApiSlice;