import { db } from '@/lib/firebase';
import AdminCreateHighlightedProduct from '@/ui/AdminCreateHighlightedProduct';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'

const HighlightedProductsSection = () => {
      const [allHighlightProducts , setallHighlightProducts] = useState([]);
        const highlightsCollection = collection(db, "highlightsProducts");
      
        useEffect(()=>{
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

            fetchAllHighlightProducts();
        }, [])

  const [addhighlightedProductModal , setAddhighlightedProductModal] = useState(false);
  const ITEMS_PER_PAGE = 5; // Define items per page
  const [highlightPage, setHighlightPage] = useState(1);

    // Helper function to paginate data
    const paginate = (data, page) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      };

  const paginatedHighlights = paginate(allHighlightProducts, highlightPage);
  const totalHighlightPages = Math.ceil(allHighlightProducts.length / ITEMS_PER_PAGE);
        
    
  return (
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
  )
}

export default HighlightedProductsSection