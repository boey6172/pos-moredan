import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

/**
 * Generic page skeleton for dashboard-style layouts (cards + content)
 */
export const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={220} height={48} sx={{ mb: 3 }} />
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Card>
      <CardContent>
        <Skeleton variant="rectangular" height={280} animation="wave" />
      </CardContent>
    </Card>
  </Box>
);

/**
 * Simple content block skeleton (for Reports, etc.)
 */
export const ContentSkeleton = ({ lines = 6 }) => (
  <Box sx={{ py: 2 }}>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={48} animation="wave" />
      ))}
    </Box>
  </Box>
);

/**
 * POS product grid skeleton (accordion + cards)
 */
export const POSProductSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={180} height={48} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
    {[1, 2, 3].map((i) => (
      <Card key={i} sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, j) => (
              <Grid item xs={6} sm={4} md={2} key={j}>
                <Skeleton variant="rectangular" height={120} animation="wave" sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="50%" />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    ))}
  </Box>
);

export default DashboardSkeleton;
