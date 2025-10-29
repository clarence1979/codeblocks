export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Block {
  position: Position;
  material: number;
}

export interface Lesson {
  id: number;
  volume: number;
  title: string;
  description: string;
  code: string;
  instructions: string;
}

export interface Material {
  id: number;
  name: string;
  color: string;
}
