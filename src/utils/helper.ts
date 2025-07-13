import slugify from "slugify"

interface IGenerateSlugOption {
  length?: number
  lower?: boolean
}

export function generateId(): string {
  return crypto.randomUUID();
}
// transform, convert, generate, 
export function transformToSlug (text: string, option?: IGenerateSlugOption) {
  const {
    length = 50,
    lower = true
  } = option || {}

  const sluggedText = slugify(text, {
    lower,
    remove: /[_,\.]/,
    strict: true,
    trim: true
  })

  let slug = ''

  for (const part of sluggedText.split('-')) {
    // threshold or limit of the slug is 50
    if (slug.length + part.length >= length) {
      break;
    }
    // concat the word in the communityname slug
    slug = slug.concat(`${slug ? '-' : ''}${part}`)
  }
  return slug
}