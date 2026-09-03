export type EntityId = number | string

export type MaybeEntityId = EntityId | null | undefined

export const hasId = (id: MaybeEntityId): id is EntityId => {
  return id !== null && id !== undefined && id !== ''
}
