import {
  IEntityBaseProperties,
  IEntityMethodBaseProperties
} from '@/utils/entities'

export interface IFilesMetadataBase extends IEntityBaseProperties {
  uploaded: boolean
  filename: string
  filepath: string
  contentType: string
  filesize: number
  expiresIn: number
}

export interface IFilesMetadataEntity extends IEntityMethodBaseProperties<IFilesMetadataBase> {
  markAsUploaded (): boolean
  isExpired(): boolean
}
