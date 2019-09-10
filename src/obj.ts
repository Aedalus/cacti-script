enum OBJECT_TYPE {
  INTEGER_OBJ = "INTEGER_OBJ",
  BOOLEAN_OBJ = "BOOLEAN_OBJ",
  NULL_OBJ = "NULL_OBJ"
}

export interface Obj {
  type(): OBJECT_TYPE;
  inpect(): string;
}

export class IntegerObj implements Obj {
  value: number;

  constructor(value: number) {
    this.value = value;
  }
  type() {
    return OBJECT_TYPE.INTEGER_OBJ;
  }
  inpect() {
    return this.value.toString();
  }
}

export class BooleanObj implements Obj {
  value: boolean;
  constructor(value: boolean) {
    this.value = value;
  }
  type() {
    return OBJECT_TYPE.BOOLEAN_OBJ;
  }
  inpect() {
    return this.value ? "true" : "false";
  }
}

export class NullObj implements Obj {
  type() {
    return OBJECT_TYPE.NULL_OBJ;
  }
  inpect() {
    return "null";
  }
}
