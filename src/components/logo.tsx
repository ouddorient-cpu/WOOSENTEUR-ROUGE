'use client';
import { cn } from '@/lib/utils';
import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <Image 
      src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1776549880/ChatGPT_Image_18_avr._2026_22_36_12_p5pr6f.png"
      alt="Woosenteur Logo"
      width={150}
      height={150}
      priority
      className={cn("w-auto", className)}
    />
  );
};

export default Logo;
