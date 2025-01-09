import { useEffect, useState } from "react";
import { homeBanner } from "../assets";
import { getUserRole } from "../lib/localStore";
import Container from "./Container";
import LinkButton from "./LinkButton";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import AdminCreateProduct from "./AdminCreateProduct";
import AdminCreateHighlightedProduct from "./AdminCreateHighlightedProduct";
import AdminCreateCategory from "./AdminCreateCategory";
import UsersSection from "@/sections/UsersSection";


const HomeBanner = () => {
  const userRole = getUserRole();

  const [allProducts , setallProducts] = useState([]);
  const [allHighlightProducts , setallHighlightProducts] = useState([]);
  const [allCategories , setallCategories] = useState([]);


  const productsCollection = collection(db, "products");
  const highlightsCollection = collection(db, "highlightsProducts");
  const categoriesCollection = collection(db, "categories");

  useEffect(() => {


    const fetchAllProducts = async () => {
      try {
          const querySnapshot = await getDocs(productsCollection);
          const productsList = querySnapshot.docs.map((doc) => ({
            _id: doc.id,  // Store the document ID
            ...doc.data(),  // Spread the document data
          }));
          setallProducts(productsList);
        }
      catch (error) {
        console.error("Error fetching data", error);
      }
    };

    const fetchAllHighlightProducts = async () => {
      try {
          const querySnapshot = await getDocs(highlightsCollection);
          const highlightProductsList = querySnapshot.docs.map((doc) => ({
            _id: doc.id,  // Store the document ID
            ...doc.data(),  // Spread the document data
          }));
          setallHighlightProducts(highlightProductsList);
        }
      catch (error) {
        console.error("Error fetching data", error);
      }
    };

    const fetchAllCategories = async () => {
      try {
          const querySnapshot = await getDocs(categoriesCollection);
          const categoriesList = querySnapshot.docs.map((doc) => ({
            _id: doc.id,  // Store the document ID
            ...doc.data(),  // Spread the document data
          }));
          setallCategories(categoriesList);
        }
      catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchAllProducts();
    fetchAllHighlightProducts();
    fetchAllCategories();

  },[]);

  const [addProductModal , setAddProductModal] = useState(false);
  const [addhighlightedProductModal , setAddhighlightedProductModal] = useState(false);
  const [addCategoryModal , setAddCategoryModal] = useState(false);


  const ITEMS_PER_PAGE = 5; // Define items per page


  // States for pagination
  const [productPage, setProductPage] = useState(1);
  const [highlightPage, setHighlightPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  // Helper function to paginate data
  const paginate = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };



  // Paginated data
  const paginatedProducts = paginate(allProducts, productPage);
  const paginatedHighlights = paginate(allHighlightProducts, highlightPage);
  const paginatedCategories = paginate(allCategories, categoryPage);

  // Total pages for each dataset
  const totalProductPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
  const totalHighlightPages = Math.ceil(allHighlightProducts.length / ITEMS_PER_PAGE);
  const totalCategoryPages = Math.ceil(allCategories.length / ITEMS_PER_PAGE);

  return (
    <div>
      <Container className="relative py-5 overflow-hidden">
        {/* Show content only if userRole is not 'admin' */}
        {userRole !== "admin" && (
          <div className="relative">
            <img
              src={homeBanner}
              alt="homeBanner"
              className="w-full h-full object-cover rounded-md"
            />
            <div className="w-full h-full absolute top-0 left-0 bg-black/10" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <h2 className="text-xl md:text-4xl lg:text-6xl text-whiteText font-bold">
                Mi Air Purifier
              </h2>
              <p className="text-base md:text-lg font-semibold leading-6 text-whiteText/90 max-w-[250px] pb-1">
                The new tech gift you are wishing for right here.
              </p>
              <LinkButton className="w-44 flex items-center justify-center bg-whiteText text-darkText hover:bg-darkText hover:text-whiteText duration-200 pb-2" />
            </div>
          </div>
        )}

        {/* Admin content */}
        {userRole === "admin" && (
            <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {/* Users Section with Pagination */}
            <UsersSection/>

            {/* Products Section */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">

              <div className=" flex items-center gap-x-2">
              <h2 className="md:text-2xl font-bold text-indigo-600 mb-4">{allProducts.length}</h2>
              <h2 className="md:text-2xl font-semibold text-gray-700 mb-4">Products</h2>
              </div>

              <button
              onClick={() => setAddProductModal(true)}
                  className="px-4 py-2 my-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                >
                  Add Product
                </button>
                {addProductModal && <AdminCreateProduct setAddProductModal={setAddProductModal} />}


              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-md shadow hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="mt-4 flex justify-between">
                <button
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                  onClick={() => setProductPage((prev) => Math.max(prev - 1, 1))}
                  disabled={productPage === 1}
                >
                  Previous
                </button>
                <span className="text-gray-700 text-sm p-2">Page {productPage} of {totalProductPages}</span>
                <button
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                  onClick={() => setProductPage((prev) => Math.min(prev + 1, totalProductPages))}
                  disabled={productPage === totalProductPages}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Highlited Products Section */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">

            <div className=" flex items-center gap-x-2">
            <h2 className="md:text-2xl font-bold text-indigo-600 mb-4">{allHighlightProducts.length}</h2>
            <h2 className="md:text-2xl font-semibold text-gray-700 mb-4">Highlighted Products</h2>
            </div>

            <button
              onClick={() => setAddhighlightedProductModal(true)}
                  className="px-4 py-2 my-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                >
                  Add Highlighted Product
                </button>
                {addhighlightedProductModal && <AdminCreateHighlightedProduct setAddhighlightedProductModal={setAddhighlightedProductModal} />}


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {paginatedHighlights.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-md shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                onClick={() => setHighlightPage((prev) => Math.max(prev - 1, 1))}
                disabled={highlightPage === 1}
              >
                Previous
              </button>
              <span className="text-gray-700 text-sm p-2">Page {highlightPage} of {totalHighlightPages}</span>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                onClick={() => setHighlightPage((prev) => Math.min(prev + 1, totalHighlightPages))}
                disabled={highlightPage === totalHighlightPages}
              >
                Next
              </button>
            </div>
            </div>

            {/* Categories Section */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">

            <div className=" flex items-center gap-x-2">
            <h2 className="md:text-2xl font-bold text-indigo-600 mb-4">{allCategories.length}</h2>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Categories</h2>
            </div>


            <button
              onClick={() => setAddCategoryModal(true)}
                  className="px-4 py-2 my-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                >
                  Add Category
                </button>
                {addCategoryModal && <AdminCreateCategory setAddCategoryModal={setAddCategoryModal} />}


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {paginatedCategories.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-md shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 1))}
                disabled={categoryPage === 1}
              >
                Previous
              </button>
              <span className="text-gray-700 text-sm p-2">Page {categoryPage} of {totalCategoryPages}</span>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md disabled:opacity-50"
                onClick={() => setCategoryPage((prev) => Math.min(prev + 1, totalCategoryPages))}
                disabled={categoryPage === totalCategoryPages}
              >
                Next
              </button>
            </div>
            </div>

          </div>
        )}

      </Container>
    </div>
  );
};

export default HomeBanner;
