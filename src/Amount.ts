import { JSONMap } from 'json-types'

export const enum Currencies {
  EUR = 'EUR',
  GBP = 'GBP',
  USD = 'USD'
}

const currencies: CurrencyMetadataMap = {
  [Currencies.EUR]: { symbol: '€', separator: '.' },
  [Currencies.GBP]: { symbol: '£', separator: '.' },
  [Currencies.USD]: { symbol: '$', separator: '.' }
}

export const enum SignModes {
  Always,
  OnlyPositive,
  OnlyNegative,
  Never
}

export const validateAmountOpts = (opts: AmountOpts) => {
  if (typeof opts !== 'object') {
    throw new TypeError('Constructor argument must be an object')
  }

  if (typeof opts.native !== 'object') {
    throw new TypeError(
      'Constructor must have a defined `native` property of type `object`'
    )
  }

  if (typeof opts.native.amount !== 'number') {
    throw new TypeError("`native`'s `amount` property must be of type `number`")
  }

  if (typeof opts.native.currency !== 'string') {
    throw new TypeError(
      "`native`'s `currency` property must be of type `string`"
    )
  }

  if (opts.local) {
    if (typeof opts.local !== 'object') {
      throw new TypeError(
        "Constructor's `local` property must be of type `object`"
      )
    }

    if (typeof opts.local.amount !== 'number') {
      throw new TypeError(
        "`local`'s `amount` property must be of type `number`"
      )
    }

    if (typeof opts.local.currency !== 'string') {
      throw new TypeError(
        "`local`'s `currency` property must be of type `string`"
      )
    }
  }
}

export class Amount {
  private readonly native: SimpleAmount
  private readonly local?: SimpleAmount

  constructor(opts: AmountOpts) {
    validateAmountOpts(opts)

    this.native = opts.native
    this.local = opts.local
  }

  // returns true if not home currency
  get foreign(): boolean {
    return !!this.local
  }

  // returns local currency as native currency
  get exchanged(): Amount | undefined {
    if (this.local) return new Amount({ native: this.local })
    else return undefined
  }

  // returns true if negative amount
  get negative(): boolean {
    return this.native.amount <= 0
  }

  // returns true if positive amount
  get positive(): boolean {
    return !this.negative
  }

  // returns sign
  get sign(): string {
    return this.negative ? '-' : '+'
  }

  // returns sign only when positive
  get signIfPositive(): string {
    return this.positive ? '+' : ''
  }

  // returns sign only when negative
  get signIfNegative(): string {
    return this.negative ? '-' : ''
  }

  // returns currency symbol
  get currency(): string {
    return this.native.currency
  }

  // returns currency symbol
  get symbol(): string {
    return this.native.currency in currencies
      ? currencies[this.native.currency].symbol
      : ''
  }

  // return currency separator
  get separator(): string {
    return this.native.currency in currencies
      ? currencies[this.native.currency].separator
      : ''
  }

  // returns amount in major units (no truncation)
  get amount(): number {
    return Math.abs(this.native.amount) / this.scale
  }

  // returns truncated amount in major units
  get normalize(): string {
    return this.amount.toFixed(2)
  }

  // returns amount split into normalized major and minor units
  get split(): string[] {
    return String(this.normalize).split('.')
  }

  // returns major unit
  get major(): string {
    return this.split[0]
  }

  // returns minor unit
  get minor(): string {
    return this.split[1]
  }

  // return number of minor units in major
  get scale(): number {
    return 100
  }

  // returns raw amount from api
  get raw(): number {
    return this.native.amount
  }

  // format currency with a strftime-like syntax replacements
  // %s -> sign
  // %c -> currency
  // %s -> currency symbol
  //
  // %+ -> sign if positive
  // %- -> sign if negative
  //
  // %r -> raw amount
  // %a -> locally formatted amount
  //
  // %j -> major
  // %n -> minor
  // %p -> separator
  format(formatString: string = '%s%y%j%p%n'): string {
    return formatString
      .replace(/%s/g, this.sign)
      .replace(/%c/g, this.native.currency)
      .replace(/%y/g, this.symbol)
      .replace(/%\+/g, this.signIfPositive)
      .replace(/%-/g, this.signIfNegative)
      .replace(/%r/g, String(this.raw))
      .replace(/%a/g, String(this.amount))
      .replace(/%m/g, String(this.normalize))
      .replace(/%j/g, this.major)
      .replace(/%n/g, this.minor)
      .replace(/%p/g, this.separator)
  }

  get json(): AmountOpts {
    return {
      native: this.native,
      local: this.local
    }
  }

  get stringify(): string {
    return JSON.stringify(this.json)
  }

  toString(): string {
    return this.format()
  }

  valueOf(): number {
    return this.raw
  }
}

export interface CurrencyMetadata {
  symbol: string
  separator: string
}

export interface CurrencyMetadataMap {
  [currency: string]: CurrencyMetadata
}

export interface SimpleAmount {
  amount: number
  currency: string
}

export interface AmountOpts {
  native: SimpleAmount
  local?: SimpleAmount
}

export interface MonzoBalanceResponse extends JSONMap {
  balance: number
  // TODO: currency enum-ify
  currency: string
  // TODO: currency enum-ify
  local_currency: string
  local_exchange_rate: number
  local_spend: {
    [currency: string]: number
  }[]
  spend_today: number
}
