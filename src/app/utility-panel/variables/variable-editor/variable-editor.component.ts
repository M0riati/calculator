import { Component, Input } from '@angular/core';
import { EvalService } from 'src/app/eval.service';

@Component({
  selector: 'app-variable-editor',
  templateUrl: './variable-editor.component.html',
  styleUrls: ['./variable-editor.component.css']
})
export class VariableEditorComponent {
  @Input() name: string;
  @Input() value: number;
  constructor(public mathEval: EvalService) {}


  public updateVarName(event: any) {
    var newName = event.target.value
    delete this.mathEval.variables[this.name]
    this.mathEval.variables[newName] = this.value;
    this.mathEval.update()
  }

  public updateVarValue(event: any) {
    var strValue = event.target.value
    var numberValue = parseInt(strValue);
    if (!Number.isNaN(numberValue)) {
      this.mathEval.variables[this.name] = numberValue;
      this.mathEval.update()
    }
  }
  
  public deleteVar() {
    delete this.mathEval.variables[this.name]
  }
}
