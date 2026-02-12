import React, { memo, useCallback } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const ProductCard = memo(({ product, onAdd, addedToCartProductId }) => {
  const isAdded = addedToCartProductId === product.id;

  const handleAdd = useCallback(() => {
    onAdd(product);
  }, [onAdd, product]);

  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return (
    <Card
      sx={{
        transform: isAdded ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        boxShadow: isAdded
          ? '0 8px 25px rgba(76,175,80,0.25)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        border: isAdded ? '2px solid #4caf50' : '1px solid transparent',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isAdded && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            zIndex: 10,
            animation: `${bounce} 0.6s ease-in-out`,
          }}
        >
          <CheckCircleIcon
            sx={{ color: '#4caf50', fontSize: 30, backgroundColor: 'white', borderRadius: '50%' }}
          />
        </Box>
      )}

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" noWrap sx={{ mb: 1 }}>
          {product.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {formatCurrency(product.price)}
        </Typography>
        {product.inventory !== undefined && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Stock: {product.inventory}
          </Typography>
        )}
        <Button
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAdd}
          fullWidth
          sx={{ mt: 'auto' }}
          disabled={product.inventory === 0}
          aria-label={`Add ${product.name} to cart`}
        >
          {isAdded ? 'Added' : product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;






