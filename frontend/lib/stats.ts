import { Users, GraduationCap, Award, TrendingUp } from "lucide-react";
import { meritListData } from "./data/meritList";

interface PropTypes {
  selectedTypes: string[];
  selectedCategories: string[];
  selectedColleges: string[];
  selectedSubjects: string[];
}
export const statistics = ({
  selectedTypes,
  selectedCategories,
  selectedColleges,
  selectedSubjects,
}: PropTypes) => {
  return [
    {
      icon: Users,
      label: "Total Candidates",
      value: meritListData.length.toLocaleString(),
      color: "text-primary",
    },
    {
      icon: GraduationCap,
      label: "Top Percentile",
      value: "99.99%",
      color: "text-secondary",
    },
    {
      icon: Award,
      label: "Colleges",
      value: new Set(
        meritListData.map((c) => c.admittedCollege)
      ).size.toString(),
      color: "text-accent",
    },
    {
      icon: TrendingUp,
      label: "Active Filters",
      value: (
        selectedTypes.length +
        selectedCategories.length +
        selectedColleges.length +
        selectedSubjects.length
      ).toString(),
      color: "text-chart-1",
    },
  ];
};
