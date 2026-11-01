interface Crypto {
  getRandomValues<Values extends ArrayBufferView | null>(
    values: Values,
  ): Values;
}

declare var crypto: Crypto;
