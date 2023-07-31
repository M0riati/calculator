import { Injectable } from '@angular/core';
import {evaluate, parser} from 'mathjs'
import { VariablesObject } from './utility-panel/variables/variables.component';

// test query \left(\frac{89\left(234+42\right)}{43\sqrt{3}}\right)^{32}



@Injectable({
  providedIn: 'root'
})
export class EvalService {
  private query = "";
  public answer = "undefined";
  public decimalPlaces = 5;
  public variables: VariablesObject = {};

  public passQuery(q: string) {
    this.query = q
    this.update()
  }

  public update() {
    this.answer = this.computeAnswer()
  }

  static roundN(x:number, n:number) {
    return Math.round(x * 10**n) / 10**n
  }

  static convertFrac(q: string) {
    while (true) {
      let i = q.search(/\\frac{.+}{.+}/gm)      
      if (i == -1) {
        return q
      }
      let bracketLevel = 1
      for(let j=i+6; j<q.length; j++) {
        if (q[j] == '{') {
          bracketLevel++
        }
        else if (q[j] == '}') {
          bracketLevel--
        }
        if (bracketLevel == 0) {
          q = q.slice(0, i) + q.slice(i+5, j+1) + "/" + q.slice(j+1)
          break
        }
      }
    }
  }

  static convertLog(q:string) {
    q = q.replaceAll(/\\log_*(?<base>[a-zA-Z0-9])/gm, '\\log_{$<base>}')
    while (true) {
      console.log(q);
      let i = q.search(/\\log(_{.+}|_*\d+)\(.+\)/gm)    
      if (i == -1) {
        return q
      }
      let bracketLevel = 1
      let baseEnd = 0
      for(let j=i+6; j<q.length; j++) {
        if (q[j] == '{') {
          bracketLevel++
        }
        else if (q[j] == '}') {
          bracketLevel--
        }
        if (bracketLevel == 0) {
          baseEnd = j;
          break
        }
      }
      let argsEnd = 0;
      for(let j=baseEnd+1; j<q.length; j++) {
        if (q[j] == '(') {
          bracketLevel++
        }
        else if (q[j] == ')') {
          bracketLevel--
        }
        if (bracketLevel == 0) {
          argsEnd = j;
          break
        }
      }
      console.log('i ', i);
      console.log('baseEnd ', baseEnd);
      console.log('argsEnd ', argsEnd);
      q = q.slice(0, i+4) + q.slice(baseEnd+1, argsEnd) + ", " + q.slice(i+6, baseEnd) + q.slice(argsEnd)
      console.log(q);
      
    }
  }

  public static replaceGreekLetters(q: string) {
    // replace latex greek letters with their unicode counterparts for use in function and var names.
    
    let greekLetters: {[key:string]: string} = {
      "\\alpha":"α", 
      "\\beta":"β",
      "\\gamma":"γ",
      "\\delta":"δ",
      "\\epsilon":"ϵ",
      "\\zeta":"ζ",
      "\\eta":"η",
      "\\theta":"θ",
      "\\iota":"ι",
      "\\kappa":"κ",
      "\\lambda":"λ",
      "\\mu":"μ",
      "\\nu":"ν",
      "\\xi":"ξ",
      "\\omicron":"o",
      "\\pi":"π",
      "\\rho":"ρ",
      "\\sigma":"σ",
      "\\tau":"τ",
      "\\upsilon":"υ",
      "\\phi":"ϕ",
      "\\chi":"χ",
      "\\psi":"ψ",
      "\\omega":"ω",
      "\\digamma":"ϝ",
      "\\stigma":"ϛ",
      "\\Alpha":"A", 
      "\\Beta":"B",
      "\\Gamma":"Γ",
      "\\Delta":"Δ",
      "\\Epsilon":"E",
      "\\Zeta":"Z",
      "\\Eta":"H",
      "\\Theta":"Θ",
      "\\Iota":"I",
      "\\Kappa":"K",
      "\\Lambda":"Λ",
      "\\Mu":"M",
      "\\Nu":"N",
      "\\Xi":"Ξ",
      "\\Omicron":"O",
      "\\Pi":"Π",
      "\\Rho":"P",
      "\\Sigma":"Σ",
      "\\Tau":"T",
      "\\Upsilon":"ϒ",
      "\\Phi":"Φ",
      "\\Chi":"X",
      "\\Psi":"Ψ",
      "\\Omega":"Ω",
      "\\Digamma":"Ϝ",
      "\\Stigma":"Ϛ"
    }
    Object.keys(greekLetters).forEach(key => {
      q = q.replaceAll(key, greekLetters[key]);
    });
    return q;
  }

