'use client';
import { cn } from '@/lib/utils';
import type { FC } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <Image 
      src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1777844860/ChatGPT_Image_3_mai_2026__22_46_44-removebg-preview_iknnob.png"
      alt="Woosenteur Logo"
      width={150}
      height={150}
      priority
      className={cn("w-auto", className)}
    />
  );
};

export default Logo;
