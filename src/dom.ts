/** Finds a required element of the given type, failing loudly if the markup is wrong. */
export function requireElement<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const found = root.querySelector(selector);
  if (!(found instanceof type)) throw new Error(`Missing ${selector}`);
  return found;
}
