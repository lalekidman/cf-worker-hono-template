import {
  IEntityBaseProperties,
  IEntityMethodBaseProperties
} from '@/utils/entities'

export enum FileStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  COMPLETED = 'completed'
}

export interface IFilesMetadataBase extends IEntityBaseProperties {
  status: string
  filename: string
  filepath: string
  contentType: string
  filesize: number
  bucketName: string
  expiresAt: Date
}

export interface IFilesMetadataEntity extends IEntityMethodBaseProperties<IFilesMetadataBase> {
  markAsCompleted (): void
  markAsFailed (): void
  isCompleted (): boolean
  isFailed (): boolean
  isPending (): boolean
  isExpired(): boolean
}
