import { useParams } from "react-router-dom";
import Container from "../ui/Container";
import CategoryFilters from "../ui/CategoryFilters";
import ProductCard from "../ui/ProductCard";
import { ProductProps } from "../../type";
import { useGetProductsQuery } from "@/redux/productsSlics";

const Category = () => {
  const { id } = useParams(); // `id` corresponds to `_base` in Firebase
  const {data:products = [] , isLoading , isError , error} = useGetProductsQuery();

  const formatId = (id: string) => {
    return id
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading categories...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        Error fetching products: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
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
  );
};

export default Category;
