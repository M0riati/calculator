import { Injectable } from '@angular/core';
import { create, all, exp, boolean } from 'mathjs'
import { VariablesObject } from './utility-panel/variables/variables.component';
import { TopologicalSort} from 'topological-sort';
import { group } from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class EvalService {
  private query = "";
  public answer = "undefined";
  public variables: VariablesObject = {};
  public mathjs: any;
  public significantFigures = 9;
  public formatMode = "auto"
  public fixedMin = -3;
  public fixedMax = 5;
  public realtimeFeedback = true;

  public passQuery(q: string, enterPressed = false) {
    if (this.realtimeFeedback || enterPressed) {
      this.query = q
      this.update()
    }
  }

  public update() {
    this.answer = this.computeAnswer()
  }

  static convertFrac(q: string) {
    while (true) {
      let i = q.search(/\\frac{.+}{.+}/gm)
      if (i == -1) {
        return q
      }
      let bracketLevel = 1
      let canBreak = false;
      let k = 0;
      for (let j = i + 6; j < q.length; j++) {
        if (q[j] == '{') {
          bracketLevel++
        }
        else if (q[j] == '}') {
          bracketLevel--
        }
        if (bracketLevel == 0) {
          if (canBreak) {
            q = q.slice(0, i) + '(' + q.slice(i + 5, k) + "/" + q.slice(k, j+1) + ")" + q.slice(j+1)
            break
          }
          else { 
            k = j+1
            canBreak = true;
          }
        }
      }

    }
  }

  static convertLog(q: string) {
    q = q.replaceAll(/\\log_*(?<base>[a-zA-Z0-9])/gm, '\\log_{$<base>}')
    while (true) {
      let i = q.search(/\\log(_{.+}|_*\d+)\(.+\)/gm)
      if (i == -1) {
        return q
      }
      let bracketLevel = 1
      let baseEnd = 0
      for (let j = i + 6; j < q.length; j++) {
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
      for (let j = baseEnd + 1; j < q.length; j++) {
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
      q = q.slice(0, i + 4) + q.slice(baseEnd + 1, argsEnd) + ", " + q.slice(i + 6, baseEnd) + q.slice(argsEnd)
    }
  }

  public static replaceGreekLetters(q: string) {
    // replace latex greek letters with their unicode counterparts for use in function and var names.

    let greekLetters: { [key: string]: string } = {
      "\\alpha": "α",
      "\\beta": "β",
      "\\gamma": "γ",
      "\\delta": "δ",
      "\\epsilon": "ϵ",
      "\\zeta": "ζ",
      "\\eta": "η",
      "\\theta": "θ",
      "\\iota": "ι",
      "\\kappa": "κ",
      "\\lambda": "λ",
      "\\mu": "μ",
      "\\nu": "ν",
      "\\xi": "ξ",
      "\\omicron": "ο",
      "\\pi": "π",
      "\\rho": "ρ",
      "\\sigma": "σ",
      "\\tau": "τ",
      "\\upsilon": "υ",
      "\\phi": "ϕ",
      "\\chi": "χ",
      "\\psi": "ψ",
      "\\omega": "ω",
      "\\digamma": "ϝ",
      "\\stigma": "ϛ",
      "\\Alpha": "Α",
      "\\Beta": "Β",
      "\\Gamma": "Γ",
      "\\Delta": "Δ",
      "\\Epsilon": "Ε",
      "\\Zeta": "Ζ",
      "\\Eta": "Η",
      "\\Theta": "Θ",
      "\\Iota": "Ι",
      "\\Kappa": "Κ",
      "\\Lambda": "Λ",
      "\\Mu": "Μ",
      "\\Nu": "Ν",
      "\\Xi": "Ξ",
      "\\Omicron": "Ο",
      "\\Pi": "Π",
      "\\Rho": "Ρ",
      "\\Sigma": "Σ",
      "\\Tau": "Τ",
      "\\Upsilon": "ϒ",
      "\\Phi": "Φ",
      "\\Chi": "Χ",
      "\\Psi": "Ψ",
      "\\Omega": "Ω",
      "\\Digamma": "Ϝ",
      "\\Stigma": "Ϛ"
    }
    Object.keys(greekLetters).forEach(key => {
      q = q.replaceAll(key, greekLetters[key]);
    });
    return q;
  }

  public reformatQuery(q = this.query) {
    q = q.replaceAll(' ', '');
    q = q.replaceAll(/\\+/gm, '\\')
    q = q.replaceAll(/(?<![.\d])(\d+)(\\frac{\d+}{\d+})/gm, '($1+$2)')
    q = q.replaceAll(/(})(\\frac)/g, "$1*$2")
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
    q = q.replaceAll('\\pm', '±')
    q = q.replaceAll('=', '==')
    q = q.replaceAll('\\ll', '<<')
    q = q.replaceAll('\\le', '<=')
    q = q.replaceAll('\\pi', 'pi')
    q = EvalService.replaceGreekLetters(q)
    q = q.replaceAll(/\\operatorname\{(?<operator>\w+)\}/gm, '$<operator>')
    q = q.replaceAll('{', '(')
    q = q.replaceAll('}', ')')
    q = q.replaceAll('\\degree', 'degrees')
    q = q.replaceAll('°', 'degrees')
    q = q.replaceAll(/degrees\ *F/gm, 'degF')
    q = q.replaceAll(/degrees\ *C/gm, 'degC')
    q = q.replaceAll('\\', '')
    return q
  }

  public computeAnswer(q = this.query) {
    let ans = '';

    q = this.reformatQuery(q) + "*1"
    try {
      var plusMinusMatch = q.match('±');
      if (plusMinusMatch == null) {
        ans = this.evaluate(q);
        ans = this.mathjs.format(ans, { precision: this.significantFigures, notation: this.formatMode, lowerExp: this.fixedMin, upperExp: this.fixedMax })
      }
      else if (plusMinusMatch?.length == 1) {
        var firstSolution = this.evaluate(q.replace('±', '+'));
        var secondSolution = this.evaluate(q.replace('±', '-'));
        firstSolution = this.mathjs.format(firstSolution, { precision: this.significantFigures, notation: this.formatMode, lowerExp: this.fixedMin, upperExp: this.fixedMax })
        secondSolution = this.mathjs.format(secondSolution, { precision: this.significantFigures, notation: this.formatMode, lowerExp: this.fixedMin, upperExp: this.fixedMax })

        ans = firstSolution + '; ' + secondSolution
      }
      else {
        throw Error('Not more than one plusminus allowed.')
      }
      ans = ans.replaceAll(/(?<p>e\+*)(?<e>[\-]*\d+)/gm, '\\cdot10^{$<e>}')
      ans = ans.replaceAll(/(?<unit>([0-9\ ]|^)[a-zA-Z]+)\^*(?<exp>[0-9\.\-]+)/gm, '$<unit>^{$<exp>}')
      ans = ans.replaceAll('Infinity', '\\infty')
      ans = ans.replaceAll(' degrees', '°')
      ans = ans.replaceAll('degC', '°C')
      ans = ans.replaceAll('degF', '°F')
    }
    catch (Error) {
      ans = 'undefined'
    }
    return ans
  }

  public evaluate(expression: string) {
    let scope: { [id: string]: string } = {}
    this.mathjs.evaluate("ln(x)=log(x, e)", scope);
    var nodes = new Map();
    var varNames = Object.keys(this.variables);
    varNames.forEach(n => {
      var expr = this.variables[n];
      nodes.set(n, [n, expr]);
    });
    var dependencySorter = new TopologicalSort(nodes);
    varNames.forEach(n => {
      var expr = this.variables[n];
      varNames.forEach(m => {
        if (expr.includes(m)) {
          dependencySorter.addEdge(m, n)
        }
      })
    });
    var sorted = dependencySorter.sort()
    var sortedValues = [...sorted.values()]; 
    sortedValues.forEach(sortedValue => {
      var varname = sortedValue.node[0]
      var expr = sortedValue.node[1]
      let concreteValue = this.mathjs.evaluate(this.reformatQuery(expr), scope)
      console.log(`${varname} = ${concreteValue}`);
      let name = EvalService.replaceGreekLetters(varname);
      scope[name] = concreteValue;
    });
    var varMatches = expression.matchAll(/([a-zA-Zα-ωΑ-ΩϜϝϚϛ]+)(\(?)/gm)
    for (const match of varMatches) {
      let onlyVars = true;
      let vars = match[1]
      let bracket = match[2] == "("
      if (!varNames.includes(vars)) {
        for (var i = 0; i < vars.length; i++) {
          if (!(varNames.includes(vars[i]))) {
            onlyVars = false;
            break;
          }
        }
        if (onlyVars && !(["sqrt", "and", "or", "xor", "degree", "sin", "cos", "tan", "asin", "acos", "atan", "log", "ln"].includes(vars))) {
          expression = expression.replace(vars, vars.split('').join('*')+(bracket?"*1*": ""))
        }
      }
      else if (bracket) {
        expression = expression.replace(vars, vars+"*1*")
      }
    }
    console.log(expression)
    return this.mathjs.evaluate(expression, scope)
  }

  constructor() {
    this.mathjs = create(all)
    this.mathjs.config({
      precision: 256,
      number: 'BigNumber',
    })
  }
}
