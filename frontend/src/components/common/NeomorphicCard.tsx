// src/components/common/NeomorphicCard.tsx
import React from 'react';
import { Card, CardProps } from '@mui/material';
import { motion } from 'framer-motion';
import { useNeomorphismStyles } from '../../theme';

interface NeomorphicCardProps extends CardProps {
  hover?: boolean;
  pressed?: boolean;
}

const MotionCard = motion(Card);

export const NeomorphicCard: React.FC<NeomorphicCardProps> = ({
  children,
  hover = true,
  pressed = false,
  sx,
  ...props
}) => {
  const neoStyles = useNeomorphismStyles();

  return (
    <MotionCard
      {...props}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      whileTap={pressed ? { y: 0, scale: 0.98 } : undefined}
      sx={{
        ...neoStyles.raised,
        ...sx,
      }}
    >
      {children}
    </MotionCard>
  );
};