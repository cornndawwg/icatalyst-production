declare module '@hello-pangea/dnd' {
  export interface DraggableLocation {
    droppableId: string;
    index: number;
  }

  export interface DraggableDescriptor {
    id: string;
    index: number;
    droppableId: string;
  }

  export interface DropResult {
    draggableId: string;
    type: string;
    source: DraggableLocation;
    destination: DraggableLocation | null;
    reason: 'DROP' | 'CANCEL';
  }

  export interface DraggableProvided {
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: any;
    dragHandleProps: any;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    draggingOver: string | null;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: any;
    placeholder?: React.ReactElement | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: string | null;
  }

  export interface DraggableProps {
    draggableId: string;
    index: number;
    children: (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot
    ) => React.ReactElement;
  }

  export interface DroppableProps {
    droppableId: string;
    isDropDisabled?: boolean;
    type?: string;
    direction?: 'horizontal' | 'vertical';
    children: (
      provided: DroppableProvided,
      snapshot: DroppableStateSnapshot
    ) => React.ReactElement;
  }

  export const DragDropContext: React.FC<{
    onDragEnd: (result: DropResult) => void;
    children: React.ReactNode;
  }>;
  
  export const Droppable: React.FC<DroppableProps>;
  export const Draggable: React.FC<DraggableProps>;
}