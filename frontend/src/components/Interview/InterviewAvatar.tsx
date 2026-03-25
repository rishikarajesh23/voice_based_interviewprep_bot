import React, { useEffect, useState } from 'react';
import { Box, keyframes } from '@mui/material';

interface InterviewAvatarProps {
  isSpeaking: boolean;
}

const blink = keyframes`
  0%, 90%, 100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
`;

const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const InterviewAvatar: React.FC<InterviewAvatarProps> = ({ isSpeaking }) => {
  const [shouldBlink, setShouldBlink] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setShouldBlink(true);
        setTimeout(() => setShouldBlink(false), 140);
      }
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 280,
        height: 320,
        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.18))',
      }}
    >
      <svg
        width="220"
        height="240"
        viewBox="0 0 80 90"
        style={{ overflow: 'visible' }}
        role="img"
        aria-label={isSpeaking ? 'Avatar speaking' : 'Avatar'}
      >
        {/* Simple glow when speaking */}
        {isSpeaking && (
          <circle
            cx="40"
            cy="30"
            r="30"
            fill="#60a5fa"
            opacity="0.14"
            style={{ animation: `${pulse} 1.2s ease-in-out infinite` }}
          />
        )}

        {/* Head (simple circle) */}
        <circle
          cx="40"
          cy="28"
          r="16"
          fill="#f3d6b0"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="0.6"
        />

        {/* Torso (rounded rect) */}
        <rect
          x="22"
          y="48"
          rx="6"
          ry="6"
          width="36"
          height="24"
          fill="#2563eb"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}
        />

        {/* Eyes (simple circles) */}
        <g>
          <ellipse
            cx="32"
            cy="28"
            rx="2.4"
            ry="2.4"
            fill="#111827"
            style={{
              transformOrigin: '32px 28px',
              animation: shouldBlink ? `${blink} 0.15s ease-in-out` : 'none',
            }}
          />
          <ellipse
            cx="48"
            cy="28"
            rx="2.4"
            ry="2.4"
            fill="#111827"
            style={{
              transformOrigin: '48px 28px',
              animation: shouldBlink ? `${blink} 0.15s ease-in-out` : 'none',
            }}
          />
        </g>

        {/* Mouth - small line or open when speaking */}
        <path
          d={isSpeaking ? 'M33,36 Q40,41 47,36' : 'M34,36 Q40,37 46,36'}
          stroke="#7c4a2e"
          strokeWidth={isSpeaking ? 2.2 : 1.6}
          fill="none"
          strokeLinecap="round"
          style={{
            transition: 'd 0.18s ease, stroke-width 0.18s ease',
          }}
        />
      </svg>

      {/* Status indicator badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 38,
          right: 44,
          width: 18,
          height: 18,
          bgcolor: isSpeaking ? '#10b981' : '#6b7280',
          borderRadius: '50%',
          border: '2.5px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.28s ease',
          ...(isSpeaking && {
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }),
        }}
      />

      {/* Speaking label */}
      {isSpeaking && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(16, 185, 129, 0.95)',
            color: 'white',
            px: 2,
            py: '4px',
            borderRadius: 1.5,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        >
          Speaking...
        </Box>
      )}
    </Box>
  );
};

export default InterviewAvatar;
