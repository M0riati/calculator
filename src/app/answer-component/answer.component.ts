import { Component, DoCheck, OnChanges, ElementRef, ViewChild, AfterViewInit, SimpleChanges } from '@angular/core';
import { EvalService } from '../eval.service';
import {MathQuillLoader} from 'ngx-mathquill';

@Component({
  selector: 'app-answer-component',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements AfterViewInit {
  @ViewChild('display')
  display: ElementRef;
  @ViewChild('ans')
  ans: ElementRef;
  public mathquillElement: any;

  constructor(public parser: EvalService) {}


  ngAfterViewInit(): void {
    this.display.nativeElement
    MathQuillLoader.loadMathQuill(mathquill => {
      var mq = mathquill.getInterface(2);
      this.mathquillElement = mq.StaticMath(this.display.nativeElement)
    })
  }

  
}
