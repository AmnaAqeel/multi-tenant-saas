const statusStyles = {
    "in-progress": "bg-blue text-blue",
    "on-hold": "bg-yellow text-yellow",
    "not-started": "bg-pink-100 text-pink-600",
    "to-do": "bg-green text-green",
    cancelled: "bg-red text-red-600",
    completed: "bg-orange text-orange",
    archived : "bg-gray-200 text-gray-800"
  };
  
  const statusLabels = {
    "in-progress": "In Progress",
    "on-hold": "On Hold",
    "not-started": "Not Started",
    "to-do": "To Do",
    cancelled: "Cancelled",
    completed: "Completed",
    archived: "Archived"
  };
  
  const StatusBadge = ({ status, className = "" }) => {
    const baseStyle = "rounded-xl text-sm px-3 py-1 md:px-2 md:py-1";
    const dynamicStyle = statusStyles[status] || "bg-gray-100 text-gray-600";
    const label = statusLabels[status] || "Unknown";
  
    return (
      <span className={`${baseStyle} ${dynamicStyle} ${className}`}>
        {label}
      </span>
    );
  };
  
  export default StatusBadge;
  