  public reformatQuery(q = this.query) {
    q = EvalService.convertFrac(q)
    q = q.replaceAll('\\left(', '(')
    q = q.replaceAll('\\right)', ')')
    q = EvalService.convertLog(q)
    q = q.replaceAll('\\cdot', '*')
    q = q.replaceAll('\\div', '/')
    q = q.replaceAll('\\wedge', 'and')
    q = q.replaceAll('\\vee', 'or')
    q = q.replaceAll('\\oplus', 'xor')
    q = q.replaceAll('\\ge', '>=')
    q = q.replaceAll('\\gg', '>>')
    q = q.replaceAll('=', '==')
    q = q.replaceAll('\\ll', '<<')
    q = q.replaceAll('\\le', '<=')
    q = q.replaceAll('\\pi', 'pi')
    q = EvalService.replaceGreekLetters(q)
    q = q.replaceAll(/\\operatorname\{(?<operator>\w+)\}/gm, '$<operator>')
    q = q.replaceAll('\\ ', ' ')
    q = q.replaceAll('{', '(')
    q = q.replaceAll('}', ')')
    q = q.replaceAll('\\degree', 'degrees')
    q = q.replaceAll('°', 'degrees')
    console.log("test: " + q)
    q = q.replaceAll(/degrees\ *F/gm, 'degF')
    q = q.replaceAll(/degrees\ *C/gm, 'degC')
    q.replaceAll('ln', 'log')
    q = q.replaceAll('\\', ' ')
    return q
  }

  public computeAnswer(q=this.query, variables = true) {
    let ans = '';
    q = this.reformatQuery(q)
    console.log(q);
    try {
      ans = this.evaluate(q, variables).toString();
      ans = ans.replaceAll(/(?<p>e\+*)(?<e>[\-]*\d+)/gm, '\\cdot10^{$<e>}')
      if (ans.length > 50) {
        throw Error;
      }
      let numbers = ans.match(/\d+(\.\d+)*/gm) 
      if (numbers != null) {
        numbers.forEach(element => {
          ans = ans.replace(element, EvalService.roundN(parseFloat(element), this.decimalPlaces).toString())
        });
      }
      ans = ans.replaceAll(/(?<unit>([0-9\ ]|^)[a-zA-Z]+)\^*(?<exp>[0-9\.\-]+)/gm, '$<unit>^{$<exp>}')
      ans = ans.replaceAll('Infinity', '\\infty')
      ans = ans.replaceAll(' degrees', '°')
      ans = ans.replaceAll('degC', '°C')
      ans = ans.replaceAll('degF', '°F')
      //ans = ans.replaceAll(' ', '\\ ')
    } 
    catch (Error) {
      console.log(Error)
      ans = 'undefined'
    }
    console.log(ans);
    
    return ans
  }

  public evaluate(expression: string, variables = true) {
    let parser_ = parser();
    if (expression.search('ln') != -1) {
      parser_.evaluate("ln(x)=log(x, e)")
    }
    if (variables) {
      Object.keys(this.variables).forEach(key => {
        console.log(key + ' = ' + this.variables[key])
        parser_.evaluate(EvalService.replaceGreekLetters(key) + '=' + this.computeAnswer(this.variables[key], false))
      });
    }
    return parser_.evaluate(expression)
  }

  constructor() { }
}
