export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  timestamp: Date;
  replies: Reply[];
  selection: {
    text: string;
    start: number;
    end: number;
  };
}

export interface Reply {
  id: string;
  text: string;
  userId: string;
  timestamp: Date;
}
