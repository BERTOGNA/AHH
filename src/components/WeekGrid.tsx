// Placeholder: implementado pelo líder (grade semanal). Interface estável:
import type { Completion, Member, RoutineBlock, Task } from '../db/types'
export interface WeekGridProps {
  members: Member[]
  routines: RoutineBlock[]
  tasks: Task[]
  completions?: Completion[]
  date: string // qualquer dia da semana mostrada
  editable?: boolean
  onTaskTap?: (task: Task, date: string) => void
  onRoutineTap?: (r: RoutineBlock) => void
}
export function WeekGrid(_: WeekGridProps) {
  return <div>Semana</div>
}
