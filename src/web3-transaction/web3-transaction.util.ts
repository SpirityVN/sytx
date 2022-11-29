import { filter, map } from 'lodash';

export type EventInput = {
  indexed: boolean;
  internalType: string;
  name: string;
  type: string;
};
export type ABIEvent = {
  anonymous: boolean;
  inputs: EventInput[];
  name: string;
  type: string;
};
export function flattenObject(Objects: Object, key: string) {
  return map(Objects, (object) => object[key]);
}

export function transformEventByABI(abi: any): { name: string; params: string[] }[] {
  const events: ABIEvent[] = filter(abi, { type: 'event' });
  if (events.length === 0) return;
  return map(events, (event) => ({
    name: event.name,
    params: flattenObject(event.inputs, 'name'),
  }));
}
