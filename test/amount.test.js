const test = require('ava')

const { Amount, Currencies } = require('../')

const almostEqual = (candidate, target) => {
  return (
    candidate - Number.EPSILON <= target && candidate + Number.EPSILON >= target
  )
}

const nativeAmount = new Amount({
  native: {
    amount: 123,
    currency: Currencies.GBP
  }
})

const localAmount = new Amount({
  native: {
    amount: 123,
    currency: Currencies.GBP
  },
  local: {
    amount: 234,
    currency: Currencies.USD
  }
})

const usdAmount = new Amount({
  native: {
    amount: 123,
    currency: Currencies.USD
  }
})

const eurAmount = new Amount({
  native: {
    amount: 123,
    currency: Currencies.EUR
  }
})

const preciseAmount = new Amount({
  native: {
    amount: 123.75,
    currency: Currencies.GBP
  }
})

const overpreciseAmount = new Amount({
  native: {
    amount: 123.567,
    currency: Currencies.GBP
  }
})

const negativeAmount = new Amount({
  native: {
    amount: -123,
    currency: Currencies.GBP
  }
})

test('Amount cannot be constructed incorrectly', async t => {
  t.throws(
    () => {
      new Amount()
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument'
  )

  t.throws(
    () => {
      new Amount(null)
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument'
  )

  t.throws(
    () => {
      new Amount(123)
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument'
  )

  t.throws(
    () => {
      new Amount('£12.30')
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument'
  )

  t.throws(
    () => {
      new Amount({
        native: {}
      })
    },
    TypeError,
    'Amount constructor\'s native property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: 123
        }
      })
    },
    TypeError,
    'Amount constructor\'s native property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          currency: 'GBP'
        }
      })
    },
    TypeError,
    'Amount constructor\'s native property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: '123',
          currency: 'GBP'
        }
      })
    },
    TypeError,
    'Amount constructor\'s native property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: 123,
          currency: 1
        }
      })
    },
    TypeError,
    'Amount constructor\'s native property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: 123,
          currency: 'GBP'
        },
        local: {}
      })
    },
    TypeError,
    'Amount constructor\'s local property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: 123,
          currency: 'GBP'
        },
        local: {
          amount: 123
        }
      })
    },
    TypeError,
    'Amount constructor\'s local property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: 123,
          currency: 'GBP'
        },
        local: {
          currency: 'GBP'
        }
      })
    },
    TypeError,
    'Amount constructor\'s local property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: 123,
          currency: 'GBP'
        },
        local: {
          amount: '123',
          currency: 'GBP'
        }
      })
    },
    TypeError,
    'Amount constructor\'s local property should only accept valid `SimpleAmount`s'
  )

  t.throws(
    () => {
      new Amount({
        native: {
          amount: 123,
          currency: 'GBP'
        },
        local: {
          amount: 123,
          currency: 1
        }
      })
    },
    TypeError,
    'Amount constructor\'s local property should only accept valid `SimpleAmount`s'
  )
})

test('Amount#foreign return foreign-ness', async t => {
  t.false(nativeAmount.foreign, 'native amount should not be foreign')
  t.true(localAmount.foreign, 'local amount should be foreign')
})

test('Amount#amount returns untruncated amount in major units', async t => {
  t.is(nativeAmount.amount, 1.23)
  t.is(preciseAmount.amount, 1.2375)
  t.true(almostEqual(overpreciseAmount.amount, 1.23567))
})

test('Amount#normalize returns truncated amount in major units', async t => {
  t.is(nativeAmount.normalize, '1.23')
  t.is(preciseAmount.normalize, '1.24')
  t.is(overpreciseAmount.normalize, '1.24')
})

test('Amount#split returns a tuple of major and minor units', async t => {
  t.deepEqual(nativeAmount.split, ['1', '23'])
  t.deepEqual(preciseAmount.split, ['1', '24'])
  t.deepEqual(overpreciseAmount.split, ['1', '24'])
})

test('Amount#major returns the major portion', async t => {
  t.is(nativeAmount.major, '1')
  t.is(preciseAmount.major, '1')
  t.is(overpreciseAmount.major, '1')
})

test('Amount#minor returns the minor portion', async t => {
  t.is(nativeAmount.minor, '23')
  t.is(preciseAmount.minor, '24')
  t.is(overpreciseAmount.minor, '24')
})

test('Amount#scale returns the major/minor divisor', async t => {
  t.is(nativeAmount.scale, 100)
  t.is(usdAmount.scale, 100)
  t.is(eurAmount.scale, 100)
})

test('Amount#raw returns the amount in minor units', async t => {
  t.is(nativeAmount.raw, 123)
  t.is(preciseAmount.raw, 123.75)
  t.is(overpreciseAmount.raw, 123.567)
})

test('Amount#json returns a valid constructor object for the currency Amount', async t => {
  t.deepEqual(nativeAmount.json, {
    native: {
      amount: 123,
      currency: 'GBP'
    },
    local: undefined
  })

  t.deepEqual(localAmount.json, {
    native: {
      amount: 123,
      currency: 'GBP'
    },
    local: {
      amount: 234,
      currency: 'USD'
    }
  })

  t.deepEqual(preciseAmount.json, {
    native: {
      amount: 123.75,
      currency: 'GBP'
    },
    local: undefined
  })
})

test('Amount#stringify returns a string representation of the constructor object', async t => {
  t.is(nativeAmount.stringify, '{"native":{"amount":123,"currency":"GBP"}}')
  t.is(
    localAmount.stringify,
    '{"native":{"amount":123,"currency":"GBP"},"local":{"amount":234,"currency":"USD"}}'
  )
  t.is(
    preciseAmount.stringify,
    '{"native":{"amount":123.75,"currency":"GBP"}}'
  )
})

test.todo('Amount#toString returns the default formatting')
test.todo('Amount#valueOf returns the raw amount')

test.todo('Amount#exchanged returns single amount in local currency')
test.todo('Amount#positive returns positive-ness')
test.todo('Amount#negative returns negative-ness')
test.todo('Amount#sign returns respective +/- indicator')
test.todo('Amount#signIfPositive returns sign only if amount is positive')
test.todo('Amount#signIfNegative returns sign only if amount is negative')
test.todo('Amount#symbol returns respective symbol for each supported currency')
test.todo(
  'Amount#separator returns respective seperator for each supported currency'
)

test.todo('Amount#format returns the default formatting')
