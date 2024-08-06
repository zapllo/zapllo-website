import { IconProgress } from "@tabler/icons-react";
import { CheckCircle, Circle, CircleAlert, Clock } from "lucide-react";

interface TaskSummaryProps {
    overdueTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    delayedTasks: number;
    inTimeTasks: number;
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({
    overdueTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    delayedTasks,
    inTimeTasks
}) => {
    return (
        <div className=" grid grid-cols-6  gap-4 mb-8 rounded-lg shadow-md">
            {/* <h2 className="text-lg font-medium mb-4">Task Summary</h2> */}

            <div className="border px-4 py-1 h-fit flex gap-4 rounded-xl">
                <CircleAlert className="text-red-500 h-8 " />
                <div>
                    <p className="text-sm">Overdue </p>
                    <h1 className="font-bold text-lg">{overdueTasks}</h1>
                </div>
            </div>
            <div className="border px-4 py-1 h-fit flex gap-4 rounded-xl">
                <Circle className="text-red-400 h-8 " />
                <div>
                    <p className="text-sm">Pending </p>
                    <h1 className="font-bold text-lg">{pendingTasks}</h1>
                </div>
            </div>
            <div className="border px-4  py-1 h-fit flex gap-4 rounded-xl">
                <IconProgress className="text-orange-500 h-8 " />
                <div>
                    <p className="text-sm">Progress </p>
                    <h1 className="font-bold text-lg">{inProgressTasks}</h1>
                </div>
            </div>

            <div className="border px-4 py-1 h-fit flex gap-4 rounded-xl">
                <CheckCircle className="text-green-500 h-8 " />
                <div>
                    <p className="text-sm">Completed </p>
                    <h1 className="font-bold text-lg">{completedTasks}</h1>
                </div>
            </div>
            <div className="border px-4 py-1 h-fit flex gap-4 rounded-xl">
                <Clock className="text-green-500 h-8 " />
                <div>
                    <p className="text-sm">In Time </p>
                    <h1 className="font-bold text-lg">{inTimeTasks}</h1>
                </div>
            </div>
            <div className="border px-4 py-1 h-fit flex gap-4 rounded-xl">
                <CheckCircle className="text-red-500 h-8 " />
                <div>
                    <p className="text-sm">Delayed </p>
                    <h1 className="font-bold text-lg">{delayedTasks}</h1>
                </div>
            </div>
        </div>
    );
};
