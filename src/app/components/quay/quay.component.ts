import { Component, HostListener } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { CdkDrag, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Vessel {
  id: string;
  name: string;
  tb: Date;
  tw: Date;
  tc: Date;
  td: Date;
  loa: number;
  quayPos: number;

  // Nuevos campos relativos (%)
  vslTopPercent?: number;
  vslHeightPercent?: number;
  vslLeftPercent?: number;
  vslWidthPercent?: number;
  secondaryTopPercent?: number;
  secondaryHeightPercent?: number;
}

@Component({
  selector: 'app-quay',
  providers: [provideNativeDateAdapter()],
  imports: [
    CdkDrag,
    MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './quay.component.html',
  styleUrls: ['./quay.component.css']
})
export class QuayComponent {
  appName = 'PORT TERMINAL QUAY';
  from: Date;
  to: Date;
  vessels: Vessel[] = [];
  quayLength = 1000; // en metros
  // ratioPixelMetro = 1;
  ratioPixelHora = 20; // px/hora
  quayPanelHeight = 0;
  screenWidth = window.innerWidth;
  private dragStartTop = 0;
  private dragStartLeft = 0;
  private dragStartTopPx = 0;
  private dragStartQuayPos = 0;
  private dragStartTb: Date = new Date();

public zoomPercent = 100; // 100% = escala base

get ratioPixelMetro(): number {
  return (this.screenWidth * this.zoomPercent / 100) / this.quayLength;
}

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(new Date('2025-06-15T00:00:00Z')), 
    end: new FormControl<Date | null>(new Date('2025-06-16T00:00:00Z')),
  });

constructor() {
    this.from = this.range.value?.start || new Date('2025-06-15T00:00:00Z');
    this.to = this.range.value?.end || new Date('2025-06-16T00:00:00Z');
}

  ngOnInit() {
    console.log('QuayComponent initialized');
      this.onSyncClick()
  }

  @HostListener('window:resize')
  onResize() {
    this.updateRatios();
    this.recalculateVesselPositions();
  }


  onSyncClick() {
    if (this.range?.value?.start && this.range?.value?.end) {
      this.from = this.range?.value?.start;
      this.to = this.range?.value?.end;

      this.updateRatios();
      this.simulateVessels();
      this.recalculateVesselPositions();
    }
  }

  updateRatios() {
    this.screenWidth = window.innerWidth;
    // this.ratioPixelMetro = this.screenWidth / this.quayLength;
    this.quayPanelHeight = this.differenceInHours(this.to, this.from) * this.ratioPixelHora;
  }

  simulateVessels() {
    const result: Vessel[] = [];

    for (let i = 0; i < 5; i++) {
      const baseHour = new Date(this.from.getTime() + Math.random() * (this.to.getTime() - this.from.getTime() - 72 * 3600 * 1000));
      const tb = new Date(baseHour);
      const tw = new Date(tb.getTime() + 2 * 3600 * 1000);
      const tc = new Date(tw.getTime() + (12 + Math.random() * 24) * 3600 * 1000);
      const td = new Date(tc.getTime() + 4 * 3600 * 1000);
      const quayPos = Math.random() * this.quayLength;
      const loa = 100 + Math.random() * 250;

      result.push({
        id: uuidv4(),
        name: `BARCO ${i + 1}`,
        tb,
        tw,
        tc,
        td,
        quayPos,
        loa
      });
    }

    this.vessels = result;
    this.recalculateVesselPositions();
    console.log('Vessels simulated:', this.vessels);
  }

  recalculateVesselPositions() {
    const totalTimeMs = this.to.getTime() - this.from.getTime();

    this.vessels.forEach(v => {
      const tbOffsetMs = v.tb.getTime() - this.from.getTime();
      const tdOffsetMs = v.td.getTime() - this.from.getTime();
      const durationMs = v.td.getTime() - v.tb.getTime();

      // Porcentajes verticales
      v.vslTopPercent = (tbOffsetMs / totalTimeMs) * 100;
      v.vslHeightPercent = (durationMs / totalTimeMs) * 100;

      // Porcentajes horizontales
      v.vslLeftPercent = (v.quayPos / this.quayLength) * 100;
      v.vslWidthPercent = (v.loa / this.quayLength) * 100;

      // Trabajo (interior)
      const twOffsetMs = v.tw.getTime() - v.tb.getTime();
      const tcOffsetMs = v.tc.getTime() - v.tb.getTime();
      const workDurationMs = v.tc.getTime() - v.tw.getTime();

      v.secondaryTopPercent = (twOffsetMs / durationMs) * 100;
      v.secondaryHeightPercent = (workDurationMs / durationMs) * 100;
    });
  }


  differenceInHours(date1: Date, date2: Date): number {
    return moment(date1).diff(moment(date2), 'hours');
  }

  

  onDragStarted(_: CdkDragStart, vessel: Vessel) {
    this.dragStartTb = new Date(vessel.tb);
    this.dragStartQuayPos = vessel.quayPos;
  }

  onDragEnded(event: CdkDragEnd, vessel: Vessel) {
    const deltaY = event.distance.y;
    const deltaX = event.distance.x;

    // Calcular desplazamiento vertical → cambio de tiempo
    const deltaHoras = deltaY / this.ratioPixelHora;
    const newTb = new Date(this.dragStartTb.getTime() + deltaHoras * 3600 * 1000);

    // Calcular desplazamiento horizontal → cambio de posición en muelle
    const realScreenWidth = this.screenWidth * this.zoomPercent / 100;
    const deltaPorcentaje = deltaX / realScreenWidth;
    const deltaMetros = deltaPorcentaje * this.quayLength;
    const newQuayPos = this.dragStartQuayPos + deltaMetros;

    // Mantener duraciones relativas
    const durTw = vessel.tw.getTime() - vessel.tb.getTime();
    const durTc = vessel.tc.getTime() - vessel.tb.getTime();
    const durTd = vessel.td.getTime() - vessel.tb.getTime();

    // Asignar nuevas fechas y posición
    vessel.tb = newTb;
    vessel.tw = new Date(newTb.getTime() + durTw);
    vessel.tc = new Date(newTb.getTime() + durTc);
    vessel.td = new Date(newTb.getTime() + durTd);
    vessel.quayPos = Math.max(0, Math.min(this.quayLength - vessel.loa, newQuayPos));

    // Recalcular posiciones relativas
    this.recalculateVesselPositions();

    // Resetear el transform del div (para evitar acumulación de estilos)
    event.source._dragRef.reset();
  }


  onZoomVerticalChange(event: any) {
    this.ratioPixelHora = Number(event.target.value);
    this.recalculateVesselPositions();
  }

  onZoomHorizontalChange(event: any) {
    this.zoomPercent = Number(event.target.value);
    this.recalculateVesselPositions();
  }

}
