import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineShoppingCart, AiOutlineUser } from 'react-icons/ai';
import { SiAdidas, SiNike, SiNewbalance, SiPuma } from 'react-icons/si'
import { dropdownMenu } from '../../data/headerData';
import commonContext from '../../contexts/common/commonContext';
import cartContext from '../../contexts/cart/cartContext';
import { useAuth } from '../../contexts/auth/authContext';
import SearchBar from './SearchBar';


const Header = () => {

    const { toggleSearch } = useContext(commonContext);
    const { cartItems } = useContext(cartContext);
    const { user, logout } = useAuth();
    const [isSticky, setIsSticky] = useState(false);


    // handle the sticky-header
    useEffect(() => {
        const handleIsSticky = () => window.scrollY >= 50 ? setIsSticky(true) : setIsSticky(false);

        window.addEventListener('scroll', handleIsSticky);

        return () => {
            window.removeEventListener('scroll', handleIsSticky);
        };
    }, [isSticky]);


    const cartQuantity = cartItems.length;


    return (
        <>
            <header id="header" className={isSticky ? 'sticky' : ''}>
                <div className="container">
                    <div className="navbar">
                        <h2 className="nav_logo">
                            <Link to="/">FADEAWAY</Link>
                        </h2>
                       
                        <nav className="nav_menu">
                                <div className='nike_action'>
                                    <span>
                                        <SiNike />
                                    </span>
                                    <div className="tooltip">Nike</div>
                                </div> 
                                <div className='adidas_action'>
                                    <span>
                                        <SiAdidas />
                                    </span>
                                    <div className="tooltip">Adidas</div>
                                </div>              
                                <div className='nb_action'>
                                    <span>
                                        <SiNewbalance />
                                    </span>
                                    <div className="tooltip">New Balance</div>
                                </div>         
                                <div className='puma_action'>
                                    <span>
                                        <SiPuma />
                                    </span>
                                    <div className="tooltip">Puma</div>
                                </div>
                        </nav>


                        <div className='nav_actions'>
                            <div className="search_action">
                                <span onClick={() => toggleSearch(true)}>
                                    <AiOutlineSearch />
                                </span>
                                <div className="tooltip">Search</div>
                            </div>

                            <div className="cart_action">
                                <Link to="/cart">
                                    <AiOutlineShoppingCart />
                                    {
                                        cartQuantity > 0 && (
                                            <span className="badge">{cartQuantity}</span>
                                        )
                                    }
                                </Link>
                                <div className="tooltip">Cart</div>
                            </div>

                            <div className="user_action">
                                <span>
                                    <AiOutlineUser />
                                </span>
                                <div className="dropdown_menu">
                                    <h4>Hello{user ? `, ${user.username}` : '!'}</h4>
                                    <p>Access account and manage orders</p>
                                    {!user ? (
                                        <Link to="/login">
                                            <button type="button">Login / Signup</button>
                                        </Link>
                                    ) : (
                                        <button type="button" onClick={logout}>Logout</button>
                                    )}
                                    <div className="separator"></div>
                                    <ul>
                                        {dropdownMenu.map(item => {
                                            const { id, link, path } = item;
                                            return (
                                                <li key={id}>
                                                    <Link to={path}>{link}</Link>
                                                </li>
                                            );
                                        })}
                                        {user && (
                                            <li><Link to="/orders">My Orders</Link></li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <SearchBar />
        </>
    );
};

export default Header;