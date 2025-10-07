// src/components/common/ImageLightbox.tsx
"use client";

import React from "react";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// (Tùy chọn) Import các plugin nếu bạn muốn thêm tính năng
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface ImageLightboxProps {
  open: boolean;
  close: () => void;
  slides: Slide[];
  index: number;
}

export function ImageLightbox({
  open,
  close,
  slides,
  index,
}: ImageLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={close}
      slides={slides}
      index={index}
      // Bật các plugin đã import
      plugins={[Thumbnails, Zoom]}
      // Cấu hình thêm cho lightbox (tùy chọn)
      styles={{
        container: { backgroundColor: "var(--lightbox-overlay)" },
        thumbnailsContainer: { backgroundColor: "var(--lightbox-overlay)" },
      }}
      zoom={{
        maxZoomPixelRatio: 2,
      }}
      thumbnails={{
        border: 0,
        borderRadius: 4,
        padding: 8,
        gap: 16,
      }}
    />
  );
}
