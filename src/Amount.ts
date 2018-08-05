export type SignModes = 'always' | 'onlyPositive' | 'onlyNegative' | 'never'

const irregularExponents: { [currencyCode: string]: number } = {
  BIF: 0,
  CLP: 0,
  CVE: 0,
  DJF: 0,
  GNF: 0,
  ISK: 0,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  PYG: 0,
  RWF: 0,
  UGX: 0,
  UYI: 0,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
  MGA: 1,
  MRU: 1,
  BHD: 3,
  IQD: 3,
  JOD: 3,
  KWD: 3,
  LYD: 3,
  OMR: 3,
  TND: 3,
  CLF: 4
}

export class Amount {
  private readonly domestic: SimpleAmount
  private readonly local?: SimpleAmount
  private readonly formatter: Intl.NumberFormat

  constructor({ domestic, local }: AmountOpts) {
    if (!domestic) throw new TypeError('provide an amount')

    if (!('amount' in domestic) || typeof domestic.amount !== 'number') {
      throw new TypeError('provide a valid value')
    }
    if (!('currency' in domestic) || typeof domestic.currency !== 'string') {
      throw new TypeError('provide a valid currency')
    }

    if (local && (!('amount' in local) || typeof local.amount !== 'number')) {
      throw new TypeError('provide a valid value')
    }
    if (
      local &&
      (!('currency' in local) || typeof local.currency !== 'string')
    ) {
      throw new TypeError('provide a valid currency')
    }

    this.domestic = domestic
    this.local = local

    const language =
      (typeof navigator !== 'undefined' &&
        navigator &&
        (navigator.language || navigator.browserLanguage)) ||
      'en-GB'

    this.formatter = Intl.NumberFormat(language, {
      style: 'currency',
      currency: this.domestic.currency,
      minimumFractionDigits: this.exponent
    })
  }

  get currency(): string {
    return this.domestic.currency
  }

  // returns true if not home currency
  get foreign(): boolean {
    return !!this.local
  }

  // returns local currency as native currency
  get exchanged(): Amount | undefined {
    if (this.local) return new Amount({ domestic: this.local })
    else return
  }

  // returns true if negative amount
  get negative(): boolean {
    return this.domestic.amount <= 0
  }

  // returns true if positive amount
  get positive(): boolean {
    return !this.negative
  }

  // returns sign
  get sign(): string {
    return this.negative ? '-' : '+'
  }

  // returns amount in major units (no truncation)
  get amount(): number {
    return Math.abs(this.domestic.amount) / this.scale
  }

  get exponent(): number {
    return irregularExponents.hasOwnProperty(this.domestic.currency)
      ? irregularExponents[this.domestic.currency]
      : 2
  }

  // return number of minor units in major
  get scale(): number {
    return 10 ** this.exponent
  }

  // returns raw amount from api
  get raw(): number {
    return this.domestic.amount
  }

  // returns formatted parts array
  formatParts({
    showCurrency = true,
    signMode = 'always'
  }: AmountFormatOpts = {}): Intl.NumberPart[] {
    type NumPartFilterFn = (part: Intl.NumberPart) => boolean

    const parts = this.formatter.formatToParts(this.amount)

    if (this.positive) {
      parts.unshift({
        type: 'plusSign',
        value: '+'
      })
    } else {
      parts.unshift({
        type: 'minusSign',
        value: '−'
      })
    }

    const strfpart: { [T in Intl.NumberPartTypes]?: NumPartFilterFn } = {
      currency: () => {
        return showCurrency
      },
      minusSign: () => {
        return signMode === 'always' || signMode === 'onlyNegative'
      },
      plusSign: () => {
        return signMode === 'always' || signMode === 'onlyPositive'
      }
    }

    return parts.filter(({ type, value }) => {
      if (strfpart.hasOwnProperty(type)) {
        return (strfpart[type] as NumPartFilterFn)({ type, value })
      } else {
        return true
      }
    })
  }

  // returns formatted string
  format(formatOpts?: AmountFormatOpts): string {
    return this.formatParts(formatOpts).reduce(
      (str, part) => str + part.value,
      ''
    )
  }

  // returns formatted html string
  html(formatOpts?: AmountFormatOpts): string {
    const str = this.formatParts(formatOpts)
      .map(({ type, value }) => `<span class="amount__${type}">${value}</span>`)
      .reduce((str, part) => str + part)

    // construct wrapper
    const el = document.createElement('span')
    el.classList.add('amount')
    el.dataset.positive = this.positive ? 'positive' : 'negative'
    el.dataset.currency = this.currency
    el.innerHTML = str

    return el.outerHTML
  }

  get json(): AmountOpts {
    return {
      domestic: this.domestic,
      local: this.local
    }
  }

  get stringify(): string {
    return JSON.stringify(this.json)
  }

  add(amount: Amount): Amount {
    if (this.currency !== amount.currency) {
      throw new Error('amounts cannot be added')
    }

    return new Amount({
      domestic: {
        amount: this.raw + amount.raw,
        currency: this.currency
      }
    })
  }

  toString(): string {
    return this.format()
  }

  valueOf(): number {
    return this.domestic.amount
  }
}

export interface CurrencyDefinition {
  symbol: string
  separator: string
}

export interface CurrencyLibrary {
  [currency: string]: CurrencyDefinition
}

export interface SimpleAmount {
  // always use subunits
  amount: number
  // three-letter currency code
  currency: string
}

export interface AmountOpts {
  domestic: SimpleAmount
  local?: SimpleAmount
}

export interface AmountFormatOpts {
  showCurrency?: boolean
  signMode?: SignModes
}

export interface MonzoBalanceResponse {
  balance: number
  total_balance: number
  currency: string
  local_currency: string
  local_exchange_rate: number
  local_spend: {
    spend_today: number
    currency: string
  }[]
  spend_today: number
}
