"use client";

import { useQRCode } from "next-qrcode";

type QrCodeProps = {
  route?: string;
  width?: number;
};

export function QrCode({ width = 200, route = "/" }: QrCodeProps) {
  const { SVG } = useQRCode();

  console.log(route);

  return (
    <SVG
      key="qr-code"
      text={`${process.env.NEXT_PUBLIC_APP_URL}${route}`}
      options={{
        margin: 2,
        width: width,
        color: {
          dark: "#000000",
          light: "#FAFAFA",
        },
      }}
    />
  );
}
