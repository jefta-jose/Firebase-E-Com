import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../ui/Loading";
import Container from "../ui/Container";
import CategoryFilters from "../ui/CategoryFilters";
import ProductCard from "../ui/ProductCard";
import { ProductProps } from "../../type";

import { db } from "../lib/firebase";
import { getDocs, collection, query, where } from "firebase/firestore";

const Category = () => {
  const { id } = useParams(); // `id` corresponds to `_base` in Firebase
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductProps[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Get the products matching the category ID (using `_base`)
        const productsRef = collection(db, "products");
        const productsQuery = query(productsRef, where("_base", "==", id));
        const querySnapshot = await getDocs(productsQuery);

        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  const formatId = (id: string) => {
    return id
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <Container>
          <h2 className="text-4xl text-center font-semibold mb-5">
            {formatId(id!)}
          </h2>
          <div className="flex items-start gap-10">
            <CategoryFilters id={id} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products?.map((item: ProductProps) => (
                <ProductCard item={item} key={item?._id} />
              ))}
            </div>
          </div>
        </Container>
      )}
    </div>
  );
};

export default Category;
