import { Outlet, useLocation } from 'react-router-dom';
import { ProductList } from './components/ProductList';

export const CatalogPage = () => {
    // If we are at the root catalog path, show list. 
    // Otherwise show child routes (like add product wizard)
    const location = useLocation();
    const isRoot = location.pathname === '/catalog';

    if (!isRoot) {
        return (
            <Outlet />
        );
    }

    return <ProductList />;
};
