import { createContext, useContext, useEffect, useReducer } from 'react';
import { brandsMenu, categoryMenu } from '../../data/filterBarData';
import { useProducts } from '../products/productsContext';
import filtersReducer from './filtersReducer';

const filtersContext = createContext();

const initialState = {
    allProducts: [],
    sortedValue: null,
    updatedBrandsMenu: brandsMenu,
    updatedCategoryMenu: categoryMenu,
    selectedPrice: {
        price: 0,
        minPrice: 0,
        maxPrice: 0
    },
    mobFilterBar: {
        isMobSortVisible: false,
        isMobFilterVisible: false,
    },
};


const FiltersProvider = ({ children }) => {
    const { products: productsData } = useProducts();
    const [state, dispatch] = useReducer(filtersReducer, initialState);

    useEffect(() => {
        if (!productsData.length) return;
        const products = [...productsData];
        const priceArr = products.map(item => item.finalPrice);
        const minPrice = Math.min(...priceArr);
        const maxPrice = Math.max(...priceArr);

        dispatch({
            type: 'LOAD_ALL_PRODUCTS',
            payload: { products, minPrice, maxPrice }
        });
    }, [productsData]);


    const applyFilters = () => {
        let updatedProducts = [...productsData];

        if (state.sortedValue) {
            switch (state.sortedValue) {
                case 'Latest':
                    updatedProducts = updatedProducts.slice(0, 6);
                    break;
                case 'Featured':
                    updatedProducts = updatedProducts.filter(item => item.tag === 'featured-product');
                    break;
                case 'Top Rated':
                    updatedProducts = updatedProducts.filter(item => item.rateCount > 4);
                    break;
                case 'Price(Lowest First)':
                    updatedProducts = updatedProducts.sort((a, b) => a.finalPrice - b.finalPrice);
                    break;
                case 'Price(Highest First)':
                    updatedProducts = updatedProducts.sort((a, b) => b.finalPrice - a.finalPrice);
                    break;
                default:
                    break;
            }
        }

        const checkedBrandItems = state.updatedBrandsMenu
            .filter(item => item.checked)
            .map(item => item.label.toLowerCase());
        if (checkedBrandItems.length) {
            updatedProducts = updatedProducts.filter(item => checkedBrandItems.includes(item.brand.toLowerCase()));
        }

        const checkedCategoryItems = state.updatedCategoryMenu
            .filter(item => item.checked)
            .map(item => item.label.toLowerCase());
        if (checkedCategoryItems.length) {
            updatedProducts = updatedProducts.filter(item => checkedCategoryItems.includes((item.category || '').toLowerCase()));
        }

        if (state.selectedPrice && state.selectedPrice.price > 0) {
            updatedProducts = updatedProducts.filter(item => item.finalPrice <= state.selectedPrice.price);
        }

        dispatch({
            type: 'FILTERED_PRODUCTS',
            payload: { updatedProducts }
        });
    };

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.sortedValue, state.updatedBrandsMenu, state.updatedCategoryMenu, state.selectedPrice, productsData]);


    const setSortedValue = (sortValue) =>
        dispatch({ type: 'SET_SORTED_VALUE', payload: { sortValue } });
    const handleBrandsMenu = (id) =>
        dispatch({ type: 'CHECK_BRANDS_MENU', payload: { id } });
    const handleCategoryMenu = (id) =>
        dispatch({ type: 'CHECK_CATEGORY_MENU', payload: { id } });
    const handlePrice = (event) =>
        dispatch({ type: 'HANDLE_PRICE', payload: { value: event.target.value } });
    const handleMobSortVisibility = (toggle) =>
        dispatch({ type: 'MOB_SORT_VISIBILITY', payload: { toggle } });
    const handleMobFilterVisibility = (toggle) =>
        dispatch({ type: 'MOB_FILTER_VISIBILITY', payload: { toggle } });
    const handleClearFilters = () =>
        dispatch({ type: 'CLEAR_FILTERS' });

    const values = {
        ...state,
        setSortedValue,
        handleBrandsMenu,
        handleCategoryMenu,
        handlePrice,
        handleMobSortVisibility,
        handleMobFilterVisibility,
        handleClearFilters,
    };

    return (
        <filtersContext.Provider value={values}>
            {children}
        </filtersContext.Provider>
    );
};

export default filtersContext;
export { FiltersProvider };
