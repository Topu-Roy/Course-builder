"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseCategory } from "@/generated/prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

export const CourseFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "ALL";

  const onSelectChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-[200px]">
      <Select value={currentCategory} onValueChange={onSelectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          {Object.values(CourseCategory).map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
