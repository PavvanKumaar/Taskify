import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { type UITask } from "../Context/AppContext";

export type Status = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";

interface KanbanBoardProps {
  tasks: UITask[];
  onMoveTask: (taskId: string, newStatus: string) => void;
  onTaskClick?: (task: UITask) => void;
}

const STATUSES: Status[] = ["Backlog", "Todo", "In Progress", "In Review", "Done"];

const KanbanBoard = ({ tasks, onMoveTask, onTaskClick }: KanbanBoardProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const draggedTask = tasks.find((t) => t.id === activeId);
    if (!draggedTask) return;

    let newStatus: string;
    if (STATUSES.includes(overId as Status)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask || overTask.status === draggedTask.status) return;
      newStatus = overTask.status;
    }

    onMoveTask(activeId, newStatus);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mt-6">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <Column key={status} status={status}>
              <h3 className="mb-3 text-sm font-semibold uppercase text-gray-600 dark:text-gray-400 transition-colors">
                {status} ({columnTasks.length})
              </h3>
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {columnTasks.map((task) => (
                    <SortableTask key={task.id} task={task} onClick={onTaskClick} />
                  ))}
                </div>
              </SortableContext>
            </Column>
          );
        })}
      </div>
    </DndContext>
  );
};

const Column = ({ status, children }: { status: Status; children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className="flex flex-col rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 min-h-[500px] transition-colors">
      {children}
    </div>
  );
};

const SortableTask = ({ task, onClick }: { task: UITask; onClick?: (task: UITask) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={() => onClick?.(task)} />
    </div>
  );
};

export default KanbanBoard;
