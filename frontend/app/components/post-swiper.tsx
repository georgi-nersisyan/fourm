"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { IMedia } from "./post-items";
import { Navigation } from "swiper/modules";
import Image from "next/image";

interface ImagesSwiperProps {
  media: IMedia[];
}

export default function PostSwiper({ media }: ImagesSwiperProps) {
  return (
    <div>
      <Swiper
        spaceBetween={20}
        simulateTouch={true}
        slidesPerView={1}
        modules={[Navigation]}
        navigation={true}
        className="h-[500px]"
      >
        {media.map((media) =>
          media.type === "image" ? (
            <SwiperSlide
              key={media.id}
              className="flex items-center justify-center"
            >
              <Image
                src={media.src}
                alt=""
<<<<<<< HEAD
                width={800}
                height={500}
                className="max-w-full max-h-full object-contain rounded-2xl"
=======
                width="800"
                height="500"
                className="max-w-full max-h-full object-cover rounded-2xl"
>>>>>>> e25313b (add-reactions)
              />
            </SwiperSlide>
          ) : (
            <SwiperSlide
              key={media.id}
              className="flex items-center justify-center"
            >
              <div className="w-full h-full">
                <video
                  width="100%"
                  height="400"
                  src={media.src}
                  title="Video"
                  controls
                  muted
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-2xl"
                />
              </div>
            </SwiperSlide>
          )
        )}
      </Swiper>
    </div>
  );
}
