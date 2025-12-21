import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  moduleCount: number;
  duration: number; // in hours
}

export function CourseCard({ id, title, description, imageUrl, moduleCount, duration }: CourseCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="relative h-40">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
        <div className="mt-4 flex items-center">
          <span className="text-sm font-medium text-gray-800">{moduleCount} modules</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">{duration} hours</span>
        </div>
        <div className="mt-4">
          <Link href={`/courses/${id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Learn more
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCard;
