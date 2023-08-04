import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MathQuillLoader } from 'ngx-mathquill';
import { lastValueFrom } from 'rxjs';
import { EvalService } from 'src/app/eval.service';

@Component({
  selector: 'app-variable-editor',
  templateUrl: './variable-editor.component.html',
  styleUrls: ['./variable-editor.component.scss']
})
export class VariableEditorComponent {
  @Input() name: string;
  @Input() value: string;
  @ViewChild('varNameInput') varNameInput: ElementRef;
  @ViewChild('varExpressionInput') varExpressionInput: ElementRef;

  constructor(public mathEval: EvalService) {}

  ngAfterViewInit() {
    MathQuillLoader.loadMathQuill(mathquill => {
      var mq = mathquill.getInterface (2);
      var varNameField = mq.MathField(this.varNameInput.nativeElement,  {
        handlers: {
          enter: () => {this.updateVarName(varNameField.latex())},
        },
        autoCommands: 'pi tau theta sqrt and or xor degree',
        autoOperatorNames: 'sin cos tan asin acos atan log ln',
      });
      var varExpressionField = mq.MathField(this.varExpressionInput.nativeElement,  {
        handlers: {
          enter: () => {this.updateVarValue(varExpressionField.latex())},
        },
        autoCommands: 'pi tau theta sqrt and or xor degree',
        autoOperatorNames: 'sin cos tan asin acos atan log ln',
      });
      varNameField.el().querySelector('textarea')!.addEventListener('focusout', () => this.updateVarName(varNameField.latex()));
      varExpressionField.el().querySelector('textarea')!.addEventListener('focusout', () => this.updateVarValue(varExpressionField.latex()));
    });
  }

  public updateVarName(latex: string) {
    delete this.mathEval.variables[this.name]
    this.mathEval.variables[latex] = this.value;
    this.name = latex;
    console.log(this.name);
    this.mathEval.update()
  }

  public updateVarValue(latex: string) {
    this.mathEval.variables[this.name] = latex;
    this.value = latex;
    this.mathEval.update()
  }
  
  public deleteVar() {
    delete this.mathEval.variables[this.name]
    this.mathEval.update()
  }
}
