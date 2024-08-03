// @/ui/hovered-link.tsx
import React from "react";
import Link from "next/link";

interface HoveredLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const HoveredLink: React.FC<HoveredLinkProps> = ({ href, children, className = "", onClick }) => {
  return (
    <Link href={href} passHref>
      <span 
        className={`cursor-pointer hover:text-blue-600 transition-colors duration-200 ${className}`}
        onClick={onClick}
      >
        {children}
      </span>
    </Link>
  );
};