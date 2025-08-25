import {
  IEntityBaseProperties,
  IEntityMethodBaseProperties
} from '@/utils/entities'

export enum FileStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  ACTIVE = 'active'
}

export interface IFilesMetadataBase extends IEntityBaseProperties {
  status: string
  filename: string
  filepath: string
  contentType: string
  filesize: number
  bucketName: string
  expiresAt: Date
  resourceType: string
  resourceId: string
  purpose: string
  // and purpose? like avatar/profile?
}

export interface IFilesMetadataEntity extends IEntityMethodBaseProperties<IFilesMetadataBase> {
  activate (): void
  fail (): void
  isActive (): boolean
  isFailed (): boolean
  isPending (): boolean
  isExpired(): boolean
  location: string
}
