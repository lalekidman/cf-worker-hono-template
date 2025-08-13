import { IEntityBaseProperties, IEntityMethodBaseProperties } from "@/utils/entities";

export interface IApplication extends IEntityBaseProperties {
  name: string
  caption: string // not sure if we will support rich text.
  description: string // not sure if we will support rich text.

  published: boolean
  publishedAt: Date

  previewImageURL: string

  author: string //user who created it
}

export interface IApplicationEntity extends IEntityMethodBaseProperties<IApplication> {
  publish(): void
  unpublish(): void
}