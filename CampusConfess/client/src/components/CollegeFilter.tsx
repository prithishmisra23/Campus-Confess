import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CollegeFilterProps {
  selectedCollege: string;
  onCollegeChange: (college: string) => void;
}

const colleges = [
  { id: "all", name: "All Colleges" },
  { id: "SRM University", name: "SRM University" },
  { id: "Delhi University", name: "Delhi University" },
  { id: "IIT Delhi", name: "IIT Delhi" },
  { id: "Amity University", name: "Amity University" },
  { id: "VIT University", name: "VIT University" },
  { id: "BITS Pilani", name: "BITS Pilani" },
];

export default function CollegeFilter({ selectedCollege, onCollegeChange }: CollegeFilterProps) {
  return (
    <section className="container mx-auto px-4 mb-8">
      <Card className="glassmorphism">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Filter by College</h2>
              <p className="text-sm text-muted-foreground">See confessions from your campus</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {colleges.map(college => (
                <Button
                  key={college.id}
                  onClick={() => onCollegeChange(college.id)}
                  variant={selectedCollege === college.id ? "default" : "outline"}
                  className={
                    selectedCollege === college.id
                      ? "bg-primary text-primary-foreground hover:shadow-lg transition-all"
                      : "glassmorphism text-foreground hover:border-primary transition-all"
                  }
                  data-testid={`filter-${college.id}`}
                >
                  {college.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
