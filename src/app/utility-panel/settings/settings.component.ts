import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { mod, number } from 'mathjs';
import { EvalService } from 'src/app/eval.service';
import { MatCommonModule } from '@angular/material/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  constructor(private evaluator: EvalService) {}
  @ViewChild('mathInput') mathInput: MatSlider;
  public formatModes = [
    { id: 'auto', name: 'Auto'},
    { id: 'fixed', name: 'Fixed'},
    { id: 'exponential', name: 'Scientific'},
    { id: 'engineering', name: 'Engineering'},
  ];

  public onSignificantFiguresChange(sliderChange: MatSliderChange) {
    let value = sliderChange.value!;
    this.evaluator.significantFigures = value
    this.evaluator.update()
  }

  public onFormatModeChange(mode: any) {
    this.evaluator.formatMode = mode
    this.evaluator.update()
  }

  public onRealtimeFeedBackSwitch(changeEvent: MatSlideToggleChange) {
    this.evaluator.realtimeFeedback = changeEvent.checked
    this.evaluator.update()
  }

  public getRealtimeFeedback() {
    return this.evaluator.realtimeFeedback
  }

  public getFormatMode() {
    return this.evaluator.formatMode;
  }

  public getMinExp() {
    return this.evaluator.fixedMin;
  }

  public getMaxExp() {
    return this.evaluator.fixedMax;
  }

  public onMinExpChange(sliderChange: MatSliderChange) {
    let value = sliderChange.value!;
    this.evaluator.fixedMin = value
    this.evaluator.update()
  }

  public onMaxExpChange(sliderChange: MatSliderChange) {
    let value = sliderChange.value!;
    this.evaluator.fixedMax = value
    this.evaluator.update()
  }

  public getSignificantFigures() {
    return this.evaluator.significantFigures;
  }
}
