import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';

/**
 * Skeleton loader for table content
 * @param {number} rows - Number of skeleton rows
 * @param {number} columns - Number of columns
 */
const TableSkeleton = ({ rows = 8, columns = 4 }) => {
  return (
    <TableContainer>
      <Table size="medium">
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width={i === columns - 1 ? 80 : '60%'} height={28} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    variant="text"
                    width={colIndex === columns - 1 ? 70 : `${70 + (colIndex * 10)}%`}
                    height={24}
                    animation="wave"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;
