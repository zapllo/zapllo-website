"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Task {
  title: string;
  description: string;
  user: string;
  priority: string;
  dueDate: string;
}
interface TasksTabProps {
  tasks: Task[];
}

export default function TasksTab({ tasks }: TasksTabProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)


 

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
      <div className="grid text-sm gap-4">
        {tasks
          .map((task) => (
            <Card key={task.title} className="flex items-center justify-between">
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
          ))}
      </div>
    </div>
  )
}
