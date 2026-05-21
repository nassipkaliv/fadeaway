import React, { useContext } from 'react';
import { BsExclamationCircle } from 'react-icons/bs';
import useDocTitle from '../hooks/useDocTitle';
import FilterBar from '../components/filters/FilterBar';
import ProductCard from '../components/product/ProductCard';
import Services from '../components/common/Services';
import filtersContext from '../contexts/filters/filtersContext';
import { useProducts } from '../contexts/products/productsContext';
import EmptyView from '../components/common/EmptyView';


const AllProducts = () => {

    useDocTitle('All Products');

    const { allProducts } = useContext(filtersContext);
    const { loading, error } = useProducts();


    return (
        <>
            <section id="all_products" className="section">
                <FilterBar />

                <div className="container">
                    {loading ? (
                        <p className="center_loader">Loading products…</p>
                    ) : error ? (
                        <EmptyView
                            icon={<BsExclamationCircle />}
                            msg={`Failed to load products: ${error}`}
                        />
                    ) : allProducts.length ? (
                        <div className="wrapper products_wrapper">
                            {allProducts.map(item => (
                                <ProductCard key={item.id} {...item} />
                            ))}
                        </div>
                    ) : (
                        <EmptyView
                            icon={<BsExclamationCircle />}
                            msg="No Results Found"
                        />
                    )}
                </div>
            </section>

            <Services />
        </>
    );
};

export default AllProducts;
