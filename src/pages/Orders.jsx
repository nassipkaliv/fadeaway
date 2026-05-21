import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsBoxSeam } from 'react-icons/bs';
import { displayMoney } from '../helpers/utils';
import useDocTitle from '../hooks/useDocTitle';
import { useAuth } from '../contexts/auth/authContext';
import { api } from '../api/client';
import EmptyView from '../components/common/EmptyView';

const Orders = () => {
    useDocTitle('My Orders');
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }
        api.listOrders()
            .then((data) => setOrders(data.results || data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <section className="section orders_page">
                <div className="container center_loader">Loading orders…</div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="section orders_page">
                <div className="container">
                    <EmptyView
                        icon={<BsBoxSeam />}
                        msg="Please sign in to view your orders"
                        link="/login"
                        btnText="Sign in"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="section orders_page">
            <div className="container">
                <div className="orders_header">
                    <h2>My Orders</h2>
                    <span className="orders_count">
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                    </span>
                </div>

                {error && <div className="auth_error" style={{ marginBottom: 16 }}>{error}</div>}

                {orders.length === 0 ? (
                    <EmptyView
                        icon={<BsBoxSeam />}
                        msg="No orders yet"
                        link="/all-products"
                        btnText="Start Shopping"
                    />
                ) : (
                    orders.map((o) => (
                        <div key={o.id} className="order_card">
                            <div className="order_top">
                                <div>
                                    <div className="order_id">Order #{o.id}</div>
                                    <div className="order_date">
                                        {new Date(o.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <span className={`status_badge status_${o.status}`}>{o.status}</span>
                            </div>

                            <div className="order_items">
                                {(o.items || []).map((it) => (
                                    <div className="order_item_row" key={it.id}>
                                        <div>
                                            <span className="order_item_name">{it.sneaker_title}</span>
                                            <span className="order_item_qty"> × {it.quantity}</span>
                                        </div>
                                        <div className="order_item_price">
                                            {displayMoney(it.unit_price * it.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order_bottom">
                                <span>Total</span>
                                <span className="order_total">{displayMoney(o.total_amount)}</span>
                            </div>
                        </div>
                    ))
                )}

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Link to="/all-products" className="btn">Continue Shopping</Link>
                </div>
            </div>
        </section>
    );
};

export default Orders;
