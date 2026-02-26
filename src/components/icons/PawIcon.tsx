import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const PawIcon: React.FC<IconProps> = ({ size = 36, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 199 183"
      preserveAspectRatio="xMidYMid meet"
      fill="currentColor" /* Isso faz a mágica da cor funcionar com o Tailwind! */
      className={className}
      {...props}
    >
      <g transform="translate(0.000000,183.000000) scale(0.100000,-0.100000)" stroke="none">
        <path d="M625 1683 c-85 -22 -138 -139 -116 -259 40 -212 223 -352 335 -254 51 46 70 103 63 198 -9 135 -79 250 -182 298 -50 24 -63 26 -100 17z"/>
        <path d="M1154 1666 c-186 -81 -237 -425 -74 -502 73 -35 166 -10 228 61 153 173 100 456 -85 455 -21 -1 -52 -7 -69 -14z"/>
        <path d="M179 1267 c-100 -67 -116 -215 -39 -367 30 -59 103 -134 146 -150 72 -28 151 3 187 72 72 142 -15 385 -161 449 -57 25 -92 24 -133 -4z"/>
        <path d="M1595 1261 c-68 -32 -134 -116 -164 -210 -20 -64 -14 -162 15 -219 82 -165 288 -97 354 117 45 144 9 276 -87 317 -43 19 -70 17 -118 -5z"/>
        <path d="M909 1096 c-92 -26 -182 -79 -255 -151 -120 -118 -174 -257 -174 -447 0 -127 16 -177 65 -208 47 -29 111 -26 219 11 80 28 104 32 201 32 98 1 120 -3 204 -31 147 -50 211 -40 253 41 19 36 22 57 22 147 -1 61 -8 134 -18 174 -45 187 -176 339 -354 411 -79 31 -110 35 -163 21z"/>
      </g>
    </svg>
  );
};