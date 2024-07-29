import { cn } from "../../utils/cn";
import { useState, useRef, useEffect } from "react";

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    containerRef.current.style.setProperty("--x", x.toString());
    containerRef.current.style.setProperty("--y", y.toString());
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={cn(
        "flex items-center justify-center",
        containerClassName
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center relative transition-all duration-200 ease-linear",
          className
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered
            ? "perspective(1000px) rotateX(var(--_rx,0deg)) rotateY(var(--_ry,0deg)) scale3d(1.02,1.02,1.02)"
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-96 w-96 [transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.transform = `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
  }, [translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <Tag
      ref={ref}
      className={cn("absolute left-0 top-0", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};