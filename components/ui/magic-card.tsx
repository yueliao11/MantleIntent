"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const gradientSizeSpring = useSpring(1000);
  const gradientOpacitySpring = useSpring(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (cardRef.current) {
        const { left, top } = cardRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
        gradientSizeSpring.set(400);
        gradientOpacitySpring.set(0.3);
      }
    },
    [mouseX, mouseY, gradientSizeSpring, gradientOpacitySpring],
  );

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      if (!e.relatedTarget) {
        document.removeEventListener("mousemove", handleMouseMove);
        mouseX.set(0);
        mouseY.set(0);
        gradientSizeSpring.set(1000);
        gradientOpacitySpring.set(0);
      }
    },
    [handleMouseMove, mouseX, mouseY, gradientSizeSpring, gradientOpacitySpring],
  );

  const handleMouseEnter = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMove);
    mouseX.set(0);
    mouseY.set(0);
    gradientSizeSpring.set(400);
    gradientOpacitySpring.set(0.3);
  }, [handleMouseMove, mouseX, mouseY, gradientSizeSpring, gradientOpacitySpring]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [handleMouseEnter, handleMouseMove, handleMouseOut]);

  useEffect(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex size-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border text-black dark:text-white",
        className,
      )}
    >
      <div className="relative">{children}</div>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${gradientSizeSpring.get()}px circle at ${mouseX.get()}px ${mouseY.get()}px, ${gradientColor}, transparent 100%)`,
          opacity: gradientOpacitySpring.get(),
        }}
      />
    </div>
  );
}
