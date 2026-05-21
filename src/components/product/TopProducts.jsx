import React from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import { useProducts } from '../../contexts/products/productsContext';
import ProductCard from './ProductCard';


const TopProducts = () => {
    const { products, loading, error } = useProducts();

    if (loading) return <p style={{ textAlign: 'center' }}>Loading products…</p>;
    if (error) return <p style={{ textAlign: 'center', color: 'crimson' }}>Failed to load: {error}</p>;

    return (
        <div className="wrapper products_wrapper">
            {
                products.slice(0, 11).map(item => (
                    <ProductCard
                        key={item.id}
                        {...item}
                    />
                ))
            }
            <div className="card products_card browse_card">
                <Link to="/all-products">
                    Browse All <br /> Products <BsArrowRight />
                </Link>
            </div>
        </div>
    );
};

export default TopProducts;
