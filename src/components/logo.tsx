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
      src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544331/Gemini_Generated_Image_8vt1oa8vt1oa8vt1__1_-removebg-preview_slimrt.png"
      alt="Woosenteur Logo"
      width={150}
      height={150}
      priority
      className={cn("w-auto", className)}
    />
  );
};

export default Logo;
