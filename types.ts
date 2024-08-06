// types.ts

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    organization: string;
  }
  
  export interface Comment {
    _id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
    status: string;
  }
  
  export interface Category {
    _id: string;
    name: string;
    organization: string;
  }
  
  export interface Task {
    _id: string;
    title: string;
    user: User;
    description: string;
    assignedUser: User;
    category: Category;
    priority: string;
    repeatType: string;
    repeat: boolean;
    days?: string[];
    dates?: string[];
    categories?: string[];
    dueDate: string;
    attachment?: string;
    links?: string[];
    status: string;
    comments: Comment[];
    createdAt: string;
  }
  