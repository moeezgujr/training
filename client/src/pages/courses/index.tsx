import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CourseCard } from "@/components/course/course-card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  BookOpen, 
  SlidersHorizontal,
  X,
} from "lucide-react";

export default function CoursesPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    tags: [] as string[],
    sort: "newest",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch all courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });
  
  // Filter courses based on search and filters
  const filteredCourses = courses
    .filter((course: any) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesDescription = course.description.toLowerCase().includes(query);
        const matchesInstructor = course.instructorName.toLowerCase().includes(query);
        
        if (!(matchesTitle || matchesDescription || matchesInstructor)) {
          return false;
        }
      }
      
      // Tag filters
      if (filters.tags.length > 0) {
        const courseTags = course.tags || [];
        if (!filters.tags.some(tag => courseTags.includes(tag))) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a: any, b: any) => {
      // Sort based on selected option
      switch (filters.sort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "popular":
          return (b.enrolledCount || 0) - (a.enrolledCount || 0);
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  
  // Pagination
  const coursesPerPage = 9;
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      tags: [],
      sort: "newest",
    });
    setCurrentPage(1);
  };
  
  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setFilters(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      
      return { ...prev, tags: newTags };
    });
    setCurrentPage(1);
  };
  
  // Get all unique tags from the courses
  const allTags = Array.from(
    new Set(
      courses
        .flatMap((course: any) => course.tags || [])
        .filter(Boolean)
    )
  ).sort();
  
  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else {
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              );
              
              if (i === 1) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              
              if (i === 3) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              );
              
              pageNum = currentPage + i - 2;
            }
            
            return (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  // Header bar with search and filters
  const CourseSearchBar = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      <div className="flex gap-2">
        <Select
          value={filters.sort}
          onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
            <SelectItem value="za">Z-A</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant={showFilters ? "default" : "outline"} 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
    </div>
  );
  
  // Active filters display and clear button
  const ActiveFilters = () => (
    (filters.tags.length > 0 || searchQuery) ? (
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="text-sm text-muted-foreground flex items-center">
          <Filter className="h-4 w-4 mr-1" />
          Active filters:
        </div>
        
        {searchQuery && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Search: {searchQuery}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => setSearchQuery("")}
            />
          </Badge>
        )}
        
        {filters.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => toggleTagFilter(tag)}
            />
          </Badge>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground h-7"
        >
          Clear all
        </Button>
      </div>
    ) : null
  );
  
  // Filter sidebar
  const FilterSidebar = () => (
    <div className={`space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
      <div>
        <h3 className="font-medium mb-4 flex items-center">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter by Tags
        </h3>
        <div className="space-y-3">
          {allTags.map(tag => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag}`}
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => toggleTagFilter(tag)}
              />
              <label
                htmlFor={`tag-${tag}`}
                className="text-sm cursor-pointer"
              >
                {tag}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-full max-w-xl mb-8" />
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 shrink-0">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/5" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Courses</h1>
      
      <CourseSearchBar />
      <ActiveFilters />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter sidebar */}
        <div className="md:w-64 shrink-0">
          <FilterSidebar />
        </div>
        
        {/* Course grid */}
        <div className="flex-1">
          {paginatedCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-10 w-10" />}
              title="No courses found"
              description="Try adjusting your search or filter criteria to find courses."
              actionText="Clear filters"
              actionOnClick={resetFilters}
              size="md"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              
              <PaginationControls />
            </>
          )}
        </div>
      </div>
    </div>
  );
}