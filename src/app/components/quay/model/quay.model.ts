export interface Vessel {
  name: string;
  tb: Date;
  tw: Date;
  tc: Date;
  td: Date;
  loa: number;
  quayPos: number;
}

export interface VesselWithVisuals extends Vessel {
  vslTop: number;
  vslLeft: number;
  vslWidth: number;
  vslHeight: number;
  secondaryVslTop: number;
  secondaryVslHeight: number;
}
