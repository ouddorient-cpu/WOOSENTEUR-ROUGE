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
      src="https://res.cloudinary.com/dzagwz94z/image/upload/v1768292940/ChatGPT_Image_13_janv._2026_09_28_19_wvny6h.png"
      alt="Woosenteur v2 Logo"
      width={150}
      height={150}
      priority
      className={cn("w-auto", className)}
    />
  );
};

export default Logo;
