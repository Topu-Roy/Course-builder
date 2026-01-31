"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COURSE_CATEGORIES } from "@/lib/constants";

export const CourseFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "ALL";

  const onSelectChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-[200px]">
      <Select value={currentCategory} onValueChange={onSelectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          {COURSE_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
