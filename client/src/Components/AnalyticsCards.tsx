import { CheckCircle, Clock, ListTodo, AlertTriangle } from "lucide-react";
import type { UITask } from "../Context/AppContext";

interface AnalyticsCardsProps {
  tasks: UITask[];
}

const AnalyticsCards = ({ tasks }: AnalyticsCardsProps) => {
  const cards = [
    { title: "Total Tasks", value: tasks.length, icon: <ListTodo className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100" },
    { title: "In Progress", value: tasks.filter((t) => t.status === "In Progress").length, icon: <Clock className="h-5 w-5 text-yellow-600" />, bg: "bg-yellow-100" },
    { title: "Completed", value: tasks.filter((t) => t.status === "Done").length, icon: <CheckCircle className="h-5 w-5 text-green-600" />, bg: "bg-green-100" },
    { title: "High Priority", value: tasks.filter((t) => t.priority === "High").length, icon: <AlertTriangle className="h-5 w-5 text-red-600" />, bg: "bg-red-100" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
      {cards.map((card) => (
        <div key={card.title} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>{card.icon}</div>
          <div>
            <p className="text-xl font-semibold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
