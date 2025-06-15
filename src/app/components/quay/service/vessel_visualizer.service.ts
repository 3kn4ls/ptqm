import { Injectable } from "@angular/core";
import { Vessel, VesselWithVisuals } from "../model/quay.model";

@Injectable({ providedIn: 'root' })
export class VesselVisualizerService {
  calculateVisuals(
    vessel: Vessel,
    from: Date,
    to: Date,
    ratioPixelHora: number,
    ratioPixelMetro: number,
    quayLength: number
  ): VesselWithVisuals {
    const diffHours = (a: Date, b: Date) => (a.getTime() - b.getTime()) / (1000 * 60 * 60);

    const vslTop = diffHours(vessel.tb, from) * ratioPixelHora;
    const vslHeight = diffHours(vessel.td, vessel.tb) * ratioPixelHora;
    const secondaryVslTop = diffHours(vessel.tw, vessel.tb) * ratioPixelHora;
    const secondaryVslHeight = diffHours(vessel.tc, vessel.tw) * ratioPixelHora;
    const vslLeft = (vessel.quayPos / quayLength) * 100;
    const vslWidth = vessel.loa * ratioPixelMetro;

    return {
      ...vessel,
      vslTop,
      vslLeft,
      vslWidth,
      vslHeight,
      secondaryVslTop,
      secondaryVslHeight,
    };
  }
}
