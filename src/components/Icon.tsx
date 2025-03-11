import {FC} from "react";

export enum IconVariant {
    CROSS = "CROSS",
    BLUETOOTH = "BLUETOOTH",
    GITHUB = "GITHUB",
    EDIT = "EDIT",
    PLAY = "PLAY",
    PLUS = "PLUS",
    MINUS = "MINUS",
    UPLOAD = "UPLOAD",
    NETWORK = "NETWORK",
}

export enum IconColor {
    RED = "RED",
    GREEN = "GREEN",
}

type IconProps = {
    variant: IconVariant;
    size?: number;
    color?: IconColor;
};

export const Icon: FC<IconProps> = ({ variant, size, color }) => {
    switch (IconVariant[variant]) {
        case IconVariant.CROSS:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={size ? `${size}em` : "1.5em"} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 15 15">
                    <path fill={color ? `${color}` : "currentColor"} d="M3.64 2.27L7.5 6.13l3.84-3.84A.92.92 0 0 1 12 2a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l3.89 3.89A.9.9 0 0 1 13 12a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-3.85 3.85A.92.92 0 0 1 3 13a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L2.27 3.61A.9.9 0 0 1 2 3a1 1 0 0 1 1-1c.24.003.47.1.64.27"/>
                </svg>
        );
        case IconVariant.BLUETOOTH:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 24 24">
                    <path fill={color ? `${color}` : "currentColor"} d="M11 22v-7.6L6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5L11 9.6V2h1l5.7 5.7l-4.3 4.3l4.3 4.3L12 22zm2-12.4l1.9-1.9L13 5.85zm0 8.55l1.9-1.85l-1.9-1.9z"/>
                </svg>
            );
        case IconVariant.GITHUB:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 24 24">
                    <path fill={color ? `${color}` : "currentColor"} d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
                </svg>
            );
        case IconVariant.EDIT:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 24 24">
                    <g fill="none" stroke={color ? `${color}` : "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
                    </g>
                </svg>
            );
        case IconVariant.PLAY:
            return (
                <svg width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.409 9.35294C20.8893 9.60835 21.291 9.98963 21.5712 10.4559C21.8514 10.9222 21.9994 11.456 21.9994 11.9999C21.9994 12.5439 21.8514 13.0777 21.5712 13.544C21.291 14.0102 20.8893 14.3915 20.409 14.6469L7.597 21.6139C5.534 22.7369 3 21.2769 3 18.9679V5.03294C3 2.72294 5.534 1.26394 7.597 2.38494L20.409 9.35294Z" stroke={color ? `${color}` : "currentColor"} stroke-width="1.5"/>
                </svg>
            );
        case IconVariant.PLUS:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 24 24">
                    <path fill={color ? `${color}` : "currentColor"} d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"/>
                </svg>
        );
        case IconVariant.MINUS:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 24 24">
                    <path fill={color ? `${color}` : "currentColor"} d="M18 12.998H6a1 1 0 0 1 0-2h12a1 1 0 0 1 0 2"/>
                </svg>
            );
        case IconVariant.UPLOAD:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 24 24">
                    <path fill={color ? `${color}` : "currentColor"} d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16zm-5 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/>
                </svg>
            );
        case IconVariant.NETWORK:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width={`${size ? `${size}em` : "1.5em"}`} height={`${size ? `${size}em` : "1.5em"}`} viewBox="0 0 20 20">
                    <path fill={color ? `${color}` : "currentColor"} d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m7.75-8a8 8 0 0 0 0-4h-3.82a29 29 0 0 1 0 4zm-.82 2h-3.22a14.4 14.4 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14m-8.85-2h3.84a24.6 24.6 0 0 0 0-4H8.08a24.6 24.6 0 0 0 0 4m.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4zm-6.08-2h3.82a29 29 0 0 1 0-4H2.25a8 8 0 0 0 0 4m.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6M3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6"/>
                </svg>
            )
    }
};