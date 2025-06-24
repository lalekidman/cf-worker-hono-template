

export interface IRandomStringOption {
  length?: number,
  charset: 'numeric' | 'alphabet' | 'alphanumeric',
  capitalization?: 'uppercase' | 'lowercase'
}

export type IRandomString = (option: IRandomStringOption) => string