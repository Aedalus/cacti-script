import { Obj } from "./obj";
export class Environment {
  store: { [index: string]: Obj } = {};
  outer?: Environment;

  constructor() {}
  static newEnclosedEnvironment(outer: Environment) {
    const env = new Environment();
    env.outer = outer;
    return env;
  }

  get(name: string): Obj | undefined {
    const result = this.store[name];
    if (result) return result;
    else if (this.outer) return this.outer.get(name);
    else return undefined;
  }

  set(name: string, val: Obj): Obj {
    this.store[name] = val;
    return val;
  }
}
