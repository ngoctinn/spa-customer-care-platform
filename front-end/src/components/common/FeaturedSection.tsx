// src/components/common/FeaturedSection.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface FeaturedSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  viewAllLink: string;
  viewAllText?: string;
}

export function FeaturedSection({
  title,
  description,
  children,
  viewAllLink,
  viewAllText = "Xem tất cả",
}: FeaturedSectionProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {children}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href={viewAllLink}>
              {viewAllText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
