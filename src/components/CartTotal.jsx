import { useContext } from 'react';
import PropTypes from 'prop-types';
import Title from './Title';
import { AppContext } from '../context/AppContext'; 

const CartTotal = ({ shippingCost }) => {
    const { currency, getCartAmount } = useContext(AppContext);

    const subtotal = getCartAmount();
    const deliveryFee = typeof shippingCost === 'number' && shippingCost >= 0 ? shippingCost : 0;
    const total = subtotal + deliveryFee;

    const formatCurrency = (amount) => {
        const numericAmount = typeof amount === 'number' ? amount : 0;
        return currency + numericAmount.toLocaleString('id-ID', { minimumFractionDigits: 0 });
    };

    return (
        <div className='w-full'>
            {/* Judul */}
            <div className="mb-6">
                <Title text1={'TOTAL'} text2={'KERANJANG'} />
            </div>

            {/* Rincian Biaya */}
            <div className='flex flex-col gap-3 text-sm'>
                <div className="flex justify-between pb-2">
                    <p className='text-gray-600'>Subtotal</p>
                    <p className='font-medium'>{formatCurrency(subtotal)}</p>
                </div>
                <hr />
                <div className="flex justify-between py-2">
                    <p className='text-gray-600'>Biaya Pengiriman</p>
                    <p className='font-medium'>{formatCurrency(deliveryFee)}</p>
                </div>
                <hr />
                <div className="flex justify-between pt-2 font-semibold text-base">
                    <p>Total</p>
                    <p>{formatCurrency(total)}</p>
                </div>
            </div>
        </div>
    );
};

CartTotal.propTypes = {
    shippingCost: PropTypes.number
};

export default CartTotal;