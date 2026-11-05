import Dexie, { type EntityTable, type Table } from 'dexie'
import type {
  AchievementUnlock, Completion, Member, Mission, Redemption, Reward, RoutineBlock, Settings, Task, Thanks,
} from './types'

export const db = new Dexie('reino-da-familia') as Dexie & {
  members: EntityTable<Member, 'id'>
  routines: EntityTable<RoutineBlock, 'id'>
  tasks: EntityTable<Task, 'id'>
  completions: EntityTable<Completion, 'id'>
  rewards: EntityTable<Reward, 'id'>
  redemptions: EntityTable<Redemption, 'id'>
  thanks: EntityTable<Thanks, 'id'>
  unlocks: Table<AchievementUnlock, [string, string]>
  missions: EntityTable<Mission, 'weekKey'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  members: 'id, order',
  routines: 'id, memberId',
  tasks: 'id',
  completions: 'id, date, taskId, status, *memberIds',
  rewards: 'id',
  redemptions: 'id, memberId, status',
  thanks: 'id, date, toId',
  unlocks: '[memberId+achievementId], memberId',
  missions: 'weekKey',
  settings: 'id',
})

export const SCHEMA_VERSION = 1

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  kingdomName: 'Reino de Aurora',
  onboardingDone: false,
  parentTitle: 'rei',
  adultChest: false,
  sounds: true,
  vibration: true,
  demo: false,
  nextMissionIndex: 0,
}
