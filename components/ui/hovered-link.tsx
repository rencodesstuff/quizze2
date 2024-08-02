// components/ui/hovered-link.tsx
import React from 'react';
import Link from 'next/link';

interface HoveredLinkProps {
  href: string;
  children: React.ReactNode;
}

export const HoveredLink: React.FC<HoveredLinkProps> = ({ href, children }) => {
  return (
    <Link href={href}>
      <span className="text-gray-600 hover:text-blue-600 transition-colors duration-300 cursor-pointer">
        {children}
      </span>
    </Link>
  );
};