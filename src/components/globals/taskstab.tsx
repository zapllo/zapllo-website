"use client"
// TasksTab.tsx
import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import DashboardAnalytics from "@/components/globals/dashboardAnalytics"
import { Label } from "../ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet"
import { Button } from "../ui/button"

interface Task {
  title: string;
  user: string;
  description: string;
  assignedUser: string;
  categories: string[];
  priority: string;
  repeatType?: string;
  repeat: boolean;
  days?: string[];
  dueDate: string;
  attachment?: string;
  links?: string[];
  status: string;
}

interface TasksTabProps {
  tasks: Task[];
}

export default function TasksTab({ tasks }: TasksTabProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex gap-4">
            <TabsTrigger value="all">Dashboard</TabsTrigger>
            <TabsTrigger value="admin">My Tasks</TabsTrigger>
            <TabsTrigger value="manager">Delegated Tasks</TabsTrigger>
            <TabsTrigger value="team-member">All Tasks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {activeTab === "all" ? (
        <div>
          <DashboardAnalytics />
        </div>
      ) : (
        <div className="grid text-sm gap-4">
          {tasks.map((task) => (
            <div key={task.title}>
              <Card
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>{task.user}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{task.description}</p>
                    <p className="text-muted-foreground">{task.priority}</p>
                  </div>
                </div>
                <Badge>{task.dueDate}</Badge>
              </Card>
              {selectedTask && selectedTask.title === task.title && (
                <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>{selectedTask.title}</SheetTitle>
                      <SheetDescription>
                        Task details .
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <h1 id="title" className="col-span-3">{selectedTask.title}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="user" className="text-right">
                          User
                        </Label>
                        <h1 id="user" className="col-span-3">{selectedTask.user}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <h1 id="description" className="col-span-3">{selectedTask.description}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assignedUser" className="text-right">
                          Assigned User
                        </Label>
                        <h1 id="assignedUser" className="col-span-3">{selectedTask.assignedUser}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categories" className="text-right">
                          Categories
                        </Label>
                        <h1 id="categories" className="col-span-3">{selectedTask.categories.join(', ')}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                          Priority
                        </Label>
                        <h1 id="priority" className="col-span-3">{selectedTask.priority}</h1>
                      </div>
                      {selectedTask.repeatType && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="repeatType" className="text-right">
                            Repeat Type
                          </Label>
                          <h1 id="repeatType" className="col-span-3">{selectedTask.repeatType}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repeat" className="text-right">
                          Repeat
                        </Label>
                        <h1 id="repeat" className="col-span-3">{selectedTask.repeat ? 'Yes' : 'No'}</h1>
                      </div>
                      {selectedTask.days && selectedTask.days.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="days" className="text-right">
                            Days
                          </Label>
                          <h1 id="days" className="col-span-3">{selectedTask.days.join(', ')}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <h1 id="dueDate" className="col-span-3">{new Date(selectedTask.dueDate).toLocaleDateString()}</h1>
                      </div>
                      {selectedTask.attachment && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="attachment" className="text-right">
                            Attachment
                          </Label>
                          <h1 id="attachment" className="col-span-3">{selectedTask.attachment}</h1>
                        </div>
                      )}
                      {selectedTask.links && selectedTask.links.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="links" className="text-right">
                            Links
                          </Label>
                          <h1 id="links" className="col-span-3">{selectedTask.links.join(', ')}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <h1 id="status" className="col-span-3">{selectedTask.status}</h1>
                      </div>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant="outline" onClick={() => setSelectedTask(null)}>Close</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
