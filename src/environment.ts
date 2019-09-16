import { Obj } from "./obj";
export class Environment {
  store: { [index: string]: Obj } = {};

  get(name: string): Obj | undefined {
    return this.store[name];
  }

  set(name: string, val: Obj): Obj {
    this.store[name] = val;
    return val;
  }
}
