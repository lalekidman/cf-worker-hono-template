
import { generateId } from '@/utils/helper'
import {
  makeFilesMetadataEntity
} from './entity'

export * from './interfaces'
export class FilesMetadataEntity extends makeFilesMetadataEntity({
  generateId,
}) {}
