import { SequenceMatcher } from 'difflib-ts'

export function createRedlines() {
  let _seq1: RegExpMatchArray | null
  let _seq2: RegExpMatchArray | null
  function setSource(source: string) {
    _seq1 = tokenizeText(concatenateParagraphsAndAddChr182(source || ''))
  }
  function setTest(test: string | null = null) {
    _seq2 = tokenizeText(concatenateParagraphsAndAddChr182(test || ''))
  }
  // "she ¶ said ¶ hello" => ["she", " ¶ ", "said", " ¶ ", "hello"]
  function tokenizeText(text: string) {
    const tokenizer = /((?:[^()\s]+|[().?!-])\s*)/g
    return text.match(tokenizer)
  }

  function splitParagraphs(text: string): string[] {
    const paragraphPattern = /((?:\n *)+)/g
    const spacePattern = /^\s*$/g
    const splitText = text.split(paragraphPattern)
    const result: string[] = []
    for (const s of splitText) {
      if (s && !spacePattern.test(s))
        result.push(s.trim())
    }
    return result
  }

  // "she\nsaid\nhello" => "she ¶ said ¶ hello"
  function concatenateParagraphsAndAddChr182(text: string): string {
    const paragraphs = splitParagraphs(text)
    const result = []
    for (const p of paragraphs)
      result.push(p, ' ¶ ')

    if (paragraphs.length > 0)
      result.pop()

    return result.join('')
  }

  function getOpcodes(): [string, number, number, number, number][] {
    if (_seq2 === null || _seq1 === null)
      throw new Error('No test string was provided when the function was called, or during initialisation.')
    const matcher = new SequenceMatcher(null, _seq1, _seq2)
    return matcher.getOpcodes()
  }

  function getErrorOutputMarkdown(text: string): string {
    return `<span style="color:#d03050;font-weight:700;background-color: rgba(208, 48, 80, 0.16)">${text}</span>`
  }
  function getOutputMarkdown(): string {
    const result: string[] = []
    let md_styles = { ins: ['ins', 'ins'], del: ['del', 'del'] }
    md_styles = {
      ins: ['span style="color: #18a058;background-color: rgba(24, 160, 88, 0.16);font-weight:700;"', 'span'],
      del: [
        'span style="color:#d03050;font-weight:700;background-color: rgba(208, 48, 80, 0.16);text-decoration:line-through;"',
        'span',
      ],
    }
    if (_seq1 === null || _seq2 === null)
      return ''

    for (const [tag, i1, i2, j1, j2] of getOpcodes()) {
      if (tag === 'equal') {
        let temp_str = _seq1.slice(i1, i2).join('')
        temp_str = temp_str.replace(/¶ /g, '<br/>')
        result.push(temp_str)
      }
      else if (tag === 'insert') {
        const temp_str = _seq2.slice(j1, j2).join('')
        const splits = temp_str.split('¶ ')
        for (const split of splits) {
          result.push(`<${md_styles.ins[0]}>${split}</${md_styles.ins[1]}>`)
          result.push('<br/>')
        }
        if (splits.length > 0)
          result.pop()
      }
      else if (tag === 'delete') {
        result.push(`<${md_styles.del[0]}>${_seq1.slice(i1, i2).join('')}</${md_styles.del[1]}>`)
      }
      else if (tag === 'replace') {
        result.push(`<${md_styles.del[0]}>${_seq1.slice(i1, i2).join('')}</${md_styles.del[1]}>`)
        const temp_str = _seq2.slice(j1, j2).join('')
        const splits = temp_str.split('¶ ')
        for (const split of splits) {
          result.push(`<${md_styles.ins[0]}>${split}</${md_styles.ins[1]}>`)
          result.push('<br/>')
        }
        if (splits.length > 0)
          result.pop()
      }
    }

    return result.join('')
  }
  return {
    getErrorOutputMarkdown,
    getOutputMarkdown,
    setSource,
    setTest,
  }
}
//
export const rl = createRedlines()
