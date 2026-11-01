"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant =
  | "fade-up"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "scale-up"
  | "bounce-in";

interface AnimateInProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
  once?: boolean;
  as?: React.ElementType;
}

const variantClass: Record<AnimationVariant, string> = {
  "fade-up":    "animate-fade-up",
  "fade-in":    "animate-fade-in",
  "slide-left": "animate-slide-left",
  "slide-right":"animate-slide-right",
  "slide-up":   "animate-slide-up",
  "scale-up":   "animate-scale-up",
  "bounce-in":  "animate-bounce-in",
};

export function AnimateIn({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  once = true,
  as: Tag = "div",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    // @ts-expect-error – polymorphic ref
    <Tag
      ref={ref}
      className={cn(
        visible ? variantClass[variant] : "opacity-0",
        className,
      )}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
