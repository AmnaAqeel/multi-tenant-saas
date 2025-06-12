const priorityStyles = {
    low: "bg-green text-green",
    medium: "bg-yellow text-yellow",
    high: "bg-red-100 text-red-700",
    urgent: "bg-orange-100 text-orange-600",
  };
  
  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };
  
  const PriorityBadge = ({ priority, className = "" }) => {
    const baseStyle = "rounded-xl text-sm px-3 py-1.5 md:px-2 md:py-1";
    const dynamicStyle = priorityStyles[priority] || "bg-gray-100 text-gray-600";
    const label = priorityLabels[priority] || "Unknown";
  
    return (
      <span className={`${baseStyle} ${dynamicStyle} ${className}`}>
        {label}
      </span>
    );
  };
  
  export default PriorityBadge;
  