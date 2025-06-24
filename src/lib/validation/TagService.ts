import { singleton } from "tsyringe";

@singleton()
export default class TagService {
  private objectTags: Record<string, string[]> = {};

  setObjectTags(objectId: string, tags: string[]): void {
    this.objectTags[objectId] = tags;
  }

  getObjectTags(objectId: string): string[] {
    return this.objectTags[objectId] || [];
  }
}
