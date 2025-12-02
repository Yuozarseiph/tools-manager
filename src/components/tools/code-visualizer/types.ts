import { Node, Edge } from '@xyflow/react';

export type GraphData = {
  nodes: Node[];
  edges: Edge[];
};

export interface ASTNode {
  type: string;
  id: string;
  label: string;
  children?: ASTNode[];
  condition?: string;
  next?: ASTNode;
}
