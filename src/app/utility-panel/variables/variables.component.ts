import { Component } from '@angular/core';
import { EvalService } from 'src/app/eval.service';


export interface VariablesObject {
  [key: string]: string
}


@Component({
  selector: 'app-variables',
  templateUrl: './variables.component.html',
  styleUrls: ['./variables.component.scss']
})
export class VariablesComponent {
  constructor(public mathEval: EvalService) {}

  public variables:VariablesObject = {
    
  }

  public variablesDefined(): boolean {
    return Object.keys(this.variables).length > 0
  }

  public getVarName() {

  }

  public addVariable() {
    var varNum = !this.variablesDefined()? '' : Object.keys(this.variables).length
    this.variables["variable"+varNum] = '0';
    this.mathEval.variables = this.variables;
    this.mathEval.update()
  }
}
