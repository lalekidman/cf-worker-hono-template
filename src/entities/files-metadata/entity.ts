import {
  makeBaseEntity,
  IEntityBaseDependencies
} from "@/utils/entities"
import {
  IFilesMetadataBase,
  IFilesMetadataEntity,
  FileStatus
} from "./interfaces"

export const makeFilesMetadataEntity = (dependencies: IEntityBaseDependencies): new (data?: Partial<IFilesMetadataBase & {expiresIn: number} >) => IFilesMetadataEntity => {
  class FilesMetadataEntity extends makeBaseEntity(dependencies) implements IFilesMetadataEntity {

    private _status: string = FileStatus.PENDING;
    private _filename: string = '';
    private _filepath: string = '';
    private _contentType: string = '';
    private _filesize: number = 0;
    private _bucketName: string = '';
    private _expiresAt: Date = new Date(Date.now() + (60 * 60 * 1000)); // 1hr

    constructor(data ? : Partial < IFilesMetadataBase & {expiresIn: number} >) {
      super(data);
      const {
        contentType,
        filepath,
        filesize,
        status,
        filename,
        bucketName,
        expiresAt,
        expiresIn
      } = data || {};

      filename && (this.filename = filename);
      filepath && (this.filepath = filepath);
      filesize && (this.filesize = filesize);
      contentType && (this.contentType = contentType);
      bucketName && (this.bucketName = bucketName);
      if (expiresAt) {
        this.expiresAt = expiresAt
      } else if (expiresIn) {
        this.expiresAt = new Date(Date.now() + (60 * 60 * 1000)); // 1hr
      }
      status && (this.status = status);
    }

    /**
     * Getter filename
     * @return {string }
     */
    public get filename(): string  {
      return this._filename;
    }

      /**
       * Setter filename
       * @param {string } value
       */
    public set filename(value: string ) {
      this._filename = value;
    }

      /**
       * Getter filepath
       * @return {string }
       */
    public get filepath(): string  {
      return this._filepath;
    }

      /**
       * Setter filepath
       * @param {string } value
       */
    public set filepath(value: string ) {
      this._filepath = value;
    }

      /**
       * Getter filesize
       * @return {number }
       */
    public get filesize(): number  {
      return this._filesize;
    }

      /**
       * Setter filesize
       * @param {number } value
       */
    public set filesize(value: number ) {
      this._filesize = value;
    }
    /**
     * Getter contentType
     * @return {string }
    */
    public get contentType(): string  {
      return this._contentType;
    }
    /**
     * Setter contentType
     * @param {string } value
     */
    public set contentType(value: string ) {
      this._contentType = value;
    }

    /**
     * Getter bucketName
     * @return {string }
     */
    public get bucketName(): string  {
      return this._bucketName;
    }

    /**
     * Setter bucketName
     * @param {string } value
     */
    public set bucketName(value: string ) {
      this._bucketName = value;
    }

    /**
     * Getter expiresAt
     * @return {Date }
     */
    public get expiresAt(): Date  {
      return this._expiresAt;
    }

      /**
       * Setter expiresAt
       * @param {Date } value
       */
    public set expiresAt(value: Date) {
      this._expiresAt = value;
    }

    /**
     * Getter status
     * @return {string }
     */
    public get status(): string  {
      return this._status;
    }

    /**
     * Setter status
     * @param {string } value
     */
    public set status(value: string ) {
      this._status = value;
    }

    public markAsCompleted() {
      this._status = FileStatus.COMPLETED;
    }
    public markAsFailed() {
      this._status = FileStatus.FAILED;
    }

    public isPending(): boolean {
      return this.status === FileStatus.PENDING.toString();
    }
    public isCompleted(): boolean {
      return this.status === FileStatus.COMPLETED.toString();
    }
    public isFailed(): boolean {
      return this.status === FileStatus.FAILED.toString();
    }
    /**
     * Getter location
     * @param {location }
     */
    public get location() {
      return `${this.filepath}/${this.filename}`;
    }
    public isExpired(): boolean {
      return this.expiresAt.getTime() < Date.now();
    }
    /**
     * 
     * @returns 
     */
    public override toObject(): IFilesMetadataBase {
      return {
        ...(super.toObject()),
        filename: this.filename,
        filepath: this.filepath,
        filesize: this.filesize,
        contentType: this.contentType,
        bucketName: this.bucketName,
        status: this.status,
        expiresAt: this.expiresAt,
      }
    }
  }
  return FilesMetadataEntity
}