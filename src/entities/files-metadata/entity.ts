import {
  makeBaseEntity,
  IEntityBaseDependencies
} from "@/utils/entities"
import {
  IFilesMetadataBase,
  IFilesMetadataEntity
} from "./interfaces"

export const makeFilesMetadataEntity = (dependencies: IEntityBaseDependencies): new (data?: Partial<IFilesMetadataBase>) => IFilesMetadataEntity => {
  class FilesMetadataEntity extends makeBaseEntity(dependencies) implements IFilesMetadataEntity {

    private _uploaded: boolean = false;
    private _filename: string = '';
    private _filepath: string = '';
    private _contentType: string = '';
    private _filesize: number = 0;
    private _expiresIn: number = 3600; // 1hr

    constructor(data ? : Partial < IFilesMetadataBase >) {
      super(data);
      const {
        contentType,
        filepath,
        filesize,
        uploaded,
        filename,
        expiresIn,
      } = data || {};

      filename && (this.filename = filename);
      filepath && (this.filepath = filepath);
      filesize && (this.filesize = filesize);
      contentType && (this.contentType = contentType);
      typeof expiresIn === 'number' && (this.expiresIn = expiresIn);
      typeof uploaded === 'boolean' && uploaded && this.markAsUploaded();
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
     * Getter expiresIn
     * @return {number }
     */
    public get expiresIn(): number  {
      return this._expiresIn;
    }

      /**
       * Setter expiresIn
       * @param {number } value
       */
    public set expiresIn(value: number ) {
      this._expiresIn = value;
    }

    /**
     * Getter uploaded
     * @return {boolean }
     */
    public get uploaded(): boolean  {
      return this._uploaded;
    }
    public markAsUploaded(): boolean {
      this._uploaded = true;
      return this.uploaded;
    }
    /**
     * Getter location
     * @param {location }
     */
    public get location() {
      return `${this.filepath}/${this.filename}`;
    }
    public isExpired(): boolean {
      return (this.createdAt.getTime() + (this.expiresIn * 1000)) < Date.now();
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
        uploaded: this.uploaded,
        expiresIn: this.expiresIn,
      }
    }
  }
  return FilesMetadataEntity
}