import { generate } from "random-words"


export function generatePassphrase(): string {
  const randomWords = generate({ exactly: 4, maxLength: 8, minLength: 4 });
  return randomWords.join("-")
}
