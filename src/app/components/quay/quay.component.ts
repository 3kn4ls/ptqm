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
import { CommonModule } from '@angular/common';

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

export interface Noray {
  name: string;       // Nombre visible, ej. "N-12"
  order: number;      // Para ordenación o identificación
  position: number;   // Coordenada en metros (0 - quayLength)
}


@Component({
  selector: 'app-quay',
  providers: [provideNativeDateAdapter()],
  imports: [
    CdkDrag,
    MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule,
    CommonModule
  ],
  templateUrl: './quay.component.html',
  styleUrls: ['./quay.component.css']
})
export class QuayComponent {

public days: Date[] = [];
public hours: string[] = [];

  appName = 'PORT TERMINAL QUAY';
  from: Date;
  to: Date;
  vessels: Vessel[] = [];
  quayLength = 1000; // en metros
  ratioPixelHora = 20; // px/hora
  quayPanelHeight = 0;
  screenWidth = document.querySelector('.quay-container')?.clientWidth || 0;
  private dragStartQuayPos = 0;
  private dragStartTb: Date = new Date();

public norays: Noray[] = [
  { name: 'N-1', order: 1, position: 20 },
  { name: 'N-2', order: 2, position: 115 },
  { name: 'N-3', order: 3, position: 350 },
  { name: 'N-4', order: 4, position: 550 },
  { name: 'N-5', order: 5, position: 650 },
  { name: 'N-6', order: 6, position: 700 },
  { name: 'N-7', order: 7, position: 820 },
  { name: 'N-8', order: 8, position: 930 },
  // ... más norays según el muelle
];


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
    this.to = moment(this.range?.value?.end).toDate(); //.add(1, 'day').toDate(); // Añadir un día para incluir el final
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


getNorayStyle(noray: Noray): any {
  const leftPercent = (noray.position / this.quayLength) * 100;
  return {
    position: 'absolute',
    top: '0', // debajo del header
    left: `${leftPercent}%`,
    transform: 'translateX(-50%)', // centrar horizontalmente
    zIndex: 5
  };
}

  onSyncClick() {
    if (this.range?.value?.start && this.range?.value?.end) {
      this.from = this.range?.value?.start;
      this.to = moment(this.range?.value?.end).toDate(); //.add(1, 'day').toDate(); // Añadir un día para incluir el final

      this.updateRatios();
      this.simulateVessels();
      this.recalculateVesselPositions();
      this.generateTimeLabels();
    }
  }


generateTimeLabels() {
  this.days = [];
  this.hours = [];

  const start = new Date(this.from);
  const end = new Date(this.to);

  // Generar días
  const day = new Date(start);
  while (day <= end) {
    this.days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  // Generar horas (de 00:00 a 23:00)
  for (let h = 0; h < 24; h++) {
    this.hours.push(h.toString().padStart(2, '0') + ':00');
  }

}

  
  updateRatios() {
    this.screenWidth = document.querySelector('.quay-container')?.clientWidth || 0;
    // this.ratioPixelMetro = this.screenWidth / this.quayLength;
    console.log('QUAY',  this.from, this.to, this.ratioPixelHora, this.differenceInHours(this.to, this.from))
    this.quayPanelHeight = (this.differenceInHours(this.to, this.from)) * this.ratioPixelHora;
  }

  simulateVessels() {
    const result: Vessel[] = [];

    for (let i = 0; i < 5; i++) {
    // 1. Genera una fecha y hora aleatoria de base dentro del rango.
    const baseDate = new Date(this.from.getTime() + Math.random() * (this.to.getTime() - this.from.getTime() - 4 * 3600 * 1000));

    // 2. Ajusta esa fecha para que los minutos, segundos y milisegundos sean 0.
    baseDate.setMinutes(0, 0, 0); // Esto redondea la hora hacia abajo.

    // 3. Crea las variables de fecha secuenciales con 1 hora de diferencia.
    const oneHour = 3600 * 1000 * 4; // 1 hora en milisegundos para más claridad
    const tb = new Date(baseDate);
    const tw = new Date(tb.getTime() + oneHour);
    const tc = new Date(tw.getTime() + oneHour); // O tb.getTime() + 2 * oneHour
    const td = new Date(tc.getTime() + oneHour); // O tb.getTime() + 3 * oneHour
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
    // console.log('Vessels simulated:', this.vessels);
  }


  recalculateVesselPositions() {
  const totalTimeMs = this.to.getTime() - this.from.getTime();

  this.vessels.forEach(v => {
    const tbOffsetMs = v.tb.getTime() - this.from.getTime();
    const tdOffsetMs = v.td.getTime() - this.from.getTime();
    const durationMs = v.td.getTime() - v.tb.getTime();

    v.vslTopPercent = (tbOffsetMs / totalTimeMs) * 100;
    v.vslHeightPercent = (durationMs / totalTimeMs) * 100;

    v.vslLeftPercent = (v.quayPos / this.quayLength) * 100;
    v.vslWidthPercent = (v.loa / this.quayLength) * 100;

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

  const deltaHoras = deltaY / this.ratioPixelHora;
  const newTb = new Date(this.dragStartTb.getTime() + deltaHoras * 3600 * 1000);

  newTb.setMinutes(0, 0, 0); // Redondear a la hora más cercana
  
  const realScreenWidth = this.screenWidth * this.zoomPercent / 100;
  const deltaPorcentaje = deltaX / realScreenWidth;
  const deltaMetros = deltaPorcentaje * this.quayLength;
  const newQuayPos = this.dragStartQuayPos + deltaMetros;

  // Mantener duración
  const durTw = vessel.tw.getTime() - vessel.tb.getTime();
  const durTc = vessel.tc.getTime() - vessel.tb.getTime();
  const durTd = vessel.td.getTime() - vessel.tb.getTime();

  // Asignar
  vessel.tb = newTb;
  vessel.tw = new Date(newTb.getTime() + durTw);
  vessel.tc = new Date(newTb.getTime() + durTc);
  vessel.td = new Date(newTb.getTime() + durTd);
  vessel.quayPos = Math.max(0, Math.min(this.quayLength - vessel.loa, newQuayPos));

  this.recalculateVesselPositions();

  // Eliminar transform residual del drag
  const element = event.source.element.nativeElement as HTMLElement;
  element.style.transform = 'none';

  // Reset drag ref (ya lo tienes, se puede mantener)
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
