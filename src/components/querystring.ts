const stringifyPrimitive = (v: any): string => {
    switch (typeof v) {
      case 'string':
        return v;

      case 'boolean':
        return v ? 'true' : 'false';

      case 'number':
        return isFinite(v) ? v.toString() : '';

      default:
        return '';
    }
  };

export const stringify = (obj: any, sep: string = '&', eq: string = '='): string => {
    if (obj === null) {
      obj = undefined;
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).map(k => {
        const ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k].map((v: string) => {
            return ks + encodeURIComponent(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
        }
      }).filter(Boolean).join(sep);
    }

    return eq + encodeURIComponent(stringifyPrimitive(obj));
  };