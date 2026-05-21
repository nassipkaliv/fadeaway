import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../../api/client';

const productsContext = createContext(null);

const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.listSneakers();
            setProducts(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <productsContext.Provider value={{ products, loading, error, reload: load }}>
            {children}
        </productsContext.Provider>
    );
};

export const useProducts = () => useContext(productsContext);

export default productsContext;
export { ProductsProvider };
