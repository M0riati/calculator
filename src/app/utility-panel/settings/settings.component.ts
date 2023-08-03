import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { number } from 'mathjs';
import { EvalService } from 'src/app/eval.service';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  constructor(private evaluator: EvalService) {}
  @ViewChild('mathInput') mathInput: MatSlider;
  public formatModes = [
    { id: 'auto', name: 'Auto'},
    { id: 'fixed', name: 'Fixed' },
    { id: 'exponential', name: 'Scientific' },
    { id: 'engineering', name: 'Engineering' },
];

  public onValueChange(value: number) {
    console.log(value)
    this.evaluator.significantFigures = value
    this.evaluator.update()
  }

  public getFormatMode() {
    return "auto";
  }

  public getSignificantFigures() {
    return this.evaluator.significantFigures;
  }
}
