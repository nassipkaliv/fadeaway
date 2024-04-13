import React from 'react';
import {FaShippingFast, FaShieldAlt, FaTags, FaCreditCard} from 'react-icons/fa';
const Services = () => {
  return (
    <>
      <section id="services" className="section">
        <div className="container">
          <div className="wrapper services_wrapper">
            
            <div className='services_card'>
              <div className='services_icon'>
                <span>
                  <FaShippingFast />
                </span>
              </div>
              <div className='servies_details'>
                <h4>Express Delivery</h4>
                <p>Ships in 24 Hours</p>
              </div>
            </div>

            <div className='services_card'>
              <div className='services_icon'>
                <span>
                  <FaShieldAlt />
                </span>
              </div>
              <div className='servies_details'>
                <h4>Brand Warranty</h4>
                <p>100% Original products</p>
              </div>
            </div>

            <div className='services_card'>
              <div className='services_icon'>
                <span>
                  <FaTags />
                </span>
              </div>
              <div className='servies_details'>
                <h4>Exciting Deals</h4>
                <p>On all prepaid orders</p>
              </div>
            </div>

            <div className='services_card'>
              <div className='services_icon'>
                <span>
                  <FaCreditCard />
                </span>
              </div>
              <div className='servies_details'>
                <h4>Secure Payments</h4>
                <p>SSL / Secure сertificate</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Services;