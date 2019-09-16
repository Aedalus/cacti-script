enum OBJECT_TYPE {
  INTEGER_OBJ = "INTEGER",
  BOOLEAN_OBJ = "BOOLEAN",
  NULL_OBJ = "NULL",
  RETURN_VALUE_OBJ = "RETURN_VALUE",
  ERROR_OBJ = "ERROR"
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

export class ReturnValue implements Obj {
  value: Obj;

  constructor(value: Obj) {
    this.value = value;
  }
  type() {
    return OBJECT_TYPE.RETURN_VALUE_OBJ;
  }
  inpect() {
    return this.value.inpect();
  }
}

export class ErrorObj implements Obj {
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  type() {
    return OBJECT_TYPE.ERROR_OBJ;
  }

  inpect(): string {
    return "ERROR: " + this.message;
  }
}
