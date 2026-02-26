// Add this helper function in MainHeader component
const formatCartItemPrice = (price, quantity = 1) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numQuantity = quantity || 1;
  
  if (isNaN(numPrice) || isNaN(numQuantity)) return '0.00';
  
  return (numPrice * numQuantity).toFixed(2);
};