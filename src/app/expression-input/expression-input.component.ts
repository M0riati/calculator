import { AfterViewInit, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {MathQuillLoader} from 'ngx-mathquill';
import { EvalService } from '../eval.service';


@Component({
  selector: 'app-expression-input',
  templateUrl: './expression-input.component.html',
  styleUrls: ['./expression-input.component.css'],
})
export class ExpressionInputComponent implements AfterViewInit  {
  @ViewChild('mathInput') mathInput: ElementRef;
  constructor(private evaluator: EvalService) {}

  passQuery() {
    
  }

  ngAfterViewInit() {
    //this.mathInput.nativeElement.innerHTML = "\\left(\\begin{matrix}0&-1\\\\1&\\ \\ \\ 0\\end{matrix}\\right)\\cdot 8=\\infty "
    MathQuillLoader.loadMathQuill(mathquill => {
      var mq = mathquill.getInterface (2);
      var answerMathField = mq.MathField(this.mathInput.nativeElement,  {
        handlers: {
          edit: () => {
            var enteredMath = answerMathField.latex();
            this.evaluator.passQuery(enteredMath)
          },
          enter: () => {
            var enteredMath = answerMathField.latex();
            this.evaluator.passQuery(enteredMath)
          }
        },
        autoCommands: 'pi tau theta sqrt and or xor degree',
        autoOperatorNames: 'sin cos tan asin acos atan log ln',
      });
    });
  }
}
