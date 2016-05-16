import {Assert} from '../misc/Assert';
import {Options} from '../misc/Options';
import {isNonEmptyString} from '../utils/Utils';

export interface CurrencyToStringOptions {
  decimals?: number;
  symbol?: string;
}

class DefaultCurrencyToStringOptions extends Options implements CurrencyToStringOptions {
  decimals: number = 0;
  symbol: string;
}

export class CurrencyUtils {
  static currencyToString(value: number, options?: CurrencyToStringOptions): string {
    if (Coveo.Utils.isNullOrUndefined(value)) {
      return '';
    }
    value = Number(value);

    Assert.isNumber(value);

    options = new DefaultCurrencyToStringOptions().merge(options);

    var currency = Globalize.culture().numberFormat.currency;
    var backup = currency.symbol;

    if (isNonEmptyString(options.symbol)) {
      currency.symbol = options.symbol;
    }

    var str = Globalize.format(value, 'c' + options.decimals.toString());
    currency.symbol = backup;

    return str;
  }
}