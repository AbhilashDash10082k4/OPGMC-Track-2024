export const getRankBadgeColor = (rank: number) => {
  // Example: you can vary color by top ranks; keep same for now but reference the value to satisfy linter
  return rank <= 3
    ? "bg-primary text-primary-foreground"
    : "bg-primary text-primary-foreground";
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "UR":
      return "text-primary";
    case "OBC":
      return "text-secondary";
    case "SC":
      return "text-accent";
    case "ST":
      return "text-chart-1";
    default:
      return "text-foreground";
  }
};
