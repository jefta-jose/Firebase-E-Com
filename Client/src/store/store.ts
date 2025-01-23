import { configureStore } from '@reduxjs/toolkit';
import { categoryApiSlice } from '@/redux/categorySlice';
import { productsApiSlice } from '@/redux/productsSlics';
import { highlightProductsApiSlice } from '@/redux/highlightProducts';

export const store = configureStore({
  reducer: {
    [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
    [productsApiSlice.reducerPath]: productsApiSlice.reducer,
    [highlightProductsApiSlice.reducerPath]: highlightProductsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(categoryApiSlice.middleware).concat(productsApiSlice.middleware).concat(highlightProductsApiSlice.middleware),
});
