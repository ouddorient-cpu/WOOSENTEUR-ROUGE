"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import Image from 'next/image';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const logos = [
    {
      id: "logo-1",
      description: "WooCommerce Logo",
      image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1768299749/agence-wordpress-woocommerce_pxsz2d.png",
      className: "h-10 w-auto",
    },
    {
      id: "logo-2",
      description: "Shopify Logo",
      image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1768299894/Shopify_logo_2018.svg_yi2bqs.png",
      className: "h-8 w-auto",
    },
    {
      id: "logo-3",
      description: "RankMath Logo",
      image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1768299748/rank-math_thumb_jemoio.png",
      className: "h-10 w-auto",
    },
    {
      id: "logo-4",
      description: "Gemini AI Logo",
      image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1768300088/images_1_zjpyfj.png",
      className: "h-8 w-auto",
    },
     {
      id: "logo-5",
      description: "Next.js Logo",
      image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1768300558/images_4_zz3zfb.png",
      className: "h-8 w-auto",
    },
     {
      id: "logo-6",
      description: "Firebase Logo",
      image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1768300924/firebase_logo_icon_168209_tjjlfv.webp",
      className: "h-10 w-auto",
    },
     {
      id: "logo-7",
      description: "Stripe Logo",
      image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1768300327/images_2_mhuy3k.png",
      className: "h-8 w-auto",
    },
];

const Logos = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
          Intégrations et technologies
        </h2>
      </div>
      <div className="pt-10 md:pt-12">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <Carousel
            opts={{ loop: true, align: "start" }}
            plugins={[AutoScroll({ playOnInit: true, stopOnInteraction: false, speed: 0.7 })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {[...logos, ...logos].map((logo, index) => (
                <CarouselItem
                  key={`${logo.id}-${index}`}
                  className="flex basis-1/3 justify-center pl-4 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-10 flex h-16 shrink-0 items-center justify-center">
                      <Image
                        src={logo.image}
                        alt={logo.description}
                        width={150}
                        height={40}
                        className={logo.className}
                      />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Logos;
