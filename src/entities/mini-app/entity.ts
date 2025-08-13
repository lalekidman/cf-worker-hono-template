import {
  IApplication,
  IApplicationEntity,
} from "./interfaces";
import {
  IEntityBaseDependencies,
  makeBaseEntity
} from "@/utils/entities";

export const makeApplicationEntity = (
  deps: IEntityBaseDependencies
): new(data ? : Partial < IApplication > ) => IApplicationEntity => (
  class ApplicationEntity extends makeBaseEntity(deps) implements IApplicationEntity {
    private _name: string = '';
    private _caption: string = '';
    private _description: string = '';
    private _published: boolean = false;
    private _publishedAt: Date = new Date(0);
    private _previewImageURL: string = '';
    private _author: string = '';
    constructor(data ? : Partial < IApplication > ) {
      super(data)
    }
    /**
     * Getter caption
     * @return {string }
     */
    public get caption(): string {
      return this._caption;
    }

    /**
     * Setter caption
     * @param {string } value
     */
    public set caption(value: string) {
      this._caption = value;
    }

    /**
     * Getter name
     * @return {string }
     */
    public get name(): string {
      return this._name;
    }

    /**
     * Setter name
     * @param {string } value
     */
    public set name(value: string) {
      this._name = value;
    }

    /**
     * Getter description
     * @return {string }
     */
    public get description(): string {
      return this._description;
    }

    /**
     * Setter description
     * @param {string } value
     */
    public set description(value: string) {
      this._description = value;
    }

    /**
     * Getter published
     * @return {boolean}
     */
    public get published(): boolean {
      return this._published;
    }

    /**
     */
    public publish() {
      this._published = true;
      this._publishedAt = new Date();
    }

    /**
     */
    public unpublish() {
      this._published = false;
      this._publishedAt = new Date(0);
    }

    /**
     * Getter publishedAt
     * @return {Date}
     */
    public get publishedAt(): Date {
      return this._publishedAt;
    }

    /**
     * Setter publishedAt
     * @param {Date} value
     */
    public set publishedAt(value: Date) {
      this._publishedAt = value;
    }

    /**
     * Getter previewImageURL
     * @return {string }
     */
    public get previewImageURL(): string {
      return this._previewImageURL;
    }

    /**
     * Setter previewImageURL
     * @param {string } value
     */
    public set previewImageURL(value: string) {
      this._previewImageURL = value;
    }

    /**
     * Getter author
     * @return {string }
     */
    public get author(): string {
      return this._author;
    }

    /**
     * Setter author
     * @param {string } value
     */
    public set author(value: string) {
      this._author = value;
    }

    public override toObject() {
        return {
          ...super.toObject(),
          name: this.name,
          caption: this.caption,
          description: this.description,
          previewImageURL: this.previewImageURL,
          author: this.author,
          published: this.published,
          publishedAt: this.publishedAt,
        }
    }
  }
)