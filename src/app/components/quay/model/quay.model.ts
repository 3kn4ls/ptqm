export interface Vessel {
  id: string;
  name: string;
  tb: Date;
  tw: Date;
  tc: Date;
  td: Date;
  loa: number;
  quayPos: number;


}

export interface VesselWithVisuals extends Vessel {
  // Nuevos campos relativos (%)
  vslTopPercent?: number;
  vslHeightPercent?: number;
  vslLeftPercent?: number;
  vslWidthPercent?: number;
  secondaryTopPercent?: number;
  secondaryHeightPercent?: number;
}
