"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IMedia } from "./post-items";

interface ImagesSwiperProps {
  media: IMedia[];
}

export default function PostSwiper({ media }: ImagesSwiperProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Swiper
        spaceBetween={20}
        simulateTouch={true}
        slidesPerView={1}
        className="h-[500px]"
      >
        {media.map((media) =>
          media.type === "image" ? (
            <SwiperSlide
              key={media.id}
              className="flex items-center justify-center"
            >
              <img
                src={media.src}
                alt=""
                className="max-w-full max-h-full object-contain rounded-2xl"
              />
            </SwiperSlide>
          ) : (
            <SwiperSlide
              key={media.id}
              className="flex items-center justify-center"
            >
              <div className="w-full h-full">
                <iframe
                  width="100%"
                  height="400"
                  src={media.src.replace("watch?v=", "embed/")}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="pointer-events-none rounded-2xl"
                />
              </div>
            </SwiperSlide>
          )
        )}
      </Swiper>
    </div>
  );
}
