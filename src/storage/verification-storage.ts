interface Body {
  verified: boolean;
  result: boolean;
  did: string;
}

export class VStorage {
  constructor(private storage: Map<string, Body> = new Map()) {}

  add(key: string, body: Body): void {
    this.storage.set(key, body);
  }
  remove(key: string): void {
    this.storage.delete(key);
  }
  get(key: string): Body {
    return this.storage.get(key);
  }
}

export const VerificationStorage = new VStorage();
