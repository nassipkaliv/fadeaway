import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCartX } from 'react-icons/bs';
import { calculateTotal, displayMoney } from '../helpers/utils';
import useDocTitle from '../hooks/useDocTitle';
import cartContext from '../contexts/cart/cartContext';
import { useAuth } from '../contexts/auth/authContext';
import { useToast } from '../contexts/toast/toastContext';
import { api } from '../api/client';
import CartItem from '../components/cart/Cartitem';
import EmptyView from '../components/common/EmptyView';


const Cart = () => {

    useDocTitle('Cart');
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const { cartItems, clearCart } = useContext(cartContext);
    const [placing, setPlacing] = useState(false);

    const cartQuantity = cartItems.length;

    const cartTotal = cartItems.map(item => item.originalPrice * item.quantity);
    const calculateCartTotal = calculateTotal(cartTotal);
    const displayCartTotal = displayMoney(calculateCartTotal);

    const cartDiscount = cartItems.map(item => (item.originalPrice - item.finalPrice) * item.quantity);
    const calculateCartDiscount = calculateTotal(cartDiscount);
    const displayCartDiscount = displayMoney(calculateCartDiscount);

    const totalAmount = calculateCartTotal - calculateCartDiscount;
    const displayTotalAmount = displayMoney(totalAmount);

    const handleCheckout = async () => {
        if (!user) {
            toast.info('Please sign in to checkout');
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        setPlacing(true);
        try {
            const payload = {
                items: cartItems.map(item => ({
                    sneaker: item.id,
                    quantity: item.quantity,
                })),
            };
            const order = await api.createOrder(payload);
            if (clearCart) clearCart();
            toast.success(`Order #${order.id} placed successfully!`);
            setTimeout(() => navigate('/orders'), 600);
        } catch (e) {
            const detail = e.data?.detail || e.data?.items?.[0] || e.message || 'Checkout failed';
            toast.error(typeof detail === 'string' ? detail : 'Checkout failed');
        } finally {
            setPlacing(false);
        }
    };


    return (
        <section id="cart" className="section">
            <div className="container">
                {
                    cartQuantity === 0 ? (
                        <EmptyView
                            icon={<BsCartX />}
                            msg="Your Cart is Empty"
                            link="/all-products"
                            btnText="Start Shopping"
                        />
                    ) : (
                        <div className="wrapper cart_wrapper">
                            <div className="cart_left_col">
                                {cartItems.map(item => (
                                    <CartItem key={item.id} {...item} />
                                ))}
                            </div>

                            <div className="cart_right_col">
                                <div className="order_summary">
                                    <h3>
                                        Order Summary &nbsp;
                                        ( {cartQuantity} {cartQuantity > 1 ? 'items' : 'item'} )
                                    </h3>
                                    <div className="order_summary_details">
                                        <div className="price">
                                            <span>Original Price</span>
                                            <b>{displayCartTotal}</b>
                                        </div>
                                        <div className="discount">
                                            <span>Discount</span>
                                            <b>- {displayCartDiscount}</b>
                                        </div>
                                        <div className="delivery">
                                            <span>Delivery</span>
                                            <b>Free</b>
                                        </div>
                                        <div className="separator"></div>
                                        <div className="total_price">
                                            <b><small>Total Price</small></b>
                                            <b>{displayTotalAmount}</b>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn checkout_btn"
                                        onClick={handleCheckout}
                                        disabled={placing}
                                    >
                                        {placing ? 'Placing order…' : user ? 'Checkout' : 'Sign in to checkout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </section>
    );
};

export default Cart;
