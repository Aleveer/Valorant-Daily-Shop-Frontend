import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getCurrencies = async () => {
  const res = await axios.request({
    url: `${API_URL}/stripe/currencies`,
    method: 'GET',
  });
  return res.data || [];
};

export const generatePaymentSheet = async ({ amount, riotId, currencyCode }) => {
  const res = await axios.request({
    url: `${API_URL}/stripe/payment-sheet`,
    method: 'POST',
    data: {
      amount,
      riotId,
      currencyCode,
    },
  });
  return res;
};

